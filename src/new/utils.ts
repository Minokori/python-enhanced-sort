import * as vscode from "vscode";
let keywords: string[] = vscode.workspace.getConfiguration("PythonEnhancedSort").get("Weights") as string[];


export function compare_tag(word1: string, word2: string): number {
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
