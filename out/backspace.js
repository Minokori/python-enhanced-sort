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
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
const vscode = __importStar(require("vscode"));
const config = __importStar(require("./config"));
//-//
const EDIT_OPTIONS = {
    undoStopBefore: false,
    undoStopAfter: false,
};
//-//
// Track the last selection so we know where the cursor was before a given change
/**
 * 最后一次选中的区域
 */
let lastSelection = null;
/**
 * 最后一次选中区域的最先选择的一行的文本
 * NOTE : 跟正向选择/反向选择有关
 */
let lastLineText = null;
let erasureTimeout = null;
//-//
function activate(context) { hook(context); }
/**
 *
 * @param context
 */
function hook(context) {
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(onDidChangeTextDocument));
    //订阅文本编辑器选择改变事件，若选中了文本则记录
    context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(onDidChangeTextEditorSelection));
    context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(onDidSaveTextDocument));
    context.subscriptions.push(vscode.workspace.onWillSaveTextDocument(onWillSaveTextDocument));
}
//-//
/**
 * 当文本文档内容在 vscode 发生更改时调用
 * @param event 文档更改事件
 * @returns
 */
function onDidChangeTextDocument(event) {
    const { contentChanges } = event;
    // 若 更改影响多个字符 或 更改影响多行 return
    if (!hasSingleChange(contentChanges) || !changeIsSingular(contentChanges[0])) {
        return;
    }
    // 若 更改第一个键是退格, 触发退格事件
    if (changeIsBackspace(contentChanges[0])) {
        onBackspacePressed(event);
    }
}
/**
 * 更改是否只影响一个字符
 * @param changes 描述文本文档中单个更改的事件。
 * @returns 更改是否只影响一个字符
 */
function hasSingleChange(changes) {
    return changes.length === 1;
}
/**
 * 更改是否发生在同一行上
 * @param change 描述文本文档中单个更改的事件。
 * @returns 更改是否发生在同一行上
 */
function changeIsSingular(change) {
    return change.range.isSingleLine;
}
/**
 * 更改是否是退格键
 * @param change 描述文档文本中单个更改的事件。
 * @returns 更改是否是退格键
 */
function changeIsBackspace(change) {
    return changeIsEmpty(change);
}
/**
 * 改变的文本是否为空
 * @param change 描述文本文档中单个更改的事件。
 * @returns 改变的文本是否为空
 */
function changeIsEmpty(change) {
    // We observe that all backspaces, including those of non-whitespace characters, have empty text
    return change.text === '';
}
/**
 * 退格且删除字符时触发
 * @param event
 * @returns
 */
function onBackspacePressed(event) {
    const doc = event.document;
    const line = getBackspacedLine(event);
    if (shouldSkipErasure(doc, line)) {
        return;
    }
    eraseDocumentLine(doc, line);
}
/**
 * 获得发生退格事件的行号
 * @param event
 * @returns
 */
function getBackspacedLine(event) {
    return event.contentChanges[0].range.start.line;
}
/**
 * 是否应该跳过删除
 * @param doc
 * @param line
 * @returns 若已经删除了该行 或 该行现在不为空 或 该行曾经不为空，则跳过删除该行
 */
function shouldSkipErasure(doc, line) {
    // 若已经删除了该行 或 该行现在不为空 或 该行曾经不为空，则跳过删除该行
    return didEraseLine(line) || !isLineEmpty(doc, line) || !wasLineEmpty();
}
function didEraseLine(line) {
    if (lastSelection === null) {
        return false;
    }
    return lastSelection.start.line > line;
}
function isLineEmpty(doc, line) {
    const text = doc.lineAt(line).text;
    return isTextBlank(text);
}
/**
 *
 * @returns
 */
function wasLineEmpty() {
    if (lastLineText === null) {
        return false;
    }
    return isTextBlank(lastLineText);
}
/**
 * 文本是否为空或仅包含空格
 * @param text
 * @returns
 */
function isTextBlank(text) {
    return text.trim().length === 0;
}
function eraseDocumentLine(doc, line) {
    const etor = getActiveEditor();
    if (!etor || etor.document !== doc) {
        return;
    }
    eraseEditorLineDelayed(etor, line);
}
function eraseEditorLineDelayed(editor, line) {
    // Opportunity to cancel if this was a byproduct of an automatic editor event
    erasureTimeout = setTimeout(() => {
        eraseEditorLine(editor, line);
    }, getActionDelay());
}
function getActionDelay() {
    return config.get('delay');
}
async function eraseEditorLine(etor, line) {
    await etor.edit((builder) => {
        const lineRange = etor.document.lineAt(line).range;
        const delRange = etor.document.positionAt(etor.document.offsetAt(lineRange.start) - 1);
        builder.delete(new vscode.Range(delRange, lineRange.end));
    }, EDIT_OPTIONS);
}
function clearErasureTimeout() {
    if (erasureTimeout === null) {
        return;
    }
    clearTimeout(erasureTimeout);
    erasureTimeout = null;
}
//-//
/**
 * 如果选中了文本，则记录这些文本和被选中的首行
 * @param event 表示描述文本编辑器选择项更改的事件。
 * @returns
 */
function onDidChangeTextEditorSelection(event) {
    if (!hasSelections(event)) {
        return;
    }
    recordSelection(event.textEditor.document, event.selections[0]);
}
/**
 * 是否有选中文本
 * @param event 表示描述文本编辑器选择项更改的事件。
 * @returns 是否有选中文本
 */
function hasSelections(event) {
    return event.selections.length > 0;
}
/**
 * 记录最后一次选中的区域 和 该区域首先被选中一行的文本
 * @param doc 文本文档
 * @param selection 选中区域
 */
function recordSelection(doc, selection) {
    lastSelection = selection;
    lastLineText = doc.lineAt(selection.start.line).text;
}
//-//
function onWillSaveTextDocument() {
    clearErasureTimeout();
}
function onDidSaveTextDocument() {
    clearErasureTimeout();
}
//-//
/**
 * 获得活动的编辑器
 * @returns 活动的编辑器
 */
function getActiveEditor() {
    return vscode.window.activeTextEditor ?? null;
}
//# sourceMappingURL=backspace.js.map