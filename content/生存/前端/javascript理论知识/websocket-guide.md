# WebSocket 完全指南

## 目录

- [概述](#概述)
- [HTTP vs WebSocket](#http-vs-websocket)
- [WebSocket 原理](#websocket-原理)
- [前端实现](#前端实现)
- [后端实现](#后端实现)
- [安全注意事项](#安全注意事项)
- [实战场景](#实战场景)
- [常见问题](#常见问题)

---

## 概述

WebSocket 是一种**全双工通信协议**，允许服务器主动向客户端推送数据。

### 核心特点

| 特点 | 说明 |
|------|------|
| **全双工** | 客户端和服务器可以同时发送消息 |
| **持久连接** | 建立一次连接，可以多次双向通信 |
| **实时性** | 服务器可以主动推送，无需轮询 |
| **基于 TCP** | 可靠的传输协议 |

---

## HTTP vs WebSocket

### HTTP 轮询（传统方式）

```
客户端                    服务器
   │                         │
   │──── GET /api/data ─────>│
   │<─── Response ───────────│
   │                         │
   │──── GET /api/data ─────>│  ← 每隔几秒请求一次
   │<─── Response ───────────│
   │                         │
   │──── GET /api/data ─────>│
   │<─── Response ───────────│
```

**问题**：浪费资源，延迟高

### WebSocket（实时方式）

```
客户端                    服务器
   │                         │
   │──── 建立连接 ────────────>│
   │<──── 连接成功 ────────────│
   │                         │
   │<──── 服务器推送 ──────────│  ← 服务器随时可以发
   │──── 客户端发送 ──────────>│  ← 客户端随时可以发
   │                         │
   │──── 保持连接 ────────────>│  ← 长连接
```

---

## WebSocket 原理

### 建立连接过程（握手）

```
1. 客户端发送 HTTP 请求（带有 Upgrade 头）
   GET /ws HTTP/1.1
   Upgrade: websocket
   Connection: Upgrade
   Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==

2. 服务器响应 101 状态码
   HTTP/1.1 101 Switching Protocols
   Upgrade: websocket
   Connection: Upgrade
   Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYG3hQbDA==

3. 连接升级为 WebSocket 协议
```

### 连接状态

| 状态 | 值 | 说明 |
|------|-----|------|
| CONNECTING | 0 | 连接中 |
| OPEN | 1 | 已连接 |
| CLOSING | 2 | 关闭中 |
| CLOSED | 3 | 已关闭 |

---

## 前端实现

### 1. 原生 WebSocket API

#### 建立连接

```js
// 创建 WebSocket 连接
const ws = new WebSocket('ws://localhost:3000/ws');

// 或加密版本
const ws = new WebSocket('wss://example.com/ws');
```

#### 事件处理

```js
// 连接成功
ws.onopen = (event) => {
  console.log('WebSocket 已连接');
  ws.send('Hello Server');  // 发送消息
};

// 收到消息
ws.onmessage = (event) => {
  const data = event.data;
  console.log('收到消息:', data);
  // 处理数据
};

// 连接错误
ws.onerror = (error) => {
  console.error('WebSocket 错误:', error);
};

// 连接关闭
ws.onclose = (event) => {
  console.log('WebSocket 已关闭', event.code, event.reason);
};
```

#### 发送消息

```js
// 发送字符串
ws.send('Hello');

// 发送 JSON
ws.send(JSON.stringify({
  type: 'message',
  content: 'Hello',
  timestamp: Date.now()
}));

// 发送二进制（较少用）
ws.send(new ArrayBuffer(data));
```

#### 关闭连接

```js
// 主动关闭连接
ws.close();                    // 正常关闭
ws.close(1000, '正常关闭');    // 带状态码和原因

// 状态码
// 1000: 正常关闭
// 1001: 服务器关闭
// 1002: 协议错误
// 1003: 不支持的数据类型
// 1006: 非正常关闭
```

---

### 2. Vue3 中使用 WebSocket

#### 方式一：组合式函数（推荐）

```vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const messages = ref([]);
const ws = ref(null);
const connected = ref(false);

// 建立连接
function connect() {
  ws.value = new WebSocket('ws://localhost:3000/ws');

  ws.value.onopen = () => {
    connected.value = true;
    console.log('已连接');
  };

  ws.value.onmessage = (event) => {
    const data = JSON.parse(event.data);
    messages.value.push(data);
  };

  ws.value.onclose = () => {
    connected.value = false;
    console.log('连接关闭');
  };

  ws.value.onerror = (error) => {
    console.error('WebSocket 错误:', error);
  };
}

// 发送消息
function sendMessage(content) {
  if (ws.value && ws.value.readyState === WebSocket.OPEN) {
    ws.value.send(JSON.stringify({
      type: 'message',
      content: content,
      timestamp: Date.now()
    }));
  }
}

// 主动断开
function disconnect() {
  if (ws.value) {
    ws.value.close();
    ws.value = null;
  }
}

onMounted(() => {
  connect();
});

onUnmounted(() => {
  disconnect();
});
</script>

<template>
  <div>
    <div v-if="!connected">连接中...</div>
    <div v-else>
      <div v-for="msg in messages" :key="msg.timestamp">
        {{ msg.content }}
      </div>
      <button @click="sendMessage('Hello')">发送</button>
    </div>
  </div>
</template>
```

#### 方式二：封装成工具函数

```js
// composables/useWebSocket.js
import { ref, onUnmounted } from 'vue';

export function useWebSocket(url) {
  const messages = ref([]);
  const connected = ref(false);
  let ws = null;

  function connect() {
    ws = new WebSocket(url);

    ws.onopen = () => {
      connected.value = true;
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      messages.value.push(data);
    };

    ws.onclose = () => {
      connected.value = false;
    };
  }

  function send(data) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(typeof data === 'string' ? data : JSON.stringify(data));
    }
  }

  function close() {
    if (ws) {
      ws.close();
      ws = null;
    }
  }

  onUnmounted(() => {
    close();
  });

  return {
    messages,
    connected,
    connect,
    send,
    close
  };
}
```

---

### 3. React 中使用 WebSocket

#### 方式一：Class 组件

```jsx
class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      connected: false
    };
    this.ws = null;
  }

  componentDidMount() {
    this.ws = new WebSocket('ws://localhost:3000/ws');

    this.ws.onopen = () => {
      this.setState({ connected: true });
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.setState(state => ({
        messages: [...state.messages, data]
      }));
    };

    this.ws.onclose = () => {
      this.setState({ connected: false });
    };
  }

  componentWillUnmount() {
    if (this.ws) {
      this.ws.close();
    }
  }

  sendMessage = (content) => {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ content }));
    }
  };

  render() {
    return (
      <div>
        {!this.state.connected && <div>连接中...</div>}
        {this.state.messages.map((msg, i) => (
          <div key={i}>{msg.content}</div>
        ))}
        <button onClick={() => this.sendMessage('Hello')}>发送</button>
      </div>
    );
  }
}
```

#### 方式二：Hook（推荐）

```jsx
import { useState, useEffect, useRef, useCallback } from 'react';

function useWebSocket(url) {
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages(prev => [...prev, data]);
    };

    return () => {
      ws.close();
    };
  }, [url]);

  const send = useCallback((data) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(typeof data === 'string' ? data : JSON.stringify(data));
    }
  }, []);

  return { messages, connected, send };
}

// 使用
function Chat() {
  const { messages, connected, send } = useWebSocket('ws://localhost:3000/ws');

  return (
    <div>
      <div>{connected ? '已连接' : '连接中...'}</div>
      {messages.map((msg, i) => (
        <div key={i}>{msg.content}</div>
      ))}
      <button onClick={() => send('Hello')}>发送</button>
    </div>
  );
}
```

---

### 4. 常用 WebSocket 库

| 库 | 说明 |
|-----|------|
| **socket.io** | 最流行，自动重连，降级支持 |
| **sockjs** | 提供跨浏览器兼容 |
| **ws** | Node.js 轻量级 WebSocket 库 |

#### Socket.IO 客户端示例

```js
// 客户端
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  transports: ['websocket'],  // 强制使用 WebSocket
  reconnection: true,         // 自动重连
  reconnectionDelay: 1000,    // 重连间隔
});

// 事件
socket.on('connect', () => {
  console.log('已连接:', socket.id);
});

socket.on('message', (data) => {
  console.log('收到消息:', data);
});

// 发送
socket.emit('message', 'Hello');

// 断开
socket.disconnect();
```

---

## 后端实现

### 1. Node.js 原生实现

```js
const http = require('http');
const crypto = require('crypto');

// 创建 HTTP 服务器
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('HTTP Server');
});

// WebSocket 升级处理
server.on('upgrade', (request, socket, head) => {
  // 验证 WebSocket 握手
  const key = request.headers['sec-websocket-key'];
  const acceptKey = generateAcceptKey(key);

  const responseHeaders = [
    'HTTP/1.1 101 Switching Protocols',
    'Upgrade: websocket',
    'Connection: Upgrade',
    `Sec-WebSocket-Accept: ${acceptKey}`,
    '',
    ''
  ].join('\r\n');

  socket.write(responseHeaders);

  // 连接升级完成，可以收发消息
  socket.on('data', (buffer) => {
    // 解码消息
    const message = decodeMessage(buffer);
    console.log('收到:', message);

    // 发送消息给客户端
    const response = encodeMessage('Hello from server');
    socket.write(response);
  });

  socket.on('close', () => {
    console.log('连接关闭');
  });
});

// 生成握手 key
function generateAcceptKey(key) {
  const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
  const acceptKey = crypto
    .createHash('sha1')
    .update(key + GUID)
    .digest('base64');
  return acceptKey;
}

// 解码 WebSocket 帧
function decodeMessage(buffer) {
  const firstByte = buffer[0];
  const opcode = firstByte & 0x0f;
  const secondByte = buffer[1];
  const isMasked = (secondByte & 0x80) !== 0;
  let offset = 2;

  if (isMasked) {
    offset += 4;
  }

  let payloadLength = secondByte & 0x7f;
  if (payloadLength === 126) {
    payloadLength = buffer.readUInt16BE(offset);
    offset += 2;
  } else if (payloadLength === 127) {
    offset += 8;
  }

  const payload = buffer.slice(offset, offset + payloadLength);
  return payload.toString();
}

// 编码消息为 WebSocket 帧
function encodeMessage(message) {
  const msgBuffer = Buffer.from(message);
  const length = msgBuffer.length;

  let offset = 2;
  if (length > 65535) {
    offset += 8;
  } else if (length > 125) {
    offset += 2;
  }

  const buffer = Buffer.alloc(offset + length);
  buffer[0] = 0x81;  // FIN + text frame
  buffer[1] = length > 65535 ? 127 : (length > 125 ? 126 : length);

  if (length > 65535) {
    buffer.writeUInt32BE(0, 2);
    buffer.writeUInt32BE(length, 6);
  } else if (length > 125) {
    buffer.writeUInt16BE(length, 2);
  }

  msgBuffer.copy(buffer, offset);
  return buffer;
}

server.listen(3000, () => {
  console.log('服务器运行在 http://localhost:3000');
});
```

---

### 2. 使用 ws 库（推荐）

```bash
npm install ws
```

```js
const { WebSocketServer } = require('ws');

const wss = new WebSocketServer({ port: 3000, path: '/ws' });

// 广播消息给所有客户端
function broadcast(message) {
  wss.clients.forEach(client => {
    if (client.readyState === 1) {  // OPEN
      client.send(JSON.stringify(message));
    }
  });
}

wss.on('connection', (ws, req) => {
  console.log('新客户端连接');

  // 发送欢迎消息
  ws.send(JSON.stringify({
    type: 'system',
    content: '欢迎连接'
  }));

  // 收到消息
  ws.on('message', (data) => {
    const message = data.toString();
    console.log('收到:', message);

    // 回复客户端
    ws.send(JSON.stringify({
      type: 'response',
      content: `服务器收到: ${message}`
    }));

    // 广播给所有客户端
    broadcast({
      type: 'broadcast',
      content: message
    });
  });

  // 连接关闭
  ws.on('close', () => {
    console.log('客户端断开');
  });

  // 错误处理
  ws.on('error', (error) => {
    console.error('WebSocket 错误:', error);
  });
});

console.log('WebSocket 服务器运行在 ws://localhost:3000');
```

---

### 3. Socket.IO 服务端

```bash
npm install socket.io
```

```js
const { Server } = require('socket.io');

const io = new Server(3000, {
  cors: {
    origin: '*'  // 允许跨域
  }
});

io.on('connection', (socket) => {
  console.log('客户端连接:', socket.id);

  // 加入房间
  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`${socket.id} 加入房间 ${room}`);
  });

  // 发送给特定用户
  socket.on('private-message', ({ to, message }) => {
    io.to(to).emit('message', {
      from: socket.id,
      content: message
    });
  });

  // 广播给房间
  socket.on('room-message', ({ room, message }) => {
    io.to(room).emit('message', {
      from: socket.id,
      content: message
    });
  });

  // 发送给所有人
  socket.on('broadcast', (message) => {
    io.emit('message', {
      from: socket.id,
      content: message
    });
  });

  // 断开连接
  socket.on('disconnect', () => {
    console.log('客户端断开:', socket.id);
  });
});

console.log('Socket.IO 服务器运行在 http://localhost:3000');
```

---

### 4. Express + Socket.IO 组合

```js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// HTTP 路由
app.get('/api/data', (req, res) => {
  res.json({ message: 'Hello' });
});

// Socket.IO
io.on('connection', (socket) => {
  console.log('WebSocket 连接:', socket.id);

  socket.on('message', (data) => {
    console.log('收到:', data);
    socket.emit('response', '服务器收到');
  });

  socket.on('disconnect', () => {
    console.log('断开连接');
  });
});

server.listen(3000, () => {
  console.log('服务器运行在 http://localhost:3000');
});
```

---

## 安全注意事项

### 1. 使用 WSS（加密）

```js
// ❌ 不安全（明文）
const ws = new WebSocket('ws://example.com/ws');

// ✅ 安全（加密）
const ws = new WebSocket('wss://example.com/ws');
```

### 2. 验证来源（Origin）

```js
// 服务端验证 Origin
wss.on('connection', (ws, req) => {
  const origin = req.headers.origin;
  if (origin !== 'https://your-domain.com') {
    ws.close(1003, '不允许的来源');
    return;
  }
  // 处理连接
});
```

### 3. 身份验证

```js
// 方式1：URL 参数（不安全）
const ws = new WebSocket('wss://example.com/ws?token=xxx');

// 方式2：建立连接后立即发送认证消息
ws.onopen = () => {
  ws.send(JSON.stringify({ type: 'auth', token: 'xxx' }));
};

// 方式3：握手时验证（最佳）
// 在 upgrade 事件中验证 session/token
```

### 4. 输入验证

```js
// 服务端必须验证客户端发来的数据
ws.on('message', (data) => {
  try {
    const message = JSON.parse(data);

    // 验证数据格式
    if (typeof message.content !== 'string') {
      return;
    }

    // 限制长度
    if (message.content.length > 1000) {
      return;
    }

    // 处理消息
    handleMessage(message);
  } catch (e) {
    // 忽略无效数据
  }
});
```

### 5. 防止 DoS 攻击

```js
// 限制连接数
const MAX_CONNECTIONS = 1000;
let connectionCount = 0;

wss.on('connection', (ws, req) => {
  if (connectionCount >= MAX_CONNECTIONS) {
    ws.close(1001, '服务器繁忙');
    return;
  }
  connectionCount++;

  ws.on('close', () => {
    connectionCount--;
  });
});

// 限制消息大小
ws.on('message', (data) => {
  if (data.length > 1024 * 1024) {  // 1MB
    ws.close(1009, '消息太大');
  }
});
```

---

## 实战场景

### 1. 即时聊天

```js
// 服务端：聊天室
io.on('connection', (socket) => {
  socket.on('join', ({ username, room }) => {
    socket.join(room);
    io.to(room).emit('system', `${username} 加入了聊天室`);
  });

  socket.on('message', ({ room, content }) => {
    io.to(room).emit('message', {
      username: socket.username,
      content,
      time: Date.now()
    });
  });

  socket.on('leave', ({ username, room }) => {
    socket.leave(room);
    io.to(room).emit('system', `${username} 离开了聊天室`);
  });
});
```

### 2. 实时通知

```js
// 服务端
io.on('connection', (socket) => {
  // 用户登录后加入自己的房间
  socket.on('login', (userId) => {
    socket.join(`user:${userId}`);
  });
});

// 发送通知给特定用户
function sendNotification(userId, notification) {
  io.to(`user:${userId}`).emit('notification', notification);
}

// 触发通知
sendNotification(123, {
  title: '新消息',
  content: '您有新消息'
});
```

### 3. 在线状态

```js
// 服务端
const onlineUsers = new Set();

io.on('connection', (socket) => {
  socket.on('login', (userId) => {
    onlineUsers.add(userId);
    io.emit('online-users', Array.from(onlineUsers));
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(socket.userId);
    io.emit('online-users', Array.from(onlineUsers));
  });
});
```

### 4. 游戏实时同步

```js
// 服务端
io.on('connection', (socket) => {
  socket.on('player-move', ({ x, y }) => {
    // 更新玩家位置
    gameState.players[socket.id] = { x, y };
    // 广播给房间内其他玩家
    socket.to(gameState.room).emit('player-moved', {
      id: socket.id,
      x, y
    });
  });
});
```

---

## 常见问题

### 1. 心跳/保活

WebSocket 连接可能因为网络问题断开，需要心跳机制：

```js
// 客户端：每 30 秒发送心跳
setInterval(() => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'ping' }));
  }
}, 30000);

// 服务端：回复心跳
ws.on('message', (data) => {
  const msg = JSON.parse(data);
  if (msg.type === 'ping') {
    ws.send(JSON.stringify({ type: 'pong' }));
  }
});
```

### 2. 重连机制

```js
// 客户端自动重连
function connect() {
  const ws = new WebSocket('ws://localhost:3000');

  ws.onclose = () => {
    console.log('连接关闭，5秒后重连...');
    setTimeout(connect, 5000);
  };
}
```

### 3. 跨域处理

```js
// 服务端（CORS）
const io = new Server(server, {
  cors: {
    origin: ['https://your-domain.com'],
    methods: ['GET', 'POST']
  }
});
```

### 4. 负载均衡

WebSocket 长时间连接不适合轮询负载均衡，需要：

| 方案 | 说明 |
|------|------|
| **Sticky Session** | 同一连接路由到同一服务器 |
| **Redis Adapter** | Socket.IO 用 Redis 同步消息 |
| **MQTT** | 适合大规模消息推送 |

### 5. 监控与调试

```js
// 服务端日志
io.on('connection', (socket) => {
  console.log(`连接: ${socket.id} - ${new Date().toISOString()}`);
});

// 客户端调试
const ws = new WebSocket('ws://localhost:3000');
ws.onopen = () => console.log('连接成功');
ws.onclose = (e) => console.log('断开:', e.code, e.reason);
ws.onerror = (e) => console.error('错误:', e);
```

---

## 总结

| 项目 | 说明 |
|------|------|
| **协议** | ws（明文）/ wss（加密）|
| **特点** | 全双工、持久连接、实时推送 |
| **适用场景** | 聊天、实时协作、游戏、通知 |
| **安全性** | 使用 WSS、验证 Origin、身份认证 |
| **注意** | 心跳保活、自动重连、输入验证 |
