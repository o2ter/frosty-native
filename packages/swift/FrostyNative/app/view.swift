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

    var layout: [String: any Sendable] {
        return props["layout"] as? [String: any Sendable] ?? [:]
    }

    var paddingTop: CGFloat {
        return layout["paddingTop"] as? CGFloat ?? 0
    }

    var paddingLeft: CGFloat {
        return layout["paddingLeft"] as? CGFloat ?? 0
    }

    var paddingRight: CGFloat {
        return layout["paddingRight"] as? CGFloat ?? 0
    }

    var paddingBottom: CGFloat {
        return layout["paddingBottom"] as? CGFloat ?? 0
    }
    
    var onLayout: ((_: Layout) -> Void)? {
        nil
    }

    var body: some View {
        
        let view = self.content.padding(
            EdgeInsets(
                top: paddingTop,
                leading: paddingLeft,
                bottom: paddingBottom,
                trailing: paddingRight
            ))
        
        if let onLayout = onLayout {
            return AnyView(view.onGeometryChange(for: Layout.self) {
                Layout(
                    global: $0.frame(in: .global),
                    local: $0.frame(in: .local)
                )
            } action: { onLayout($0) })
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

    var lazy: Bool {
        return props["lazy"] as? Bool ?? false
    }

    var spacing: CGFloat {
        return props["spacing"] as? CGFloat ?? 0
    }

    var row: Bool {
        return props["row"] as? Bool ?? false
    }

    var content: some View {
        switch (lazy, row) {
        case (true, true):
            LazyHStack(spacing: spacing) {
                ForEach(Array(children.enumerated()), id: \.offset) {
                    $0.element
                }
            }
        case (true, false):
            LazyVStack(spacing: spacing) {
                ForEach(Array(children.enumerated()), id: \.offset) {
                    $0.element
                }
            }
        case (false, true):
            HStackLayout(spacing: spacing) {
                ForEach(Array(children.enumerated()), id: \.offset) {
                    $0.element
                }
            }
        case (false, false):
            VStackLayout(spacing: spacing) {
                ForEach(Array(children.enumerated()), id: \.offset) {
                    $0.element
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
