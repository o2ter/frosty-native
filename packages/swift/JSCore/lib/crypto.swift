//
//  crypto.swift
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

import Crypto
import JavaScriptCore

@objc protocol JSCryptoExport: JSExport {

  func randomUUID() -> String

  func randomBytes(_ length: Int) -> JSValue

  func createHash(_ algorithm: String) -> JSHash?
}

extension JSCrypto {

  func randomUUID() -> String {
    let uuid = UUID()
    return .init(uuid.uuidString)
  }

  func randomBytes(_ length: Int) -> JSValue {
    return .uint8Array(count: length, in: JSContext.current()) { bytes in
      _ = SecRandomCopyBytes(kSecRandomDefault, length, bytes.baseAddress!)
    }
  }
}

@objc class JSCrypto: NSObject, JSCryptoExport {

}

@objc protocol JSHashExport: JSExport {

  func update(_ data: JSValue)

  func digest() -> JSValue
}

@objc class JSHash: NSObject, JSHashExport {

  var base: any HashFunction

  init(_ hash: any HashFunction) {
    self.base = hash
  }

  func update(_ data: JSValue) {
    if data.isTypedArray {
      let byteLength = JSObjectGetTypedArrayByteLength(
        data.context.jsGlobalContextRef, data.jsValueRef, nil)
      let address = JSObjectGetTypedArrayBytesPtr(
        data.context.jsGlobalContextRef, data.jsValueRef, nil)
      base.update(
        bufferPointer: UnsafeRawBufferPointer(
          start: address?.assumingMemoryBound(to: UInt8.self),
          count: byteLength))
    }
  }

  func digest() -> JSValue {
    let digest = base.finalize()
    return digest.withUnsafeBytes { bytes in
      .uint8Array(count: bytes.count, in: JSContext.current()) { buffer in
        buffer.copyBytes(from: bytes)
      }
    }
  }
}

extension JSCrypto {

  func createHash(_ algorithm: String) -> JSHash? {
    let hash: any HashFunction
    switch algorithm {
    case "md5":
      hash = Insecure.MD5()
    case "sha1":
      hash = Insecure.SHA1()
    case "sha256":
      hash = SHA256()
    case "sha384":
      hash = SHA384()
    case "sha512":
      hash = SHA512()
    default:
      return nil
    }
    return JSHash(hash)
  }
}
