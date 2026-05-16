# 从全新 macOS 用户开始搭建 AI Agent Workstation

> 目标：把 Mac 配置成一个稳定、安全、可远程控制的 AI agent 工作站。  
> 推荐架构：**Windows 做驾驶舱，Mac 的专用 `ai` 用户做 agent 运行环境，主 Mac 用户只做日常和系统管理。**

---

## 0. 最终架构

```text
Windows
  ├─ Windows Terminal
  ├─ VSCode Remote SSH
  └─ Codex Remote / 浏览器 / 控制台

Mac 管理员主账号
  ├─ 日常 GUI
  ├─ 系统设置
  ├─ 安装系统软件
  └─ 不直接跑 agent

Mac ai 用户（标准用户）
  ├─ ~/projects       # 项目代码
  ├─ ~/agents         # Hermes / OpenHuman / OpenClaw 等
  ├─ ~/secrets        # API keys / tokens
  ├─ ~/sandbox        # 临时实验区
  ├─ ~/logs           # 日志
  ├─ tmux             # 常驻会话
  ├─ Codex            # coding agent
  ├─ Hermes           # 长期任务 / 自动化 agent
  ├─ OpenHuman        # 个人上下文 / memory / connector
  └─ OpenClaw         # agent/tool/plugin workflow
```

核心原则：

```text
主账号 = 私人身份 / 日常浏览器 / Apple ID / Google 主号
ai用户 = agent身份 / 项目代码 / agent runtime / 独立密钥
```

---

## 1. 创建新的 macOS 用户

### 1.1 创建 `ai` 用户

在 Mac 管理员主账号中：

```text
系统设置 → 用户与群组 → 添加用户
```

建议：

```text
用户名：ai
用户类型：标准用户
```

不要设成管理员。  
除非后续有非常明确的需求，否则不要给 `ai` 用户长期 sudo 权限。

### 1.2 开启远程登录 SSH

```text
系统设置 → 通用 → 共享 → 远程登录
```

允许：

```text
ai 用户可以远程登录
```

如果你只允许部分用户登录，确保 `ai` 在允许列表中。

---

## 2. 进入 `ai` 用户

推荐从管理员主账号进入：

```bash
ssh ai@localhost
```

或者从 Windows 进入：

```powershell
ssh ai@<mac-ip>
```

确认当前身份：

```bash
whoami
echo $HOME
```

应该看到：

```text
ai
/Users/ai
```

---

## 3. 基础目录结构

在 `ai` 用户中执行：

```bash
mkdir -p ~/projects
mkdir -p ~/agents
mkdir -p ~/sandbox
mkdir -p ~/secrets
mkdir -p ~/logs

chmod 700 ~/secrets
```

目录用途：

```text
~/projects  = 所有代码项目
~/agents    = agent 程序和长期服务
~/sandbox   = 临时测试、实验、agent 草稿
~/secrets   = API keys / tokens / 凭据
~/logs      = agent 日志
```

不要把密钥放进：

```text
~/projects
/Users/Shared
Git 仓库
```

---

## 4. Shell 初始化

macOS 默认 shell 通常是 zsh。

确认：

```bash
echo $SHELL
```

如果是：

```text
/bin/zsh
```

继续即可。

准备配置文件：

```bash
touch ~/.zshrc ~/.zprofile
```

---

## 5. Homebrew

### 5.1 使用系统已有 Homebrew

你的 Intel Mac 通常是：

```text
/usr/local/bin/brew
```

检查：

```bash
which brew
brew --version
```

如果找不到 brew，先在管理员主账号安装 Homebrew，或确认 `/usr/local/bin` 是否在 PATH 中。

给 `ai` 用户加入 brew shellenv：

```bash
echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zprofile
echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zshrc
source ~/.zshrc
```

验证：

```bash
brew --version
```

### 5.2 基础工具

```bash
brew install git curl wget jq ripgrep fd fzf htop tmux tree direnv gh
```

这些工具用途：

```text
git      = 代码版本管理
gh       = GitHub CLI
jq       = JSON 处理
ripgrep  = 快速搜索代码
fd       = 快速找文件
fzf      = 模糊搜索
htop     = 观察资源占用
tmux     = agent 常驻终端会话
tree     = 查看目录结构
direnv   = 项目级环境变量自动加载
```

