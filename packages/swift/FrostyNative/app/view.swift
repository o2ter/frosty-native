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
    
    var position: String {
        return style["position"] as? String ?? "static"
    }
    
    var flexDirection: String {
        return style["flexDirection"] as? String ?? "column"
    }
    
    var alignContent: String {
        return style["alignContent"] as? String ?? "flex-start"
    }
    
    var alignItems: String {
        return style["alignItems"] as? String ?? "stretch"
    }
    
    var alignSelf: String {
        return style["alignSelf"] as? String ?? "auto"
    }
    
    var justifyContent: String {
        return style["justifyContent"] as? String ?? "stretch"
    }
    
    var justifyItems: String {
        return style["justifyItems"] as? String ?? "stretch"
    }
    
    var justifySelf: String {
        return style["justifySelf"] as? String ?? "auto"
    }
    
    var columnGap: CGFloat {
        return style["columnGap"] as? CGFloat ?? 0
    }
    
    var rowGap: CGFloat {
        return style["rowGap"] as? CGFloat ?? 0
    }
}

extension FTLayoutViewProtocol {
    
    var overflow: String {
        return style["overflow"] as? String ?? "visible"
    }
}

extension FTLayoutViewProtocol {
    
    var paddingTop: CGFloat {
        return style["paddingTop"] as? CGFloat ?? 0
    }
    
    var paddingLeft: CGFloat {
        return style["paddingLeft"] as? CGFloat ?? 0
    }
    
    var paddingRight: CGFloat {
        return style["paddingRight"] as? CGFloat ?? 0
    }
    
    var paddingBottom: CGFloat {
        return style["paddingBottom"] as? CGFloat ?? 0
    }
}

extension FTLayoutViewProtocol {
    
    var marginTop: CGFloat {
        return style["marginTop"] as? CGFloat ?? 0
    }
    
    var marginLeft: CGFloat {
        return style["marginLeft"] as? CGFloat ?? 0
    }
    
    var marginRight: CGFloat {
        return style["marginRight"] as? CGFloat ?? 0
    }
    
    var marginBottom: CGFloat {
        return style["marginBottom"] as? CGFloat ?? 0
    }
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
        ScrollView {
            ForEach(Array(children.enumerated()), id: \.offset) {
                $0.element
            }
        }
    }
}
