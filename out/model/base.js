"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeBlockBase = void 0;
/** 所有函数块的基类 */
class CodeBlockBase {
    /** 源代码文本 */
    source_code;
    /** 源代码文本类型*/
    code_type;
    /** 源代码文本在源文本的起始行号 */
    line_number;
    block_type_info = [];
    /**
     *
     * @param source_code 源文件代码片段
     * @param code_type 代码片段类型
     * @param line_number 代码片段在源文件中的起始行号
     */
    constructor(source_code, code_type, line_number, block_type_info = []) {
        this.source_code = source_code;
        this.code_type = code_type;
        this.line_number = line_number;
        this.block_type_info = block_type_info;
    }
}
exports.CodeBlockBase = CodeBlockBase;
//# sourceMappingURL=base.js.map