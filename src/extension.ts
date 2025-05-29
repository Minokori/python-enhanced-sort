import { log } from "./new/debug";
import * as vscode from 'vscode';
import { CodeBlock, ConvertToLines } from './new/CodeBlock';
import { CodeType } from './new/enum';
import path from 'path';
export function activate(context: vscode.ExtensionContext): void {

    log("Python Enhanced Sort 已经激活 😊");
    context.subscriptions.push(vscode.workspace.onWillSaveTextDocument(onWillSaveTextDocument));


}

/**
 * 当文档即将保存时触发
 * @param event 文档保存事件
 */
function onWillSaveTextDocument(event: vscode.TextDocumentWillSaveEvent) {

    if (event.reason !== 1) { return; } // 若保存事件不为手动保存事件, 则不做任何操作

    // 检查文件名是否在忽略列表中, 若在, 则不进行格式化
    let name = event.document.fileName.split(path.sep).pop() as string;
    if ((vscode.workspace.getConfiguration("PythonEnhancedSort").get("ignoreFiles") as string[]).includes(name)) {
        vscode.window.showInformationMessage(`文件名为: ${name}, 该文档将不会被格式化 👌`);
        return;
    }

    // 格式化主要逻辑
    {
        // 检查是否存在预处理指令 # isort:skip_file. 如果存在, 则不进行格式化
        try {
            ConvertToLines(event.document, 3);
        } catch (error) {
            vscode.window.showInformationMessage(`存在预处理指令 (line: ${(error as Error).message}), 该文档将不会被格式化 👌`);
        }

        /** 文档对应的 `CodeBlock` 对象作为根节点 */
        let b = new CodeBlock(CodeType.DOCUMENT, -1, 0, event.document.lineCount);

        /** 插件工作模式, "insert" 或 "inplace" */
        let mode = vscode.workspace.getConfiguration("PythonEnhancedSort").get("Mode") as string;

        /** 文档原本的代码内容 */
        let source_code = event.document.getText();

        /** 文档代码内容范围*/
        let all_range = new vscode.Range(event.document.positionAt(0), event.document.positionAt(source_code.length));

        // 若工作模式为 "insert", 则将文档原本内容转换为注释形式
        if (mode.toLowerCase() === "insert") {
            source_code = event.document.getText();
            let eol = vscode.workspace.getConfiguration("files").get("eol") as string;
            source_code = "# " + source_code.replaceAll(eol, eol + "# ");
            source_code = source_code.substring(0, source_code.length - 2);
        }

        // 排序文档所有节点
        b.sort_children();

        // 将排序后的文档内容转换为字符串
        let new_code = b.toString();

        // 插入注释后的文档内容和排序后的文档内容
        if (mode.toLocaleLowerCase() === "insert") {
            vscode.window.activeTextEditor?.edit(editor => {
                editor.delete(all_range);
                editor.insert(new vscode.Position(0, 0), source_code + new_code);
            });
        }
            // 在 vscode 的 "输出" 面板输出
        else if (mode.toLocaleLowerCase() === "console") {
            log(b.toString());
        }
        // 就地替换
        else if (mode.toLocaleLowerCase() === "inplace") {
            vscode.window.activeTextEditor?.edit(editor => {
                editor.replace(all_range, new_code);
            });
        }
    }
}


export function deactivate() { }
