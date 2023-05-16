
# 在TypeScript中如何正确使用setTimeout

最简单的解决方案是使用类型推断并且不指定任何类型。

但如果你需要指定类型，因为浏览器和 node.js 声明之间的类型不一致，你可以使用 [ReturnType] 指定泛型为 setTimeout 的返回类型。

示例代码如下：

```ts
const timer: ReturnType<typeof setTimeout> = setTimeout(() => '', 300);
```

## 在React中如何使用setTimeout

因为在React组件存在声明周期，如果组件被销毁，需要清理 timer，下面是示例代码 :point_down: ：

```ts
import * as React from 'react'

React.useEffect(() => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  if (open) {
    timer = setTimeout(() => {
      // do something...
      timer = null
    }, 300);
  }
  return () => {
    timer && clearTimeout(timer)
    timer = null
  }
}, [open])
```

[ReturnType]: https://www.typescriptlang.org/docs/handbook/utility-types.html#returntypetype "ReturnType"
