import com.android.build.api.variant.AndroidComponentsExtension
import com.android.build.api.variant.Variant

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

android {
    namespace = rootProject.extra["namespace"] as String
    compileSdk = rootProject.extra["compileSdkVersion"] as Int

    defaultConfig {
        applicationId = rootProject.extra["applicationId"] as String
        minSdk = rootProject.extra["minSdkVersion"] as Int
        targetSdk = rootProject.extra["targetSdkVersion"] as Int

        vectorDrawables {
            useSupportLibrary = true
        }
    }
    signingConfigs {
        create("dev") {
            storeFile = file("debug.keystore")
            storePassword = "android"
            keyAlias = "androiddebugkey"
            keyPassword = "android"
        }
    }
    buildFeatures {
        flavorDimensions += listOf("env")
    }
    buildTypes {
        debug {
        }
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    productFlavors {
        create("dev") {
            dimension = "env"
            applicationIdSuffix = ".dev"
            versionCode = 1
            versionName = "1.0"

            manifestPlaceholders.apply {
                set("appIcon", "@drawable/ic_launcher_dev")
                set("appIconRound", "@drawable/ic_launcher_round_dev")
            }

            signingConfig = signingConfigs.getByName("dev")
        }
        create("prd") {
            dimension = "env"
            versionCode = 1
            versionName = "1.0"

            manifestPlaceholders.apply {
                set("appIcon", "@drawable/ic_launcher")
                set("appIconRound", "@drawable/ic_launcher_round")
            }

            // Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig = signingConfigs.getByName("dev")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }
    kotlinOptions {
        jvmTarget = "1.8"
    }
    buildFeatures {
        compose = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.1"
    }
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {

    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.ui.test.junit4)
    debugImplementation(libs.androidx.ui.tooling)
    debugImplementation(libs.androidx.ui.test.manifest)
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

public fun Project.configureBundleTasks(variant: Variant) {

    val buildDir = layout.buildDirectory.get().asFile
    val targetName = variant.name.replaceFirstChar { c -> c.uppercase() }
    val targetPath = variant.name

    val jsBundleDir = File(buildDir, "generated/assets/react/$targetPath")

    val bundleTask = tasks.register("createBundle${targetName}JsAndAssets", BundleTask::class) {
        this.root.set(layout.projectDirectory.asFile.parentFile.parentFile)
        this.buildType.set(variant.buildType)
        this.jsBundleDir.set(jsBundleDir)
    }
    variant.sources.assets?.addGeneratedSourceDirectory(bundleTask, BundleTask::jsBundleDir)
}

pluginManager.withPlugin("com.android.application") {
    val android = extensions.findByType(AndroidComponentsExtension::class)
    println("check")
    println(android)
    android?.apply {
        onVariants(selector().all()) { variant ->
            configureBundleTasks(variant)
        }
    }
}
