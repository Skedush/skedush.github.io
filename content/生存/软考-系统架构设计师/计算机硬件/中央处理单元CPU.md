- CPU的组成：CPU 主要由`运算器`、`控制器`、`寄存器组`和`内部总线`等部件组成
- 运算器：由`算术逻辑单元ALU`（实现对数据的算术和逻辑运算）、`累加寄存器AC`（运算结果或源操作数的存放区）、`数据缓冲寄存器DR`：(暂时存放内存的指令或数据）、和`状态条件寄存器PSW`(保存指令运行结果的条件码内容，如溢出标志等）组成。执行所有的`算术运算`，如加減乘除等；执行所有的`逻辑运算`并进行`逻辑测试`，如与、或、非、比较等。
- 控制器：由`指令寄存器IR`（暂存CPU执行指令）、`程序计数器PC`（存放指令执行地址）、 `地址寄存器AR` （保存当前CPU所防问的内存地址）、`指令译码器ID`（分析指令操作码） 等组成。控制整个CPU的工作，最为重要。
- ﻿CPU依据指令`周期`的`不同阶段`来区分`二进制`的指令和数据，因为在`指令周期的不同阶段`，指令会命令CPU分别去取`指令`或者`数据`。