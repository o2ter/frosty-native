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
import com.eclipsesource.v8.V8
import com.eclipsesource.v8.V8Array
import com.eclipsesource.v8.V8ArrayBuffer
import com.eclipsesource.v8.V8Object
import com.eclipsesource.v8.V8TypedArray
import com.eclipsesource.v8.V8Value
import java.io.InputStream
import java.nio.ByteBuffer
import java.security.SecureRandom
import java.util.UUID

class JSCore {

    private val runtime: V8 = V8.createV8Runtime()

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
        this.addGlobalObject("__ANDROID_SPEC__") {
            it.addObject("crypto") {
                it.registerJavaMethodWithReturn({ self, args ->
                    UUID.randomUUID().toString()
                }, "randomUUID")
                it.registerJavaMethodWithReturn({ self, args ->
                    val length = args.getInteger(0)
                    val random = SecureRandom()
                    val buffer = createArrayBuffer(length)
                    random.nextBytes(buffer.array())
                    V8TypedArray(runtime, buffer, V8Value.BYTE, 0, length)
                }, "randomBytes")
            }
        }
    }

    fun createArrayBuffer(length: Int): V8ArrayBuffer {
        return V8ArrayBuffer(runtime, ByteBuffer.allocateDirect(length))
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

fun V8Object.registerJavaMethodWithReturn(callback: (V8Object, V8Array) -> Any, jsFunctionName: String) {
    this.registerJavaMethod(callback, jsFunctionName)
}

fun V8Object.addObject(key: String, callback: (V8Object) -> Unit) {
    val obj = V8Object(runtime)
    callback(obj)
    this.add(key, obj)
    obj.close()
}
