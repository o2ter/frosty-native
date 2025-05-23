// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.compose.compiler) apply false
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
}

buildscript {
    extra.apply {
        set("namespace", "com.o2ter.templateapp")
        set("applicationId", "com.o2ter.templateapp")
        set("minSdkVersion", 26)
        set("compileSdkVersion", 35)
        set("targetSdkVersion", 35)
    }
}