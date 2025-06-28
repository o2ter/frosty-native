//
//  polyfill.kt
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

package com.o2ter.core

import android.content.Context
import android.content.SharedPreferences
import androidx.core.content.edit
import java.lang.reflect.InvocationTargetException
import java.util.UUID

fun Context.defaultSharedPreferences(): SharedPreferences {
    return this.getSharedPreferences("__FROSTY_NATIVE__", Context.MODE_PRIVATE)
}

fun Context.identifierForVendor(): String {
    val prefs = this.defaultSharedPreferences()
    var instanceId = prefs.getString("instanceId", "")!!

    if (instanceId !== "") {
        return instanceId
    }

    try {
        instanceId = getFirebaseInstanceId()
        prefs.edit(commit = true) {
            putString("instanceId", instanceId)
        }
        return instanceId
    } catch (ignored: ClassNotFoundException) {
    } catch (e: NoSuchMethodException) {
        System.err.println("N/A: Unsupported version of com.google.firebase:firebase-iid in your project.")
    } catch (e: SecurityException) {
        System.err.println("N/A: Unsupported version of com.google.firebase:firebase-iid in your project.")
    } catch (e: IllegalAccessException) {
        System.err.println("N/A: Unsupported version of com.google.firebase:firebase-iid in your project.")
    } catch (e: InvocationTargetException) {
        System.err.println("N/A: Unsupported version of com.google.firebase:firebase-iid in your project.")
    }

    try {
        instanceId = getGmsInstanceId()
        prefs.edit(commit = true) {
            putString("instanceId", instanceId)
        }
        return instanceId
    } catch (ignored: ClassNotFoundException) {
    } catch (e: NoSuchMethodException) {
        System.err.println("N/A: Unsupported version of com.google.android.gms.iid in your project.")
    } catch (e: SecurityException) {
        System.err.println("N/A: Unsupported version of com.google.android.gms.iid in your project.")
    } catch (e: IllegalAccessException) {
        System.err.println("N/A: Unsupported version of com.google.android.gms.iid in your project.")
    } catch (e: InvocationTargetException) {
        System.err.println("N/A: Unsupported version of com.google.android.gms.iid in your project.")
    }

    instanceId = getUUIDInstanceId()
    prefs.edit(commit = true) {
        putString("instanceId", instanceId)
    }
    return instanceId
}

fun getUUIDInstanceId(): String {
    return UUID.randomUUID().toString()
}

@Throws(
    ClassNotFoundException::class,
    NoSuchMethodException::class,
    IllegalAccessException::class,
    InvocationTargetException::class
)
fun Context.getGmsInstanceId(): String {
    val clazz = Class.forName("com.google.android.gms.iid.InstanceID")
    val method = clazz.getDeclaredMethod("getInstance", Context::class.java)
    val obj = method.invoke(null, this.applicationContext)
    val method1 = obj.javaClass.getMethod("getId")
    return method1.invoke(obj) as String
}

@Throws(
    ClassNotFoundException::class,
    NoSuchMethodException::class,
    IllegalAccessException::class,
    InvocationTargetException::class
)
fun Context.getFirebaseInstanceId(): String {
    val clazz = Class.forName("com.google.firebase.iid.FirebaseInstanceId")
    val method = clazz.getDeclaredMethod("getInstance")
    val obj = method.invoke(null)
    val method1 = obj.javaClass.getMethod("getId")
    return method1.invoke(obj) as String
}
