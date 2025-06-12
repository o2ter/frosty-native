//
//  TimerTask.kt
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

import com.eclipsesource.v8.V8Array
import com.eclipsesource.v8.V8Function
import java.util.TimerTask

internal class V8TimerTask : TimerTask {
    val runtime: JSCore
    val callback: V8Function
    val args: V8Array
    val once: Boolean
    constructor(
        runtime: JSCore,
        callback: V8Function,
        args: V8Array,
        once: Boolean
    ) {
        this.runtime = runtime
        this.callback = runtime.persist(callback)
        this.args = runtime.persist(args)
        this.once = once
    }
    override fun run() {
        val self = this
        runtime.withRuntime {
            self.callback.call(null, self.args)
            if (self.once) self.close()
        }.discard()
    }
    fun close() {
        if (!this.args.isReleased) this.args.close()
        if (!this.callback.isReleased) this.callback.close()
    }
}
