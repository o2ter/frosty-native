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

abstract class BundleTask : DefaultTask() {

    @get:InputFiles
    val sources: ConfigurableFileTree =
        project.fileTree(root) {
            this.include("src/**/*.*")
            this.include("**/*.js")
            this.include("**/*.jsx")
            this.include("**/*.ts")
            this.include("**/*.tsx")
            this.exclude("**/android/**/*")
            this.exclude("**/ios/**/*")
            this.exclude("**/build/**/*")
            this.exclude("**/node_modules/**/*")
        }

    @get:Internal abstract val root: DirectoryProperty

    @get:Internal abstract val buildType: Property<String>

    @get:OutputDirectory abstract val jsBundleDir: DirectoryProperty

    @TaskAction
    fun run() {
        jsBundleDir.get().asFile.mkdirs()

        val frostyNativeDir = root.dir("node_modules/frosty-native")
        val bundleScript = File(frostyNativeDir.get().asFile, "scripts/bin/bundle.sh")

        project.exec {
            this.workingDir(root.get().asFile)
            this.environment("PROJECT_ROOT", root.get().asFile)
            this.environment("BUILD_PLATFORM", "android")
            this.environment("OUTPUT_DIR", jsBundleDir.get().asFile)
            this.commandLine(bundleScript)
        }
    }

}

private fun Project.configureBundleTasks(variant: Variant) {

    val buildDir = layout.buildDirectory.get().asFile
    val targetName = variant.name.replaceFirstChar { c -> c.uppercase() }
    val targetPath = variant.name

    // Bundle: generated/assets/react/<variant>/index.android.bundle
    val jsBundleDir = File(buildDir, "generated/assets/react/$targetPath")

    val bundleTask = tasks.register("createBundle${targetName}JsAndAssets", BundleTask::class.java) {
        this.root.set(layout.projectDirectory.asFile.parentFile.parentFile)
        this.buildType.set(variant.buildType)
        this.jsBundleDir.set(jsBundleDir)
    }
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
