import * as vscode from "vscode";

let MESSAGE = vscode.workspace.getConfiguration("PythonEnhancedSort.Debug").get("Information") as boolean;
let LOG = vscode.workspace.getConfiguration("PythonEnhancedSort.Debug").get("Console") as boolean;

let outputChannel = vscode.window.createOutputChannel("Python Enhanced Sort", "python");

/**
 * 输出日志到设置中指定的位置.
 * @param message 日志消息
 */
export function log(message: string) {
    if (MESSAGE) {
        vscode.window.showInformationMessage(message);
    }
    if (LOG) {
        outputChannel.appendLine(`[${new Date().toLocaleTimeString()}] ${message}`);
    }
}