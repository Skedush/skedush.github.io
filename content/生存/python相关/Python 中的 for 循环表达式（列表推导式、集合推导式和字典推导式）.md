
Python 中的 for 循环表达式（列表推导式、集合推导式和字典推导式）可以在一行代码中高效地处理循环和条件逻辑。以下是一些常用的 for 循环表达式的示例：

### 列表推导式

```python
# 普通的for循环
squares = []
for x in range(10):
    squares.append(x**2)
print(squares)  # 输出: [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]

# 列表推导式
squares = [x**2 for x in range(10)]
print(squares)  # 输出: [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]
```

### 列表推导式带条件

```python
# 普通的for循环带条件
even_squares = []
for x in range(10):
    if x % 2 == 0:
        even_squares.append(x**2)
print(even_squares)  # 输出: [0, 4, 16, 36, 64]

# 列表推导式带条件
even_squares = [x**2 for x in range(10) if x % 2 == 0]
print(even_squares)  # 输出: [0, 4, 16, 36, 64]
```

### 集合推导式

```python
# 普通的for循环
unique_squares = set()
for x in range(10):
    unique_squares.add(x**2)
print(unique_squares)  # 输出: {0, 64, 1, 4, 36, 9, 16, 49, 81, 25}

# 集合推导式
unique_squares = {x**2 for x in range(10)}
print(unique_squares)  # 输出: {0, 64, 1, 4, 36, 9, 16, 49, 81, 25}
```

### 字典推导式

```python
# 普通的for循环
squares_dict = {}
for x in range(10):
    squares_dict[x] = x**2
print(squares_dict)  # 输出: {0: 0, 1: 1, 2: 4, 3: 9, 4: 16, 5: 25, 6: 36, 7: 49, 8: 64, 9: 81}

# 字典推导式
squares_dict = {x: x**2 for x in range(10)}
print(squares_dict)  # 输出: {0: 0, 1: 1, 2: 4, 3: 9, 4: 16, 5: 25, 6: 36, 7: 49, 8: 64, 9: 81}
```

### 带多个循环的推导式

```python
# 普通的for循环
combinations = []
for x in range(3):
    for y in range(3):
        combinations.append((x, y))
print(combinations)  # 输出: [(0, 0), (0, 1), (0, 2), (1, 0), (1, 1), (1, 2), (2, 0), (2, 1), (2, 2)]

# 列表推导式
combinations = [(x, y) for x in range(3) for y in range(3)]
print(combinations)  # 输出: [(0, 0), (0, 1), (0, 2), (1, 0), (1, 1), (1, 2), (2, 0), (2, 1), (2, 2)]
```

这些推导式可以使代码更简洁，更易读。在需要处理复杂的嵌套循环或条件逻辑时，它们特别有用。