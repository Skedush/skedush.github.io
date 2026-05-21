下面按 **稳定、隔离、可回滚** 的 AI 工作站方案配置。你的核心限制不是 CPU 或内存，而是 **RTX 5060 8GB 显存**：适合本地 4B/7B/8B 量化模型、embedding、RAG、小规模 LoRA；不适合指望本地流畅跑 32B/70B 或大模型训练。

## 0. 总体架构建议

|层级|推荐做法|原因|
|---|---|---|
|宿主机|Ubuntu 26.04 + NVIDIA 驱动 + Docker + NVIDIA Container Toolkit|宿主机只放底座，减少污染|
|AI 用户|单独建 `ai` 用户|把日常桌面用户和 AI/agent 环境隔离|
|项目环境|每个项目一个 Docker/Compose 或 `.venv`|可复现、可删除、可迁移|
|Python|优先 `uv`/venv；不要全局 `pip install`|避免依赖互相污染|
|LLM 推理|Ollama / llama.cpp / vLLM 按场景分开|8GB 显存需要量化和轻量推理|
|Agent|容器内运行 Codex/OpenCode/自写 agent|避免 agent 读写整个 `$HOME`|

Ubuntu 26.04 LTS 已正式发布，官方支持到 2031 年 4 月；Canonical 也说明 26.04 开始在发行版仓库中分发 NVIDIA CUDA，适合作为 AI/ML 工作站底座。([Ubuntu Documentation](https://documentation.ubuntu.com/release-notes/26.04/ "Ubuntu 26.04 LTS release notes - Ubuntu release notes"))

---

## 1. BIOS / UEFI 设置

开机进 BIOS，建议：

```text
XMP / EXPO: 开启 DDR5 6400
Resizable BAR: 开启
Above 4G Decoding: 开启
VT-x / VT-d: 开启
Secure Boot: 建议先关闭，等 NVIDIA 驱动稳定后再考虑 MOK 签名
Primary GPU: PEG / PCIe GPU
```

`Ultra 7 265K + RTX 5060` 的 AI 主力是 NVIDIA GPU；Intel NPU/iGPU 可以以后再折腾 OpenVINO，不建议一开始把 NPU 作为主路径。

---

## 2. 磁盘布局建议：1TB SSD

推荐目录：

```text
/
├── home/你的日常用户
└── srv/
    ├── ai/
    │   ├── projects/
    │   ├── models/
    │   ├── datasets/
    │   ├── cache/
    │   │   ├── huggingface/
    │   │   ├── torch/
    │   │   ├── uv/
    │   │   └── npm/
    │   └── secrets/
    └── docker/
```

如果是新装系统：

|分区|建议大小|
|---|--:|
|`/`|150–200GB|
|`/srv` 或 `/srv/ai`|700GB+|
|swap|32–64GB|
|EFI|默认即可|
b
如果已装好系统，不必重装，直接创建目录：

```bash
sudo mkdir -p /srv/ai/{projects,models,datasets,cache/{huggingface,torch,uv,pip,npm},secrets}
sudo mkdir -p /srv/docker
```

---

## 3. 宿主机基础包

```bash
sudo apt update
sudo apt full-upgrade -y

sudo apt install -y \
  build-essential git curl wget unzip jq \
  ripgrep fd-find tree tmux htop btop nvtop \
  ca-certificates gnupg lsb-release \
  python3 python3-venv python3-pip pipx direnv \
  openssh-client rsync
```

不要在宿主机上做这些事：

```bash
sudo pip install ...
sudo npm install -g 一堆东西
sudo conda install ...
```

宿主机保持干净。

---

## 4. NVIDIA 驱动与 CUDA

### 4.1 安装驱动

优先用 Ubuntu 仓库，不建议直接用 NVIDIA `.run` 安装器。NVIDIA Container Toolkit 文档也建议优先使用发行版包管理器安装驱动。([NVIDIA Docs](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html "Installing the NVIDIA Container Toolkit — NVIDIA Container Toolkit"))

```bash
ubuntu-drivers devices
sudo ubuntu-drivers install
sudo reboot
```

重启后检查：

```bash
nvidia-smi
```

你需要看到：

```text
NVIDIA GeForce RTX 5060
Driver Version: ...
CUDA Version: ...
```

Ollama 官方硬件页已列出 RTX 5060 / 5060 Ti 属于 compute capability 12.0，并要求 NVIDIA driver 531+；CUDA 12.8 release notes 也说明已加入 Blackwell `SM_120` 编译支持。([Ollama 文档](https://docs.ollama.com/gpu "Hardware support - Ollama"))

### 4.2 是否安装 CUDA Toolkit？

**最佳实践：**

- 只跑 PyTorch / Ollama / llama.cpp Docker：宿主机通常只需要 NVIDIA 驱动。
    
- 需要自己编译 CUDA extension、llama.cpp CUDA、custom kernel：再装 CUDA Toolkit。
    

Ubuntu 26.04 已把 CUDA 纳入仓库，但安装前先看包名：

```bash
apt-cache search '^cuda-toolkit'
apt-cache policy cuda-toolkit cuda-toolkit-13
```

然后安装：

```bash
sudo apt install -y cuda-toolkit-13
nvcc --version
```

NVIDIA CUDA 13.2 文档仍强调 CUDA 需要 CUDA-capable GPU、受支持 Linux、gcc/toolchain 和 CUDA Toolkit；不要混装多个来源的 CUDA 包。([NVIDIA Docs](https://docs.nvidia.com/cuda/cuda-installation-guide-linux/ "CUDA Installation Guide for Linux — Installation Guide for Linux 13.2 documentation"))

---

## 5. 单独创建 AI 用户

建议日常桌面用户不要直接进 `docker` 组。创建单独 `ai` 用户：

```bash
sudo adduser ai
sudo usermod -aG video,render ai
sudo chown -R ai:ai /srv/ai
```

稍后 Docker 装好后，只把 `ai` 加入 docker 组：

```bash
sudo usermod -aG docker ai
```

原因：Docker 官方文档明确说明，`docker` 组具有接近 root 的权限。([Docker Documentation](https://docs.docker.com/engine/install/linux-postinstall/ "Linux post-installation steps for Docker Engine | Docker Docs"))

之后用：

```bash
su - ai
```

或者 SSH 到本机 `ai` 用户跑 agent / LLM 服务。

---

## 6. Docker Engine 安装

不要装 Docker Desktop。工作站用 Docker Engine 更干净。

```bash
# 移除冲突包
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do
  sudo apt remove -y $pkg
done

# Docker 官方 apt 源
sudo apt update
sudo apt install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings

sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  -o /etc/apt/keyrings/docker.asc

sudo chmod a+r /etc/apt/keyrings/docker.asc

sudo tee /etc/apt/sources.list.d/docker.sources > /dev/null <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Docker 官方文档推荐通过 apt repository 安装 Docker Engine，并安装 `docker-ce`、CLI、containerd、buildx、compose plugin。([Docker Documentation](https://docs.docker.com/engine/install/ubuntu/ "Install Docker Engine on Ubuntu | Docker Docs"))

配置 Docker 数据目录和日志轮转：

```bash
sudo mkdir -p /srv/docker

sudo tee /etc/docker/daemon.json > /dev/null <<'JSON'
{
  "data-root": "/srv/docker",
  "log-driver": "local",
  "log-opts": {
    "max-size": "20m",
    "max-file": "5"
  },
  "features": {
    "buildkit": true
  }
}
JSON

sudo systemctl restart docker
```

把 `ai` 用户加入 docker 组：

```bash
sudo usermod -aG docker ai
```

重新登录 `ai` 用户后测试：

```bash
docker run hello-world
```

---

## 7. NVIDIA Container Toolkit

安装：

```bash
sudo apt-get update
sudo apt-get install -y --no-install-recommends ca-certificates curl gnupg2

curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey \
  | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg

curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list \
  | sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' \
  | sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

sudo apt-get update
sudo apt-get install -y nvidia-container-toolkit
```

配置 Docker runtime：

```bash
sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker
```

NVIDIA 官方文档说明 `nvidia-ctk runtime configure --runtime=docker` 会修改 `/etc/docker/daemon.json`，让 Docker 使用 NVIDIA Container Runtime。([NVIDIA Docs](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html "Installing the NVIDIA Container Toolkit — NVIDIA Container Toolkit"))

测试 GPU 容器：

```bash
docker run --rm --runtime=nvidia --gpus all ubuntu nvidia-smi
```

这是 NVIDIA 官方 sample workload。([NVIDIA Docs](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/sample-workload.html "Running a Sample Workload — NVIDIA Container Toolkit"))

---

## 8. Python / PyTorch 环境策略

### 推荐策略

|场景|做法|
|---|---|
|快速实验|`uv` + `.venv`|
|PyTorch / CUDA 项目|Docker 或独立 `.venv`|
|vLLM / SGLang|独立容器或全新 `.venv`|
|Agent 项目|每个 repo 单独环境|
|长期服务|Docker Compose|

PyTorch 当前官方安装页显示 stable 版本要求 Python 3.10+，并提供 CUDA 11.8 / 12.6 / 12.8 wheel 选项；RTX 50 系列建议优先 CUDA 12.8+ 路径。([PyTorch](https://pytorch.org/ "PyTorch"))

示例：裸机项目环境

```bash
cd /srv/ai/projects
mkdir torch-test && cd torch-test

python3 -m venv .venv
source .venv/bin/activate

pip install --upgrade pip
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu128

python - <<'PY'
import torch
print(torch.__version__)
print(torch.cuda.is_available())
print(torch.cuda.get_device_name(0))
PY
```

更推荐用 `uv`：

```bash
pipx install uv

cd /srv/ai/projects
mkdir my-ai-project && cd my-ai-project

uv venv --python 3.12
source .venv/bin/activate
uv pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu128
```

---

## 9. 本地 LLM：按用途选工具

### 9.1 Ollama：最省事

适合：

- 本地聊天
    
- OpenAI-compatible 简单服务
    
- 量化模型
    
- agent 调用本地小模型
    

```bash
docker run -d \
  --gpus=all \
  -v /srv/ai/models/ollama:/root/.ollama \
  -p 11434:11434 \
  --name ollama \
  ollama/ollama
```

Ollama 官方 Docker 文档给出的 NVIDIA GPU 启动方式就是 `--gpus=all` 并挂载模型卷。([Ollama 文档](https://docs.ollama.com/docker "Docker - Ollama"))

进入容器测试：

```bash
docker exec -it ollama ollama run llama3.2
```

8GB 显存建议优先：

```text
4B / 7B / 8B Q4
embedding 模型
reranker 小模型
```

不要优先追 14B/32B。14B Q4 可能需要 CPU offload，延迟明显增加。

---

### 9.2 llama.cpp：适合 GGUF 和极限省显存

适合：

- GGUF 模型
    
- CPU+GPU 混合推理
    
- 低显存机器
    
- 本地 API server
    

llama.cpp 官方说明支持 Docker、GGUF、CUDA kernels、1.5-bit 到 8-bit 量化，并支持 CPU+GPU hybrid inference。([GitHub](https://github.com/ggml-org/llama.cpp "GitHub - ggml-org/llama.cpp: LLM inference in C/C++ · GitHub"))

建议目录：

```bash
/srv/ai/models/gguf
/srv/ai/projects/llama.cpp
```

如果自己编译：

```bash
cd /srv/ai/projects
git clone https://github.com/ggml-org/llama.cpp
cd llama.cpp

cmake -B build -DGGML_CUDA=ON
cmake --build build --config Release -j$(nproc)
```

运行示例：

```bash
./build/bin/llama-server \
  -m /srv/ai/models/gguf/model-q4.gguf \
  --host 0.0.0.0 \
  --port 8080 \
  -ngl 99
```

---

### 9.3 vLLM：只在你需要服务化/吞吐时用

vLLM 对 8GB 显存不算友好，适合小模型或实验 OpenAI-compatible server。官方文档写明 vLLM 要求 Linux、Python 3.10–3.13，NVIDIA CUDA GPU compute capability 7.5+，并且当前预编译 CUDA 二进制基于 CUDA 12.9。([vLLM](https://docs.vllm.ai/en/latest/getting_started/installation/gpu/ "GPU - vLLM"))

建议只给 vLLM 一个独立环境：

```bash
mkdir -p /srv/ai/projects/vllm-test
cd /srv/ai/projects/vllm-test

uv venv --python 3.12
source .venv/bin/activate

uv pip install vllm --torch-backend=auto
```

或 Docker：

```bash
docker run --runtime nvidia --gpus all \
  -v /srv/ai/cache/huggingface:/root/.cache/huggingface \
  -p 8000:8000 \
  --ipc=host \
  vllm/vllm-openai:latest \
  --model Qwen/Qwen3-0.6B
```

---

## 10. 推荐 Docker Compose：AI 基础服务

创建：

```bash
mkdir -p /srv/ai/compose
cd /srv/ai/compose
nano compose.yml
```

内容：

```yaml
services:
  ollama:
    image: ollama/ollama:latest
    container_name: ollama
    restart: unless-stopped
    gpus: all
    ports:
      - "11434:11434"
    volumes:
      - /srv/ai/models/ollama:/root/.ollama

  qdrant:
    image: qdrant/qdrant:latest
    container_name: qdrant
    restart: unless-stopped
    ports:
      - "6333:6333"
    volumes:
      - /srv/ai/datasets/qdrant:/qdrant/storage

  postgres:
    image: pgvector/pgvector:pg17
    container_name: pgvector
    restart: unless-stopped
    environment:
      POSTGRES_USER: ai
      POSTGRES_PASSWORD: change_me
      POSTGRES_DB: ai
    ports:
      - "5432:5432"
    volumes:
      - /srv/ai/datasets/postgres:/var/lib/postgresql/data
```

启动：

```bash
docker compose up -d
```

查看：

```bash
docker compose ps
docker logs -f ollama
```

---

## 11. Agent 隔离最佳实践

你这台机器适合做 **本地 agent workstation**，但不要让 agent 直接拥有你的整个主目录。

### 推荐目录结构

```text
/srv/ai/projects/
├── repo-a/
├── repo-b/
└── sandbox/
```

### Agent 运行规则

|项目|建议|
|---|---|
|代码目录|只挂载当前 repo|
|SSH key|不默认挂载|
|GitHub token|用 `.env` 注入，不写进镜像|
|Docker socket|不给 agent 挂 `/var/run/docker.sock`，除非你明确需要|
|网络|高风险任务用 `--network none`|
|权限|容器内用非 root 用户|
|日志|每个 agent 单独 logs 目录|

示例：

```bash
docker run --rm -it \
  --name ai-agent-repo-a \
  -v /srv/ai/projects/repo-a:/workspace \
  -w /workspace \
  --network bridge \
  node:22-bookworm \
  bash
```

如果要跑 Codex/OpenCode 类工具，可以在容器内装 Node/Python 工具链，避免污染宿主机。

---

## 12. 性能设置

### 12.1 NVIDIA 持久模式

桌面卡不一定总需要，但可以测试：

```bash
sudo nvidia-smi -pm 1
```

查看功耗和温度：

```bash
watch -n 1 nvidia-smi
nvtop
```

### 12.2 防止爆显存

常见策略：

```text
优先 Q4_K_M / Q4 量化
减少 context length
减少 batch size
不要同时跑多个大模型
embedding 和 chat 模型分开跑
用 CPU offload 作为兜底，不作为主力
```

### 12.3 32GB 内存建议

32GB 对 agent + Docker + 浏览器 + IDE + LLM 已经会紧张。建议加 swap：

```bash
sudo fallocate -l 64G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 13. 备份与恢复

最低限度：

```bash
/srv/ai/projects     必备份
/srv/ai/secrets      必备份，加密
/srv/ai/compose      必备份
/srv/ai/models       可选，模型可重下
/srv/docker          不建议直接备份
```

推荐：

```bash
sudo apt install -y restic
```

备份到外接硬盘或 NAS：

```bash
restic init --repo /media/backup/ai-restic

restic -r /media/backup/ai-restic backup \
  /srv/ai/projects \
  /srv/ai/compose \
  /srv/ai/secrets
```

---

## 14. 不建议做的事

```text
不要把所有 AI 包装到宿主机 Python
不要 sudo pip install
不要混用 NVIDIA .run、Ubuntu 驱动、第三方 PPA
不要把 daily user 加入 docker 组
不要让 agent 直接访问整个 /home
不要把 API key 写进 Dockerfile 或 git repo
不要期待 8GB 显存流畅跑 32B/70B
不要把 Docker 数据留在默认 /var/lib/docker 直到根分区爆掉
```

---

## 15. 最终推荐安装顺序

```text
1. BIOS 设置
2. Ubuntu 26.04 更新
3. NVIDIA 驱动：ubuntu-drivers install
4. nvidia-smi 验证
5. 创建 /srv/ai 和 ai 用户
6. 安装 Docker Engine
7. Docker data-root 指到 /srv/docker
8. 安装 NVIDIA Container Toolkit
9. docker --gpus all 验证
10. 安装 Ollama / llama.cpp / vLLM
11. 每个项目使用 Docker 或 uv venv
12. 配置备份
```

你的机器建议定位为：

```text
本地 AI agent 开发工作站
+ 7B/8B 量化模型推理
+ RAG / embedding / rerank
+ 小规模 LoRA / PyTorch 实验
+ Docker 化工具链
```

不建议定位为：

```text
大模型训练机
70B 本地推理机
多用户 GPU server
高吞吐生产推理节点
```