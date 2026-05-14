下面是最终版：**Windows 原生 + uv + ComfyUI Portable + Pixelle-Video 源码部署**。

目标：

```text
不装系统 Python
不装 Docker
不放 WSL
不全局 pip install
ComfyUI 自带 Python
Pixelle-Video 由 uv 管 Python 和依赖
```

---

# 方案总览

```text
D:\AI\
├─ apps\
│  ├─ ComfyUI_windows_portable\
│  └─ Pixelle-Video\
│
├─ data\
│  ├─ models\
│  │  ├─ checkpoints\
│  │  ├─ loras\
│  │  ├─ vae\
│  │  └─ controlnet\
│  │
│  ├─ outputs\
│  │  ├─ comfyui\
│  │  └─ pixelle\
│  │
│  └─ assets\
│     ├─ bgm\
│     └─ fonts\
│
└─ scripts\
   ├─ start-comfyui.ps1
   ├─ start-pixelle.ps1
   └─ start-all.ps1
```

---

# 1. 安装必要工具

你已有 Git，所以只需要装：

```text
uv
FFmpeg
```

## 1.1 安装 uv

PowerShell 执行：

```powershell
winget install astral-sh.uv
```

关闭 PowerShell，重新打开，然后检查：

```powershell
uv --version
```

`uv` 支持安装和管理 Python 版本，所以你不需要另外装系统 Python。官方文档也说明可以用 `uv python install 3.12` 这类命令安装指定 Python 版本。([Astral](https://docs.astral.sh/uv/guides/install-python/?utm_source=chatgpt.com "Installing and managing Python | uv"))

---

## 1.2 安装 FFmpeg

```powershell
winget install -e --id Gyan.FFmpeg
```

关闭 PowerShell，重新打开，检查：

```powershell
ffmpeg -version
```

---

# 2. 创建目录

PowerShell：

```powershell
mkdir D:\AI
mkdir D:\AI\apps
mkdir D:\AI\data
mkdir D:\AI\data\models
mkdir D:\AI\data\models\checkpoints
mkdir D:\AI\data\models\loras
mkdir D:\AI\data\models\vae
mkdir D:\AI\data\models\controlnet
mkdir D:\AI\data\outputs
mkdir D:\AI\data\outputs\comfyui
mkdir D:\AI\data\outputs\pixelle
mkdir D:\AI\data\assets
mkdir D:\AI\data\assets\bgm
mkdir D:\AI\data\assets\fonts
mkdir D:\AI\scripts
```

---

# 3. 安装 ComfyUI Portable

下载官方 **ComfyUI Portable Windows**，解压到：

```text
D:\AI\apps\ComfyUI_windows_portable
```

ComfyUI Portable 是 Windows 独立打包版本，内置 `python_embeded`，解压即可使用，并支持 NVIDIA GPU 或 CPU。([ComfyUI Docs](https://docs.comfy.org/installation/comfyui_portable_windows?utm_source=chatgpt.com "ComfyUI(portable) Windows — Local Self-Hosted"))

解压后目录应该类似：

```text
D:\AI\apps\ComfyUI_windows_portable\
├─ ComfyUI\
├─ python_embeded\
├─ run_nvidia_gpu.bat
└─ run_cpu.bat
```

---

# 4. 配置 ComfyUI 低显存启动

你的 RTX 5060 8GB 建议用低显存模式。

创建文件：

```text
D:\AI\scripts\start-comfyui.ps1
```

内容：

```powershell
cd D:\AI\apps\ComfyUI_windows_portable

.\python_embeded\python.exe -s ComfyUI\main.py `
  --windows-standalone-build `
  --lowvram `
  --preview-method none
```

如果之后 SDXL 仍然爆显存，把脚本改成：

```powershell
cd D:\AI\apps\ComfyUI_windows_portable

.\python_embeded\python.exe -s ComfyUI\main.py `
  --windows-standalone-build `
  --lowvram `
  --cpu-vae `
  --preview-method none
```

启动测试：

```powershell
powershell -ExecutionPolicy Bypass -File D:\AI\scripts\start-comfyui.ps1
```

浏览器打开：

```text
http://127.0.0.1:8188
```

---

# 5. 配置 ComfyUI 模型目录

打开：

```text
D:\AI\apps\ComfyUI_windows_portable\ComfyUI\
```

如果有：

```text
extra_model_paths.yaml.example
```

复制一份，改名为：

```text
extra_model_paths.yaml
```

写入：

```yaml
my_models:
  base_path: D:\AI\data\models
  checkpoints: checkpoints
  loras: loras
  vae: vae
  controlnet: controlnet
```

以后模型统一放：

```text
D:\AI\data\models\checkpoints
D:\AI\data\models\loras
D:\AI\data\models\vae
D:\AI\data\models\controlnet
```

---

# 6. 准备第一个生图模型

第一阶段只装一个模型，别装太多。

建议二选一：

```text
SDXL Lightning / SDXL Turbo：推荐
SD1.5：最稳、最省显存
```

模型文件放到：

```text
D:\AI\data\models\checkpoints
```

先在 ComfyUI 里确认能生成一张图。

推荐测试参数：

```text
SD1.5:
512×768
steps 20
batch 1

SDXL Lightning:
768×1024
steps 4–8
batch 1
```

---

# 7. 安装 Pixelle-Video

Pixelle-Video 官方文档要求 Python 3.10+，推荐使用 uv；官方 GitHub 也给出的启动方式是 `uv run streamlit run web/app.py`，启动后打开 `http://localhost:8501`，首次使用需要在系统配置里填写 LLM 和图像生成服务。([AIDC AI](https://aidc-ai.github.io/Pixelle-Video/zh/getting-started/installation/?utm_source=chatgpt.com "安装- Pixelle-Video"))

## 7.1 克隆项目

```powershell
cd D:\AI\apps

git clone https://github.com/AIDC-AI/Pixelle-Video.git

cd D:\AI\apps\Pixelle-Video
```

---

## 7.2 用 uv 安装 Python 3.11

```powershell
uv python install 3.11
```

检查 uv 管理的 Python：

```powershell
uv python list
```

---

## 7.3 创建 Pixelle-Video 虚拟环境

```powershell
uv venv --python 3.11
```

这会在项目里生成：

```text
D:\AI\apps\Pixelle-Video\.venv
```

---

## 7.4 安装依赖

优先执行：

```powershell
uv sync
```

如果 `uv sync` 报错，再执行：

```powershell
uv pip install -e .
```

---

# 8. 启动 Pixelle-Video

创建脚本：

```text
D:\AI\scripts\start-pixelle.ps1
```

内容：

```powershell
cd D:\AI\apps\Pixelle-Video

uv run streamlit run web/app.py
```

启动：

```powershell
powershell -ExecutionPolicy Bypass -File D:\AI\scripts\start-pixelle.ps1
```

打开：

```text
http://localhost:8501
```

---

# 9. 创建一键启动脚本

创建：

```text
D:\AI\scripts\start-all.ps1
```

内容：

```powershell
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy Bypass", "-File D:\AI\scripts\start-comfyui.ps1"

Start-Sleep -Seconds 10

Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy Bypass", "-File D:\AI\scripts\start-pixelle.ps1"
```

以后启动整套：

```powershell
powershell -ExecutionPolicy Bypass -File D:\AI\scripts\start-all.ps1
```

---

# 10. Pixelle-Video Web 配置

打开：

```text
http://localhost:8501
```

进入：

```text
⚙️ 系统配置
```

---

## 10.1 LLM 配置

低成本推荐 DeepSeek：

```text
Provider: OpenAI Compatible
Base URL: https://api.deepseek.com
Model: deepseek-chat
API Key: 你的 DeepSeek API Key
```

或者 Qwen：

```text
Provider: OpenAI Compatible
Base URL: https://dashscope.aliyuncs.com/compatible-mode/v1
Model: qwen-plus
API Key: 你的 DashScope API Key
```

---

## 10.2 图像配置

ComfyUI 地址填：

```text
http://127.0.0.1:8188
```

注意：你不是 Docker 部署，所以不要填：

```text
http://host.docker.internal:8188
```

---

## 10.3 TTS 配置

选择：

```text
Edge-TTS
```

推荐中文女声：

```text
zh-CN-XiaoxiaoNeural
```

推荐中文男声：

```text
zh-CN-YunxiNeural
```

---

# 11. 第一条视频测试

主题：

```text
用45秒讲清楚什么是AI Agent
```

推荐参数：

```text
视频比例：9:16
输出分辨率：720×1280
分镜数：4–6
时长：30–45秒
风格：科技感
图像生成：ComfyUI
TTS：Edge-TTS
视频方式：静态图转场 / 图文口播
```

你的 RTX 5060 8GB 先不要开：

```text
WAN
CogVideoX
HunyuanVideo
Flux Dev 高分辨率
1080×1920 原生生图
batch > 1
多个 ControlNet
```

---

# 12. 日常使用流程

以后每天只需要：

```powershell
powershell -ExecutionPolicy Bypass -File D:\AI\scripts\start-all.ps1
```

然后打开：

```text
ComfyUI:
http://127.0.0.1:8188

Pixelle-Video:
http://localhost:8501
```

---

# 13. 关键检查命令

```powershell
git --version
uv --version
ffmpeg -version
```

不要用全局：

```powershell
python --version
pip --version
```

Pixelle-Video 里检查 Python：

```powershell
cd D:\AI\apps\Pixelle-Video
uv run python --version
```

应该显示：

```text
Python 3.11.x
```

---

# 14. 常见问题

## uv 找不到

重开 PowerShell。

```powershell
uv --version
```

还不行：

```powershell
winget install astral-sh.uv
```

---

## ffmpeg 找不到

重开 PowerShell。

```powershell
ffmpeg -version
```

还不行：

```powershell
winget install -e --id Gyan.FFmpeg
```

---

## Pixelle-Video 依赖安装失败

进入项目：

```powershell
cd D:\AI\apps\Pixelle-Video
```

清理环境：

```powershell
Remove-Item -Recurse -Force .venv
```

重建：

```powershell
uv venv --python 3.11
uv sync
```

如果还失败：

```powershell
uv pip install -e .
```

---

## ComfyUI 爆显存

按顺序处理：

```text
1. batch = 1
2. 分辨率降到 768×1024 或 512×768
3. 启动参数加 --lowvram
4. 还爆就加 --cpu-vae
5. 换 SD1.5 / SDXL Lightning
```

---

## Pixelle-Video 连不上 ComfyUI

确认 ComfyUI 能打开：

```text
http://127.0.0.1:8188
```

Pixelle-Video 里填：

```text
http://127.0.0.1:8188
```

---

# 最终部署选择

你这台电脑就用这套：

```text
Git：已有
uv：winget 安装
Python 3.11：uv 管理
FFmpeg：winget 安装
ComfyUI：Portable，自带 Python
Pixelle-Video：uv .venv
模型：D:\AI\data\models
输出：D:\AI\data\outputs
```

这就是当前最少污染、最容易维护、最适合你 RTX 5060 8GB 的 Pixelle-Video 实现方案。