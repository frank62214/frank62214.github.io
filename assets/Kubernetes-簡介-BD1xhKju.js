const n=`---
title: Kubernetes-簡介
date: July 23, 2025
category: 系統知識
tags:
  - Kubernetes
excerpt: 簡單介紹容器、容器平台
---
# Kubernetes-簡介

類型: 系統知識
狀態: 完成
人員: 蘇柏文
完成日期: July 23, 2025

# Kubernetes是甚麼(AKA. k8s)

容器管理平台，可以實現容器集群自動化部屬、自動化擴展、系統監測等功能。

- 快速部屬應用
- 快速擴展應用資源
- 服務應用不中斷
- 優化硬體資源使用

# Kubernetes特色

- 可移植：支援公有雲、私有雲、混和雲、多重雲。
- 可擴展：模組化、擴充元件化、掛載化、可組合。
- 自動化：自動部屬、監測自動重啟、自動複製、自動伸縮。

# 虛擬機 vs 容器

![image.png](./images/k8s1-1.png)

虛擬機，大家共用作業系統跟Lib

![image.png](./images/k8s1-2.png)

容器，各自服務有各自的Lib

傳統的虛擬機是建立在某個系統之上(Ubuntu)透過指令或安裝檔來安裝，所以像是JDK或是Python RunTime都會建立在作業系統上。

如果版本更新，會導致應用服務可能無法執行。

容器化則相反每個容器都有屬於自己的lib(JDK8、JDK17)之類的，可以互相不干擾，只接受相對應的請求

所以要達到CI的一致性，仰賴容器化將相對應的Lib個別包起來是比較好的選擇。

# 容器化的優點

- 快速創建/部屬應用：與虛擬機相比，容器鏡像的創建更加容易。
- 持續開發、集成、部屬：提供可靠且頻繁的容器鏡像建構/部屬，使用快速簡單的方式Rolling Update。
- 開發及運行分離：build與release階段創建容器鏡像，讓應用與機器解耦。
- 開發、測試、生產環境一致：包成鏡像檔可以讓應用服務一致性。
- 分布、彈性、微服務：應用服務更小更獨立，可以動態部屬跟管理。
- 資源隔離：可以透過設定檔進行系統資源限制並且一致。

# Kubernetes 基礎架構

![image.png](./images/k8s1-3.png)

## Kubernetes核心

- etcd保存了整個Kubernetes的狀態。
- API Server提供了資源操作的入口，認證、授權、訪問控制、API註冊與發現等。
- Controller Manager負責維護K8s叢集的狀態，故障檢測、自動擴展、滾動更新。
- Schedule負責資源的調度，將預定設定將Pod調度到相對應的機器上。
- Kubelet 負責Pod的生命週期、Volume的掛載、CNI網路的管理。
- Container runtime 負責鏡像檔的管理、Pod的運行。
- Kube-Proxy負責為Service提供叢集內的服務轉導與負載平衡。

## Kubernetes套件

- kube-dns 負責整個叢集的DNS服務
- Ingress Controller為服務提供入口
- Heapster提供資源監控
- Dashboard提供GUI
- Federation提供跨可用區的叢集服務
- Fluentd-elasticsearch提供叢集日誌收集、存儲、查詢

![image.png](./images/k8s1-4.png)

# Kubernetes分層架構

Kubernetes設計理念功能就是類似Linux的分層

![image.png](./images/k8s1-5.png)

- 核心層：Kubernetes核心功能，對外提供API建構高層的應用，對內提供Plugin的方式執行環境。
- 應用層：部屬(無狀態應用、有狀態應用、批次處理Job、叢集應用) 和 路由(Proxy、DNS解析)。
- 管理層：系統占用使用量(基礎設施、容器、網路的使用量)，使用量自動化(自動擴展、動態Provision)、策略管理(RBAC、Quota、PSP、NetworkPolicy)。
- 接口層：kubectl命令列工具、客戶端SDK、叢集管理。
- 生態系統：在街口層上的容器叢集調度管理，分做兩種Kubernetes外部、Kubernetes內部。
    - 外部：Log、監控、配置管理、CICD、執行工作流、FaaS、OTS應用、ChatOps。
    - 內部：CRI、CNI、CVI、鏡像倉庫、Cloud Provider、集群自身的配置和管理`;export{n as default};
