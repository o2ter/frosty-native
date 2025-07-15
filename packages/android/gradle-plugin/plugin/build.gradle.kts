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

import org.jetbrains.kotlin.gradle.dsl.JvmTarget
import org.jetbrains.kotlin.gradle.dsl.KotlinVersion
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
    id("java-gradle-plugin")
    kotlin("jvm")
}

group = "com.o2ter"

gradlePlugin {
    plugins {
        create("frosty") {
            id = "com.o2ter.frosty"
            implementationClass = "com.o2ter.FrostyRootProjectPlugin"
        }
    }
}

java { targetCompatibility = JavaVersion.VERSION_11 }

kotlin { jvmToolchain(17) }

tasks.withType<KotlinCompile>().configureEach {
    compilerOptions {
        apiVersion.set(KotlinVersion.KOTLIN_1_6)
        jvmTarget.set(JvmTarget.JVM_11)
    }
}

group = "com.o2ter"

dependencies {
    implementation(gradleApi())
    implementation(libs.kotlin.gradle.plugin)
    implementation(libs.android.gradle.plugin)
}