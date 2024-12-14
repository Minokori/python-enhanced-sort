/** 获取双下划线声明语句的正则式 */
const special_variable = /^(__[^(]*__[\s]*=)/;
/** 获取普通声明语句的正则式 */
const variable = /^([^(]*[\s]*=)/;
/** 获取预指令的正则式 */
const ignore_command = /isort:[\s]*(skip|ignore)/;
export { special_variable, variable, ignore_command };