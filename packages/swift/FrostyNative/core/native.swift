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

public final class FrostyNative: Sendable {

    public let context: JSCore

    init(
        _ vm: JSCore.VirtualMachine = FrostyNative.createVirtualMachine()
    ) {
        self.context = JSCore(vm)
        self.polyfill()
    }
}

extension FrostyNative {
    
    static func createVirtualMachine() -> JSCore.VirtualMachine {
        class Ref: @unchecked Sendable {
            var vm: JSCore.VirtualMachine!
        }
        let signal = DispatchSemaphore(value: 0)
        let ref = Ref()
        let thread = Thread {
            ref.vm = JSCore.VirtualMachine()
            signal.signal()
            RunLoop.current.run()
        }
        thread.qualityOfService = .userInteractive
        thread.start()
        signal.wait()
        return ref.vm
    }
}

extension FrostyNative {
    
    public var virtualMachine: JSCore.VirtualMachine {
        return self.context.virtualMachine
    }
    
    public var runloop: RunLoop {
        return self.context.runloop
    }
    
}

extension FrostyNative {

    public var globalObject: JSCore.Value {
        return self.context.globalObject
    }
    
    public var exception: JSCore.Value {
        return self.context.exception
    }
    
    @discardableResult
    public func evaluateScript(_ script: String) -> JSCore.Value {
        return self.context.evaluateScript(script)
    }
    
    @discardableResult
    public func evaluateScript(_ script: String, withSourceURL sourceURL: URL) -> JSCore.Value {
        return self.context.evaluateScript(script, withSourceURL: sourceURL)
    }
}
