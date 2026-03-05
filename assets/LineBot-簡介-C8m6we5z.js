const n=`---
title: LineBot-簡介
date: October 29, 2025
category: 系統知識
tags:
  - LineBot
  - LIFF
  - Messaging API
excerpt: 介紹 LINE 開發的兩大核心框架 LIFF 與 Messaging API，包含概念說明與實作教學
---

# Line APP 應用

## 🧩 一、LIFF（LINE Front-end Framework）

### 💡 概念

LIFF 是一個可以**在 LINE App 內開啟的網頁應用程式框架**。

它讓你可以把 Web App（前端應用）嵌入到 LINE 聊天介面中，並且與使用者的 LINE 帳號進行互動。

### 🚀 主要用途

- 建立互動式的功能，例如：
    - 訂餐、報名、購物、預約、問卷等頁面
    - 搭配按鈕讓使用者在聊天室中直接開啟 LIFF 頁面
- 讓使用者不需離開 LINE App 就能操作完整流程
- 可讀取使用者基本資料（需授權）
- 可將結果（例如選擇的地點或時間）回傳給 LINE Bot

---

### ⚙️ 主要功能

| 功能 | 說明 |
| --- | --- |
| **取得使用者資訊** | 可透過 \`liff.getProfile()\` 取得 LINE 使用者名稱、userId、頭像等（需授權）。 |
| **分享訊息到聊天室** | 透過 \`liff.shareTargetPicker()\`，讓使用者選擇好友或群組來分享內容。 |
| **回傳訊息給 Bot** | 可使用 \`liff.sendMessages()\` 傳訊息給當前聊天的 Bot。 |
| **登入 / 登出** | LIFF 有內建登入機制（OAuth2），可與後端綁定自己的會員系統。 |
| **開啟其他應用或連結** | 透過 \`liff.openWindow()\` 開啟外部網站或其他 LIFF 應用。 |

---

### 🧱 使用架構範例

\`\`\`
使用者 → 點擊 Bot 的按鈕 → 開啟 LIFF 網頁 → 使用者填資料 → LIFF 回傳資料給 Bot

\`\`\`

👉 範例應用：

「我要預約打球」 → Bot 傳一個按鈕 → 點擊開啟 LIFF → 使用者選時間地點 → LIFF 傳結果回 Bot

---

## 💬 二、Messaging API（訊息 API）

### 💡 概念

Messaging API 是用來**建立 LINE 官方帳號（Bot）與使用者互動的後端 API**。

你可以讓 Bot：

- 接收訊息事件（使用者發訊息、按鈕、加入群組等）
- 回覆、推播或廣播訊息
- 與外部系統（資料庫、後端服務）整合

---

### ⚙️ 主要功能

| 功能 | 說明 |
| --- | --- |
| **Webhook 接收事件** | 當使用者對 Bot 發訊息或觸發互動時，LINE 會以 POST 請求通知你的伺服器。 |
| **回覆訊息（Reply Message）** | 回應使用者剛才的訊息。 |
| **推播訊息（Push Message）** | 主動發送訊息給特定使用者（例如通知、提醒）。 |
| **多媒體訊息** | 支援文字、圖片、影片、位置、貼圖、Carousel 等格式。 |
| **Rich Menu / Flex Message** | 可建立自訂互動選單或高度客製化的訊息版面。 |
| **整合 LIFF** | 你可以從 LIFF App 將資料回傳給 Bot，再由 Bot 使用 Messaging API 傳送對應訊息。 |

---

### 🔄 基本架構

\`\`\`
使用者 → 傳訊息給 LINE Bot
        ↓
LINE 平台 → 發送 Webhook 給你的後端
        ↓
你的後端 → 呼叫 Messaging API → 回覆或推播訊息

\`\`\`

---

### 📦 範例用途

| 類型 | 功能範例 |
| --- | --- |
| 通知類 | 預約成功通知、提醒訊息 |
| 互動類 | 回覆使用者選項、顯示查詢結果 |
| 整合系統 | 串接 CRM、訂單、會員系統 |
| 結合 LIFF | 點擊「填寫表單」→ LIFF → 回傳 → Bot 推播結果給使用者 |

---

## 🧠 簡單對比

| 比較項目 | **LIFF** | **Messaging API** |
| --- | --- | --- |
| 主要用途 | 建立前端互動頁面 | 處理訊息與後端邏輯 |
| 運行位置 | LINE App 內嵌 Web | 伺服器端（Webhook） |
| 互動方式 | 使用者主動開啟 | 使用者傳訊息或事件觸發 |
| 可取得資訊 | 使用者 Profile、Token | User ID、事件內容 |
| 常見應用 | 表單、查詢、預約頁面 | 自動回覆、推播、分析 |

---

## 三、實作

### 👉 先建立Line官方帳號

![image.png](./images/image.png)

![image.png](./images/image%201.png)

![image.png](./images/image%202.png)

![image.png](./images/image%203.png)

### 設定Ngrok

> 🧠 這邊在local開發所以使用ngrok來讓他進行 tunnel的轉發，免費帳號可以轉發一個port

建立好後會向下圖

![image.png](./images/image%204.png)

### 👉 設定自動回應訊息

![image.png](./images/image%205.png)

### 👉 開啟聊天選項跟Webhook

![image.png](./images/image%206.png)

![image.png](./images/image%207.png)

![image.png](./images/image%208.png)

![image.png](./images/image%209.png)

![image.png](./images/image%2010.png)

### 👉 設定Webhook要打的url

![image.png](./images/image%2011.png)

### 👉 接著建立後端程式，要有相對應的uri 喔!

![image.png](./images/image%2012.png)

### 👉 接著可以打開Line Develops Console

![image.png](./images/image%2013.png)

### 👉 會看到剛剛新增的MessageAPI已經在裡面了

![image.png](./images/image%2014.png)

### 👉 再來要在後端設定 Secret跟Token，讓webhook可以驗證

![image.png](./images/image%2015.png)

![image.png](./images/image%2016.png)

![image.png](./images/image%2017.png)

---

## 新增LIFF APP功能

### 👉 點選new channel會看到有很多選項(選擇Line Login)

![image.png](./images/image%2018.png)

### 👉 開始填寫基本資訊

![image.png](./images/image%2019.png)

### 👉 成功後，點選LIFF進行設定

![image.png](./images/image%2020.png)

### 👉 新增LIFF

![image.png](./images/image%2021.png)

### 👉 輸入Endpoint 是Ngrok的URL

![image.png](./images/image%2022.png)

### 👉 設定玩後就會出現LIFF URL囉!!

![image.png](./images/image%2023.png)

### 👉 再來測試一下開啟剛剛設定的網頁呢? (利用圖文選單)

![image.png](./images/image%2024.png)

![image.png](./images/image%2025.png)

### 👉 設定完會如下圖

![image.png](./images/image%2026.png)

### 👉 都設定完成後，要回到Line Developers去把他publish出來

![image.png](./images/image%2027.png)

![image.png](./images/image%2028.png)

### 👉 就可以看到頁面囉

![image.png](./images/image%2029.png)

![image.png](./images/image%2030.png)

![image.png](./images/image%2031.png)

![image.png](./images/image%2032.png)
`;export{n as default};
