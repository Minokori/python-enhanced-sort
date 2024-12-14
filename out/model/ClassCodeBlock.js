"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassCodeBlock = void 0;
const base_1 = require("./base");
var BIGTAG;
(function (BIGTAG) {
    BIGTAG[BIGTAG["static_field"] = 0] = "static_field";
    BIGTAG[BIGTAG["static_property"] = 1] = "static_property";
    BIGTAG[BIGTAG["static_method"] = 2] = "static_method";
    BIGTAG[BIGTAG["__"] = 3] = "__";
    BIGTAG[BIGTAG["normal_property"] = 4] = "normal_property";
    BIGTAG[BIGTAG["normal_method"] = 5] = "normal_method";
    BIGTAG[BIGTAG["_"] = 6] = "_";
})(BIGTAG || (BIGTAG = {}));
class ClassCodeBlock extends base_1.CodeBlockBase {
    parts = {
        [BIGTAG.static_field]: [],
        [BIGTAG.static_property]: [],
        [BIGTAG.static_method]: [],
        [BIGTAG.__]: [],
        [BIGTAG.normal_property]: [],
        [BIGTAG.normal_method]: [],
        [BIGTAG._]: []
    };
    constructor(source_code, code_type, line_number, block_type_info) {
        super(source_code, code_type, line_number, block_type_info);
        this.sort();
    }
    sort() {
        throw new Error('Method not implemented.');
    }
    to_sorted_source_code() {
        throw new Error('Method not implemented.');
    }
    get weight() {
        throw new Error('Method not implemented.');
    }
    get tags() {
        throw new Error('Method not implemented.');
    }
    split() {
        let lines = this.source_code.replace("\r\n", "\n").split("\n");
    }
}
exports.ClassCodeBlock = ClassCodeBlock;
//# sourceMappingURL=ClassCodeBlock.js.map