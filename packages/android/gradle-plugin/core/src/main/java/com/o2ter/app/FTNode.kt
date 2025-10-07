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

    fun toV8Object(runtime: V8): V8Object {
        activity.nodes.add(this)
        val obj = V8Object(runtime)
        obj.add("nodeId", nodeId)
        obj.registerJavaMethod({ _, args ->
            val method = args.getString(0)
            val params = V8ObjectUtils.toList(args.getArray(1)).toList()
            if (method != null) {
                this.handler?.invoke(method, params)
            }
        }, "invoke")
        obj.registerJavaMethod({ _, args ->
            val props = V8ObjectUtils.toMap(args.getObject(0))
            val children = V8ObjectUtils.toList(args.getArray(1))
            if (props != null) {
                this.props = props.toMap()
            }
            if (children != null) {
                this.children = children
                    .mapNotNull { (it as? Map<*, *>)?.get("nodeId") }
                    .mapNotNull { id -> activity.nodes.find { it.nodeId == id } }
            }
        }, "update")
        obj.registerJavaMethod({ _, _ -> this.destroy() }, "destroy")
        return obj
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