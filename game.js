const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    backgroundColor: '#87CEEB',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let player;
let platforms;
let cursors;
let isLeftDown = false;
let isRightDown = false;
let isJumpDown = false;

function preload() {
    // Создаём текстуры программно (без внешних файлов)
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    
    // Игрок — зелёный квадрат
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.clear();
    
    // Платформа — коричневый прямоугольник
    graphics.fillStyle(0x8B4513, 1);
    graphics.fillRect(0, 0, 400, 32);
    graphics.generateTexture('platform', 400, 32);
    graphics.clear();
    
    // Монета — жёлтый круг
    graphics.fillStyle(0xFFD700, 1);
    graphics.fillCircle(10, 10, 10);
    graphics.generateTexture('coin', 20, 20);
}

function create() {
    // Платформы
    platforms = this.physics.add.staticGroup();
    
    // Пол
    platforms.create(window.innerWidth / 2, window.innerHeight - 30, 'platform')
        .setScale(window.innerWidth / 400, 1).refreshBody();
    
    // Платформы в воздухе
    platforms.create(window.innerWidth * 0.25, window.innerHeight * 0.7, 'platform')
        .setScale(0.5, 1).refreshBody();
    platforms.create(window.innerWidth * 0.75, window.innerHeight * 0.5, 'platform')
        .setScale(0.5, 1).refreshBody();
    platforms.create(window.innerWidth * 0.5, window.innerHeight * 0.3, 'platform')
        .setScale(0.5, 1).refreshBody();
    
    // Игрок
    player = this.physics.add.sprite(100, window.innerHeight - 100, 'player');
    player.setBounce(0.1);
    player.setCollideWorldBounds(true);
    
    // Коллизии
    this.physics.add.collider(player, platforms);
    
    // Камера следует за игроком
    this.cameras.main.startFollow(player);
    this.cameras.main.setBounds(0, 0, window.innerWidth, window.innerHeight);
    
    // Управление
    cursors = this.input.keyboard.createCursorKeys();
    
    // Тач-управление для мобилы
    this.input.on('pointerdown', (pointer) => {
        if (pointer.x < window.innerWidth / 3) isLeftDown = true;
        else if (pointer.x > window.innerWidth * 2 / 3) isRightDown = true;
        else isJumpDown = true;
    });
    
    this.input.on('pointerup', () => {
        isLeftDown = false;
        isRightDown = false;
        isJumpDown = false;
    });
    
    // Score
    this.score = 0;
    this.scoreText = this.add.text(16, 16, 'Score: 0', { 
        fontSize: '32px', 
        fill: '#000',
        fontFamily: 'Arial'
    }).setScrollFactor(0);
    
    // Монеты
    this.coins = this.physics.add.group({
        key: 'coin',
        repeat: 5,
        setXY: { x: 200, y: 0, stepX: 150 }
    });
    
    this.coins.children.iterate((child) => {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        child.setCollideWorldBounds(true);
    });
    
    this.physics.add.collider(this.coins, platforms);
    this.physics.add.overlap(player, this.coins, collectCoin, null, this);
}

function update() {
    const speed = 200;
    const jumpSpeed = 500;
    let velocityX = 0;
    
    // Клавиатура
    if (cursors.left.isDown) velocityX = -speed;
    if (cursors.right.isDown) velocityX = speed;
    if (cursors.space.isDown && player.body.touching.down) {
        player.body.setVelocityY(-jumpSpeed);
    }
    
    // Тач
    if (isLeftDown) velocityX = -speed;
    if (isRightDown) velocityX = speed;
    if (isJumpDown && player.body.touching.down) {
        player.body.setVelocityY(-jumpSpeed);
        isJumpDown = false;
    }
    
    player.body.setVelocityX(velocityX);
}

function collectCoin(player, coin) {
    coin.disableBody(true, true);
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);
}

function resize(gameSize) {
    this.cameras.main.setViewport(0, 0, gameSize.width, gameSize.height);
}