---

## 6. 语言版本管理：mise

推荐用 `mise` 管理 Node、Python、Go、Rust 等版本。

安装：

```bash
brew install mise
```

启用：

```bash
echo 'eval "$(mise activate zsh)"' >> ~/.zshrc
source ~/.zshrc
```

安装常用语言：

```bash
mise use -g node@lts
mise use -g python@3.12
mise use -g go@latest
mise use -g rust@latest
```

检查：

```bash
node -v
python --version
go version
rustc --version
```

推荐理由：

```text
一个工具管理多语言
每个项目可以用 .mise.toml 固定版本
适合 agent 同时处理多个技术栈
比到处混用 nvm / pyenv / asdf 更清晰
```

---

## 7. Python 环境：uv

推荐：

```text
mise 管 Python 版本
uv 管 Python 项目依赖
```

安装：

```bash
brew install uv
```

检查：

```bash
uv --version
```

### 7.1 Python 项目用法

进入项目：

```bash
cd ~/projects/your-python-project
```

创建虚拟环境：

```bash
uv venv
source .venv/bin/activate
```

安装依赖：

```bash
uv pip install -r requirements.txt
```

新项目：

```bash
uv init
uv add openai anthropic fastapi pydantic python-dotenv
```

建议：

```text
不要全局 pip install 一堆包
不要把 venv 放到主账号
每个项目独立 .venv
```

---

## 8. Node 环境：Corepack + pnpm

启用 Corepack：

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

检查：

```bash
node -v
npm -v
pnpm -v
```

Node 项目：

```bash
cd ~/projects/your-node-project
pnpm install
pnpm dev
```

如果项目只支持 npm：

```bash
npm install
npm run dev
```

建议：

```text
项目依赖走 pnpm/npm
全局 CLI 尽量少装
全局 agent CLI 可以装，但要定期整理
```

---

## 9. Git 与 GitHub

### 9.1 基础 Git 配置

```bash
git config --global user.name "ai-agent"
git config --global user.email "your-agent-email@example.com"
git config --global init.defaultBranch main
git config --global pull.rebase false
git config --global core.editor "vim"
```

如果你不想创建新的 Google/GitHub 身份，也可以用主 GitHub，但建议给 `ai` 用户单独 SSH key。

### 9.2 创建 `ai` 用户专用 SSH key

```bash
ssh-keygen -t ed25519 -C "ai-agent"
```

一路回车即可，默认路径：

```text
~/.ssh/id_ed25519
```

查看公钥：

```bash
cat ~/.ssh/id_ed25519.pub
```

把它添加到 GitHub：

```text
GitHub → Settings → SSH and GPG keys → New SSH key
```

测试：

```bash
ssh -T git@github.com
```

---

## 10. Secrets 管理

创建统一密钥文件：

```bash
nano ~/secrets/agent.env
```

示例：

```bash
export OPENAI_API_KEY="sk-..."
export ANTHROPIC_API_KEY="..."
export GITHUB_TOKEN="..."
```

锁权限：

```bash
chmod 600 ~/secrets/agent.env
```

增加快捷命令：

```bash
echo 'alias loadkeys="source ~/secrets/agent.env"' >> ~/.zshrc
source ~/.zshrc
```

使用：

```bash
loadkeys
```

建议：

```text
不要把真实 key 写进 ~/.zshrc
不要提交 .env
不要把 secrets 放到 /Users/Shared
不要让所有 agent 共用过大的权限 token
```

---

## 11. direnv：项目级环境变量

启用 direnv：

```bash
echo 'eval "$(direnv hook zsh)"' >> ~/.zshrc
source ~/.zshrc
```

在项目中创建 `.envrc`：

```bash
cd ~/projects/your-project
nano .envrc
```

示例：

```bash
source ~/secrets/agent.env
```

启用：

```bash
direnv allow
```

之后每次进入项目目录，会自动加载对应环境变量。

推荐：

```text
通用 key 放 ~/secrets/agent.env
项目专属 key 放项目自己的 .envrc 或 .env.local
敏感文件加入 .gitignore
```

---

## 12. tmux：长期运行 agent

新建 session：

```bash
tmux new -s agents
```

恢复 session：

```bash
tmux a -t agents
```

建议窗口规划：

