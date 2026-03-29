//
//  View.kt
//
//  The MIT License
//  Copyright (c) 2021 - 2026 O2ter Limited. All rights reserved.
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
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.unit.dp
import androidx.compose.ui.zIndex
import kotlin.math.PI
import androidx.core.graphics.toColorInt

// DimensionValue used for parsing string-based dimensions coming from JS.
private sealed class DimensionValue {
    object Auto : DimensionValue()
    data class Point(val value: Float) : DimensionValue()
    data class Percent(val fraction: Float) : DimensionValue()

    companion object {
        fun parse(value: Any?): DimensionValue? = when (value) {
            is Number -> Point(value.toFloat())
            is String -> {
                val s = value.trim().lowercase()
                when {
                    s == "auto" -> Auto
                    s.endsWith("%") -> s.dropLast(1).trim().toFloatOrNull()?.let { Percent(it / 100f) }
                    else -> s.toFloatOrNull()?.let { Point(it) }
                }
            }
            else -> null
        }
    }
}

private fun parseHexColor(hex: String?): Color? {
    if (hex == null) return null
    return try {
        val trimmed = hex.trimStart('#')
        when (trimmed.length) {
            3 -> Color(
                red = trimmed[0].digitToInt(16) * 0x11 / 255f,
                green = trimmed[1].digitToInt(16) * 0x11 / 255f,
                blue = trimmed[2].digitToInt(16) * 0x11 / 255f
            )
            6 -> Color("#$trimmed".toColorInt())
            8 -> Color("#$trimmed".toColorInt())
            else -> null
        }
    } catch (_: Exception) {
        null
    }
}

private fun parseAngleDeg(str: String): Float? {
    val s = str.trim().lowercase()
    return when {
        s.endsWith("deg") -> s.dropLast(3).trim().toFloatOrNull()
        s.endsWith("rad") -> s.dropLast(3).trim().toFloatOrNull()?.let { it * 180f / PI.toFloat() }
        s.endsWith("turn") -> s.dropLast(4).trim().toFloatOrNull()?.let { it * 360f }
        else -> s.toFloatOrNull()
    }
}

