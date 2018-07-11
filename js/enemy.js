/**
 * Created by jm on 2017/8/11.
 */
/**
 * 敌人对象
 */
var Enemy = function (configObj) {
    GameElement.call(this, configObj);

    // 敌人移动的左边界
    this.minX = configObj.minX;
    // 敌人移动的右边界
    this.maxX = configObj.maxX;

    // 初设置敌人的状态为正常
    this.status = 'normal';

    // 敌人被消灭时，持续的帧数
    this.num = 0;
};

// 继承
inheritPrototype(Enemy, GameElement);

/**
 * 绘制敌人
 */
Enemy.prototype.draw = function (context) {
    var status = this.status;

    // 根据状态判断
    switch (status) {
        case 'normal': // 敌人正常时的图片绘制
            // 绘制图片
            drawImage.call(this, CONFIG.enemyNormalImg, context);
            break;
        case 'eliminated': // 敌人被消灭时的图片绘制
            drawImage.call(this, CONFIG.enemyBoomedImg, context);
            break;
    }
};

/**
 *  移动敌人
 */
Enemy.prototype.translate = function (direction) {
    var speed = this.speed;

    switch (direction) {
        case 'left' :
            this.move(-speed, 0);
            break;
        case 'right' :
            this.move(speed, 0);
            break;
        case 'down' :
            this.move(0, this.height);
            break;
    }
};

/**
 * 敌人被灭
 */
Enemy.prototype.eliminate = function () {
    this.status = 'booming';

    // 敌人死亡过程持续3帧
    if(++this.num === 3) {
        this.status = 'eliminated';
    }
};
