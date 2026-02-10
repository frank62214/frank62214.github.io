const n=`---
title: Kubernetes-Ingress
date: September 3, 2025
category: 系統知識
tags:
  - Kubernetes
excerpt: 介紹Kubernetes Ingress Controller的概念、運作流程與使用方式
---
# Kubernetes-Ingress

類型: 系統知識
狀態: 完成
人員: 蘇柏文
完成日期: September 3, 2025

# 一、什麼是 Ingress Controller？

Kubernetes (K8s) 裡面，**Ingress Controller** 是一種特殊的控制器，用來處理 **Ingress 資源**，並且管理外部流量如何進入叢集（Cluster）內部的 Service。

- **Ingress** 是一個 API 物件，用來定義：
    - 要把 **哪個 domain/路徑** 的流量導到 **哪個 Service**
    - 是否使用 **TLS (HTTPS)**
    - 是否需要 **Rewrite、Load Balancing、Header 操作** 等規則
- **Ingress Controller** 則是負責「實作」這些規則的元件。
    
    常見的有：
    
    - **NGINX Ingress Controller**（最常見）
    - **HAProxy Ingress Controller**
    - **Traefik**
    - **Contour**
    - **AWS ALB Ingress Controller**（雲端專用）

換句話說：

- **Ingress 是規格**（規則宣告）
- **Ingress Controller 是實作**（負責實際把流量導進來）

## 二、運作流程

1. **外部流量進入**
    - 使用者從外網訪問一個域名，例如 \`https://api.example.com\`
    - DNS 會指向 LoadBalancer / NodePort / External IP
2. **Ingress Controller 接收流量**
    - Ingress Controller（例如 NGINX Pod）會跑在 K8s 裡，負責攔截外部流量
3. **比對 Ingress 規則**
    - 例如 Ingress 規則定義：
        
        \`\`\`yaml
        rules:
        - host: api.example.com
          http:
            paths:
            - path: /v1
              pathType: Prefix
              backend:
                service:
                  name: my-service
                  port:
                    number: 8080
        
        \`\`\`
        
    - 代表當使用者訪問 \`api.example.com/v1/...\` 時，要導向 \`my-service:8080\`
4. **轉發到內部 Service / Pod**
    - Ingress Controller 依照規則，把流量導到正確的 Service → Pod
        
        ![3dc4d041-def1-4ac2-aca4-89e7d690e0cd.png](./images/ingress-flow.png)
        

## 三、優點

- 提供 **單一入口 (Single Entry Point)**
- 支援 **反向代理、TLS、路由規則**
- 減少 **每個 Service 都要開 LoadBalancer** 的需求 → 節省成本
- 容易與 **CI/CD、自動化** 整合

---

## 四、跟 Service 的比較

| 類型 | 用途 | 暴露方式 |
| --- | --- | --- |
| ClusterIP | 預設，僅 Cluster 內部可訪問 | 內部 |
| NodePort | 在每個節點開一個固定 Port 對外 | 基本對外 |
| LoadBalancer | 建立雲端 LB，對外暴露 Service | 雲端對外 |
| Ingress | 基於 HTTP/HTTPS 規則，由 Ingress Controller 處理 | 進階對外 |

---

✅ 總結：

- **Ingress Controller 就是負責解讀 Ingress 規則，並把外部流量導到正確的 Service 的控制器**。
- 沒有 Ingress Controller，Ingress 資源就不會生效。

- 常見選擇：**NGINX Ingress Controller**（K8s 社群最常用）。

---

#`;export{n as default};
