"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeType = void 0;
exports.may_have_inner_block = may_have_inner_block;
exports.has_warpper = has_warpper;
exports.no_sub_block = no_sub_block;
exports.is_additional = is_additional;
exports.should_sort_children = should_sort_children;
var CodeType;
(function (CodeType) {
    /**import 语句 0*/
    CodeType[CodeType["IMPORT"] = 0] = "IMPORT";
    /**特殊变量 (双下划线) 声明语句 1*/
    CodeType[CodeType["SPECIAL"] = 1] = "SPECIAL";
    /** 类型声明语句 2*/
    CodeType[CodeType["CLASS"] = 2] = "CLASS";
    /** 方法/函数声明语句 3*/
    CodeType[CodeType["METHOD"] = 3] = "METHOD";
    /**变量声明语句 4*/
    CodeType[CodeType["VARIABLE"] = 4] = "VARIABLE";
    /**注释 5*/
    CodeType[CodeType["COMMENT"] = 5] = "COMMENT";
    CodeType[CodeType["COMMENTBLOCK"] = 6] = "COMMENTBLOCK";
    /**其他语句。比如函数和类的wrapper，for，if，while等 6*/
    CodeType[CodeType["OTHER"] = 7] = "OTHER";
    /**空行 7*/
    CodeType[CodeType["WHITELINE"] = 8] = "WHITELINE";
    /**缩进语句 8*/
    CodeType[CodeType["INNER"] = 9] = "INNER";
    /** 函数/类装饰器 9*/
    CodeType[CodeType["WRAPPER"] = 10] = "WRAPPER";
    /**for,if,while,with 等有子块的语句 10*/
    CodeType[CodeType["BASEBLOCK"] = 11] = "BASEBLOCK";
    //TODO
    /**11 */
    CodeType[CodeType["DOCUMENT"] = 12] = "DOCUMENT";
})(CodeType || (exports.CodeType = CodeType = {}));
/**
 * 可能有内部结构，下一行的缩进内容可能属于它
 * @param type
 * @returns
 */
function may_have_inner_block(type) {
    if (type === CodeType.IMPORT ||
        type === CodeType.CLASS ||
        type === CodeType.COMMENTBLOCK ||
        type === CodeType.INNER ||
        type === CodeType.DOCUMENT ||
        type === CodeType.METHOD ||
        type === CodeType.BASEBLOCK) {
        return true;
    }
    return false;
}
function has_warpper(type) {
    if (type === CodeType.CLASS || type === CodeType.METHOD) {
        return true;
    }
    return false;
}
/** 没有内部结构（后续的inner 跟空行都算到type里） */
function no_sub_block(type) {
    if (type === CodeType.METHOD ||
        type === CodeType.IMPORT ||
        type === CodeType.SPECIAL ||
        type === CodeType.VARIABLE ||
        type === CodeType.COMMENT ||
        type === CodeType.COMMENTBLOCK ||
        type === CodeType.WHITELINE ||
        type === CodeType.WRAPPER ||
        type === CodeType.OTHER) {
        return true;
    }
    return false;
}
/** 是别的代码块的附属语句 */
function is_additional(type) {
    if (type === CodeType.COMMENT ||
        type === CodeType.WHITELINE ||
        type === CodeType.WRAPPER) {
        return true;
    }
    return false;
}
function should_sort_children(type) {
    if (type === CodeType.DOCUMENT ||
        type === CodeType.CLASS) {
        return true;
    }
    return false;
}
//# sourceMappingURL=enum.js.map