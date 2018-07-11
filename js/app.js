/**
 * @author 张静宜  471938302@qq.com
 * @overview p5项目 - 射击游戏 - 主逻辑函数
 */
// 获取元素
var doc = document,
    container = doc.getElementById('game'),
    canvas = doc.getElementById('canvas'),
    canvasWidth = canvas.width,
    canvasHeight = canvas.height,
    progressRunning = doc.querySelector('.progress-running'),
    progressPercentage = doc.querySelector('.progress-percentage'),
    progressDes = doc.querySelector('.progress-des'),
    context;

const resources = {
    images: [
        'img/plane.png',
        'img/enemy.png',
        'img/boom.png'
    ],
    audios: [
        'audio/bgm',
        'audio/lose',
        'audio/shoot',
    ]
}

if (canvas.getContext) {
    context = canvas.getContext('2d');
} else {
    alert('您的浏览器不支持canvas!');
}

/**
 * 整个游戏对象
 */
var GAME = {
    getEles: function () {
        this.finalScore = doc.querySelector('.score');
        this.gameNextLevel = doc.querySelector('.game-next-level');
    },
    /**
     * 初始化函数,这个函数只执行一次
     * @param  {Object} configObj 游戏配置对象
     */
    init: function(configObj) {
        // 获取元素
        this.getEles();

        var option = Object.assign({},CONFIG, configObj), // 基本配置的游戏对象
            canvasPadding = option.canvasPadding, // 画布边距
            maxHeight = canvasHeight - canvasPadding - option.planeHeight, // 飞机以及敌人在y轴上的最大高度
            planeWidth = option.planeWidth, // 飞机宽度
            planeHeight = option.planeHeight; // 飞机宽度

        this.option = option;
        this.cP = canvasPadding;

        // 初始关卡数
        this.currentLevel = option.level;

        // 飞机
        this.plane = null;
        // 飞机的初始x坐标
        this.planeX = parseFloat((canvasWidth  - planeWidth) / 2);
        // 飞机的初始y坐标
        this.planeY = maxHeight;
        // 飞机移动的左边界
        this.planeMinX = canvasPadding;
        // 飞机移动的右边界
        this.planeMaxX = canvasWidth - planeWidth - canvasPadding;
        // 飞机移动的下边界
        this.planeMinY = canvasPadding
        // 飞机移动的上边界
        this.planeMaxY = canvasHeight - planeHeight - canvasPadding

        // 敌人
        this.enemies = null;
        // 敌人移动的左边界
        this.enemyMinX = canvasPadding;
        // 敌人移动的右边界
        this.enemyMaxX = canvasWidth - option.enemyWidth - canvasPadding;
        // 敌人向下移动的界限
        this.enemyDownLimit = maxHeight;

        // 键盘
        this.board = Board;

        // 游戏的状态：游戏开始
        this.status = 'start';
        this.setStatus(this.status);

        // 默认游戏分数为0
        this.score = 0;

        // 事件监听
        this.bindEvent();

    },
    bindEvent: function() {
        var _self = this;

        /**
         * 事件流，也称为事件模型 - 三个阶段
         * 事件流描述的是从页面接收事件的顺序
         * // ===
         * 1. 事件捕获：不太具体的元素应该更早接收到事件，而具体的节点是最后接收到事件
         * 2. 处于目标
         * 3. 事件冒泡：与事件捕获相反
         * === //
         */

        /**
         * 事件委托：
         * // ===
         * 1. 原理：利用冒泡机制，将一个元素的响应事件委托给其父元素或者更外层的元素
         * 2. 优点：
           2.1 减少内存消耗 - 比如一个ul有成千上万个li，如果为每一个li都绑定事件那么对于内存消耗会十分大
           2.2 动态绑定事件 - 对于有些元素是动态生成的，通过事件委托，仍然可以为新生成的元素绑定事件
         * === //
         */
        addHandler(container, 'click', function (e) {
            var target = getTarget(getEvent(e));

            // 第一次玩/重新玩游戏
            if(hasClass(target, 'js-play') || hasClass(target, 'js-replay')) {
                // 重置分数和关卡数
                _self.resetLevelAndScore();

                _self.play();
            } else if (hasClass(target, 'js-next')) { // 玩下一关游戏
                _self.play();
            }
        }, false);

        this.board.init();
    },
    /**
     * 更新游戏状态，分别有以下几种状态：
     * start  游戏前
     * playing 游戏中
     * failed 游戏失败
     * success 游戏成功
     * stop 游戏暂停
     */
    setStatus: function(status) {
        this.status = status;
        container.setAttribute("data-status", status);
    },
    /**
     * 启动游戏
     */
    play: function() {
        // 创建飞机
        this.createPlane();

        // 创建敌人
        this.createEnemies();

        // 游戏状态：游戏中
        this.setStatus('playing');

        // 更新动画
        this.update();
    },
    /**
     * 动画循环三要素
     * // ===
             |--------->  更新操作 -----|
             |                          |
              --绘制操作 <- 清除操作 <--|
     * === //
     */
    /**
     * 更新游戏动画
     */
    update: function () {
        var _self = this,
            enemiesLength,
            lastEnemy;

        // 清除飞机
        this.clearPlane();

        // 清除敌人
        this.clearEnemy();

        // 清除分数
        this.clearScore();

        // 更新飞机的动画
        this.updatePlane();

        // 更新敌人的动画
        this.updateEnemies();

        // 绘制
        this.draw();

        // 如果飞机与任意一个怪兽碰撞，游戏就结束
        for (let enemy of this.enemies) {
            if (this.plane.crash(true, enemy, context)) {
                // 游戏状态：闯关失败
                this.endGame('failed');

                // 获取最终得分
                this.getFinalScore();

                return
            }
        }

        // 在敌人完全被消灭的情况下，阻止动画的更新
        enemiesLength = this.enemies.length;
        if (enemiesLength === 0) {
            // 闯完所有关
            if (this.currentLevel === this.option.totalLevel) {
                this.endGame('all-success');
            } else { // 闯完一关
                this.endGame('success');

                // 更新关卡数
                this.updateLevel();
            }
            return;
        }

        // 只要有一个敌人到了下边界，就证明敌人没有被飞机全部消灭，那么此时游戏闯关失败
        // 换位思考：选择最后一个敌人作为参照点
        lastEnemy = this.enemies[this.enemies.length - 1];
        if (lastEnemy.y >= this.enemyDownLimit) {
            // 游戏状态：闯关失败
            this.endGame('failed');

            // 获取最终得分
            this.getFinalScore();

            return;
        }

        /**
         * setTimeout 和 setInterval
         * // ===
         * 1. timeId = setTimeout(fn, time-ms) - 超时调用 - 在指定的时间过后执行代码
              关闭定时器：clearTimeout(timeId)
         * 2. intervalId = setInterval(fn, time-ms) - 间歇调用 - 每隔指定时间就执行一次代码
              关闭定时器：clearInterval(intervalId)
         * === //
         */

        /**
         * requestAnimationFrame
         * // ===
         * 1. 为什么不使用setTimeout【使用setTimeout实现动画，会出现卡顿、抖动现象】
           1.1 setTimeout的执行时间并不确定。在js中，setTimeout任务会被放进任务队列中，只有当主线程
               上的任务执行完后，才会到队列中查看有什么任务需要执行。
              【setTimeout 的实际执行时间一般要比其设定的时间晚一些。】
           1.2 刷新频率受屏幕分辨率和屏幕尺寸的影响，因此不同设备的屏幕刷新频率可能会不同，
               而 setTimeout只能设置一个固定的时间间隔，这个时间不一定和屏幕的刷新时间相同。

           以上两种情况都会导致setTimeout的执行步调和屏幕的刷新步调不一致，从而引起丢帧现象
         * 2. requestAnimationFrame
           2.1 优势：
             与setTimeout相比，requestAnimationFrame最大的优势是 【由系统来决定回调函数的执行时机。】
             如果屏幕刷新率是60Hz,那么回调函数就每16.7ms被执行一次，如果刷新率是75Hz，那么这个时间间隔就变成了1000/75=13.3ms
             它能保证回调函数在屏幕每一次的刷新间隔中只被执行一次，这样就不会引起丢帧现象，也不会导致动画出现卡顿的问题。

            CPU节能：当页面处理未激活的状态下，该页面的屏幕刷新任务也会被系统暂停，因此跟着系统步伐走的requestAnimationFrame也会停止渲染，当页面被激活时，动画就从上次停留的地方继续执行，有效节省了CPU开销。
            函数节流：在高频率事件(resize,scroll等)中，为了防止在一个刷新间隔内发生多次函数执行，使用requestAnimationFrame可保证每个刷新间隔内，函数只被执行一次，这样既能保证流畅性，也能更好的节省函数执行的开销。
         * === //
         */
        requestAnimationFrame(function () {
            _self.update();
        });
    },
    /**
     * 绘制动画元素
     */
    draw: function () {

        // 绘制飞机
        this.plane.draw(context);

        // 绘制敌人
        this.enemies.forEach(function (item) {
            item.draw(context);
        });

        // 绘制分数
        this.drawScore();
    },
    playMusic: function (name) {
        const src = CONFIG.music[name]

        let audio = new Audio(src)
        audio.addEventListener('canplaythrough', (e) => {
            if (this.status === 'playing') {
                audio.play()
                console.log(this.status)

            } else {
                audio.pause()
                console.log('11' + this.status)

            }
        })
    },
    /**
     * 创建飞机
     */
    createPlane: function () {
        var option = this.option;

        this.plane = new Plane({
            x: this.planeX,
            y: this.planeY,
            width: option.planeWidth,
            height: option.planeHeight,
            speed: option.planeSpeed,
            minX: this.planeMinX,
            maxX: this.planeMaxX,
            minY: this.planeMinY,
            maxY: this.planeMaxY
        });
    },
    /**
     * 创建敌人
     */
    createEnemies: function () {
        var option = this.option,
            enemyPerLine = option.enemyPerLine,
            enemyGap = option.enemyGap,
            enemyWidth = option.enemyWidth,
            enemyHeight = option.enemyHeight,
            enemySpeed = option.enemySpeed,
            padding = this.cP;

        // 每次创建敌人前，需清空数组
        this.enemies = [];

        // 外循环控制敌人行数，内循环控制敌人列数
        for (var i = 0; i < this.currentLevel; i++) {
            for (var j = 0; j < enemyPerLine; j++) {
                var enemy = {
                    x: padding + j * (enemyWidth + enemyGap),
                    y: padding + i * (enemyHeight + enemyGap),
                    width: enemyWidth,
                    height: enemyHeight,
                    speed: enemySpeed
                };

                this.enemies.push(new Enemy(enemy));
            }
        }

    },
    /**
     * 更新飞机动画
     */
    updatePlane: function () {
        var board = this.board,
            plane = this.plane;


        // 左箭头：左移
        if (board.pressedLeft) {
            plane.translateX('left');
        }

        // 右箭头：右移
        if (board.pressedRight) {
            plane.translateX('right');
        }

        // 上箭头：上移
        if (board.pressedUp) {
            plane.translateY('top');
        }

        // 下箭头：下移
        if (board.pressDown) {
            plane.translateY('bottom');
        }

        // 空格键：射击
        if (board.pressedSpace) {
            board.pressedSpace = false;
            plane.shoot();
        }

    },
    /**
     * 更新敌人动画
     */
    updateEnemies: function () {
        var plane = this.plane,
            enemies = this.enemies,
            len = enemies.length,
            boundary = getXBoundary(enemies),
            isDown = false; // 默认不能向下移动

        // 边界判断
        if (boundary.minX < this.enemyMinX || boundary.maxX > this.enemyMaxX) {
            // 修改敌人水平移动的方向（注意：敌人做的是反弹运动）
            this.option.enemyDirection = this.option.enemyDirection === 'right' ? 'left' : 'right';

            // 当敌人做反向运动的那一刻，敌人都会向下移动
            isDown = true;
        }

        // 正常从 0 开始循环遍历数组有可能会出错，因为循环过程中调用 splice 方法删除数组的项，
        // 这样会影响数组后面项的序号，所以应该从数组后面开始遍历，这样就不会影响前面项
        while (len--) {
            var enemy = enemies[len],
                status = enemy.status;

            // 如果 isDown = true，敌人做向下运动
            if (isDown) {
                enemy.translate('down');
            }

            // 敌人水平移动
            enemy.translate(this.option.enemyDirection);

            // 判断敌人的状态
            switch (status) {
                case 'normal': // 敌人正常
                    if (plane.crash(false, enemy, context)) {
                        enemy.eliminate();
                        context.clearRect(enemy.x, enemy.y, enemy.width, enemy.height);
                    }
                    break;
                case 'booming': // 敌人被消灭中
                    enemy.eliminate();
                    break;
                case 'eliminated': // 敌人被消灭
                    // 在数组中删除已被消灭的敌人
                    enemies.splice(len, 1);

                    // 更新分数
                    this.updateScore();
                    break;
            }
        }
    },
    /**
     * 更新关卡数
     */
    updateLevel: function () {
        this.gameNextLevel.innerHTML = '下一个Level：' + (++this.currentLevel);
    },
    /**
     * 更新分数
     */
    updateScore: function () {
        ++this.score;
    },
    /**
     * 清除画布
     */
    clearScreen: function () {
        context.clearRect(0, 0, canvasWidth, canvasHeight);
    },
    clearPlane: function () {
        var plane = this.plane;
        context.clearRect(plane.x, plane.y, plane.width, plane.height);
    },
    clearEnemy: function () {
        this.enemies.forEach(function (item) {
            context.clearRect(item.x, item.y, item.width, item.height);
        })
    },
    clearScore: function () {
        context.clearRect(0, 0, 100, 70);
    },
    /**
     * 绘制分数
     */
    drawScore: function () {
        var _self = this,
            offScreenCanvas = offCanvas(function (oContext) {
                oContext.font = '18px';
                oContext.fillStyle = 'white';
                oContext.fillText('分数：' + (_self.score), 20, 20);
        }, {
            width: 100,
            height: 70
        });
       context.drawImage(offScreenCanvas, 0, 0);
    },
    /**
     * 得到最终分数
     */
    getFinalScore: function () {
        this.finalScore.innerHTML = this.score;
    },
    /**
     * 重置关卡数和分数
     */
    resetLevelAndScore: function () {
        // 重置关卡数为第一关
        this.currentLevel = 1;
        // 重置分数为0
        this.score = 0;
    },
    /**
     * 游戏结束
     * @param {String} status 游戏状态
     */
    endGame: function (status) {
        // 清除画布
        this.clearScreen();
        // 修改游戏状态
        this.setStatus(status);
    }
};

