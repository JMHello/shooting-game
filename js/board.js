/**
 * Created by jm on 2017/8/11.
 */
/**
 * 键盘组件
 */

/*
 用js的键盘事件控制一个元素移动，当按下一个方向键不放，元素会先停顿一下，然后才开始持续移动。
 （原因：系统要区分用户是否连续输入，第一个到第二个之间有一个停顿时间）

 解决办法：按下左箭头，就设定 pressedLeft = true; 然后在动画的执行函数里面，判断是不是pressLeft，如果是则飞机向左绘制。
 当抬起左箭头，就要将pressedLeft = false，阻止飞机继续向左移动

 【这也是使元素一帧一帧移动的办法】
 */
var Board = {
    pressedLeft: false,
    pressedRight: false,
    pressedSpace: false,
    pressedUp: false,
    pressDown: false,
    // 策略模式：减少在按键盘时候的判断
    strategy: {
        32: function (type) {
            if (/keydown/.test(type)) {
                this.pressedSpace = true;
            } else {
                this.pressedSpace = false;
            }
        },
        // 左箭头
        37: function (type) {
            if (/keydown/.test(type)) {
                this.pressedLeft = true;
                this.pressedRight = false;
            } else {
                this.pressedLeft = false;
            }
        },
        // 上箭头
        38: function (type) {
            if (/keydown/.test(type)) {
                this.pressedUp = true;
                this.pressDown = false;
            } else {
                this.pressedUp = false;
            }
        },
        // 右箭头
        39: function (type) {
            if (/keydown/.test(type)) {
                this.pressedLeft = false;
                this.pressedRight = true;
            } else {
                this.pressedRight = false;
            }
        },
        // 下箭头
        40: function (type) {
            if (/keydown/.test(type)) {
                this.pressDown = true;
                this.pressedUp = false;
            } else {
                this.pressDown = false;
            }
        }
    },
    // 键盘组件初始化
    init: function () {
        var fn = function (e) {
            var ev = getEvent(e),
                code = ev.charCode || ev.which || ev.keyCode;

            console.log(code)
            if (this.strategy[code]) {
                this.strategy[code].call(this, ev.type);
            }
        }.bind(this);

        addHandler(doc, 'keydown', fn, false);
        addHandler(doc, 'keyup', fn, false);
    }
};
