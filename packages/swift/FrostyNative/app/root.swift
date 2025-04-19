//
//  root.swift
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

public struct FTRoot: View {
    
    let appKey: String
    let runtime: FrostyNative
    
    @State var runner: JSCore.Value?
    @StateObject var node: FTNode.State
    
    public init(appKey: String, runtime: FrostyNative) {
        self.appKey = appKey
        self.runtime = runtime
        self._node = StateObject(wrappedValue: FTNode.State(type: FTView.self))
    }
    
    public var body: some View {
        FTNode(state: self.node)
            .onAppear {
                self.runner = FTRoot.run(
                    appKey: appKey,
                    runtime: runtime,
                    node: node
                )
            }
            .onDisappear {
                self.runner?.invokeMethod("unmount")
                self.runner = nil
            }
    }
}

extension FTRoot {
    
    fileprivate static func run(
        appKey: String,
        runtime: FrostyNative,
        node: FTNode.State
    ) -> JSCore.Value {
        let registry = runtime.evaluateScript("__FROSTY_SPEC__.AppRegistry")
        let runner = registry.invokeMethod("getRunnable", withArguments: [.init(appKey)])
        return runner.invokeMethod("run", withArguments: [[
            "root": JSCore.Value(node, in: runtime.context),
        ]])
    }
}
