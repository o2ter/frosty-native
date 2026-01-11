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
import com.o2ter.app.Component
import com.o2ter.app.FTImageView
import com.o2ter.app.FTNodeState
import com.o2ter.app.FTScrollView
import com.o2ter.app.FTTextInput
import com.o2ter.app.FTTextView
import com.o2ter.app.FTView
import com.o2ter.app.FrostyNativeActivity
import com.o2ter.jscore.JavaScriptEngine
import com.o2ter.jscore.android.AndroidPlatformContext
import java.io.InputStream

@RequiresApi(Build.VERSION_CODES.P)
internal class FTContext(private val activity: FrostyNativeActivity, val context: Context) {

    private val engine = JavaScriptEngine(AndroidPlatformContext(context))

    init {
        polyfill()
        register("FTView") { nodeId, props, handler, content -> FTView(nodeId, props, handler, content) }
        register("FTImageView") { nodeId, props, handler, content -> FTImageView(nodeId, props, handler, content) }
        register("FTTextView") { nodeId, props, handler, content -> FTTextView(nodeId, props, handler, content) }
        register("FTTextInput") { nodeId, props, handler, content -> FTTextInput(nodeId, props, handler, content) }
        register("FTScrollView") { nodeId, props, handler, content -> FTScrollView(nodeId, props, handler, content) }
    }

    private fun polyfill() {
        val preferences = activity.getPreferences(Context.MODE_PRIVATE)

        // Create localStorage API object
        val localStorage = mapOf(
            "keys" to { _: Array<Any?> ->
                preferences.all.keys.toList()
            },
            "getItem" to { args: Array<Any?> ->
                if (args.isEmpty()) throw IllegalArgumentException("getItem requires a key argument")
                val key = args[0].toString()
                preferences.getString(key, null)
            },
            "setItem" to { args: Array<Any?> ->
                if (args.size < 2) throw IllegalArgumentException("setItem requires key and value arguments")
                val key = args[0].toString()
                val value = args[1].toString()
                preferences.edit(commit = true) {
                    putString(key, value)
                }
                null
            },
            "removeItem" to { args: Array<Any?> ->
                if (args.isEmpty()) throw IllegalArgumentException("removeItem requires a key argument")
                val key = args[0].toString()
                preferences.edit(commit = true) {
                    remove(key)
                }
                null
            },
            "clear" to { _: Array<Any?> ->
                preferences.edit(commit = true) {
                    clear()
                }
                null
            }
        )

        // Create NativeModules structure
        val nativeModules = mapOf(
            "localStorage" to localStorage
        )

        // Set up global __FROSTY_SPEC__ object
        engine.set("__FROSTY_SPEC__", mapOf(
            "NativeModules" to nativeModules
        ))
    }

    fun execute(code: String): Any? {
        return engine.execute(code)
    }

    fun execute(stream: InputStream): Any? {
        return engine.execute(stream.bufferedReader().use { it.readText() })
    }

    fun execute(namedArgs: Map<String, Any?>, code: String): Any? {
        return engine.execute(namedArgs, code)
    }

    fun executeVoid(code: String) {
        engine.executeVoid(code)
    }

    fun executeVoid(stream: InputStream) {
        engine.executeVoid(stream.bufferedReader().use { it.readText() })
    }

    private fun register(name: String, component: Component) {
        // Create a factory function that will be called from JavaScript
        val factory = {
            val node = FTNodeState(activity, component)
            // Return the node state object
            node.toNodeObject()
        }
        engine.execute(
            mapOf("module" to factory),
            """
            (function() {
                const NativeModules = __FROSTY_SPEC__.NativeModules;
                NativeModules['${name}'] = module;
            })()
            """.trimIndent()
        )
    }
}