/** 源代码行枚举类型 */
enum PARSEMODE {
    IMPORT = "import statement",
    SPECIAL = "special statement",
    CLASS = "class statement",
    METHOD = "method statement",
    VARIABLE = "variable statement",
    COMMENT = "comment",
    OTHER = "other statement",
    WHITELINE = "white line",
    INNER = "inner statement",
}
export { PARSEMODE as BLOCKTYPE };