// var preloadImg = new PreloadImg({
//     // 图片资源
//     resources : [
//        'img/plane.png',
//        'img/enemy.png',
//        'img/boom.png'
//     ],
//     // 图片正在加载
//     onProgress : function(current, total){
//         var per = Math.round(current / total * 100) + '%';
//
//         progressRunning.style.transform= 'scaleX(' + per + ')';
//         progressPercentage.innerHTML = per;
//
//         if(current === total) {
//             progressDes.innerHTML = '游戏加载完毕';
//         }
//     },
//     // 图片加载完毕
//     onComplete : function(){
//         // 图片的路径
//         var planeSrc = CONFIG.planeImg,
//             enemyNormalSrc = CONFIG.enemyNormalImg,
//             enemyBoomedSrc = CONFIG.enemyBoomedImg;
//
//         CONFIG.planeImg = new Image();
//         CONFIG.enemyNormalImg = new Image();
//         CONFIG.enemyBoomedImg = new Image();
//
//         CONFIG.planeImg.src = planeSrc;
//         CONFIG.enemyNormalImg.src = enemyNormalSrc;
//         CONFIG.enemyBoomedImg.src = enemyBoomedSrc;
//
//         // 图片加载完毕后，延迟300ms才出现游戏界面，这样可以增加进度条与游戏界面的过渡性
//         setTimeout(function () {
//             // 游戏初始化
//             GAME.init();
//         },500);
//     }
// });
//
// // 图片预加载开始
// preloadImg.start();



