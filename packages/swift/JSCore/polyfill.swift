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

    deinit {
      for (_, timer) in self.timer {
        timer.invalidate()
      }
      timer = [:]
    }
  }
}

extension JSCore {

  fileprivate func createClass(
    name: String,
    _ methods: [String: ([JSCore.Value], JSCore.Value) -> JSCore.Value]
  ) -> JSCore.Value {
    let _methods = methods.mapValues { method in JSCore.Value(in: self) { method($0, $1) } }
    let _class = self.evaluateScript(
      """
      ({ \(_methods.keys.joined(separator: ",")) }) => class \(name) {
        \(_methods.keys.map { "\($0)() { return \($0)(...arguments); }" }.joined(separator: "\n"))
      }
      """)
    return _class.call(withArguments: [.init(_methods)])
  }

}

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

  fileprivate var crypto: JSCore.Value {
    return self.createClass(name: "Crypto", [
      "randomUUID": { _, _ in
        let uuid = UUID()
        return .init(uuid.uuidString)
      },
      "randomBytes": { arguments, _ in
        guard let length = arguments[0].numberValue.map(Int.init) else {
          return .undefined
        }
        return .uint8Array(count: length, in: self) { bytes in
          _ = SecRandomCopyBytes(kSecRandomDefault, length, bytes.baseAddress!)
        }
      },
    ])
  }

  func polyfill() {
    self.globalObject["Crypto"] = self.crypto
    self.globalObject["crypto"] = self.evaluateScript("new Crypto()")
    self.globalObject["setTimeout"] = .init(in: self) { arguments, _ in
      guard let ms = arguments[1].numberValue else { return .undefined }
      let id = self.createTimer(callback: arguments[0], ms: ms, repeats: false)
      return .init(integerLiteral: id)
    }
    self.globalObject["clearTimeout"] = .init(in: self) { arguments, _ in
      guard let id = arguments[0].numberValue.map(Int.init) else { return }
      self.removeTimer(identifier: id)
    }
    self.globalObject["setInterval"] = .init(in: self) { arguments, _ in
      guard let ms = arguments[1].numberValue else { return .undefined }
      let id = self.createTimer(callback: arguments[0], ms: ms, repeats: true)
      return .init(integerLiteral: id)
    }
    self.globalObject["clearInterval"] = .init(in: self) { arguments, _ in
      guard let id = arguments[0].numberValue.map(Int.init) else { return }
      self.removeTimer(identifier: id)
    }
  }
}
