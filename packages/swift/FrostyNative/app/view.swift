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

protocol FTViewProtocol: View {
    
    var props: [String: any Sendable] { get }
    
    var children: [AnyView] { get }

    var handler: (@escaping FTContext.ViewHandler) -> Void { get }
    
    init(
        nodeId: ObjectIdentifier,
        props: Binding<[String: any Sendable]>,
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
        if trimmed == "auto" { self = .auto; return }
        if trimmed.hasSuffix("%") {
            let num = trimmed.dropLast().trimmingCharacters(in: .whitespacesAndNewlines)
            if let d = Double(num) { self = .percent(d); return }
            return nil
        }
        if let d = Double(trimmed) { self = .point(CGFloat(d)); return }
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
                if let d = Double(num) { self = .percent(d); return }
                return nil
            }
            if let d = Double(trimmed) { self = .point(CGFloat(d)); return }
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

    var style: [String: any Sendable] {
        return props["style"] as? [String: any Sendable] ?? [:]
    }
}

extension FTLayoutViewProtocol {

    func stringValue(_ key: String) -> String? {
        guard let v = style[key] else { return nil }
        if let s = v as? String { return s }
        if let i = v as? Int { return String(i) }
        if let d = v as? Double { return String(d) }
        return nil
    }

    func dimensionValue(_ key: String) -> DimensionValue? {
        guard let v = style[key] else { return nil }
        if let f = v as? CGFloat { return .point(f) }
        if let d = v as? Double { return .point(CGFloat(d)) }
        if let i = v as? Int { return .point(CGFloat(i)) }
        if let s = v as? String { return DimensionValue(s) }
        return nil
    }
    
    func flexValue(_ key: String) -> FlexValue? {
        guard let v = style[key] else { return nil }
        return FlexValue(v)
    }

    func fontSizeValue(_ key: String) -> FontSizeValue? {
        guard let v = style[key] else { return nil }
        return FontSizeValue(v)
    }

    func boxShadowValue(_ key: String) -> [BoxShadowValue]? {
        guard let v = style[key] else { return nil }
        if let single = v as? [String: Any], let boxShadow = BoxShadowValue(single) {
            return [boxShadow]
        } else if let array = v as? [[String: Any]] {
            return array.compactMap { BoxShadowValue($0) }
        }
        return nil
    }

    func filterValue(_ key: String) -> [FilterFunction]? {
        guard let v = style[key] else { return nil }
        if let single = v as? [String: Any], let filter = FilterFunction(single) {
            return [filter]
        } else if let array = v as? [[String: Any]] {
            return array.compactMap { FilterFunction($0) }
        }
        return nil
    }

    func transformValue(_ key: String) -> [TransformFunction]? {
        guard let v = style[key] else { return nil }
        if let single = v as? [String: Any], let transform = TransformFunction(single) {
            return [transform]
        } else if let array = v as? [[String: Any]] {
            return array.compactMap { TransformFunction($0) }
        }
        return nil
    }

    func numericValue(_ key: String) -> CGFloat? {
        if let d = style[key] as? Double { return CGFloat(d) }
        if let i = style[key] as? Int { return CGFloat(i) }
        return nil
    }

