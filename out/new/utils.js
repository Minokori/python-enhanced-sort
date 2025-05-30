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
exports.compare_tag = compare_tag;
const vscode = __importStar(require("vscode"));
let keywords = vscode.workspace.getConfiguration("PythonEnhancedSort").get("Weights");
/**
 * 比较两个单词的优先级
 *
 * *若 word1 在保留关键字列表中且在 word2 之前，则返回负数；若 word2 在保留关键字列表中且在 word1 之前，则返回正数；若两个单词都不在保留关键字列表中，则按字母顺序排序*
 * @param word1 要比较的单词
 * @param word2 要比较的单词
 * @returns 比较结果
 */
function compare_tag(word1, word2) {
    let idx1 = keywords.indexOf(word1);
    let idx2 = keywords.indexOf(word2);
    // 如果两个单词都在保留关键字列表中，按保留关键字列表中的顺序排序
    if (idx1 !== -1 && idx2 !== -1) {
        return idx1 - idx2;
    }
    // 如果一个单词在保留关键字列表中，另一个不在，则保留关键字优先
    if (idx1 !== -1) {
        return -1;
    }
    if (idx2 !== -1) {
        return 1;
    }
    // 如果两个单词都不在保留关键字列表中，则按字母顺序排序
    return word1.localeCompare(word2);
}
//# sourceMappingURL=utils.js.map