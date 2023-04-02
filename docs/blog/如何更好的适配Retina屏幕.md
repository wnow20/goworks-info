# 如何更好的适配Retina屏幕

直接上代码


```javascript
<body>
<script>
  function demo(radio, desc) {
    let container = document.createElement('div');
    container.id = 'container' + radio;
    let descElem = document.createElement("p");
    descElem.textContent = desc;
    container.appendChild(descElem);
    document.body.appendChild(container);
    var canvas = document.createElement('canvas');
    canvas.style.width = 200 + 'px';
    canvas.style.height = 40 + 'px';
    canvas.width = 200 * radio;
    canvas.height = 40 * radio;
    canvas.style.border = '1px solid red'
    container.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    ctx.scale(radio, radio);

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1;
    ctx.moveTo(20, 10.5);
    ctx.lineTo(180, 10.5);
    ctx.stroke();
    ctx.fillText("hello, world", 15, 20);
    ctx.fillText("你好, 世界", 15, 32)
  }

  demo(1, "不缩放");
  demo(2, "2倍屏");
  demo(3, "3倍屏");
  // 缩放浏览器也会改变devicePixelRatio的值，MAC可以使用快捷键CMD+加号/减号进行缩放
  demo(window.devicePixelRatio, '浏览器devicePixelRatio：'+ window.devicePixelRatio)
</script>
</body>
```

<br/>

说明：

`canvas.style.width` 是dom元素宽度

`canvas.width` 是画布宽度

`ctx.scale(radio, radio)` 提前设置好，后面不用考虑尺寸缩放问题，canvas会自动帮我们渲染正确的尺寸，比如，渲染100像素的线，只需要 `lineTo` 到100像素长即可，在画布里面的实际长度会自动乘以 `radio` 。

