plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

android {
    namespace = "com.o2ter"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.o2ter"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"

        vectorDrawables {
            useSupportLibrary = true
        }
    }
}

dependencies {
    implementation(libs.androidx.javascriptengine)
}