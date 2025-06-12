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

package com.o2ter.core

import android.content.Context
import android.util.Log
import com.eclipsesource.v8.JavaCallback
import com.eclipsesource.v8.V8
import com.eclipsesource.v8.V8Array
import com.eclipsesource.v8.V8ArrayBuffer
import com.eclipsesource.v8.V8Function
import com.eclipsesource.v8.V8Object
import com.eclipsesource.v8.V8TypedArray
import com.eclipsesource.v8.V8Value
import com.eclipsesource.v8.utils.MemoryManager
import com.eclipsesource.v8.utils.V8ObjectUtils
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Deferred
import kotlinx.coroutines.DelicateCoroutinesApi
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.async
import kotlinx.coroutines.newSingleThreadContext
import java.io.InputStream
import java.nio.ByteBuffer
import java.security.SecureRandom
import java.util.Timer
import java.util.TimerTask
import java.util.UUID

@OptIn(ExperimentalCoroutinesApi::class)
internal class JSCore(context: Context) {

    private val timer = Timer()

    @OptIn(DelicateCoroutinesApi::class)
    private val scope = CoroutineScope(newSingleThreadContext("JSCoreThread"))
    private val runtime = scope.async { V8.createV8Runtime() }

    private val managers = ArrayList<MemoryManager>()

    private var timerTaskId = 0
    private var timerTasks = HashMap<Int, V8TimerTask>()

    init {
        withRuntime {
            polyfill(it)
            executeVoidScript(context.assets.open("polyfill.js")).await()
        }.discard()
    }

    fun <T> withRuntime(block: suspend CoroutineScope.(V8) -> T): Deferred<T> {
        return scope.async {
            val v8 = runtime.await()
            val scope = MemoryManager(v8)
            managers.add(scope)
            try {
                val result = block(v8)
                if (result is V8Value) persist(result) else result
            } catch (e: Exception) {
                Log.e("JSContext", e.stackTraceToString())
                throw e
            } finally {
                managers.remove(scope)
                scope.release()
            }
        }
    }

    fun <T: V8Value> persist(obj: T): T {
        for (manager in managers) {
            manager.persist(obj)
        }
        return obj as T
    }

    private fun polyfill(runtime: V8) {
        runtime.addGlobalObject("console") {
            it.registerJavaMethod({ _, args -> Log.v("JSContext", args.toString()) }, "log")
            it.registerJavaMethod({ _, args -> Log.v("JSContext", args.toString()) }, "trace")
            it.registerJavaMethod({ _, args -> Log.d("JSContext", args.toString()) }, "debug")
            it.registerJavaMethod({ _, args -> Log.i("JSContext", args.toString()) }, "info")
            it.registerJavaMethod({ _, args -> Log.w("JSContext", args.toString()) }, "warn")
            it.registerJavaMethod({ _, args -> Log.e("JSContext", args.toString()) }, "error")
        }
        runtime.registerJavaMethod({ _, args ->
            val callback = args.get(0) as? V8Function
            val timeout = if (args.length() < 2) 0 else args.getInteger(1)
            if (callback == null) {
                return@registerJavaMethod
            }
            val task = V8TimerTask(
                this,
                callback,
                V8ObjectUtils.toV8Array(runtime, args.toList().subList(2)),
                true
            )
            timer.schedule(task, timeout.toLong())
            timerTasks[timerTaskId++] = task
        }, "setTimeout")
        runtime.registerJavaMethod({ _, args ->
            if (args.length() != 1) {
                return@registerJavaMethod
            }
            val id = args.getInteger(0)
            timerTasks[id]?.cancel()
            timerTasks.remove(id)
        }, "clearTimeout")
        runtime.registerJavaMethod({ _, args ->
            val callback = args.get(0) as? V8Function
            val timeout = if (args.length() < 2) 0 else args.getInteger(1)
            if (callback == null) {
                return@registerJavaMethod
            }
            val task = V8TimerTask(
                this,
                callback,
                V8ObjectUtils.toV8Array(runtime, args.toList().subList(2)),
                false
            )
            timer.schedule(task, timeout.toLong(), timeout.toLong())
            timerTasks[timerTaskId++] = task
        }, "setInterval")
        runtime.registerJavaMethod({ _, args ->
            if (args.length() != 1) {
                return@registerJavaMethod
            }
            val id = args.getInteger(0)
            timerTasks[id]?.cancel()
            timerTasks.remove(id)
        }, "clearInterval")
        runtime.addGlobalObject("__ANDROID_SPEC__") {
            it.addObject("crypto") {
                it.registerJavaMethod(JavaCallback { _, _ -> UUID.randomUUID().toString() }, "randomUUID")
                it.registerJavaMethod(JavaCallback { _, args ->
                    val length = args.getInteger(0)
                    val random = SecureRandom()
                    val buffer = runtime.createArrayBuffer(length)
                    random.nextBytes(buffer.array())
                    V8TypedArray(runtime, buffer, V8Value.BYTE, 0, length)
                }, "randomBytes")
            }
        }
    }

    fun executeScript(code: String): Deferred<Any> {
        return this.withRuntime { runtime ->
            runtime.executeScript(code)
        }
    }

    fun executeScript(stream: InputStream): Deferred<Any> {
        val source = stream.bufferedReader().readText()
        return this.executeScript(source)
    }

    fun executeVoidScript(code: String): Deferred<Unit> {
        return this.withRuntime { runtime ->
            runtime.executeVoidScript(code)
        }
    }

    fun executeVoidScript(stream: InputStream): Deferred<Unit> {
        val source = stream.bufferedReader().readText()
        return this.executeVoidScript(source)
    }

}
fun Any?.discard() = Unit

class V8TimerTask : TimerTask {
    val runtime: JSCore
    val callback: V8Function
    val args: V8Array
    val once: Boolean
    constructor(
        runtime: JSCore,
        callback: V8Function,
        args: V8Array,
        once: Boolean
    ) {
        this.runtime = runtime
        this.callback = runtime.persist(callback)
        this.args = runtime.persist(args)
        this.once = once
    }
    override fun run() {
        val self = this
        runtime.withRuntime {
            self.callback.call(null, self.args)
            if (self.once) self.close()
        }.discard()
    }
    fun close() {
        if (!this.args.isReleased) this.args.close()
        if (!this.callback.isReleased) this.callback.close()
    }
}

fun <E> List<E>.subList(from: Int): List<E> {
    return this.subList(from.coerceAtMost(this.size), this.size)
}

fun V8Array.toList(): List<Any> {
    val result = ArrayList<Any>()
    for (i in 0..<this.length()) {
        result.add(this.get(i))
    }
    return result
}

fun V8.addGlobalObject(key: String, callback: (V8Object) -> Unit) {
    val obj = V8Object(this)
    callback(obj)
    this.add(key, obj)
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
