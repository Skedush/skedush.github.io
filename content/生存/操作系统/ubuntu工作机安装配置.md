下面是合并后的 **最终最佳实践安装配置流程**。  
前提：**清空 1TB SSD，单系统安装 Ubuntu 26.04 Desktop，不保留 Windows**。如果你要双系统，这套分区方案要改。

---

# 0. 最终架构

你的机器：

```text
RTX 5060 8GB
Intel Ultra 7 265K
DDR5 6400 32GB
1TB SSD
Ubuntu 26.04 Desktop
```

推荐工作站架构：

```text
Ubuntu 宿主机
├── NVIDIA Driver
├── Docker Engine
├── NVIDIA Container Toolkit
├── ai 独立用户
│   ├── mise        管 Python / Node / Go / Rust / uv / pnpm / CLI 工具版本
│   ├── uv          管 Python 项目依赖、venv、lockfile
│   ├── Docker      跑 Ollama / Qdrant / Postgres / Open WebUI / vLLM
│   └── /srv/ai     放模型、项目、数据、缓存
└── 日常用户         用于桌面、浏览器、IDE
```

核心原则：

```text
宿主机保持干净
AI 服务 Docker 化
开发工具 mise 管
Python 项目 uv 管
agent 只访问单个项目目录
模型、缓存、数据库全部放 /srv/ai
```

---

# 1. 安装前准备

## 1.1 下载 Ubuntu 26.04 Desktop ISO

