"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PARSEMODE = void 0;
/** 源代码行枚举类型 */
var PARSEMODE;
(function (PARSEMODE) {
    PARSEMODE["IMPORT"] = "import statement";
    PARSEMODE["SPECIAL"] = "special statement";
    PARSEMODE["CLASS"] = "class statement";
    PARSEMODE["METHOD"] = "method statement";
    PARSEMODE["VARIABLE"] = "variable statement";
    PARSEMODE["COMMENT"] = "comment";
    PARSEMODE["OTHER"] = "other statement";
    PARSEMODE["WHITELINE"] = "white line";
    PARSEMODE["INNER"] = "inner statement";
})(PARSEMODE || (exports.PARSEMODE = PARSEMODE = {}));
//# sourceMappingURL=enum.js.map