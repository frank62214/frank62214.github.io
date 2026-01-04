const n=`---
title: Kubernetes-三大工具
date: July 30, 2025
category: 系統知識
tags:
  - Kubernetes
excerpt: 簡單介紹重要的三個工具kubectl、kubeadm、kubelet
---

# Kubernetes-三大工具

類型: 系統知識
狀態: 完成
URL: https://www.notion.so/Kubernetes2-23cd5523abfb80a49ccecbc75592225c?source=copy_link
人員: 蘇柏文
完成日期: July 30, 2025

# KubeXXX

在k8s中，重要的三個套件kubectl、kubeadm、kubelet

- kubectl
- kubeadm
- kubelet

---

# **什麼是Kubelet?**

定時從某個地方獲取節點上 Pod 的期望狀態（運行什麼容器、運行的副本數量、網絡或者存儲如何配置等等），並調用對應的容器平台接口達到這個狀態。

所以kubelet會住在所有的Node上面。

主要功能有底下五項：

1. 接收命令
2. 啟動Pod
3. 監控健康狀態
4. 回報狀態
5. 與容器溝通

## kubelet會透過三種方式進行容器狀態的存取

- 本地文件
- 通過url 從網絡上某個地址來獲取信息
- API Server：從kubernetes master node 獲取信息

kubelet目前支援的平台包括：Docker、Rkt，在預設的情況下是使用Docker。

![image.png](./images/image.png)

<aside>
💡

Rkt(Rocket)是另一種Container的容器技術，已於2019年EOS。

敲碗+1可以解鎖Rkt的介紹(?

</aside>

## 監控Pod與回報

kubelet會透過定時的健康檢查檢驗容器是否正常運行，會透過 容器的執行命令 或 通過訪問自定義的HTTP endpoint 來辨別容器是否正常。

### 簡單來說，kubelet 是幫助 kubernetes 管理 Pod 的角色。

## 什麼是Pod?

Pod 是在 k8s 最基本的組成單位(也是最小的可佈署單位)，實際在 k8s 上運行的很多 resource object 都是以 pod 型式存在它封裝了許多不同的資源，也因此每個 pod 都有以下特性：

- 包含一到多個 container
- 同一個 pod 的 container 都共享相同的檔案系統 & volume … 等資源
- container 共享相同的 network namespace(container 之間可以透過 \`localhost\` + \`port number\` 互相通訊)，且有獨一無二的 IP address
- container 之間也可以透過進程間通信
- container 共享 pod 中的 volume resource
- pod 中的 container 總是被同時調度 & 有共同的運行環境

![image1.png](./images/image1.png)

常見的單一Pod對應一個Container

![image2.png](./images/image2.png)

單個Pod對應多個Container，透過Volume掛載資料夾互通資料

# **Kubelet總結**

Pod的管理系統，可以創建、檢查Pod的狀態。並將Pod的狀態、資訊都傳回 master ，並定時檢查容器的狀態，在容器運作不正常時，做相對應的處理，確保系統的運作正常。

---

# **什麼是**Kubectl

kubernetes 的 Command Line 工具，而我們就是透過這個工具去對 Kubernetes Cluster 做操作，所以幾乎每個操作指令都包含 Kubectl 這個工具

可以透過kubectl來做到

- 查詢資源狀態（如 Pod、Service、Deployment 等）
- 建立或刪除資源
- 佈署應用程式
- 監看叢集的運作
- 設定與管理叢集設定

### 查看所有Pod

\`\`\`java
// 可以透過切換預設namespace config
kubectl get pods <default namespace>

// 取得所有Pod
kubectl get pods --all-namespace

// 取得Namspace底下所有Pod
kubectl get pods -n kubernetes-dashboard
\`\`\`

## 什麼是Namespace?

Namespace在k8s中，是用來建立邏輯隔離的機制

在docker的容器名稱不能重複，而進化成k8s之後，再加上叢集平台，一定是數十個Pod以上的內容，會造成docker管理的困難。

所以衍伸出了Namespace的「虛擬空間」。

### Namespace能做什麼?

- 資源隔離：將應用區隔(透過環境、團隊、功能區隔)
- 權限管控：搭配RBAC可以限制使用者的操作數量
- 資源配置：預設Namespace底下的CPU、Memory
- 命名隔離：同個資源名稱可以在不同的namespace底下重複使用

### 確認目前的namespace (沒有顯示的話則是default)

\`\`\`java
kubectl config view
\`\`\`

### 查看所有namespace

\`\`\`java
kubectl get namespaces
\`\`\`

### 建立新的namespace

\`\`\`java
kubectl create namespace dev
\`\`\`

### 切換預設namespace

\`\`\`java
kubectl config set-context --current --namespace=dev
\`\`\`

### 部屬在某個namespace

\`\`\`java
kubectl apply -f app.yaml -n dev
\`\`\`

# **Namepsace 的特性**

- Namespace delete 掉，裡面的 resources 也跟著不見！
- 可透過 Resouce Quotas 調控/限制系統的資源 ！！必要的

![image3.png](./images/image3.png)

# Kubectl總結

- kubectl是與k8s API server溝通的工具
- 主要操作基於 .kube/config的設定(憑證、server IP等)
- 通常搭配yaml檔使用，定義資源配置

---

# **什麼是Kubeadm**

Kubernetes 提供建構 Cluster 的工具，他負責建構一個最小化可用的 Cluster 並執行啟動等必要的步驟。簡單來說，Kubeadm 是 Kubernetes Cluster 生命週期的管理工具，可用於實現 Cluster 的部署、升級、降級及卸載等。為 Cluster 添加最為重要的核心附件 CoreDNS 及 kube-proxy。

### 建立Master

\`\`\`java
sudo kubeadm init --v=5 --pod-network-cidr=10.244.0.0/16
\`\`\`

- \`-apiserver-advertise-address\`：API Server 綁定的 IP
- \`-pod-network-cidr\`：Pod 網路範圍（常搭配 Flannel 使用）
- \`-kubernetes-version\`：指定版本（例如 v1.30.0）
- \`-upload-certs\`：用於 multi-control-plane（多控制平面）

### 加入Slave(在執行完init之後會出現這串)

\`\`\`java
udo kubeadm join 192.168.0.10:6443 \\
  --token abcdef.0123456789abcdef \\
  --discovery-token-ca-cert-hash sha256:xxxxxxxx
\`\`\`

### 重置節點(清除etcd、設定檔、網路)，後續須清除CNI

\`\`\`java
sudo kubeadm reset
\`\`\`

### 升級kubernetes版本

\`\`\`java
sudo kubeadm upgrade plan           // 升級計畫
sudo kubeadm upgrade apply v1.30.4  // 進行升級
\`\`\`

### 管理token

\`\`\`java
kubeadm token list            // 顯示所有 token
kubeadm token create          // 建立新的 token
\`\`\`

### 管理設定檔

\`\`\`java
kubeadm config view                                      // 顯示當前叢集設定
kubeadm config print init-defaults                       // 顯示預設 init 設定檔
kubeadm config print join-defaults                       // 顯示預設 join 設定檔
kubeadm config print init-defaults > kubeadm-config.yaml // 輸出設定檔並自訂
kubeadm init --config=kubeadm-config.yaml                // 編輯並使用
\`\`\`

# kubeadm總結

- 初始化 Kubernetes 控制平面（Control Plane）
- 加入 Worker Node
- 管理叢集升級與 Token

---

# 附錄

### 查看Node內容

\`\`\`java
kubectl get node
\`\`\`

### 重設後需手動清除 CNI 網路設定，例如：

\`\`\`java
sudo rm -rf /etc/cni/net.d
sudo ip link delete cni0
\`\`\``;export{n as default};
