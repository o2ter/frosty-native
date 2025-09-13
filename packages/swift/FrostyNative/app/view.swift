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
    
    init(
        nodeId: ObjectIdentifier,
        props: Binding<[String: any Sendable]>,
        handler: (@escaping FTContext.ViewHandler) -> Void,
        children: Binding<[AnyView]>
    )
}

protocol FTLayoutViewProtocol: FTViewProtocol {
    
    associatedtype Content: View
    
    @ViewBuilder @MainActor @preconcurrency var content: Self.Content { get }
}

struct Layout: Equatable {
    
    var global: CGRect
    
    var local: CGRect
}

extension FTLayoutViewProtocol {
    
    var style: [String: any Sendable] {
        return props["style"] as? [String: any Sendable] ?? [:]
    }
}

extension FTLayoutViewProtocol {

    // MARK: - Helpers
    func cgFloat(_ key: String) -> CGFloat? {
        guard let v = style[key] else { return nil }
        if let f = v as? CGFloat { return f }
        if let d = v as? Double { return CGFloat(d) }
        if let i = v as? Int { return CGFloat(i) }
        if let s = v as? String {
            if s == "auto" { return nil }
            if s.hasSuffix("%") { return nil }
            if let d = Double(s) { return CGFloat(d) }
        }
        return nil
    }

    func optionalCGFloat(_ key: String) -> CGFloat? {
        guard let v = style[key] else { return nil }
        if let f = v as? CGFloat { return f }
        if let d = v as? Double { return CGFloat(d) }
        if let i = v as? Int { return CGFloat(i) }
        if let s = v as? String {
            if s == "auto" { return nil }
            if s.hasSuffix("%") { return nil }
            if let d = Double(s) { return CGFloat(d) }
        }
        return nil
    }

    func stringVal(_ key: String) -> String? {
        guard let v = style[key] else { return nil }
        if let s = v as? String { return s }
        if let i = v as? Int { return String(i) }
        if let d = v as? Double { return String(d) }
        return nil
    }

    func boolVal(_ key: String) -> Bool? {
        guard let v = style[key] else { return nil }
        if let b = v as? Bool { return b }
        if let i = v as? Int { return i != 0 }
        if let s = v as? String {
            return ["true", "1", "yes", "on"].contains(s.lowercased())
        }
        return nil
    }

    func dictVal(_ key: String) -> [String: any Sendable]? {
        return style[key] as? [String: any Sendable]
    }

    func anyArray(_ key: String) -> [Any]? {
        return style[key] as? [Any]
    }

    // MARK: - Layout / Box
    var display: String? { stringVal("display") }

    var width: CGFloat? { optionalCGFloat("width") }
    var height: CGFloat? { optionalCGFloat("height") }
    var minWidth: CGFloat? { optionalCGFloat("minWidth") }
    var minHeight: CGFloat? { optionalCGFloat("minHeight") }
    var maxWidth: CGFloat? { optionalCGFloat("maxWidth") }
    var maxHeight: CGFloat? { optionalCGFloat("maxHeight") }

    var left: CGFloat? { optionalCGFloat("left") }
    var right: CGFloat? { optionalCGFloat("right") }
    var top: CGFloat? { optionalCGFloat("top") }
    var bottomValue: CGFloat? { optionalCGFloat("bottom") }
    var start: CGFloat? { optionalCGFloat("start") }
    var end: CGFloat? { optionalCGFloat("end") }

    var inset: String? { stringVal("inset") }

    var aspectRatioValue: CGFloat? {
        if let s = style["aspectRatio"] as? String, let d = Double(s) { return CGFloat(d) }
        if let d = style["aspectRatio"] as? Double { return CGFloat(d) }
        if let i = style["aspectRatio"] as? Int { return CGFloat(i) }
        return nil
    }

    var flex: String? {
        if let s = style["flex"] as? String { return s }
        if let n = style["flex"] as? Double { return String(n) }
        if let i = style["flex"] as? Int { return String(i) }
        return nil
    }

    var flexBasis: String? { stringVal("flexBasis") }
    var flexGrow: CGFloat { cgFloat("flexGrow") ?? 0 }
    var flexShrink: CGFloat { cgFloat("flexShrink") ?? 0 }
    var flexWrap: String? { stringVal("flexWrap") }
    var order: Int { (style["order"] as? Int) ?? 0 }

