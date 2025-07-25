//
//  FTContext.kt
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

package com.o2ter.runtime

import android.content.Context
import android.os.Build
import androidx.annotation.RequiresApi
import androidx.core.content.edit
import com.eclipsesource.v8.JavaCallback
import com.eclipsesource.v8.V8
import com.eclipsesource.v8.V8Object
import com.eclipsesource.v8.utils.V8ObjectUtils
import com.o2ter.app.Component
import com.o2ter.app.FTImageView
import com.o2ter.app.FTNodeState
import com.o2ter.app.FTScrollView
import com.o2ter.app.FTTextInput
import com.o2ter.app.FTTextView
import com.o2ter.app.FTView
import com.o2ter.app.FrostyNativeActivity
import com.o2ter.core.JSCore
import com.o2ter.core.addGlobalObject
import com.o2ter.core.addObject
import com.o2ter.core.discard
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Deferred
import java.io.InputStream

@RequiresApi(Build.VERSION_CODES.P)
internal class FTContext(private val activity: FrostyNativeActivity, val context: Context) {

    private val core: JSCore = JSCore(context)

    init {
        val self = this
        core.withRuntime {
            polyfill(it)
            self.register(it, "FTView") { nodeId, props, handler, content -> FTView(nodeId, props, handler, content) }
            self.register(it, "FTImageView") { nodeId, props, handler, content -> FTImageView(nodeId, props, handler, content) }
            self.register(it, "FTTextView") { nodeId, props, handler, content -> FTTextView(nodeId, props, handler, content) }
            self.register(it, "FTTextInput") { nodeId, props, handler, content -> FTTextInput(nodeId, props, handler, content) }
            self.register(it, "FTScrollView") { nodeId, props, handler, content -> FTScrollView(nodeId, props, handler, content) }
        }.discard()
    }

    private fun polyfill(runtime: V8) {
        val preferences = activity.getPreferences(Context.MODE_PRIVATE)
        runtime.addGlobalObject("__FROSTY_SPEC__") {
            it.addObject("NativeModules") {
                it.addObject("localStorage") {
                    it.registerJavaMethod(JavaCallback { _, _ ->
                        V8ObjectUtils.toV8Array(runtime, preferences.all.map { it.key })
                    }, "keys")
                    it.registerJavaMethod(JavaCallback { _, args ->
                        if (args.length() != 1) throw IllegalArgumentException()
                        val key = args.getString(0)
                        preferences.getString(key, null)
                    }, "getItem")
                    it.registerJavaMethod({ _, args ->
                        if (args.length() != 2) throw IllegalArgumentException()
                        val key = args.getString(0)
                        val value = args.getString(1)
                        preferences.edit(commit = true) {
                            putString(key, value)
                        }
                    }, "setItem")
                    it.registerJavaMethod({ _, args ->
                        if (args.length() != 1) throw IllegalArgumentException()
                        val key = args.getString(0)
                        preferences.edit(commit = true) {
                            remove(key)
                        }
                    }, "removeItem")
                    it.registerJavaMethod({ _, _ ->
                        preferences.edit(commit = true) {
                            clear()
                        }
                    }, "clear")
                }
            }
        }
    }

    fun <T> withRuntime(block: suspend CoroutineScope.(V8) -> T): Deferred<T> {
        return core.withRuntime(block)
    }

    fun executeScript(code: String): Deferred<Any> {
        return core.executeScript(code)
    }

    fun executeScript(stream: InputStream): Deferred<Any> {
        return core.executeScript(stream)
    }

    fun executeObjectScript(code: String): Deferred<V8Object> {
        return core.executeObjectScript(code)
    }

    fun executeObjectScript(stream: InputStream): Deferred<V8Object> {
        return core.executeObjectScript(stream)
    }

    fun executeVoidScript(code: String): Deferred<Unit> {
        return core.executeVoidScript(code)
    }

    fun executeVoidScript(stream: InputStream): Deferred<Unit> {
        return core.executeVoidScript(stream)
    }

    fun register(runtime: V8, name: String, component: Component) {
        val nativeModules = runtime.getObject("__FROSTY_SPEC__").getObject("NativeModules")
        nativeModules.registerJavaMethod(JavaCallback { _, _ ->
            val node = FTNodeState(activity, component)
            node.toV8Object(runtime)
        }, name)
    }
}