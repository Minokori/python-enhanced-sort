export enum CodeType {
    /**import 语句 0*/
    IMPORT,

    /**特殊变量 (双下划线) 声明语句 1*/
    SPECIAL,

    /** 类型声明语句 2*/
    CLASS,

    /** 方法/函数声明语句 3*/
    METHOD,

    /**变量声明语句 4*/
    VARIABLE,

    /**注释 5*/
    COMMENT,

    COMMENTBLOCK,

    /**其他语句。比如函数和类的wrapper，for，if，while等 6*/
    OTHER,

    /**空行 7*/
    WHITELINE,

    /**缩进语句 8*/
    INNER,

    /** 函数/类装饰器 9*/
    WRAPPER,

    /**for,if,while,with 等有子块的语句 10*/
    BASEBLOCK,

    //TODO
    /**11 */
    DOCUMENT,

}

/**
 * 可能有内部结构，下一行的缩进内容可能属于它
 * @param type
 * @returns
 */
export function may_have_inner_block(type: CodeType): boolean {
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
export function has_warpper(type: CodeType) {
    if (type === CodeType.CLASS || type === CodeType.METHOD) {
        return true;
    }
    return false;
}

/** 没有内部结构（后续的inner 跟空行都算到type里） */
export function no_sub_block(type: CodeType): boolean {
    if (type === CodeType.METHOD ||
        type === CodeType.IMPORT ||
        type === CodeType.SPECIAL ||
        type === CodeType.VARIABLE ||
        type === CodeType.COMMENT ||
        type === CodeType.COMMENTBLOCK||
        type === CodeType.WHITELINE ||
        type === CodeType.WRAPPER ||
        type === CodeType.OTHER
    ) {
        return true;
    }
    return false;
}

/** 是别的代码块的附属语句 */
export function is_additional(type: CodeType): boolean {
    if (
        type === CodeType.COMMENT ||
        type === CodeType.WHITELINE ||
        type === CodeType.WRAPPER
    ) {
        return true;
    }
    return false;
}

export function should_sort_children(type: CodeType): boolean {
    if (type === CodeType.DOCUMENT ||
        type === CodeType.CLASS) {
        return true;
    }
    return false;
}