```text
1 codex-server
2 hermes
3 openhuman
4 openclaw
5 logs
```

常用快捷键：

```text
Ctrl-b c      新窗口
Ctrl-b n      下一个窗口
Ctrl-b p      上一个窗口
Ctrl-b d      退出但不关闭 session
tmux ls       查看 session
tmux a -t agents  恢复
```

---

## 13. Codex 配置

Codex CLI 是 OpenAI 的本地 coding agent，可以读取、修改并运行当前目录中的代码。推荐只在项目目录中运行 Codex。

### 13.1 安装

二选一：

```bash
npm install -g @openai/codex
```

或：

```bash
brew install codex
```

检查：

```bash
codex --version
```

首次运行：

```bash
codex
```

按提示登录。

### 13.2 推荐运行方式

```bash
cd ~/projects/your-project
loadkeys
codex
```

### 13.3 Codex 配置文件

用户级配置：

```text
~/.codex/config.toml
```

创建：

```bash
mkdir -p ~/.codex
nano ~/.codex/config.toml
```

推荐基础配置：

```toml
approval_policy = "on-request"
sandbox_mode = "workspace-write"

[model]
# 根据你的账号和可用模型调整
# model = "gpt-5.5"
```

安全建议：

```text
approval_policy = "on-request"      # 推荐
sandbox_mode = "workspace-write"    # 推荐
approval_policy = "never"           # 不推荐
```

### 13.4 Git 检查点

每次让 Codex 改代码前：

```bash
git status
git add .
git commit -m "checkpoint before codex task"
```

或者至少：

```bash
git diff
```

每次 Codex 完成后：

```bash
git diff
pnpm test
# 或 uv run pytest
```

确认无误后再提交。

---

## 14. Codex app-server：Windows 远程控制 Mac 项目

在 Mac `ai` 用户中：

```bash
cd ~/projects/your-project
loadkeys
codex app-server --listen ws://127.0.0.1:4500
```

在 Windows 建 SSH tunnel：

```powershell
ssh -L 4500:127.0.0.1:4500 mac-ai
```

Windows 另开终端：

```powershell
codex --remote ws://127.0.0.1:4500
```

推荐：

```text
只监听 127.0.0.1
通过 SSH tunnel 转发
不要直接暴露 0.0.0.0
不要裸 ws 暴露到公网
```

---

## 15. Hermes / OpenHuman / OpenClaw 放置建议

统一放在：

```text
~/agents
```

示例：

```bash
cd ~/agents
mkdir hermes openhuman openclaw
```

推荐分工：

```text
Codex      = 当前项目代码修改、跑测试、修 bug、重构
Hermes     = 长期任务、自动化、项目管家、提醒、任务流
OpenHuman  = 个人上下文、记忆、connector、桌面入口
OpenClaw   = 工具编排、plugin workflow、多 agent 流程
```

建议：

```text
Codex 按项目启动
Hermes/OpenHuman/OpenClaw 可以 tmux 常驻
每个 agent 独立配置、独立日志、独立 env
```

示例 tmux：

```bash
tmux new -s agents
```

窗口 1：

```bash
cd ~/agents/hermes
loadkeys
# 启动 hermes
```

窗口 2：

```bash
cd ~/agents/openhuman
loadkeys
# 启动 openhuman
```

窗口 3：

```bash
cd ~/agents/openclaw
loadkeys
# 启动 openclaw
```

---

## 16. VSCode Remote SSH

Windows 的 SSH config：

```ssh
Host mac-ai
    HostName 192.168.1.88
    User ai
```

测试：

```powershell
ssh mac-ai
```

VSCode：

```text
Remote SSH → Connect to Host → mac-ai
```

打开：

```text
/Users/ai/projects/your-project
```

这样：

```text
VSCode UI 在 Windows
代码和终端在 Mac ai 用户
Codex/Hermes/OpenHuman 也在 Mac ai 用户
```

---

## 17. macOS 权限策略

### 17.1 不给 `ai` 用户管理员权限

推荐：

```text
ai 用户 = 标准用户
```

不要默认给：

```text
sudo
root
免密码 sudo
完全磁盘访问
```

### 17.2 TCC 权限

位置：

```text
系统设置 → 隐私与安全性
```

建议：

