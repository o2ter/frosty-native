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

import JavaScriptCore

extension JSCore {

  class Context {

    var timerId: Int = 0
    var timer: [Int: Timer] = [:]

    var logger: @Sendable (LogLevel, [JSCore.Value]) -> Void

    init() {
      self.logger = { level, message in
        print(
          "[\(level.name.uppercased())] \(message.map { $0.toString() }.joined(separator: " "))")
      }
    }

    deinit {
      for (_, timer) in self.timer {
        timer.invalidate()
      }
      timer = [:]
    }
  }
}

extension JSCore {

  public typealias Export = JSExport & NSObject

}

extension JSCore.Value {

  public init(_ value: JSCore.Export, in context: JSCore) {
    self.init(JSValue(object: value, in: context.base))
  }

  public init(_ value: JSCore.Export.Type, in context: JSCore) {
    self.init(JSValue(object: value, in: context.base))
  }
}

extension JSCore.Context: @unchecked Sendable {}

extension JSCore {

  fileprivate func createTimer(callback: JSCore.Value, ms: Double, repeats: Bool) -> Int {
    let id = self.context.timerId
    self.context.timer[id] = Timer.scheduledTimer(
      withTimeInterval: ms / 1000,
      repeats: repeats,
      block: { _ in
        _ = callback.call(withArguments: [])
      }
    )
    self.context.timerId += 1
    return id
  }

  fileprivate func removeTimer(identifier: Int) {
    let timer = self.context.timer.removeValue(forKey: identifier)
    timer?.invalidate()
  }

}

extension JSCore {

  func polyfill() {
    for level in LogLevel.allCases {
      self.globalObject["console"][level.name] = .init(in: self) { arguments, _ in
        self.context.logger(level, arguments)
      }
    }
    self.globalObject["setTimeout"] = .init(in: self) { arguments, _ in
      guard arguments[0].isFunction else {
        throw JSCore.Value(newErrorFromMessage: "Invalid type of callback", in: self)
      }
      guard let ms = arguments[1].numberValue else {
        throw JSCore.Value(newErrorFromMessage: "Invalid type of delay", in: self)
      }
      let id = self.createTimer(callback: arguments[0], ms: ms, repeats: false)
      return .init(integerLiteral: id)
    }
    self.globalObject["clearTimeout"] = .init(in: self) { arguments, _ -> Void in
      guard let id = arguments[0].numberValue.map(Int.init) else {
        throw JSCore.Value(newErrorFromMessage: "Invalid type of timeoutID", in: self)
      }
      self.removeTimer(identifier: id)
    }
    self.globalObject["setInterval"] = .init(in: self) { arguments, _ in
      guard arguments[0].isFunction else {
        throw JSCore.Value(newErrorFromMessage: "Invalid type of callback", in: self)
      }
      guard let ms = arguments[1].numberValue else {
        throw JSCore.Value(newErrorFromMessage: "Invalid type of delay", in: self)
      }
      let id = self.createTimer(callback: arguments[0], ms: ms, repeats: true)
      return .init(integerLiteral: id)
    }
    self.globalObject["clearInterval"] = .init(in: self) { arguments, _ -> Void in
      guard let id = arguments[0].numberValue.map(Int.init) else {
        throw JSCore.Value(newErrorFromMessage: "Invalid type of intervalID", in: self)
      }
      self.removeTimer(identifier: id)
    }
    self.globalObject["__APPLE_SPEC__"] = [
      "crypto": .init(JSCrypto(), in: self),
      "processInfo": .init(JSProcessInfo(), in: self),
      "Bundle": .init(JSBundle.self, in: self),
    ]
    self.globalObject["crypto"] = self.evaluateScript(
      """
      new class Crypto {
        randomUUID() {
          return __APPLE_SPEC__.crypto.randomUUID();
        }
      }
      """)
  }
}
