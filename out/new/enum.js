"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeTypeGroups = exports.CodeType = void 0;
exports.may_have_inner_block = may_have_inner_block;
exports.has_warpper = has_warpper;
exports.no_sub_block = no_sub_block;
exports.is_additional = is_additional;
exports.should_sort_children = should_sort_children;
var CodeType;
(function (CodeType) {
    /**import 语句*/
    CodeType[CodeType["IMPORT"] = 1] = "IMPORT";
    /**特殊变量 (双下划线) 声明语句*/
    CodeType[CodeType["SPECIAL"] = 2] = "SPECIAL";
    /** 类型声明语句*/
    CodeType[CodeType["CLASS"] = 4] = "CLASS";
    /** TYPE_CHECKING 语句 */
    CodeType[CodeType["TYPE_CHECKING"] = 8] = "TYPE_CHECKING";
    /** 方法/函数声明语句*/
    CodeType[CodeType["METHOD"] = 16] = "METHOD";
    /**变量声明语句*/
    CodeType[CodeType["VARIABLE"] = 32] = "VARIABLE";
    /**注释*/
    CodeType[CodeType["COMMENT"] = 64] = "COMMENT";
    /**注释块*/
    CodeType[CodeType["COMMENTBLOCK"] = 128] = "COMMENTBLOCK";
    /**其他语句。比如函数和类的wrapper，for，if，while等*/
    CodeType[CodeType["OTHER"] = 256] = "OTHER";
    /**空行*/
    CodeType[CodeType["WHITELINE"] = 512] = "WHITELINE";
    /**缩进语句*/
    CodeType[CodeType["INNER"] = 1024] = "INNER";
    /** 函数/类装饰器*/
    CodeType[CodeType["WRAPPER"] = 2048] = "WRAPPER";
    /**`for`, `if`, `while`, `with` 等有子块的语句*/
    CodeType[CodeType["BASEBLOCK"] = 4096] = "BASEBLOCK";
    /**文档*/
    CodeType[CodeType["DOCUMENT"] = 8192] = "DOCUMENT";
})(CodeType || (exports.CodeType = CodeType = {}));
// 预定义的代码类型组
exports.CodeTypeGroups = {
    // 可能有内部结构的代码类型
    HAS_INNER_BLOCK: CodeType.IMPORT |
        CodeType.CLASS |
        CodeType.COMMENTBLOCK |
        CodeType.INNER |
        CodeType.DOCUMENT |
        CodeType.METHOD |
        CodeType.BASEBLOCK |
        CodeType.TYPE_CHECKING,
    // 可以有装饰器的代码类型
    HAS_WRAPPER: CodeType.CLASS | CodeType.METHOD,
    // 没有内部结构的代码类型
    NO_SUB_BLOCK: CodeType.METHOD | CodeType.IMPORT | CodeType.SPECIAL |
        CodeType.VARIABLE | CodeType.COMMENT | CodeType.COMMENTBLOCK |
        CodeType.WHITELINE | CodeType.WRAPPER | CodeType.OTHER,
    // 是别的代码块的附属语句
    ADDITIONAL: CodeType.COMMENT | CodeType.WHITELINE | CodeType.WRAPPER,
    // 应该对其子元素进行排序的代码类型
    SHOULD_SORT_CHILDREN: CodeType.DOCUMENT | CodeType.CLASS | CodeType.TYPE_CHECKING
};
/**
 * 检查代码类型是否可能有内部结构，下一行的缩进内容可能属于它
 * @param type 代码类型
 * @returns 是否可能有内部结构
 */
function may_have_inner_block(type) {
    return (type & exports.CodeTypeGroups.HAS_INNER_BLOCK) !== 0;
}
/**
 * 检查代码类型是否可以有装饰器
 * @param type 代码类型
 * @returns 是否可以有装饰器
 */
function has_warpper(type) {
    return (type & exports.CodeTypeGroups.HAS_WRAPPER) !== 0;
}
/**
 * 检查代码类型是否没有内部结构（后续的inner跟空行都算到type里）
 * @param type 代码类型
 * @returns 是否没有内部结构
 */
function no_sub_block(type) {
    return (type & exports.CodeTypeGroups.NO_SUB_BLOCK) !== 0;
}
/**
 * 检查代码类型是否为附属语句
 * @param type 代码类型
 * @returns 是否为附属语句
 */
function is_additional(type) {
    return (type & exports.CodeTypeGroups.ADDITIONAL) !== 0;
}
/**
 * 检查代码类型是否应该对其子元素进行排序
 * @param type 代码类型
 * @returns 是否应该对其子元素进行排序
 */
function should_sort_children(type) {
    return (type & exports.CodeTypeGroups.SHOULD_SORT_CHILDREN) !== 0;
}
//# sourceMappingURL=enum.js.map