    func transformOriginValue(_ key: String) -> [Any]? {
        guard let v = style[key] else { return nil }
        if let array = v as? [Any] {
            return array
        } else {
            return [v]
        }
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
    var bottomValue: DimensionValue? { dimensionValue("bottom") }
    var start: DimensionValue? { dimensionValue("start") }
    var end: DimensionValue? { dimensionValue("end") }

    var inset: DimensionValue? { dimensionValue("inset") }

    var aspectRatioValue: CGFloat? {
        if let s = style["aspectRatio"] as? String, let d = Double(s) { return CGFloat(d) }
        if let d = style["aspectRatio"] as? Double { return CGFloat(d) }
        if let i = style["aspectRatio"] as? Int { return CGFloat(i) }
        return nil
    }

    var flex: FlexValue? { flexValue("flex") }

    var flexBasis: DimensionValue? { dimensionValue("flexBasis") }
    var flexGrow: CGFloat { numericValue("flexGrow") ?? 0 }
    var flexShrink: CGFloat { numericValue("flexShrink") ?? 1 }
    var flexWrap: String? { stringValue("flexWrap") }
    var order: Int { (style["order"] as? Int) ?? 0 }

    var gap: CGFloat? { numericValue("gap") }

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

    var zIndex: Int? { (style["zIndex"] as? Int) }

    // per-side padding and margin
    var paddingTop: DimensionValue? { dimensionValue("paddingTop") }
    var paddingLeft: DimensionValue? { dimensionValue("paddingLeft") }
    var paddingRight: DimensionValue? { dimensionValue("paddingRight") }
    var paddingBottom: DimensionValue? { dimensionValue("paddingBottom") }

    var marginTop: DimensionValue? { dimensionValue("marginTop") }
    var marginLeft: DimensionValue? { dimensionValue("marginLeft") }
    var marginRight: DimensionValue? { dimensionValue("marginRight") }
    var marginBottom: DimensionValue? { dimensionValue("marginBottom") }

    // MARK: - Padding / Margin (extras)
    var padding: DimensionValue? { dimensionValue("padding") }
    var paddingHorizontal: DimensionValue? { dimensionValue("paddingHorizontal") }
    var paddingVertical: DimensionValue? { dimensionValue("paddingVertical") }
    var paddingStart: DimensionValue? { dimensionValue("paddingStart") }
    var paddingEnd: DimensionValue? { dimensionValue("paddingEnd") }

    var margin: DimensionValue? { dimensionValue("margin") }
    var marginHorizontal: DimensionValue? { dimensionValue("marginHorizontal") }
    var marginVertical: DimensionValue? { dimensionValue("marginVertical") }
    var marginStart: DimensionValue? { dimensionValue("marginStart") }
    var marginEnd: DimensionValue? { dimensionValue("marginEnd") }

    // MARK: - Border
    var borderWidth: CGFloat? { numericValue("borderWidth") }
    var borderTopWidth: CGFloat? { numericValue("borderTopWidth") }
    var borderBottomWidth: CGFloat? { numericValue("borderBottomWidth") }
    var borderLeftWidth: CGFloat? { numericValue("borderLeftWidth") }
    var borderRightWidth: CGFloat? { numericValue("borderRightWidth") }
    var borderStartWidth: CGFloat? { numericValue("borderStartWidth") }
    var borderEndWidth: CGFloat? { numericValue("borderEndWidth") }

    var borderColor: String? { stringValue("borderColor") }
    var borderTopColor: String? { stringValue("borderTopColor") }
    var borderBottomColor: String? { stringValue("borderBottomColor") }
    var borderLeftColor: String? { stringValue("borderLeftColor") }
    var borderRightColor: String? { stringValue("borderRightColor") }
    var borderStartColor: String? { stringValue("borderStartColor") }
    var borderEndColor: String? { stringValue("borderEndColor") }

    var borderRadius: CGFloat? { numericValue("borderRadius") }
    var borderTopLeftRadius: CGFloat? { numericValue("borderTopLeftRadius") }
    var borderTopRightRadius: CGFloat? { numericValue("borderTopRightRadius") }
    var borderBottomLeftRadius: CGFloat? { numericValue("borderBottomLeftRadius") }
    var borderBottomRightRadius: CGFloat? { numericValue("borderBottomRightRadius") }
    var borderTopStartRadius: CGFloat? { numericValue("borderTopStartRadius") }
    var borderTopEndRadius: CGFloat? { numericValue("borderTopEndRadius") }
    var borderBottomStartRadius: CGFloat? { numericValue("borderBottomStartRadius") }
    var borderBottomEndRadius: CGFloat? { numericValue("borderBottomEndRadius") }

    // MARK: - Visual
    var backgroundColor: String? { stringValue("backgroundColor") }
    var opacityValue: CGFloat { numericValue("opacity") ?? 1 }
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
    
    var onLayout: ((_: Layout) -> Void)? {
        nil
    }
}

extension FTLayoutViewProtocol {
    
