const n=`---
title: Kubernetes-CICD
date: October 22, 2025
category: 系統知識
tags:
  - Kubernetes
  - CICD
  - Github Action
  - ArgoCD
  - Harbor
excerpt: 介紹如何使用 GitHub Actions 搭配 ArgoCD 實現從程式提交到自動部署的全自動化 CI/CD 流程
---

# Github Action 搭配 ArgoCD

## 前言

**持續整合（CI）與持續部署（CD）** 已成為提升開發效率與系統穩定性的關鍵。

其中，**GitHub Actions** 提供了強大的 CI 平台，能在程式碼提交後自動進行建置、測試與鏡像推送等流程；而 **ArgoCD** 則是專為 Kubernetes 設計的 GitOps 部署工具，透過監控 Git 儲存庫的狀態，自動將應用程式同步至叢集環境。

將 GitHub Actions 與 ArgoCD 結合，可以實現**從程式提交到自動部署的全自動化流程**：

- 由 GitHub Actions 負責建置應用程式並推送 Docker 映像至私有或公有的容器倉庫；
- ArgoCD 監聽儲存庫中的部署設定（如 Helm 或 Kustomize），自動將最新版本同步至 Kubernetes。

> 💡 請先準備好你要部屬的程式碼，並且準備好相對應的pom

\`\`\`yaml
spring:
  application:
    name: BadmintonReserved-WebhookAPI

  # 環境配置
  profiles:
    active: dev  # dev, local, prod

  datasource:
    url: jdbc:postgresql://postgres.postgres.svc.cluster.local:5432/badminton
    username: postgres
    password: ENC(I7GT+0BUk/B85QXYWbYWycbvL9Bjcau8)  # 開發環境使用明文密碼，生產環境請使用 ENC() 加密
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
      pool-name: BadmintonHikariPool

  jpa:
    hibernate:
      # update: 自動更新表結構（開發環境推薦）
      # validate: 僅驗證表結構（生產環境推薦）
      # create: 每次啟動都重建表（會刪除舊數據）
      # create-drop: 啟動時創建，關閉時刪除
      # none: 不做任何操作
      ddl-auto: update
      naming:
        # 使用物理命名策略：駝峰轉下劃線 (groupName -> group_name)
        physical-strategy: org.hibernate.boot.model.naming.CamelCaseToUnderscoresNamingStrategy
        implicit-strategy: org.springframework.boot.orm.jpa.hibernate.SpringImplicitNamingStrategy
    show-sql: true  # 顯示 SQL 語句
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: false  # 格式化 SQL
        use_sql_comments: true  # 顯示 SQL 註釋
        # 批次處理優化
        jdbc:
          batch_size: 20
          fetch_size: 20
        order_inserts: true
        order_updates: true
        # 查詢優化
        query:
          in_clause_parameter_padding: true
        # 統計信息（開發環境可開啟）
        generate_statistics: false
    open-in-view: false  # 關閉 OSIV，避免懶加載問題

# Jasypt Configuration
jasypt:
  encryptor:
    password: \${password}
    algorithm: PBEWithMD5AndDES
    iv-generator-classname: org.jasypt.iv.NoIvGenerator

# Server Configuration
server:
  port: \${SERVER_PORT:8080}

# Logging
logging:
  level:
    root: INFO
    com.hackdog: INFO
    org.hibernate.SQL: INFO
    org.hibernate.type.descriptor.sql.BasicBinder: INFO

# Crawler Configuration
crawler:
  playone:
    enabled: true
    cron: "0 0 */6 * * ?"  # Every 6 hours
    url: "https://www.playone.tw/"
    timeout: 30000

# Line Bot Configuration
line:
  bot:
    channel-token: \${CHANNEL_TOKEN}
    channel-secret: \${CHANNEL_SECRET}

# Google Maps API Configuration
google:
  maps:
    api:
      key: \${GOOGLE_KEY}
\`\`\`

---

## Github Action

**GitHub Actions** 是 GitHub 內建的 **CI/CD（持續整合與持續部署）平台**。

它能讓你在 GitHub 儲存庫中自動執行任務，例如：

- 自動測試程式碼（CI）
- 自動打包與部署（CD）
- 自動執行程式碼分析、格式檢查
- 自動發佈 Docker 映像檔、NPM 套件、網站部署等

簡單說，它讓你的整個開發流程「自動化」。

## ⚙️ 基本概念

| 名稱 | 說明 |
| --- | --- |
| **Workflow（工作流程）** | 一個完整的自動化流程，寫在 \`.github/workflows/\` 下的 \`.yml\` 檔案中。 |
| **Job（工作）** | Workflow 中的子任務，通常一個 job 對應一個執行環境（例如 Linux、Windows）。 |
| **Step（步驟）** | Job 內的指令或動作，例如「checkout 原始碼」或「執行測試」。 |
| **Action（動作）** | 可重複使用的任務模組，像「設定 Java 環境」或「登入 Docker registry」。 |
| **Runner（執行器）** | 負責實際執行 workflow 的主機。GitHub 會提供雲端 Runner（例如 Ubuntu）。 |

## 🎯 Github Action 目標

推送commit的時候，Action自動幫忙mvn build，然後建立docker image推送到harbor

> 🔥 請先準備好私有Harbor，也可以使用docker hub 替代

## 🪏專案結構（Simple 版本）

\`\`\`
my-project/
├── src/                     
├── pom.xml                  
└── .github/
    └── workflows/
        └── ci.yml           

\`\`\`

![image.png](./images/image.png)

## ✍ 撰寫CI

\`\`\`yaml
name: CI - Build and Push Backend to Harbor

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build-backend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: BadmintonReserved-WebhookAPI

    steps:
      # 1️⃣ 取出程式碼
      - name: Checkout code
        uses: actions/checkout@v4

      # 2️⃣ 設定 Java 17
      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'

      # 3️⃣ Build Spring Boot jar
      - name: Build Spring Boot jar
        run: mvn clean package -DskipTests

      # 2️⃣ Login to Docker Hub (避免拉取 maven image 出錯)
      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: \${{ secrets.DOCKERHUB_USERNAME }}
          password: \${{ secrets.DOCKERHUB_TOKEN }}
          
      # 4️⃣ Login to Harbor
      - name: Login to Harbor
        run: |
          echo "\${{ secrets.HARBOR_PASSWORD }}" | docker login \${{ secrets.HARBOR_URL }} -u \${{ secrets.HARBOR_USERNAME }} --password-stdin

      # 5️⃣ Build Docker image (multi-stage Dockerfile)
      - name: Build Docker image
        run: |
          IMAGE=\${{ secrets.HARBOR_URL }}/badminton-reserved/webhook-api:\${{ github.sha }}
          docker build -t $IMAGE .

      # 6️⃣ Push Docker image to Harbor
      - name: Push Docker image
        run: |
          IMAGE=\${{ secrets.HARBOR_URL }}/badminton-reserved/webhook-api:\${{ github.sha }}
          docker push $IMAGE

      # 7️⃣ Tag latest 並 push
      - name: Tag and push latest
        run: |
          IMAGE=\${{ secrets.HARBOR_URL }}/badminton-reserved/webhook-api
          docker tag $IMAGE:\${{ github.sha }} $IMAGE:latest
          docker push $IMAGE:latest

      # 8️⃣ Clone 部署 repo 並更新 YAML
      - name: Update image tag in deploy repo
        env:
          GITHUB_TOKEN: \${{ secrets.DEPLOY_REPO_TOKEN }} # personal access token
        run: |
          # Clone 部署 repo
          git clone https://x-access-token:\${{ secrets.DEPLOY_REPO_TOKEN }}@github.com/hackdog33456/Deployment.git
          cd Deployment
          git checkout BadmintonReserved-WebhookAPI
          cd BadmintonReserved
          cp -f ../../k8s-deployment/webhook-api.yml ./webhook-api.yml

          # 修改 YAML 中的 image tag
          sed -i "s|image: .*/badminton-reserved/webhook-api:.*|image: \${{ secrets.HARBOR_URL }}/badminton-reserved/webhook-api:\${{ github.sha }}|" webhook-api.yml

          # 提交變更
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add webhook-api.yml
          ls
          git commit -m "Update webhook-api image to \${{ github.sha }}" || echo "No changes to commit"
          git push https://x-access-token:\${GITHUB_TOKEN}@github.com/hackdog33456/Deployment.git
          
          # 自動部屬(更新main branch 觸發 ArgoCD)
          cd ..
          git checkout main
          git merge BadmintonReserved-WebhookAPI
          git push https://x-access-token:\${GITHUB_TOKEN}@github.com/hackdog33456/Deployment.git

\`\`\`

## ⚙️ 設定Github的secrets and variables

![image.png](./images/image1.png)

接著推送commit上去，就會看到他在執行囉!

![image.png](./images/image2.png)

---

## 🧭 Argo CD 是什麼？

**Argo CD** 是一個 **Kubernetes 原生的持續交付（CD）工具**，屬於 Argo Project 家族的一員。

它的主要功能是：

> ✅ 自動將 Git 儲存庫中的應用程式部署狀態，同步到 Kubernetes 叢集。

簡單說：

👉 **Git 是真實來源（source of truth）**

👉 **Argo CD 讓你的 K8s 部署自動與 Git 狀態保持一致**

## 🚀 主要特色

| 功能 | 說明 |
| --- | --- |
| **GitOps 模式** | 透過 Git 管理部署設定（如 YAML / Helm / Kustomize），確保版本可追蹤與可回滾。 |
| **自動同步** | 偵測 Git 變更後，自動更新叢集中的部署。 |
| **多叢集管理** | 可同時管理多個 Kubernetes 叢集。 |
| **視覺化 UI** | 透過網頁介面查看部署狀態、同步進度與差異（Diff）。 |
| **安全控管** | 支援 RBAC、SSO（OAuth2、OIDC）等身分驗證。 |
| **多種部署方式** | 支援原生 YAML、Helm、Kustomize、Jsonnet 等格式。 |

## 🎯Argo CD 目標

當Harbor上已經有最新的Image的時候幫忙進行版本更新

> ⚠️ 請先準備好ArgoCD以及ArgoCD CLI，這邊用k8s建立的ArgoCD，並且在當前機器安裝CLI

## ✍撰寫部屬的Deployment.yml

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: badminton-reserved-webhook-api
  namespace: default
spec:
  replicas: 2
  selector:
    matchLabels:
      app: badminton-reserved-webhook-api
  template:
    metadata:
      labels:
        app: badminton-reserved-webhook-api
    spec:
      containers:
        - name: my-app
          image: harbor.hackdog.tw/badminton-reserved/webhook-api:latest
          ports:
            - containerPort: 8080
          envFrom:
            - secretRef:
                name: app-secrets
---
apiVersion: v1
kind: Service
metadata:
  name: badminton-reserved-webhook-api
spec:
  selector:
    app: badminton-reserved-webhook-api
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080
  type: ClusterIP

\`\`\`

另外在k8s平台上設定Secret，讓上面的pom可以自行注入我們所設定的內容

\`\`\`yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: default
type: Opaque
stringData:
  DB_HOST: "DB_IP"
  DB_PORT: "5432"
  DB_NAME: "badminton"
  DB_USER: "postgres"
  DB_PASSWORD: "rootcsie"
  GOOGLE_KEY: "google_key"
  CHANNEL_SECRET: "channel_secret"
  CHANNEL_TOKEN: "channel_token"
\`\`\`

## 利用CLI在ArgoCD上建立需要監聽的repo

\`\`\`bash
argocd repo add https://github.com/hackdog33456/BadmintonReserved.git --username frank62214 --password [PASSWORD] --name badminton-repo
\`\`\`

## 再利用CLI在ArgoCD上建立Deployment的Application

\`\`\`bash
argocd app create badminton-webhookapi --repo https://github.com/hackdog33456/BadmintonReserved.git --path ./k8s --dest-server https://kubernetes.default.svc --dest-namespace default --sync-policy automated
\`\`\`

![image.png](./images/image%201.png)

![image.png](./images/image%202.png)
`;export{n as default};
