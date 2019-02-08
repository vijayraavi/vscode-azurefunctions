/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as path from 'path';
import { workspace, WorkspaceConfiguration, WorkspaceFolder } from 'vscode';
import { Platform } from "../constants";
import { ext } from '../extensionVariables';
import { getFuncExtensionSetting } from '../ProjectSettings';
import { cpUtils } from './cpUtils';

enum Terminal {
    bash,
    cmd,
    powershell
}

export namespace venvUtils {
    const bashAndCmdSeparator: string = ' && ';
    const powerShellSeparator: string = ' ; ';

    export function convertToVenvTask(folder: WorkspaceFolder | undefined, command: string, platform: NodeJS.Platform = process.platform): string {
        let separator: string = bashAndCmdSeparator;
        let terminal: Terminal;
        if (platform === Platform.Windows) {
            terminal = Terminal.cmd;

            const config: WorkspaceConfiguration = workspace.getConfiguration();
            const shell: string | undefined = config.get('terminal.integrated.shell.windows');
            if (!shell || /(powershell|pwsh)/i.test(shell)) {
                // powershell is the default if setting isn't defined
                terminal = Terminal.powershell;
                separator = powerShellSeparator;
            } else if (/bash/i.test(shell)) {
                terminal = Terminal.bash;
            }
        } else {
            terminal = Terminal.bash;
        }

        const commands: string[] = [command];
        const venvName: string | undefined = getFuncExtensionSetting<string>('pythonVenv', folder && folder.uri.fsPath);
        if (venvName) {
            const venvActivatePath: string = getVenvActivatePath(venvName, terminal);
            commands.unshift(getVenvActivateCommand(venvActivatePath, terminal));
        }

        return commands.join(separator);
    }

    export async function runPythonCommandInVenv(venvName: string, folderPath: string, command: string): Promise<void> {
        const terminal: Terminal = process.platform === Platform.Windows ? Terminal.cmd : Terminal.bash;
        command = getVenvActivateCommand(venvName, terminal) + bashAndCmdSeparator + command;
        await cpUtils.executeCommand(ext.outputChannel, folderPath, command);
    }

    export function getVenvActivatePath(venvName: string, terminal?: Terminal): string {
        if (terminal === undefined) {
            terminal = process.platform === Platform.Windows ? Terminal.cmd : Terminal.bash;
        }

        const terminalPathJoin: (...p: string[]) => string = terminal === Terminal.bash ? path.posix.join : path.win32.join;
        switch (process.platform) {
            case Platform.Windows:
                return terminalPathJoin('.', venvName, 'Scripts', 'activate');
            default:
                return terminalPathJoin('.', venvName, 'bin', 'activate');
        }
    }

    function getVenvActivateCommand(venvActivatePath: string, terminal: Terminal): string {
        switch (terminal) {
            case Terminal.bash:
                return `. ${venvActivatePath}`;
            default:
                return venvActivatePath;
        }
    }
}
