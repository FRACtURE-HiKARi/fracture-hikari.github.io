---
title: MP11 和抽象语法树
---

# MP11
这是某校某课的某作业，其内容是手搓半个C语言到LC-3汇编的编译器。
基于flex和bison的语法分析器已经做好了，要写的部分是从AST到汇编语言的转换。

~~施工中啊吧啊吧~~

```C
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
这是作业中关于