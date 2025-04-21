//
//  build.gradle.kts
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

plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
}

gradle.projectsEvaluated {

    val application = gradle.parent?.rootProject
    if (application != null) {

        val buildDir = application.layout.buildDirectory.get().asFile
        println(buildDir)

//        val targetName = variant.name.capitalizeCompat()
//        val targetPath = variant.name
//
//
//        // Resources: generated/assets/react/<variant>/index.android.bundle
//        val resourcesDir = File(buildDir, "generated/res/react/$targetPath")
//        // Bundle: generated/assets/react/<variant>/index.android.bundle
//        val jsBundleDir = File(buildDir, "generated/assets/react/$targetPath")
//        // Sourcemap: generated/sourcemaps/react/<variant>/index.android.bundle.map
//        val jsSourceMapsDir = File(buildDir, "generated/sourcemaps/react/$targetPath")

    }
}
