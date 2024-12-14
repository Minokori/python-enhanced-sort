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
const console_1 = require("console");
const vscode = __importStar(require("vscode"));
const CodeBlock_1 = require("./new/CodeBlock");
const enum_1 = require("./new/enum");
const path_1 = __importDefault(require("path"));
function activate(context) {
    //vscode.window.showInformationMessage("Python Enhanced Sort 已经激活 😊");
    context.subscriptions.push(vscode.workspace.onWillSaveTextDocument(onWillSaveTextDocument));
}
function onWillSaveTextDocument(event) {
    if (event.reason !== 1) {
        return;
    }
    let name = event.document.fileName.split(path_1.default.sep).pop();
    if (vscode.workspace.getConfiguration("PythonEnhancedSort").get("ignoreFiles").includes(name)) {
        vscode.window.showInformationMessage(`文件名为: ${name}, 该文档将不会被格式化 👌`);
        return;
    }
    {
        try {
            (0, CodeBlock_1.ConvertToLines)(event.document, 3);
        }
        catch (error) {
            vscode.window.showInformationMessage(`存在预处理指令 (line: ${error.message}), 该文档将不会被格式化 👌`);
        }
        let b = new CodeBlock_1.CodeBlock(enum_1.CodeType.DOCUMENT, -1, 0, event.document.lineCount);
        let mode = vscode.workspace.getConfiguration("PythonEnhancedSort").get("Mode");
        let source_code = event.document.getText();
        let all_range = new vscode.Range(event.document.positionAt(0), event.document.positionAt(source_code.length));
        if (mode.toLowerCase() === "insert") {
            source_code = event.document.getText();
            let eol = vscode.workspace.getConfiguration("files").get("eol");
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
            (0, console_1.log)(b.toString());
        }
        // log("\n"+"*-".repeat(10) + "*\n");
        // log(`${JSON.stringify(
        //     b, null, 4
        // )}`);
    }
}
function deactivate() { }
//# sourceMappingURL=extension.js.map