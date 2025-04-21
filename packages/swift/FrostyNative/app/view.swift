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

public protocol FTViewProtocol: View {
    
    init(props: Binding<[String: any Sendable]>, children: [AnyView])
}

struct FTView: FTViewProtocol {
    
    @Binding var props: [String: any Sendable]
    
    var children: [AnyView]
    
    init(props: Binding<[String: any Sendable]>, children: [AnyView]) {
        self._props = props
        self.children = children
    }
    
    var lazy: Bool {
        return props["lazy"] as? Bool ?? false
    }
    
    var spacing: CGFloat {
        return props["spacing"] as? CGFloat ?? 0
    }
    
    var paddingTop: CGFloat {
        return props["paddingTop"] as? CGFloat ?? 0
    }
    
    var paddingLeft: CGFloat {
        return props["paddingLeft"] as? CGFloat ?? 0
    }
    
    var paddingRight: CGFloat {
        return props["paddingRight"] as? CGFloat ?? 0
    }
    
    var paddingBottom: CGFloat {
        return props["paddingBottom"] as? CGFloat ?? 0
    }
    
    var layoutRow: Bool {
        return props["layoutRow"] as? Bool ?? false
    }
    
    struct LayoutBase: View {
        var lazy: Bool
        var layoutRow: Bool
        var spacing: CGFloat
        var children: [AnyView]
        
        var body: some View {
            switch (lazy, layoutRow) {
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
    
    var body: some View {
        LayoutBase(
            lazy: lazy,
            layoutRow: layoutRow,
            spacing: spacing,
            children: children
        ).padding(EdgeInsets(
            top: paddingTop,
            leading: paddingLeft,
            bottom: paddingBottom,
            trailing: paddingRight
        ))
    }
}

struct FTTextView: FTViewProtocol {
    
    @Binding var props: [String: any Sendable]
    
    var children: [AnyView]
    
    init(props: Binding<[String: any Sendable]>, children: [AnyView]) {
        self._props = props
        self.children = children
    }
    
    var content: String {
        return props["text"] as? String ?? ""
    }
    
    var body: some View {
        Text(self.content)
    }
}
