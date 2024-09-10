在 Python 中，列表（list）是一种内置的数据结构，用于存储有序的可变集合。列表中的元素可以是不同类型的数据，包括数字、字符串、其他列表等。

### 创建列表

```python
# 创建一个空列表
empty_list = []

# 创建一个包含多个元素的列表
numbers = [1, 2, 3, 4, 5]
strings = ["apple", "banana", "cherry"]
mixed = [1, "apple", 3.14, [1, 2, 3]]
```

### 访问列表元素

```python
# 访问列表中的单个元素
print(numbers[0])  # 输出: 1
print(strings[1])  # 输出: banana

# 访问列表中的最后一个元素
print(numbers[-1])  # 输出: 5
```

### 修改列表元素

```python
# 修改列表中的元素
numbers[0] = 10
print(numbers)  # 输出: [10, 2, 3, 4, 5]
```

### 添加元素

```python
# 使用 append() 方法在列表末尾添加一个元素
numbers.append(6)
print(numbers)  # 输出: [10, 2, 3, 4, 5, 6]

# 使用 insert() 方法在指定位置插入一个元素
numbers.insert(1, 15)
print(numbers)  # 输出: [10, 15, 2, 3, 4, 5, 6]
```

### 删除元素

```python
# 使用 pop() 方法删除并返回列表中的最后一个元素
last_element = numbers.pop()
print(last_element)  # 输出: 6
print(numbers)  # 输出: [10, 15, 2, 3, 4, 5]

# 使用 del 关键字删除指定位置的元素
del numbers[1]
print(numbers)  # 输出: [10, 2, 3, 4, 5]

# 使用 remove() 方法删除指定值的元素
numbers.remove(3)
print(numbers)  # 输出: [10, 2, 4, 5]
```

### 列表操作

```python
# 列表连接
list1 = [1, 2, 3]
list2 = [4, 5, 6]
combined_list = list1 + list2
print(combined_list)  # 输出: [1, 2, 3, 4, 5, 6]

# 列表重复
repeated_list = list1 * 3
print(repeated_list)  # 输出: [1, 2, 3, 1, 2, 3, 1, 2, 3]

# 列表切片
sliced_list = combined_list[2:5]
print(sliced_list)  # 输出: [3, 4, 5]
```

### 列表遍历

```python
# 使用 for 循环遍历列表
for item in numbers:
    print(item)

# 使用列表推导式创建新的列表
squared_numbers = [x**2 for x in numbers]
print(squared_numbers)  # 输出: [100, 4, 16, 25]
```

### 常用列表方法

```python
# 统计元素出现的次数
count_of_4 = numbers.count(4)
print(count_of_4)  # 输出: 1

# 获取元素在列表中的索引
index_of_4 = numbers.index(4)
print(index_of_4)  # 输出: 2

# 反转列表
numbers.reverse()
print(numbers)  # 输出: [5, 4, 2, 10]

# 对列表进行排序
numbers.sort()
print(numbers)  # 输出: [2, 4, 5, 10]
```

以上是 Python 列表的基本用法和操作示例。通过这些操作，您可以创建、修改、遍历和操作列表中的元素。

