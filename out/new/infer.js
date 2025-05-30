"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.infer_line_type_by_text = infer_line_type_by_text;
const regexp_1 = require("./regexp");
const enum_1 = require("./enum");
/**
 * 根据文本判断 **代码行** 的类别
 *
 * ***文本不包括前导空格***
 *
 * @param text 文本
 * @returns 代码行类别
 */
function infer_line_type_by_text(text) {
    let result = null;
    // 空行
    if (text.length === 0 || text.trim().length === 0) {
        result = enum_1.CodeType.WHITELINE;
    }
    // 字符数少于 4 只可能是注释或声明变量
    else if (text.length < 4) {
        if (text.startsWith("#")) {
            result = enum_1.CodeType.COMMENT;
        }
        else if (text.startsWith('"""')) {
            result = enum_1.CodeType.COMMENTBLOCK;
        }
        else if (text.includes("=")) {
            result = enum_1.CodeType.VARIABLE;
        }
    }
    // 判断这个代码块是 类，函数，导入，缩进
    switch (text.substring(0, 4)) {
        case "clas":
            result = enum_1.CodeType.CLASS;
            break;
        case "def ":
            result = enum_1.CodeType.METHOD;
            break;
        case "from":
        case "impo":
            result = enum_1.CodeType.IMPORT;
            break;
        case "    ":
            result = enum_1.CodeType.INNER;
            break;
        default:
            break;
    }
    // 判断是否为声明，特殊声明或注释
    if (result === null) {
        if (text.match(regexp_1.ignore_command)) {
            throw new Error(`ignore command found`);
        }
        // 类型检查
        else if (text.startsWith("if TYPE_CHECKING")) {
            result = enum_1.CodeType.TYPE_CHECKING;
        }
        // 注释
        else if (text.startsWith("#")) {
            result = enum_1.CodeType.COMMENT;
        }
        else if ((text.startsWith('"""') || text.startsWith('r"""')) && text.endsWith('"""')) {
            result = enum_1.CodeType.COMMENT;
        }
        else if (text.startsWith('"""') || text.startsWith('r"""')) {
            result = enum_1.CodeType.COMMENTBLOCK;
        }
        // 双下划线变量声明
        else if (text.match(regexp_1.special_variable)) {
            result = enum_1.CodeType.SPECIAL;
        }
        // 其他变量声明
        else if (text.match(regexp_1.variable)) {
            result = enum_1.CodeType.VARIABLE;
        }
        else if (text.startsWith("@")) {
            result = enum_1.CodeType.WRAPPER;
        }
        else if (text.endsWith(":")) {
            result = enum_1.CodeType.BASEBLOCK;
        }
        // 其他
        else {
            result = enum_1.CodeType.OTHER;
        }
    }
    return result;
}
//# sourceMappingURL=infer.js.map