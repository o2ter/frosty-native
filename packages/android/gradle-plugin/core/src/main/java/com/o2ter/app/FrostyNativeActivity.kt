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
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.annotation.RequiresApi
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.State
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.core.os.ConfigurationCompat.getLocales
import androidx.core.os.LocaleListCompat
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.currentStateAsState
import com.eclipsesource.v8.V8Object
import com.eclipsesource.v8.utils.V8ObjectUtils
import com.o2ter.app.ui.theme.AppTheme
import com.o2ter.core.discard
import com.o2ter.runtime.FTContext
import kotlinx.coroutines.Deferred
import java.io.InputStream
import java.util.Locale
import java.util.TimeZone

@RequiresApi(Build.VERSION_CODES.P)
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

@RequiresApi(Build.VERSION_CODES.N)
internal fun currentNetworkType(context: Context): State<String?> {
    val result = mutableStateOf<String?>(null)
    val connectivityManager = context.getSystemService(ConnectivityManager::class.java)
    connectivityManager.registerDefaultNetworkCallback(object : ConnectivityManager.NetworkCallback() {
        override fun onCapabilitiesChanged(
            network: Network,
            networkCapabilities: NetworkCapabilities
        ) {
            result.value = when {
                networkCapabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) -> "wifi"
                networkCapabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) -> "cellular"
                networkCapabilities.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET) -> "ethernet"
                else -> "unknown"
            }
        }
        override fun onLost(network: Network) {
            result.value = null
        }
    })
    return result
}

@RequiresApi(Build.VERSION_CODES.P)
open class FrostyNativeActivity(val appKey: String) : ComponentActivity() {

    internal lateinit var engine: FTContext
    internal lateinit var runner: Deferred<V8Object>

    internal var nodes = mutableSetOf<FTNodeState>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            val rootView = FTNodeState(this) { nodeId, props, handler, content -> FTView(nodeId, props, handler, content) }
            val currentLifecycleState by lifecycle.currentStateAsState()
            engine = this.createEngine(LocalContext.current)
            runner = engine.run(appKey, rootView)
            FTRoot(this, rootView)
            this.setEnvironment(mapOf(
                "scenePhase" to
                        if (currentLifecycleState.isAtLeast(Lifecycle.State.RESUMED))
                            "active"
                        else
                            "background"
            ))
        }
    }

    override fun onResume() {
        super.onResume()
        this.setEnvironment(mapOf("scenePhase" to "active"))
    }

    override fun onPause() {
        super.onPause()
        this.setEnvironment(mapOf("scenePhase" to "background"))
    }

    override fun onDestroy() {
        super.onDestroy()
        if (this::engine.isInitialized) {
            engine.withRuntime { runtime ->
                val runner = runner.await()
                runner.executeVoidFunction("unmount", V8ObjectUtils.toV8Array(runtime, listOf()))
                runner.close()
            }.discard()
        }
        nodes.clear()
    }

    fun setEnvironment(values: Map<String, Any>) {
        if (this::engine.isInitialized) {
            engine.withRuntime { runtime ->
                val runner = runner.await()
                runner.executeVoidFunction(
                    "setEnvironment",
                    V8ObjectUtils.toV8Array(runtime, listOf(values))
                )
            }.discard()
        }
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


fun LocaleListCompat.toList(): List<Locale> {
    val localeList = mutableListOf<Locale>()
    for (i in 0 until this.size()) {
        this.get(i)?.let { locale ->
            localeList.add(locale)
        }
    }
    return localeList
}

@RequiresApi(Build.VERSION_CODES.P)
@Composable
internal fun FTRoot(activity: FrostyNativeActivity, rootView: FTNodeState) {
    val systemIsDarkTheme = isSystemInDarkTheme()
    var darkTheme by remember { mutableStateOf(systemIsDarkTheme) }
    val pixelDensity = activity.engine.context.resources.displayMetrics.density
    val locales = getLocales(LocalConfiguration.current)
    val layoutDirection = LocalLayoutDirection.current
    val timeZone = TimeZone.getDefault()
    val networkType by remember { currentNetworkType(activity.engine.context) }
    activity.setEnvironment(mapOf(
        "layoutDirection" to layoutDirection.name.lowercase(),
        "pixelDensity" to pixelDensity,
        "pixelLength" to 1 / pixelDensity,
        "colorScheme" to if (darkTheme) "dark" else "light",
        "userLocale" to locales[0]!!.toString(),
        "languages" to locales.toList().map { it.toString() },
        "timeZone" to timeZone.id,
        "network" to mapOf(
            "online" to (networkType != null),
            "type" to if (networkType != "unknown") networkType else null,
        )
    ))
    AppTheme(darkTheme) {
        Scaffold(
            modifier = Modifier
                .fillMaxSize()
                .onSizeChanged { size ->
                    activity.setEnvironment(
                        mapOf(
                            "displayWidth" to size.width,
                            "displayHeight" to size.height,
                        )
                    )
                }
        ) { safeAreaInset ->
            FTNode(
                Modifier.onSizeChanged {
                    activity.setEnvironment(mapOf(
                        "safeAreaInsets" to mapOf(
                            "top" to safeAreaInset.calculateTopPadding().value,
                            "left" to safeAreaInset.calculateLeftPadding(layoutDirection).value,
                            "right" to safeAreaInset.calculateRightPadding(layoutDirection).value,
                            "bottom" to safeAreaInset.calculateBottomPadding().value,
                        ),
                    ))
                },
                activity,
                rootView
            )
        }
    }
}