    var gap: CGFloat { cgFloat("gap") ?? 0 }

    // layout alignments and gaps

    var position: String { stringVal("position") ?? "static" }

    var flexDirection: String { stringVal("flexDirection") ?? "column" }

    var alignContent: String { stringVal("alignContent") ?? "flex-start" }

    var alignItems: String { stringVal("alignItems") ?? "stretch" }

    var alignSelf: String { stringVal("alignSelf") ?? "auto" }

    var justifyContent: String { stringVal("justifyContent") ?? "stretch" }

    var justifyItems: String { stringVal("justifyItems") ?? "stretch" }

    var justifySelf: String { stringVal("justifySelf") ?? "auto" }

    var columnGap: CGFloat { cgFloat("columnGap") ?? 0 }

    var rowGap: CGFloat { cgFloat("rowGap") ?? 0 }

    var overflow: String { stringVal("overflow") ?? "visible" }

    // per-side padding and margin
    var paddingTop: CGFloat { cgFloat("paddingTop") ?? 0 }
    var paddingLeft: CGFloat { cgFloat("paddingLeft") ?? 0 }
    var paddingRight: CGFloat { cgFloat("paddingRight") ?? 0 }
    var paddingBottom: CGFloat { cgFloat("paddingBottom") ?? 0 }

    var marginTop: CGFloat { cgFloat("marginTop") ?? 0 }
    var marginLeft: CGFloat { cgFloat("marginLeft") ?? 0 }
    var marginRight: CGFloat { cgFloat("marginRight") ?? 0 }
    var marginBottom: CGFloat { cgFloat("marginBottom") ?? 0 }

    // MARK: - Padding / Margin (extras)
    var padding: CGFloat { cgFloat("padding") ?? 0 }
    var paddingHorizontal: CGFloat { cgFloat("paddingHorizontal") ?? 0 }
    var paddingVertical: CGFloat { cgFloat("paddingVertical") ?? 0 }
    var paddingStart: CGFloat { cgFloat("paddingStart") ?? 0 }
    var paddingEnd: CGFloat { cgFloat("paddingEnd") ?? 0 }

    var margin: CGFloat { cgFloat("margin") ?? 0 }
    var marginHorizontal: CGFloat { cgFloat("marginHorizontal") ?? 0 }
    var marginVertical: CGFloat { cgFloat("marginVertical") ?? 0 }
    var marginStart: CGFloat { cgFloat("marginStart") ?? 0 }
    var marginEnd: CGFloat { cgFloat("marginEnd") ?? 0 }

    // MARK: - Border
    var borderWidth: CGFloat { cgFloat("borderWidth") ?? 0 }
    var borderTopWidth: CGFloat { cgFloat("borderTopWidth") ?? 0 }
    var borderBottomWidth: CGFloat { cgFloat("borderBottomWidth") ?? 0 }
    var borderLeftWidth: CGFloat { cgFloat("borderLeftWidth") ?? 0 }
    var borderRightWidth: CGFloat { cgFloat("borderRightWidth") ?? 0 }
    var borderStartWidth: CGFloat { cgFloat("borderStartWidth") ?? 0 }
    var borderEndWidth: CGFloat { cgFloat("borderEndWidth") ?? 0 }

    var borderColor: String? { stringVal("borderColor") }
    var borderTopColor: String? { stringVal("borderTopColor") }
    var borderBottomColor: String? { stringVal("borderBottomColor") }
    var borderLeftColor: String? { stringVal("borderLeftColor") }
    var borderRightColor: String? { stringVal("borderRightColor") }
    var borderStartColor: String? { stringVal("borderStartColor") }
    var borderEndColor: String? { stringVal("borderEndColor") }

    var borderRadius: CGFloat { cgFloat("borderRadius") ?? 0 }
    var borderTopLeftRadius: CGFloat { cgFloat("borderTopLeftRadius") ?? 0 }
    var borderTopRightRadius: CGFloat { cgFloat("borderTopRightRadius") ?? 0 }
    var borderBottomLeftRadius: CGFloat { cgFloat("borderBottomLeftRadius") ?? 0 }
    var borderBottomRightRadius: CGFloat { cgFloat("borderBottomRightRadius") ?? 0 }
    var borderTopStartRadius: CGFloat { cgFloat("borderTopStartRadius") ?? 0 }
    var borderTopEndRadius: CGFloat { cgFloat("borderTopEndRadius") ?? 0 }
    var borderBottomStartRadius: CGFloat { cgFloat("borderBottomStartRadius") ?? 0 }
    var borderBottomEndRadius: CGFloat { cgFloat("borderBottomEndRadius") ?? 0 }

