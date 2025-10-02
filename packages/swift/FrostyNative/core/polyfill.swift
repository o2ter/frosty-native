//
//  polyfill.swift
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

extension FTContext {

    func polyfill() {
        self.context.globalObject["__FROSTY_SPEC__"] = [
            "NativeModules": [:]
        ]
        self.register(name: "localStorage", NativeLocalStorage())
        self.register(name: "FTView", FTView.init(nodeId:props:children:handler:))
        self.register(name: "FTImageView", FTImageView.init(nodeId:props:children:handler:))
        self.register(name: "FTTextView", FTTextView.init(nodeId:props:children:handler:))
        self.register(name: "FTTextInput", FTTextInput.init(nodeId:props:children:handler:))
        self.register(name: "FTScrollView", FTScrollView.init(nodeId:props:children:handler:))
    }
}

extension FTContext {

    public var nativeModules: SwiftJS.Value {
        return self.context.globalObject["__FROSTY_SPEC__"]["NativeModules"]
    }
}

extension FTContext {

    public func register(name: String, _ module: SwiftJS.Export) {
        self.nativeModules[name] = .init(module, in: self.context)
    }

    public func register(name: String, _ module: SwiftJS.Export.Type) {
        self.nativeModules[name] = .init(module, in: self.context)
    }
}

extension FTContext {

    public typealias ViewHandler = @MainActor @Sendable (
        _ nodeId: String,
        _ method: String,
        _ args: [SwiftJS.Value]
    ) -> Void

    public typealias ViewProvider = @MainActor @Sendable (
        _ nodeId: ObjectIdentifier,
        _ props: Binding<[String: any Sendable]>,
        _ children: Binding<[AnyView]>,
        _ handler: @escaping ViewHandler
    ) -> any View

    public func register(name: String, _ provider: @escaping ViewProvider) {
        self.nativeModules[name] = .init(in: self.context) { _, _ in
            return .init(FTNode.State(provider: provider), in: self.context)
        }
    }
}
