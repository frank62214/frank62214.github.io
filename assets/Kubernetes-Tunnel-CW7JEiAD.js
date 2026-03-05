const n=`---
title: Kubernetes-Tunnel
date: February 3, 2026
category: 系統知識
tags:
  - Kubernetes
  - Tunnel
  - Cloudflare
  - 零信任
excerpt: 介紹 Cloudflare Tunnel 的概念，如何透過反向通道安全地公開內網服務，取代傳統開 Port 的方式
---

# Tunnel 是什麼？

**Tunnel = 讓「內網服務」主動打洞連到外網**

不用開 Port、不用公網 IP、不用 NAT 設定。

👉 傳統做法：

外面的人 → 打你家 IP:Port → 防火牆 → 內網服務

（超多攻擊都從這裡來）

👉 Tunnel 做法：

你的伺服器 **自己向 Cloudflare 建立一條長連線**

外部流量先到 Cloudflare → 透過這條連線「倒流」回你的機器

**你不再暴露任何入口在網路上。**

---

## 🧠 一句話理解

> Tunnel = 反向的安全通道，由內往外建立，外界無法直接打你主機

---

## 🔧 Cloudflare Tunnel 架構

\`\`\`
使用者瀏覽器
      ↓
Cloudflare Edge (DNS / WAF / SSL / 防火牆)
      ↓
Cloudflare Tunnel
      ↓
cloudflared (跑在你機器上的Agent)
      ↓
你的內網服務 (localhost / K8s / RDP / DB)

\`\`\`

你主機上只需要跑一個東西：

> cloudflared

它會：

- 主動連到 Cloudflare
- 建立加密通道
- 接收 Cloudflare 轉發的流量

---

## 🔐 為什麼比開 Port 安全很多？

| 傳統開 Port | Tunnel |
| --- | --- |
| IP 暴露 | IP 隱藏 |
| 會被掃 port | 外界根本打不到你主機 |
| 要管防火牆 | 不需要對外開任何 port |
| 容易被 DDoS | Cloudflare 幫你扛 |
| SSL 自己搞 | Cloudflare 自動搞 |

你的機器變成：

> 🔒 只會「對外連線」，不接受外部連線

---

## 🧩 可以拿來幹嘛？

| 用途 | 說明 |
| --- | --- |
| 🌐 內網網站公開 | localhost:8080 變 https://xxx.com |
| 🔐 公司內部系統 | 只給登入者透過 Cloudflare Access 進 |
| 💻 遠端桌面 RDP | 用瀏覽器連你電腦 |
| 🐳 K8s 叢集 | 不用 LoadBalancer / 公網 IP |
| 📦 家裡 NAS | 不開 port 就能外網存取 |
| 🤖 API Server | 內網 API 安全公開 |

---

## ⚙️ 跟 VPN 差在哪？

| Tunnel | VPN |
| --- | --- |
| 只打通「服務」 | 打通整個網段 |
| 零信任架構 | 傳統內網思維 |
| 不用裝客戶端（瀏覽器就行） | 使用者要裝 VPN |
| 細粒度控管（哪個帳號能進哪個服務） | 通常進 VPN 就全開 |

Cloudflare 的玩法是：

> Zero Trust Access + Tunnel = 現代企業內網

---

## 🔁 連線方向是重點

很多人卡在這：

> ❌ 不是 Cloudflare 連你
>
> ✅ 是你主機主動連 Cloudflare

所以你公司防火牆只要允許：

\`\`\`
內部 → 外部 HTTPS (443)

\`\`\`

就能用了。

---

## 🧠 Tunnel 的本質其實是

技術上就是：

- Reverse Proxy
- 長連線 WebSocket
- mTLS 驗證
- Edge 轉發

只是 Cloudflare 把這些打包變成 SaaS。
`;export{n as default};
