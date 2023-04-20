<script setup>
import ParentLayout from '@vuepress/theme-default/layouts/Layout.vue'
</script>

<template>
  <ParentLayout>
    <template #page-bottom>
      <div class="website-footer-wrapper">
        <div class="website-footer">
          <div class="website-footer-flex">
            <div class="website-footer-flex-item">
              <p><a href="/privacy-policy.html" target="_blank">Privacy Policy</a></p>
              <p><a href="/privacy-policy-cn.html" target="_blank">隐私策略</a></p>
            </div>
            <div class="website-footer-flex-item">
              <p><a href="/contact.html" target="_blank">联系我们</a></p>
            </div>
          </div>
          <div style="text-align: center">
            网站备案号：浙ICP备19047246号-2
          </div>
        </div>
      </div>
    </template>
  </ParentLayout>
</template>

<style lang="css">
.page {
  padding-bottom: 0 !important;
}

.website-footer-wrapper {
  background: #eeeeee;
  padding: 2rem;
  font-size: .8em;
  margin-top: 3em;
}

.website-footer a {
  color: var(--c-text);
}

.website-footer a:hover {
  text-decoration: underline;
}

.website-footer {
  margin: 0 auto;
  max-width: 720px;
}

.website-footer-flex {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.website-footer-flex-item {
  margin: 0 5em;
}

@media (max-width: 600px) {
  .website-footer-flex {
    flex-direction: column;
  }

  .website-footer-flex-item {
    margin: 0 1em;
    text-align: center;
  }
}

/* defaults to dark theme */
html.dark .website-footer-wrapper {
  background: var(--c-bg);
}

html.dark .website-footer-wrapper {
  color: var(--c-text);
}
</style>
