
`defaultdict` 是 Python 标准库 `collections` 模块中的一个有用的子类，它提供了为字典中的键提供默认值的功能。如果尝试访问字典中不存在的键时，`defaultdict` 可以自动为该键创建一个初始值，而不引发 `KeyError` 异常。

### 使用示例

```python
from collections import defaultdict

# 定义一个defaultdict，其中int表示默认值为0的整数
default_dict = defaultdict(int)

# 访问不存在的键时，defaultdict会自动创建该键，并将其值设置为默认值0
print(default_dict['a'])  # 输出: 0

# 可以像普通字典一样进行赋值操作
default_dict['a'] += 1
print(default_dict['a'])  # 输出: 1

# 另一个例子：使用list作为默认值
list_default_dict = defaultdict(list)

# 访问不存在的键时，defaultdict会自动创建该键，并将其值设置为空列表
list_default_dict['a'].append(1)
print(list_default_dict['a'])  # 输出: [1]
```

### 常见用法

#### 1. 计数

使用 `defaultdict` 来简化计数任务。

```python
from collections import defaultdict

text = "hello world"
count = defaultdict(int)

for char in text:
    count[char] += 1

print(count)  # 输出: defaultdict(<class 'int'>, {'h': 1, 'e': 1, 'l': 3, 'o': 2, ' ': 1, 'w': 1, 'r': 1, 'd': 1})
```

#### 2. 聚合

使用 `defaultdict` 来聚合数据，例如将相同键的值收集到一个列表中。

```python
from collections import defaultdict

data = [('a', 1), ('b', 2), ('a', 3), ('b', 4)]
aggregation = defaultdict(list)

for key, value in data:
    aggregation[key].append(value)

print(aggregation)  # 输出: defaultdict(<class 'list'>, {'a': [1, 3], 'b': [2, 4]})
```

### 自定义默认值

可以使用任何可调用对象（如函数或类）来生成默认值。

```python
from collections import defaultdict

# 定义一个函数作为默认值
def default_value():
    return 'default'

custom_default_dict = defaultdict(default_value)

print(custom_default_dict['a'])  # 输出: 'default'
```

### 其他示例

#### 1. 使用 `set` 作为默认值

```python
from collections import defaultdict

set_default_dict = defaultdict(set)

set_default_dict['a'].add(1)
set_default_dict['a'].add(2)
set_default_dict['b'].add(3)

print(set_default_dict)  # 输出: defaultdict(<class 'set'>, {'a': {1, 2}, 'b': {3}})
```

#### 2. 使用自定义类作为默认值

```python
from collections import defaultdict

class Counter:
    def __init__(self):
        self.count = 0

    def increment(self):
        self.count += 1

custom_class_default_dict = defaultdict(Counter)

custom_class_default_dict['a'].increment()
custom_class_default_dict['a'].increment()
custom_class_default_dict['b'].increment()

print(custom_class_default_dict['a'].count)  # 输出: 2
print(custom_class_default_dict['b'].count)  # 输出: 1
```

### 总结

`defaultdict` 提供了一种简洁而有效的方法来处理字典中不存在的键，从而避免了手动初始化键值的繁琐工作。它非常适合用于计数、聚合和其他需要默认值的场景。