private fun Modifier.applyViewProps(
    props: Map<String, Any?>
): Modifier {
    val rawStyle = props["style"] as? Map<*, *> ?: return this
    val style: Map<String, Any?> = rawStyle.entries.associate { (k, v) -> k.toString() to v }

    fun str(key: String): String? = style[key]?.toString()
    fun num(key: String): Float? = (style[key] as? Number)?.toFloat()
    fun dim(key: String): DimensionValue? = DimensionValue.parse(style[key])

    // Layout
    val display = str("display")

    // Size
    val width = dim("width")
    val height = dim("height")
    val minWidth = dim("minWidth")
    val maxWidth = dim("maxWidth")
    val minHeight = dim("minHeight")
    val maxHeight = dim("maxHeight")

    // Spacing
    val paddingTop = dim("paddingTop")
    val paddingLeft = dim("paddingLeft")
    val paddingRight = dim("paddingRight")
    val paddingBottom = dim("paddingBottom")
    val marginTop = dim("marginTop")
    val marginLeft = dim("marginLeft")
    val marginRight = dim("marginRight")
    val marginBottom = dim("marginBottom")

    // Position
    val position = str("position") ?: "static"
    val left = dim("left")
    val top = dim("top")
    val right = dim("right")
    val bottom = dim("bottom")

    // Visual
    val bgColor = parseHexColor(str("backgroundColor"))
    val opacity = num("opacity") ?: 1f
    val zIndexVal = num("zIndex")

    // Border radius (per-corner with shorthand fallback)
    val bRad = num("borderRadius") ?: 0f
    val topLeftRadius = num("borderTopLeftRadius") ?: bRad
    val topRightRadius = num("borderTopRightRadius") ?: bRad
    val bottomLeftRadius = num("borderBottomLeftRadius") ?: bRad
    val bottomRightRadius = num("borderBottomRightRadius") ?: bRad
    val hasBorderRadius = topLeftRadius > 0f || topRightRadius > 0f ||
        bottomLeftRadius > 0f || bottomRightRadius > 0f
    val shape = if (hasBorderRadius) {
        RoundedCornerShape(
            topStart = topLeftRadius.dp,
            topEnd = topRightRadius.dp,
            bottomStart = bottomLeftRadius.dp,
            bottomEnd = bottomRightRadius.dp
        )
    } else null

    // Per-side borders (with shorthand fallback)
    val bWidth = num("borderWidth") ?: 0f
    val bColor = parseHexColor(str("borderColor")) ?: Color.Black
    val borderTopW = num("borderTopWidth") ?: bWidth
    val borderBottomW = num("borderBottomWidth") ?: bWidth
    val borderLeftW = num("borderLeftWidth") ?: bWidth
    val borderRightW = num("borderRightWidth") ?: bWidth
    val borderTopC = parseHexColor(str("borderTopColor")) ?: bColor
    val borderBottomC = parseHexColor(str("borderBottomColor")) ?: bColor
    val borderLeftC = parseHexColor(str("borderLeftColor")) ?: bColor
    val borderRightC = parseHexColor(str("borderRightColor")) ?: bColor
    val hasBorder = borderTopW > 0f || borderBottomW > 0f || borderLeftW > 0f || borderRightW > 0f

    // Transforms
    val transforms: List<Map<String, Any?>> = when (val rawTransform = style["transform"]) {
        is List<*> -> rawTransform.mapNotNull { item ->
            (item as? Map<*, *>)?.entries?.associate { (k, v) -> k.toString() to v }
        }
        is Map<*, *> -> listOf(rawTransform.entries.associate { (k, v) -> k.toString() to v })
        else -> emptyList()
    }

    // Build modifier chain
    var m: Modifier = this

    // display:none → collapse to zero size
    if (display == "none") return m.size(0.dp)

    // Size constraints
    when (width) {
        is DimensionValue.Point -> m = m.width(width.value.dp)
        is DimensionValue.Percent -> m = m.fillMaxWidth(width.fraction)
        else -> {}
    }
    when (height) {
        is DimensionValue.Point -> m = m.height(height.value.dp)
        is DimensionValue.Percent -> m = m.fillMaxHeight(height.fraction)
        else -> {}
    }
    if (minWidth is DimensionValue.Point) m = m.widthIn(min = minWidth.value.dp)
    if (maxWidth is DimensionValue.Point) m = m.widthIn(max = maxWidth.value.dp)
    if (minHeight is DimensionValue.Point) m = m.heightIn(min = minHeight.value.dp)
    if (maxHeight is DimensionValue.Point) m = m.heightIn(max = maxHeight.value.dp)

    // Clip to border radius shape (before background to get rounded corners)
    if (shape != null) m = m.clip(shape)

    // Background
    if (bgColor != null) m = m.background(bgColor)

    // Per-side borders drawn behind content
    if (hasBorder) {
        m = m.drawBehind {
            if (borderTopW > 0f) {
                val sw = borderTopW.dp.toPx()
                drawLine(borderTopC, Offset(0f, sw / 2f), Offset(size.width, sw / 2f), sw)
            }
            if (borderBottomW > 0f) {
                val sw = borderBottomW.dp.toPx()
                drawLine(
                    borderBottomC,
                    Offset(0f, size.height - sw / 2f),
                    Offset(size.width, size.height - sw / 2f),
                    sw
                )
            }
            if (borderLeftW > 0f) {
                val sw = borderLeftW.dp.toPx()
                drawLine(borderLeftC, Offset(sw / 2f, 0f), Offset(sw / 2f, size.height), sw)
            }
            if (borderRightW > 0f) {
                val sw = borderRightW.dp.toPx()
                drawLine(
                    borderRightC,
                    Offset(size.width - sw / 2f, 0f),
                    Offset(size.width - sw / 2f, size.height),
                    sw
                )
            }
        }
    }

    // Inner padding
    val pT = (paddingTop as? DimensionValue.Point)?.value ?: 0f
    val pL = (paddingLeft as? DimensionValue.Point)?.value ?: 0f
    val pR = (paddingRight as? DimensionValue.Point)?.value ?: 0f
    val pB = (paddingBottom as? DimensionValue.Point)?.value ?: 0f
    if (pT > 0f || pL > 0f || pR > 0f || pB > 0f) {
        m = m.padding(start = pL.dp, top = pT.dp, end = pR.dp, bottom = pB.dp)
    }

    // Transforms via graphicsLayer
    if (transforms.isNotEmpty()) {
        m = m.graphicsLayer {
            for (t in transforms) {
                (t["scale"] as? Number)?.toFloat()?.let { v -> scaleX = v; scaleY = v }
                (t["scaleX"] as? Number)?.toFloat()?.let { scaleX = it }
                (t["scaleY"] as? Number)?.toFloat()?.let { scaleY = it }
                (t["perspective"] as? Number)?.toFloat()?.let { cameraDistance = it }
                (t["rotate"] as? String)?.let { parseAngleDeg(it)?.let { d -> rotationZ = d } }
                (t["rotateX"] as? String)?.let { parseAngleDeg(it)?.let { d -> rotationX = d } }
                (t["rotateY"] as? String)?.let { parseAngleDeg(it)?.let { d -> rotationY = d } }
                (t["rotateZ"] as? String)?.let { parseAngleDeg(it)?.let { d -> rotationZ = d } }
                t["translateX"]?.let { v ->
                    translationX = when (val d = DimensionValue.parse(v)) {
                        is DimensionValue.Point -> d.value.dp.toPx()
                        is DimensionValue.Percent -> d.fraction * size.width
                        else -> translationX
                    }
                }
                t["translateY"]?.let { v ->
                    translationY = when (val d = DimensionValue.parse(v)) {
                        is DimensionValue.Point -> d.value.dp.toPx()
                        is DimensionValue.Percent -> d.fraction * size.height
                        else -> translationY
                    }
                }
            }
        }
    }

    // Relative position offset
    if (position == "relative") {
        val offsetX = when (val l = left) {
            is DimensionValue.Point -> l.value.dp
            else -> when (val r = right) {
                is DimensionValue.Point -> (-r.value).dp
                else -> 0.dp
            }
        }
        val offsetY = when (val t = top) {
            is DimensionValue.Point -> t.value.dp
            else -> when (val b = bottom) {
                is DimensionValue.Point -> (-b.value).dp
                else -> 0.dp
            }
        }
        if (offsetX != 0.dp || offsetY != 0.dp) m = m.offset(offsetX, offsetY)
    }

    // Margin as outer padding
    val mT = (marginTop as? DimensionValue.Point)?.value ?: 0f
    val mL = (marginLeft as? DimensionValue.Point)?.value ?: 0f
    val mR = (marginRight as? DimensionValue.Point)?.value ?: 0f
    val mB = (marginBottom as? DimensionValue.Point)?.value ?: 0f
    if (mT > 0f || mL > 0f || mR > 0f || mB > 0f) {
        m = m.padding(start = mL.dp, top = mT.dp, end = mR.dp, bottom = mB.dp)
    }

    // Opacity
    if (opacity != 1f) m = m.alpha(opacity)

    // Z-index
    if (zIndexVal != null) m = m.zIndex(zIndexVal)

    return m
}

