"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineTypeInfo = void 0;
exports.LineIndexBuilder = LineIndexBuilder;
const utils_1 = require("../../utils");
class LineTypeInfo {
    line_number;
    code_type;
    intent_type;
    constructor(line_number, code_type, intent_type) {
        this.line_number = line_number;
        this.code_type = code_type;
        this.intent_type = intent_type;
    }
}
exports.LineTypeInfo = LineTypeInfo;
function LineIndexBuilder(line) {
    try {
        let result = _infer_line_type_by_text(line.text);
        let intent_result = utils_1.BLOCKTYPE.WHITELINE;
        if (line.text.length > 4) {
            intent_result = _infer_line_type_by_text(line.text.substring(4));
        }
        return new LineTypeInfo(line.lineNumber, result, intent_result);
    }
    catch (e) {
        throw new Error(`${line.lineNumber + 1}`);
    }
}
function _infer_line_type_by_text(text) {
    let result = null;
    // 空行
    if (text.length === 0 || text.trim().length === 0) {
        result = utils_1.BLOCKTYPE.WHITELINE;
    }
    // 字符数少于 4 只可能是注释或声明变量
    else if (text.length < 4) {
        if (text.startsWith("#")) {
            result = utils_1.BLOCKTYPE.COMMENT;
        }
        else if (text.includes("=")) {
            result = utils_1.BLOCKTYPE.VARIABLE;
        }
    }
    // 判断这个代码块是 类，函数，导入，缩进
    switch (text.substring(0, 4)) {
        case "clas":
            result = utils_1.BLOCKTYPE.CLASS;
            break;
        case "def ":
            result = utils_1.BLOCKTYPE.METHOD;
            break;
        case "from":
        case "impo":
            result = utils_1.BLOCKTYPE.IMPORT;
            break;
        case "    ":
            result = utils_1.BLOCKTYPE.INNER;
            break;
        default:
            break;
    }
    // 判断是否为声明，特殊声明或注释
    if (result === null) {
        if (text.match(utils_1.ignore_command)) {
            throw new Error(`ignore command found`);
        }
        // 注释
        else if (text.startsWith("#")) {
            result = utils_1.BLOCKTYPE.COMMENT;
        }
        // 双下划线变量声明
        else if (text.match(utils_1.special_variable)) {
            result = utils_1.BLOCKTYPE.SPECIAL;
        }
        // 其他变量声明
        else if (text.match(utils_1.variable)) {
            result = utils_1.BLOCKTYPE.VARIABLE;
        }
        // 其他如 @表达式, if 开头的表达式等
        else {
            result = utils_1.BLOCKTYPE.OTHER;
        }
    }
    return result;
}
//# sourceMappingURL=line_index.js.map