你的内存是 **芝奇 DDR5 6400 32GB**，在 ASUS TUF GAMING B860M-PLUS 上建议这样设：

# BIOS 内存设置建议

进入 BIOS：

```text
开机按 Delete
→ F7 Advanced Mode
→ Ai Tweaker
```

找到：

```text
Ai Overclock Tuner
```

## 推荐设置

先选：

```text
Ai Overclock Tuner: XMP I
```

然后保存：

```text
F10
→ OK
```

# 为什么先用 XMP I

对 ASUS 主板来说：

```text
XMP I：主板优化后的 XMP 参数
XMP II：内存条原厂完整 XMP 参数
Auto：默认 JEDEC 低频，最稳但性能低
```

你的芝奇 DDR5 6400 属于较高频 DDR5。对 AI 工作站来说，**稳定优先**，所以建议顺序是：

```text
第一选择：XMP I
如果不稳定：XMP II
如果还不稳定：手动降到 DDR5-6000
最后保守：Auto
```

# 建议你这样操作

## 第一步：开 XMP I

```text
Ai Tweaker
→ Ai Overclock Tuner
→ XMP I
```

如果下面出现 Profile，例如：

```text
DDR5-6400
CL32 / CL36 / CL40
1.35V / 1.40V
```

保持默认即可。

然后：

```text
F10 保存重启
```

进入 Ubuntu 安装。

---

# 装完 Ubuntu 后做稳定性测试

安装好系统后，先装工具：

```bash
sudo apt update
sudo apt install -y memtester stress-ng
```

## 快速内存测试

如果你是 32GB 内存，可以测 24GB：

```bash
sudo memtester 24G 2
```

如果系统占用较多，改成：

```bash
sudo memtester 16G 2
```

## 压力测试

```bash
stress-ng --vm 4 --vm-bytes 75% --timeout 30m --metrics-brief
```

如果这两个测试都没报错，XMP I 基本可用。

---

# 如果出现不稳定

比如：

```text
Ubuntu 安装中卡死
重启
黑屏
编译时报奇怪错误
Docker build 随机失败
PyTorch 训练突然挂
浏览器标签页崩溃
```

那就回 BIOS 调整。

## 方案 1：换 XMP II

```text
Ai Tweaker
→ Ai Overclock Tuner
→ XMP II
```

保存测试。

## 方案 2：降频到 DDR5-6000

路径大概是：

```text
Ai Tweaker
→ DRAM Frequency
→ DDR5-6000
```

其他时序、电压先保持 Auto/XMP。

推荐稳定档：

```text
DDR5-6000
```

## 方案 3：更保守 DDR5-5600

如果 6000 还不稳：

```text
DRAM Frequency: DDR5-5600
```

这对 AI 开发影响不大，但稳定性会更高。

---

# 对 AI 工作站的实际建议

你的用途是 AI / LLM / Agent 开发，不是跑内存超频分数。

所以优先级应该是：

```text
稳定 > 容量 > 显卡 > SSD > 内存频率
```

32GB DDR5 6400 的建议最终目标：

```text
能稳定跑 6400：用 XMP I
6400 不稳：降到 6000
6000 不稳：降到 5600
不要为了 6400 硬调一堆电压
```

# 最终 BIOS 内存项

你可以按这个填：

|项目|建议|
|---|---|
|Ai Overclock Tuner|XMP I|
|DRAM Frequency|Auto，跟随 XMP 6400|
|DRAM Timing Control|Auto|
|DRAM VDD Voltage|Auto|
|DRAM VDDQ Voltage|Auto|
|Memory Controller Voltage|Auto|
|CPU 超频|不开|
|ASUS Multicore Enhancement|Auto 或 Disabled|

# 简单结论

你的芝奇 DDR5 6400 32GB：

```text
先开 XMP I
能稳定就不用动
不稳定就降 DDR5-6000
AI 开发不要极限内存超频
```

装 Ubuntu 之前，BIOS 里内存部分只需要动这一项：

```text
Ai Tweaker → Ai Overclock Tuner → XMP I
```