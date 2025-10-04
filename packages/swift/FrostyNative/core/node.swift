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

@objc protocol FTNodeExport: JSExport {

    func invoke(_ method: String, _ args: JSValue)

    func update(_ props: JSValue)

    func replaceChildren(_ children: [FTNode.State])

    func destroy()
}

struct FTNode: View {

    let runner: SwiftJS.Value?

    @Binding var node: FTNode.State

    init(runner: SwiftJS.Value?, state: Binding<FTNode.State>) {
        self.runner = runner
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
                self.id,
                self.$node.props,
                .constant(
                    self.$node.children.map {
                        AnyView(FTNode(runner: runner, state: $0))
                    }),
                { self.node.handler = $0 }
            )
        )
    }
}

extension FTNode {

    @Observable
    class State: NSObject, FTNodeExport {

        let provider: FTContext.ViewProvider

        var props: [String: JSValue]

        var children: [FTNode.State]

        var handler: FTContext.ViewHandler?

        init(provider: @escaping FTContext.ViewProvider) {
            self.provider = provider
            self.props = [:]
            self.children = []
        }
    }
}

extension FTNode.State {

    func invoke(_ method: String, _ args: JSValue) {
        guard let handler = self.handler else { return }
        Task { @MainActor in
            // Convert single JSValue to array of JSValues as expected by ViewHandler
            let argsArray: [JSValue]
            if args.isArray {
                // Manually extract array elements as JSValues to avoid recursive conversion
                var jsValues: [JSValue] = []
                if let length = args.forProperty("length").toNumber() {
                    for i in 0..<Int(length.doubleValue) {
                        jsValues.append(args.atIndex(i))
                    }
                }
                argsArray = jsValues
            } else {
                argsArray = [args]
            }
            handler(method, argsArray)
        }
    }

    func update(_ props: JSValue) {
        // Convert JSValue to [String: JSValue] dictionary without recursive conversion
        var convertedProps: [String: JSValue] = [:]

        if props.isObject && !props.isArray && !props.isNull && !props.isUndefined {
            // Manually extract object properties as JSValues to avoid recursive conversion
            if let propertyNames = props.context?.globalObject.forProperty("Object")
                .forProperty("keys").call(withArguments: [props])?.toArray()
            {

                for propertyName in propertyNames {
                    if let key = propertyName as? String {
                        convertedProps[key] = props.forProperty(key)
                    }
                }
            }
        }

        self.props = convertedProps
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
