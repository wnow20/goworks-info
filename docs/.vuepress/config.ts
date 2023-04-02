import { defaultTheme, defineUserConfig } from 'vuepress'

export default defineUserConfig({
  lang: 'zh-CN',
  title: 'Goworks',
  // pagePatterns: ['**/*.md', '!**/README.md', '!.vuepress', '!node_modules'],
  description: '这是我的第一个 VuePress 站点',
  markdown: {
    anchor: {
      level: [1,2,3],
    },
  },
  head: [
    ['script', { src: "//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7669648936627336", crossorigin: "anonymous" }],
  ],
  theme: defaultTheme({
    navbar: [
      {
        text: '首页',
        link: '/',
      },
      {
        text: '博客',
        link: '/blog'
      },
    ]
  })
})
