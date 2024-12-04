/** @type {import("prettier").Config} */
export default {
  // 配置 Prettier 以在多行结构（如对象、数组）的最后一项后面添加逗号
  trailingComma: 'all',
  // 使用单引号而不是双引号来包裹字符串
  singleQuote: true,
  // 不在语句末尾添加分号
  semi: false,
  // 每行代码的最大长度为200个字符
  printWidth: 120,
  // 箭头函数中强制使用圆括号，即使只有一个参数
  arrowParens: 'always',
  // // 在超过printWidth限制的文本块中尝试保持原始的换行方式
  proseWrap: 'always',
  // 使用LF（换行符）作为行结束符
  endOfLine: 'lf',
  // 不启用实验性的三元运算符格式化功能
  experimentalTernaries: false,
  // 每个缩进级别使用2个空格
  tabWidth: 2,
  // 不使用制表符进行缩进，而是使用空格
  useTabs: false,
  // 在对象属性中保持引号的一致性，即如果对象属性中已经有引号，则保持不变
  quoteProps: 'consistent',
  // 在JSX中不使用单引号来包裹属性值
  jsxSingleQuote: false,
  // 在对象字面量的括号内添加空格
  bracketSpacing: true,
  // 不将对象的左大括号放在同一行
  bracketSameLine: false,
  // 不将JSX元素的右大括号放在同一行
  jsxBracketSameLine: false,
  // 不在Vue文件中缩进<script>和<style>标签内的内容
  vueIndentScriptAndStyle: false,
  // 不强制每个HTML属性单独占一行
  singleAttributePerLine: false,
}
