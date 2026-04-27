# JavaScript 核心概念与浏览器渲染

## 目录

- [事件循环（Event Loop）](#事件循环event-loop)
- [宏任务与微任务](#宏任务与微任务)
- [浏览器渲染过程](#浏览器渲染过程)
- [重排与重绘](#重排与重绘)
- [Vue 与 React 原理与区别](#vue-与-react-原理与区别)

---

## 事件循环（Event Loop）

### 概念

JavaScript 是单线程语言，通过事件循环实现非阻塞异步操作。

### 执行机制

```
┌─────────────────────┐
│     Call Stack      │ ← 同步代码执行
│   (执行栈/主线程)    │
└─────────┬───────────┘
          │ 调用
          ↓
┌─────────────────────┐
│   Web APIs / libuv  │ ← 异步 API 处理
│   (浏览器/Node环境)  │
└─────────┬───────────┘
          │ 完成回调
          ↓
┌─────────────────────┐     ┌─────────────────────┐
│   Task Queue        │     │   MicroTask Queue   │
│   (宏任务队列)       │     │   (微任务队列)       │
│   - setTimeout      │     │   - Promise.then    │
│   - setInterval     │     │   - queueMicrotask  │
│   - I/O callback    │     │   - MutationObserver│
│   - UI Rendering    │     │                     │
└─────────┬───────────┘     └─────────┬───────────┘
          │                           │
          └──────────┬────────────────┘
                     │ 检查/执行
                     ↓
              事件循环（无限循环）
```

### 执行顺序

```
1. 执行同步代码（Call Stack）
2. 执行所有微任务（MicroTask Queue）
3. 执行一个宏任务（Task Queue）
4. 重复 2-3
```

---

## 宏任务与微任务

### 任务类型对比

| 类型 | 队列 | 触发时机 | 示例 |
|------|------|----------|------|
| **宏任务（MacroTask）** | Task Queue | 每轮事件循环末尾 | setTimeout, setInterval, I/O, UI Rendering |
| **微任务（MicroTask）** | MicroTask Queue | 当前任务执行完毕后，下一个宏任务之前 | Promise.then, queueMicrotask, MutationObserver |

### 执行顺序详解

```js
console.log('1');              // 同步 → Call Stack

setTimeout(() => {             // 宏任务 → Task Queue
  console.log('2');
}, 0);

Promise.resolve().then(() => { // 微任务 → MicroTask Queue
  console.log('3');
});

console.log('4');              // 同步 → Call Stack

// 输出顺序: 1 → 4 → 3 → 2
```

### 图解执行流程

```
当前任务执行
     ↓
清空 MicroTask Queue（所有微任务）
     ↓
执行一个宏任务（如 setTimeout 回调）
     ↓
清空 MicroTask Queue（所有微任务）
     ↓
执行下一个宏任务
     ↓
...循环
```

### 实战示例

```js
setTimeout(() => console.log('setTimeout'), 0);

Promise.resolve()
  .then(() => console.log('Promise 1'))
  .then(() => console.log('Promise 2'));

Promise.resolve()
  .then(() => console.log('Promise 3'));

// 输出:
// Promise 1
// Promise 3
// Promise 2
// setTimeout
```

### Node.js 中的 process.nextTick

```js
Promise.resolve().then(() => console.log('Promise'));

process.nextTick(() => console.log('nextTick'));

// Node.js 输出:
// nextTick  ← process.nextTick 优先级更高
// Promise
```

---

## 浏览器渲染过程

### 完整渲染流程

```
JavaScript 执行
       ↓
样式计算（Recalculate Styles）
       ↓
布局（Layout/Reflow）
       ↓
绘制（Paint）
       ↓
合成（Composite）
       ↓
显示到屏幕
```

### 每帧执行时机

```
┌─────────────────────────────────────────────────────┐
│  浏览器渲染帧（通常 60fps = 16.67ms 一帧）            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. 处理输入事件                                     │
│  2. JavaScript 任务                                │
│  3. 任务队列（宏任务）                              │
│  4. 微任务检查点                                    │
│  5. requestAnimationFrame 回调                      │
│  6. 样式计算（Style）                               │
│  7. 布局（Layout）                                  │
│  8. 绘制（Paint）                                   │
│  9. 合成（Composite）                               │
│                                                     │
└─────────────────────────────────────────────────────┘
              ↑ 这之前完成 → 显示器刷新（16.67ms）
```

### requestAnimationFrame

```js
// 每帧渲染前执行
function animate() {
  // 更新动画
  element.style.transform = `translateX(${x}px)`;
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
```

### 渲染优化原则

| 优化点 | 说明 |
|--------|------|
| **合并 DOM 操作** | 减少重排重绘次数 |
| **使用 CSS transform** | 触发合成，不触发重排重绘 |
| **will-change** | 提前告知浏览器元素将变化 |
| **避免 layout thrashing** | 读-写-读模式会频繁触发重排 |

---

## 重排与重绘

### 概念

| 类型 | 英文 | 说明 | 性能影响 |
|------|------|------|----------|
| **重排** | Reflow/Layout | 几何属性变化（位置、大小） | **最高** |
| **重绘** | Repaint | 外观变化（颜色、背景） | 中等 |
| **合成** | Composite | 单独图层处理（如 transform） | **最低** |

### 触发条件

#### 触发重排（Reflow）

```js
// 几何属性变化
element.style.width = '100px';      // 宽度变化
element.style.height = '200px';     // 高度变化
element.style.top = '10px';          // 位置变化
element.style.fontSize = '16px';     // 字体大小变化

// 读取几何属性（强制同步）
element.offsetHeight;  // 触发重排获取最新值
element.scrollTop;
element.clientWidth;
```

#### 触发重绘（Repaint）

```js
// 外观变化，不影响布局
element.style.backgroundColor = 'red';
element.style.opacity = '0.5';
element.style.visibility = 'hidden';
```

#### 不触发重排/重绘

```js
// 仅触发合成
element.style.transform = 'translateX(100px)';  // 最优
element.style.opacity = '0.5';                  // 合成层配合
element.style.willChange = 'transform';          // 提示浏览器
```

### 性能对比

```
触发重排 → 触发重绘 → 触发合成
   ↓
  最慢                    最快
```

### 优化实践

#### ❌ 错误模式（频繁重排）

```js
// 每次循环都触发重排
for (let i = 0; i < 100; i++) {
  element.style.left = i + 'px';  // 100次重排！
}
```

#### ✅ 正确模式（合并变更）

```js
// 方式1：CSS 类切换
element.classList.add('active');

// 方式2：使用 transform
for (let i = 0; i < 100; i++) {
  element.style.transform = `translateX(${i}px)`;  // 仅触发合成
}

// 方式3：DOM 离线后操作
const clone = element.cloneNode(true);
performHeavyWork(clone);
element.parentNode.replaceChild(clone, element);
```

#### ❌ 错误模式（读写交替）

```js
// layout thrashing
const height = element.offsetHeight;  // 读（触发重排）
element.style.width = height + 'px';   // 写（触发重排）
const width = element.offsetWidth;     // 读（触发重排）
element.style.height = width + 'px';   // 写（触发重排）
```

#### ✅ 正确模式（批量读写）

```js
// 批量读
const height = element.offsetHeight;
const width = element.offsetWidth;

// 批量写
element.style.width = height + 'px';
element.style.height = width + 'px';
```

### will-change 使用

```css
/* 提前告知浏览器即将变化，创建合成层 */
.animated-element {
  will-change: transform;
  transform: translateZ(0);  /* 强制创建合成层 */
}
```

---

## Vue 与 React 原理与区别

### 核心架构对比

| 对比项 | Vue | React |
|--------|-----|-------|
| **核心思想** | 渐进式框架 | UI 库 |
| **数据绑定** | 响应式（Proxy） | 状态提升 + 单向数据流 |
| **渲染方式** | 模板 / render 函数 | JSX |
| **更新机制** | 细粒度响应式 | 虚拟 DOM diff |
| **类型支持** | TS 原生支持 | 需要额外配置 |
| **状态管理** | Pinia/Vuex | Redux/Context/Zustand |
| **生态** | 全家桶 | 社区选择 |

---

### Vue 原理

#### 响应式原理

```js
// Vue 3 响应式原理
const data = { name: 'Alice' };

const proxy = new Proxy(data, {
  get(target, key) {
    return target[key];
  },
  set(target, key, value) {
    target[key] = value;
    // 触发更新：通知所有依赖该数据的组件重新渲染
    triggerUpdate();
    return true;
  }
});
```

#### 响应式系统流程

```
数据变化（Proxy setter）
       ↓
dep.notify() 通知所有订阅者
       ↓
组件 watcher 更新
       ↓
重新渲染组件
```

#### 模板编译

```
Vue 模板
   ↓
AST（抽象语法树）
   ↓
 render() 函数
   ↓
 虚拟 DOM
```

#### Vue 更新流程

```
State/Props 变化
       ↓
触发 Watcher
       ↓
重新执行 render()
       ↓
生成新的虚拟 DOM
       ↓
Patch（对比新旧虚拟 DOM）
       ↓
更新真实 DOM
```

---

### React 原理

#### 虚拟 DOM

```jsx
// JSX → createElement → 虚拟 DOM 对象
const element = (
  <div className="container">
    <h1>Title</h1>
    <p>Content</p>
  </div>
);

// 编译后
const element = React.createElement(
  'div',
  { className: 'container' },
  React.createElement('h1', null, 'Title'),
  React.createElement('p', null, 'Content')
);
```

#### React 协调（Reconciliation）

```
组件状态变化
       ↓
触发 render()
       ↓
生成新的虚拟 DOM 树
       ↓
Diff 算法对比新旧虚拟 DOM
       ↓
计算最小更新补丁（Patch）
       ↓
应用补丁到真实 DOM
```

#### Diff 算法核心策略

| 策略 | 说明 |
|------|------|
| **Tree Diff** | 只比较同层节点，跨层移动会删除重建 |
| **Component Diff** | 同组件类型继续比较，不同则替换 |
| **Element Diff** | 同节点对比 key 和属性 |

---

### Vue vs React 核心区别

#### 数据绑定

```js
// Vue：响应式自动更新
// <template>
//   <span>{{ message }}</span>
// </template>
data() { return { message: 'Hello' } }
// 修改 this.message 视图自动更新

// React：需要手动触发更新
// function App() {
//   const [message, setMessage] = useState('Hello');
//   return <span>{message}</span>;
// }
// 修改 setMessage('Hi') 才会更新
```

#### 性能优化

```jsx
// Vue：依赖追踪，自动按需更新
// 组件只会在响应式数据变化时更新
// 细粒度更新，无需手动优化

// React：可能需要手动优化
// shouldComponentUpdate
// React.memo
// useMemo / useCallback
// useTransition / useDeferredValue
```

#### 开发体验

| 方面 | Vue | React |
|------|-----|-------|
| 学习曲线 | 平缓 | 陡峭（Hooks 概念多） |
| 模板语法 | HTML 扩展，易理解 | JSX，灵活但学习成本 |
| 调试 | Vue DevTools 友好 | 依赖 React DevTools |
| 团队协作 | 模板约定俗成 | JSX 自由度更高 |

#### 生态与选择

| 场景 | 推荐 |
|------|------|
| 快速开发、约定优先 | Vue |
| 大型复杂应用、灵活定制 | React |
| 需要原生性能 | React Native |
| 需要渐进增强 | Vue |
| 团队技术水平高 | 两者皆可 |

---

### 性能优化对比

#### Vue 优化

```vue
<!-- 静态提升 -->
<template>
  <div class="static">{{ message }}</div>  <!-- message 不变，不会重新渲染 -->
</template>

<!-- 对象响应式 -->
<script>
import { reactive } from 'vue';

// 响应式，但大对象可选 shallowReactive
const state = reactive({ count: 0 });
</script>
```

#### React 优化

```jsx
// 1. React.memo 缓存组件
const MemoizedComponent = React.memo(function MyComponent(props) {
  return <div>{props.value}</div>;
});

// 2. useMemo 缓存计算结果
const expensiveValue = useMemo(() => computeExpensive(a, b), [a, b]);

// 3. useCallback 缓存函数
const handleClick = useCallback(() => doSomething(a), [a]);
```

---

## 总结

| 知识点 | 核心要点 |
|--------|----------|
| **事件循环** | 单线程通过事件循环处理异步，宏任务→微任务→宏任务循环 |
| **宏/微任务** | 微任务先于宏任务执行，Promise 比 setTimeout 先 |
| **浏览器渲染** | JS → Style → Layout → Paint → Composite，requestAnimationFrame 绑定渲染帧 |
| **重排重绘** | transform/opacity 优于几何属性变化，合并读写操作 |
| **Vue** | Proxy 响应式，自动追踪依赖，模板编译 |
| **React** | 虚拟 DOM + Diff，单向数据流，手动优化 |
