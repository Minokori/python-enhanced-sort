export enum CodeType {
    /**import 语句*/
    IMPORT = 1 << 0,         // 1

    /**特殊变量 (双下划线) 声明语句*/
    SPECIAL = 1 << 1,        // 2

    /** 类型声明语句*/
    CLASS = 1 << 2,          // 4

    /** TYPE_CHECKING 语句 */
    TYPE_CHECKING = 1 << 3,  // 8

    /** 方法/函数声明语句*/
    METHOD = 1 << 4,         // 8

    /**变量声明语句*/
    VARIABLE = 1 << 5,       // 16

    /**注释*/
    COMMENT = 1 << 6,        // 32

    /**注释块*/
    COMMENTBLOCK = 1 << 7,   // 64

    /**其他语句。比如函数和类的wrapper，for，if，while等*/
    OTHER = 1 << 8,          // 128

    /**空行*/
    WHITELINE = 1 << 9,      // 256

    /**缩进语句*/
    INNER = 1 << 10,          // 512

    /** 函数/类装饰器*/
    WRAPPER = 1 << 11,       // 1024

    /**`for`, `if`, `while`, `with` 等有子块的语句*/
    BASEBLOCK = 1 << 12,     // 2048

    /**文档*/
    DOCUMENT = 1 << 13,      // 4096
}

// 预定义的代码类型组
export const CodeTypeGroups = {
    // 可能有内部结构的代码类型
    HAS_INNER_BLOCK:
        CodeType.IMPORT |
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
export function may_have_inner_block(type: CodeType): boolean {
    return (type & CodeTypeGroups.HAS_INNER_BLOCK) !== 0;
}

/**
 * 检查代码类型是否可以有装饰器
 * @param type 代码类型
 * @returns 是否可以有装饰器
 */
export function has_warpper(type: CodeType): boolean {
    return (type & CodeTypeGroups.HAS_WRAPPER) !== 0;
}

/**
 * 检查代码类型是否没有内部结构（后续的inner跟空行都算到type里）
 * @param type 代码类型
 * @returns 是否没有内部结构
 */
export function no_sub_block(type: CodeType): boolean {
    return (type & CodeTypeGroups.NO_SUB_BLOCK) !== 0;
}

/**
 * 检查代码类型是否为附属语句
 * @param type 代码类型
 * @returns 是否为附属语句
 */
export function is_additional(type: CodeType): boolean {
    return (type & CodeTypeGroups.ADDITIONAL) !== 0;
}

/**
 * 检查代码类型是否应该对其子元素进行排序
 * @param type 代码类型
 * @returns 是否应该对其子元素进行排序
 */
export function should_sort_children(type: CodeType): boolean {
    return (type & CodeTypeGroups.SHOULD_SORT_CHILDREN) !== 0;
}
