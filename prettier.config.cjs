/** @type {import('prettier').Config} */
module.exports = {
    // JavaScript、TypeScript 等文件统一使用单引号。
    singleQuote: true,

    // 语句末尾不添加分号。
    semi: false,

    // 尽量将每行控制在 120 个字符以内。
    printWidth: 120,

    // 多行对象、数组、导入等位置保留尾随逗号。
    trailingComma: 'all',

    // 每一级缩进使用 4 个空格。
    tabWidth: 4,
}
