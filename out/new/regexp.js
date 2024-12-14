"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.method_name = exports.ignore_command = exports.variable = exports.special_variable = void 0;
/** 获取双下划线声明语句的正则式 */
const special_variable = /^__([^(]*)__[\s]*=/;
exports.special_variable = special_variable;
/** 获取普通声明语句的正则式 */
const variable = /^([^(]*[\s]*=)/;
exports.variable = variable;
/** 获取预指令的正则式 */
const ignore_command = /isort:[\s]*(skip|ignore)/;
exports.ignore_command = ignore_command;
const method_name = /def (_+)?([\S]*?)(_+)?[(][\s\S]*/;
exports.method_name = method_name;
//# sourceMappingURL=regexp.js.map