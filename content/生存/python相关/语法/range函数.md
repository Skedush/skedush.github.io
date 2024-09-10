在 Python 中，`range()` 函数用于生成一个整数序列，通常用于循环中。它不返回列表，而是返回一个 **range 对象**，这是一个可迭代的对象。

### 基本语法
```python
range(start, stop, step)
```

- **start**：序列开始的值，默认为 0。
- **stop**：序列结束的值（不包括 stop 本身）。
- **step**：步长（间隔），默认为 1。

### 示例

1. **仅提供 stop 值：**
   ```python
   for i in range(5):
       print(i)
   ```
   **输出：**
   ```
   0
   1
   2
   3
   4
   ```
   （从 0 开始，直到 4，步长为 1）

2. **提供 start 和 stop 值：**
   ```python
   for i in range(2, 6):
       print(i)
   ```
   **输出：**
   ```
   2
   3
   4
   5
   ```

3. **提供 start, stop 和 step 值：**
   ```python
   for i in range(0, 10, 2):
       print(i)
   ```
   **输出：**
   ```
   0
   2
   4
   6
   8
   ```

4. **使用负步长：**
   ```python
   for i in range(10, 0, -2):
       print(i)
   ```
   **输出：**
   ```
   10
   8
   6
   4
   2
   ```

### 转换为列表
如果想要将 `range` 转换为列表，可以使用 `list()` 函数：

```python
list(range(5))  # [0, 1, 2, 3, 4]
```

### 总结
- `range()` 常用于 `for` 循环，生成数字序列。
- 如果只传一个参数，它是 stop 值，序列从 0 开始。
- 可以指定起点、终点和步长。