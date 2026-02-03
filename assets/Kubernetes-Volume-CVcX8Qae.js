const n=`---
title: Kubernetes-Volume
date: August 20, 2025
category: 系統知識
tags:
  - Kubernetes
  - Volume
  - PV
  - PVC
excerpt: 介紹Kubernetes的Volume概念，包含PV、PVC、StorageClass的使用與實作
---

# Volume概述

在Container裡面，因為其短暫的特性，每次啟動都會是全新乾淨的環境，這也意味著每次資料都會重新建置，如果想要將資料延續就沒辦法了! 

所以延伸出Volume共享資料夾的概念，透過這個功能可以將容器內部與外部的資料夾互通，達到資料的延續，容器被刪除後資料依舊存在。容器重啟後可以迅速取得相對應的資料或設定檔。

## Volume掛載資料夾

Volume在Container的概念底下，是提供Container與本機存儲共享檔案的一項功能。

以Docker來說，指令如下

\`\`\`jsx
docker run -dti -u root -p 8083:8080 -v jenkins-data:/var/jenkins_home -v /var/run/docker.sock:/var/run/docker.sock  -v "$HOME":/home --name jenkins  jenkinsci/blueocean
\`\`\`

![docker.drawio.png](./images/docker.drawio.png)

可以看到Container直接去掛載了Ubuntu Server主機上的某個資料夾，如果容器中異動了就會同步

對於可能會管理上百個容器的k8s來說，k8s的Volume會相較比較嚴謹一點

![20149562MwLEil5qro.png](./images/20149562MwLEil5qro.png)

對於k8s中的Volume，額外加入了生命週期的概念，對於Pod是屬於同進退的臨時卷(Ephemeral Volumes) 以及 持久卷(叫Pod的生命周期較長)，讓容器的資料不會遺失。

## 在k8s中宣告Volume類型

### Pod 生命週期綁定的暫存型 Volume

| Volume 類型 | 說明 | 特點 / 使用情境 |
| --- | --- | --- |
| **emptyDir** | Pod 啟動時建立一個空目錄 | - 隨 Pod 刪除而消失- 適合暫存檔案、快取資料 |
| **configMap** | 從 ConfigMap 掛載成檔案 | - 用來將設定檔注入容器- 資料是由 ConfigMap 管理 |
| **secret** | 從 Secret 掛載成檔案 | - 儲存敏感資料（密碼、API key） |
| **downwardAPI** | 把 Pod metadata（名稱、namespace、labels 等）掛載成檔案 | - 容器可以直接讀取自身資訊 |
| **projected** | 可以把 configMap、secret、downwardAPI 合併到同一個目錄 | - 多來源設定整合 |

### Node 綁定的本地儲存型 Volume

這些 Volume 綁在 Node 上，Pod 離開該 Node 就存取不到。

| Volume 類型 | 說明 | 特點 / 使用情境 |
| --- | --- | --- |
| **hostPath** | 直接掛載 Node 的目錄到 Pod | - 存取宿主機檔案- 有安全風險，不建議隨便用 |
| **local** | 類似 hostPath，但由 PersistentVolume 管理 | - 適合高效能本地磁碟- 不具備自動跨節點移動能力 |

### 特殊用途的 Volume

| Volume 類型 | 說明 |
| --- | --- |
| **persistentVolumeClaim** | 透過 PVC 動態綁定 PV（實際後端可能是 NFS、Ceph、雲端硬碟等） |
| **PersistentVolume** | 集群中的一塊儲存資源，可以由管理者事先設定，是屬於集群的資源 |

---

# **PV、PVC、StorageClass**

## **Persistent Volumes (PV)**

\`Kubernetes\` 利用 \`PV\` 提供一個抽象的存儲空間，並且 \`PV\` 能被動態和靜態的被提供，可以簡單理解為當 \`PV\` 是預先被宣告出來後被 \`PVC\` 取用的話就是一種靜態，而如果 \`PVC\` 中有指定 \`storageclass\` 的種類時， \`Kubernetes\` 將會動態的為我們產生 \`PV\`。

1. **數據持久性**：PV 可以在 Pod 被刪除或重新調度後保留數據，確保應用程式的數據不會丟失，對於需要持久化數據的應用（如資料庫）尤為重要。
2. **集中管理**：集群管理員可以集中配置和管理存儲資源，用戶僅需通過 PVC 提出存儲需求，簡化了存儲管理流程，提高資源利用率。
3. **靈活調度**：PVC 允許應用程式在不同節點上運行，同時保持對存儲的持續訪問，增強了應用的可用性和可擴展性。

![image.png](./images/image.png)

\`\`\`yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: <pv-name>
spec:
  capacity:
    storage: <storage-size>
  accessModes:
    - <access-mode>
  persistentVolumeReclaimPolicy: <reclaim-policy>
  pv-type:
    <pv-type-configurations>
\`\`\`

**capacity**：定義 PV 的大小，例如: 1Gi、500Mi 等。

**accessModes**：定義 PV 的存取模式

- ReadWriteOnce (RWO)：只能被**單一** Node 掛載為讀寫模式
- ReadOnlyMany (ROX)：可以被**多個** Node 掛載為唯讀模式
- ReadWriteMany (RWX)：可以被**多個** Node 掛載為讀寫模式
- ReadWriteOncePod (RWOP)：只能被**單一** Pod 掛載為讀寫模式

**persistentVolumeReclaimPolicy**：定義當 PVC 被刪除時的行為，有以下三種：

- Retain：PV 會繼續存在，並保留 PV 裡的資料(真的用不到需自行手動刪除)。雖然 PV 還在，但已經不能再被新的 PVC 使用。
- Delete: 直接刪除 PV 以及相關的儲存資源(ex. AWS EBS)
- Recycle：PV 會繼續存在，並刪除 PV 裡的「資料」。之後 PV **可以**被新的 PVC 使用。
    
    > Recycle 模式看看就好，因為官網明確表明，建議使用 Dynamic provisioning 的方式來取代 Recycle PV。
    > 
- **pv-type**: 定義 PV 的類型，例如: \`nfs\`、\`hostPath\`、\`local\` 等。
- **pv-type-configurations**: 根據不同的 pv-type 而有不同的配置，例如：nfs 需要定義 server、path 等

### 狀態Status

- Available：表示 PV 為可用狀態
- Bound：表示已綁定到 PVC
- Released：PVC 已被刪除，但是尚未回收
- Failed：回收失敗

---

## **Persistent Volume Claims (PVC)**

\`PVC\` 中表達的是使用者對存儲的請求，相較於 \`Pod\` 可以請求特定數量的 CPU 和內存資源， \`PVC\` 也可以請求存儲空間大小以及設定訪問模式 (例如：ReadWriteOnce、ReadOnlyMany 或 ReadWriteMany)，而 \`PVC\` 的資源請求成立後，將會去不斷的找尋符合條件的 \`PV\` 直到找到符合條件的資源並且將兩者綁定，如果找不到匹配的 \`PV\` 時， \`PVC\` 將會無限期的處於未榜定狀態(Pending)，直到出現與之匹配的 \`PV\` 加入。

\`\`\`yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
 name: <pvc-name>
spec:
 storageClassName: <storage-class-name>
 accessModes:
   - <access-mode>
 resources:
   requests:
     storage: <request-size>
\`\`\`

**storageClassName**：指定 storageClass 來自動建立 PV。若省略此欄位，則使用預設的 storage class，沒有預設的 storage class 就得手動建立 PV。

**accessModes**：同 PV 的 accessModes (RWO、ROX、RWX、RWOP)。

**resources**：定義所需的大小，例如: 1Gi、500Mi 等。

---

## StoragClass

\`\`\`yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: <storage-class-name>
provisioner: <provisioner>
reclaimPolicy: <reclaim-policy>
allowVolumeExpansion: <true or false>
volumeBindingMode: <volume-binding-mode>
\`\`\`

**provisioner**：storageClass 會建立 PV，就需要一個 PV 的「提供者」。可用的 provisioner 清單請見[官網](https://kubernetes.io/docs/concepts/storage/storage-classes/#provisioner)。

**reclaimPolicy**：同 PV 的 ReclaimPolicy，預設為 Delete

**allowVolumeExpansion**：是否允許 PVC 要求更多的 size，**true**為允許。

**volumeBindingMode**： 定義 PV 的綁定模式，有以下兩種：

- Immediate：當 PVC 被建立時，storageClass 會立即建立 PV
- WaitForFirstConsumer：當 PVC 被建立時，storageClass 不會立即建立 PV，而是等到有 Pod 使用 PVC 時才建立 PV (底下有關 local pv 的例子會使用到)

---

# 實作

建立兩個目錄：

\`\`\`yaml
sudo mkdir -p -m 777 /data/retain /data/delete 
\`\`\`

建立PV

\`\`\`yaml
# pv.yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-retain
  labels:
    foo: bar
spec:
  capacity:
    storage: 500Mi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  hostPath:
    path: /data/retain
---
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-delete
  labels:
    foo: bar
spec:
  capacity:
    storage: 500Mi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Delete
  hostPath:
    path: /data/delete
\`\`\`

\`\`\`yaml
kubectl apply -f pv.yaml
\`\`\`

建立PVC

\`\`\`yaml
# pvc.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-retain
  labels:
    foo: bar
spec:
  storageClassName: ""
  volumeName: pv-retain
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 500Mi
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-delete
  labels:
    foo: bar
spec:
  storageClassName: "" 
  volumeName: pv-delete
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 500Mi
\`\`\`

\`\`\`yaml
kubectl apply -f pvc.yaml
\`\`\`

確認狀態

\`\`\`yaml
psmadmin@psmadmin-Master:~/yaml/pvc-demo$ kubectl get pvc -l foo=bar
NAME         STATUS   VOLUME      CAPACITY   ACCESS MODES   STORAGECLASS   VOLUMEATTRIBUTESCLASS   AGE
pvc-delete   Bound    pv-delete   500Mi      RWO                           <unset>                 94s
pvc-retain   Bound    pv-retain   500Mi      RWO                           <unset>                 94s
\`\`\`

從 STATUS 可以看出 PVC 皆成功找到了對應的 PV，因此狀態為 Bound。

從 VOLUME 可以看出 PVC 皆成功綁定到我們指定的 PV。

取得nodeName

\`\`\`yaml
kubectl get node
\`\`\`

\`\`\`yaml
NAME               STATUS   ROLES           AGE    VERSION
psmadmin-master    Ready    control-plane   6d8h   v1.33.3
psmadmin-slave01   Ready    <none>          6d8h   v1.33.3
\`\`\`

建立Pod

\`\`\`yaml
# retain-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: retain-pod
  labels:
    foo: bar
spec:
  nodeName: psmadmin-master #沒有區分大小寫
  containers:
    - name: busybox
      image: busybox
      command: ["/bin/sh", "-c", "echo 'hello from retain-pod' > /pod-data/retain.txt && sleep 3600"]
      volumeMounts:
        - name: retain-vol
          mountPath: /pod-data
  volumes:
    - name: retain-vol
      persistentVolumeClaim:
        claimName: pvc-retain
\`\`\`

\`\`\`yaml
kubectl apply -f retain-pod.yaml
\`\`\`

- 透過 \`spec.nodeName\` 指定 retain-pod 一定要跑在 master 上，因為只有 master 上才有 hostPath PV。(nodeName 的用法屬於 scheduling 的範疇，後續會有一個專門的章節來介紹)
- 在 \`spec.volumes\` 中定義了一個叫做 "retain-vol" 的 volume，該 volume 的類別是 \`persistentVolumeClaim\`，使用了 pvc-retain 這個 PVC。
- 在 \`spec.containers.volumeMounts\` 中，將 retain-vol 掛載至 retain-pod 的 /pod-data 目錄下。當 retain-pod 啟動時，會在 /pod-data 目錄下建立 retain.txt，內容為 "hello from retain-pod"。
- 因為 retain-vol 實際上是一個 hostPath PV (pvc-retain -> pv-retain)，因此 retain.txt 實際上存在於 node01 的 /data/retain 目錄下。

確認Pod的狀態

\`\`\`yaml
kubectl get pod
\`\`\`

\`\`\`yaml
NAME                    READY   STATUS    RESTARTS   AGE
demo-84ff64c5d7-j5xl6   1/1     Running   0          3d4h
retain-pod              1/1     Running   0          13s
ubuntu-pod              1/1     Running   0          5d5h
\`\`\`

接著查看檔案有沒有被建立

\`\`\`yaml
cat /data/retain/retain.txt
\`\`\`

確認資料有正確寫入，刪掉 retain-pod & pvc-retain，並觀察 pv-retain 的狀態

\`\`\`yaml
kubectl delete pod retain-pod --force --grace-period=0
kubectl delete pvc pvc-retain
kubectl get pv pv-retain
\`\`\`

\`\`\`yaml
NAME        CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS     CLAIM                STORAGECLASS   VOLUMEATTRIBUTESCLASS   REASON   AGE
pv-retain   500Mi      RWO            Retain           Released   default/pvc-retain                  <unset>                          23m
\`\`\`

因為是Retain 模式，所以 pv-retain 的 STATUS 為 **Released**，代表原本的 PVC 已被刪除，但 PV 尚未被回收，所以無法再被其他 PVC 綁定使用

「PV 尚未被收回」可以從 \`claimRef\` 中看出來：

\`\`\`yaml
{"apiVersion":"v1","kind":"PersistentVolumeClaim","name":"pvc-retain","namespace":"default","resourceVersion":"6766874","uid":"e6bd8d92-5f7d-41a3-82d5-def3ed098f21"}
\`\`\`

將claimRef設定成null就可以讓他的Status變回Available

\`\`\`yaml
kubectl patch pv pv-retain -p '{"spec":{"claimRef": null}}' 
kubectl get pv pv-retain
\`\`\`

\`\`\`yaml
NAME        CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS      CLAIM   STORAGECLASS   VOLUMEATTRIBUTESCLASS   REASON   AGE
pv-retain   500Mi      RWO            Retain           Available                          <unset>                          4h26m
\`\`\`

重新建一個新的 PVC 與 Pod，嘗試讀取之前留下的 retain.txt：

\`\`\`yaml
# new-retain.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: new-pvc
  labels:
    foo: bar
spec:
  storageClassName: ""
  volumeName: pv-retain
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 500Mi
---
apiVersion: v1
kind: Pod
metadata:
  name: new-pod
  labels:
    foo: bar
spec:
  nodeName: psmadmin-master
  containers:
    - name: busybox
      image: busybox
      command: ["/bin/sh", "-c", "cat /pod-data/retain.txt; sleep 3600"]
      volumeMounts:
        - name: retain-vol
          mountPath: /pod-data
  volumes:
    - name: retain-vol
      persistentVolumeClaim:
        claimName: new-pvc
\`\`\`

\`\`\`yaml
kubectl apply -f new-retain.yaml
\`\`\`

確認是否正在運行

\`\`\`yaml
NAME                    READY   STATUS    RESTARTS   AGE
demo-84ff64c5d7-j5xl6   1/1     Running   0          3d8h
new-pod                 1/1     Running   0          5s
ubuntu-pod              1/1     Running   0          5d9h
\`\`\`

再次確認輸出內容

\`\`\`yaml
kubectl logs new-pod
hello from retain-pod
\`\`\`

---

# 結論

- **Persistent Volume (PV)**：擁有獨立生命週期的 storage。
- **Persistent Volume Claim (PVC)**：儲存空間的需求。

---

### 補充說明

提供 PV 的方式稱為「provisioning」，可以分為以下兩種模式：

- **Static**：由管理員自行定義並建置，例如管理使用 yaml 來建立 PV。
- **Dynamic**: 管理員配置 「StorageClass」，後續由 storageClass 來自動建置 PV。

StorageClass 可以讓 PV 的 provisioning 變得更簡單，舉例來說：

1. 開發者建立了一個 PVC，該 PVC 屬於 storageClass「A」。
2. StorageClass「A」看到新的 PVC，會自動建立相對應的 PV，而非管理員手動操作。

---

### Reference

[](https://ithelp.ithome.com.tw/articles/10347335)`;export{n as default};
