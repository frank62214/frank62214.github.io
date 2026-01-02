const n=`---
title: 範例文章：開始使用 Vue 3 與 TypeScript
date: 2025-01-01
category: 前端開發
tags:
  - Vue
  - TypeScript
  - 前端
excerpt: 這是一篇範例文章，介紹如何使用 Vue 3 搭配 TypeScript 進行開發，包含專案建置、組件設計等實用技巧。
---

# 開始使用 Vue 3 與 TypeScript

這是一篇範例文章，用於展示文章的格式與結構。

## 為什麼選擇 Vue 3 + TypeScript？

Vue 3 帶來了許多改進：
- Composition API
- 更好的 TypeScript 支援
- 更小的打包體積
- 更快的執行效能

## 建立專案

使用 Vite 建立 Vue 3 + TypeScript 專案：

\`\`\`bash
npm create vite@latest my-vue-app -- --template vue-ts
cd my-vue-app
npm install
npm run dev
\`\`\`

## 組件範例

\`\`\`vue
<template>
  <div class="counter">
    <h1>{{ count }}</h1>
    <button @click="increment">增加</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)

const increment = () => {
  count.value++
}
<\/script>
\`\`\`

## 總結

Vue 3 搭配 TypeScript 提供了更好的開發體驗與程式碼品質。

---

*這是一篇範例文章，你可以刪除或修改這個檔案。*
`;export{n as default};
