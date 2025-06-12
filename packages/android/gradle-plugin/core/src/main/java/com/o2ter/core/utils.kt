//
//  utils.kt
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

package com.o2ter.core

import com.eclipsesource.v8.V8
import com.eclipsesource.v8.V8Array
import com.eclipsesource.v8.V8ArrayBuffer
import com.eclipsesource.v8.V8Function
import com.eclipsesource.v8.V8Object
import java.nio.ByteBuffer

internal fun Any?.discard() = Unit

internal fun <E> List<E>.subList(from: Int): List<E> {
    return this.subList(from.coerceAtMost(this.size), this.size)
}

internal fun V8Array.toList(): List<Any> {
    val result = ArrayList<Any>()
    for (i in 0..<this.length()) {
        result.add(this.get(i))
    }
    return result
}

internal fun V8.addGlobalObject(key: String, callback: (V8Object) -> Unit) {
    val obj = V8Object(this)
    callback(obj)
    this.add(key, obj)
}

internal fun V8.createFunction(callback: (V8Object, V8Array) -> Any): V8Function {
    return V8Function(this, callback)
}

internal fun V8.createArrayBuffer(length: Int): V8ArrayBuffer {
    return V8ArrayBuffer(this, ByteBuffer.allocateDirect(length))
}

internal fun V8Object.addObject(key: String, callback: (V8Object) -> Unit) {
    val obj = V8Object(runtime)
    callback(obj)
    this.add(key, obj)
    obj.close()
}
