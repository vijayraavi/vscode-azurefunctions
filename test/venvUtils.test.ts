/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as assert from 'assert';
import { getGlobalFuncExtensionSetting, Platform, pythonVenvSetting, updateGlobalSetting, venvUtils } from '../extension.bundle';
import { runWithSetting } from './runWithSetting';

// tslint:disable-next-line:no-function-expression max-func-body-length
suite('venvUtils Tests', () => {
    const command: string = 'func pack';
    const settingPrefix: string = 'terminal';
    const settingKey: string = 'integrated.shell.windows';
    let oldPythonVenv: string | undefined;

    suiteSetup(async () => {
        oldPythonVenv = getGlobalFuncExtensionSetting(pythonVenvSetting);
        await updateGlobalSetting(pythonVenvSetting, '.env');
    });

    suiteTeardown(async () => {
        await updateGlobalSetting(pythonVenvSetting, oldPythonVenv);
    });

    test('Windows default', async () => {
        await runWithSetting(
            settingKey,
            undefined,
            async () => {
                assert.equal(venvUtils.convertToVenvTask(undefined, command, Platform.Windows), '.env\\Scripts\\active ; func pack');
            },
            settingPrefix
        );
    });

    test('Windows powershell', async () => {
        await runWithSetting(
            settingKey,
            'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',
            async () => {
                assert.equal(venvUtils.convertToVenvTask(undefined, command, Platform.Windows), '.env\\Scripts\\active ; func pack');
            },
            settingPrefix
        );
    });

    test('Windows pwsh', async () => {
        await runWithSetting(
            settingKey,
            'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\pwsh.exe',
            async () => {
                assert.equal(venvUtils.convertToVenvTask(undefined, command, Platform.Windows), '.env\\Scripts\\active ; func pack');
            },
            settingPrefix
        );
    });

    test('Windows cmd', async () => {
        await runWithSetting(
            settingKey,
            'C:\\Windows\\System32\\cmd.exe',
            async () => {
                assert.equal(venvUtils.convertToVenvTask(undefined, command, Platform.Windows), '.env\\Scripts\\active && func pack');
            },
            settingPrefix
        );
    });

    test('Windows git bash', async () => {
        await runWithSetting(
            settingKey,
            'C:\\Program Files\\Git\\bin\\bash.exe',
            async () => {
                assert.equal(venvUtils.convertToVenvTask(undefined, command, Platform.Windows), '. env/Scripts/active && func pack');
            },
            settingPrefix
        );
    });

    test('Windows bash', async () => {
        await runWithSetting(
            settingKey,
            'C:\\Windows\\System32\\bash.exe',
            async () => {
                assert.equal(venvUtils.convertToVenvTask(undefined, command, Platform.Windows), '. env/Scripts/active && func pack');
            },
            settingPrefix
        );
    });

    test('Mac', async () => {
        await runWithSetting(
            settingKey,
            undefined,
            async () => {
                assert.equal(venvUtils.convertToVenvTask(undefined, command, Platform.MacOS), '. env/Scripts/active && func pack');
            },
            settingPrefix
        );
    });

    test('Linux', async () => {
        await runWithSetting(
            settingKey,
            undefined,
            async () => {
                assert.equal(venvUtils.convertToVenvTask(undefined, command, Platform.Linux), '. env/Scripts/active && func pack');
            },
            settingPrefix
        );
    });
});
