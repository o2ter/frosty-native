//
//  FTRoot.kt
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

package com.o2ter.app

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.onSizeChanged
import com.o2ter.core.FTContext
import com.o2ter.app.ui.theme.AppTheme

@Composable
internal fun FTRoot(engine: FTContext) {
    val systemIsDarkTheme = isSystemInDarkTheme()
    var darkTheme by remember { mutableStateOf(systemIsDarkTheme) }
    AppTheme(
        darkTheme = darkTheme
    ) {
        Scaffold(
            modifier = Modifier.fillMaxSize()
                .onSizeChanged { size ->
                    println(size)
                }
        ) { safeAreaInset ->
            Greeting(
                name = "Android",
                modifier = Modifier.padding(safeAreaInset)
            )
        }
    }
}

@Composable
internal fun Greeting(name: String, modifier: Modifier = Modifier) {
    var name by remember { mutableStateOf("") }
    Text(
        text = "Hello $name!",
        modifier = modifier
    )
}
