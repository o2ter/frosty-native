//
//  JSContext.kt
//
//  The MIT License
//  Copyright (c) 2021 - 2025 O2ter Limited. All rights reserved.
//
//  Permission is hereby granted, free of charge, to any person obtaining a copy
//  of this software and associated documentation files (the "Software"), to deal
//  in the Software without restriction, including without limitation the rights
//  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//  copies of the Software, and to permit persons to whom the Software is
//  furnished to do so, subject to the following conditions:
//
//  The above copyright notice and this permission notice shall be included in
//  all copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//  THE SOFTWARE.
//

package com.o2ter

import android.content.Context
import android.util.Log
import com.eclipsesource.v8.JavaCallback
import com.eclipsesource.v8.JavaVoidCallback
import com.eclipsesource.v8.V8
import com.eclipsesource.v8.V8Array
import com.eclipsesource.v8.V8ArrayBuffer
import com.eclipsesource.v8.V8Function
import com.eclipsesource.v8.V8Object
import com.eclipsesource.v8.V8TypedArray
import com.eclipsesource.v8.V8Value
import com.eclipsesource.v8.utils.V8ObjectUtils
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import java.io.InputStream
import java.nio.ByteBuffer
import java.security.SecureRandom
import java.util.Timer
import java.util.TimerTask
import java.util.UUID

class JSCore {

    private val scope = CoroutineScope(Dispatchers.Default)
    private val runtime = scope.async { V8.createV8Runtime() }

    private var timerId = 0
    private var timers = HashMap<Int, Timer>()

    constructor(context: Context) {
        this.polyfill()
        this.executeScript(context.assets.open("polyfill.js"))
    }

    private fun polyfill() {
        this.addGlobalObject("console") {
            it.registerJavaMethod({ self, args -> Log.v("JSContext", args.toString()) }, "log")
            it.registerJavaMethod({ self, args -> Log.v("JSContext", args.toString()) }, "trace")
            it.registerJavaMethod({ self, args -> Log.d("JSContext", args.toString()) }, "debug")
            it.registerJavaMethod({ self, args -> Log.i("JSContext", args.toString()) }, "info")
            it.registerJavaMethod({ self, args -> Log.w("JSContext", args.toString()) }, "warn")
            it.registerJavaMethod({ self, args -> Log.e("JSContext", args.toString()) }, "error")
        }
        runtime.registerJavaMethod(object : JavaVoidCallback {
            override fun invoke(receiver: V8Object?, args: V8Array) {
                val callback = args.get(0) as? V8Function
                val timeout =  if (args.length() < 2) 0 else args.getInteger(1)
                if (callback == null) { return }
                val res = V8ObjectUtils.toV8Array(runtime, V8ObjectUtils.toList(args).subList(2))
                val timer = Timer()
                timer.schedule(object : TimerTask() {
                    override fun run() {
                        callback.call(receiver, res)
                    }
                }, timeout.toLong())
                timers[timerId++] = timer
            }
        }, "setTimeout")
        runtime.registerJavaMethod(object : JavaVoidCallback {
            override fun invoke(receiver: V8Object?, args: V8Array) {
                if (args.length() != 1) { return }
                val id = args.getInteger(0)
                timers[id]?.cancel()
                timers.remove(id)
            }
        }, "clearTimeout")
        runtime.registerJavaMethod(object : JavaVoidCallback {
            override fun invoke(receiver: V8Object?, args: V8Array) {
                val callback = args.get(0) as? V8Function
                val timeout =  if (args.length() < 2) 0 else args.getInteger(1)
                if (callback == null) { return }
                val res = V8ObjectUtils.toV8Array(runtime, V8ObjectUtils.toList(args).subList(2))
                val timer = Timer()
                timer.schedule(object : TimerTask() {
                    override fun run() {
                        callback.call(receiver, res)
                    }
                }, 0, timeout.toLong())
                timers[timerId++] = timer
            }
        }, "setInterval")
        runtime.registerJavaMethod(object : JavaVoidCallback {
            override fun invoke(receiver: V8Object?, args: V8Array) {
                if (args.length() != 1) { return }
                val id = args.getInteger(0)
                timers[id]?.cancel()
                timers.remove(id)
            }
        }, "clearInterval")
        this.addGlobalObject("__ANDROID_SPEC__") {
            it.addObject("crypto") {
                it.registerJavaMethod(object : JavaCallback {
                    override fun invoke(receiver: V8Object?, args: V8Array): String {
                        return UUID.randomUUID().toString()
                    }
                }, "randomUUID")
                it.registerJavaMethod(object : JavaCallback {
                    override fun invoke(receiver: V8Object?, args: V8Array): Any {
                        val length = args.getInteger(0)
                        val random = SecureRandom()
                        val buffer = runtime.createArrayBuffer(length)
                        random.nextBytes(buffer.array())
                        return V8TypedArray(runtime, buffer, V8Value.BYTE, 0, length)
                    }
                }, "randomBytes")
            }
        }
    }

    fun addGlobalObject(key: String, callback: (V8Object) -> Unit) {
        val obj = V8Object(runtime)
        callback(obj)
        runtime.add(key, obj)
        obj.close()
    }

    fun executeScript(code: String): Any {
        return runtime.executeScript(code)
    }

    fun executeScript(stream: InputStream): Any {
        val source = stream.bufferedReader().readText()
        return this.executeScript(source)
    }
}

fun <E> List<E>.subList(from: Int): List<E> {
    return this.subList(from.coerceAtMost(this.size), this.size)
}

fun V8.createFunction(callback: (V8Object, V8Array) -> Any): V8Function {
    return V8Function(this, callback)
}

fun V8.createArrayBuffer(length: Int): V8ArrayBuffer {
    return V8ArrayBuffer(this, ByteBuffer.allocateDirect(length))
}

fun V8Object.addObject(key: String, callback: (V8Object) -> Unit) {
    val obj = V8Object(runtime)
    callback(obj)
    this.add(key, obj)
    obj.close()
}
