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

struct LayoutInfo {
    let parentSize: CGSize
}

protocol FTViewProtocol: View {
    
    var props: [String: any Sendable] { get }
    
    var children: [AnyView] { get }
    
    init(
        nodeId: ObjectIdentifier,
        props: Binding<[String: any Sendable]>,
        handler: (@escaping FTContext.ViewHandler) -> Void,
        children: Binding<[AnyView]>
    )
}

protocol FTLayoutViewProtocol: FTViewProtocol {
    
    associatedtype Content: View
    
    func content(_ info: LayoutInfo) -> Self.Content
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

    func string(_ key: String) -> String? {
        guard let v = style[key] else { return nil }
        if let s = v as? String { return s }
        if let i = v as? Int { return String(i) }
        if let d = v as? Double { return String(d) }
        return nil
    }

    func dimension(_ key: String) -> DimensionValue? {
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

    func cgFloat(_ key: String) -> CGFloat? {
        guard let dim = dimension(key) else { return nil }
        switch dim {
        case .auto: return nil
        case .point(let val): return val
        case .percent(let pct): return CGFloat(pct) / 100.0
        }
    }



    // MARK: - Layout / Box
    var display: String? { string("display") }

    var width: DimensionValue? { dimension("width") }
    var height: DimensionValue? { dimension("height") }
    var minWidth: DimensionValue? { dimension("minWidth") }
    var minHeight: DimensionValue? { dimension("minHeight") }
    var maxWidth: DimensionValue? { dimension("maxWidth") }
    var maxHeight: DimensionValue? { dimension("maxHeight") }

    var left: DimensionValue? { dimension("left") }
    var right: DimensionValue? { dimension("right") }
    var top: DimensionValue? { dimension("top") }
    var bottomValue: DimensionValue? { dimension("bottom") }
    var start: DimensionValue? { dimension("start") }
    var end: DimensionValue? { dimension("end") }

    var inset: String? { string("inset") }

    var aspectRatioValue: CGFloat? {
        if let s = style["aspectRatio"] as? String, let d = Double(s) { return CGFloat(d) }
        if let d = style["aspectRatio"] as? Double { return CGFloat(d) }
        if let i = style["aspectRatio"] as? Int { return CGFloat(i) }
        return nil
    }

    var flex: FlexValue? { flexValue("flex") }

    var flexBasis: String? { string("flexBasis") }
    var flexGrow: CGFloat { cgFloat("flexGrow") ?? 0 }
    var flexShrink: CGFloat { cgFloat("flexShrink") ?? 0 }
    var flexWrap: String? { string("flexWrap") }
    var order: Int { (style["order"] as? Int) ?? 0 }

    var gap: DimensionValue? { dimension("gap") }

    // layout alignments and gaps

    var position: String { string("position") ?? "static" }
    var flexDirection: String { string("flexDirection") ?? "column" }
    var alignContent: String { string("alignContent") ?? "flex-start" }
    var alignItems: String { string("alignItems") ?? "stretch" }
    var alignSelf: String { string("alignSelf") ?? "auto" }
    var justifyContent: String { string("justifyContent") ?? "stretch" }
    var justifyItems: String { string("justifyItems") ?? "stretch" }
    var justifySelf: String { string("justifySelf") ?? "auto" }

    var columnGap: DimensionValue? { dimension("columnGap") }

    var rowGap: DimensionValue? { dimension("rowGap") }

    var overflow: String { string("overflow") ?? "visible" }

    // per-side padding and margin
    var paddingTop: DimensionValue? { dimension("paddingTop") }
    var paddingLeft: DimensionValue? { dimension("paddingLeft") }
    var paddingRight: DimensionValue? { dimension("paddingRight") }
    var paddingBottom: DimensionValue? { dimension("paddingBottom") }

    var marginTop: DimensionValue? { dimension("marginTop") }
    var marginLeft: DimensionValue? { dimension("marginLeft") }
    var marginRight: DimensionValue? { dimension("marginRight") }
    var marginBottom: DimensionValue? { dimension("marginBottom") }

    // MARK: - Padding / Margin (extras)
    var padding: DimensionValue? { dimension("padding") }
    var paddingHorizontal: DimensionValue? { dimension("paddingHorizontal") }
    var paddingVertical: DimensionValue? { dimension("paddingVertical") }
    var paddingStart: DimensionValue? { dimension("paddingStart") }
    var paddingEnd: DimensionValue? { dimension("paddingEnd") }

    var margin: DimensionValue? { dimension("margin") }
    var marginHorizontal: DimensionValue? { dimension("marginHorizontal") }
    var marginVertical: DimensionValue? { dimension("marginVertical") }
    var marginStart: DimensionValue? { dimension("marginStart") }
    var marginEnd: DimensionValue? { dimension("marginEnd") }

    // MARK: - Border
    var borderWidth: DimensionValue? { dimension("borderWidth") }
    var borderTopWidth: DimensionValue? { dimension("borderTopWidth") }
    var borderBottomWidth: DimensionValue? { dimension("borderBottomWidth") }
    var borderLeftWidth: DimensionValue? { dimension("borderLeftWidth") }
    var borderRightWidth: DimensionValue? { dimension("borderRightWidth") }
    var borderStartWidth: DimensionValue? { dimension("borderStartWidth") }
    var borderEndWidth: DimensionValue? { dimension("borderEndWidth") }

    var borderColor: String? { string("borderColor") }
    var borderTopColor: String? { string("borderTopColor") }
    var borderBottomColor: String? { string("borderBottomColor") }
    var borderLeftColor: String? { string("borderLeftColor") }
    var borderRightColor: String? { string("borderRightColor") }
    var borderStartColor: String? { string("borderStartColor") }
    var borderEndColor: String? { string("borderEndColor") }

    var borderRadius: DimensionValue? { dimension("borderRadius") }
    var borderTopLeftRadius: DimensionValue? { dimension("borderTopLeftRadius") }
    var borderTopRightRadius: DimensionValue? { dimension("borderTopRightRadius") }
    var borderBottomLeftRadius: DimensionValue? { dimension("borderBottomLeftRadius") }
    var borderBottomRightRadius: DimensionValue? { dimension("borderBottomRightRadius") }
    var borderTopStartRadius: DimensionValue? { dimension("borderTopStartRadius") }
    var borderTopEndRadius: DimensionValue? { dimension("borderTopEndRadius") }
    var borderBottomStartRadius: DimensionValue? { dimension("borderBottomStartRadius") }
    var borderBottomEndRadius: DimensionValue? { dimension("borderBottomEndRadius") }

    // MARK: - Visual
    var backgroundColor: String? { string("backgroundColor") }
    var opacityValue: CGFloat { cgFloat("opacity") ?? 1 }
    var outlineColor: String? { string("outlineColor") }
    var outlineStyle: String? { string("outlineStyle") }
    var outlineWidth: DimensionValue? { dimension("outlineWidth") }
    var outlineOffset: DimensionValue? { dimension("outlineOffset") }
    var borderStyleProp: String? { string("borderStyle") }
    var borderCurve: String? { string("borderCurve") }

    var boxShadow: Any? { style["boxShadow"] }
    var filter: Any? { style["filter"] }

    var mixBlendMode: String? { string("mixBlendMode") }

    // MARK: - Interaction / Misc
    var pointerEvents: String? { string("pointerEvents") }
    var cursor: String? { string("cursor") }
    var userSelect: String? { string("userSelect") }
    var boxSizing: String? { string("boxSizing") }

    // MARK: - Transforms
    var transform: Any? { style["transform"] }
    var transformOrigin: Any? { style["transformOrigin"] }
}


extension FTLayoutViewProtocol {
    
