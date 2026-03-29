//
//  view.swift
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

// Color extension for hex string support
extension Color {
    init(hexString: String) {
        let hex = hexString.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a: UInt64
        let r: UInt64
        let g: UInt64
        let b: UInt64
        switch hex.count {
        case 3:  // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6:  // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:  // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// JSValue helper extension for type conversions
fileprivate extension JSValue {

    /// Converts JSValue dictionary to [String: Any] by filtering out non-string keys
    func toStringKeyedDictionary() -> [String: Any]? {
        guard let dict = self.toDictionary() else { return nil }
        return dict.reduce(into: [String: Any]()) { result, pair in
            if let key = pair.key as? String {
                result[key] = pair.value
            }
        }
    }

    func toJSValueArray() -> [JSValue]? {
        guard self.isArray else { return nil }
        var result: [JSValue] = []
        let length = self.objectForKeyedSubscript("length").toInt32()
        for i in 0..<length {
            if let item = self.objectAtIndexedSubscript(Int(i)) {
                result.append(item)
            }
        }
        return result
    }
}

extension AttributedString {

    fileprivate static func parseTextDecorationLines(_ value: Any?) -> [String] {
        if let str = value as? String { return [str] }
        if let arr = value as? [Any] { return arr.compactMap { $0 as? String } }
        return []
    }

    fileprivate static func parseFontWeight(_ value: Any?) -> Font.Weight {
        if let n = value as? Double {
            switch Int(n) {
            case ..<150: return .ultraLight
            case ..<250: return .thin
            case ..<350: return .light
            case ..<450: return .regular
            case ..<550: return .medium
            case ..<650: return .semibold
            case ..<750: return .bold
            case ..<850: return .heavy
            default: return .black
            }
        }
        switch (value as? String ?? "").lowercased() {
        case "bold": return .bold
        case "ultralight", "100": return .ultraLight
        case "thin", "200": return .thin
        case "light", "300": return .light
        case "medium", "500": return .medium
        case "semibold", "600": return .semibold
        case "700": return .bold
        case "heavy", "extrabold", "800": return .heavy
        case "black", "condensedbold", "900": return .black
        default: return .regular
        }
    }

    fileprivate static func applyTextStyle(_ style: [String: Any], to str: inout AttributedString) {
        var container = AttributeContainer()

        // Font: only build when at least one font property is specified
        let fontFamilies: [String]
        if let family = style["fontFamily"] as? String {
            fontFamilies = [family]
        } else if let families = style["fontFamily"] as? [String] {
            fontFamilies = families
        } else {
            fontFamilies = []
        }
        let fontSizeProp = style["fontSize"]
        let fontWeightProp = style["fontWeight"]
        let fontStyleProp = style["fontStyle"]
        let fontSize: CGFloat?
        if let num = fontSizeProp as? Double {
            fontSize = CGFloat(num)
        } else if let s = fontSizeProp as? String, let dim = DimensionValue(s),
            case .point(let p) = dim
        {
            fontSize = p
        } else {
            fontSize = nil
        }
        if !fontFamilies.isEmpty || fontSize != nil || fontWeightProp != nil || fontStyleProp != nil
        {
            var font: Font
            if let family = fontFamilies.first, let size = fontSize {
                font = Font.custom(family, size: size)
            } else if let family = fontFamilies.first {
                font = Font.custom(family, size: 17)
            } else if let size = fontSize {
                font = Font.system(size: size)
            } else {
                font = Font.body
            }
            if fontWeightProp != nil {
                font = font.weight(parseFontWeight(fontWeightProp))
            }
            if (fontStyleProp as? String) == "italic" {
                font = font.italic()
            }
            container.font = font
        }

        // Color
        if let hex = style["color"] as? String {
            container.foregroundColor = Color(hexString: hex)
        }

        // Letter spacing (kern)
        if let kern = style["letterSpacing"] {
            var kernValue: CGFloat = 0
            if let num = kern as? Double {
                kernValue = CGFloat(num)
            } else if let s = kern as? String, s != "normal",
                let dim = DimensionValue(s), case .point(let p) = dim
            {
                kernValue = p
            }
            container.kern = kernValue
        }

        // Text decoration
        let decoLines = parseTextDecorationLines(style["textDecorationLine"])
        let decoColor: Color? = (style["textDecorationColor"] as? String).map {
            Color(hexString: $0)
        }
        let decoPattern: Text.LineStyle.Pattern
        switch (style["textDecorationStyle"] as? String ?? "solid").lowercased() {
        case "dotted": decoPattern = .dot
        case "dashed": decoPattern = .dash
        default: decoPattern = .solid
        }
        if decoLines.contains("underline") {
            container.underlineStyle = Text.LineStyle(pattern: decoPattern, color: decoColor)
        }
        if decoLines.contains("line-through") {
            container.strikethroughStyle = Text.LineStyle(pattern: decoPattern, color: decoColor)
        }

        // Baseline offset for verticalAlign
        if let num = style["verticalAlign"] as? Double, num != 0 {
            container.baselineOffset = CGFloat(num)
        } else if let s = style["verticalAlign"] as? String {
            switch s {
            case "super": container.baselineOffset = 6
            case "sub": container.baselineOffset = -6
            default: break
            }
        }

        // Children's explicitly set attributes take priority over parent's
        str.mergeAttributes(container, mergePolicy: .keepCurrent)
    }

    fileprivate static func applyTextTransform(_ transform: String, to str: inout AttributedString)
    {
        var result = AttributedString()
        for run in str.runs {
            let chars = String(str[run.range].characters)
            let transformed: String
            switch transform {
            case "uppercase":
                transformed = chars.uppercased()
            case "lowercase":
                transformed = chars.lowercased()
            case "capitalize":
                var out = ""
                var newWord = true
                for c in chars {
                    if c.isWhitespace {
                        out.append(c)
                        newWord = true
                    } else if newWord {
                        out += String(c).uppercased()
                        newWord = false
                    } else {
                        out.append(c)
                    }
                }
                transformed = out
            default:
                transformed = chars
            }
            var newRun = AttributedString(transformed)
            newRun.mergeAttributes(run.attributes, mergePolicy: .keepNew)
            result += newRun
        }
        str = result
    }

    fileprivate static func decode(_ text: JSValue) -> AttributedString {
        if text.isString {
            return AttributedString(text.toString() ?? "")
        }
        let style = text.objectForKeyedSubscript("style")?.toStringKeyedDictionary() ?? [:]
        let children = text.objectForKeyedSubscript("children")?.toJSValueArray()?.map(AttributedString.decode) ?? []
        var concated = children.reduce(AttributedString(""), +)
        if let textTransform = style["textTransform"] as? String, textTransform != "none" {
            applyTextTransform(textTransform, to: &concated)
        }
        applyTextStyle(style, to: &concated)
        return concated
    }
}

protocol FTViewProtocol: View {

    var props: [String: JSValue] { get }

    var children: [AnyView] { get }

    init(
        nodeId: ObjectIdentifier,
        props: Binding<[String: JSValue]>,
        children: Binding<[AnyView]>,
        handler: @escaping (@escaping FTContext.ViewHandler) -> Void
    )
}

struct FTLayoutInfo {
    let parentSize: CGSize
}

protocol FTLayoutViewProtocol: FTViewProtocol {

    associatedtype Content: View

    func content(_ info: FTLayoutInfo) -> Self.Content

    /// When true and no explicit width is set, the view expands to fill available width,
    /// matching the block-level default of a web <div>.
    var defaultFillsWidth: Bool { get }

    /// Controls overflow clipping. Defaults to "visible"; ScrollView overrides to "hidden".
    var overflow: String { get }
}

struct Layout: Equatable {

    var global: CGRect

    var local: CGRect
}

// DimensionValue used for parsing string-based dimensions coming from JS.
enum DimensionValue {
    case auto
    case point(CGFloat)
    case percent(Double)  // numeric percent, e.g. 50.0 for "50%"
}

// FlexValue used for flex property which can be number, 'auto', or 'none'
enum FlexValue {
    case none
    case auto
    case value(CGFloat)
}

// FontSizeValue used for fontSize property which can be number or percentage
enum FontSizeValue {
    case point(CGFloat)
    case percent(Double)
}

// BoxShadowValue for box-shadow property
struct BoxShadowValue {
    let offsetX: DimensionValue
    let offsetY: DimensionValue
    let color: String?
    let blurRadius: DimensionValue?
    let spreadDistance: DimensionValue?
    let inset: Bool?

    init?(_ value: [String: Any]) {
        guard let offsetX = value["offsetX"],
            let offsetY = value["offsetY"]
        else { return nil }

        // Parse dimension values
        if let offsetXStr = offsetX as? String {
            self.offsetX = DimensionValue(offsetXStr) ?? .point(0)
        } else if let offsetXNum = offsetX as? Double {
            self.offsetX = .point(CGFloat(offsetXNum))
        } else {
            self.offsetX = .point(0)
        }

        if let offsetYStr = offsetY as? String {
            self.offsetY = DimensionValue(offsetYStr) ?? .point(0)
        } else if let offsetYNum = offsetY as? Double {
            self.offsetY = .point(CGFloat(offsetYNum))
        } else {
            self.offsetY = .point(0)
        }

        self.color = value["color"] as? String
        self.blurRadius = (value["blurRadius"] as? String).flatMap { DimensionValue($0) }
        self.spreadDistance = (value["spreadDistance"] as? String).flatMap { DimensionValue($0) }
        self.inset = value["inset"] as? Bool
    }
}

// TransformFunction for transform property
enum TransformFunction {
    case perspective(CGFloat)
    case rotate(String)
    case rotateX(String)
    case rotateY(String)
    case rotateZ(String)
    case scale(CGFloat)
    case scaleX(CGFloat)
    case scaleY(CGFloat)
    case translateX(DimensionValue)
    case translateY(DimensionValue)
    case skewX(String)
    case skewY(String)
    case matrix([CGFloat])

    init?(_ value: [String: Any]) {
        if let perspective = value["perspective"] as? Double {
            self = .perspective(CGFloat(perspective))
        } else if let rotate = value["rotate"] as? String {
            self = .rotate(rotate)
        } else if let rotateX = value["rotateX"] as? String {
            self = .rotateX(rotateX)
        } else if let rotateY = value["rotateY"] as? String {
            self = .rotateY(rotateY)
        } else if let rotateZ = value["rotateZ"] as? String {
            self = .rotateZ(rotateZ)
        } else if let scale = value["scale"] as? Double {
            self = .scale(CGFloat(scale))
        } else if let scaleX = value["scaleX"] as? Double {
            self = .scaleX(CGFloat(scaleX))
        } else if let scaleY = value["scaleY"] as? Double {
            self = .scaleY(CGFloat(scaleY))
        } else if let translateX = value["translateX"] {
            if let str = translateX as? String {
                self = .translateX(DimensionValue(str) ?? .point(0))
            } else if let num = translateX as? Double {
                self = .translateX(.point(CGFloat(num)))
            } else {
                return nil
            }
        } else if let translateY = value["translateY"] {
            if let str = translateY as? String {
                self = .translateY(DimensionValue(str) ?? .point(0))
            } else if let num = translateY as? Double {
                self = .translateY(.point(CGFloat(num)))
            } else {
                return nil
            }
        } else if let skewX = value["skewX"] as? String {
            self = .skewX(skewX)
        } else if let skewY = value["skewY"] as? String {
            self = .skewY(skewY)
        } else if let matrix = value["matrix"] as? [Double] {
            self = .matrix(matrix.map { CGFloat($0) })
        } else {
            return nil
        }
    }
}

// FilterFunction for filter property
enum FilterFunction {
    case brightness(DimensionValue)
    case blur(DimensionValue)
    case contrast(DimensionValue)
    case grayscale(DimensionValue)
    case hueRotate(DimensionValue)
    case invert(DimensionValue)
    case opacity(DimensionValue)
    case saturate(DimensionValue)
    case sepia(DimensionValue)
    case dropShadow(String)

    init?(_ value: [String: Any]) {
        if let brightness = value["brightness"] {
            if let str = brightness as? String {
                self = .brightness(DimensionValue(str) ?? .point(1))
            } else if let num = brightness as? Double {
                self = .brightness(.point(CGFloat(num)))
            } else {
                return nil
            }
        } else if let blur = value["blur"] {
            if let str = blur as? String {
                self = .blur(DimensionValue(str) ?? .point(0))
            } else if let num = blur as? Double {
                self = .blur(.point(CGFloat(num)))
            } else {
                return nil
            }
        } else if let contrast = value["contrast"] {
            if let str = contrast as? String {
                self = .contrast(DimensionValue(str) ?? .point(1))
            } else if let num = contrast as? Double {
                self = .contrast(.point(CGFloat(num)))
            } else {
                return nil
            }
        } else if let grayscale = value["grayscale"] {
            if let str = grayscale as? String {
                self = .grayscale(DimensionValue(str) ?? .point(0))
            } else if let num = grayscale as? Double {
                self = .grayscale(.point(CGFloat(num)))
            } else {
                return nil
            }
        } else if let hueRotate = value["hueRotate"] {
            if let str = hueRotate as? String {
                self = .hueRotate(DimensionValue(str) ?? .point(0))
            } else if let num = hueRotate as? Double {
                self = .hueRotate(.point(CGFloat(num)))
            } else {
                return nil
            }
        } else if let invert = value["invert"] {
            if let str = invert as? String {
                self = .invert(DimensionValue(str) ?? .point(0))
            } else if let num = invert as? Double {
                self = .invert(.point(CGFloat(num)))
            } else {
                return nil
            }
        } else if let opacity = value["opacity"] {
            if let str = opacity as? String {
                self = .opacity(DimensionValue(str) ?? .point(1))
            } else if let num = opacity as? Double {
                self = .opacity(.point(CGFloat(num)))
            } else {
                return nil
            }
        } else if let saturate = value["saturate"] {
            if let str = saturate as? String {
                self = .saturate(DimensionValue(str) ?? .point(1))
            } else if let num = saturate as? Double {
                self = .saturate(.point(CGFloat(num)))
            } else {
                return nil
            }
        } else if let sepia = value["sepia"] {
            if let str = sepia as? String {
                self = .sepia(DimensionValue(str) ?? .point(0))
            } else if let num = sepia as? Double {
                self = .sepia(.point(CGFloat(num)))
            } else {
                return nil
            }
        } else if let dropShadow = value["dropShadow"] as? String {
            self = .dropShadow(dropShadow)
        } else {
            return nil
        }
    }
}

extension DimensionValue {

    init?(_ s: String) {
        let trimmed = s.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        if trimmed == "auto" {
            self = .auto
            return
        }
        if trimmed.hasSuffix("%") {
            let num = trimmed.dropLast().trimmingCharacters(in: .whitespacesAndNewlines)
            if let d = Double(num) {
                self = .percent(d)
                return
            }
            return nil
        }
        if let d = Double(trimmed) {
            self = .point(CGFloat(d))
            return
        }
        return nil
    }

    // Resolve a DimensionValue into a concrete CGFloat when needed.
    // Keeps percent semantics as fraction (50% -> 0.5). Caller decides defaulting.
    func resolve(relativeBase: CGFloat) -> CGFloat? {
        switch self {
        case .auto:
            return nil
        case .point(let v):
            return v
        case .percent(let p):
            return CGFloat(p) / 100.0 * relativeBase
        }
    }
}

extension FlexValue {

    init?(_ value: Any) {
        if let s = value as? String {
            switch s.lowercased() {
            case "none": self = .none
            case "auto": self = .auto
            default: return nil
            }
        } else if let n = value as? Double {
            self = .value(CGFloat(n))
        } else if let i = value as? Int {
            self = .value(CGFloat(i))
        } else if let f = value as? CGFloat {
            self = .value(f)
        } else {
            return nil
        }
    }

    // Convert FlexValue to a string representation for SwiftUI
    var stringValue: String? {
        switch self {
        case .none: return "0"
        case .auto: return nil  // SwiftUI doesn't have direct auto equivalent
        case .value(let v): return String(describing: v)
        }
    }

    // Get the numeric value if it's a number
    var numericValue: CGFloat? {
        switch self {
        case .none: return 0
        case .auto: return nil
        case .value(let v): return v
        }
    }
}

extension FontSizeValue {

    init?(_ value: Any) {
        if let s = value as? String {
            let trimmed = s.trimmingCharacters(in: .whitespacesAndNewlines)
            if trimmed.hasSuffix("%") {
                let num = trimmed.dropLast().trimmingCharacters(in: .whitespacesAndNewlines)
                if let d = Double(num) {
                    self = .percent(d)
                    return
                }
                return nil
            }
            if let d = Double(trimmed) {
                self = .point(CGFloat(d))
                return
            }
            return nil
        } else if let n = value as? Double {
            self = .point(CGFloat(n))
        } else if let i = value as? Int {
            self = .point(CGFloat(i))
        } else if let f = value as? CGFloat {
            self = .point(f)
        } else {
            return nil
        }
    }

    // Resolve FontSizeValue to a concrete CGFloat
    func resolve(relativeBase: CGFloat) -> CGFloat? {
        switch self {
        case .point(let v): return v
        case .percent(let p): return CGFloat(p) / 100.0 * relativeBase
        }
    }
}

extension FTLayoutViewProtocol {

    fileprivate func styleForKey(_ key: String) -> JSValue? {
        guard let style = props["style"] else { return nil }
        guard let obj = style.objectForKeyedSubscript(key),
            !obj.isUndefined && !obj.isNull
        else { return nil }
        return obj
    }
}

extension FTLayoutViewProtocol {

    func stringValue(_ key: String) -> String? {
        guard let v = styleForKey(key) else { return nil }
        if v.isString, let s = v.toString() { return s }
        if v.isNumber {
            let d = v.toDouble()
            // Check if it's an integer
            if d == floor(d) {
                return String(Int(d))
            } else {
                return String(d)
            }
        }
        return nil
    }

    func dimensionValue(_ key: String) -> DimensionValue? {
        guard let v = styleForKey(key) else { return nil }
        if v.isNumber {
            return .point(CGFloat(v.toDouble()))
        }
        if v.isString, let s = v.toString() {
            return DimensionValue(s)
        }
        return nil
    }

    func flexValue(_ key: String) -> FlexValue? {
        guard let v = styleForKey(key) else { return nil }
        if v.isString, let s = v.toString() {
            return FlexValue(s)
        }
        if v.isNumber {
            return FlexValue(v.toDouble())
        }
        return nil
    }

    func fontSizeValue(_ key: String) -> FontSizeValue? {
        guard let v = styleForKey(key) else { return nil }
        if v.isString, let s = v.toString() {
            return FontSizeValue(s)
        }
        if v.isNumber {
            return FontSizeValue(v.toDouble())
        }
        return nil
    }

    func boxShadowValue(_ key: String) -> [BoxShadowValue]? {
        guard let v = styleForKey(key) else { return nil }
        if v.isObject {
            guard let stringDict = v.toStringKeyedDictionary() else { return nil }
            if let boxShadow = BoxShadowValue(stringDict) {
                return [boxShadow]
            }
        } else if v.isArray {
            guard let array = v.toArray() else { return nil }
            return array.compactMap { item -> BoxShadowValue? in
                guard let dict = item as? [String: Any] else { return nil }
                return BoxShadowValue(dict)
            }
        }
        return nil
    }

    func filterValue(_ key: String) -> [FilterFunction]? {
        guard let v = styleForKey(key) else { return nil }
        if v.isObject {
            guard let stringDict = v.toStringKeyedDictionary() else { return nil }
            if let filter = FilterFunction(stringDict) {
                return [filter]
            }
        } else if v.isArray {
            guard let array = v.toArray() else { return nil }
            return array.compactMap { item -> FilterFunction? in
                guard let dict = item as? [String: Any] else { return nil }
                return FilterFunction(dict)
            }
        }
        return nil
    }

    func transformValue(_ key: String) -> [TransformFunction]? {
        guard let v = styleForKey(key) else { return nil }
        if v.isObject {
            guard let stringDict = v.toStringKeyedDictionary() else { return nil }
            if let transform = TransformFunction(stringDict) {
                return [transform]
            }
        } else if v.isArray {
            guard let array = v.toArray() else { return nil }
            return array.compactMap { item -> TransformFunction? in
                guard let dict = item as? [String: Any] else { return nil }
                return TransformFunction(dict)
            }
        }
        return nil
    }

    func numericValue(_ key: String) -> CGFloat? {
        guard let v = styleForKey(key) else { return nil }
        if v.isNumber {
            return CGFloat(v.toDouble())
        }
        return nil
    }

    func transformOriginValue(_ key: String) -> [Any]? {
        guard let v = styleForKey(key) else { return nil }
        if v.isArray, let array = v.toArray() {
            return array
        } else {
            // Wrap single value in array
            if v.isString, let s = v.toString() {
                return [s]
            } else if v.isNumber {
                return [v.toDouble()]
            } else if let obj = v.toObject() {
                return [obj]
            }
        }
        return nil
    }

    // MARK: - Layout / Box
    var display: String? { stringValue("display") }

    var width: DimensionValue? { dimensionValue("width") }
    var height: DimensionValue? { dimensionValue("height") }
    var minWidth: DimensionValue? { dimensionValue("minWidth") }
    var minHeight: DimensionValue? { dimensionValue("minHeight") }
    var maxWidth: DimensionValue? { dimensionValue("maxWidth") }
    var maxHeight: DimensionValue? { dimensionValue("maxHeight") }

    var left: DimensionValue? { dimensionValue("left") }
    var right: DimensionValue? { dimensionValue("right") }
    var top: DimensionValue? { dimensionValue("top") }
    var bottom: DimensionValue? { dimensionValue("bottom") }

    var inset: DimensionValue? { dimensionValue("inset") }

    var aspectRatio: CGFloat? {
        guard let v = styleForKey("aspectRatio") else { return nil }
        if v.isString, let s = v.toString(), let d = Double(s) {
            return CGFloat(d)
        }
        if v.isNumber {
            return CGFloat(v.toDouble())
        }
        return nil
    }

    var flexBasis: DimensionValue { dimensionValue("flexBasis") ?? .auto }
    var flexGrow: CGFloat { numericValue("flexGrow") ?? 0 }
    var flexShrink: CGFloat { numericValue("flexShrink") ?? 1 }
    var flexWrap: String? { stringValue("flexWrap") }
    var order: Int {
        guard let v = styleForKey("order"), v.isNumber else { return 0 }
        return Int(v.toDouble())
    }

    // layout alignments and gaps

    var position: String { stringValue("position") ?? "static" }
    var flexDirection: String { stringValue("flexDirection") ?? "column" }
    var alignContent: String { stringValue("alignContent") ?? "flex-start" }
    var alignItems: String { stringValue("alignItems") ?? "stretch" }
    var alignSelf: String { stringValue("alignSelf") ?? "auto" }
    var justifyContent: String { stringValue("justifyContent") ?? "stretch" }
    var justifyItems: String { stringValue("justifyItems") ?? "stretch" }
    var justifySelf: String { stringValue("justifySelf") ?? "auto" }

    var columnGap: CGFloat? { numericValue("columnGap") }
    var rowGap: CGFloat? { numericValue("rowGap") }

    var overflow: String { stringValue("overflow") ?? "visible" }  // protocol requirement default

    var zIndex: Int? {
        guard let v = styleForKey("zIndex"), v.isNumber else { return nil }
        return Int(v.toDouble())
    }

    // per-side padding and margin
    var paddingTop: DimensionValue? { dimensionValue("paddingTop") }
    var paddingLeft: DimensionValue? { dimensionValue("paddingLeft") }
    var paddingRight: DimensionValue? { dimensionValue("paddingRight") }
    var paddingBottom: DimensionValue? { dimensionValue("paddingBottom") }

    var marginTop: DimensionValue? { dimensionValue("marginTop") }
    var marginLeft: DimensionValue? { dimensionValue("marginLeft") }
    var marginRight: DimensionValue? { dimensionValue("marginRight") }
    var marginBottom: DimensionValue? { dimensionValue("marginBottom") }

    // MARK: - Border
    var borderTopWidth: CGFloat? { numericValue("borderTopWidth") }
    var borderBottomWidth: CGFloat? { numericValue("borderBottomWidth") }
    var borderLeftWidth: CGFloat? { numericValue("borderLeftWidth") }
    var borderRightWidth: CGFloat? { numericValue("borderRightWidth") }

    var borderTopColor: String? { stringValue("borderTopColor") }
    var borderBottomColor: String? { stringValue("borderBottomColor") }
    var borderLeftColor: String? { stringValue("borderLeftColor") }
    var borderRightColor: String? { stringValue("borderRightColor") }

    var borderTopLeftRadius: CGFloat? { numericValue("borderTopLeftRadius") }
    var borderTopRightRadius: CGFloat? { numericValue("borderTopRightRadius") }
    var borderBottomLeftRadius: CGFloat? { numericValue("borderBottomLeftRadius") }
    var borderBottomRightRadius: CGFloat? { numericValue("borderBottomRightRadius") }

    // MARK: - Visual
    var backgroundColor: String? { stringValue("backgroundColor") }
    var opacity: CGFloat { numericValue("opacity") ?? 1 }
    var outlineColor: String? { stringValue("outlineColor") }
    var outlineStyle: String? { stringValue("outlineStyle") }
    var outlineWidth: CGFloat? { numericValue("outlineWidth") }
    var outlineOffset: CGFloat? { numericValue("outlineOffset") }
    var borderStyle: String? { stringValue("borderStyle") }
    var borderCurve: String? { stringValue("borderCurve") }

    var boxShadow: [BoxShadowValue]? { boxShadowValue("boxShadow") }
    var filter: [FilterFunction]? { filterValue("filter") }

    var mixBlendMode: String? { stringValue("mixBlendMode") }

    // MARK: - Interaction / Misc
    var pointerEvents: String? { stringValue("pointerEvents") }
    var cursor: String? { stringValue("cursor") }
    var userSelect: String? { stringValue("userSelect") }
    var boxSizing: String? { stringValue("boxSizing") }

    // MARK: - Transforms
    var transform: [TransformFunction]? { transformValue("transform") }
    var transformOrigin: [Any]? { transformOriginValue("transformOrigin") }
}

extension FTLayoutViewProtocol {

    private func _body(_ parentSize: CGSize) -> some View {
        // Handle display:none - collapse view completely
        if display == "none" {
            return AnyView(EmptyView())
        }

        let info = FTLayoutInfo(parentSize: parentSize)

        // Resolve padding and margin with relative base
        let paddingInsets = EdgeInsets(
            top: paddingTop?.resolve(relativeBase: parentSize.height) ?? 0,
            leading: paddingLeft?.resolve(relativeBase: parentSize.width) ?? 0,
            bottom: paddingBottom?.resolve(relativeBase: parentSize.height) ?? 0,
            trailing: paddingRight?.resolve(relativeBase: parentSize.width) ?? 0
        )
        let marginInsets = EdgeInsets(
            top: marginTop?.resolve(relativeBase: parentSize.height) ?? 0,
            leading: marginLeft?.resolve(relativeBase: parentSize.width) ?? 0,
            bottom: marginBottom?.resolve(relativeBase: parentSize.height) ?? 0,
            trailing: marginRight?.resolve(relativeBase: parentSize.width) ?? 0
        )

        // Start with the base content wrapped in AnyView to allow modifier chaining
        var view = AnyView(self.content(info))

        // Apply size constraints
        if let width = width?.resolve(relativeBase: parentSize.width),
            let height = height?.resolve(relativeBase: parentSize.height)
        {
            view = AnyView(view.frame(width: width, height: height, alignment: .topLeading))
        } else if let width = width?.resolve(relativeBase: parentSize.width) {
            view = AnyView(view.frame(width: width, alignment: .topLeading))
        } else if let height = height?.resolve(relativeBase: parentSize.height) {
            if defaultFillsWidth {
                view = AnyView(
                    view.frame(height: height, alignment: .topLeading)
                        .frame(maxWidth: .infinity))
            } else {
                view = AnyView(view.frame(height: height, alignment: .topLeading))
            }
        } else if defaultFillsWidth {
            view = AnyView(view.frame(maxWidth: .infinity, alignment: .topLeading))
        }

        // Apply min/max constraints
        let minW: CGFloat? = minWidth?.resolve(relativeBase: parentSize.width)
        let maxW: CGFloat? = maxWidth?.resolve(relativeBase: parentSize.width)
        let minH: CGFloat? = minHeight?.resolve(relativeBase: parentSize.height)
        let maxH: CGFloat? = maxHeight?.resolve(relativeBase: parentSize.height)

        if minW != nil || maxW != nil || minH != nil || maxH != nil {
            view = AnyView(
                view.frame(
                    minWidth: minW, idealWidth: nil, maxWidth: maxW,
                    minHeight: minH, idealHeight: nil, maxHeight: maxH,
                    alignment: .topLeading
                ))
        }

        // Apply aspect ratio
        if let aspectRatio = aspectRatio {
            view = AnyView(view.aspectRatio(aspectRatio, contentMode: .fit))
        }

        // Apply positioning
        if position == "absolute" {
            let x =
                left?.resolve(relativeBase: parentSize.width) ?? right.map {
                    parentSize.width - ($0.resolve(relativeBase: parentSize.width) ?? 0)
                } ?? 0
            let y =
                top?.resolve(relativeBase: parentSize.height) ?? bottom.map {
                    parentSize.height - ($0.resolve(relativeBase: parentSize.height) ?? 0)
                } ?? 0
            view = AnyView(view.position(x: x, y: y))
        } else if position == "relative" {
            let x =
                left?.resolve(relativeBase: parentSize.width) ?? right.map {
                    -($0.resolve(relativeBase: parentSize.width) ?? 0)
                } ?? 0
            let y =
                top?.resolve(relativeBase: parentSize.height) ?? bottom.map {
                    -($0.resolve(relativeBase: parentSize.height) ?? 0)
                } ?? 0
            view = AnyView(view.offset(x: x, y: y))
        }

        // Apply padding
        view = AnyView(view.padding(paddingInsets))

        // Apply background color
        if let backgroundColor = backgroundColor {
            view = AnyView(view.background(Color(hexString: backgroundColor)))
        }

        // Apply onLayout if present
        if let onLayout = props["onLayout"] {
            view = AnyView(
                view.onGeometryChange(for: Layout.self) {
                    Layout(
                        global: $0.frame(in: .global),
                        local: $0.frame(in: .local)
                    )
                } action: { layout in
                    SwiftJS.Value(onLayout).call(withArguments: [
                        [
                            "global": layout.global.toJSValue(),
                            "local": layout.local.toJSValue(),
                        ]
                    ])
                })
        }

        // Apply border styles using overlays for per-side control
        if let topWidth = borderTopWidth, topWidth > 0 {
            view = AnyView(
                view.overlay(
                    Rectangle()
                        .frame(height: topWidth)
                        .foregroundColor(Color(hexString: borderTopColor ?? "#000000")),
                    alignment: .top
                ))
        }

        if let bottomWidth = borderBottomWidth, bottomWidth > 0 {
            view = AnyView(
                view.overlay(
                    Rectangle()
                        .frame(height: bottomWidth)
                        .foregroundColor(Color(hexString: borderBottomColor ?? "#000000")),
                    alignment: .bottom
                ))
        }

        if let leftWidth = borderLeftWidth, leftWidth > 0 {
            view = AnyView(
                view.overlay(
                    Rectangle()
                        .frame(width: leftWidth)
                        .foregroundColor(Color(hexString: borderLeftColor ?? "#000000")),
                    alignment: .leading
                ))
        }

        if let rightWidth = borderRightWidth, rightWidth > 0 {
            view = AnyView(
                view.overlay(
                    Rectangle()
                        .frame(width: rightWidth)
                        .foregroundColor(Color(hexString: borderRightColor ?? "#000000")),
                    alignment: .trailing
                ))
        }

        // Apply border radius using per-corner values, and overflow clipping
        let radiusTL = borderTopLeftRadius ?? 0
        let radiusTR = borderTopRightRadius ?? 0
        let radiusBL = borderBottomLeftRadius ?? 0
        let radiusBR = borderBottomRightRadius ?? 0
        if radiusTL > 0 || radiusTR > 0 || radiusBL > 0 || radiusBR > 0 {
            view = AnyView(
                view.clipShape(
                    UnevenRoundedRectangle(
                        cornerRadii: RectangleCornerRadii(
                            topLeading: radiusTL,
                            bottomLeading: radiusBL,
                            bottomTrailing: radiusBR,
                            topTrailing: radiusTR
                        )
                    )
                )
            )
        } else if overflow == "hidden" {
            view = AnyView(view.clipped())
        }

        // Apply transforms
        if let transforms = transform {
            for transform in transforms {
                switch transform {
                case .scale(let scale):
                    view = AnyView(view.scaleEffect(scale))
                case .scaleX(let scaleX):
                    view = AnyView(view.scaleEffect(x: scaleX, y: 1))
                case .scaleY(let scaleY):
                    view = AnyView(view.scaleEffect(x: 1, y: scaleY))
                case .rotate(let angle):
                    if let degrees = Double(angle.replacingOccurrences(of: "deg", with: "")) {
                        view = AnyView(view.rotationEffect(.degrees(degrees)))
                    }
                case .translateX(let x):
                    if let offset = x.resolve(relativeBase: parentSize.width) {
                        view = AnyView(view.offset(x: offset, y: 0))
                    }
                case .translateY(let y):
                    if let offset = y.resolve(relativeBase: parentSize.height) {
                        view = AnyView(view.offset(x: 0, y: offset))
                    }
                default:
                    break  // Handle other transforms as needed
                }
            }
        }

        // Apply margin as outer padding
        view = AnyView(view.padding(marginInsets))

        // Apply opacity
        if opacity != 1 {
            view = AnyView(view.opacity(opacity))
        }

        // Apply z-index
        if let zIndex = zIndex {
            view = AnyView(view.zIndex(Double(zIndex)))
        }

        return view
    }

    private var needsParentSize: Bool {
        func isPercent(_ v: DimensionValue?) -> Bool {
            if case .percent = v { return true }
            return false
        }
        return isPercent(width) || isPercent(height)
            || isPercent(minWidth) || isPercent(maxWidth)
            || isPercent(minHeight) || isPercent(maxHeight)
            || isPercent(paddingTop) || isPercent(paddingBottom)
            || isPercent(paddingLeft) || isPercent(paddingRight)
            || isPercent(marginTop) || isPercent(marginBottom)
            || isPercent(marginLeft) || isPercent(marginRight)
            || isPercent(left) || isPercent(right)
            || isPercent(top) || isPercent(bottom)
            || position == "absolute"
    }

    @ViewBuilder
    var body: some View {
        if needsParentSize {
            GeometryReader { geo in
                self._body(geo.size)
            }
        } else {
            self._body(.zero)
        }
    }
}

struct FTView: FTLayoutViewProtocol {

    var defaultFillsWidth: Bool { true }

    @Binding
    var props: [String: JSValue]

    @Binding
    var children: [AnyView]

    init(
        nodeId: ObjectIdentifier,
        props: Binding<[String: JSValue]>,
        children: Binding<[AnyView]>,
        handler: @escaping (@escaping FTContext.ViewHandler) -> Void
    ) {
        self._props = props
        self._children = children
    }

    func content(_ info: FTLayoutInfo) -> some View {
        let isRow = flexDirection.hasPrefix("row")
        let isReverse = flexDirection.hasSuffix("-reverse")
        // For rows (HStack), spacing between items is columnGap; for columns (VStack), rowGap
        let spacing = (isRow ? columnGap : rowGap) ?? 0

        let items = isReverse ? Array(children.reversed()) : children

        let vAlign: VerticalAlignment = {
            switch alignItems {
            case "flex-end": return .bottom
            case "center": return .center
            case "baseline": return .firstTextBaseline
            default: return .top
            }
        }()

        let hAlign: HorizontalAlignment = {
            switch alignItems {
            case "flex-end": return .trailing
            case "center": return .center
            default: return .leading
            }
        }()

        // Build view array with spacers inserted to implement justifyContent distribution.
        // Distributing variants (space-*) set effectiveSpacing to 0 and use Spacer() for
        // all gaps so that the available space is divided equally among the spacer slots.
        let useDistribute =
            justifyContent == "space-between"
            || justifyContent == "space-around"
            || justifyContent == "space-evenly"
        let effectiveSpacing: CGFloat = useDistribute ? 0 : spacing
        let viewArray: [AnyView] = {
            switch justifyContent {
            case "flex-end":
                return [AnyView(Spacer(minLength: 0))] + items
            case "center":
                return [AnyView(Spacer(minLength: 0))] + items + [AnyView(Spacer(minLength: 0))]
            case "space-between":
                // Spacer(minLength: spacing) between items so the gap is respected as minimum.
                var result: [AnyView] = []
                for (i, item) in items.enumerated() {
                    result.append(item)
                    if i < items.count - 1 {
                        result.append(AnyView(Spacer(minLength: spacing)))
                    }
                }
                return result
            case "space-around":
                // 1 spacer at each edge, 2 spacers between each pair → edge:between = 1:2.
                var result: [AnyView] = [AnyView(Spacer(minLength: 0))]
                for (i, item) in items.enumerated() {
                    result.append(item)
                    if i < items.count - 1 {
                        result.append(AnyView(Spacer(minLength: 0)))
                        result.append(AnyView(Spacer(minLength: 0)))
                    }
                }
                result.append(AnyView(Spacer(minLength: 0)))
                return result
            case "space-evenly":
                // 1 spacer before first item and after every item → all gaps equal.
                var result: [AnyView] = [AnyView(Spacer(minLength: 0))]
                for item in items {
                    result.append(item)
                    result.append(AnyView(Spacer(minLength: 0)))
                }
                return result
            default:  // flex-start, stretch
                return items
            }
        }()

        return Group {
            if isRow {
                HStack(alignment: vAlign, spacing: effectiveSpacing) {
                    ForEach(viewArray.indexed(), id: \.index) { $0.element }
                }
                .frame(maxWidth: .infinity, alignment: .topLeading)
            } else {
                VStack(alignment: hAlign, spacing: effectiveSpacing) {
                    ForEach(viewArray.indexed(), id: \.index) { $0.element }
                }
                .frame(maxWidth: .infinity, alignment: .topLeading)
            }
        }
    }
}

struct FTImageView: FTLayoutViewProtocol {

    var defaultFillsWidth: Bool { false }

    @Binding
    var props: [String: JSValue]

    @Binding
    var children: [AnyView]

    init(
        nodeId: ObjectIdentifier,
        props: Binding<[String: JSValue]>,
        children: Binding<[AnyView]>,
        handler: @escaping (@escaping FTContext.ViewHandler) -> Void
    ) {
        self._props = props
        self._children = children
    }

    func content(_ info: FTLayoutInfo) -> some View {
        let source = props["source"]?.toString() ?? ""
        let resizeMode = props["resizeMode"]?.toString() ?? "contain"
        let contentMode: ContentMode = resizeMode == "cover" ? .fill : .fit
        return AsyncImage(url: URL(string: source)) { image in
            image
                .resizable()
                .aspectRatio(contentMode: contentMode)
        } placeholder: {
            Color.gray.opacity(0.15)
        }
    }
}

struct FTTextView: FTLayoutViewProtocol {

    var defaultFillsWidth: Bool { false }

    @Binding
    var props: [String: JSValue]

    @Binding
    var children: [AnyView]

    init(
        nodeId: ObjectIdentifier,
        props: Binding<[String: JSValue]>,
        children: Binding<[AnyView]>,
        handler: @escaping (@escaping FTContext.ViewHandler) -> Void
    ) {
        self._props = props
        self._children = children
    }

    func content(_ info: FTLayoutInfo) -> some View {
        let textAlignment: TextAlignment = {
            switch stringValue("textAlign") {
            case "center": return .center
            case "right", "end": return .trailing
            default: return .leading
            }
        }()
        return Text(props["text"].map(AttributedString.decode) ?? "")
            .multilineTextAlignment(textAlignment)
    }
}

struct FTTextInput: FTLayoutViewProtocol {

    var defaultFillsWidth: Bool { true }

    @Binding
    var props: [String: JSValue]

    @Binding
    var children: [AnyView]

    init(
        nodeId: ObjectIdentifier,
        props: Binding<[String: JSValue]>,
        children: Binding<[AnyView]>,
        handler: @escaping (@escaping FTContext.ViewHandler) -> Void
    ) {
        self._props = props
        self._children = children
    }

    func content(_ info: FTLayoutInfo) -> some View {
        TextField(
            props["placeholder"]?.toString() ?? "",
            text: .constant(props["value"]?.toString() ?? "")
        )
    }
}

struct FTScrollView: FTLayoutViewProtocol {

    var defaultFillsWidth: Bool { true }

    // Always clip to bounds — override the protocol default of "visible"
    var overflow: String { stringValue("overflow") ?? "hidden" }

    @Binding
    var props: [String: JSValue]

    @Binding
    var children: [AnyView]

    init(
        nodeId: ObjectIdentifier,
        props: Binding<[String: JSValue]>,
        children: Binding<[AnyView]>,
        handler: @escaping (@escaping FTContext.ViewHandler) -> Void
    ) {
        self._props = props
        self._children = children
    }

    func content(_ info: FTLayoutInfo) -> some View {
        let horizontal = props["horizontal"]?.toBool() ?? false
        let vertical = props["vertical"]?.toBool() ?? false

        var axes: Axis.Set = []
        if horizontal { axes.insert(.horizontal) }
        if vertical { axes.insert(.vertical) }
        if axes.isEmpty { axes = .vertical }

        return ScrollView(axes) {
            if horizontal && !vertical {
                HStack(alignment: .top, spacing: columnGap ?? 0) {
                    ForEach(children.indexed(), id: \.index) { $0.element }
                }
            } else {
                VStack(alignment: .leading, spacing: rowGap ?? 0) {
                    ForEach(children.indexed(), id: \.index) { $0.element }
                }
                .frame(maxWidth: .infinity, alignment: .topLeading)
            }
        }
    }
}
