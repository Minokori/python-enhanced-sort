"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const debug_1 = require("./new/debug");
const vscode = __importStar(require("vscode"));
const CodeBlock_1 = require("./new/CodeBlock");
const enum_1 = require("./new/enum");
const path_1 = __importDefault(require("path"));
function activate(context) {
    (0, debug_1.log)("Python Enhanced Sort 已经激活 😊");
    context.subscriptions.push(vscode.workspace.onWillSaveTextDocument(onWillSaveTextDocument));
}
/**
 * 当文档即将保存时触发
 * @param event 文档保存事件
 */
function onWillSaveTextDocument(event) {
    if (event.reason !== 1) {
        return;
    } // 若保存事件不为手动保存事件, 则不做任何操作
    // 检查文件名是否在忽略列表中, 若在, 则不进行格式化
    let name = event.document.fileName.split(path_1.default.sep).pop();
    if (vscode.workspace.getConfiguration("PythonEnhancedSort").get("ignoreFiles").includes(name)) {
        vscode.window.showInformationMessage(`文件名为: ${name}, 该文档将不会被格式化 👌`);
        return;
    }
    // 格式化主要逻辑
    {
        // 检查是否存在预处理指令 # isort:skip_file. 如果存在, 则不进行格式化
        try {
            (0, CodeBlock_1.ConvertToLines)(event.document, 3);
        }
        catch (error) {
            vscode.window.showInformationMessage(`存在预处理指令 (line: ${error.message}), 该文档将不会被格式化 👌`);
        }
        /** 文档对应的 `CodeBlock` 对象作为根节点 */
        let b = new CodeBlock_1.CodeBlock(enum_1.CodeType.DOCUMENT, -1, 0, event.document.lineCount);
        /** 插件工作模式, "insert" 或 "inplace" */
        let mode = vscode.workspace.getConfiguration("PythonEnhancedSort").get("Mode");
        /** 文档原本的代码内容 */
        let source_code = event.document.getText();
        /** 文档代码内容范围*/
        let all_range = new vscode.Range(event.document.positionAt(0), event.document.positionAt(source_code.length));
        // 若工作模式为 "insert", 则将文档原本内容转换为注释形式
        if (mode.toLowerCase() === "insert") {
            source_code = event.document.getText();
            let eol = vscode.workspace.getConfiguration("files").get("eol");
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
            (0, debug_1.log)(b.toString());
        }
        // 就地替换
        else if (mode.toLocaleLowerCase() === "inplace") {
            vscode.window.activeTextEditor?.edit(editor => {
                editor.replace(all_range, new_code);
            });
        }
    }
}
function deactivate() { }
//# sourceMappingURL=extension.js.map