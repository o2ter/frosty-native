//
//  FrostyNativeActivity.kt
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

package com.o2ter.app

import android.content.Context
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalContext
import androidx.core.os.ConfigurationCompat.getLocales
import com.eclipsesource.v8.V8Object
import com.eclipsesource.v8.utils.V8ObjectUtils
import com.o2ter.app.ui.theme.AppTheme
import com.o2ter.runtime.FTContext
import com.o2ter.core.discard
import kotlinx.coroutines.Deferred
import java.io.InputStream

internal fun FTContext.run(
    appKey: String,
    rootView: FTNodeState
): Deferred<V8Object> {
    val self = this
    return this.withRuntime { runtime ->
        val registry = self.executeObjectScript("__FROSTY_SPEC__.AppRegistry").await()
        val runner = registry.executeObjectFunction("getRunnable", V8ObjectUtils.toV8Array(runtime, listOf(appKey)))
        runner.executeObjectFunction("run", V8ObjectUtils.toV8Array(runtime, listOf(
            V8ObjectUtils.toV8Object(runtime, mapOf(
                "root" to rootView.toV8Object(runtime)
            ))
        )))
    }
}

open class FrostyNativeActivity(val appKey: String) : ComponentActivity() {

    private lateinit var engine: FTContext
    private lateinit var runner: Deferred<V8Object>

    internal var nodes = mutableSetOf<FTNodeState>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            val rootView = FTNodeState(this) { props, content -> FTView(props, content) }
            engine = this.createEngine(LocalContext.current)
            runner = engine.run(appKey, rootView)
            FTRoot(engine, rootView)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        engine.withRuntime { runtime ->
            val runner = runner.await()
            runner.executeVoidFunction("unmount", V8ObjectUtils.toV8Array(runtime, listOf()))
            runner.close()
        }.discard()
        nodes.clear()
    }

    private fun createEngine(context: Context): FTContext {
        val engine = FTContext(this, context)
        engine.executeVoidScript(this.loadBundle()).discard()
        return engine
    }

    open fun loadBundle(): InputStream {
        return assets.open("main.jsbundle")
    }
}

@Composable
internal fun FTRoot(engine: FTContext, rootView: FTNodeState) {
    val systemIsDarkTheme = isSystemInDarkTheme()
    var darkTheme by remember { mutableStateOf(systemIsDarkTheme) }
    val displayScale = engine.context.resources.displayMetrics.density
    val pixelLength = 1 / displayScale
    val locales = getLocales(LocalConfiguration.current)
    AppTheme(darkTheme) {
        Scaffold(
            modifier = Modifier.fillMaxSize()
                .onSizeChanged { size ->
                    println(engine.context.resources.displayMetrics)
                    println(size)
                }
        ) { safeAreaInset ->
            FTNode(
                Modifier.onSizeChanged {
                    println(safeAreaInset)
                },
                engine,
                rootView
            )
        }
    }
}