    // MARK: - Visual
    var backgroundColor: String? { stringVal("backgroundColor") }
    var opacityValue: CGFloat { cgFloat("opacity") ?? 1 }
    var outlineColor: String? { stringVal("outlineColor") }
    var outlineStyle: String? { stringVal("outlineStyle") }
    var outlineWidth: CGFloat { cgFloat("outlineWidth") ?? 0 }
    var outlineOffset: CGFloat { cgFloat("outlineOffset") ?? 0 }
    var borderStyleProp: String? { stringVal("borderStyle") }
    var borderCurve: String? { stringVal("borderCurve") }

    var boxShadow: Any? { style["boxShadow"] }
    var filter: Any? { style["filter"] }

    var mixBlendMode: String? { stringVal("mixBlendMode") }

    // MARK: - Interaction / Misc
    var pointerEvents: String? { stringVal("pointerEvents") }
    var cursor: String? { stringVal("cursor") }
    var userSelect: String? { stringVal("userSelect") }
    var boxSizing: String? { stringVal("boxSizing") }

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
        
        var view: any View = self.content
        
        if paddingTop != 0 || paddingLeft != 0 || paddingBottom != 0 || paddingRight != 0 {
            view = view.padding(
                EdgeInsets(
                    top: paddingTop,
                    leading: paddingLeft,
                    bottom: paddingBottom,
                    trailing: paddingRight
                ))
        }
        
        if let onLayout = onLayout {
            view = view.onGeometryChange(for: Layout.self) {
                Layout(
                    global: $0.frame(in: .global),
                    local: $0.frame(in: .local)
                )
            } action: { onLayout($0) }
        }
        
        if marginTop != 0 || marginLeft != 0 || marginBottom != 0 || marginRight != 0 {
            view = view.padding(
                EdgeInsets(
                    top: marginTop,
                    leading: marginLeft,
                    bottom: marginBottom,
                    trailing: marginRight
                ))
        }
        
        return AnyView(view)
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
    
    var content: some View {
        switch flexDirection {
        case "row":
            HStackLayout(spacing: rowGap) {
                ForEach(children.indexed(), id: \.index) {
                    $0.element
                }
            }
        case "row-reverse":
            HStackLayout(spacing: rowGap) {
                ForEach(children.reversed().indexed(), id: \.index) {
                    $0.element
                }
            }
        case "column":
            VStackLayout(spacing: columnGap) {
                ForEach(children.indexed(), id: \.index) {
                    $0.element
                }
            }
        case "column-reverse":
            VStackLayout(spacing: columnGap) {
                ForEach(children.reversed().indexed(), id: \.index) {
                    $0.element
                }
            }
        default:
            EmptyView()
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
    
    var content: some View {
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
    
    var text: String {
        return props["text"] as? String ?? ""
    }
    
    var content: some View {
        Text(self.text)
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
    
    var text: String {
        return props["text"] as? String ?? ""
    }
    
    var content: some View {
        TextField("", text: .constant(self.text))
    }
}

struct FTScrollView: FTLayoutViewProtocol {
    
    @Binding
    var props: [String: any Sendable]
    
    @Binding
    var children: [AnyView]
    
    var horizontal: Bool {
        return props["horizontal"] as? Bool ?? false
    }
    
    var vertical: Bool {
        return props["vertical"] as? Bool ?? false
    }
    
    var axes: Axis.Set {
        switch (horizontal, vertical) {
        case (false, false): return []
        case (true, false): return [.horizontal]
        case (false, true): return [.vertical]
        case (true, true): return [.horizontal, .vertical]
        }
    }
    
    init(
        nodeId: ObjectIdentifier,
        props: Binding<[String: any Sendable]>,
        handler: (@escaping FTContext.ViewHandler) -> Void,
        children: Binding<[AnyView]>
    ) {
        self._props = props
        self._children = children
    }
    
    var content: some View {
        ScrollView(axes) { children.first }
    }
}
