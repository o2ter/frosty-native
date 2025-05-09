//
//  FrostyNative.kt
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

package com.o2ter

import java.io.File
import org.gradle.api.DefaultTask
import org.gradle.api.Plugin
import org.gradle.api.Project
import org.gradle.api.file.ConfigurableFileTree
import org.gradle.api.file.DirectoryProperty
import org.gradle.api.provider.Property
import org.gradle.api.tasks.Internal
import org.gradle.api.tasks.InputFiles
import org.gradle.api.tasks.OutputDirectory
import org.gradle.api.tasks.TaskAction
import com.android.build.api.variant.AndroidComponentsExtension
import com.android.build.api.variant.Variant

abstract class BundleTask : DefaultTask() {

    @get:InputFiles
    val sources: ConfigurableFileTree =
        project.fileTree(root) {
            it.include("src/**/*.*")
            it.include("**/*.js")
            it.include("**/*.jsx")
            it.include("**/*.ts")
            it.include("**/*.tsx")
            it.exclude("**/android/**/*")
            it.exclude("**/ios/**/*")
            it.exclude("**/build/**/*")
            it.exclude("**/node_modules/**/*")
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
            it.workingDir(root.get().asFile)
            it.environment("PROJECT_ROOT", root.get().asFile)
            it.environment("BUILD_PLATFORM", "android")
            it.environment("OUTPUT_DIR", jsBundleDir.get().asFile)
            it.commandLine(bundleScript)
        }
    }

}

fun Project.configureBundleTasks(variant: Variant) {

    val buildDir = layout.buildDirectory.get().asFile
    val targetName = variant.name.replaceFirstChar { c -> c.uppercase() }
    val targetPath = variant.name

    val jsBundleDir = File(buildDir, "generated/assets/react/$targetPath")

    val bundleTask = tasks.register("createBundle${targetName}JsAndAssets", BundleTask::class.java) {
        it.root.set(layout.projectDirectory.asFile.parentFile.parentFile)
        it.buildType.set(variant.buildType)
        it.jsBundleDir.set(jsBundleDir)
    }
    variant.sources.assets?.addGeneratedSourceDirectory(bundleTask, BundleTask::jsBundleDir)
}

class FrostyRootProjectPlugin : Plugin<Project> {
    override fun apply(project: Project) {
        project.pluginManager.withPlugin("com.android.application") {
            val android = project.extensions.getByType(AndroidComponentsExtension::class.java)
            android.onVariants { variant ->
                project.configureBundleTasks(variant)
            }
        }
    }
}