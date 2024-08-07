---
title: MP11 和抽象语法树
cover: cover.png
date: 2024-05-15
categories: 
  - 学习笔记
tags: 
  - C
  - Compiling
---

# MP11
这是某校某课的某作业，其内容是手搓半个C语言到LC-3汇编的编译器。
正常来讲编译源代码要先进行语法的拆解和分析（lexer & parser），再根据已经拆解开的“token”生成目标代码。
这个作业里，基于flex和bison的语法分析器已经做好了，可以先不关注那一部分，要写的部分是从AST（Abstract Syntax Tree）到汇编语言的转换。

## Abstract Syntax Tree
Abstract Syntax Tree, 抽象语法树，顾名思义，就是把被编译的源代码拆解成比较抽象的token，然后用一个树状的结构去表示这些token。
在一些场景里AST可以用`json`表示。这里用的是一个链表的形式。
``` c
struct ast220_t {
    ast220_type_t   type;       /* type of AST node                   */
    int32_t         value;      /* a number (PUSH_INT, DEBUG_MARKER)  */
    char*           name;       /* a string (PUSH_STR, VARIABLE)      */
    ast220_builtin_func_t fnum; /* function number (FUNC_CALL)        */
    ast220_t*       test;       /* test condition (IF_STMT, FOR_STMT) */
    ast220_t*       left;       /* left child/first operand           */
    ast220_t*       middle;     /* middle child (FOR_STMT)            */
    ast220_t*       right;      /* right child/second operand         */
    ast220_t*       next;       /* next AST node                      */
};
```
这是作业中关于AST链表节点的定义。这个树状的链表每一个节点能代表的东西很多。它可以是一个语句（statement），即C源文件里用分号分隔开的东西，其内容由left, middle, right定义，并且由next指向下一条语句；
也可能是一些更小的语法单元，比如加减乘除运算、赋值、调用函数等。

比如一个简单的语句在AST里就可以这样表示:
### 赋值语句
``` c
int a;
a = 1;
```

![ast_assign](ast_assign.png "赋值语句分解")

### 一般的抽象语法树
对于一个一般的程序而言，`ast220_t`定义的AST干的事情，就是把源代码的每一个语句拆成了一个树，然后语句间以链表的形式通过`ast220_t* next`连接。
![general_ast](general.png "一般的AST")

### 打印 Hello World

拆解一下hello world程序
``` c
#include <stdio.h>
int main()
{
    printf("Hello World\n");
    return 0;
}
```
![hello_world](hello_world.png "Hello World抽象语法树")

这一部分是lexer和parser已经为我们处理好的了。接下来把AST转化成汇编就好办了，根据文档内容逐个实现即可。

| AST Node | Definition |
| ----- | ----- |
| AST220_POP_STACK | `left` an expression to generate result |
| AST220 FUNC CALL | `fnum` defines the function type, `left` a linked list of argument on `next` |
| AST220_RETURN_STMT | `left` expression for return value |
| AST220_PUSH_STR | push a string `name` (pointer) on stack |
| AST220_PUSH_INT | push a int `value` on stack |

要做的事就是 pop stack 和 return 之前先生成一下它的`left` expression，function call 之前先生成它的`left`所指定的参数链表，然后实现对应`int`和`str`的生成即可，很简单吧（）

注：function call 得记得，栈上推了多少个参数，在函数执行之后就要出栈多少个参数，还要记得别把返回值搞丢了。

# 测试脚本
5.17更新：一个比较输出的脚本，用法：`./test.sh <input_filename>`

``` bash
make
if [ $# -eq 1 ]
then
	cat $1 | ./c220 > out.asm
	lc3as out.asm
	cat $1 | ./gold > gold.asm
	lc3as gold.asm
	diff <(lc3sim -s <(echo "f out"; echo "c")) <(lc3sim -s <(echo "f gold"; echo "c"))
else
	echo "Missing Input Files or bad arguments. Abropt."
	echo "Usage: ./test.sh <test filename>"
fi
```
