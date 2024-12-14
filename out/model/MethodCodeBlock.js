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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MethodCodeBlock = void 0;
const base_1 = require("./base");
const vscode = __importStar(require("vscode"));
const getMethodNameRegExp = /def (_+)?([\S]*?)(_+)?[(][\s\S]*[)][\s\S]*:/;
const EOL = vscode.workspace.getConfiguration("files").get("eol");
var METHOD_TYPE;
(function (METHOD_TYPE) {
    METHOD_TYPE[METHOD_TYPE["NORMAL"] = 0] = "NORMAL";
    METHOD_TYPE[METHOD_TYPE["HIDDEN"] = 1] = "HIDDEN";
    METHOD_TYPE[METHOD_TYPE["SPECIAL"] = 2] = "SPECIAL";
})(METHOD_TYPE || (METHOD_TYPE = {}));
class MethodCodeBlock extends base_1.CodeBlockBase {
    _type = METHOD_TYPE.NORMAL;
    _fullname = "";
    _tags = this._init_tags();
    sort() {
        console.log("不需要对函数块内部排序");
    }
    to_sorted_source_code() {
        return this.source_code;
    }
    get weight() {
        return 0;
    }
    get tags() {
        return this._tags;
    }
    get fullname() {
        return this._fullname;
    }
    _init_tags() {
        let tags = [];
        let type = METHOD_TYPE.NORMAL;
        let lines = this.source_code.split(EOL);
        for (let line of lines) {
            let reg_result = line.match(getMethodNameRegExp);
            if (reg_result) {
                //普通函数
                if (reg_result[1] === undefined) { }
                //单下划线函数
                else if (reg_result[1] === "_") {
                    type = METHOD_TYPE.HIDDEN;
                    tags.push("_");
                }
                //特殊函数
                else if (reg_result[1] === reg_result[3] && reg_result[1] === "__") {
                    tags.push("__");
                    type = METHOD_TYPE.SPECIAL;
                }
                tags = [...tags, ...(reg_result[2].split("_"))];
                this._type = type;
                this._fullname = line;
                break;
            }
            else {
                continue;
            }
        }
        return tags;
    }
}
exports.MethodCodeBlock = MethodCodeBlock;
//# sourceMappingURL=MethodCodeBlock.js.map