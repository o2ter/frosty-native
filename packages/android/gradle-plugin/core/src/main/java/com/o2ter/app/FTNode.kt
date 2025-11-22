//
//  FTNode.kt
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

import android.os.Build
import androidx.annotation.RequiresApi
import androidx.compose.foundation.layout.Box
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Stable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import java.util.UUID

internal typealias ComponentHandler = (method: String, args: List<Any?>) -> Unit

internal typealias Component = @Composable (
    nodeId: String,
    props: Map<String, Any?>,
    handler: (ComponentHandler) -> Unit,
    content: @Composable () -> Unit
) -> Unit

@RequiresApi(Build.VERSION_CODES.P)
@Stable
internal class FTNodeState(
    val activity: FrostyNativeActivity,
    var component: Component
) {

    val nodeId = UUID.randomUUID().toString()
    var props by mutableStateOf(mapOf<String, Any?>())
    var children by mutableStateOf(listOf<FTNodeState>())

    var handler: ComponentHandler? = null

    fun destroy() {
        this.props = mapOf()
        this.children = listOf()
        this.handler = null
        activity.nodes.remove(this)
    }

    fun invoke(method: String, params: List<Any?>) {
        this.handler?.invoke(method, params)
    }

    fun update(props: Map<String, Any?>, children: List<Map<String, Any?>>) {
        this.props = props
        this.children = children
            .mapNotNull { it["nodeId"] as? String }
            .mapNotNull { id -> activity.nodes.find { it.nodeId == id } }
    }

    fun toNodeObject(): Map<String, Any?> {
        activity.nodes.add(this)
        return mapOf(
            "nodeId" to nodeId,
            "invoke" to { args: Array<Any?> ->
                if (args.size >= 2) {
                    val method = args[0] as? String
                    val params = args[1] as? List<*>
                    if (method != null) {
                        invoke(method, params?.filterNotNull() ?: emptyList())
                    }
                }
                null
            },
            "update" to { args: Array<Any?> ->
                if (args.size >= 2) {
                    val props = args[0] as? Map<*, *>
                    val children = args[1] as? List<*>
                    if (props != null) {
                        @Suppress("UNCHECKED_CAST")
                        update(
                            props as Map<String, Any?>,
                            (children as? List<Map<String, Any?>>)?.filterNotNull() ?: emptyList()
                        )
                    }
                }
                null
            },
            "destroy" to { _: Array<Any?> ->
                destroy()
                null
            }
        )
    }
}

@RequiresApi(Build.VERSION_CODES.P)
@Composable
internal fun FTNode(
    modifier: Modifier = Modifier,
    activity: FrostyNativeActivity,
    state: FTNodeState,
) {
    Box(modifier) {
        state.component(
            state.nodeId,
            state.props,
            { state.handler = it }
        ) {
            state.children.forEach {
                FTNode(
                    activity = activity,
                    state = it
                )
            }
        }
    }
}