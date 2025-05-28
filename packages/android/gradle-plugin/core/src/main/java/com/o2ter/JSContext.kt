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
import androidx.javascriptengine.JavaScriptConsoleCallback.ConsoleMessage.*
import androidx.javascriptengine.JavaScriptIsolate
import androidx.javascriptengine.JavaScriptSandbox
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Deferred
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.guava.await
import java.io.InputStream

class JSContext {

    private val scope = CoroutineScope(Dispatchers.Default)
    private lateinit var vm: JavaScriptSandbox
    private val isolate: Deferred<JavaScriptIsolate>

    constructor(context: Context) {
        isolate = scope.async {
            vm = JavaScriptSandbox.createConnectedInstanceAsync(context).await()
            vm.createIsolate()
        }
        this.withIsolate {
            if (vm.isFeatureSupported(JavaScriptSandbox.JS_FEATURE_CONSOLE_MESSAGING)) {
                it.setConsoleCallback {
                    when (it.level) {
                        LEVEL_LOG -> Log.v("JSContext", it.message)
                        LEVEL_DEBUG -> Log.d("JSContext", it.message)
                        LEVEL_INFO -> Log.i("JSContext", it.message)
                        LEVEL_ERROR -> Log.e("JSContext", it.message)
                        LEVEL_WARNING -> Log.w("JSContext", it.message)
                        else -> Log.v("JSContext", it.message)
                    }
                }
            }
        }
        this.evaluateJavaScriptAsync(context.assets.open("polyfill.js"))
    }

    fun <T> withIsolate(block: suspend CoroutineScope.(JavaScriptIsolate) -> T): Deferred<T> {
        return scope.async { block(isolate.await()) }
    }

    fun evaluateJavaScriptAsync(code: String): Deferred<String> {
        return this.withIsolate {
            it.evaluateJavaScriptAsync(code).await()
        }
    }

    fun evaluateJavaScriptAsync(stream: InputStream): Deferred<String> {
        val source = stream.bufferedReader().readText()
        return this.evaluateJavaScriptAsync(source)
    }

    fun provideNamedData(name: String, inputBytes: ByteArray): Deferred<Unit> {
        return this.withIsolate {
            if (vm.isFeatureSupported(JavaScriptSandbox.JS_FEATURE_PROVIDE_CONSUME_ARRAY_BUFFER)) {
                it.provideNamedData(name, inputBytes)
            }
        }
    }
}