下载 Ubuntu 26.04 LTS Desktop ISO，制作启动 U 盘。Ubuntu 官方桌面安装文档支持手动分区，适合你这种需要 `/srv/ai` 独立数据区的工作站配置。([Ubuntu 文档](https://documentation.ubuntu.com/desktop/en/latest/tutorial/install-ubuntu-desktop/?utm_source=chatgpt.com "Install Ubuntu Desktop"))

Windows 制作启动盘建议：

```text
Rufus
Partition scheme: GPT
Target system: UEFI
File system: FAT32
Write mode: ISO mode
```

Linux/macOS 可用：

```text
balenaEtcher
Ubuntu Startup Disk Creator
dd
```

---

# 2. BIOS / UEFI 设置

进 BIOS，一般按：

```text
DEL / F2
```

建议设置：

```text
Boot Mode: UEFI Only
CSM: Disabled
Secure Boot: Disabled
Resizable BAR: Enabled
Above 4G Decoding: Enabled
Intel VT-x: Enabled
Intel VT-d: Enabled
XMP / EXPO: Enabled
Primary Display: PCIe / PEG
```

说明：

```text
Secure Boot 先关闭，避免 NVIDIA 驱动签名/MOK 问题
Resizable BAR 和 Above 4G Decoding 对新显卡更友好
VT-x / VT-d 后续方便容器、虚拟化、沙箱
```

---

# 3. 分区方案

1TB SSD 推荐这样分：

|分区|大小|文件系统|挂载点|用途|
|---|--:|---|---|---|
|EFI|1GB|FAT32|`/boot/efi`|UEFI 启动|
|root|150GB|ext4|`/`|系统、驱动、基础工具|
|swap|64GB|swap|无|内存缓冲|
|home|120GB|ext4|`/home`|日常用户配置|
|ai-data|剩余全部|ext4|`/srv/ai`|模型、数据、项目、缓存|
|docker-data|不单独分区|目录|`/srv/docker`|Docker 镜像和容器层|

最终大约：

```text
/dev/nvme0n1p1   1GB      FAT32   /boot/efi
/dev/nvme0n1p2   150GB    ext4    /
/dev/nvme0n1p3   64GB     swap
/dev/nvme0n1p4   120GB    ext4    /home
/dev/nvme0n1p5   ~696GB   ext4    /srv/ai
```

为什么这样分：

```text
/ 不容易被 Docker 和模型撑爆
/home 和 AI 数据分离
/srv/ai 可以保留或单独备份
swap 不能替代显存，但能防止内存爆掉时系统直接死机
```

---

# 4. 安装 Ubuntu

启动 U 盘后：

```text
Install Ubuntu
→ 选择语言
→ 连接网络
→ 勾选第三方驱动/媒体支持
→ 选择 Manual partitioning
```

手动创建上面的分区。

用户创建建议：

```text
Username: zzzxc
Computer name: ai-workstation
```

不要把第一个用户叫 `ai`。  
后面我们会单独创建一个隔离的 `ai` 用户。

安装完成后重启，拔掉 U 盘。

---

# 5. 首次启动基础检查

登录日常用户后：

```bash
lsblk -f
df -h
swapon --show
```

确认有：

```text
/
/home
/srv/ai
/boot/efi
swap
```

然后更新系统：

```bash
sudo apt update
sudo apt full-upgrade -y
sudo reboot
```

---

# 6. 安装基础工具

重启后执行：

```bash
sudo apt update

sudo apt install -y \
  build-essential git curl wget unzip jq \
  ca-certificates gnupg lsb-release \
  htop btop nvtop tmux tree ripgrep fd-find \
  python3 python3-venv python3-pip pipx direnv \
  openssh-client rsync \
  linux-headers-$(uname -r)
```

这里 **宿主机保留系统 Python** 是对的。  
但规则是：

```text
可以安装 python3 / python3-venv / python3-pip
不要 sudo pip install
不要把 torch / transformers / langchain 装到系统 Python
```

---

# 7. 安装 NVIDIA 驱动

先查看推荐驱动：

```bash
ubuntu-drivers devices
```

安装推荐驱动：

```bash
sudo ubuntu-drivers install
sudo reboot
```

重启后检查：

```bash
nvidia-smi
```

你应该看到 RTX 5060。

此时先不要急着装完整 CUDA Toolkit。NVIDIA 官方 CUDA Linux 安装指南推荐优先使用包管理器安装方式；对你的用途，宿主机先有驱动即可，PyTorch/Ollama/vLLM 多数运行时依赖可以放在 venv 或容器里。([NVIDIA Docs](https://docs.nvidia.com/cuda/cuda-installation-guide-linux/?utm_source=chatgpt.com "CUDA Installation Guide for Linux"))

---

# 8. 创建 AI 隔离用户和目录

创建 `ai` 用户：

```bash
sudo adduser ai
sudo usermod -aG video,render ai
```

准备目录：

```bash
sudo mkdir -p /srv/ai/{projects,models,datasets,compose,secrets}
sudo mkdir -p /srv/ai/cache/{huggingface,torch,uv,pip,npm,ollama}
sudo mkdir -p /srv/docker

sudo chown -R ai:ai /srv/ai
```

目录结构：

```text
/srv/ai/
├── projects        # 代码项目
├── models          # 模型文件
├── datasets        # 数据集、向量库、数据库
├── compose         # Docker Compose 配置
├── secrets         # 本地密钥
└── cache
    ├── huggingface
    ├── torch
    ├── uv
    ├── pip
    ├── npm
    └── ollama
```

---

# 9. 安装 Docker Engine

不要装 Docker Desktop。  
使用 Docker 官方 apt 源安装 Docker Engine。Docker 官方 Ubuntu 安装文档推荐安装 `docker-ce`、`docker-ce-cli`、`containerd.io`、`docker-buildx-plugin` 和 `docker-compose-plugin`。([Docker Documentation](https://docs.docker.com/engine/install/ubuntu/?utm_source=chatgpt.com "Install Docker Engine on Ubuntu"))

## 9.1 卸载可能冲突的旧包

```bash
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do
  sudo apt remove -y $pkg
done
```

## 9.2 添加 Docker 官方源

```bash
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
```

## 9.3 安装 Docker

```bash
sudo apt install -y \
  docker-ce \
  docker-ce-cli \
  containerd.io \
  docker-buildx-plugin \
  docker-compose-plugin
```

测试：

```bash
sudo docker run hello-world
```

---

# 10. 把 Docker 数据目录移到 `/srv/docker`

默认 Docker 会放在：

```text
/var/lib/docker
```

这会占用 `/` 分区。你应该改到：

```text
/srv/docker
```

执行：

```bash
sudo systemctl stop docker

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

sudo systemctl start docker
```

检查：

```bash
docker info | grep "Docker Root Dir"
```

应该看到：

```text
Docker Root Dir: /srv/docker
```

只把 `ai` 用户加入 Docker 组：

```bash
sudo usermod -aG docker ai
```

Docker 官方文档说明，`docker` 组拥有接近 root 的权限，所以不要随便把日常用户也加入 docker 组。([Docker Documentation](https://docs.docker.com/engine/install/linux-postinstall/?utm_source=chatgpt.com "Linux post-installation steps for Docker Engine"))

重新登录 `ai` 用户后测试：

```bash
su - ai
docker run hello-world
```

---

# 11. 安装 NVIDIA Container Toolkit

Docker 装好后，再装 NVIDIA Container Toolkit。NVIDIA 官方文档说明，Docker 需要通过 `nvidia-ctk runtime configure --runtime=docker` 配置后，容器才能使用 NVIDIA Container Runtime。([NVIDIA Docs](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html?utm_source=chatgpt.com "Installing the NVIDIA Container Toolkit"))

切回有 sudo 权限的日常用户，执行：

```bash
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey \
  | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg

curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list \
  | sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' \
  | sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

sudo apt update
sudo apt install -y nvidia-container-toolkit
```

配置 Docker runtime：

```bash
sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker
```

测试 GPU 容器：

```bash
docker run --rm --gpus all ubuntu nvidia-smi
```

如果容器里能看到 RTX 5060，GPU 容器环境完成。

---

# 12. 安装 mise

从这里开始都在 `ai` 用户下做。

```bash
su - ai
```

安装 mise：

```bash
curl https://mise.run | sh
```

启用 bash：

```bash
echo 'eval "$(~/.local/bin/mise activate bash)"' >> ~/.bashrc
source ~/.bashrc
```

检查：

```bash
mise doctor
mise --version
```

mise 官方定位是把项目工具、环境变量和任务统一放进 `mise.toml`；它也支持从 npm、pipx、core、aqua、GitHub 等后端安装工具。([GitHub](https://github.com/jdx/mise?utm_source=chatgpt.com "jdx/mise: dev tools, env vars, task runner"))

---

# 13. 用 mise 安装开发工具

在 `ai` 用户下：

```bash
mise use --global python@3.12
mise use --global node@22
mise use --global uv@latest
mise use --global pnpm@latest
mise use --global go@latest
mise use --global rust@latest
```

检查：

```bash
python --version
node --version
uv --version
pnpm --version
go version
rustc --version
```

你的工具分工：

```text
mise   管工具版本
uv     管 Python 项目依赖
Docker 管长期服务和隔离环境
```

uv 官方定位是快速 Python 包和项目管理器，可替代常见的 pip、pip-tools、virtualenv 类工作流。([Astral Docs](https://docs.astral.sh/uv/?utm_source=chatgpt.com "uv"))

---

# 14. 配置 `ai` 用户环境变量

```bash
cat >> ~/.bashrc <<'EOF'

# AI workstation paths
export HF_HOME=/srv/ai/cache/huggingface
export TRANSFORMERS_CACHE=/srv/ai/cache/huggingface
export TORCH_HOME=/srv/ai/cache/torch
export UV_CACHE_DIR=/srv/ai/cache/uv
export PIP_CACHE_DIR=/srv/ai/cache/pip
export NPM_CONFIG_CACHE=/srv/ai/cache/npm

# Ollama
export OLLAMA_HOST=127.0.0.1:11434
EOF

source ~/.bashrc
```

---

# 15. Docker Compose：AI 基础服务

创建：

```bash
cd /srv/ai/compose
nano compose.yml
```

写入：

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

  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: open-webui
    restart: unless-stopped
    ports:
      - "3000:8080"
    environment:
      OLLAMA_BASE_URL: http://ollama:11434
    volumes:
      - /srv/ai/datasets/open-webui:/app/backend/data
    depends_on:
      - ollama

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
      POSTGRES_PASSWORD: change_this_password
      POSTGRES_DB: ai
    ports:
      - "5432:5432"
    volumes:
      - /srv/ai/datasets/postgres:/var/lib/postgresql/data
```

启动：

```bash
docker compose up -d
docker compose ps
```

Ollama 官方 Docker 文档给出的 NVIDIA GPU 方式是 `--gpus=all`，并挂载模型目录到 `/root/.ollama`；上面的 compose 就是这个思路。([Ollama 文档](https://docs.ollama.com/docker?utm_source=chatgpt.com "Docker"))

测试 Ollama：

```bash
docker exec -it ollama ollama run qwen2.5:3b
```

或者：

```bash
docker exec -it ollama ollama run llama3.2
```

浏览器打开：

```text
http://localhost:3000
```

RTX 5060 8GB 建议模型级别：

```text
3B / 4B：体验较好
7B / 8B Q4：可用
14B Q4：可能需要 CPU offload，速度下降
32B / 70B：不建议作为本地主力
```

---

# 16. Python + PyTorch 项目模板

创建测试项目：

```bash
cd /srv/ai/projects
mkdir torch-test
cd torch-test
```

初始化：

```bash
uv init .
```

创建 `mise.toml`：

```bash
nano mise.toml
```

内容：

```toml
[tools]
python = "3.12"
uv = "latest"
node = "22"
pnpm = "latest"

[env]
HF_HOME = "/srv/ai/cache/huggingface"
TRANSFORMERS_CACHE = "/srv/ai/cache/huggingface"
TORCH_HOME = "/srv/ai/cache/torch"
UV_CACHE_DIR = "/srv/ai/cache/uv"
PIP_CACHE_DIR = "/srv/ai/cache/pip"
NPM_CONFIG_CACHE = "/srv/ai/cache/npm"

[tasks.install]
description = "Install Python dependencies"
run = "uv sync"

[tasks.add-torch]
description = "Install PyTorch CUDA wheel"
run = "uv add torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu128"

[tasks.check-cuda]
description = "Check PyTorch CUDA"
run = '''
uv run python - <<'PY'
import torch
print("torch:", torch.__version__)
print("cuda available:", torch.cuda.is_available())
if torch.cuda.is_available():
    print("gpu:", torch.cuda.get_device_name(0))
PY
'''

[tasks.run]
description = "Run main app"
run = "uv run python main.py"

[tasks.test]
description = "Run tests"
run = "uv run pytest"

[tasks.fmt]
description = "Format"
run = "uv run ruff format ."

[tasks.lint]
description = "Lint"
run = "uv run ruff check ."
```

信任项目：

```bash
mise trust
mise install
```

安装 PyTorch：

```bash
mise run add-torch
```

检查 CUDA：

```bash
mise run check-cuda
```

PyTorch 官方安装页会按系统、包管理器和 CUDA 版本生成安装命令；你这里优先用 CUDA 12.8 wheel 路径。([PyTorch](https://pytorch.org/get-started/locally/?utm_source=chatgpt.com "Get Started"))

---

# 17. Agent 项目隔离模板

以后每个 agent 项目都放在：

```text
/srv/ai/projects/project-name
```

不要让 agent 直接访问：

```text
/home
~/.ssh
/srv/ai/secrets
/var/run/docker.sock
```

安全运行一个 Node/Python 沙箱示例：

```bash
docker run --rm -it \
  --name agent-sandbox \
  -v /srv/ai/projects/project-name:/workspace \
  -w /workspace \
  --network bridge \
  node:22-bookworm \
  bash
```

更严格，不给网络：

```bash
docker run --rm -it \
  --name agent-sandbox-nonet \
  -v /srv/ai/projects/project-name:/workspace \
  -w /workspace \
  --network none \
  node:22-bookworm \
  bash
```

原则：

```text
普通 coding agent：只挂当前 repo
需要联网安装依赖：临时开 network bridge
高风险执行：--network none
不要挂 Docker socket
不要挂 SSH key
API key 用 .env，本地 chmod 600
```

---

# 18. 可选：安装 CUDA Toolkit

默认不装完整 CUDA Toolkit。  
只有这些场景才装：

```text
需要 nvcc
需要编译 CUDA extension
需要自己编译 llama.cpp CUDA
需要开发 CUDA kernel
```

Ubuntu 26.04 官方说明 CUDA Toolkit 已在 Ubuntu Archives 中可用；Canonical 也把 26.04 的 AI/ML 工具链支持作为发布重点之一。([Ubuntu 文档](https://documentation.ubuntu.com/release-notes/26.04/summary-for-lts-users/?utm_source=chatgpt.com "Ubuntu 26.04 LTS summary"))

检查包：

```bash
apt-cache search '^cuda-toolkit'
apt-cache policy cuda-toolkit
```

安装：

```bash
sudo apt install -y cuda-toolkit
```

检查：

```bash
nvcc --version
```

---

# 19. 备份策略

必须备份：

```text
/srv/ai/projects
/srv/ai/compose
/srv/ai/secrets
/home/你的用户/.ssh
```

可选备份：

```text
/srv/ai/models
/srv/ai/datasets
```

不建议直接备份：

```text
/srv/docker
```

安装 restic：

```bash
sudo apt install -y restic
```

示例：

```bash
restic init --repo /media/backup/ai-restic

restic -r /media/backup/ai-restic backup \
  /srv/ai/projects \
  /srv/ai/compose \
  /srv/ai/secrets
```

---

# 20. 日常维护命令

系统更新：

```bash
sudo apt update
sudo apt full-upgrade -y
```

Docker 清理：

```bash
docker system df
docker image prune
docker builder prune
```

不要随便执行：

```bash
docker system prune -a --volumes
```

这会删掉很多缓存和未使用卷。

查看 GPU：

```bash
nvidia-smi
nvtop
```

查看服务：

```bash
cd /srv/ai/compose
docker compose ps
docker compose logs -f ollama
```

更新 mise 工具：

```bash
mise upgrade
mise list
```

更新 uv 项目依赖：

```bash
cd /srv/ai/projects/某项目
uv sync
uv lock --upgrade
```

---

# 21. 最终验收清单

全部做完后，逐条检查：

```bash
lsblk -f
df -h
swapon --show
nvidia-smi
docker info | grep "Docker Root Dir"
docker run --rm --gpus all ubuntu nvidia-smi
```

切到 `ai` 用户：

```bash
su - ai
mise doctor
python --version
node --version
uv --version
docker run hello-world
```

检查 AI 服务：

```bash
cd /srv/ai/compose
docker compose ps
docker exec -it ollama ollama list
```

浏览器检查：

```text
http://localhost:3000
```

---

# 22. 最终安装顺序总表

按这个顺序执行：

```text
1. 制作 Ubuntu 26.04 Desktop 启动盘
2. BIOS 设置：
   UEFI Only
   Secure Boot Disabled
   Resizable BAR Enabled
   Above 4G Decoding Enabled
   VT-x / VT-d Enabled
   XMP Enabled

3. 手动分区：
   /boot/efi   1GB
   /           150GB
   swap        64GB
   /home       120GB
   /srv/ai     剩余全部

4. 安装 Ubuntu
5. 首次启动后 apt full-upgrade
6. 安装基础工具包
7. 安装 NVIDIA 驱动
8. nvidia-smi 验证
9. 创建 ai 用户
10. 创建 /srv/ai 和 /srv/docker
11. 安装 Docker Engine
12. Docker data-root 改到 /srv/docker
13. ai 用户加入 docker 组
14. 安装 NVIDIA Container Toolkit
15. docker --gpus all 验证
16. ai 用户安装 mise
17. mise 安装 python/node/uv/pnpm/go/rust
18. 配置 AI 缓存路径
19. Docker Compose 启动 Ollama / Open WebUI / Qdrant / pgvector
20. Python 项目用 mise.toml + uv
21. agent 只挂载单项目目录
22. 配置备份
```

你的最佳体验组合就是：

```text
Ubuntu 26.04 + NVIDIA Driver
Docker + NVIDIA Container Toolkit
mise + uv
/srv/ai 独立数据区
Ollama + Open WebUI + Qdrant + pgvector
每个项目独立 mise.toml + uv.lock
agent 容器隔离运行
```

这套结构比较稳，后面要卸载、迁移、重装、扩展都不会太痛苦。