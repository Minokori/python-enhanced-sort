import * as vscode from 'vscode';
import { CodeType, may_have_inner_block, has_warpper, no_sub_block, is_additional, should_sort_children } from './enum';
import { infer_line_type_by_text } from './infer';
import { log } from "./debug";
import { method_name, special_variable } from './regexp';
import { compare_tag } from './utils';
let ToTalContents: vscode.TextLine[] = [];
/**代码行的类型 [缩进级别][行号]
 *
 * 举例
 *
 * 类的一个 def 在[0][line] 下是 inner block，
 * 在 [1][line] 下是 def block
 *  */
let ToTalContentTypes: CodeType[][] = [];
let pointer = 0;
let Length = 0;
let MaxDepth = 0;
export function ConvertToLines(document: vscode.TextDocument, depth: number = 2): void {
    MaxDepth = depth;
    pointer = 0;
    Length = document.lineCount;
    ToTalContents = [];
    ToTalContentTypes = [];
    for (let index = 0; index < Length; index++) {
        ToTalContents.push(document.lineAt(index));
    }

    for (let i = 0; i < MaxDepth; i++) {
        let l = [];
        for (let line_number = 0; line_number < Length; line_number++) {
            let line = ToTalContents[line_number];
            // 可能报错，由于预处理指令
            l.push(infer_line_type_by_text(line.text.substring(i * 4)));
        }
        ToTalContentTypes.push(l);
    }

}



export class CodeBlock {
    type: CodeType;
    intent_level: number;
    startline: number;//包含
    endline: number;//(不包含)
    children: CodeBlock[] = [];
    tags: string[] = [];
    constructor(type: CodeType, intent_level: number, startline: number, endline: number) {
        this.type = type;
        /**代码块的缩进级别。全局代码是0, doc 规定为-1*/
        this.intent_level = intent_level;
        this.startline = startline;
        this.endline = endline;
        this.tags = this.init_tags();
        let other = this.init_children();
        this.children = [...this.children, ...other];

    }

    /**
     *
     * @returns 拼接源代码，不调用sort的话期望用它返回该代码块的源代码
     */
    toString(): string {
        let source_code = "";
        // 原子块
        if (this.children.length === 0) {
            for (let index = this.startline; index < this.endline; index++) {
                source_code += ToTalContents[index].text;
                source_code += "\n";
                //source_code += vscode.workspace.getConfiguration("Files").get("eol");
            }
        }
        // 非原子块
        if (this.type !== CodeType.DOCUMENT && this.children.length > 0) {
            for (let index = this.startline; index < this.children[0].startline; index++) {
                source_code += ToTalContents[index].text;
                source_code += "\n";
            }
        }
        //
        for (let child of this.children) {

            source_code += child.toString();
        }
        return source_code;
    }


    private init_children(): CodeBlock[] {
        // BUG 如果 class 声明里有 if TYPE_CHECKING: 则会报错。把class里面的多加enum
        log(`    正在为 ${CodeType[this.type]} 构建子代码块`);
        // 只有文档类初始化import
        if (this.type === CodeType.DOCUMENT) {
            let block = null;
            block = this.init_import_block();
            if (block) { this.children.push(block); }
        }
        //
        if (no_sub_block(this.type)) {
            log(`    ${CodeType[this.type]} 没有子代码块`);
            return [];
        }
        pointer++;
        return this.get_sub_code_block();
    }

    /** 读取源文档的 import 代码块
     *
     * 注意：假设源文档已经被 isort 和 autopep8 格式化过（即 最后一个import 代码行下有两个空格）
     * @returns 1.
     * @returns 2. import 代码块
     */
    private init_import_block(): CodeBlock {
        let end = ToTalContentTypes[0].findLastIndex(item => item === CodeType.IMPORT);
        // 如果import语句发生了换行
        while (ToTalContentTypes[0][end + 1] === CodeType.INNER) {
            end++;
        }
        log(`import 代码块: Line 1 - ${end + 1}`);
        pointer = end + 1;
        return new CodeBlock(CodeType.IMPORT, 0, 0, pointer);
    }

    /**
     * 查询开始时行指针为要执行查询的起始行，将遍历查询至文件结尾
     * @param line_pointer 行指针，指向还没有查询的行
     * @returns
     */
    private get_sub_code_block(): CodeBlock[] {
        let l: CodeBlock[] = [];

        // 起始行开始遍历
        for (; pointer < this.endline; pointer++) {
            // 获取行的信息
            let line_info = ToTalContentTypes[this.intent_level + 1][pointer];
            if (is_additional(line_info)) {
                continue;
            }
            log(`在${pointer + 1}行找到${CodeType[line_info]}`);

            let [begin, end, next_block_begin] = this.get_single_block(pointer, line_info);
            let block = new CodeBlock(line_info, this.intent_level + 1, begin, end);
            if (next_block_begin > 0) {
                pointer = next_block_begin - 1;
            }
            else {
                pointer = Length - 1;
            }
            l.push(block);
        }
        log(`    ${CodeType[this.type]} 子代码块构建结束`);
        return l;
    }

