plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

android {
    namespace = "com.o2ter"
    compileSdk = 34
}

dependencies {
    implementation(libs.androidx.javascriptengine)
}