    var onLayout: ((_: Layout) -> Void)? {
        nil
    }
}

extension FTLayoutViewProtocol {
    
    var body: some View {
        GeometryReader { geo in
            let info = LayoutInfo(parentSize: geo.size)
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
    
    @Binding
    var children: [AnyView]
    
    init(
        nodeId: ObjectIdentifier,
        props: Binding<[String: any Sendable]>,
        handler: (@escaping FTContext.ViewHandler) -> Void,
        children: Binding<[AnyView]>
    ) {
        self._props = props
        self._children = children
    }
    
    func content(_ info: LayoutInfo) -> some View {
        let isRow = flexDirection.hasPrefix("row")
        let isReverse = flexDirection.hasSuffix("-reverse")
        let spacing =
            (isRow ? rowGap : columnGap)?.resolve(relativeBase: info.parentSize.width) ?? 0

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
    
    init(
        nodeId: ObjectIdentifier,
        props: Binding<[String: any Sendable]>,
        handler: (@escaping FTContext.ViewHandler) -> Void,
        children: Binding<[AnyView]>
    ) {
        self._props = props
        self._children = children
    }
    
    func content(_ info: LayoutInfo) -> some View {
        Image("")
    }
}

struct FTTextView: FTLayoutViewProtocol {
    
    @Binding
    var props: [String: any Sendable]
    
    @Binding
    var children: [AnyView]
    
    init(
        nodeId: ObjectIdentifier,
        props: Binding<[String: any Sendable]>,
        handler: (@escaping FTContext.ViewHandler) -> Void,
        children: Binding<[AnyView]>
    ) {
        self._props = props
        self._children = children
    }
    
    func content(_ info: LayoutInfo) -> some View {
        Text(props["text"] as? String ?? "")
    }
}

struct FTTextInput: FTLayoutViewProtocol {
    
    @Binding
    var props: [String: any Sendable]
    
    @Binding
    var children: [AnyView]
    
    init(
        nodeId: ObjectIdentifier,
        props: Binding<[String: any Sendable]>,
        handler: (@escaping FTContext.ViewHandler) -> Void,
        children: Binding<[AnyView]>
    ) {
        self._props = props
        self._children = children
    }
    
    func content(_ info: LayoutInfo) -> some View {
        TextField("", text: .constant(props["text"] as? String ?? ""))
    }
}

struct FTScrollView: FTLayoutViewProtocol {
    
    @Binding
    var props: [String: any Sendable]
    
    @Binding
    var children: [AnyView]
    
    init(
        nodeId: ObjectIdentifier,
        props: Binding<[String: any Sendable]>,
        handler: (@escaping FTContext.ViewHandler) -> Void,
        children: Binding<[AnyView]>
    ) {
        self._props = props
        self._children = children
    }
    
    func content(_ info: LayoutInfo) -> some View {
        let horizontal = props["horizontal"] as? Bool ?? false
        let vertical = props["vertical"] as? Bool ?? false

        var axes: Axis.Set = []
        if horizontal { axes.insert(.horizontal) }
        if vertical { axes.insert(.vertical) }

        return ScrollView(axes) { children.first }
    }
}