    /**
     * 查找单个代码块
     * @param start_line_number 开始查找的行号 (0-based, 包含)
     * @param block_type 代码块是否为类或者方法
     * @returns 1. 代码块的起始行号 (包含, 包含前导空行)
     * @returns 2. 代码块的结束行号 (不包含, 不包含后置空行)
     * @returns 3. 下一次查找要开始的行号 (0-based, 包含)。若为 -1，说明已经抵达文件末尾
     */
    private get_single_block(start_line_number: number, block_type: CodeType): [start: number, end: number, next_line_number: number] {
        //BUG 把换行注释弄成一个块
        //#region 先倒序找，确保找到了函数/类的wrapper
        //只有class 跟 method需要
        let true_block_begin: number;
        // 从代码块起始行倒序查找，找到最后一个非空行
        if (has_warpper(block_type)) {
            //先找到倒着数的第一个空行
            true_block_begin = ToTalContentTypes[this.intent_level + 1].slice(0, start_line_number).findLastIndex(item => item !== CodeType.WRAPPER);
            //+1就是第一个非空行的行号(包含)
            true_block_begin += 1;
        }
        else {
            true_block_begin = start_line_number;
        }
        // 从这个非空行向上查找，包括所有的空行
        let begin = this.find_prefix_whitelines_line_num(true_block_begin);
        //#endregion


        //#region 再正序找，找到第一个不是 inner block 或空行 的地方为止
        // 查找后面第一个不为 空行或inner block的行, 若返回undefined说明没找到
        // BUG """找不到
        let next_block_begin_line_number: number;
        if (block_type === CodeType.COMMENTBLOCK) {
            next_block_begin_line_number = ToTalContentTypes[this.intent_level + 1].findIndex(
                (item, idx) => (
                    (item === CodeType.COMMENTBLOCK) &&
                    (idx > start_line_number)));
        }
        else {
            next_block_begin_line_number = ToTalContentTypes[this.intent_level + 1].findIndex(
                (item, idx) => (
                    (item !== CodeType.WHITELINE) &&
                    (item !== CodeType.INNER) &&
                    (idx > start_line_number)));
        }
        //#endregion

        //后面没找到空行或缩进行，说明直到文件末尾都是要找的范围
        if (next_block_begin_line_number === undefined) {
            let true_block_end = Length;
            log(`    ${CodeType[block_type]}: ${begin + 1}-${true_block_end}`);
            return [begin, true_block_end, Length];
        }
        //找到下一个代码块的第一行，从这一行倒着把空行排除
        else {
            let true_block_end = this.find_prefix_whitelines_line_num(next_block_begin_line_number);
            log(`    ${CodeType[block_type]}: ${begin + 1}-${true_block_end}`);
            if (block_type === CodeType.COMMENTBLOCK) {
                return [begin, true_block_end + 1, next_block_begin_line_number + 1];
            }
            return [begin, true_block_end, next_block_begin_line_number];
        }



    }

    /**
     * 为指定代码行包含前导空行
     * @param line_num 代码块起始行号 (包括)
     * @returns 包含所有前导空行的代码起始行。假如第 n 行前面有3个空行，则返回 n-3
     */
    private find_prefix_whitelines_line_num(line_num: number): number {
        return ToTalContentTypes[this.intent_level + 1].slice(0, line_num).findLastIndex(item => item !== CodeType.WHITELINE) + 1;
    }


    /** 同等缩进等级的 block 排序用的 tag */
    private init_tags(): string[] {
        if (this.type === CodeType.SPECIAL) {
            return [ToTalContents[this.startline].text.match(special_variable)![0]];
        }

        else if (this.type === CodeType.METHOD) {
            let t: string[] = [];
            let start_line_number = this.startline;
            do {
                let reg_result = ToTalContents[start_line_number].text.match(method_name);
                if (reg_result) {
                    //普通函数或属性
                    if (reg_result[1] === undefined) {
                        if (ToTalContents[start_line_number - 1].text.includes("@property")) {
                            t.push("1");
                        }
                        else {
                            t.push("2");
                        }


                    }
                    //单下划线函数
                    else if (reg_result[1] === "_") {
                        t.push("3");
                    }
                    //特殊函数
                    else if (reg_result[1] === reg_result[3] && reg_result[1] === "__") {
                        t.push("0");
                    }
                    let other_tags = reg_result[2].split("_");
                    t = [...t, ...other_tags];
                    break;
                }
                else {
                    start_line_number++;
                    continue;
                }
            } while (true);
            return t;
        }
        return [];
    }


    public sort_children(): void {
        // 没有childen或不需要对children排序
        if (this.children.length === 0 || !should_sort_children(this.type)) {
            log(`block ${CodeType[this.type]} , Line ${this.startline + 1} - ${this.endline} 的内部不需要排序`);
            return;
        }

        // 嵌套排序
        for (const child of this.children) {
            child.sort_children();
        }


        // 排序children
        //log(`block ${CodeType[this.type]} , Line ${this.startline + 1} - ${this.endline} 需要排序的 children :`);
        let need_sort_children = this.children.filter(child => child.tags.length > 0);
        //log(`${need_sort_children}`);
        need_sort_children.sort(CodeBlock.sort_func);
        let index = 0;
        this.children = this.children.map(child => {
            if (child.tags.length > 0) {
                return need_sort_children[index++];
            }
            else {
                return child;
            }
        });
        // log("排序后");
        // log(`${need_sort_children}`);

    }
    //a在b前返回 < 0 的数;

    private static sort_func(a: CodeBlock, b: CodeBlock): number {
        //先比type,type小的放前面
        if (a.type !== b.type) {
            return (a.type - b.type);
        }
        // type一样，比tag
        else {
            //检查函数类型，__ 前于 普通 前于 _
            if (a.tags[0] !== b.tags[0]) {
                return Number(a.tags[0]) - Number(b.tags[0]);
            }
            for (let index = 1; index < Math.min(a.tags.length, b.tags.length); index++) {
                let result = compare_tag(a.tags[index], b.tags[index]);
                if (result !== 0) {
                    return result;
                }
                continue;
            }
        }
        return 0;
    }
}