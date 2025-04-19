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

extension FrostyNative {
    
    func polyfill() {
        self.context.globalObject["__FROSTY_SPEC__"] = [
            "NativeModules": [:]
        ]
        self.register(name: "localStorage", module: NativeLocalStorage())
        self.register(name: "FTView", type: FTView.self)
        self.register(name: "FTTextView", type: FTTextView.self)
    }
}

extension FrostyNative {
    
    public var nativeModules: JSCore.Value {
        return self.context.globalObject["__FROSTY_SPEC__"]["NativeModules"]
    }
}

extension FrostyNative {
    
    public func register(name: String, module: JSCore.Export) {
        self.nativeModules[name] = .init(module, in: self.context)
    }
    
    public func register(name: String, module: JSCore.Export.Type) {
        self.nativeModules[name] = .init(module, in: self.context)
    }
}

extension FrostyNative {
    
    public func register(name: String, type: any FTViewProtocol.Type) {
        self.nativeModules[name] = .init(in: self.context) { _, _ in
            return .init(FTNode.State(type: type), in: self.context)
        }
    }
}
