/**
 * Created by jm on 2017/8/11.
 */

/**
 * 默认的游戏配置
 * @type {{status: string, planeWidth: number, planeHeight: number, planeImg: string, planeSpeed: number, bulletWidth: number, bulletHeight: number, bulletSpeed: number, bulletColor: string, enemyWidth: number, enemyHeight: number, enemySpeed: number, enemyDirection: string, enemyNormalImg: string, enemyBoomedImg: string}}
 */
var CONFIG = {
    status: 'start',
    level: 1, // 游戏默认关卡
    totalLevel: 6, // 游戏总关卡
    canvasPadding: 30, //画布间隔

    planeWidth: 60, // 飞机的宽度
    planeHeight: 100, // 飞机的高度
    planeImg: './img/plane.png', // 飞机的图片
    planeSpeed: 5, // 飞机的速度

    bulletWidth: 1, // 子弹的宽度
    bulletHeight: 10, // 子弹的高度
    bulletSpeed: 10, // 子弹的速度
    bulletColor: 'white', //子弹的颜色

    enemyPerLine: 7, //每行默认有7个敌人
    enemyWidth: 50, // 敌人的宽
    enemyHeight: 50, // 敌人的高
    enemySpeed: 2, // 敌人的速度
    enemyGap: 10, // 敌人的间隔
    enemyDirection: 'right', // 敌人初始的移动方向
    enemyNormalImg: './img/enemy.png', // 敌人正常时的图片
    enemyBoomedImg: './img/boom.png',// 敌人被消灭后的图片
    music: {
        bgm: '',
        lose: '',
        shoot: ''
    }
};

