import { ignore_command, special_variable, variable } from "./regexp";
import { CodeType } from "./enum";

/**
 * 根据文本判断代码行的类别
 * @param text 文本
 * @returns 代码行类别
 */
export function infer_line_type_by_text(text: string): CodeType {
    let result = null;
    // 空行
    if (text.length === 0 || text.trim().length === 0) {
        result = CodeType.WHITELINE;
    }
    // 字符数少于 4 只可能是注释或声明变量
    else if (text.length < 4) {
        if (text.startsWith("#")) {
            result = CodeType.COMMENT;
        }
        else if (text.startsWith('"""')) {
            result = CodeType.COMMENTBLOCK;
        }
        else if (text.includes("=")) {
            result = CodeType.VARIABLE;
        }
    }
    // 判断这个代码块是 类，函数，导入，缩进
    switch (text.substring(0, 4)) {
        case "clas":
            result = CodeType.CLASS;
            break;
        case "def ":
            result = CodeType.METHOD;
            break;
        case "from":
        case "impo":
            result = CodeType.IMPORT;
            break;
        case "    ":

            result = CodeType.INNER;
            break;
        default:
            break;
    }
    // 判断是否为声明，特殊声明或注释
    if (result === null) {
        if (text.match(ignore_command)) {
            throw new Error(`ignore command found`);
        }
        // 注释
        else if (text.startsWith("#")) {
            result = CodeType.COMMENT;
        }
        else if (text.startsWith('"""')) {
            result = CodeType.COMMENTBLOCK;
        }
        // 双下划线变量声明
        else if (text.match(special_variable)) {
            result = CodeType.SPECIAL;
        }
        // 其他变量声明
        else if (text.match(variable)) {
            result = CodeType.VARIABLE;
        }
        else if (text.startsWith("@")) {
            result = CodeType.WRAPPER;
        }
        else if (text.endsWith(":")) {
            result = CodeType.BASEBLOCK;
        }
        // 其他
        else {
            result = CodeType.OTHER;
        }
    }
    return result;
}
