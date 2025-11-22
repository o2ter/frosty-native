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

import com.android.build.gradle.internal.dsl.BaseAppModuleExtension

plugins {
    alias(libs.plugins.compose.compiler)
    alias(libs.plugins.android.library)
    alias(libs.plugins.kotlin.android)
}

group = "com.o2ter"

var rootAndroid: BaseAppModuleExtension? = null
{
    println("Searching for root android project...")
    var gradle = gradle.parent
    do {
        var appProj = gradle?.rootProject?.findProject(":app")
        var androidExt = appProj?.extensions?.findByType(BaseAppModuleExtension::class.java)
        if (androidExt != null) {
            rootAndroid = androidExt
            println("✓ Found root android project: ${gradle?.rootProject?.name}")
            break
        }
        gradle = gradle?.parent
    } while (gradle != null)
    if (rootAndroid == null) {
        println("✗ Root android project not found, using default configuration.")
    }
}()

android {
    namespace = "com.o2ter"
    compileSdk = rootAndroid?.compileSdk ?: 36

    buildFeatures {
        compose = true
    }

    defaultConfig {
        minSdk = 24
    }
}

java { targetCompatibility = JavaVersion.VERSION_11 }

kotlin { jvmToolchain(17) }

dependencies {
    implementation(libs.jscore)
    implementation(libs.jscore.android)
    implementation(libs.guava)
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.collection.ktx)
    implementation(libs.androidx.fragment.ktx)
    implementation(libs.androidx.concurrent.futures)
    implementation(libs.kotlinx.coroutines.guava)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.lifecycle.viewmodel.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.lifecycle.livedata.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.runtime.compose)
    implementation(libs.androidx.lifecycle.viewmodel.savedstate)
    implementation(libs.androidx.runtime)
    implementation(libs.androidx.annotation.jvm)
}

afterEvaluate {
    println("Checking local.properties in $project project...")
    val localPropertiesFile = File(project.rootDir, "local.properties")
    if (!localPropertiesFile.exists()) {
        var _gradle: Gradle? = gradle
        loop@ while (_gradle != null) {
            var project: Project? = _gradle.rootProject
            while (project != null) {
                val parentLocalPropertiesFile = project.file("local.properties")
                if (parentLocalPropertiesFile?.exists() == true) {
                    println("Copying local.properties from $parentLocalPropertiesFile project to $localPropertiesFile")
                    localPropertiesFile.createNewFile()
                    parentLocalPropertiesFile.copyTo(localPropertiesFile, true)
                    break@loop
                }
                project = project.parent
            }
            _gradle = _gradle.parent
        }
    }
}