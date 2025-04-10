//
//  appDelegate.swift
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

#if canImport(AppKit)

public typealias FTApplication = NSApplication
public typealias _ApplicationDelegate = NSApplicationDelegate

public typealias FTApplicationDelegateAdaptor = NSApplicationDelegateAdaptor

#elseif canImport(UIKit)

public typealias FTApplication = UIApplication
public typealias _ApplicationDelegate = UIApplicationDelegate

public typealias FTApplicationDelegateAdaptor = UIApplicationDelegateAdaptor

#endif

open class FTAppDelegate: NSObject, _ApplicationDelegate, ObservableObject {
    
    public let runtime = FrostyNative()
    
    open func sourceURL() -> URL? {
        return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
    }
}

extension FTAppDelegate {
    
#if canImport(AppKit)
    open func applicationWillFinishLaunching(_ notification: Notification) {
        
        guard
            let sourceUrl = self.sourceURL(),
            let source = try? String(contentsOf: sourceUrl)
        else {
            return
        }
        
        self.runtime.context.evaluateScript(source)
    }
    
    open func applicationDidFinishLaunching(_ notification: Notification) {
    }
#endif
    
#if canImport(UIKit)
    open func application(
        _ application: FTApplication,
        willFinishLaunchingWithOptions launchOptions: [FTApplication.LaunchOptionsKey: Any]? = nil
    ) -> Bool {
        
        guard
            let sourceUrl = self.sourceURL(),
            let source = try? String(contentsOf: sourceUrl)
        else {
            return true
        }
        
        self.runtime.context.evaluateScript(source)
        
        return true
    }
    
    open func application(
        _ application: FTApplication,
        didFinishLaunchingWithOptions launchOptions: [FTApplication.LaunchOptionsKey: Any]? = nil
    ) -> Bool {
        
        return true
    }
#endif
    
}

extension FTAppDelegate {
    
    open func application(
        _ application: FTApplication,
        didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
    ) {
        
    }
}
