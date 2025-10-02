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

import Network

extension CGRect {
    
    func toJSValue() -> SwiftJS.Value {
        return [
            "x": SwiftJS.Value(self.minX),
            "y": SwiftJS.Value(self.minY),
            "width": SwiftJS.Value(self.width),
            "height": SwiftJS.Value(self.height),
        ]
    }
}

extension EdgeInsets {
    
    func toJSValue() -> SwiftJS.Value {
        return [
            "top": SwiftJS.Value(self.top),
            "left": SwiftJS.Value(self.leading),
            "right": SwiftJS.Value(self.trailing),
            "bottom": SwiftJS.Value(self.bottom),
        ]
    }
}

struct WindowDimensions: Equatable {
    
    var size: CGSize
    
    var safeAreaInsets: EdgeInsets
    
    init(_ geometry: GeometryProxy) {
        self.size = geometry.size
        self.safeAreaInsets = geometry.safeAreaInsets
    }
    
    func toJSValue() -> SwiftJS.Value {
        return [
            "displayWidth": SwiftJS.Value(size.width),
            "displayHeight": SwiftJS.Value(size.height),
            "safeAreaInsets": safeAreaInsets.toJSValue(),
        ]
    }
}

struct EnvironmentData: Equatable {
    
    var scenePhase: ScenePhase
    var layoutDirection: LayoutDirection
    var pixelDensity: CGFloat
    var pixelLength: CGFloat
    var colorScheme: ColorScheme
    var locale: Locale
    var timeZone: TimeZone
    var network: Network
    
    func toJSValue() -> SwiftJS.Value {
        return [
            "scenePhase": SwiftJS.Value(scenePhase.toString()),
            "layoutDirection": SwiftJS.Value(layoutDirection.toString()),
            "pixelDensity": SwiftJS.Value(pixelDensity),
            "pixelLength": SwiftJS.Value(pixelLength),
            "colorScheme": SwiftJS.Value(colorScheme.toString()),
            "userLocale": SwiftJS.Value(locale.identifier),
            "languages": SwiftJS.Value(Locale.preferredLanguages.map { SwiftJS.Value($0) }),
            "timeZone": SwiftJS.Value(timeZone.identifier),
            "network": [
                "online": SwiftJS.Value(network.online),
                "type": network.type.map { SwiftJS.Value($0) } ?? .undefined,
            ]
        ]
    }
}

extension ScenePhase {
    
    fileprivate func toString() -> String {
        switch self {
        case .background: "background"
        case .inactive: "inactive"
        case .active: "active"
        @unknown default: "unknown"
        }
    }
}

extension LayoutDirection {
    
    fileprivate func toString() -> String {
        switch self {
        case .leftToRight: "ltr"
        case .rightToLeft: "rtl"
        @unknown default: "ltr"
        }
    }
}

extension ColorScheme {
    
    fileprivate func toString() -> String {
        switch self {
        case .light: "light"
        case .dark: "dark"
        @unknown default: "light"
        }
    }
}

struct Network: Equatable {
    
    var online: Bool
    var type: String?
}

@Observable
@MainActor
final class NetworkMonitor {
    
    private(set) var online = false
    private(set) var type: String?
    
    private let monitor = NWPathMonitor()
    
    init() {
        monitor.pathUpdateHandler = { [weak self] path in
            guard let self = self else { return }
            Task { @MainActor in
                self.online = path.status == .satisfied
                if path.usesInterfaceType(.wiredEthernet) {
                    self.type = "ethernet"
                } else if path.usesInterfaceType(.wifi) {
                    self.type = "wifi"
                } else if path.usesInterfaceType(.cellular) {
                    self.type = "cellular"
                } else {
                    self.type = nil
                }
            }
        }
        monitor.start(queue: DispatchQueue.global())
    }
    
    deinit {
        monitor.cancel()
    }
    
    func toNetwork() -> Network {
        .init(online: online, type: type)
    }
}

public struct FTRoot: View {
    
    @State
    var network = NetworkMonitor()
    
    @Environment(\.scenePhase)
    var scenePhase
    
    @Environment(\.colorScheme)
    var colorScheme
    
    @Environment(\.colorSchemeContrast)
    var colorSchemeContrast
    
    @Environment(\.displayScale)
    var pixelDensity
    
    @Environment(\.pixelLength)
    var pixelLength
    
    @Environment(\.locale)
    var locale
    
    @Environment(\.timeZone)
    var timeZone
    
    @Environment(\.font)
    var defaultFont
    
    @Environment(\.layoutDirection)
    var layoutDirection
    
    let appKey: String
    let runtime: FTContext
    
    @State var runner: SwiftJS.Value?
    @State var node: FTNode.State
    
    public init(appKey: String, runtime: FTContext) {
        self.appKey = appKey
        self.runtime = runtime
        self.node = FTNode.State(provider: FTView.init(nodeId:props:children:eventHandler:))
    }
    
    var environment: EnvironmentData {
        EnvironmentData(
            scenePhase: scenePhase,
            layoutDirection: layoutDirection,
            pixelDensity: pixelDensity,
            pixelLength: pixelLength,
            colorScheme: colorScheme,
            locale: locale,
            timeZone: timeZone,
            network: network.toNetwork()
        )
    }
    
    public var body: some View {
        AnyView(GeometryReader { geometry in
            FTNode(runner: self.runner, state: self.$node)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .ignoresSafeArea()
                .onChange(of: WindowDimensions(geometry), initial: true) { _, newValue in
                    runner?.invokeMethod("setEnvironment", withArguments: [newValue.toJSValue()])
                }
                .onChange(of: environment, initial: true) { _, newValue in
                    runner?.invokeMethod("setEnvironment", withArguments: [newValue.toJSValue()])
                }
                .onAppear {
                    let runner = FTRoot.run(
                        appKey: appKey,
                        runtime: runtime,
                        node: node
                    )
                    runner.invokeMethod("setEnvironment", withArguments: [
                        WindowDimensions(geometry).toJSValue(),
                        environment.toJSValue()
                    ])
                    self.runner = runner
                }
                .onDisappear {
                    self.runner?.invokeMethod("unmount")
                    self.runner = nil
                }
        })
    }
}

extension FTRoot {
    
    fileprivate static func run(
        appKey: String,
        runtime: FTContext,
        node: FTNode.State
    ) -> SwiftJS.Value {
        let registry = runtime.evaluateScript("__FROSTY_SPEC__.AppRegistry")
        let runner = registry.invokeMethod("getRunnable", withArguments: [.init(appKey)])
        return runner.invokeMethod("run", withArguments: [[
            "root": SwiftJS.Value(node, in: runtime.context),
        ]])
    }
}
