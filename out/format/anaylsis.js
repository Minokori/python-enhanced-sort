"use strict";
/** 将 text拆解成分段 */
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
exports.splitTextIntoDiffParts = splitTextIntoDiffParts;
const console_1 = require("console");
const vscode = __importStar(require("vscode"));
const regexp_1 = require("../utils/regexp");
const enums_1 = require("../utils/enums");
function splitTextIntoDiffParts(document) {
    //把所有代码块的起始位置记下来
    let l = [];
    for (let index = 0; index < document.lineCount; index++) {
        const element = document.lineAt(index);
        let info = getLineMetaInfo(element);
        if (info !== null) {
            l.push(getLineMetaInfo(element));
        }
    }
    (0, console_1.log)(l);
    let p = getPartMetaInfo(l, document);
    // p[1] + 1 是为了取得一个空格，p是两头包括
    if (p !== null) {
        let tmp = getTextbyLineRange(document, p[0], p[1]);
        (0, console_1.log)(tmp);
    }
}
function getLineMetaInfo(line) {
    let result = null;
    // 空行
    if (line.isEmptyOrWhitespace) {
        result = [line.lineNumber, enums_1.BLOCKTYPE.WHITELINE];
    }
    // 字符数少于 4 只可能是注释或声明变量
    if (line.text.length < 4) {
        if (line.text.startsWith("#")) {
            result = [line.lineNumber, enums_1.BLOCKTYPE.COMMENT];
        }
        else {
            if (line.text.includes("=")) {
                result = [line.lineNumber, enums_1.BLOCKTYPE.VARIABLE];
            }
        }
    }
    // 判断这个代码块是 类，函数，导入，缩进
    switch (line.text.substring(0, 4)) {
        case "clas":
            result = [line.lineNumber, enums_1.BLOCKTYPE.CLASS];
            break;
        case "def ":
            result = [line.lineNumber, enums_1.BLOCKTYPE.METHOD];
            break;
        case "from":
        case "impo":
            result = [line.lineNumber, enums_1.BLOCKTYPE.IMPORT];
            break;
        case "    ":
            result = [line.lineNumber, enums_1.BLOCKTYPE.INNER];
            break;
        default:
            break;
    }
    // 判断是否为声明，特殊声明或注释
    if (result === null) {
        // 注释
        if (line.text.startsWith("#")) {
            result = [line.lineNumber, enums_1.BLOCKTYPE.COMMENT];
        }
        // 双下划线变量声明
        else if (line.text.match(regexp_1.special_variable)) {
            result = [line.lineNumber, enums_1.BLOCKTYPE.SPECIAL];
        }
        // 其他变量声明
        else if (line.text.match(regexp_1.variable)) {
            result = [line.lineNumber, enums_1.BLOCKTYPE.VARIABLE];
        }
        // 其他如 @表达式, if 开头的表达式等
        else {
            result = [line.lineNumber, enums_1.BLOCKTYPE.OTHER];
        }
    }
    return result;
}
function getPartMetaInfo(lineInfos, document) {
    if (!ifNeed(lineInfos, document)) {
        vscode.window.showInformationMessage("在文档中找到了忽略预指令，该文档将不会被格式化👌");
        return null;
    }
    // 找到import块
    let import_part = null;
    let index = lineInfos.length - 1;
    for (; index > 0; index--) {
        const element = lineInfos[index];
        if (element[1] === enums_1.BLOCKTYPE.IMPORT && lineInfos[index + 1][1] === enums_1.BLOCKTYPE.WHITELINE) {
            import_part = [0, index + 1];
            break;
        }
        else {
            continue;
        }
    }
    for (; index < lineInfos.length; index++) {
    }
    return import_part;
}
/**
 * 根据文档名称和 import 前面的注释判断是否该对文档进行排序
 * @param lineInfos
 * @param document
 * @returns
 */
function ifNeed(lineInfos, document) {
    if (document.fileName === "main.py") {
        return false;
    }
    for (let index = 0; index < lineInfos.length; index++) {
        const element = lineInfos[index];
        if (element[1] === enums_1.BLOCKTYPE.OTHER || element[1] === enums_1.BLOCKTYPE.COMMENT) {
            // 和 isort 同步，如果指示该文件跳过 isort, 则也跳过这个排序
            if (document.lineAt(element[0]).text.match("isort:[\s]*(skip|ignore)")) {
                return false;
            }
        }
        else if (element[1] === enums_1.BLOCKTYPE.IMPORT) {
            return true;
        }
    }
}
/**
 * start end 两头都包括
 * @param document
 * @param start
 * @param end
 */
function getTextbyLineRange(document, start, end) {
    return document.getText(new vscode.Range(start, 0, end, 0));
}
//# sourceMappingURL=anaylsis.js.map