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

import com.android.build.api.variant.AndroidComponentsExtension
import com.android.build.api.variant.Variant

plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
}

private abstract class BundleTask : DefaultTask() {

    @get:OutputDirectory abstract val jsBundleDir: DirectoryProperty

    @get:OutputDirectory abstract val resourcesDir: DirectoryProperty

}

private fun String.capitalizeCompat(): String =
    if (isNotEmpty()) {
        val firstChar = this[0]
        val uppercaseChar = Character.toUpperCase(firstChar)
        val restString = this@capitalizeCompat.substring(1)
        uppercaseChar + restString
    } else {
        this
    }

private fun Project.configureBundleTasks(variant: Variant) {

    val buildDir = layout.buildDirectory.get().asFile
    val targetName = variant.name.capitalizeCompat()
    val targetPath = variant.name

    // Resources: generated/res/react/<variant>/index.android.bundle
    val resourcesDir = File(buildDir, "generated/res/react/$targetPath")
    // Bundle: generated/assets/react/<variant>/index.android.bundle
    val jsBundleDir = File(buildDir, "generated/assets/react/$targetPath")

    val bundleTask = tasks.register("createBundle${targetName}JsAndAssets", BundleTask::class.java) {
        it.jsBundleDir.set(jsBundleDir)
        it.resourcesDir.set(resourcesDir)
    }
    variant.sources.res?.addGeneratedSourceDirectory(bundleTask, BundleTask::resourcesDir)
    variant.sources.assets?.addGeneratedSourceDirectory(bundleTask, BundleTask::jsBundleDir)
}

gradle.projectsEvaluated {
    val main = gradle.parent?.rootProject
    val application = main?.project(":app")
    application?.pluginManager?.withPlugin("com.android.application") {
        application.extensions.getByType(AndroidComponentsExtension::class.java).apply {
            onVariants(selector().all()) { variant ->
                application.configureBundleTasks(variant)
            }
        }
    }
}
