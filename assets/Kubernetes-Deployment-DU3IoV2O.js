const n=`---
title: Kubernetes-Deployment
date: August 13, 2025
category: 系統知識
tags:
  - Kubernetes
  - Deployment
  - ReplicaSet
excerpt: 介紹Kubernetes的Deployment控制器，包含滾動更新與版本回滾功能
---

# Deployment是甚麼?

一種控制器（Controller），它負責管理一組副本（Replica）的 **Pod**，確保它們持續存在並且符合預期的狀態。

- 建立 Pod 副本
- 自動處理 Pod 當掉時的重建
- 控制版本更新（Rolling Update）
- 支援版本回滾（Rollback）

\`\`\`jsx
$nano nginx-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.7.9
        ports:
        - containerPort: 80
\`\`\`

### Deployment 主要功能

| 功能 | 說明 |
| --- | --- |
| kind | 定義這個yaml的形式(pod、service、deployment) |
| labels | 貼上標籤 ，設定Selector指令的名稱 |
| **replicas** | 指定要幾個相同的 Pod |
| selector | 透過ReplicaSet，取得對應名稱的pod去設定 |
| template | 使用的容器樣板 |
| name | 取名 |

\`\`\`jsx
// 啟動Deployment
kubectl apply -f nginx-deployment.yaml

// 確認Deployment是否建立
kubectl get deployment -o wide
kubectl get deployment nginx-deployment -o jsonpath='{.spec.replicas}{"\\n"}{.status.replicas}{"\\n"}'
kubectl get pods --show-labels

\`\`\`

![k8s-4-1.png](./images/k8s-4-1.png)

![k8s-4-2.png](./images/k8s-4-2.png)

| 名稱 | 說明 |
| --- | --- |
| NAME | 叢集中Deployment的名稱 |
| labels | 貼上標籤 ，設定Selector指令的名稱 |
| desired | 列出宣告replicas的數量 |
| current | 顯示有多少個replicas正在運行 |
| up-to-date | 顯示已被更新達成期望狀態的數量 |
| Available | 顯示可用的Replica數量 |
| AGE | 時間 |

<aside>
💡

務必要正確的在 Deployment 中指定適當的 selector 以及 Pod template labels (在本範例中, \`app:nginx\`), 不要讓 labels 或 selectors 跟其他的 controllers 有重疊 (包含其他的 Deployments 以及 StatefulSets), Kubernetes 不會阻止這件事, 且如果上述情形發生的話, 可能會產生衝突以及一些預期外的行為

</aside>

### ReplicaSet(複製集)

早期叫做ReplicationController ，其中的差別僅在於 ReplicaSet 支援 set-based label selector，而 ReplicationController 僅支援 equality-based label selector。

- ReplicaSet.yaml
    
    \`\`\`jsx
    # apiVersion, kind, metadata 是必備欄位
    apiVersion: apps/v1
    kind: ReplicaSet
    metadata:
      name: frontend
      # replicaset 也可以定義 label
      # 一般會與 .spec.template.metadata.labels 設定相同，但不同其實也沒差
      labels:
        app: guestbook
        tier: frontend
    # 以下透過 spec 設定 replicaset 的規格 
    spec:
      # 要產生幾份副本(沒設定則預設為 1)
      replicas: 3
      # 設定 label selector，用來選擇產生副本用的 pod
      selector:
        matchLabels:
        tier: frontend
        matchExpressions:
          - {key: tier, operator: In, values: [frontend]}
      # .spec.template 是 .spec 中唯一的必要欄位
      # 其實就是 pod template
      template:
        metadata:
          # .spec.template.metadata.labels 必須符合 .spec.selector 中的設定才行
          # 否則 API server 會拒絕產生此物件
          labels:
            app: guestbook
            tier: frontend
        spec:
          # 所有 .spec.template.spec.restartPolicy 的設定，僅能設定為 Always (同時也是預設值)
          containers:
          - name: php-redis
            image: gcr.io/google_samples/gb-frontend:v3
            resources:
              requests:
                cpu: 100m
                memory: 100Mi
            env:
            - name: GET_HOSTS_FROM
              value: dns
              # If your cluster config does not include a dns service, then to
              # instead access environment variables to find service host
              # info, comment out the 'value: dns' line above, and uncomment the
              # line below.
              # value: env
            ports:
            - containerPort: 80
    \`\`\`
    

### 滾動更新Rolling Update

滾動更新是一種**平滑地更新 Pod 的方式**。它會**逐步地把舊版本的 Pod 替換成新版本的**，而不是一次全部殺掉再建立新的，這樣可以**避免停機**。

\`\`\`jsx
kubectl --record deployment.apps/nginx-deployment set image deployment.v1.apps/nginx-deployment nginx=nginx:1.9.1
/// 或是
kubectl set image deployment/nginx-deployment nginx=nginx:1.9.1 --record
\`\`\`

![k8s-4-3.png](./images/k8s-4-3.png)

before

![k8s-4-4.png](./images/k8s-4-4.png)

after

![k8s-4-5.png](./images/k8s-4-5.png)

### 版本回滾Rollback

發現升級後的應用有 bug 或不穩定，可以使用 **rollback 回到上一個版本**，不需要手動改 YAML 或重新 apply 舊檔案。Deployment 回到**上一次成功的狀態。**

![k8s-4-6.png](./images/k8s-4-6.png)`;export{n as default};