```text
Codex：
  不给屏幕录制
  不给辅助功能
  不给完全磁盘访问
  只操作项目目录

Hermes：
  按需给网络、通知
  不默认给完全磁盘访问

OpenHuman：
  如果需要桌面操作，再给辅助功能
  如果需要看屏幕，再给屏幕录制
  如果需要读全盘，再非常谨慎地给完全磁盘访问
```

### 17.3 Google 账号策略

推荐：

```text
主 Mac 用户：登录你的真实 Google
ai 用户：默认不登录 Google
```

如果 agent 必须用 Google：

```text
优先使用专门 agent Google 账号
不要开启 Chrome Sync
不要导入密码
不要使用主账号的 Google Password Manager
```

---

## 18. 资源与睡眠管理

### 18.1 资源监控

安装：

```bash
brew install htop
```

使用：

```bash
htop
```

重点看：

```text
CPU
Memory
Swap
```

活动监视器中看：

```text
Memory Pressure
```

### 18.2 防止 Mac 睡眠

临时保持唤醒：

```bash
caffeinate -dims
```

如果长期跑 agent，可以在主账号使用 Amphetamine 这类工具保持唤醒。

注意：

```text
切换用户 ≠ 睡眠
退出登录 = 可能停止用户 session
Mac 合盖睡眠 = agent 可能暂停
```

---

## 19. 推荐日常工作流

### 19.1 从 Windows 工作

```powershell
ssh mac-ai
tmux a -t agents
```

VSCode：

```text
Remote SSH → mac-ai → /Users/ai/projects/your-project
```

### 19.2 开始一个 Codex 任务

```bash
cd ~/projects/your-project
loadkeys
git status
codex
```

任务前：

```bash
git add .
git commit -m "checkpoint before agent task"
```

任务后：

```bash
git diff
pnpm test
# 或
uv run pytest
```

### 19.3 启动长期 agent

```bash
tmux new -s agents
```

窗口中分别启动：

```bash
cd ~/agents/hermes
loadkeys
# hermes
```

```bash
cd ~/agents/openhuman
loadkeys
# openhuman
```

```bash
cd ~/agents/openclaw
loadkeys
# openclaw
```

---

## 20. 一键初始化脚本

> 使用方式：在全新的 `ai` 用户中执行。  
> 注意：脚本不会创建用户，也不会安装 Homebrew；它假设系统已有 Homebrew。

保存为：

```bash
nano ~/bootstrap-ai-user.sh
```

内容：

```bash
#!/usr/bin/env bash
set -euo pipefail

echo "==> Creating directories"
mkdir -p ~/projects ~/agents ~/sandbox ~/secrets ~/logs
chmod 700 ~/secrets

echo "==> Preparing zsh files"
touch ~/.zshrc ~/.zprofile

echo "==> Adding Homebrew shellenv"
if [ -x /usr/local/bin/brew ]; then
  grep -qxF 'eval "$(/usr/local/bin/brew shellenv)"' ~/.zprofile || echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zprofile
  grep -qxF 'eval "$(/usr/local/bin/brew shellenv)"' ~/.zshrc || echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zshrc
elif [ -x /opt/homebrew/bin/brew ]; then
  grep -qxF 'eval "$(/opt/homebrew/bin/brew shellenv)"' ~/.zprofile || echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
  grep -qxF 'eval "$(/opt/homebrew/bin/brew shellenv)"' ~/.zshrc || echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
else
  echo "Homebrew not found. Install Homebrew first from an admin user."
  exit 1
fi

eval "$(/usr/local/bin/brew shellenv)" 2>/dev/null || eval "$(/opt/homebrew/bin/brew shellenv)"

echo "==> Installing base tools"
brew install git curl wget jq ripgrep fd fzf htop tmux tree direnv gh mise uv

echo "==> Configuring mise and direnv"
grep -qxF 'eval "$(mise activate zsh)"' ~/.zshrc || echo 'eval "$(mise activate zsh)"' >> ~/.zshrc
grep -qxF 'eval "$(direnv hook zsh)"' ~/.zshrc || echo 'eval "$(direnv hook zsh)"' >> ~/.zshrc

export PATH="$HOME/.local/bin:$PATH"
eval "$(mise activate zsh)"

echo "==> Installing language runtimes"
mise use -g node@lts
mise use -g python@3.12
mise use -g go@latest
mise use -g rust@latest

echo "==> Enabling pnpm"
corepack enable
corepack prepare pnpm@latest --activate

echo "==> Installing Codex CLI"
npm install -g @openai/codex

echo "==> Creating secrets template"
if [ ! -f ~/secrets/agent.env ]; then
  cat > ~/secrets/agent.env <<'EOF'
# export OPENAI_API_KEY="sk-..."
# export ANTHROPIC_API_KEY="..."
# export GITHUB_TOKEN="..."
EOF
  chmod 600 ~/secrets/agent.env
fi

grep -qxF 'alias loadkeys="source ~/secrets/agent.env"' ~/.zshrc || echo 'alias loadkeys="source ~/secrets/agent.env"' >> ~/.zshrc

echo "==> Creating Codex config"
mkdir -p ~/.codex
if [ ! -f ~/.codex/config.toml ]; then
  cat > ~/.codex/config.toml <<'EOF'
approval_policy = "on-request"
sandbox_mode = "workspace-write"
EOF
fi

echo "==> Done"
echo "Restart shell or run: source ~/.zshrc"
```

