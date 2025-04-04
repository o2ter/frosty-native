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

extension JSValue: @unchecked @retroactive Sendable { }

extension JSCore {

  fileprivate mutating func createTimer(callback: JSValue, ms: Double, repeats: Bool) -> Int {
    let id = self.timerId
    self.timer[id] = Timer(
      timeInterval: ms / 1000,
      repeats: repeats,
      block: { _ in
        _ = callback.call(withArguments: [])
      }
    )
    self.timerId += 1
    return id
  }

  fileprivate mutating func removeTimer(identifier: Int) {
    let timer = self.timer.removeValue(forKey: identifier)
    timer?.invalidate()
  }

  fileprivate var crypto: JSCore.Value {
    return [
      "randomUUID": JSCore.Value(in: self) { _, _ in
        let uuid = UUID()
        return .init(uuid.uuidString)
      },
      "randomBytes": JSCore.Value(in: self) { arguments, _ in
        guard let length = arguments[0].numberValue.map(Int.init) else {
          return .undefined
        }
        return .uint8Array(count: length, in: self) { bytes in
          _ = SecRandomCopyBytes(kSecRandomDefault, length, bytes.baseAddress!)
        }
      },
    ]
  }

  func polyfill() {
    self.globalObject["crypto"] = self.crypto
  }
}
