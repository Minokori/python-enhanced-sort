"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PARSEMODE = exports.variable = exports.special_variable = void 0;
/** 获取双下划线声明语句的正则式 */
const special_variable = /^(__[^(]*__[\s]*=)/;
exports.special_variable = special_variable;
/** 获取普通声明语句的正则式 */
const variable = /^([^(]*[\s]*=)/;
exports.variable = variable;
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
//# sourceMappingURL=consts.js.map