执行：

```bash
chmod +x ~/bootstrap-ai-user.sh
~/bootstrap-ai-user.sh
source ~/.zshrc
```

检查：

```bash
brew --version
git --version
node -v
python --version
uv --version
pnpm -v
codex --version
```

---

## 21. 最终检查清单

### 用户隔离

```text
[ ] ai 用户是标准用户，不是管理员
[ ] 主账号不直接跑 agent
[ ] ai 用户可以 SSH 登录
[ ] Windows 可以 ssh mac-ai
```

### 目录

```text
[ ] ~/projects 已创建
[ ] ~/agents 已创建
[ ] ~/secrets 权限是 700
[ ] ~/secrets/agent.env 权限是 600
```

### 工具

```text
[ ] brew 可用
[ ] git 可用
[ ] gh 可用
[ ] mise 可用
[ ] node 可用
[ ] python 可用
[ ] uv 可用
[ ] pnpm 可用
[ ] tmux 可用
[ ] direnv 可用
[ ] codex 可用
```

### 安全

```text
[ ] Codex approval_policy = on-request
[ ] Codex sandbox_mode = workspace-write
[ ] 没有把 API key 写入 Git
[ ] 没有给 ai 用户完全磁盘访问
[ ] 没有在 ai 用户登录主 Google 并开启 Chrome Sync
```

### 工作流

```text
[ ] VSCode Remote SSH 能打开 /Users/ai/projects
[ ] tmux agents session 可恢复
[ ] Codex 能在项目目录运行
[ ] GitHub SSH key 可用
[ ] 项目测试命令可运行
```

---

## 22. 推荐的长期维护习惯

每周一次：

```bash
brew update
brew outdated
```

谨慎升级：

```bash
brew upgrade
```

检查全局 npm 包：

```bash
npm ls -g --depth=0
```

检查磁盘大文件：

```bash
du -sh ~/projects/* ~/agents/* ~/.cache 2>/dev/null
```

清理 Docker：

```bash
docker system df
```

不要随便执行：

```bash
docker system prune -a
```

除非你确定不需要旧镜像。

---

## 23. 最重要的原则

```text
1. 主账号不跑 agent
2. ai 用户不做日常浏览器身份
3. secrets 不进 Git
4. agent 不默认 sudo
5. Codex 只在项目目录运行
6. 长期 agent 用 tmux
7. Windows 只是驾驶舱
8. Mac ai 用户才是 agent runtime
```

一句话总结：

```text
把 Mac 当成一台 AI agent server，
把 ai 用户当成独立的 agent operating environment，
把 Windows 当成控制台。
```

---

## 参考链接

- OpenAI Codex CLI: https://developers.openai.com/codex/cli
- OpenAI Codex Quickstart: https://developers.openai.com/codex/quickstart
- OpenAI Codex Configuration: https://developers.openai.com/codex/config-reference
- OpenAI Codex Sandbox & Approvals: https://developers.openai.com/codex/agent-approvals-security
- OpenAI Codex App Server: https://developers.openai.com/codex/app-server
- mise: https://mise.jdx.dev/
- mise activate: https://mise.jdx.dev/cli/activate.html
- uv installation: https://docs.astral.sh/uv/getting-started/installation/
