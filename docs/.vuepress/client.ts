// 客户端代码
import { defineClientConfig } from '@vuepress/client'
import Layout from './layouts/Layout.vue';

export default defineClientConfig({
  enhance({ app, router, siteData }) {},
  setup() {

  },
  rootComponents: [],
  layouts: {
    Layout,
  },
})
