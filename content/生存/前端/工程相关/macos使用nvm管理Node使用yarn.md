## 一、确认 Node 版本（关键前提）

Corepack 是 **Node 自带工具**，只要 Node ≥ 16.10 即可。

`node -v`

如果你常用的是 Node 18 / 20 / 22（你之前提到过 Node 22），**完全没问题**。

---

## 二、启用 Corepack（一次即可）

`corepack enable`

验证：

`corepack --version`

> 这一步**不会安装任何全局 Yarn**，也不会影响 nvm。

---

## 三、在项目中“安装”Yarn（推荐方式）

进入你的项目目录：

`cd your-project`

### 1️⃣ 使用稳定版 Yarn（推荐）


```
yarn set version stable
```

或指定版本（例如 Yarn 4）：

```
yarn set version 4.5.0
```

执行后会发生三件事（非常重要）：

1. 生成：
    
    `.yarn/releases/yarn-4.5.0.cjs`
    
2. `package.json` 中自动加入：
    
    `"packageManager": "yarn@4.5.0"`
    
3. 以后执行 `yarn` 时：
    
    - Corepack 自动调用该版本
        
    - 与其他项目完全隔离

## 四、日常使用方式（无需改变习惯）

`yarn install yarn dev yarn build`

你不需要关心：

- Yarn 在哪里
    
- 用的是不是全局版本
    

**Corepack 会保证用对的那个。**