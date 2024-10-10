/*
* Tencent is pleased to support the open source community by making Puerts available.
* Copyright (C) 2020 THL A29 Limited, a Tencent company.  All rights reserved.
* Puerts is licensed under the BSD 3-Clause License, except for the third-party components listed in the file 'LICENSE' which may be subject to their corresponding license terms. 
* This file is subject to the terms and conditions defined in file 'LICENSE', which is part of this source code package.
*/

#if UNITY_2020_1_OR_NEWER
#if EXPERIMENTAL_IL2CPP_PUERTS && ENABLE_IL2CPP

using System;
using System.Runtime.CompilerServices;

namespace Puerts
{
    [UnityEngine.Scripting.Preserve]
    public class JSObject
    {
        IntPtr placeHold0; // PObjectRefInfo first ptr
        IntPtr placeHold1;
        IntPtr placeHold2;
        IntPtr placeHold3;
        IntPtr placeHold4;
        IntPtr placeHold5;
        IntPtr placeHold6;
        IntPtr placeHold7;

        [MethodImpl(MethodImplOptions.InternalCall)]
        void releaseScriptObject()
        {
            throw new NotImplementedException();
        }

        [MethodImpl(MethodImplOptions.InternalCall)]
        object GetJSObjectValue(string key, Type resultType)
        {
            throw new NotImplementedException();
        }

        public T Get<T>(string key) 
        {
            return (T)GetJSObjectValue(key, typeof(T));
        }

        ~JSObject()
        {
            releaseScriptObject();
        }
    }
}

#endif
#endif