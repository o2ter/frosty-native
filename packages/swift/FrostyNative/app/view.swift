//
//  view.swift
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

import JavaScriptCore

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
            guard let dict = v.toDictionary() else { return nil }
            let stringDict = dict.reduce(into: [String: Any]()) { result, pair in
                if let key = pair.key as? String {
                    result[key] = pair.value
                }
            }
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
            guard let dict = v.toDictionary() else { return nil }
            let stringDict = dict.reduce(into: [String: Any]()) { result, pair in
                if let key = pair.key as? String {
                    result[key] = pair.value
                }
            }
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
            guard let dict = v.toDictionary() else { return nil }
            let stringDict = dict.reduce(into: [String: Any]()) { result, pair in
                if let key = pair.key as? String {
                    result[key] = pair.value
                }
            }
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

    var overflow: String { stringValue("overflow") ?? "visible" }

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

    private func _body(_ geo: GeometryProxy) -> some View {
        let info = FTLayoutInfo(parentSize: geo.size)

        // Resolve padding and margin with relative base
        let paddingInsets = EdgeInsets(
            top: paddingTop?.resolve(relativeBase: geo.size.width) ?? 0,
            leading: paddingLeft?.resolve(relativeBase: geo.size.width) ?? 0,
            bottom: paddingBottom?.resolve(relativeBase: geo.size.width) ?? 0,
            trailing: paddingRight?.resolve(relativeBase: geo.size.width) ?? 0
        )
        let marginInsets = EdgeInsets(
            top: marginTop?.resolve(relativeBase: geo.size.width) ?? 0,
            leading: marginLeft?.resolve(relativeBase: geo.size.width) ?? 0,
            bottom: marginBottom?.resolve(relativeBase: geo.size.width) ?? 0,
            trailing: marginRight?.resolve(relativeBase: geo.size.width) ?? 0
        )

        // Start with the base content wrapped in AnyView to allow modifier chaining
        var view = AnyView(self.content(info))

        // Apply size constraints
        if let width = width?.resolve(relativeBase: geo.size.width),
            let height = height?.resolve(relativeBase: geo.size.height)
        {
            view = AnyView(view.frame(width: width, height: height, alignment: .topLeading))
        } else if let width = width?.resolve(relativeBase: geo.size.width) {
            view = AnyView(view.frame(width: width, alignment: .topLeading))
        } else if let height = height?.resolve(relativeBase: geo.size.height) {
            view = AnyView(view.frame(height: height, alignment: .topLeading))
        }

        // Apply min/max constraints
        let minW: CGFloat? = minWidth?.resolve(relativeBase: geo.size.width)
        let maxW: CGFloat? = maxWidth?.resolve(relativeBase: geo.size.width)
        let minH: CGFloat? = minHeight?.resolve(relativeBase: geo.size.height)
        let maxH: CGFloat? = maxHeight?.resolve(relativeBase: geo.size.height)

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
                left?.resolve(relativeBase: geo.size.width) ?? right.map {
                    geo.size.width - ($0.resolve(relativeBase: geo.size.width) ?? 0)
                } ?? 0
            let y =
                top?.resolve(relativeBase: geo.size.height) ?? bottom.map {
                    geo.size.height - ($0.resolve(relativeBase: geo.size.height) ?? 0)
                } ?? 0
            view = AnyView(view.position(x: x, y: y))
        } else if position == "relative" {
            let x =
                left?.resolve(relativeBase: geo.size.width) ?? right.map {
                    -($0.resolve(relativeBase: geo.size.width) ?? 0)
                } ?? 0
            let y =
                top?.resolve(relativeBase: geo.size.height) ?? bottom.map {
                    -($0.resolve(relativeBase: geo.size.height) ?? 0)
                } ?? 0
            view = AnyView(view.offset(x: x, y: y))
        }

        // Apply z-index
        if let zIndex = zIndex {
            view = AnyView(view.zIndex(Double(zIndex)))
        }

        // Apply opacity
        if opacity != 1 {
            view = AnyView(view.opacity(opacity))
        }

        // Apply background color
        if let backgroundColor = backgroundColor {
            view = AnyView(view.background(Color(hexString: backgroundColor)))
        }

        // Apply border styles using overlays for per-side control
        var borderedView = view

        if let topWidth = borderTopWidth, topWidth > 0 {
            borderedView = AnyView(
                borderedView.overlay(
                    Rectangle()
                        .frame(height: topWidth)
                        .foregroundColor(Color(hexString: borderTopColor ?? "#000000")),
                    alignment: .top
                ))
        }

        if let bottomWidth = borderBottomWidth, bottomWidth > 0 {
            borderedView = AnyView(
                borderedView.overlay(
                    Rectangle()
                        .frame(height: bottomWidth)
                        .foregroundColor(Color(hexString: borderBottomColor ?? "#000000")),
                    alignment: .bottom
                ))
        }

        if let leftWidth = borderLeftWidth, leftWidth > 0 {
            borderedView = AnyView(
                borderedView.overlay(
                    Rectangle()
                        .frame(width: leftWidth)
                        .foregroundColor(Color(hexString: borderLeftColor ?? "#000000")),
                    alignment: .leading
                ))
        }

        if let rightWidth = borderRightWidth, rightWidth > 0 {
            borderedView = AnyView(
                borderedView.overlay(
                    Rectangle()
                        .frame(width: rightWidth)
                        .foregroundColor(Color(hexString: borderRightColor ?? "#000000")),
                    alignment: .trailing
                ))
        }

        view = borderedView

        // Apply border radius
        if let radius = borderTopLeftRadius ?? borderTopRightRadius ?? borderBottomLeftRadius
            ?? borderBottomRightRadius
        {
            view = AnyView(view.cornerRadius(radius))
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
                    if let offset = x.resolve(relativeBase: geo.size.width) {
                        view = AnyView(view.offset(x: offset, y: 0))
                    }
                case .translateY(let y):
                    if let offset = y.resolve(relativeBase: geo.size.height) {
                        view = AnyView(view.offset(x: 0, y: offset))
                    }
                default:
                    break  // Handle other transforms as needed
                }
            }
        }

        // Apply padding
        view = AnyView(view.padding(paddingInsets))

        // Apply onLayout if present
        if let onLayout = props["onLayout"] {
            view = AnyView(
                view.onGeometryChange(for: Layout.self) {
                    Layout(
                        global: $0.frame(in: .global),
                        local: $0.frame(in: .local)
                    )
                } action: { layout in
                    onLayout.call(withArguments: [
                        [
                            "global": layout.global.toJSValue(),
                            "local": layout.local.toJSValue(),
                        ]
                    ])
                })
        }

        // Apply margin as outer padding
        return AnyView(view.padding(marginInsets))
    }

    var body: some View {
        GeometryReader { geo in
            self._body(geo)
        }
    }
}

struct FTView: FTLayoutViewProtocol {

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
        let spacing = (isRow ? rowGap : columnGap) ?? 0

        let items = isReverse ? children.reversed() : children

        return Group {
            if isRow {
                HStackLayout(spacing: spacing) {
                    ForEach(items.indexed(), id: \.index) { $0.element }
                }
            } else {
                VStackLayout(spacing: spacing) {
                    ForEach(items.indexed(), id: \.index) { $0.element }
                }
            }
        }
    }
}

struct FTImageView: FTLayoutViewProtocol {

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
        Image("")
    }
}

struct FTTextView: FTLayoutViewProtocol {

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
        Text(props["text"]?.toString() ?? "")
    }
}

struct FTTextInput: FTLayoutViewProtocol {

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
        TextField("", text: .constant(props["text"]?.toString() ?? ""))
    }
}

struct FTScrollView: FTLayoutViewProtocol {

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

        return ScrollView(axes) { children.first }
    }
}
