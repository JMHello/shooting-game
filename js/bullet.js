/**
 * Created by jm on 2017/8/11.
 */
/**
 *  子弹对象
 *  @param {Object} configObj 游戏基本配置
 */
var Bullet = function (configObj) {
    GameElement.call(this, configObj);
};
// 继承
inheritPrototype(Bullet, GameElement);

/**
 * 绘制子弹
 */
Bullet.prototype.draw = function (context) {
    // 法1
    // context.beginPath();
    // context.lineWidth = this.width;
    // context.strokeStyle = CONFIG.bulletColor;
    // context.moveTo(this.x, this.y);
    // context.lineTo(this.x, this.y - this.height);
    // context.stroke();

    /**
     * canvas语法
     * // ===
     * 1. 获取canvas环境上下文 - canvas.getContext('2d')
     * 2. 其他方法
           2.1 beginPath()：开始一条新的路径，并清空所有子路径，默认（0,0）
           2.2 closePath()：关闭路径
           2.3 bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y)
           2.4 quadraticCurveTo(cpx, cpy, x,  y)
           2.5 fill()：填充
           2.6 stroke()：描边
           2.7 clip()：创建新的剪切区域
     * 3. 绘制矩形
           3.1 rect(x, y, w, h) + stroke() 描边
           3.2 strokeRect(x, y, w, h) - 直接描边矩形
           3.3 fillRect(x, y, w, h) - 填充矩形
           3.4 clearRect(x, y, w, h) - 清除画布
     * 4. 绘制线条 + stroke()可描边
           4.1 moveTo(x, y)：把画笔移动到(x, y)坐标
           4.2 lineTo(x, y)：建立一个点到(x, y)坐标的直线
     * 5. 绘制圆弧
           5.1 arc(x, y, radius, startAngle, endAngle, anticClock)：startAngle - 弧度 -  2 * Math.PI
           5.2 arcTo(x1, y1, x2, y2, radius)
     * 6. 线条属性
       6.1 lineWidth：默认1px，小于0会被忽略
       6.2 linCap：线条两端的端点：
           butt - 无端点（默认）  round - 圆端点  square - 方端点
       6.3 lineJoin：两条线连接的方式
           round - 圆角  bevel - 斜角  miter - 尖角（默认）
     * 7. 线条颜色
       strokeStyle属性指定：可为颜色名称（red）、十六进制（#ff0000），rgba()
     * 8. 填充
       8.1 fillStyle = 颜色值 + fill() ===》实现填充
       8.2 canvas提供的渐变对象有两种
           8.2.a 线性渐变 - createLinearGradient(x0, y0, x1, y1)
           8.2.b 径向渐变 - createRadialGradient(x0, y0, r0, x1, y1, r1)
           创建渐变对象后，可以通过 渐变对象.addColorStop(offset（0-1范围）, color) 添加色标
     * 9. 图像api
       9.1 drawImage(image, dx, dy)
       9.2 drawImage(image, dx, dy, w, h)
       9.3 drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)
     * === //
     */

    var _self = this,
        offCanvasScreen = offCanvas.call(this, function (oContext) {
        oContext.fillStyle = CONFIG.bulletColor;
        oContext.fillRect(0, 0, _self.width, _self.height);
    });

    // 法2
    context.drawImage(offCanvasScreen,this.x, this.y);
};

/**
 * 子弹向上移动
 */
Bullet.prototype.moveUp = function () {
    this.move(0, -this.speed);
};
