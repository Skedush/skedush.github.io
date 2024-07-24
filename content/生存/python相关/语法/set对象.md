在 Python 中，`set` 是一种内置的数据结构，用于存储唯一的元素集合。`set` 的主要特点是无序、可变和不重复。你可以使用 `set` 来快速测试元素的存在性、去除重复项、以及执行数学集合操作等。

### 基本操作

1. **创建 `set`**

   ```python
   # 创建一个空的 set
   my_set = set()
   
   # 创建一个包含元素的 set
   my_set = {1, 2, 3, 4}
   ```

2. **添加元素**

   ```python
   my_set = {1, 2, 3}
   my_set.add(4)  # 添加单个元素
   print(my_set)  # 输出: {1, 2, 3, 4}
   ```

3. **删除元素**

   ```python
   my_set = {1, 2, 3, 4}
   my_set.remove(3)  # 删除元素，如果元素不存在会引发 KeyError
   print(my_set)     # 输出: {1, 2, 4}
   
   my_set.discard(2)  # 删除元素，如果元素不存在不会引发错误
   print(my_set)      # 输出: {1, 4}
   ```

4. **清空 `set`**

   ```python
   my_set = {1, 2, 3, 4}
   my_set.clear()  # 清空 set
   print(my_set)   # 输出: set()
   ```

5. **检查元素是否在 `set` 中**

   ```python
   my_set = {1, 2, 3, 4}
   print(2 in my_set)  # 输出: True
   print(5 in my_set)  # 输出: False
   ```

### 集合操作

1. **并集**

   ```python
   set1 = {1, 2, 3}
   set2 = {3, 4, 5}
   union_set = set1 | set2  # 或者 set1.union(set2)
   print(union_set)        # 输出: {1, 2, 3, 4, 5}
   ```

2. **交集**

   ```python
   set1 = {1, 2, 3}
   set2 = {3, 4, 5}
   intersection_set = set1 & set2  # 或者 set1.intersection(set2)
   print(intersection_set)        # 输出: {3}
   ```

3. **差集**

   ```python
   set1 = {1, 2, 3}
   set2 = {3, 4, 5}
   difference_set = set1 - set2  # 或者 set1.difference(set2)
   print(difference_set)        # 输出: {1, 2}
   ```

4. **对称差集**

   ```python
   set1 = {1, 2, 3}
   set2 = {3, 4, 5}
   symmetric_difference_set = set1 ^ set2  # 或者 set1.symmetric_difference(set2)
   print(symmetric_difference_set)        # 输出: {1, 2, 4, 5}
   ```

### 常见方法

- **`len(set)`**: 返回 `set` 中元素的数量。
- **`copy()`**: 创建 `set` 的浅拷贝。
- **`issubset()`**: 检查 `set` 是否是另一个 `set` 的子集。
- **`issuperset()`**: 检查 `set` 是否是另一个 `set` 的超集。

### 示例代码

```python
# 创建一个 set
numbers = {1, 2, 3, 4, 5}

# 添加元素
numbers.add(6)

# 删除元素
numbers.discard(4)

# 并集
another_set = {4, 5, 6, 7}
union = numbers | another_set

# 交集
intersection = numbers & another_set

# 打印结果
print("Numbers:", numbers)             # 输出: Numbers: {1, 2, 3, 5, 6}
print("Union:", union)                 # 输出: Union: {1, 2, 3, 4, 5, 6, 7}
print("Intersection:", intersection)   # 输出: Intersection: {5, 6}
```

`set` 是一种强大的数据结构，可以帮助你高效地处理集合操作和去重任务。