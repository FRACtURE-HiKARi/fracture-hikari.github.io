---
title: 用Sympy库计算泰勒展开式并估算拉格朗日余项
cover: cover.png
math: true
categories: 
  - 学习笔记
tags: 
  - Python
---

# Sympy与Numpy
这里我们用到了sympy符号计算库和numpy数值计算库。
符号计算和数值计算有何区别，还烦请读者自行搜索（

## 用Sympy求泰勒展开和求n阶导
泰勒公式定义如下：
$$f(x)= \sum_{n=0}^{ \infty } \frac{f^{(n)}(a)(x-a)^n}{n!} $$

或者是带有拉格朗日余项的形式，其中$R_n(x)$是拉格朗日余项。

$$ f(x)=f(a) + f^{(1)}(a)(x-a) + \frac{f^{(2)}(a)(x-a)^2}{2!} + ... + \frac{f^{(n)}(a)(x-a)^n}{n!} + R_n(x) $$

为此我们先导入需要的库
``` python
import sympy as sp
import numpy as np
import matplotlib.pyplot as plt
```
定义相关参数，包括展开的阶数，中心点等
``` python
a = 1 # point
n = 3 # order
s = 2 # picture size
interval = (0.7, 1.3)
```
声明sympy变量，定义函数，并进行展开。这里以$f(x)=x\cos(x)$为例。
``` python
x = sp.symbols('x')
f = x*sp.cos(x)
t = f.series(x, a, n+1).removeO()
```
如果是在类似Jupyter Notebook的交互式计算环境里，单独开一个Cell并输入`t`，就能看到展开式了。
``` python
t
```
$- \frac{x^{3}}{2} + x$

## 用Numpy和Matplotlib绘图
这里的算出来的`f`和`t`都是Sympy的对象，我们需要用Sympy提供的`lambdify`方法将其转为适用于Numpy的lambda函数。
``` python
fn = sp.lambdify('x', f, 'numpy')
tn = sp.lambdify('x', t, 'numpy')
```
声明一组均匀分布的数值作为绘图的横坐标集，然后绘制相关图线并进行标注。
``` python
# 横坐标集合，这里用了最开始的“大小”来控制图像范围
xn = np.linspace(a-s/2, a+s/2, 1000)
# 绘制曲线
plt.plot(xn, fn(xn))
plt.plot(xn, tn(xn), linestyle='--') # 泰勒公式拟合结果，设置为虚线
# 用matplotlib自带的latex渲染功能设置标题
latex = sp.latex(t, order='igrlex', ln_notation=True)
plt.title(r'$'+ latex +'$')
# 设置绘图横纵坐标限制
plt.xlim(a-s/2, a+s/2)
plt.ylim(fn(a)-s/2, fn(a)+s/2)
plt.grid() # 开启网格
plt.show() # 显示图片
```
![fit_result](fit1.png "绘图结果")

## 估算拉格朗日余项
根据拉格朗日余项的性质，我们知道：对于任意$|x-a|\le d$ 都有 $|f^{n+1}(x)|\le M$ 则对于这样的 $x$ 有 $|R_n(x)| \le \frac{M}{(n+1)!}|x-a|^{n+1}$。我们可以通过这种方式估算拉格朗日余项的最大值。
先求 n+1 阶导$f^(n+1)(a)$。
``` python
fn1 = abs(sp.diff(f, x, n+1))
```
同样的我可以像获取`t`一样获取`fn1`：$\left|{x \cos{\left(x \right)} + 4 \sin{\left(x \right)}}\right|$

接下来就可以通过这个式子获取它的最大值了。Sympy自带的最大值功能似乎对于带有绝对值的函数有些问题，而小范围内这个结果一般是单调的，所以我采用了绘图加观察的方式。当然也可以分别求出两个区间端点并取二者之大，此处为了简洁此处没有采用这样的方法。

如法炮制的转成lambda函数的可视化：
``` python
plt.plot(xn, sp.lambdify('x', fn1, 'numpy')(xn))
plt.xlim(*interval)
M = fn1.evalf(subs={'x':interval[1]})
```
然后计算不等式中的另一部分 $N=Max(|\frac{x^{n+1}}{(n+1)!}|)$
``` python
N = (sp.Pow(x-a, n+1)/sp.factorial(n+1)).evalf(subs={'x': interval[1]})
```
因为这是一段单调递增的函数，所以就直接取了区间右端点。

$$|R_n(x)| \le \frac{M}{(n+1)!}|x-a|^{n+1} = MN$$

输出结果：
``` python
print(M*N)
```

绘制余项的变化图：（仍然是如法炮制）
``` python
Rn = sp.lambdify('x', R, 'numpy')
plt.plot(xn, Rn(xn))
```
![Remaining](remaining.png "余项的变化")

## 计算能够精确到某个误差范围内的拟合范围
这样的范围的定义是：对于任意实数 $x,\epsilon$ 和集合 $A$，如果 $x \in A$ 则 $|T_n(x)| < \epsilon$。

这是一个比较暴力的方法：
``` python
err = 1e-6 # 定义误差
step = 1e-4 # 求解精度的十分之一
sol = a
while Rn(sol) < err:
    sol += step
print(sol)
```
强行遍历求出范围，其实不会消耗太多资源。这里用的是生成的lambda函数，速度比较快。如果用Sympy自带的`R.evalf(subs={'x': sol})`则会慢很多很多。