private fun buildStyledText(text: Any?): AnnotatedString {
    if (text == null || text is String) {
        return AnnotatedString(text ?: "")
    }
    if (text is Map<*, *>) {
        val style = text["style"] as? Map<*, *> ?: emptyMap<Any?, Any?>()
        val children = text["children"] as? List<*> ?: emptyList<Any?>()
        return buildAnnotatedString {
            for (child in children) {
                val childText = buildStyledText(child)
                append(childText)
            }
        }
    }
    return AnnotatedString("")
}

@Composable
fun FTView(
    nodeId: String,
    props: Map<String, Any?>,
    handler: (ComponentHandler) -> Unit,
    content: @Composable () -> Unit
) {
    Column(modifier = Modifier.applyViewProps(props)) {
        content()
    }
}

@Composable
fun FTImageView(
    nodeId: String,
    props: Map<String, Any?>,
    handler: (ComponentHandler) -> Unit,
    content: @Composable () -> Unit
) {
}

@Composable
fun FTTextView(
    nodeId: String,
    props: Map<String, Any?>,
    handler: (ComponentHandler) -> Unit,
    content: @Composable () -> Unit
) {
    Text(
        text = buildStyledText(props["text"]),
        modifier = Modifier.applyViewProps(props)
    )
}

@Composable
fun FTTextInput(
    nodeId: String,
    props: Map<String, Any?>,
    handler: (ComponentHandler) -> Unit,
    content: @Composable () -> Unit
) {
    val value = props["value"] as? String
    if (value != null) {
        BasicTextField(
            value = value,
            onValueChange = {  },
            modifier = Modifier.applyViewProps(props)
        )
    }
}

@Composable
fun FTScrollView(
    nodeId: String,
    props: Map<String, Any?>,
    handler: (ComponentHandler) -> Unit,
    content: @Composable () -> Unit
) {
    DisposableEffect(nodeId) {
        onDispose {
        }
    }
    Column(modifier = Modifier.applyViewProps(props)) {
        content()
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