---
slug: hello-blog
title: 博客上线 · 为什么这个博客用 Markdown
date: 2026-09-10
---

博客模块上线了。**简单**，但够用：整站还是那套终端风格的 React 工程，没有引入后端，文章以 Markdown 为唯一信源。

## 它能做什么

- 用 **Markdown** 写作：标题、*强调*、`行内代码`、列表、表格都支持
- 代码块带等宽主题配色，适合贴技术片段
- 每篇文章一个独立链接，分享出去可直接打开
- 支持图片，比如下面这张（内联 SVG，离线可用）：

![guji 检索管线示意](data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='560'%20height='150'%3E%3Crect%20width='560'%20height='150'%20rx='10'%20fill='%230b0c0f'%20stroke='%23e8b54a'%20stroke-opacity='0.45'/%3E%3Ctext%20x='24'%20y='42'%20font-family='monospace'%20font-size='15'%20fill='%23e8b54a'%3E$%20guji%20检索管线%3C/text%3E%3Ctext%20x='24'%20y='78'%20font-family='monospace'%20font-size='13'%20fill='%23e6e1d5'%3E15.4%20亿字语料%20→%20vec%20/%20fts%20/%20hybrid%20→%20名书优先重排%3C/text%3E%3Ctext%20x='24'%20y='108'%20font-family='monospace'%20font-size='12'%20fill='%238f8a7d'%3Efts%20连文命中%20=%20直引唯一标准%3C/text%3E%3Ctext%20x='24'%20y='132'%20font-family='monospace'%20font-size='11'%20fill='%235b574d'%3EMCP%20服务化%20·%20agent%20会话内直接调用%3C/text%3E%3C/svg%3E)

> 写作的目标不是发布，而是把想法沉淀成能长期服役的工具。

## 代码块示例

```python
def safe_div(a, b):
    """b 为 0 时返回正无穷，而不是抛异常。"""
    return a / b if b else float('inf')


print(safe_div(1, 0))  # inf
```

### 使用提示

1. 博客页右上角「新建文章」进入编辑器
2. 列表按发布时间倒序
3. 转载请注明出处
