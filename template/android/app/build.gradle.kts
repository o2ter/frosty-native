
plugins {
    alias(libs.plugins.compose.compiler)
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    id("com.o2ter.frosty")
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
    buildFeatures {
        compose = true
    }
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

java { targetCompatibility = JavaVersion.VERSION_11 }

kotlin { jvmToolchain(17) }

dependencies {

    implementation(libs.frosty.core)
    implementation(libs.androidx.activity.compose)
}
