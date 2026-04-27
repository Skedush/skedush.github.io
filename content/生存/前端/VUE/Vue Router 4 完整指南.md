
## 目录

  

- [基础用法](#基础用法)

- [进阶用法](#进阶用法)

- [高阶用法](#高阶用法)

- [Composition API](#composition-api)

- [实战技巧](#实战技巧)

  

***

  

## 基础用法

  

### 1. 安装与引入

  

```bash

npm install vue-router@4

```

  

```js

// main.js

import { createApp } from 'vue'

import { createRouter, createWebHistory } from 'vue-router'

import App from './App.vue'

  

const router = createRouter({

history: createWebHistory(),

routes: [

{ path: '/', component: Home },

{ path: '/about', component: About }

]

})

  

createApp(App).use(router).mount('#app')

```

  

### 2. 路由模式

  

| 模式 | 方法 | URL 样式 | 特点 |

| ------------- | ------------------------ | ------------- | ------------- |

| HTML5 History | `createWebHistory()` | `/user/123` | 无 #，需服务器配置 |

| Hash | `createWebHashHistory()` | `/#/user/123` | 兼容性好，无需服务器配置 |

| Memory | `createMemoryHistory()` | 无 URL | 用于 SSR/无浏览器环境 |

  

```js

import { createWebHistory, createWebHashHistory, createMemoryHistory } from 'vue-router'

  

// SPA 推荐使用 HTML5 History 模式

const router = createRouter({

history: createWebHistory(import.meta.env.BASE_URL),

routes

})

```

  

### 3. 路由视图与链接

  

```vue

<!-- App.vue -->

<template>

<!-- 路由出口 -->

<router-view />

  

<!-- 编程式导航 -->

<button @click="goToAbout">关于</button>

  

<!-- 声明式导航 -->

<router-link to="/about">关于</router-link>

<router-link :to="{ path: '/user', params: { id: 123 } }">用户</router-link>

</template>

  

<script setup>

import { useRouter } from 'vue-router'

const router = useRouter()

const goToAbout = () => router.push('/about')

</script>

```

  

***

  

## 进阶用法

  

### 4. 动态路由参数

  

```js

// 路由定义：使用 : 声明参数

{ path: '/user/:id', component: UserView }

{ path: '/article/:category/:id', component: ArticleView }

  

// 可选参数：使用 ?

{ path: '/user/:id?', component: UserView }

  

// 正则约束

{ path: '/user/:id(\\d+)', component: UserView } // 只匹配数字

  

// 通配符

{ path: '/user/*', component: UserView }

{ path: '/:pathMatch(.*)*', component: NotFound } // 404

```

  

```vue

<script setup>

import { useRoute } from 'vue-router'

  

const route = useRoute()

  

// 获取参数

console.log(route.params.id) // /user/123 -> 123

console.log(route.query.search) // /?search=vue -> vue

console.log(route.hash) // URL hash 部分

console.log(route.fullPath) // 完整路径包含 query

</script>

```

  

### 5. 嵌套路由

  

```js

{

path: '/dashboard',

component: DashboardLayout,

children: [

{ path: '', redirect: 'overview' }, // 默认子路由

{ path: 'overview', component: Overview },

{ path: 'analytics', component: Analytics }

]

}

```

  

```vue

<!-- DashboardLayout.vue -->

<template>

<div class="dashboard">

<nav>...</nav>

<!-- 子路由出口 -->

<router-view />

</div>

</template>

```

  

### 6. 命名路由

  

```js

{ path: '/user/:id', name: 'user-profile', component: UserProfile }

  

// 编程式导航

router.push({ name: 'user-profile', params: { id: 123 } })

router.replace({ name: 'user-profile', params: { id: 123 } })

  

// 声明式

<router-link :to="{ name: 'user-profile', params: { id: 123 } }">用户</router-link>

```

  

### 7. 路由元信息 (Meta)

  

```js

{

path: '/admin',

component: AdminPanel,

meta: { requiresAuth: true, role: 'admin', title: '管理后台' }

}

  

{

path: '/article/:id',

component: ArticleView,

meta: { keepAlive: true } // 用于 keep-alive

}

```

  

```js

// 在守卫中访问

router.beforeEach((to, from) => {

if (to.meta.requiresAuth) {

// 检查登录状态

}

document.title = to.meta.title || '默认标题'

})

```

  

### 8. 路由重定向

  

```js

// 简单重定向

{ path: '/home', redirect: '/' }

  

// 命名路由重定向

{ path: '/home', redirect: { name: 'index' } }

  

// 函数重定向（可处理参数）

{

path: '/user/:id',

redirect: to => {

return { name: 'profile', params: { id: to.params.id } }

}

}

  

// 别名

{ path: '/a', alias: '/b', component: A } // /a 和 /b 都能访问

```

  

***

  

## 导航守卫

  

### 9. 全局守卫

  

```js

// 全局前置守卫 - 最常用

router.beforeEach((to, from, next) => {

// to: 目标路由对象

// from: 当前路由对象

// next: 确认导航的函数

  

if (to.meta.requiresAuth && !isLoggedIn()) {

next({

name: 'login',

query: { redirect: to.fullPath } // 登录后跳回

})

} else {

next() // 确认导航

// next(false) 中断导航

// next('/') 跳转到其他路由

// next({ name: '404' }) 跳转到命名路由

}

})

  

// 全局解析守卫 - 在组件实例化前调用

router.beforeResolve((to, from, next) => {

// 适合做数据预取

next()

})

  

// 全局后置钩子 - 导航完成后调用

router.afterEach((to, from) => {

// 适合做页面埋点、滚动到顶部

window.scrollTo(0, 0)

})

```

  

### 10. 路由独享守卫

  

```js

{

path: '/profile',

component: Profile,

beforeEnter: (to, from, next) => {

// 只对这条路由生效

if (hasPermission()) {

next()

} else {

next('/denied')

}

}

}

  

// 多个守卫

beforeEnter: [fn1, fn2, fn3]

```

  

### 11. 组件内守卫

  

```vue

<script setup>

import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'

  

// 离开组件时调用

onBeforeRouteLeave((to, from) => {

const answer = window.confirm('有未保存的更改，确定离开？')

if (!answer) return false // 取消导航

})

  

// 路由参数变化时调用（如同一个组件复用）

onBeforeRouteUpdate((to, from) => {

// 重新获取数据

fetchData(to.params.id)

})

</script>

```

  

### 12. 完整导航解析流程

  

```

导航触发

↓

1. 触发组件的 beforeRouteLeave 守卫（离开当前组件）

↓

2. 执行全局 beforeEach 守卫

↓

3. 在重用组件中调用 beforeRouteUpdate 守卫（路由参数变化）

↓

4. 执行路由独享 beforeEnter 守卫

↓

5. 解析异步路由组件

↓

6. 执行组件的 beforeRouteEnter 守卫

↓

7. 导航确认（next() 调用）

↓

8. 执行全局 beforeResolve 守卫

↓

9. 导航完成

↓

10. 触发全局 afterEach 钩子

↓

11. DOM 更新完成，beforeRouteEnter 的 next(vm => {}) 执行

```

  

***

  

## 高阶用法

  

### 13. 路由懒加载

  

```js

// 方式1：动态导入（自动代码分割）

{ path: '/about', component: () => import('./views/About.vue') }

  

// 方式2：带命名 chunk（便于调试）

{

path: '/about',

component: () => import(/* webpackChunkName: "about" */ './views/About.vue')

}

  

// 方式3：带加载状态

const AsyncComponent = () => ({

component: import('./views/Heavy.vue'),

loading: LoadingComponent,

error: ErrorComponent,

delay: 200,

timeout: 3000

})

  

// 方式4：预加载（prefetch）

const News = () => import(/* webpackPrefetch: true */ './views/News.vue')

  

// 方式5：懒加载多个路由

const routes = [

path: '/',

component: () => import('./views/Home.vue'),

children: [

{

path: 'dashboard',

component: () => import(/* webpackChunkName: "dashboard" */ './views/Dashboard.vue')

}

]

]

```

  

### 14. 路由动效过渡

  

```vue

<template>

<router-view v-slot="{ Component, route }">

<transition name="fade" mode="out-in">

<component :is="Component" :key="route.path" />

</transition>

</router-view>

</template>

  

<style>

/* 渐变过渡 */

.fade-enter-active,

.fade-leave-active {

transition: opacity 0.3s ease;

}

.fade-enter-from,

.fade-leave-to {

opacity: 0;

}

  

/* 滑动过渡 */

.slide-enter-active,

.slide-leave-active {

transition: transform 0.3s ease;

}

.slide-enter-from {

transform: translateX(100%);

}

.slide-leave-to {

transform: translateX(-100%);

}

  

/* 缩放过渡 */

.zoom-enter-active,

.zoom-leave-active {

transition: all 0.3s ease;

}

.zoom-enter-from,

.zoom-leave-to {

opacity: 0;

transform: scale(0.95);

}

</style>

```

  

### 15. 滚动行为控制

  

```js

const router = createRouter({

history: createWebHistory(),

routes,

scrollBehavior(to, from, savedPosition) {

// 返回顶部

return { top: 0 }

  

// 滚动到锚点

return { top: document.querySelector('#section').offsetTop }

  

// 记住上次滚动位置（浏览器后退/前进）

if (savedPosition) {

return savedPosition

}

  

// 新页面滚动到顶部

return { top: 0 }

  

// 横向滚动

return { left: 0, top: 0, behavior: 'smooth' }

}

})

```

  

### 16. 动态路由操作

  

```js

// 添加路由

router.addRoute({

path: '/new-route',

name: 'new-route',

component: NewComponent

})

  

// 添加子路由

router.addRoute('parent-route-name', {

path: 'child',

component: ChildComponent

})

  

// 移除路由（按名称）

router.removeRoute('unused-route')

  

// 替换路由

router.replaceRoute('route-name')

  

// 路由是否存在

router.hasRoute('route-name')

  

// 获取所有路由

console.log(router.getRoutes())

```

  

### 17. 路由懒加载 + 守卫组合

  

```js

{

path: '/admin',

component: () => import('./views/Admin.vue'),

beforeEnter: (to, from, next) => {

// 仅对此路由生效的守卫

if (hasAdminPermission()) {

next()

} else {

next('/403')

}

},

meta: { requiresAuth: true }

}

```

  

### 18. 历史记录管理

  

```js

// 替换当前记录（不保留历史）

router.replace('/new-path')

  

// 替换当前记录（编程式）

router.replace({ name: 'new-route', params: { id: 1 } })

  

// 前进/后退

router.go(1) // 前进一页

router.go(-1) // 后退一页

router.back() // 后退

router.forward() // 前进

  

// 监听历史变化

window.addEventListener('popstate', () => {

// 浏览器前进/后退时触发

})

```

  

***

  

## Composition API

  

### 19. 核心组合函数

  

```vue

<script setup>

import {

useRoute, // 获取当前路由

useRouter, // 获取路由实例

onBeforeRouteLeave,

onBeforeRouteUpdate

} from 'vue-router'

  

const route = useRoute()

const router = useRouter()

  

// 路由信息

console.log(route.path) // 路径

console.log(route.params) // 参数

console.log(route.query) // 查询参数

console.log(route.hash) // hash

console.log(route.name) // 路由名称

console.log(route.meta) // 元信息

console.log(route.fullPath) // 完整路径

  

// 导航方法

router.push('/about')

router.replace('/about')

router.go(1)

router.back()

  

// 监听 route 变化

import { watch } from 'vue'

watch(() => route.params.id, (newId) => {

fetchData(newId)

})

</script>

```

  

### 20. 在 setup 中使用 beforeRouteEnter

  

```vue

<script setup>

import { onMounted } from 'vue'

  

onBeforeRouteEnter((to, from, next) => {

// 组件实例还未创建，不能访问 `this`

// 通过回调函数访问组件实例

next(vm => {

// vm 是组件实例，可访问 data、methods 等

vm.fetchData()

})

})

  

// 等效的 setup 写法

onMounted(() => {

// 数据加载

})

</script>

```

  

### 21. 路由守卫中使用 async/await

  

```js

router.beforeEach(async (to, from) => {

// 可以 await 异步操作

const user = await fetchUser()

if (to.meta.requiresAuth && !user) {

return { name: 'login', query: { redirect: to.fullPath } }

}

// 返回 true 或不返回 = 继续导航

// 返回 false = 取消导航

})

```

  

***

  

## 实战技巧

  

### 22. 路由权限控制

  

```js

// permission.js

const whiteList = ['/login', '/register', '/forgot-password']

  

router.beforeEach(async (to, from, next) => {

const hasToken = getToken()

if (hasToken) {

if (to.name === 'login') {

next({ path: '/' })

} else {

const hasPermission = checkPermission(to.meta.role)

if (hasPermission) {

next()

} else {

next('/403')

}

}

} else {

if (whiteList.includes(to.path)) {

next()

} else {

next(`/login?redirect=${to.fullPath}`)

}

}

})

```

  

### 23. 路由划分与文件结构

  

```

src/

├── router/

│ ├── index.js # 主入口

│ ├── routes/

│ │ ├── index.js # 路由汇总

│ │ ├── modules/

│ │ │ ├── user.js # 用户模块

│ │ │ ├── admin.js # 管理模块

│ │ │ └── ...

│ └── asyncRoutes.js # 动态路由

```

  

```js

// routes/modules/user.js

export default [

{

path: '/user',

name: 'UserLayout',

component: () => import('@/views/user/Layout.vue'),

children: [

{ path: 'profile', name: 'UserProfile', component: () => import('@/views/user/Profile.vue') },

{ path: 'settings', name: 'UserSettings', component: () => import('@/views/user/Settings.vue') }

]

}

]

```

  

### 24. 页面缓存（Keep-Alive）

  

```vue

<!-- App.vue -->

<template>

<router-view v-slot="{ Component, route }">

<keep-alive :include="cachedComponents">

<component :is="Component" :key="route.path" />

</keep-alive>

</router-view>

</template>

  

<script setup>

import { ref } from 'vue'

const cachedComponents = ref(['Home', 'Dashboard'])

</script>

```

  

```js

// 配合 meta 使用

{

path: '/dashboard',

component: Dashboard,

meta: { keepAlive: true }

}

```

  

```vue

<!-- Layout.vue -->

<keep-alive :include="cachedComponents">

<router-view />

</keep-alive>

  

<script setup>

import { useRoute } from 'vue-router'

const route = useRoute()

  

// 根据 meta 动态缓存

const cachedComponents = computed(() => {

return route.matched

.filter(r => r.meta.keepAlive)

.map(r => r.components.default.name)

})

</script>

```

  

### 25. 路由状态保持与恢复

  

```js

// 使用 sessionStorage 保存状态

router.beforeEach((to, from, next) => {

// 保存滚动位置

if (from.name && to.name !== from.name) {

sessionStorage.setItem('scroll-' + from.name, JSON.stringify({

top: window.scrollY,

left: window.scrollX

}))

}

next()

})

  

// 恢复滚动位置

scrollBehavior(to, from, savedPosition) {

if (savedPosition) {

return new Promise(resolve => {

setTimeout(() => {

resolve(savedPosition)

}, 100)

})

}

return { top: 0 }

}

```

  

### 26. 微前端路由处理

  

```js

// 独立子应用路由

const router = createRouter({

history: createWebHistory('/child-app/'), // 独立子路径

routes

})

  

// 主应用使用 qiankun 加载子应用

// 子应用需要暴露 lifecycle

export async function mount(props) {

router.start()

}

```

  

### 27. 常见问题处理

  

```js

// 1. 导航到当前路由（触发更新）

router.push(route.fullPath) // 使用 fullPath 而非 path

  

// 2. 路由参数变化不刷新组件

watch(() => route.params.id, (newId) => {

// 手动处理数据更新

fetchData(newId)

})

  

// 3. 连续点击路由报错

let isNavigating = false

router.beforeEach((to, from, next) => {

if (isNavigating) return

isNavigating = true

next()

setTimeout(() => { isNavigating = false }, 1000)

})

  

// 4. 带参数的路由重定向

{

path: '/user/:id',

redirect: to => {

return '/profile/' + to.params.id

}

}

```

  

### 28. TypeScript 类型支持

  

```ts

// router/index.ts

import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

  

const routes: RouteRecordRaw[] = [

{

path: '/user/:id',

name: 'User',

component: () => import('@/views/User.vue'),

props: true // 将 params 作为 props 传递

}

]

  

const router = createRouter({

history: createWebHistory(),

routes

})

  

export default router

  

// 在组件中使用

const props = defineProps<{

id: string

}>()

```

  

```ts

// 扩展 RouteMeta

declare module 'vue-router' {

interface RouteMeta {

requiresAuth?: boolean

role?: string

title?: string

keepAlive?: boolean

}

}

```

  

***

  

## 附录：Router 实例属性与方法

  

### Router 实例属性

  

| 属性 | 类型 | 说明 |

| --------------------- | -------------- | ------ |

| `router.currentRoute` | `Ref<Route>` | 当前路由对象 |

| `router.options` | `RouteOptions` | 原始路由配置 |

| `router.getRoutes()` | `Route[]` | 所有路由记录 |

  

### Router 实例方法

  

| 方法 | 说明 |

| ------------------------------------ | ---------------- |

| `router.push(to)` | 导航到新 URL（添加历史记录） |

| `router.replace(to)` | 替换当前 URL（不添加历史） |

| `router.go(n)` | 前进/后退 n 步 |

| `router.back()` | 后退一页 |

| `router.forward()` | 前进一页 |

| `router.addRoute(route)` | 动态添加路由 |

| `router.addRoute(parentName, route)` | 添加子路由 |

| `router.removeRoute(name)` | 移除路由 |

| `router.hasRoute(name)` | 检查路由是否存在 |

| `router.getRoutes()` | 获取所有路由 |

| `router.resolve(to)` | 解析路由对象 |

  

### Route 对象属性

  

| 属性 | 类型 | 说明 |

| ---------------------- | ------------------------------------ | ------- |

| `route.path` | `string` | 路径 |

| `route.name` | `string \| null` | 路由名称 |

| `route.params` | `Record<string, string \| string[]>` | 动态参数 |

| `route.query` | `Record<string, string \| string[]>` | 查询参数 |

| `route.hash` | `string` | hash 值 |

| `route.fullPath` | `string` | 完整路径 |

| `route.matched` | `RouteRecord[]` | 匹配的路由记录 |

| `route.meta` | `RouteMeta` | 元信息 |

| `route.redirectedFrom` | `string \| undefined` | 重定向来源 |