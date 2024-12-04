import { Plugin } from 'vite'

const scriptVersion = (build: boolean = false): Plugin => ({
  name: 'script-version',
  transformIndexHtml(html) {
    if (!build) return html
    const version = new Date().getTime()
    const regex = /<script\s+src="\/setting\.js"([^>]*)>/g

    // 参数1：匹配到的字符串
    // 参数2：匹配到的字符串中第一个括号的内容
    return html.replace(regex, (_, attrs) => `<script ${attrs} src="./settings.js?v=${version}">`)
  },
})

export default scriptVersion
