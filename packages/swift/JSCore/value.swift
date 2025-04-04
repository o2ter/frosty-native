//
//  value.swift
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

import JavaScriptCore

extension JSCore {

  enum ValueBase {
    case null
    case undefined
    case bool(Bool)
    case number(Double)
    case string(String)
    case array([ValueBase])
    case object([String: ValueBase])
    case value(JSValue)
  }

  public struct Value {

    let base: ValueBase

    init(_ value: JSValue) {
      self.base = .value(value)
    }

    init(_ base: ValueBase) {
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

  public init(_ value: [JSCore.Value]) {
    self.init(.array(value.map { $0.base }))
  }

  public init(_ value: [String: JSCore.Value]) {
    self.init(.object(value.mapValues { $0.base }))
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

extension JSCore.Value {

  public static func arrayBuffer(
    bytesLength count: Int,
    in context: JSCore,
    _ callback: (_ bytes: UnsafeMutableRawBufferPointer) -> Void = { _ in }
  ) -> JSCore.Value {
    let buffer = context.base.evaluateScript("new ArrayBuffer(\(count))")!
    let address = JSObjectGetArrayBufferBytesPtr(
      context.base.jsGlobalContextRef, buffer.jsValueRef, nil)
    callback(.init(start: address, count: count))
    return JSCore.Value(buffer)
  }

  public static func int8Array(
    count: Int,
    in context: JSCore,
    _ callback: (_ bytes: UnsafeMutableRawBufferPointer) -> Void = { _ in }
  ) -> JSCore.Value {
    let buffer = context.base.evaluateScript("new Int8Array(\(count))")!
    let address = JSObjectGetArrayBufferBytesPtr(
      context.base.jsGlobalContextRef, buffer.forProperty("buffer").jsValueRef, nil)
    callback(.init(start: address, count: count))
    return JSCore.Value(buffer)
  }

  public static func uint8Array(
    count: Int,
    in context: JSCore,
    _ callback: (_ bytes: UnsafeMutableRawBufferPointer) -> Void = { _ in }
  ) -> JSCore.Value {
    let buffer = context.base.evaluateScript("new Uint8Array(\(count))")!
    let address = JSObjectGetArrayBufferBytesPtr(
      context.base.jsGlobalContextRef, buffer.forProperty("buffer").jsValueRef, nil)
    callback(.init(start: address, count: count))
    return JSCore.Value(buffer)
  }
}

extension JSCore.Value: CustomStringConvertible {

  public var description: String {
    return self.toString()
  }
}

extension JSCore.ValueBase {

  func toJSValue(inContext context: JSContext) -> JSValue {
    switch self {
    case .null: return JSValue(nullIn: context)
    case .undefined: return JSValue(undefinedIn: context)
    case let .bool(value): return JSValue(bool: value, in: context)
    case let .number(value): return JSValue(double: value, in: context)
    case let .string(value): return JSValue(object: value, in: context)
    case let .array(elements):
      let array = elements.map { $0.toJSValue(inContext: context) }
      return JSValue(object: array, in: context)
    case let .object(dictionary):
      let object = dictionary.mapValues { $0.toJSValue(inContext: context) }
      return JSValue(object: object, in: context)
    case let .value(value):
      assert(value.context === context, "JSValue context mismatch")
      return value
    }
  }
}

extension JSCore.Value {

  func toJSValue(inContext context: JSContext) -> JSValue {
    return self.base.toJSValue(inContext: context)
  }
}

extension JSCore.Value: ExpressibleByBooleanLiteral {

  public init(booleanLiteral value: BooleanLiteralType) {
    self.init(value)
  }
}

extension JSCore.Value: ExpressibleByIntegerLiteral {
  public init(integerLiteral value: IntegerLiteralType) {
    self.init(Double(value))
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

extension JSCore.Value: ExpressibleByArrayLiteral {

  public init(arrayLiteral elements: JSCore.Value...) {
    self.init(elements)
  }
}

extension JSCore.Value: ExpressibleByDictionaryLiteral {

  public init(dictionaryLiteral elements: (String, JSCore.Value)...) {
    let dictionary = elements.reduce(into: [String: JSCore.Value]()) { $0[$1.0] = $1.1 }
    self.init(dictionary)
  }
}

extension JSCore.Value {

  public subscript(_ property: String) -> JSCore.Value {
    get {
      switch self.base {
      case let .value(base): return .init(base.forProperty(property))
      case let .object(dictionary): return dictionary[property].map(JSCore.Value.init) ?? .undefined
      default: return .undefined
      }
    }
    nonmutating set {
      guard case let .value(base) = self.base, let context = base.context else { return }
      base.setValue(newValue.toJSValue(inContext: context), forProperty: property)
    }
  }

  public subscript(_ index: Int) -> JSCore.Value {
    get {
      switch self.base {
      case let .value(base): return .init(base.atIndex(index))
      case let .array(elements):
        guard index >= 0 && index < elements.count else { return .undefined }
        return .init(elements[index])
      default: return .undefined
      }
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
  public func call(withArguments arguments: [JSCore.Value] = []) -> JSCore.Value {
    guard case let .value(base) = self.base, let context = base.context else {
      return .undefined
    }
    let result = base.call(withArguments: arguments.map { $0.toJSValue(inContext: context) })
    return result.map(JSCore.Value.init) ?? .undefined
  }

  public func construct(withArguments arguments: [JSCore.Value] = []) -> JSCore.Value {
    guard case let .value(base) = self.base, let context = base.context else {
      return .undefined
    }
    let result = base.construct(
      withArguments: arguments.map { $0.toJSValue(inContext: context) })
    return result.map(JSCore.Value.init) ?? .undefined
  }

  @discardableResult
  public func invokeMethod(_ method: String, withArguments arguments: [JSCore.Value] = [])
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

extension JSCore.Value {

  public var isNull: Bool {
    switch self.base {
    case .null: return true
    case let .value(value): return value.isNull
    default: return false
    }
  }

  public var isUndefined: Bool {
    switch self.base {
    case .undefined: return true
    case let .value(value): return value.isUndefined
    default: return false
    }
  }

  public var isBool: Bool {
    switch self.base {
    case .bool: return true
    case let .value(value): return value.isBoolean
    default: return false
    }
  }

  public var isNumber: Bool {
    switch self.base {
    case .number: return true
    case let .value(value): return value.isNumber
    default: return false
    }
  }

  public var isString: Bool {
    switch self.base {
    case .string: return true
    case let .value(value): return value.isString
    default: return false
    }
  }
}

extension JSCore.Value {

  public var isObject: Bool {
    switch self.base {
    case .value(let value): return value.isObject
    default: return false
    }
  }

  public var isArray: Bool {
    switch self.base {
    case .value(let value): return value.isArray
    default: return false
    }
  }

  public var isDate: Bool {
    switch self.base {
    case .value(let value): return value.isDate
    default: return false
    }
  }

  @available(macOS 10.15, macCatalyst 13.1, iOS 13, tvOS 13, *)
  public var isSymbol: Bool {
    switch self.base {
    case .value(let value): return value.isSymbol
    default: return false
    }
  }

  @available(macOS 15.0, macCatalyst 18, iOS 18, tvOS 18, *)
  public var isBigInt: Bool {
    switch self.base {
    case .value(let value): return value.isBigInt
    default: return false
    }
  }
}

extension JSCore.ValueBase {

  public func toString() -> String {
    switch self {
    case .null: return "null"
    case .undefined: return "undefined"
    case let .bool(value): return "\(value)"
    case let .number(value): return "\(value)"
    case let .string(value): return value
    case let .array(elements):
      return "[\(elements.map { $0.toString() }.joined(separator: ", "))]"
    case let .object(dictionary):
      return "{\(dictionary.map { "\($0.key): \($0.value.toString())" }.joined(separator: ", "))}"
    case let .value(value): return value.toString()
    }
  }
}

extension JSCore.Value {

  public func toString() -> String {
    return self.base.toString()
  }
}

extension JSCore.Value {

  public var boolValue: Bool? {
    switch self.base {
    case .bool(let value): return value
    case let .value(value): return value.toBool()
    default: return nil
    }
  }

  public var numberValue: Double? {
    switch self.base {
    case .number(let value): return value
    case let .value(value): return value.toDouble()
    default: return nil
    }
  }

  public var stringValue: String? {
    switch self.base {
    case .string(let value): return value
    case let .value(value): return value.toString()
    default: return nil
    }
  }

  public var dateValue: Date? {
    switch self.base {
    case .value(let value): return value.toDate()
    default: return nil
    }
  }
}
