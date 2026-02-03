const n=`---
title: Kubernetes-Pod與Service
date: August 6, 2025
category: 系統知識
tags:
  - Kubernetes
  - Pod
  - Service
excerpt: 介紹Kubernetes中最基本的組成單位Pod，以及提供網路抽象層的Service
---

# 什麼是Pod?

### 前情提要

Pod 是在 k8s 最基本的組成單位(也是最小的可佈署單位)，實際在 k8s 上運行的很多 resource object 都是以 pod 型式存在它封裝了許多不同的資源，也因此每個 pod 都有以下特性：

- 包含一到多個 container
- 同一個 pod 的 container 都共享相同的檔案系統 & volume … 等資源
- container 共享相同的 network namespace(container 之間可以透過 \`localhost\` + \`port number\` 互相通訊)，且有獨一無二的 IP address
- container 之間也可以透過進程間通信
- container 共享 pod 中的 volume resource
- pod 中的 container 總是被同時調度 & 有共同的運行環境

![未命名绘图.drawio.png](./images/未命名绘图.drawio.png)

常見的單一Pod對應一個Container

![未命名绘图.drawio (1).png](./images/未命名绘图.drawio_(1).png)

單個Pod對應多個Container，透過Volume掛載資料夾互通資料

每個 Pod 都有以下這些特性

- 包含一到多個 Container
- Container 共享相同的 Network Namespace 與 IP Address。
- 所有Containers共享著Volumes 及檔案系統，能透過這種方式彼此間溝通。
- 在同一個 Pod 中的 Container 總是被同時調度且有共同的運行環境

### 補充說明

有人提到說大多建議1對1建立Pod的服務，但在現在眾多微服務的情況底下延伸出每一個服務都要向ELK去傳遞Log，會導致伺服器的Message Queue擠爆，更慘會Crash。所以在玉山延伸出使用kafka去收集Log，在傳遞給ELK存取(缺點：兩個TimeStamp，新手誤區。Kafka每個服務都要註冊申請。Kafka也有擠爆的一天...)

最終Pod中多個服務的架構就出現了(稱作sidecar)，會針對每個Pod進行Log的存取，目前常用的平台叫做Istio。

[[筆記] 淺入淺出 Istio (1) — 架構簡說](https://medium.com/hobo-engineer/%E7%AD%86%E8%A8%98-%E6%B7%BA%E5%85%A5%E6%B7%BA%E5%87%BA-istio-1-%E6%9E%B6%E6%A7%8B%E7%B0%A1%E8%AA%AA-a8d6aaf6977d)

### Pod的生命週期

Pod 跟 Docker 的 Container 一樣也有相對的生命週期， Pod 遵循著一個預定義的生命週期，起始於 Pending 階段，如果其中至少有一個主要容器正常啟動的話，則會進入Running，之後的狀態取決於賦予 Pod 中 Container 的任務成功與否，進入 Succeeded 或者 Failed 階段。

| Value | Describe |
| --- | --- |
| Pending(懸決) | Pod 已被 K8s 系統接受，但有容器尚未創建所以無法運行 |
| Running(運行中) | Pod 已經綁定到了某個節點，且所有的容器都已被創建。 |
| Succeeded(成功) | Pod 中的所有容器都已成功終止，並且不會再重啟。 |
| Failed(失敗) | 所有容器都已終止，且至少有一個容器是因為失敗終止。 |
| Unknown(未知) | 因為某些原因無法取得Pod 的狀態。 |
| **CrashLoopBackOff(重啟)** | 容器不斷地啟動失敗。 |

### Pod的Yaml解析與實作

可以直接使用指令

\`\`\`yaml
kubectl run my-nginx --image=nginx
\`\`\`

或者是寫yaml檔案

\`\`\`yaml
apiVersion: v1
kind: Pod
metadata:
  name: ubuntu-pod
  labels: {service}
    app: test
spec:
  containers:
  - name: ubuntu
    image: ubuntu:20.04
    args: [bash, -c, 'for ((i = 0; ; i++)); do echo "$i: $(date)"; sleep 100; done']
\`\`\`

| apiVerion |  Pod 的版本做控制 |
| --- | --- |
| kind | Resource 的種類 |
| metadata | Pod 的名字 及它的標籤 |
| labels | service的命名 |
| spec | 容器的詳細內容 |

建立完yaml檔案之後會執行指令

\`\`\`java
kubectl apply -f test.yaml

預期會出現 pod/ubuntu-pod created
\`\`\`

可以透過指令去看目前的Pod的狀態

\`\`\`java
kubectl get pod ubuntu-pod -o wide
\`\`\`

---

# 什麼是Service

**Service** 是一種**網路抽象層**，用來定義一組 Pod 的**穩定訪問方式**。因為 Pod 可能會因為重新部署或故障而變動 IP，Service 提供了一個**穩定的名稱（DNS）與 IP** 來讓其他 Pod 或使用者可以找到這組 Pod。

### Service 的用途

- 為一組 **Pod（通常有相同的 Label）** 提供統一的訪問入口
- 自動實現 **負載平衡**
- 解耦使用者與 Pod 的實際 IP
- 可以設定是要在**集群內部**可見，或是**暴露到集群外部**

### 一個簡單的 YAML 範例（ClusterIP）

\`\`\`yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  selector:
    app: my-app
  ports:
    - protocol: TCP
    port: 80
    targetPort: 8080
\`\`\`

| selector |  哪些 Pod（根據 label）要被這個 Service 代理 |
| --- | --- |
| port | 外部訪問這個 Service 使用的 port |
| targetPort | 實際 Pod 裡面 container 監聽的 port |

### DNS 名稱

Service 會自動建立內部 DNS 名稱

\`\`\`yaml
<service-name>.<namespace>.svc.cluster.local

my-service.default.svc.cluster.local
\`\`\`

### 工作流程簡化圖

\`\`\`yaml
Client Pod --> Service (ClusterIP) --> 後端 Pod（多個）
\`\`\`

![OpenShift_Kubernetes 流量路徑圖解.png](./images/OpenShift_Kubernetes_流量路徑圖解.png)

### 補充 Service跟OCP的Route的差異

### 簡單比較：

| 項目 | Service | Route |
| --- | --- | --- |
| 屬於 | Kubernetes | OpenShift 專有 |
| 用途 | 集群內部連線 | 提供集群外部存取 |
| 支援協定 | TCP/UDP（支援所有類型） | 主要支援 HTTP/HTTPS（L7） |
| 是否提供 URL | ❌ 否（只有 IP 和 Port） | ✅ 是，提供外部可用的 URL |
| 對應對象 | Pod（通常經 label selector） | Service（轉送到 Pod） |

### 小結

- Service 是內部通訊的機制，Route 是外部公開的入口。
- Route **會綁定 Service**，但它們是兩種不同的資源，不是「一種」。

---

# Service的實作練習

先建立一個Service.yaml

\`\`\`yaml
apiVersion: v1
kind: Service
metadata:
  name: test-service
spec:
  type: NodePort
  selector:
    app: test
  ports:
  - name: http
    protocol: TCP
    port: 80
    targetPort: 80
    nodePort: 30390
\`\`\`

| 項目 | 內容 |
| --- | --- |
| spec  |  type，由於我們使用的 Node 是 Master Node，如果我們沒有特別指定的話，它的預設值會是 Cluster IP，而這樣就會衝突到，所以必須將它指定成 NodePort。 |
| selector  | 必須要跟原本建立的 Pod 的值一樣，跟我們昨天介紹的一樣，這樣才能指定到需要的 Pod。 |
| ports  |  Nginx 預設是開在 80 port 所以這邊將 port 80 打開 |
| targetPort | **Container** 上開出來的 Port。 |
| NodePort | **Node** 開出來的 Port。而預設值在 30000-32768 |

執行Service

\`\`\`java
kubectl apply -f test_service.yaml

會看到 service/test-service created
\`\`\`

可以透過指令查詢是不是正在運行

\`\`\`java
kubectl get svc <default namespace>
\`\`\`

建立完之後，我們要先進入 Pod 內執行 Shell 指令將 Nginx 安裝起來

\`\`\`java
kubectl exec -ti ubuntu-pod -- /bin/bash

會看到root@ubuntu-pod:/# 
\`\`\`

並執行底下指令

\`\`\`java
apt update
apt install nginx -y  [中間可能會叫你選時區]
apt install systemctl -y
\`\`\`

確認nginx正在執行

![image.png](./images/image.png)

接著要使用先前的指令加點參數

\`\`\`java
kubectl get svc -o wide
\`\`\`

![image.png](./images/image%201.png)

看到Nginx就成功了!

![image.png](./images/image%202.png)`;export{n as default};
