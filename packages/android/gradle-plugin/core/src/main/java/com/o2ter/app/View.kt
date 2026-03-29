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

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowColumn
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.clipToBounds
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.RoundRect
import androidx.compose.ui.graphics.Paint
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.layout.Layout
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.zIndex
import kotlin.math.PI
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import androidx.core.graphics.toColorInt
import androidx.compose.ui.graphics.Shadow
import androidx.compose.ui.text.ParagraphStyle
import androidx.compose.ui.text.SpanStyle
import androidx.compose.runtime.compositionLocalOf
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.sp

// Provides a weight-modifier factory captured inside a RowScope or ColumnScope so that
// child FTView nodes can apply Modifier.weight() correctly without needing scope access.
private val LocalFlexModifierFactory = compositionLocalOf<((Float) -> Modifier)?> { null }

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
            8 -> {
                // Color normalizer outputs #RRGGBBAA format
                val v = trimmed.toLong(16)
                Color(
                    red = ((v shr 24) and 0xFF).toInt() / 255f,
                    green = ((v shr 16) and 0xFF).toInt() / 255f,
                    blue = ((v shr 8) and 0xFF).toInt() / 255f,
                    alpha = (v and 0xFF).toInt() / 255f
                )
            }
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
    props: Map<String, Any?>,
    fillWidth: Boolean = false
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

    // Box shadows
    val boxShadows: List<Map<String, Any?>> = when (val rawShadow = style["boxShadow"]) {
        is List<*> -> rawShadow.mapNotNull { item ->
            (item as? Map<*, *>)?.entries?.associate { (k, v) -> k.toString() to v }
        }
        is Map<*, *> -> listOf(rawShadow.entries.associate { (k, v) -> k.toString() to v })
        else -> emptyList()
    }

    // Build modifier chain
    var m: Modifier = this

    // display:none → collapse to zero size
    if (display == "none") return m.size(0.dp)

    // Margin as outer spacing — must be outermost in the chain (before size/background)
    // so it creates space OUTSIDE the visual element, not inside it.
    val mT = (marginTop as? DimensionValue.Point)?.value ?: 0f
    val mL = (marginLeft as? DimensionValue.Point)?.value ?: 0f
    val mR = (marginRight as? DimensionValue.Point)?.value ?: 0f
    val mB = (marginBottom as? DimensionValue.Point)?.value ?: 0f
    if (mT > 0f || mL > 0f || mR > 0f || mB > 0f) {
        m = m.padding(start = mL.dp, top = mT.dp, end = mR.dp, bottom = mB.dp)
    }

    // Box shadows — drawn before clip so they appear behind the view content
    if (boxShadows.isNotEmpty()) {
        m = m.drawBehind {
            for (shadow in boxShadows) {
                val isInset = shadow["inset"] as? Boolean ?: false
                if (isInset) continue
                val shadowColor = parseHexColor((shadow["color"] as? String)) ?: Color.Black.copy(alpha = 0.3f)
                val offsetX = (shadow["offsetX"] as? Number)?.toFloat() ?: 0f
                val offsetY = (shadow["offsetY"] as? Number)?.toFloat() ?: 0f
                val blurDp = (shadow["blurRadius"] as? Number)?.toFloat() ?: 0f
                val offsetXPx = offsetX.dp.toPx()
                val offsetYPx = offsetY.dp.toPx()
                val blurPx = blurDp.dp.toPx().coerceAtLeast(0.01f)
                val paint = Paint().also {
                    it.asFrameworkPaint().apply {
                        isAntiAlias = true
                        color = android.graphics.Color.argb(
                            (shadowColor.alpha * 255).toInt(),
                            (shadowColor.red * 255).toInt(),
                            (shadowColor.green * 255).toInt(),
                            (shadowColor.blue * 255).toInt()
                        )
                        maskFilter = android.graphics.BlurMaskFilter(blurPx, android.graphics.BlurMaskFilter.Blur.NORMAL)
                    }
                }
                drawIntoCanvas { canvas ->
                    if (hasBorderRadius) {
                        canvas.drawRoundRect(
                            offsetXPx, offsetYPx,
                            size.width + offsetXPx, size.height + offsetYPx,
                            topLeftRadius.dp.toPx(), topLeftRadius.dp.toPx(),
                            paint
                        )
                    } else {
                        canvas.drawRect(offsetXPx, offsetYPx, size.width + offsetXPx, size.height + offsetYPx, paint)
                    }
                }
            }
        }
    }

    // Size constraints
    when (width) {
        is DimensionValue.Point -> m = m.width(width.value.dp)
        is DimensionValue.Percent -> m = m.fillMaxWidth(width.fraction)
        else -> if (fillWidth) m = m.fillMaxWidth()
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

    // Opacity: applied before clip/background/borders so all visual layers are inside the graphics layer
    if (opacity != 1f) m = m.graphicsLayer { alpha = opacity }

    // Clip to border radius shape (before background to get rounded corners)
    if (shape != null) m = m.clip(shape)

    // Background
    if (bgColor != null) m = m.background(bgColor)

    // Per-side borders drawn behind content
    if (hasBorder) {
        m = m.drawBehind {
            if (hasBorderRadius) {
                // Rounded border: draw a stroked path following the rounded rectangle shape
                val isUniformBorder = borderTopW == borderBottomW && borderBottomW == borderLeftW
                    && borderLeftW == borderRightW && borderTopC == borderBottomC
                    && borderBottomC == borderLeftC && borderLeftC == borderRightC
                if (isUniformBorder && borderTopW > 0f) {
                    val sw = borderTopW.dp.toPx()
                    val path = Path().apply {
                        addRoundRect(
                            RoundRect(
                                left = 0f, top = 0f,
                                right = size.width, bottom = size.height,
                                topLeftCornerRadius = CornerRadius(topLeftRadius.dp.toPx()),
                                topRightCornerRadius = CornerRadius(topRightRadius.dp.toPx()),
                                bottomRightCornerRadius = CornerRadius(bottomRightRadius.dp.toPx()),
                                bottomLeftCornerRadius = CornerRadius(bottomLeftRadius.dp.toPx())
                            )
                        )
                    }
                    drawPath(path, borderTopC, style = Stroke(width = sw))
                } else {
                    // Per-side border on a rounded view: draw straight lines (approximate)
                    if (borderTopW > 0f) {
                        val sw = borderTopW.dp.toPx()
                        drawLine(borderTopC, Offset(0f, sw / 2f), Offset(size.width, sw / 2f), sw)
                    }
                    if (borderBottomW > 0f) {
                        val sw = borderBottomW.dp.toPx()
                        drawLine(borderBottomC, Offset(0f, size.height - sw / 2f), Offset(size.width, size.height - sw / 2f), sw)
                    }
                    if (borderLeftW > 0f) {
                        val sw = borderLeftW.dp.toPx()
                        drawLine(borderLeftC, Offset(sw / 2f, 0f), Offset(sw / 2f, size.height), sw)
                    }
                    if (borderRightW > 0f) {
                        val sw = borderRightW.dp.toPx()
                        drawLine(borderRightC, Offset(size.width - sw / 2f, 0f), Offset(size.width - sw / 2f, size.height), sw)
                    }
                }
            } else {
                // No radius: draw straight line borders
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

    // Z-index
    if (zIndexVal != null) m = m.zIndex(zIndexVal)

    return m
}

private fun parseTextSpanStyle(style: Map<String, Any?>): SpanStyle {
    val color = parseHexColor(style["color"]?.toString()) ?: Color.Unspecified

    val fontSize: TextUnit = when (val fs = style["fontSize"]) {
        is Number -> fs.toFloat().sp
        is String -> fs.toFloatOrNull()?.sp ?: TextUnit.Unspecified
        else -> TextUnit.Unspecified
    }

    val fontWeight: FontWeight? = when (val fw = style["fontWeight"]) {
        is Number -> FontWeight(fw.toInt().coerceIn(1, 1000))
        is String -> when (fw.lowercase()) {
            "bold" -> FontWeight.Bold
            "normal", "regular", "400" -> FontWeight.Normal
            "ultralight", "100" -> FontWeight.Thin
            "thin", "200" -> FontWeight.ExtraLight
            "light", "300" -> FontWeight.Light
            "medium", "500" -> FontWeight.Medium
            "semibold", "600" -> FontWeight.SemiBold
            "700" -> FontWeight.Bold
            "extrabold", "heavy", "800" -> FontWeight.ExtraBold
            "black", "condensedbold", "900" -> FontWeight.Black
            else -> null
        }
        else -> null
    }

    val fontStyle: FontStyle? = when ((style["fontStyle"] as? String)?.lowercase()) {
        "italic" -> FontStyle.Italic
        "normal" -> FontStyle.Normal
        else -> null
    }

    val letterSpacing: TextUnit = when (val ls = style["letterSpacing"]) {
        is Number -> ls.toFloat().sp
        is String -> if (ls == "normal") TextUnit.Unspecified
                     else ls.toFloatOrNull()?.sp ?: TextUnit.Unspecified
        else -> TextUnit.Unspecified
    }

    val decoLineValue = style["textDecorationLine"]
    val decorations = mutableListOf<TextDecoration>()
    when (decoLineValue) {
        is String -> {
            if (decoLineValue.contains("underline")) decorations += TextDecoration.Underline
            if (decoLineValue.contains("line-through")) decorations += TextDecoration.LineThrough
        }
        is List<*> -> for (d in decoLineValue) when (d as? String) {
            "underline" -> decorations += TextDecoration.Underline
            "line-through" -> decorations += TextDecoration.LineThrough
        }
    }
    val textDecoration = if (decorations.isNotEmpty()) TextDecoration.combine(decorations) else null

    val shadowColor = parseHexColor(style["textShadowColor"]?.toString())
    val shadow: Shadow? = if (shadowColor != null) {
        val offsetX = (style["textShadowOffsetX"] as? Number)?.toFloat() ?: 0f
        val offsetY = (style["textShadowOffsetY"] as? Number)?.toFloat() ?: 0f
        val blurRadius = (style["textShadowRadius"] as? Number)?.toFloat() ?: 0f
        Shadow(color = shadowColor, offset = Offset(offsetX, offsetY), blurRadius = blurRadius)
    } else null

    return SpanStyle(
        color = color,
        fontSize = fontSize,
        fontWeight = fontWeight,
        fontStyle = fontStyle,
        letterSpacing = letterSpacing,
        textDecoration = textDecoration,
        shadow = shadow
    )
}

private fun parseTextParagraphStyle(style: Map<String, Any?>): ParagraphStyle {
    val textAlign: TextAlign = when ((style["textAlign"] as? String)?.lowercase()) {
        "left" -> TextAlign.Left
        "right" -> TextAlign.Right
        "center" -> TextAlign.Center
        "justify" -> TextAlign.Justify
        "start" -> TextAlign.Start
        "end" -> TextAlign.End
        else -> TextAlign.Unspecified
    }
    val lineHeight: TextUnit = when (val lh = style["lineHeight"]) {
        is Number -> lh.toFloat().sp
        is String -> if (lh == "normal") TextUnit.Unspecified
                     else lh.toFloatOrNull()?.sp ?: TextUnit.Unspecified
        else -> TextUnit.Unspecified
    }
    return ParagraphStyle(textAlign = textAlign, lineHeight = lineHeight)
}

private fun applyTextTransform(raw: String, transform: String?): String = when (transform) {
    "uppercase" -> raw.uppercase()
    "lowercase" -> raw.lowercase()
    "capitalize" -> raw.split(" ").joinToString(" ") { word ->
        word.replaceFirstChar { if (it.isLowerCase()) it.titlecase() else it.toString() }
    }
    else -> raw
}

private fun buildStyledText(text: Any?, parentTransform: String? = null, isInline: Boolean = false): AnnotatedString {
    if (text == null || text is String) {
        return AnnotatedString(applyTextTransform(text ?: "", parentTransform))
    }
    if (text is Map<*, *>) {
        val style = text["style"] as? Map<*, *> ?: emptyMap<Any?, Any?>()
        val styleMap: Map<String, Any?> = style.entries.associate { (k, v) -> k.toString() to v }
        val children = text["children"] as? List<*> ?: emptyList<Any?>()
        val textTransform = (styleMap["textTransform"] as? String) ?: parentTransform
        return buildAnnotatedString {
            if (!isInline) {
                withStyle(parseTextParagraphStyle(styleMap)) {
                    withStyle(parseTextSpanStyle(styleMap)) {
                        for (child in children) {
                            append(buildStyledText(child, textTransform, isInline = true))
                        }
                    }
                }
            } else {
                withStyle(parseTextSpanStyle(styleMap)) {
                    for (child in children) {
                        append(buildStyledText(child, textTransform, isInline = true))
                    }
                }
            }
        }
    }
    return AnnotatedString("")
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun FTView(
    nodeId: String,
    props: Map<String, Any?>,
    handler: (ComponentHandler) -> Unit,
    content: @Composable () -> Unit
) {
    val rawStyle = props["style"] as? Map<*, *>
    val style: Map<String, Any?> = rawStyle?.entries?.associate { (k, v) -> k.toString() to v } ?: emptyMap()

    val flexDirection = style["flexDirection"]?.toString() ?: "column"
    val isRow = flexDirection.startsWith("row")
    val isReverse = flexDirection.endsWith("-reverse")
    val flexWrap = style["flexWrap"]?.toString() ?: "nowrap"
    val isWrap = flexWrap == "wrap" || flexWrap == "wrap-reverse"
    val justifyContent = style["justifyContent"]?.toString() ?: "flex-start"
    val alignItems = style["alignItems"]?.toString() ?: "flex-start"
    val columnGap = (style["columnGap"] as? Number)?.toFloat() ?: 0f
    val rowGap = (style["rowGap"] as? Number)?.toFloat() ?: 0f

    // In a reversed flex-direction flex-start and flex-end swap along the main axis.
    val effectiveJustify = if (isReverse) when (justifyContent) {
        "flex-start" -> "flex-end"
        "flex-end" -> "flex-start"
        else -> justifyContent
    } else justifyContent

    // Read flex weight provided by the parent container, then clear it for our own children.
    // Note: JS normalizes `flex` → `flexGrow` before sending to native, so we read flexGrow here.
    val parentFlexFactory = LocalFlexModifierFactory.current
    val selfFlex = (style["flexGrow"] as? Number)?.toFloat() ?: 0f
    val flexModifier = if (selfFlex > 0f && parentFlexFactory != null) parentFlexFactory(selfFlex) else Modifier

    if (isRow) {
        if (isWrap && !isReverse) {
            // FlowRow: items wrap to new rows when they exceed the container width.
            val horizontalArrangement: Arrangement.Horizontal = when (justifyContent) {
                "flex-end" -> if (columnGap > 0f) Arrangement.spacedBy(columnGap.dp, Alignment.End) else Arrangement.End
                "center" -> if (columnGap > 0f) Arrangement.spacedBy(columnGap.dp, Alignment.CenterHorizontally) else Arrangement.Center
                "space-between" -> Arrangement.SpaceBetween
                "space-around" -> Arrangement.SpaceAround
                "space-evenly" -> Arrangement.SpaceEvenly
                else -> if (columnGap > 0f) Arrangement.spacedBy(columnGap.dp) else Arrangement.Start
            }
            val verticalArrangement: Arrangement.Vertical =
                if (rowGap > 0f) Arrangement.spacedBy(rowGap.dp) else Arrangement.Top
            FlowRow(
                modifier = flexModifier.then(Modifier.applyViewProps(props, fillWidth = selfFlex <= 0f || parentFlexFactory == null)),
                horizontalArrangement = horizontalArrangement,
                verticalArrangement = verticalArrangement
            ) {
                CompositionLocalProvider(LocalFlexModifierFactory provides null) { content() }
            }
        } else if (isWrap && isReverse) {
            // row-reverse + wrap/wrap-reverse: custom Layout placing items right-to-left per row.
            val gapCol = columnGap.dp
            val gapRow = rowGap.dp
            Layout(
                modifier = flexModifier.then(Modifier.applyViewProps(props, fillWidth = selfFlex <= 0f || parentFlexFactory == null)),
                content = { CompositionLocalProvider(LocalFlexModifierFactory provides null) { content() } }
            ) { measurables, constraints ->
                val colGapPx = gapCol.roundToPx()
                val rowGapPx = gapRow.roundToPx()
                val placeables = measurables.map { it.measure(constraints.copy(minWidth = 0, minHeight = 0)) }

                data class RowGroup(val indices: List<Int>, val rowHeight: Int)
                val maxWidth = if (constraints.maxWidth == Int.MAX_VALUE) Int.MAX_VALUE else constraints.maxWidth
                val rowGroups = mutableListOf<RowGroup>()
                val cur = mutableListOf<Int>()
                var curW = 0; var curH = 0
                for (i in placeables.indices) {
                    val p = placeables[i]
                    val gap = if (cur.isEmpty()) 0 else colGapPx
                    if (cur.isNotEmpty() && maxWidth != Int.MAX_VALUE && curW + gap + p.width > maxWidth) {
                        rowGroups.add(RowGroup(cur.toList(), curH)); cur.clear(); curW = 0; curH = 0
                    }
                    if (cur.isNotEmpty()) curW += colGapPx
                    cur.add(i); curW += p.width; curH = maxOf(curH, p.height)
                }
                if (cur.isNotEmpty()) rowGroups.add(RowGroup(cur.toList(), curH))

                val layoutWidth = if (maxWidth == Int.MAX_VALUE) {
                    rowGroups.maxOfOrNull { g ->
                        g.indices.sumOf { placeables[it].width } + (g.indices.size - 1).coerceAtLeast(0) * colGapPx
                    } ?: 0
                } else maxWidth
                val totalRowH = rowGroups.sumOf { it.rowHeight } +
                    (rowGroups.size - 1).coerceAtLeast(0) * rowGapPx
                val layoutHeight = totalRowH.coerceIn(constraints.minHeight,
                    if (constraints.maxHeight == Int.MAX_VALUE) Int.MAX_VALUE else constraints.maxHeight)

                // wrap-reverse: first row at the bottom; wrap (default): first row at the top.
                val rowYPositions: List<Int> = if (flexWrap == "wrap-reverse") {
                    val positions = mutableListOf<Int>(); var y = layoutHeight
                    for (g in rowGroups) { y -= g.rowHeight; positions.add(y); y -= rowGapPx }
                    positions
                } else {
                    val positions = mutableListOf<Int>(); var y = 0
                    for (g in rowGroups) { positions.add(y); y += g.rowHeight + rowGapPx }
                    positions
                }

                layout(layoutWidth, layoutHeight) {
                    for ((ri, group) in rowGroups.withIndex()) {
                        val rowY = rowYPositions[ri]; val rowH = group.rowHeight
                        // Reverse within each row so item[0] is rightmost.
                        val reversed = group.indices.map { placeables[it] }.reversed()
                        val contentW = reversed.sumOf { it.width } +
                            (reversed.size - 1).coerceAtLeast(0) * colGapPx
                        val extra = (layoutWidth - contentW).coerceAtLeast(0)
                        var x: Int; var spacer = 0
                        when (effectiveJustify) {
                            "flex-end" -> { x = extra; spacer = 0 }
                            "center" -> { x = extra / 2; spacer = 0 }
                            "space-between" -> { x = 0; spacer = if (reversed.size > 1) extra / (reversed.size - 1) else 0 }
                            "space-around" -> { val u = if (reversed.isNotEmpty()) extra / reversed.size else 0; x = u / 2; spacer = u }
                            "space-evenly" -> { val u = extra / (reversed.size + 1); x = u; spacer = u }
                            else -> { x = 0; spacer = 0 }
                        }
                        for (p in reversed) {
                            val y = when (alignItems) {
                                "flex-end" -> rowY + rowH - p.height
                                "center" -> rowY + (rowH - p.height) / 2
                                else -> rowY
                            }
                            p.placeRelative(x, y); x += p.width + colGapPx + spacer
                        }
                    }
                }
            }
        } else {
            if (!isReverse) {
                // Standard row: children in source order, left-to-right.
                val horizontalArrangement: Arrangement.Horizontal = when (justifyContent) {
                    "flex-end" -> if (columnGap > 0f) Arrangement.spacedBy(columnGap.dp, Alignment.End) else Arrangement.End
                    "center" -> if (columnGap > 0f) Arrangement.spacedBy(columnGap.dp, Alignment.CenterHorizontally) else Arrangement.Center
                    "space-between" -> Arrangement.SpaceBetween
                    "space-around" -> Arrangement.SpaceAround
                    "space-evenly" -> Arrangement.SpaceEvenly
                    else -> if (columnGap > 0f) Arrangement.spacedBy(columnGap.dp) else Arrangement.Start
                }
                val verticalAlignment: Alignment.Vertical = when (alignItems) {
                    "flex-end" -> Alignment.Bottom
                    "center" -> Alignment.CenterVertically
                    else -> Alignment.Top
                }
                Row(
                    modifier = flexModifier.then(Modifier.applyViewProps(props, fillWidth = selfFlex <= 0f || parentFlexFactory == null)),
                    horizontalArrangement = horizontalArrangement,
                    verticalAlignment = verticalAlignment
                ) {
                    CompositionLocalProvider(LocalFlexModifierFactory provides { flex -> Modifier.weight(flex) }) {
                        content()
                    }
                }
            } else {
                // row-reverse: custom Layout that places children in reversed order (right-to-left).
                // Item[0] appears at the far right; effectiveJustify already swaps flex-start/flex-end.
                val gap_col = columnGap.dp
                Layout(
                    modifier = flexModifier.then(Modifier.applyViewProps(props, fillWidth = selfFlex <= 0f || parentFlexFactory == null)),
                    content = { CompositionLocalProvider(LocalFlexModifierFactory provides null) { content() } }
                ) { measurables, constraints ->
                    val colGapPx = gap_col.roundToPx()
                    val stretchH = alignItems == "stretch" && constraints.maxHeight != Int.MAX_VALUE
                    val childConstraints = constraints.copy(
                        minWidth = 0,
                        minHeight = if (stretchH) constraints.maxHeight else 0
                    )
                    val placeables = measurables.map { it.measure(childConstraints) }
                    // Reverse so that item[0] is placed rightmost.
                    val reversed = placeables.reversed()

                    val totalContent = reversed.sumOf { it.width } +
                        (reversed.size - 1).coerceAtLeast(0) * colGapPx
                    val layoutWidth = if (constraints.maxWidth == Int.MAX_VALUE) totalContent
                                      else constraints.maxWidth
                    val layoutHeight = (reversed.maxOfOrNull { it.height } ?: 0)
                        .coerceIn(constraints.minHeight,
                            if (constraints.maxHeight == Int.MAX_VALUE) Int.MAX_VALUE else constraints.maxHeight)
                    val extra = (layoutWidth - totalContent).coerceAtLeast(0)

                    layout(layoutWidth, layoutHeight) {
                        // effectiveJustify: flex-start→flex-end, flex-end→flex-start (already swapped above)
                        var x: Int
                        var spacer = 0
                        when (effectiveJustify) {
                            "flex-end" -> { x = extra; spacer = 0 }
                            "center" -> { x = extra / 2; spacer = 0 }
                            "space-between" -> {
                                x = 0
                                spacer = if (reversed.size > 1) extra / (reversed.size - 1) else 0
                            }
                            "space-around" -> {
                                val unit = if (reversed.isNotEmpty()) extra / reversed.size else 0
                                x = unit / 2; spacer = unit
                            }
                            "space-evenly" -> {
                                val unit = extra / (reversed.size + 1)
                                x = unit; spacer = unit
                            }
                            else -> { x = 0; spacer = 0 }
                        }
                        for (p in reversed) {
                            val y = when (alignItems) {
                                "flex-end" -> layoutHeight - p.height
                                "center" -> (layoutHeight - p.height) / 2
                                else -> 0
                            }
                            p.placeRelative(x, y)
                            x += p.width + colGapPx + spacer
                        }
                    }
                }
            }
        }
    } else {
        if (!isWrap && !isReverse) {
            // Standard column (original code path — preserves flex-weight support).
            val verticalArrangement: Arrangement.Vertical = when (justifyContent) {
                "flex-end" -> if (rowGap > 0f) Arrangement.spacedBy(rowGap.dp, Alignment.Bottom) else Arrangement.Bottom
                "center" -> if (rowGap > 0f) Arrangement.spacedBy(rowGap.dp, Alignment.CenterVertically) else Arrangement.Center
                "space-between" -> Arrangement.SpaceBetween
                "space-around" -> Arrangement.SpaceAround
                "space-evenly" -> Arrangement.SpaceEvenly
                else -> if (rowGap > 0f) Arrangement.spacedBy(rowGap.dp) else Arrangement.Top
            }
            val horizontalAlignment: Alignment.Horizontal = when (alignItems) {
                "flex-end" -> Alignment.End
                "center" -> Alignment.CenterHorizontally
                else -> Alignment.Start
            }
            Column(
                modifier = flexModifier.then(Modifier.applyViewProps(props, fillWidth = true)),
                verticalArrangement = verticalArrangement,
                horizontalAlignment = horizontalAlignment
            ) {
                CompositionLocalProvider(LocalFlexModifierFactory provides { flex -> Modifier.weight(flex) }) {
                    content()
                }
            }
        } else {
            // column + wrap, column + wrap-reverse, column-reverse +-nowrap/wrap:
            // Use a custom Layout that measures children and places them according to
            // CSS flex-direction:column with optional wrap and/or reverse.
            val gap_row = rowGap.dp
            val gap_col = columnGap.dp
            Layout(
                modifier = flexModifier.then(Modifier.applyViewProps(props, fillWidth = true)),
                content = { CompositionLocalProvider(LocalFlexModifierFactory provides null) { content() } }
            ) { measurables, constraints ->
                val rowGapPx = gap_row.roundToPx()
                val colGapPx = gap_col.roundToPx()
                val stretch = alignItems == "stretch"
                val measureW = if (stretch) constraints.maxWidth else 0
                val childConstraints = constraints.copy(
                    minWidth = measureW.coerceAtMost(if (constraints.maxWidth == Int.MAX_VALUE) 0 else constraints.maxWidth),
                    minHeight = 0)
                val placeables = measurables.map { it.measure(childConstraints) }

                // Group children into columns, filling top-to-bottom.
                // For column-reverse the visual order is reversed but the wrap grouping
                // uses the ORIGINAL order so item[0] ends up at the bottom of its column.
                data class ColGroup(val indices: List<Int>, val colWidth: Int)

                val maxHeight = if (constraints.maxHeight == Int.MAX_VALUE) Int.MAX_VALUE else constraints.maxHeight

                val colGroups = mutableListOf<ColGroup>()
                val cur = mutableListOf<Int>()
                var curH = 0
                var curW = 0
                for (i in placeables.indices) {
                    val p = placeables[i]
                    val gap = if (cur.isEmpty()) 0 else rowGapPx
                    if (isWrap && cur.isNotEmpty() && maxHeight != Int.MAX_VALUE
                        && curH + gap + p.height > maxHeight) {
                        colGroups.add(ColGroup(cur.toList(), curW))
                        cur.clear(); curH = 0; curW = 0
                    }
                    if (cur.isNotEmpty()) curH += rowGapPx
                    cur.add(i); curH += p.height
                    curW = maxOf(curW, p.width)
                }
                if (cur.isNotEmpty()) colGroups.add(ColGroup(cur.toList(), curW))

                // Determine total layout dimensions.
                val totalColWidths = colGroups.sumOf { it.colWidth }
                val totalColGaps = (colGroups.size - 1).coerceAtLeast(0) * colGapPx
                val layoutWidth = if (constraints.maxWidth == Int.MAX_VALUE)
                    totalColWidths + totalColGaps
                else constraints.maxWidth
                val layoutHeight = if (maxHeight == Int.MAX_VALUE) {
                    (colGroups.maxOfOrNull { g ->
                        g.indices.sumOf { placeables[it].height } +
                            (g.indices.size - 1).coerceAtLeast(0) * rowGapPx
                    } ?: 0).coerceAtLeast(constraints.minHeight)
                } else maxHeight

                // Apply wrap-reverse: columns fill from the right side instead of left.
                val colXPositions: List<Int> =
                    if (flexWrap == "wrap-reverse") {
                        val positions = mutableListOf<Int>()
                        var x = layoutWidth
                        for (g in colGroups) { x -= g.colWidth; positions.add(x); x -= colGapPx }
                        positions
                    } else {
                        val positions = mutableListOf<Int>()
                        var x = 0
                        for (g in colGroups) { positions.add(x); x += g.colWidth + colGapPx }
                        positions
                    }

                layout(layoutWidth, layoutHeight) {
                    for ((gi, group) in colGroups.withIndex()) {
                        val colX = colXPositions[gi]
                        val colWidth = group.colWidth
                        val colItems = group.indices.map { placeables[it] }

                        val totalItemH = colItems.sumOf { it.height }
                        val totalGapsH = (colItems.size - 1).coerceAtLeast(0) * rowGapPx
                        val contentH = totalItemH + totalGapsH
                        val extra = (layoutHeight - contentH).coerceAtLeast(0)

                        // Place items; for column-reverse item[0] is at the bottom so
                        // we iterate in original order placing bottom-to-top.
                        if (isReverse) {
                            // effectiveJustify already swapped: flex-end → cluster at bottom.
                            when (effectiveJustify) {
                                "space-between" -> {
                                    val spacer = if (colItems.size > 1) extra / (colItems.size - 1) else 0
                                    var y = layoutHeight
                                    for ((idx, p) in colItems.withIndex()) {
                                        y -= p.height
                                        val x = colX + crossAlignOffset(p.width, colWidth, alignItems)
                                        p.placeRelative(x, y)
                                        if (idx < colItems.size - 1) y -= rowGapPx + spacer
                                    }
                                }
                                "space-around" -> {
                                    val unit = if (colItems.isNotEmpty()) extra / colItems.size else 0
                                    var y = layoutHeight - unit / 2
                                    for (p in colItems) {
                                        y -= p.height
                                        val x = colX + crossAlignOffset(p.width, colWidth, alignItems)
                                        p.placeRelative(x, y)
                                        y -= rowGapPx + unit
                                    }
                                }
                                "space-evenly" -> {
                                    val unit = extra / (colItems.size + 1)
                                    var y = layoutHeight - unit
                                    for (p in colItems) {
                                        y -= p.height
                                        val x = colX + crossAlignOffset(p.width, colWidth, alignItems)
                                        p.placeRelative(x, y)
                                        y -= rowGapPx + unit
                                    }
                                }
                                "flex-start" -> {
                                    // Original flex-end (swapped): cluster at top.
                                    // item[n-1] at y=0, item[0] at y=contentH-height[0].
                                    var y = contentH
                                    for (p in colItems) {
                                        y -= p.height
                                        val x = colX + crossAlignOffset(p.width, colWidth, alignItems)
                                        p.placeRelative(x, y)
                                        y -= rowGapPx
                                    }
                                }
                                "center" -> {
                                    var y = (layoutHeight + contentH) / 2
                                    for (p in colItems) {
                                        y -= p.height
                                        val x = colX + crossAlignOffset(p.width, colWidth, alignItems)
                                        p.placeRelative(x, y)
                                        y -= rowGapPx
                                    }
                                }
                                else -> {
                                    // flex-end (from original flex-start): cluster at bottom.
                                    var y = layoutHeight
                                    for (p in colItems) {
                                        y -= p.height
                                        val x = colX + crossAlignOffset(p.width, colWidth, alignItems)
                                        p.placeRelative(x, y)
                                        y -= rowGapPx
                                    }
                                }
                            }
                        } else {
                            // Normal column (top-to-bottom) — just with wrap support.
                            var y: Int
                            val spacerBetween: Int
                            when (effectiveJustify) {
                                "flex-end" -> { y = extra; spacerBetween = 0 }
                                "center" -> { y = extra / 2; spacerBetween = 0 }
                                "space-between" -> {
                                    y = 0
                                    spacerBetween = if (colItems.size > 1) extra / (colItems.size - 1) else 0
                                }
                                "space-around" -> {
                                    val unit = if (colItems.isNotEmpty()) extra / colItems.size else 0
                                    y = unit / 2; spacerBetween = unit
                                }
                                "space-evenly" -> {
                                    val unit = extra / (colItems.size + 1)
                                    y = unit; spacerBetween = unit
                                }
                                else -> { y = 0; spacerBetween = 0 }
                            }
                            for ((idx, p) in colItems.withIndex()) {
                                val x = colX + crossAlignOffset(p.width, colWidth, alignItems)
                                p.placeRelative(x, y)
                                y += p.height + rowGapPx + spacerBetween
                            }
                        }
                    }
                }
            }
        }
    }
}

/** Returns the horizontal offset for a child within a column based on alignItems. */
private fun crossAlignOffset(childWidth: Int, colWidth: Int, alignItems: String): Int =
    when (alignItems) {
        "flex-end" -> colWidth - childWidth
        "center" -> (colWidth - childWidth) / 2
        else -> 0  // flex-start, stretch (stretch is handled at measure time)
    }

@Composable
private fun rememberUrlBitmap(url: String): ImageBitmap? {
    var bitmap by remember(url) { mutableStateOf<ImageBitmap?>(null) }
    LaunchedEffect(url) {
        withContext(Dispatchers.IO) {
            try {
                val connection = java.net.URL(url).openConnection() as java.net.HttpURLConnection
                connection.connect()
                val stream = connection.inputStream
                val androidBitmap = android.graphics.BitmapFactory.decodeStream(stream)
                stream.close()
                bitmap = androidBitmap?.asImageBitmap()
            } catch (_: Exception) {
                // Fail silently, show placeholder
            }
        }
    }
    return bitmap
}

@Composable
fun FTImageView(
    nodeId: String,
    props: Map<String, Any?>,
    handler: (ComponentHandler) -> Unit,
    content: @Composable () -> Unit
) {
    val source = props["source"] as? String
    val bitmap = if (source != null) rememberUrlBitmap(source) else null

    Box(modifier = Modifier.applyViewProps(props)) {
        if (bitmap != null) {
            Image(
                bitmap = bitmap,
                contentDescription = null,
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Fit
            )
        } else if (source != null) {
            // Loading placeholder
            Box(modifier = Modifier.fillMaxSize())
        }
    }
}

@Composable
fun FTTextView(
    nodeId: String,
    props: Map<String, Any?>,
    handler: (ComponentHandler) -> Unit,
    content: @Composable () -> Unit
) {
    Box(modifier = Modifier.applyViewProps(props, fillWidth = true)) {
        Text(
            text = buildStyledText(props["text"]),
            modifier = Modifier.fillMaxWidth()
        )
    }
}

@Composable
fun FTTextInput(
    nodeId: String,
    props: Map<String, Any?>,
    handler: (ComponentHandler) -> Unit,
    content: @Composable () -> Unit
) {
    val value = props["value"] as? String ?: ""
    BasicTextField(
        value = value,
        onValueChange = { },
        modifier = Modifier.applyViewProps(props, fillWidth = true)
    )
}

@Composable
fun FTScrollView(
    nodeId: String,
    props: Map<String, Any?>,
    handler: (ComponentHandler) -> Unit,
    content: @Composable () -> Unit
) {
    val rawStyle = props["style"] as? Map<*, *>
    val style: Map<String, Any?> = rawStyle?.entries?.associate { (k, v) -> k.toString() to v } ?: emptyMap()

    val horizontal = props["horizontal"] as? Boolean ?: false
    val vertical = props["vertical"] as? Boolean ?: false
    // Default to vertical scroll when neither or both are specified
    val isHorizontalOnly = horizontal && !vertical

    val columnGap = (style["columnGap"] as? Number)?.toFloat() ?: 0f
    val rowGap = (style["rowGap"] as? Number)?.toFloat() ?: 0f

    // The Box carries the outer size/style constraints and clips overflow.
    // The inner Row/Column carries the scroll so it can measure unlimited content.
    Box(modifier = Modifier.applyViewProps(props, fillWidth = true).clipToBounds()) {
        if (isHorizontalOnly) {
            Row(
                modifier = Modifier.horizontalScroll(rememberScrollState()),
                horizontalArrangement = if (columnGap > 0f) Arrangement.spacedBy(columnGap.dp) else Arrangement.Start
            ) {
                content()
            }
        } else {
            Column(
                modifier = Modifier.fillMaxWidth().verticalScroll(rememberScrollState()),
                verticalArrangement = if (rowGap > 0f) Arrangement.spacedBy(rowGap.dp) else Arrangement.Top
            ) {
                content()
            }
        }
    }
}
