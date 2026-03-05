const n=`請你幫我設計Vue底下能用的雙拉桿拖曳區間

下面給你一個 Vue（可用在 Vue 3 / Vite）的「雙拉桿拖曳區間（Range Slider）」元件設計」
👉 不用套件、可直接用、支援最小/最大值限制、即時顯示區間

功能目標

兩個滑桿（min / max）

不能交叉（min ≤ max）

視覺上是一條區間 bar

可用 v-model 綁定

使用方式（先看）
<RangeSlider
  v-model:min="minValue"
  v-model:max="maxValue"
  :min="0"
  :max="100"
  :step="1"
/>

<p>選擇區間：{{ minValue }} ~ {{ maxValue }}</p>

RangeSlider.vue（完整可用）
template
<template>
  <div class="range-wrapper">
    <div class="range-track"></div>

    <!-- 選取區間 -->
    <div
      class="range-selected"
      :style="selectedStyle"
    ></div>

    <!-- 左拉桿 -->
    <input
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :value="modelMin"
      @input="onMinInput"
      class="thumb thumb-left"
    />

    <!-- 右拉桿 -->
    <input
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :value="modelMax"
      @input="onMaxInput"
      class="thumb thumb-right"
    />
  </div>
</template>

script（Vue 3 setup）
<script setup>
import { computed } from 'vue'

const props = defineProps({
  min: { type: Number, required: true },
  max: { type: Number, required: true },
  step: { type: Number, default: 1 },
  modelMin: { type: Number, required: true },
  modelMax: { type: Number, required: true }
})

const emit = defineEmits(['update:modelMin', 'update:modelMax'])

const onMinInput = (e) => {
  const value = Math.min(Number(e.target.value), props.modelMax)
  emit('update:modelMin', value)
}

const onMaxInput = (e) => {
  const value = Math.max(Number(e.target.value), props.modelMin)
  emit('update:modelMax', value)
}

const selectedStyle = computed(() => {
  const left = ((props.modelMin - props.min) / (props.max - props.min)) * 100
  const right = ((props.modelMax - props.min) / (props.max - props.min)) * 100

  return {
    left: \`\${left}%\`,
    width: \`\${right - left}%\`
  }
})
<\/script>

style（重點在雙拉桿疊加）
<style scoped>
.range-wrapper {
  position: relative;
  width: 300px;
  height: 30px;
}

.range-track {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  height: 6px;
  width: 100%;
  background: #ddd;
  border-radius: 3px;
}

.range-selected {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  height: 6px;
  background: #3b82f6;
  border-radius: 3px;
}

.thumb {
  position: absolute;
  width: 100%;
  height: 30px;
  background: none;
  pointer-events: none;
  -webkit-appearance: none;
}

.thumb::-webkit-slider-thumb {
  pointer-events: auto;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #3b82f6;
  border: none;
  cursor: pointer;
  -webkit-appearance: none;
}

.thumb-left {
  z-index: 2;
}

.thumb-right {
  z-index: 3;
}
</style>

父元件使用範例
<script setup>
import { ref } from 'vue'
import RangeSlider from './RangeSlider.vue'

const minValue = ref(20)
const maxValue = ref(80)
<\/script>

延伸功能（你可以再加）

我可以幫你直接加上 👇

✅ 顯示 tooltip（拖曳時顯示數值）

✅ 支援時間區間（09:00 ~ 22:00）

✅ 支援 Tailwind / Element Plus 樣式

✅ 支援拖曳整段區間（像價格範圍）

如果你要用在 訂場時間、價格篩選、報表查詢
👉 跟我說「用在什麼情境」，我幫你客製一版更適合的 💡

我目前使用在羽球分級，1~18，階層為1~3新手階、4~5初階、6~7初中階、8~9中階、10~12中進階、13~15高階、16~18職業級，也幫我標刻度上去

好，這個情境很清楚 👍
你的是 「離散等級（1–18）＋語意分級」，所以重點有兩個：

滑桿還是 1～18 的數值

底下要有「分級刻度＋文字標示」

下面我幫你在「不破壞你原本雙拉桿邏輯」的前提下，加上 羽球分級刻度列。

一、分級定義（先給你一個可維護的結構）
const levels = [
  { label: '新手階', from: 1, to: 3 },
  { label: '初階', from: 4, to: 5 },
  { label: '初中階', from: 6, to: 7 },
  { label: '中階', from: 8, to: 9 },
  { label: '中進階', from: 10, to: 12 },
  { label: '高階', from: 13, to: 15 },
  { label: '職業級', from: 16, to: 18 }
]


👉 之後如果等級要調，只改這裡

二、RangeSlider.vue（加上刻度列）
template（新增刻度區）
<template>
  <div class="range-container">
    <!-- 原本的 slider -->
    <div class="range-wrapper">
      <div class="range-track"></div>

      <div class="range-selected" :style="selectedStyle"></div>

      <input
        type="range"
        :min="min"
        :max="max"
        :step="1"
        :value="modelMin"
        @input="onMinInput"
        class="thumb thumb-left"
      />

      <input
        type="range"
        :min="min"
        :max="max"
        :step="1"
        :value="modelMax"
        @input="onMaxInput"
        class="thumb thumb-right"
      />
    </div>

    <!-- 🔽 分級刻度 -->
    <div class="level-scale">
      <div
        v-for="level in levels"
        :key="level.label"
        class="level-item"
        :style="levelStyle(level)"
      >
        <span class="level-text">{{ level.label }}</span>
        <span class="level-range">{{ level.from }}–{{ level.to }}</span>
      </div>
    </div>
  </div>
</template>

script（計算每個分級寬度）
<script setup>
import { computed } from 'vue'

const props = defineProps({
  min: { type: Number, default: 1 },
  max: { type: Number, default: 18 },
  modelMin: { type: Number, required: true },
  modelMax: { type: Number, required: true }
})

const emit = defineEmits(['update:modelMin', 'update:modelMax'])

const levels = [
  { label: '新手階', from: 1, to: 3 },
  { label: '初階', from: 4, to: 5 },
  { label: '初中階', from: 6, to: 7 },
  { label: '中階', from: 8, to: 9 },
  { label: '中進階', from: 10, to: 12 },
  { label: '高階', from: 13, to: 15 },
  { label: '職業級', from: 16, to: 18 }
]

const onMinInput = (e) => {
  emit('update:modelMin', Math.min(+e.target.value, props.modelMax))
}

const onMaxInput = (e) => {
  emit('update:modelMax', Math.max(+e.target.value, props.modelMin))
}

const selectedStyle = computed(() => {
  const left = ((props.modelMin - props.min) / (props.max - props.min)) * 100
  const right = ((props.modelMax - props.min) / (props.max - props.min)) * 100

  return {
    left: \`\${left}%\`,
    width: \`\${right - left}%\`
  }
})

const levelStyle = (level) => {
  const width =
    ((level.to - level.from + 1) / (props.max - props.min + 1)) * 100

  return { width: \`\${width}%\` }
}
<\/script>

style（刻度視覺）
<style scoped>
.range-container {
  width: 420px;
}

.range-wrapper {
  position: relative;
  height: 30px;
}

.range-track {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  height: 6px;
  width: 100%;
  background: #e5e7eb;
  border-radius: 3px;
}

.range-selected {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  height: 6px;
  background: #3b82f6;
  border-radius: 3px;
}

.thumb {
  position: absolute;
  width: 100%;
  height: 30px;
  pointer-events: none;
  background: none;
  -webkit-appearance: none;
}

.thumb::-webkit-slider-thumb {
  pointer-events: auto;
  width: 16px;
  height: 16px;
  background: #2563eb;
  border-radius: 50%;
  cursor: pointer;
  -webkit-appearance: none;
}

/* 分級刻度 */
.level-scale {
  display: flex;
  margin-top: 8px;
  font-size: 12px;
  color: #374151;
}

.level-item {
  text-align: center;
  border-left: 1px solid #d1d5db;
}

.level-item:first-child {
  border-left: none;
}

.level-text {
  display: block;
  font-weight: 600;
}

.level-range {
  display: block;
  font-size: 10px;
  color: #6b7280;
}
</style>

三、實際效果（語意上非常清楚）
| 新手階 | 初階 | 初中階 | 中階 | 中進階 | 高階 | 職業級 |
| 1–3   | 4–5 | 6–7   | 8–9 | 10–12 |13–15|16–18 |


拖曳時：
👉 使用者「不是在拉數字，而是在拉等級區間」
👉 非常適合 羽球分級 / 訂場 / 配對 / 報名篩選

四、我可以再幫你進階的方向（很適合你這個專案）

✅ 滑桿上方顯示目前分級名稱

例如：中階 ～ 高階

✅ 限制只能整段分級移動（不能停在 9.5 這種）

✅ 後端直接收到：minLevel=8, maxLevel=15

✅ 手機版手指更好拉（放大 thumb）

如果你要，我可以幫你做一版
👉「完全以分級為單位，而不是數字」的 UX 設計

給我使用方式

好，下面我直接給你 「你現在這個羽球分級雙拉桿」的實際使用方式
👉 照貼就能用、不需要再改元件內部

一、父元件怎麼用（最重要）
1️⃣ 引入元件
<script setup>
import { ref } from 'vue'
import RangeSlider from '@/components/RangeSlider.vue'

const minLevel = ref(6)   // 初中階
const maxLevel = ref(15)  // 高階
<\/script>

2️⃣ Template 使用
<template>
  <RangeSlider
    v-model:modelMin="minLevel"
    v-model:modelMax="maxLevel"
    :min="1"
    :max="18"
  />

  <div class="mt-2">
    <strong>目前選擇：</strong>
    {{ minLevel }} ～ {{ maxLevel }}
    （{{ levelText(minLevel) }} ～ {{ levelText(maxLevel) }}）
  </div>
</template>

二、顯示「分級名稱」的小工具（父元件）
const levelText = (level) => {
  if (level <= 3) return '新手階'
  if (level <= 5) return '初階'
  if (level <= 7) return '初中階'
  if (level <= 9) return '中階'
  if (level <= 12) return '中進階'
  if (level <= 15) return '高階'
  return '職業級'
}


👉 這個方法你之後 後端、前端、報表都能共用邏輯

三、實際資料流（很重要，幫你整理）
使用者操作
拖拉：中階 ～ 高階

Vue state
minLevel = 8
maxLevel = 15

API Query（建議）
GET /courts?minLevel=8&maxLevel=15


或 body

{
  "minLevel": 8,
  "maxLevel": 15
}

四、常見你一定會遇到的情境
✅ 預設「全開放」
const minLevel = ref(1)
const maxLevel = ref(18)

✅ 限制只能選「同一階層」

（例如比賽只限初中階）

minLevel.value = 6
maxLevel.value = 7

✅ 後端驗證（建議一定要做）
if (minLevel < 1 || maxLevel > 18 || minLevel > maxLevel) {
    throw new IllegalArgumentException("羽球等級區間不合法");
}

五、你這個設計為什麼是「對的」

✔ 使用者 看得懂（分級）
✔ 系統 好存（數字）
✔ API 好查（區間）
✔ UI 可擴充（以後加男女 / 年齡）

六、如果你下一步要的是這些，我可以直接幫你補齊

🔥 滑桿上方顯示「中階 ～ 高階」浮動標籤

📱 手機版加大拉桿

🎯 只能整段分級拖曳（直接跳 1→3→5）

🧩 整個元件改成 v-model="levelRange"

你只要回我一句：
👉「我要第 X 個」，我直接幫你補完整實作`;export{n as default};
