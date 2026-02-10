const e=`---
title: Kubernetes-ServiceMesh
date: September 17, 2025
category: 系統知識
tags:
  - Kubernetes
excerpt: 介紹Service Mesh的概念、核心組件與主流實作方案
---
# Kubernetes-ServiceMesh

類型: 系統知識
狀態: 完成
人員: 蘇柏文
完成日期: September 17, 2025

### 什麼是 Service Mesh？

Service Mesh，中文常譯為「服務網格」，你可以把它想像成一個獨立的、專門負責處理服務間通訊的**基礎設施層**。

在傳統的微服務架構中，開發者需要在每個服務的程式碼裡，手動處理各種網路通訊邏輯，例如：

- 服務發現（找到其他服務在哪裡）
- 負載平衡
- 容錯處理（例如重試、超時）
- 認證和授權

這樣一來，開發者不僅要專注於業務邏輯，還要花時間寫這些重複且複雜的網路程式碼。

而 Service Mesh 則將這些通訊功能從應用程式中抽離出來，集中到一個統一的層次來管理。這樣的好處是：

- **開發者能更專注於業務邏輯**，不需要處理複雜的網路問題。
- **統一的通訊管理**，所有服務的行為都有一致的規則。
- **提升系統的可觀察性**，能清楚地看到服務間的流量、延遲、錯誤率等資訊。

### Service Mesh 的核心組件

Service Mesh 主要由兩大部分組成：

1. **資料平面 (Data Plane)**
資料平面是由一系列的「代理」(Proxy) 組成，這些代理通常被稱為 **sidecar**。每個 Pod 都會附帶一個 sidecar 容器，所有的進出流量都會先經過這個 sidecar 代理。
    - **主要功能**：負責處理實際的流量，例如路由、負載平衡、加密等。
    - **代表**：**Envoy** 是目前最常見的資料平面代理。
2. **控制平面 (Control Plane)**
控制平面是 Service Mesh 的「大腦」，負責管理與協調所有的 sidecar 代理。它提供一個集中的介面，讓你可以設定各種通訊規則。
    - **主要功能**：接收你的設定指令（例如哪些服務可以互相通訊），並將這些規則分發給所有的 sidecar 代理。
    - **代表**：**Istio** 和 **Linkerd** 都是知名的控制平面實作。

### Service Mesh 能解決什麼問題？

- **流量管理**：你可以輕鬆地控制服務間的流量，例如實現**金絲雀部署 (Canary Deployment)** 或**A/B 測試**，將一小部分流量導向新版本，驗證沒問題後再逐步擴大。
- **安全性**：自動化的服務間通訊加密（**mTLS**，mutual TLS），確保所有流量都是安全的，而不需要修改應用程式。
- **可觀察性**：提供豐富的監控指標、日誌和追蹤資訊，讓你清楚了解服務間的呼叫關係、延遲、錯誤等。

### **Ingress Controller 跟 Service Mesh 的差別**

- **Ingress Controller**（像 Nginx Ingress、HAProxy、Traefik、Istio Gateway）：
    - 主要處理 **外部 → 叢集** 的入口流量。
    - 功能：路由、SSL/TLS、LB。
    - **不是 Service Mesh**，因為它只處理「入口」流量，不處理「服務與服務之間」的東西。
- **Service Mesh**：
    - 處理 **服務 ↔ 服務** 的東西。
    - 提供完整的流量治理、安全與可觀測性。
    - 可以搭配 Ingress Controller（例如 Istio 有 Gateway，取代 Ingress Controller）。

### 主流 Service Mesh 有：

- **Istio**（最常見、功能完整，基於 Envoy）
- **Linkerd**（輕量化、專注穩定性，sidecar 用 Rust/Tokio 開發）
- **Consul Connect**（HashiCorp 出品，和 Consul KV/Service Discovery 整合）
- **Kuma**（Kong 公司開發，支援多集群、多雲）
- **AWS App Mesh**（AWS 版本，基於 Envoy）
- **Open Service Mesh (OSM)**（CNCF，輕量，基於 Envoy）

---

[架构](https://istio.io/latest/zh/docs/ops/deployment/architecture/)`;export{e as default};
