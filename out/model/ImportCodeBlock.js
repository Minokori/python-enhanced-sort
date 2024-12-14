"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportCodeBlock = void 0;
const base_1 = require("./base");
/**
 *  python import 语句的代码块
 */
class ImportCodeBlock extends base_1.CodeBlockBase {
    sort() {
        console.log("import 代码块不需要排序");
    }
    to_sorted_source_code() {
        return this.source_code;
    }
    get weight() {
        return -1;
    }
    get tags() {
        return ["import"];
    }
}
exports.ImportCodeBlock = ImportCodeBlock;
//# sourceMappingURL=ImportCodeBlock.js.map