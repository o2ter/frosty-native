//
//  View.kt
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

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color

private fun Modifier.applyViewProps(
    props: Map<String, Any?>
): Modifier {
    return this
}

@Composable
fun FTView(
    props: Map<String, Any?>,
    handler: (ComponentHandler) -> Unit,
    content: @Composable () -> Unit
) {
    Column(modifier = Modifier.applyViewProps(props)) {
        content()
    }
}

@Composable
fun FTTextView(
    props: Map<String, Any?>,
    handler: (ComponentHandler) -> Unit,
    content: @Composable () -> Unit
) {
    val text = props.get("text") as? String
    if (text != null) {
        Text(
            text = text,
            modifier = Modifier.applyViewProps(props)
        )
    }
}

@Composable
fun LinearGradient(
    colorStops: Map<Float, Color>,
    start: Offset,
    end: Offset
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.linearGradient(
                    colorStops = colorStops.map { it.key to it.value }.toTypedArray(),
                    start,
                    end
                )
            )
    )
}

@Composable
fun RadialGradient(
    colorStops: Map<Float, Color>,
    center: Offset,
    radius: Float
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.radialGradient(
                    colorStops = colorStops.map { it.key to it.value }.toTypedArray(),
                    center,
                    radius
                )
            )
    )
}

@Composable
fun AngularGradient(
    colorStops: Map<Float, Color>,
    center: Offset
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.sweepGradient(
                    colorStops = colorStops.map { it.key to it.value }.toTypedArray(),
                    center
                )
            )
    )
}