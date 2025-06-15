//
//  node.swift
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

@objc protocol FTNodeExport: JSExport {

    func invoke(_ method: String, _ args: [any Sendable])

    func update(_ props: [String: any Sendable])

    func replaceChildren(_ children: [FTNode.State])

    func destroy()
}

struct FTNode: View {

    @Binding var node: FTNode.State

    init(state: Binding<FTNode.State>) {
        self._node = state
    }
}

extension FTNode: @preconcurrency Identifiable {
    
    var id: ObjectIdentifier {
        ObjectIdentifier(node)
    }
}

extension FTNode {
    
    var provider: FTContext.ViewProvider {
        self.node.provider
    }

    var body: some View {
        AnyView(
            self.provider(
                self.$node.props,
                .constant(self.$node.children.map {
                    AnyView(FTNode(state: $0))
                })
            )
        )
    }
}

extension FTNode {

    @Observable
    class State: NSObject, FTNodeExport {

        let provider: FTContext.ViewProvider

        var props: [String: any Sendable]

        var children: [FTNode.State]

        init(provider: @escaping FTContext.ViewProvider) {
            self.provider = provider
            self.props = [:]
            self.children = []
        }
    }
}

extension FTNode.State {

    func invoke(_ method: String, _ args: [any Sendable]) {
        
    }

    func update(_ props: [String: any Sendable]) {
        self.props = props
    }

    func replaceChildren(_ children: [FTNode.State]) {
        if self.children != children {
            self.children = children
        }
    }

    func destroy() {
        self.props = [:]
        self.children = []
    }
}