    var body: some View {
        GeometryReader { geo in
            let info = FTLayoutInfo(parentSize: geo.size)
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
            if let onLayout = onLayout {
                self.content(info)
                    .padding(paddingInsets)
                    .onGeometryChange(for: Layout.self) {
                        Layout(
                            global: $0.frame(in: .global),
                            local: $0.frame(in: .local)
                        )
                    } action: {
                        onLayout($0)
                    }
                    .padding(marginInsets)
            } else {
                self.content(info)
                    .padding(paddingInsets)
                    .padding(marginInsets)
            }
        }
    }
}

struct FTView: FTLayoutViewProtocol {
    
    @Binding
    var props: [String: any Sendable]

    var handler: (@escaping FTContext.ViewHandler) -> Void

    @Binding
    var children: [AnyView]
    
    init(
        nodeId: ObjectIdentifier,
        props: Binding<[String: any Sendable]>,
        children: Binding<[AnyView]>,
        handler: @escaping (@escaping FTContext.ViewHandler) -> Void
    ) {
        self._props = props
        self._children = children
        self.handler = handler
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
    var props: [String: any Sendable]

    @Binding
    var children: [AnyView]
    
    var handler: (@escaping FTContext.ViewHandler) -> Void
    
    init(
        nodeId: ObjectIdentifier,
        props: Binding<[String: any Sendable]>,
        children: Binding<[AnyView]>,
        handler: @escaping (@escaping FTContext.ViewHandler) -> Void
    ) {
        self._props = props
        self._children = children
        self.handler = handler
    }
    
    func content(_ info: FTLayoutInfo) -> some View {
        Image("")
    }
}

struct FTTextView: FTLayoutViewProtocol {
    
    @Binding
    var props: [String: any Sendable]

    @Binding
    var children: [AnyView]
    
    var handler: (@escaping FTContext.ViewHandler) -> Void
    
    init(
        nodeId: ObjectIdentifier,
        props: Binding<[String: any Sendable]>,
        children: Binding<[AnyView]>,
        handler: @escaping (@escaping FTContext.ViewHandler) -> Void
    ) {
        self._props = props
        self._children = children
        self.handler = handler
    }
    
    func content(_ info: FTLayoutInfo) -> some View {
        Text(props["text"] as? String ?? "")
    }
}

struct FTTextInput: FTLayoutViewProtocol {
    
    @Binding
    var props: [String: any Sendable]

    @Binding
    var children: [AnyView]
    
    var handler: (@escaping FTContext.ViewHandler) -> Void
    
    init(
        nodeId: ObjectIdentifier,
        props: Binding<[String: any Sendable]>,
        children: Binding<[AnyView]>,
        handler: @escaping (@escaping FTContext.ViewHandler) -> Void
    ) {
        self._props = props
        self._children = children
        self.handler = handler
    }
    
    func content(_ info: FTLayoutInfo) -> some View {
        TextField("", text: .constant(props["text"] as? String ?? ""))
    }
}

struct FTScrollView: FTLayoutViewProtocol {
    
    @Binding
    var props: [String: any Sendable]

    @Binding
    var children: [AnyView]
    
    var handler: (@escaping FTContext.ViewHandler) -> Void
    
    init(
        nodeId: ObjectIdentifier,
        props: Binding<[String: any Sendable]>,
        children: Binding<[AnyView]>,
        handler: @escaping (@escaping FTContext.ViewHandler) -> Void
    ) {
        self._props = props
        self._children = children
        self.handler = handler
    }
    
    func content(_ info: FTLayoutInfo) -> some View {
        let horizontal = props["horizontal"] as? Bool ?? false
        let vertical = props["vertical"] as? Bool ?? false

        var axes: Axis.Set = []
        if horizontal { axes.insert(.horizontal) }
        if vertical { axes.insert(.vertical) }

        return ScrollView(axes) { children.first }
    }
}
