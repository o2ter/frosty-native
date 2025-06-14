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

import androidx.compose.foundation.layout.Box
import androidx.compose.ui.Modifier
import androidx.compose.runtime.Composable
import com.eclipsesource.v8.V8
import com.eclipsesource.v8.V8Object
import com.eclipsesource.v8.utils.V8ObjectUtils
import com.o2ter.runtime.FTContext
import java.util.UUID

internal typealias Component = @Composable (
    props: Map<String, Any?>,
    content: @Composable () -> Unit
) -> Unit

internal class FTNodeState(
    val activity: FrostyNativeActivity,
    var component: Component
) {

    val nodeId = UUID.randomUUID().toString()
    var props = mapOf<String, Any?>()
    var children = mutableListOf<FTNodeState>()

    fun update(props: Map<String, Any?>) {
        this.props = props
    }

    fun replaceChildren(children: List<FTNodeState>) {
    }

    fun destroy() {
        this.props = mapOf()
        this.children.clear()
        activity.nodes.remove(this)
    }

    fun toV8Object(runtime: V8): V8Object {
        activity.nodes.add(this)
        val obj = V8Object(runtime)
        obj.add("nodeId", nodeId)
        obj.registerJavaMethod({ _, args ->
            val props = V8ObjectUtils.toMap(args.getObject(0))
            if (props != null) {
                this.update(props.toMap())
            }
        }, "update")
        obj.registerJavaMethod({ _, args ->
            val children = V8ObjectUtils.toList(args.getArray(0))
            if (children != null) {

            }
        }, "replaceChildren")
        obj.registerJavaMethod({ _, _ -> this.destroy() }, "destroy")
        return obj
    }
}

@Composable
internal fun FTNode(
    modifier: Modifier = Modifier,
    engine: FTContext,
    state: FTNodeState,
) {
    Box(modifier) {
        state.component(state.props) {
            state.children.forEach {
                FTNode(
                    engine = engine,
                    state = it
                )
            }
        }
    }
}