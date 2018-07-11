/**
 * Created by jm on 2017/8/16.
 */

/**
 * 游戏对象
 * @param {Object} configObj 游戏基本配置
 */
var GameElement = function (configObj) {
    this.x = configObj.x;
    this.y = configObj.y;
    this.width = configObj.width;
    this.height = configObj.height;
    this.speed = configObj.speed;
};
GameElement.prototype = {
    constructor: GameElement,
    move: function (x, y) {
        var vx = x || 0,
            vy = y || 0;

        this.x += vx;
        this.y += vy;
    },
    // 绘制，空方法，由子类重写
    draw:function () {}
};
