//
//  native.swift
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

public final class FTContext: Sendable {

    public let context: SwiftJS

    init(
        _ vm: SwiftJS.VirtualMachine = FTContext.createVirtualMachine()
    ) {
        self.context = SwiftJS(vm)
        self.polyfill()
    }
}

extension FTContext {
    
    static func createVirtualMachine() -> SwiftJS.VirtualMachine {
        class Ref: @unchecked Sendable {
            var vm: SwiftJS.VirtualMachine!
        }
        let signal = DispatchSemaphore(value: 0)
        let ref = Ref()
        let thread = Thread {
            ref.vm = SwiftJS.VirtualMachine()
            signal.signal()
            RunLoop.current.run()
        }
        thread.qualityOfService = .userInteractive
        thread.start()
        signal.wait()
        return ref.vm
    }
}

extension FTContext {
    
    public var virtualMachine: SwiftJS.VirtualMachine {
        return self.context.virtualMachine
    }
    
    public var runloop: RunLoop {
        return self.context.runloop
    }
    
}

extension FTContext {

    public var globalObject: SwiftJS.Value {
        return self.context.globalObject
    }
    
    public var exception: SwiftJS.Value {
        return self.context.exception
    }
    
    @discardableResult
    public func evaluateScript(_ script: String) -> SwiftJS.Value {
        return self.context.evaluateScript(script)
    }
    
    @discardableResult
    public func evaluateScript(_ script: String, withSourceURL sourceURL: URL) -> SwiftJS.Value {
        return self.context.evaluateScript(script, withSourceURL: sourceURL)
    }
}
