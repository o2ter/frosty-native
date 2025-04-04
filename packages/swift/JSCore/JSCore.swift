//
//  JSCore.swift
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

import Foundation
import JavaScriptCore

public struct JSCore {

    public let virtualMachine: VirtualMachine
    fileprivate let base: JSContext

    public init(_ virtualMachine: VirtualMachine = VirtualMachine()) {
        self.virtualMachine = virtualMachine
        self.base = JSContext(virtualMachine: virtualMachine.base)
        self.base.exceptionHandler = { context, exception in
            guard let message = exception?.toString() else { return }
            print(message)
        }
    }
}

extension JSCore {

    public var globalObject: JSCore.Value {
        return JSCore.Value(self.base.globalObject)
    }

    public var exception: JSCore.Value {
        return self.base.exception.map(JSCore.Value.init) ?? .undefined
    }

    @discardableResult
    public func evaluateScript(_ script: String) -> JSCore.Value {
        let result = self.base.evaluateScript(script)
        return result.map(JSCore.Value.init) ?? .undefined
    }

    @discardableResult
    public func evaluateScript(_ script: String, withSourceURL sourceURL: URL) -> JSCore.Value {
        let result = self.base.evaluateScript(script, withSourceURL: sourceURL)
        return result.map(JSCore.Value.init) ?? .undefined
    }
}

extension JSCore {

    public struct VirtualMachine {

        fileprivate let base: JSVirtualMachine

        public init() {
            self.base = JSVirtualMachine()
        }
    }
}

extension JSCore {

    public typealias Export = JavaScriptCore.JSExport & NSObject

    fileprivate enum ValueBase {
        case null
        case undefined
        case bool(Bool)
        case number(Double)
        case string(String)
        case value(JSValue)
    }

    public struct Value {

        fileprivate let base: ValueBase

        fileprivate init(_ value: JSValue) {
            self.base = .value(value)
        }

        fileprivate init(_ base: ValueBase) {
            self.base = base
        }
    }
}

extension JSCore.Value {

    public static var null: JSCore.Value {
        return JSCore.Value(.null)
    }

    public static var undefined: JSCore.Value {
        return JSCore.Value(.undefined)
    }

    public init(_ value: Bool) {
        self.init(.bool(value))
    }

    public init(_ value: Double) {
        self.init(.number(value))
    }

    public init(_ value: String) {
        self.init(.string(value))
    }
}

extension JSCore.Value {

    public init(
        object: JSExport & NSObject,
        in context: JSCore
    ) {
        self.init(JSValue(object: object, in: context.base))
    }
}

extension JSCore.Value {

    public init(
        in context: JSCore,
        _ callback: @escaping (_ arguments: [JSCore.Value], _ this: JSCore.Value) -> JSCore.Value
    ) {
        let closure: @convention(block) () -> JSValue = {
            let result = callback(
                JSContext.currentArguments().map { .init($0 as! JSValue) },
                JSContext.currentThis().map(JSCore.Value.init) ?? .undefined)
            return result.toJSValue(inContext: context.base)
        }
        self.init(JSValue(object: closure, in: context.base))
    }

    public init(
        in context: JSCore,
        _ callback: @escaping (_ arguments: [JSCore.Value], _ this: JSCore.Value) -> Void
    ) {
        self.init(in: context) { arguments, this in
            callback(arguments, this)
            return .undefined
        }
    }
}

extension JSCore.ValueBase: CustomStringConvertible {

    public var description: String {
        switch self {
        case .null: return "null"
        case .undefined: return "undefined"
        case let .bool(value): return "\(value)"
        case let .number(value): return "\(value)"
        case let .string(value): return value
        case let .value(value): return value.toString()
        }
    }
}

extension JSCore.Value: CustomStringConvertible {

    public var description: String {
        return self.base.description
    }
}

extension JSCore.Value {

    fileprivate func toJSValue(inContext context: JSContext) -> JSValue {
        switch self.base {
        case .null: return JSValue(nullIn: context)
        case .undefined: return JSValue(undefinedIn: context)
        case let .bool(value): return JSValue(bool: value, in: context)
        case let .number(value): return JSValue(double: value, in: context)
        case let .string(value): return JSValue(object: value, in: context)
        case let .value(value): return value
        }
    }
}

extension JSCore.Value: ExpressibleByBooleanLiteral {

    public init(booleanLiteral value: BooleanLiteralType) {
        self.init(value)
    }
}

extension JSCore.Value: ExpressibleByFloatLiteral {

    public init(floatLiteral value: FloatLiteralType) {
        self.init(value)
    }
}

extension JSCore.Value: ExpressibleByStringInterpolation {

    public init(stringLiteral value: StringLiteralType) {
        self.init(value)
    }

    public init(stringInterpolation: String.StringInterpolation) {
        self.init(String(stringInterpolation: stringInterpolation))
    }
}

extension JSCore.Value {

    public subscript(_ property: String) -> JSCore.Value {
        get {
            guard case let .value(base) = self.base else { return self }
            return .init(base.forProperty(property))
        }
        nonmutating set {
            guard case let .value(base) = self.base, let context = base.context else { return }
            base.setValue(newValue.toJSValue(inContext: context), forProperty: property)
        }
    }

    public subscript(_ index: Int) -> JSCore.Value {
        get {
            guard case let .value(base) = self.base else { return self }
            return .init(base.atIndex(index))
        }
        nonmutating set {
            guard case let .value(base) = self.base, let context = base.context else { return }
            base.setValue(newValue.toJSValue(inContext: context), at: index)
        }
    }
}

extension JSCore.Value {

    public func hasProperty(_ property: String) -> Bool {
        guard case let .value(base) = self.base else {
            return false
        }
        return base.hasProperty(property)
    }
}

extension JSCore.Value {

    @discardableResult
    public func call(withArguments arguments: [JSCore.Value]) -> JSCore.Value {
        guard case let .value(base) = self.base, let context = base.context else {
            return .undefined
        }
        let result = base.call(withArguments: arguments.map { $0.toJSValue(inContext: context) })
        return result.map(JSCore.Value.init) ?? .undefined
    }

    public func construct(withArguments arguments: [JSCore.Value]) -> JSCore.Value {
        guard case let .value(base) = self.base, let context = base.context else {
            return .undefined
        }
        let result = base.construct(
            withArguments: arguments.map { $0.toJSValue(inContext: context) })
        return result.map(JSCore.Value.init) ?? .undefined
    }

    @discardableResult
    public func invokeMethod(_ method: String, withArguments arguments: [JSCore.Value])
        -> JSCore.Value
    {
        guard case let .value(base) = self.base, let context = base.context else {
            return .undefined
        }
        let result = base.invokeMethod(
            method, withArguments: arguments.map { $0.toJSValue(inContext: context) })
        return result.map(JSCore.Value.init) ?? .undefined
    }
}
