//
//  storage.swift
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

@objc protocol NativeLocalStorageExport: JSExport {
  func keys() -> [String]
  func setItem(_ value: String, _ key: String)
  func getItem(_ key: String) -> String?
  func removeItem(_ key: String)
}

@objc final class NativeLocalStorage: NSObject, NativeLocalStorageExport {

}

extension NativeLocalStorage {

  func keys() -> [String] {
    return UserDefaults.standard.dictionaryRepresentation().keys.map { $0 }
  }

  func setItem(_ value: String, _ key: String) {
    UserDefaults.standard.set(value, forKey: key)
  }

  func getItem(_ key: String) -> String? {
    return UserDefaults.standard.string(forKey: key)
  }

  func removeItem(_ key: String) {
    UserDefaults.standard.removeObject(forKey: key)
  }
}
