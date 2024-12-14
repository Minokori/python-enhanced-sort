import { log } from 'console';
import * as vscode from 'vscode';
import { CodeBlock, ConvertToLines } from './new/CodeBlock';
import { CodeType } from './new/enum';
import path from 'path';
export function activate(context: vscode.ExtensionContext): void {

    //vscode.window.showInformationMessage("Python Enhanced Sort 已经激活 😊");
    context.subscriptions.push(vscode.workspace.onWillSaveTextDocument(onWillSaveTextDocument));


}
function onWillSaveTextDocument(event: vscode.TextDocumentWillSaveEvent) {
    if (event.reason !== 1) { return; }
    let name = event.document.fileName.split(path.sep).pop() as string;
    if ((vscode.workspace.getConfiguration("PythonEnhancedSort").get("ignoreFiles") as string[]).includes(name)) {
        vscode.window.showInformationMessage(`文件名为: ${name}, 该文档将不会被格式化 👌`);
        return;
    }
    {
        try {
            ConvertToLines(event.document, 3);
        } catch (error) {
            vscode.window.showInformationMessage(`存在预处理指令 (line: ${(error as Error).message}), 该文档将不会被格式化 👌`);
        }
        let b = new CodeBlock(CodeType.DOCUMENT, -1, 0, event.document.lineCount);

        let mode = vscode.workspace.getConfiguration("PythonEnhancedSort").get("Mode") as string;
        let source_code = event.document.getText();
        let all_range = new vscode.Range(event.document.positionAt(0), event.document.positionAt(source_code.length));
        if (mode.toLowerCase() === "insert") {
            source_code = event.document.getText();
            let eol = vscode.workspace.getConfiguration("files").get("eol") as string;
            source_code = "# " + source_code.replaceAll(eol, eol + "# ");
            source_code = source_code.substring(0, source_code.length - 2);
        }

        b.sort_children();
        let new_code = b.toString();
        if (mode.toLocaleLowerCase() === "insert") {
            vscode.window.activeTextEditor?.edit(editor => {
                editor.delete(all_range);
                editor.insert(new vscode.Position(0, 0), source_code + new_code);
            });
        }
        else if (mode.toLocaleLowerCase() === "console") {
            log(b.toString());
        }
        // log("\n"+"*-".repeat(10) + "*\n");
        // log(`${JSON.stringify(
        //     b, null, 4
        // )}`);
    }
}


export function deactivate() { }
