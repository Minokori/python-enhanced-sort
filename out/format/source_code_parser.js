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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourceCodeParser = void 0;
const vscode = __importStar(require("vscode"));
const line_index_1 = require("./types/line_index");
const enums_1 = require("../utils/enums");
const Model = __importStar(require("../model"));
const path_1 = __importDefault(require("path"));
const console_1 = require("console");
class SourceCodeParser {
    document;
    line_index = [];
    import_block;
    constructor(document) {
        this.document = document;
        //先手判断name避免浪费资源
        let name = document.fileName.split(path_1.default.sep).pop();
        let file_to_ignore = vscode.workspace.getConfiguration("pythonEnhancedSort").get("ignoreFiles");
        if (file_to_ignore.includes(name)) {
            vscode.window.showInformationMessage(`文档名称为 ${name}, 该文档不会被格式化`);
            return;
        }
        //如果存在预处理指令则return避免浪费资源
        try {
            this.line_index = this._init_type_info();
        }
        catch (error) {
            vscode.window.showInformationMessage(`存在预处理指令 (line: ${error.message}), 该文档将不会被格式化 👌`);
            return;
        }
        //初始化各个代码块
        if (this.should_sort) {
            let [import_block, next_line_number] = this._get_import_block();
            this.import_block = new Model.ImportCodeBlock(import_block, enums_1.BLOCKTYPE.IMPORT, 0);
            let tmp = this._get_code_block(next_line_number);
            (0, console_1.log)(tmp);
        }
    }
    /** 为源文档每行代码编制代码类型索引 */
    _init_type_info() {
        let l = [];
        for (let line_number = 0; line_number < this.document.lineCount; line_number++) {
            let line = this.document.lineAt(line_number);
            // 可能报错: 遇到忽略指令
            l.push((0, line_index_1.LineIndexBuilder)(line));
        }
        (0, console_1.log)(l);
        return l;
    }
    /** 源文档是否应该排序 */
    get should_sort() {
        if (this.line_index.length === 0) {
            return false;
        }
        else {
            return true;
        }
    }
    /** 读取源文档的 import 代码块
     *
     * 注意：假设源文档已经被 isort 和 autopep8 格式化过（即 最后一个import 代码行下有两个空格）
     * @returns 1. 源文档从第1行（可能包括注释）到最后一个 import 语句的代码块 （不包括尾随空格）
     * @returns 2. 还未读取过的源文件的行号
     */
    _get_import_block() {
        let line_num = this.line_index.findLastIndex(item => item.code_type === enums_1.BLOCKTYPE.IMPORT);
        // 如果import语句发生了换行
        while (this.line_index[line_num + 1].code_type === enums_1.BLOCKTYPE.INNER) {
            line_num++;
        }
        (0, console_1.log)(`import 代码块: Line 1 - ${line_num + 1}`);
        return [this._get_text_by_line_number(0, line_num), line_num + 1];
    }
    /** 通过行号（从0开始）从源文件中取源文本
     * @param start 起始行号（包括）
     * @param end 结束行号（包括）
     * @returns [start,end] 行的文本
     */
    _get_text_by_line_number(start, end) {
        return this.document.getText(new vscode.Range(start, 0, end + 1, 0));
    }
    /**
     * 查询开始时行指针为要执行查询的起始行，将遍历查询至文件结尾
     * @param line_pointer 行指针，指向还没有查询的行
     * @returns
     */
    _get_code_block(line_pointer) {
        let l = [];
        // 起始行开始遍历
        for (; line_pointer < this.line_index.length; line_pointer++) {
            // 获取行的信息
            let line_info = this.line_index[line_pointer];
            switch (line_info.code_type) {
                case enums_1.BLOCKTYPE.CLASS:
                    {
                        let [cls_begin, cls_end, next_block_begin] = this._get_single_block(line_pointer, true);
                        (0, console_1.log)(`class 代码块: Line ${cls_begin + 1} and Line ${cls_end + 1}`);
                        // -1 是因为for循环会先+再判断
                        line_pointer = next_block_begin - 1;
                        l.push(new Model.ClassCodeBlock(this._get_text_by_line_number(cls_begin, cls_end), enums_1.BLOCKTYPE.CLASS, cls_begin, this.line_index.slice(cls_begin, cls_end + 1)));
                        break;
                    }
                case enums_1.BLOCKTYPE.METHOD:
                    {
                        let [mtd_begin, mtd_end, next_block_begin] = this._get_single_block(line_pointer, true);
                        (0, console_1.log)(`method 代码块: Line ${mtd_begin + 1} and Line ${mtd_end + 1}`);
                        // -1 是因为for循环会先+再判断
                        line_pointer = next_block_begin - 1;
                        l.push(new Model.MethodCodeBlock(this._get_text_by_line_number(mtd_begin, mtd_end), enums_1.BLOCKTYPE.METHOD, mtd_begin, this.line_index.slice(mtd_begin, mtd_end + 1)));
                        (0, console_1.log)(`    fullname: ${l[l.length - 1].fullname}`);
                        (0, console_1.log)(`    tags: ${l[l.length - 1].tags}`);
                        (0, console_1.log)(`    method type: ${l[l.length - 1]._type}`);
                        break;
                    }
                case enums_1.BLOCKTYPE.COMMENT:
                    {
                        vscode.window.showWarningMessage("DO NOT comment outside class or method. we would delete it.");
                        break;
                    }
                case enums_1.BLOCKTYPE.SPECIAL:
                    {
                        let [begin, end, next_block_begin] = this._get_single_block(line_pointer);
                        (0, console_1.log)(`special 代码块: Line ${begin + 1} and Line ${end + 1}`);
                        // -1 是因为for循环会先+再判断
                        line_pointer = next_block_begin - 1;
                        l.push(new Model.SpecialCodeBlock(this._get_text_by_line_number(begin, end), enums_1.BLOCKTYPE.SPECIAL, begin));
                        break;
                    }
                case enums_1.BLOCKTYPE.VARIABLE:
                    {
                        let [begin, end, next_block_begin] = this._get_single_block(line_pointer);
                        (0, console_1.log)(`variable 代码块: Line ${begin + 1} and Line ${end + 1}`);
                        // -1 是因为for循环会先+再判断
                        line_pointer = next_block_begin - 1;
                        l.push(new Model.VariableCodeBlock(this._get_text_by_line_number(begin, end), enums_1.BLOCKTYPE.VARIABLE, begin, this.line_index.slice(begin, end + 1)));
                        break;
                    }
                case enums_1.BLOCKTYPE.OTHER:
                    {
                        let [begin, end, next_block_begin] = this._get_single_block(line_pointer);
                        (0, console_1.log)(`other 代码块: Line ${begin + 1} and Line ${end + 1}`);
                        // -1 是因为for循环会先+再判断
                        line_pointer = next_block_begin - 1;
                        l.push(new Model.OtherCodeBlock(this._get_text_by_line_number(begin, end), enums_1.BLOCKTYPE.OTHER, begin, this.line_index.slice(begin, end + 1)));
                        break;
                    }
                default:
                    (0, console_1.log)(`类型为 ${line_info.code_type} 的代码块没有被处理`);
                    break;
            }
        }
        return l;
    }
    /**
     * 查找单个代码块
     * @param start_line_number 开始查找的行号 (0-based, 包含)
     * @param class_or_method 代码块是否为类或者方法
     * @returns 1. 代码块的起始行号 (包含, 包含前导空行)
     * @returns 2. 代码块的结束行号 (包含, 不包含后置空行)
     * @returns 3. 下一次查找要开始的行号 (0-based, 包含)。若为 -1，说明已经抵达文件末尾
     */
    _get_single_block(start_line_number, class_or_method = false) {
        //#region 先倒序找，确保找到了函数/类的wrapper
        //只有class 跟 method需要
        let true_block_begin;
        // 从代码块起始行倒序查找，找到最后一个非空行
        if (class_or_method) {
            //先找到倒着数的第一个空行
            true_block_begin = this.line_index.slice(0, start_line_number).findLastIndex(item => item.code_type === enums_1.BLOCKTYPE.WHITELINE);
            //+1就是第一个非空行的行号(包含)
            true_block_begin += 1;
        }
        else {
            true_block_begin = start_line_number;
        }
        // 从这个非空行向上查找，包括所有的空行
        let begin = this._contains_prefix_whitelines(true_block_begin);
        //#endregion
        //#region 再正序找，找到第一个不是 inner block的地方为止
        // 查找后面第一个不为 空行或inner block的行, 若返回undefined说明没找到
        let next_block_begin_line = this.line_index.slice(start_line_number + 1).find(item => ((item.code_type !== enums_1.BLOCKTYPE.WHITELINE) && (item.code_type !== enums_1.BLOCKTYPE.INNER)));
        //#endregion
        if (next_block_begin_line === undefined) {
            let true_block_end = this._contains_prefix_whitelines(this.line_index.length - 1);
            return [begin, true_block_end, this.line_index.length];
        }
        else {
            let true_block_end = this._contains_prefix_whitelines(next_block_begin_line.line_number) - 1;
            return [begin, true_block_end, next_block_begin_line.line_number];
        }
    }
    /**
     * 为指定代码行包含前导空行
     * @param line_num 代码块起始行号 (包括)
     * @returns 包含所有前导空行的代码起始行。假如第 n 行前面有3个空行，则返回 n-3
     */
    _contains_prefix_whitelines(line_num) {
        return this.line_index.slice(0, line_num).findLastIndex(item => item.code_type !== enums_1.BLOCKTYPE.WHITELINE) + 1;
    }
}
exports.SourceCodeParser = SourceCodeParser;
//# sourceMappingURL=source_code_parser.js.map