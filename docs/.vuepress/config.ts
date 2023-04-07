import { defaultTheme, defineUserConfig } from 'vuepress'
import { googleAnalyticsPlugin } from '@vuepress/plugin-google-analytics'

export default defineUserConfig({
  // lang: 'zh-CN',
  title: 'Goworks',
  // pagePatterns: ['**/*.md', '!**/README.md', '!.vuepress', '!node_modules'],
  description: '这是我的第一个 VuePress 站点',
  // markdown: {
  //   anchor: {
  //     level: [1,2,3],
  //   },
  // },
  head: [
    ['script', {
      src: '//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7669648936627336',
      crossorigin: 'anonymous',
    }],
  ],
  plugins: [
    googleAnalyticsPlugin({
      id: 'G-KW086YVFQ7',
    }),
  ],
  theme: defaultTheme({
    docsDir: 'docs',
    sidebar: {
      '/aikit': [
        {
          text: 'AiKit',
          children: [
            '/aikit/README.md',
            '/aikit/release-notes.md',
            '/aikit/pricing.md',
            '/aikit/troubleshooting.md',
            '/aikit/about-aikit.md',
          ],
        }
      ],
      '/blog': [
        {
          text: 'Linux与运维',
          children: [
            '/blog/Linux擦除分区、数据，创建空盘.md',
            '/blog/Spring Boot项目创建Docker镜像.md',
            '/blog/Ubuntu中文输入法.md',
            '/blog/Ubuntu分区.md',
            '/blog/如何使用SSH远程执行命令.md',
            '/blog/永久关闭Ubuntu虚拟内存Swap.md',
            '/blog/docker-container-inspect-file-system.md',
            '/blog/remix-express-deploy-aliyun.md',
          ],
        },
        {
          text: '前端',
          children: [
            '/blog/CORS问题之“Provisional headers are shown”.md',
            '/blog/如何划出一条1像素的线.md',
            '/blog/如何更好的适配Retina屏幕.md',
            '/blog/自定义控制网页渲染帧数.md',
            '/blog/TypeScript学习笔记.md',
            '/blog/dotenv.md',
          ]
        },
        {
          text: 'ChatGPT',
          children: [
            '/blog/chatgpt-awesome.md',
          ]
        },
        {
          text: '日常',
          children: [
            '/blog/华硕B660M-PLUS装机小计.md',
          ]
        }
      ],
    },
    navbar: [
      {
        text: 'React',
        link: '/',
      },
      {
        text: 'Hooks',
        link: '/hooks',
      },
      {
        text: 'AiKit',
        link: '/aikit',
      },
      {
        text: '博客',
        link: '/blog',
      },
    ],
  }),
})
