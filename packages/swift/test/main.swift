//
//  main.swift
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
import JSCore

let context = JSCore()

context.evaluateScript(
  """
  setInterval(() => {
    console.log('hello');
  }, 1000);
  console.log('log');
  console.warn('warn');
  console.info('info');
  console.debug('debug');
  console.error('error');
  console.trace('trace');
  """
)

let prototypes = context.evaluateScript(
  """
  (x) => {
    const prototype = Object.getPrototypeOf(x);
    if (prototype == undefined || prototype === Object.prototype) return [];
    return [prototype, ...prototypes(prototype)];
  }
  """
)

let props = context.evaluateScript(
  "(x, prototypes) => [x, ...prototypes(x)].flatMap(x => Object.getOwnPropertyNames(x)).sort()")

print(props.call(withArguments: [context.globalObject, prototypes]))

let function = JSCore.Value(in: context) { args, this in
  print(args, this)
  return [.null, "hello"]
}

print(function.call(withArguments: [context.globalObject, prototypes]))

print(context.globalObject["_native"]["crypto"])
print(context.globalObject["_native"]["crypto"].invokeMethod("randomUUID"))
print(context.globalObject["_native"]["crypto"].invokeMethod("randomBytes", withArguments: [16]))

context.evaluateScript(
  """
  const hash = _native.crypto.createHash('md5');
  hash.update(new Uint8Array([1, 2, 3, 4, 5]));
  hash.update(new Uint8Array([6, 7, 8, 9, 10]));
  console.log(hash.digest());
  """
)

context.evaluateScript(
  """
  const hamc = _native.crypto.createHamc('md5', new Uint8Array([1, 2, 3, 4, 5]));
  hamc.update(new Uint8Array([1, 2, 3, 4, 5]));
  hamc.update(new Uint8Array([6, 7, 8, 9, 10]));
  console.log(hamc.digest());
  """
)

RunLoop.main.run()
