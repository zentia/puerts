/*
* Tencent is pleased to support the open source community by making Puerts available.
* Copyright (C) 2020 THL A29 Limited, a Tencent company.  All rights reserved.
* Puerts is licensed under the BSD 3-Clause License, except for the third-party components listed in the file 'LICENSE' which may be subject to their corresponding license terms. 
* This file is subject to the terms and conditions defined in file 'LICENSE', which is part of this source code package.
*/
import { FOR, default as t, IF, ENDIF, ELSE } from "./tte.mjs"

import * as il2cpp_snippets from "./il2cpp_snippets.mjs"

function genFuncWrapper(wrapperInfo) {
    var parameterSignatures = il2cpp_snippets.listToJsArray(wrapperInfo.ParameterSignatures);

    return t`
// ${wrapperInfo.CsName}
static bool w_${wrapperInfo.Signature}(MethodInfo* method, Il2CppMethodPointer methodPointer, pesapi_callback_info info, bool checkJSArgument, WrapData* wrapData) {
    PLog("Running w_${wrapperInfo.Signature}");
    
    ${il2cpp_snippets.declareTypeInfo(wrapperInfo)}

    pesapi_env env = pesapi_get_env(info);
    int js_args_len = pesapi_get_args_len(info);
    
${parameterSignatures.map((x, i) => `    pesapi_value _sv${i} = pesapi_get_arg(info, ${i});`).join('\n')}

    if (${parameterSignatures.filter(s => s[0] == 'D').length ? 'true' : 'checkJSArgument'}) {
        if (${il2cpp_snippets.genArgsLenCheck(parameterSignatures)}) return false;
        ${FOR(parameterSignatures, (x, i) => t`
        ${il2cpp_snippets.checkJSArg(x, i)}
        `)}
    }
    ${il2cpp_snippets.getThis(wrapperInfo.ThisSignature)}
    
${parameterSignatures.map((x, i) => il2cpp_snippets.JSValToCSVal(x, `_sv${i}`, `p${i}`)).join('\n')}

    typedef ${il2cpp_snippets.SToCPPType(wrapperInfo.ReturnSignature)} (*FuncToCall)(${il2cpp_snippets.needThis(wrapperInfo) ? 'void*,' : ''}${parameterSignatures.map((S, i) => `${il2cpp_snippets.SToCPPType(S)} p${i}`).map(s => `${s}, `).join('')}const void* method);
    ${IF(wrapperInfo.ReturnSignature != 'v')}${il2cpp_snippets.SToCPPType(wrapperInfo.ReturnSignature)} ret = ${ENDIF()}((FuncToCall)methodPointer)(${il2cpp_snippets.needThis(wrapperInfo) ? 'self,' : ''} ${parameterSignatures.map((_, i) => `p${i}, `).join('')} method);

    ${FOR(parameterSignatures, (x, i) => t`
    ${il2cpp_snippets.refSetback(x, i, wrapperInfo)}
    `)}
    
    ${IF(wrapperInfo.ReturnSignature != "v")}
    ${il2cpp_snippets.returnToJS(wrapperInfo.ReturnSignature)}
    ${ENDIF()}
    return true;
}`;
}

export default function Gen(genInfos) {
    var valueTypeInfos = il2cpp_snippets.listToJsArray(genInfos.ValueTypeInfos)
    var wrapperInfos = il2cpp_snippets.listToJsArray(genInfos.WrapperInfos);
    var bridgeInfos = il2cpp_snippets.listToJsArray(genInfos.BridgeInfos);
    var fieldWrapperInfos = il2cpp_snippets.listToJsArray(genInfos.FieldWrapperInfos);
    console.log(`wrappers:${wrapperInfos.length}`);
    return `// Auto Gen

#include "il2cpp-api.h"
#include "il2cpp-class-internals.h"
#include "il2cpp-object-internals.h"
#include "vm/InternalCalls.h"
#include "vm/Object.h"
#include "vm/Array.h"
#include "vm/Runtime.h"
#include "vm/Reflection.h"
#include "vm/MetadataCache.h"
#include "vm/Field.h"
#include "vm/GenericClass.h"
#include "vm/Thread.h"
#include "vm/Method.h"
#include "vm/Parameter.h"
#include "vm/Image.h"
#include "utils/StringUtils.h"
#include "gc/WriteBarrier.h"
#include "pesapi.h"
#include "UnityExports4Puerts.h"
#include "TDataTrans.h"
#include "PuertsValueType.h"

namespace puerts
{

${wrapperInfos.map(genFuncWrapper).join('\n')}

static WrapFuncInfo g_wrapFuncInfos[] = {
    ${FOR(wrapperInfos, info => t`
    {"${info.Signature}", w_${info.Signature}},
    `)}
    {nullptr, nullptr}
};

WrapFuncPtr FindWrapFunc(const char* signature)
{
    auto begin = &g_wrapFuncInfos[0];
    auto end = &g_wrapFuncInfos[sizeof(g_wrapFuncInfos) / sizeof(WrapFuncInfo) - 1];
    auto first = std::lower_bound(begin, end, signature, [](const WrapFuncInfo& x, const char* signature) {return strcmp(x.Signature, signature) < 0;});
    if (first != end && strcmp(first->Signature, signature) == 0) {
        return first->Method;
    }
    return nullptr;
}

}

`;
}
