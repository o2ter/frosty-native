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
    
    func update(_ props: [String: any Sendable])
    
    func replaceChildren(_ children: [FTNode.State])
}

struct FTNode: View {
    
    @StateObject var node: FTNode.State
    
    init(state: FTNode.State) {
        self._node = StateObject(wrappedValue: state)
    }
}

extension FTNode {
    
    var type: any FTViewProtocol.Type {
        self.node.type
    }
    
    var props: [String: any Sendable] {
        self.node.props
    }
    
    var children: [FTNode] {
        self.node.children.map(FTNode.init)
    }
    
    var body: some View {
        AnyView(self.type.init(
            props: self.props,
            children: self.children
        ))
    }
}

extension FTNode {
    
    @MainActor
    class State: NSObject, ObservableObject, FTNodeExport {
        
        let type: any FTViewProtocol.Type
        
        @Published var props: [String: any Sendable]
        
        @Published var children: [FTNode.State]
        
        init(type: any FTViewProtocol.Type) {
            self.type = type
            self.props = [:]
            self.children = []
        }
    }
}

extension FTNode.State {
    
    func _update(_ props: [String: any Sendable]) async {
        self.props = props
    }
    
    func _replaceChildren(_ children: [FTNode.State]) async {
        self.children = children
    }
}

extension FTNode.State {
    
    nonisolated func update(_ props: [String: any Sendable]) {
        Task {
            await self._update(props)
        }
    }
    
    nonisolated func replaceChildren(_ children: [FTNode.State]) {
        Task {
            await self._replaceChildren(children)
        }
    }
}