preloadResource.init({
    // 图片资源
    resources : resources,
    // 图片正在加载
    onProgress : function(current, total){
        var per = Math.round(current / total * 100) + '%';

        progressRunning.style.transform= 'scaleX(' + per + ')';
        progressPercentage.innerHTML = per;

        if(current === total) {
            progressDes.innerHTML = '游戏加载完毕';
        }
    },
    // 图片加载完毕
    onComplete : function(total, audios){
        // 图片的路径
        var planeSrc = CONFIG.planeImg,
            enemyNormalSrc = CONFIG.enemyNormalImg,
            enemyBoomedSrc = CONFIG.enemyBoomedImg;

        CONFIG.planeImg = new Image();
        CONFIG.enemyNormalImg = new Image();
        CONFIG.enemyBoomedImg = new Image();

        CONFIG.planeImg.src = planeSrc;
        CONFIG.enemyNormalImg.src = enemyNormalSrc;
        CONFIG.enemyBoomedImg.src = enemyBoomedSrc;

        for (var item in CONFIG.music) {
            for (let m of audios) {
                if (m.includes(item)) {
                    CONFIG.music[item] = m
                }
            }
        }

        // 图片加载完毕后，延迟300ms才出现游戏界面，这样可以增加进度条与游戏界面的过渡性
        setTimeout(function () {
            // 游戏初始化
            GAME.init();
        },500);
    }
})

