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

}

public protocol FTView: View {
    
    init(props: [String: Any], children: [any View])
}

struct FTNode: View {
    
    @StateObject var node: FTNode.State
    
    init(state: FTNode.State) {
        self._node = StateObject(wrappedValue: state)
    }
}

extension FTNode {
    
    var type: any FTView.Type {
        self.node.type
    }
    
    var props: [String : Any] {
        self.node.props
    }
    
    var children: [FTNode.State] {
        self.node.children
    }
    
    var body: some View {
        AnyView(self.type.init(
            props: self.props,
            children: self.children.map(FTNode.init)
        ))
    }
}

extension FTNode {
    
    @MainActor
    class State: NSObject, ObservableObject, FTNodeExport {
        
        let type: any FTView.Type
        
        @Published var props: [String: Any]
        
        @Published var children: [FTNode.State]
        
        init(type: any FTView.Type) {
            self.type = type
            self.props = [:]
            self.children = []
        }
    }
}
