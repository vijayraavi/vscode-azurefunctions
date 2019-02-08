/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { getGlobalFuncExtensionSetting, updateGlobalSetting } from "../extension.bundle";

export async function runWithSetting(key: string, value: string | undefined, callback: () => Promise<void>, prefix?: string): Promise<void> {
    const oldValue: string | undefined = getGlobalFuncExtensionSetting(key, prefix);
    try {
        await updateGlobalSetting(key, value, prefix);
        await callback();
    } finally {
        await updateGlobalSetting(key, oldValue, prefix);
    }
}
