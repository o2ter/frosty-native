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

struct WindowDimensions: Equatable {
    
    var size: CGSize
    
    var safeAreaInsets: EdgeInsets
    
    init(_ geometry: GeometryProxy) {
        self.size = geometry.size
        self.safeAreaInsets = geometry.safeAreaInsets
    }
}

public struct FTRoot: View {
    
    @Environment(\.colorScheme)
    var colorScheme
    
    @Environment(\.colorSchemeContrast)
    var colorSchemeContrast
    
    @Environment(\.displayScale)
    var displayScale
    
    @Environment(\.pixelLength)
    var pixelLength
    
    @Environment(\.locale)
    var locale
    
    @Environment(\.font)
    var defaultFont
    
    let appKey: String
    let runtime: FTContext
    
    @State var runner: JSCore.Value?
    @State var node: FTNode.State
    
    public init(appKey: String, runtime: FTContext) {
        self.appKey = appKey
        self.runtime = runtime
        self.node = FTNode.State(provider: FTView.init(props:children:handler:))
    }
    
    public var body: some View {
        GeometryReader { geometry in
            FTNode(state: self.$node)
                .ignoresSafeArea()
                .onChange(of: WindowDimensions(geometry), initial: true) {
                    print(WindowDimensions(geometry))
                }
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
}

extension FTRoot {
    
    fileprivate static func run(
        appKey: String,
        runtime: FTContext,
        node: FTNode.State
    ) -> JSCore.Value {
        let registry = runtime.evaluateScript("__FROSTY_SPEC__.AppRegistry")
        let runner = registry.invokeMethod("getRunnable", withArguments: [.init(appKey)])
        return runner.invokeMethod("run", withArguments: [[
            "root": JSCore.Value(node, in: runtime.context),
        ]])
    }
}
