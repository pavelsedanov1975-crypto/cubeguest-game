const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    backgroundColor: '#87CEEB',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 700 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

new Phaser.Game(config);

let player, platforms, cursors, score = 0, scoreText;

function preload() {
    const g = this.make.graphics({ add: false });
    
    // Игрок — зелёный квадрат
    g.fillStyle(0x00ff00, 1);
    g.fillRect(0, 0, 32, 32);
    g.generateTexture('player', 32, 32);
    g.clear();
    
    // Платформа — коричневая
    g.fillStyle(0x8B4513, 1);
    g.fillRect(0, 0, 150, 20);
    g.generateTexture('platform', 150, 20);
    g.clear();
    
    // Монета — жёлтая
    g.fillStyle(0xFFD700, 1);
    g.fillCircle(10, 10, 10);
    g.generateTexture('coin', 20, 20);
}

function create() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    
    // Платформы
    platforms = this.physics.add.staticGroup();
    
    // Пол
    platforms.create(w/2, h-15, 'platform').setScale(w/75, 1).refreshBody();
    
    // Полки — близко, низко, чтобы точно допрыгнуть
    const shelfY = [h-120, h-220, h-320, h-220, h-120];
    const shelfX = [w*0.2, w*0.4, w*0.6, w*0.8, w*0.5];
    
    shelfX.forEach((x, i) => {
        platforms.create(x, shelfY[i], 'platform').refreshBody();
    });
    
    // Игрок
    player = this.physics.add.sprite(w*0.1, h-60, 'player');
    player.setBounce(0.1);
    player.setCollideWorldBounds(true);
    this.physics.add.collider(player, platforms);
    
    // Клавиатура
    cursors = this.input.keyboard.createCursorKeys();
    
    // Монеты
    const coins = this.physics.add.group();
    shelfX.forEach((x, i) => {
        const coin = coins.create(x, shelfY[i]-25, 'coin');
        coin.setBounceY(0.3);
    });
    this.physics.add.collider(coins, platforms);
    this.physics.add.overlap(player, coins, (p, c) => {
        c.disableBody(true, true);
        score += 10;
        scoreText.setText('Score: ' + score);
    });
    
    // Счёт
    scoreText = this.add.text(16, 16, 'Score: 0', {
        fontSize: '24px',
        fill: '#000',
        fontFamily: 'Arial'
    });
    
    // Тач-управление
    this.input.on('pointerdown', (p) => {
        const zone = w / 3;
        if (p.x < zone) this.touchLeft = true;
        else if (p.x > zone * 2) this.touchRight = true;
        else this.touchJump = true;
    });
    this.input.on('pointerup', () => {
        this.touchLeft = this.touchRight = this.touchJump = false;
    });
    this.touchLeft = this.touchRight = this.touchJump = false;
}

function update() {
    const speed = 200;
    const jump = 450;        // сильный прыжок
    const airControl = 0.7;  // контроль в воздухе
    const onGround = player.body.touching.down;
    
    let vx = 0;
    
    // Ввод: клавиатура + тач
    const left = cursors.left.isDown || this.touchLeft;
    const right = cursors.right.isDown || this.touchRight;
    const jumpBtn = cursors.space.isDown || cursors.up.isDown || this.touchJump;
    
    // Движение
    if (left) vx = -speed;
    if (right) vx = speed;
    
    // В воздухе — плавный контроль как в Марио
    if (!onGround) {
        if (left || right) {
            vx *= airControl;
            // Плавный поворот в воздухе
            const target = left ? -speed * airControl : speed * airControl;
            const current = player.body.velocity.x;
            vx = current + (target - current) * 0.1;
        } else {
            // Сохраняем инерцию, чуть тормозим
            vx = player.body.velocity.x * 0.95;
        }
    }
    
    player.setVelocityX(vx);
    
    // Прыжок
    if (jumpBtn && onGround) {
        player.setVelocityY(-jump);
    }
}
