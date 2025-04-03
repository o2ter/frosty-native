// The Swift Programming Language
// https://docs.swift.org/swift-book

import Foundation
import JavaScriptCore

let vm = JSVirtualMachine()!
let context = JSContext(virtualMachine: vm)!

context.evaluateScript(
  """
  const prototypes = (x) => {
    const prototype = Object.getPrototypeOf(x);
    if (prototype == undefined || prototype === Object.prototype) return [];
    return [prototype, ...prototypes(prototype)];
  };
  const props = (x) => [x, ...prototypes(x)].flatMap(x => Object.getOwnPropertyNames(x));
  """)

print(context.evaluateScript("props(this).sort()")!)
