const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    backgroundColor: '#87CEEB',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 },  // уменьшил гравитацию
            debug: false
        }
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
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.clear();
    
    graphics.fillStyle(0x8B4513, 1);
    graphics.fillRect(0, 0, 400, 32);
    graphics.generateTexture('platform', 400, 32);
    graphics.clear();
    
    graphics.fillStyle(0xFFD700, 1);
    graphics.fillCircle(10, 10, 10);
    graphics.generateTexture('coin', 20, 20);
}

function create() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    
    platforms = this.physics.add.staticGroup();
    
    // Пол — широкий
    const ground = platforms.create(w / 2, h - 20, 'platform');
    ground.setScale(w / 200, 1).refreshBody();
    
    // Платформы ближе друг к другу и ниже
    platforms.create(w * 0.3, h * 0.75, 'platform').setScale(0.4, 1).refreshBody();
    platforms.create(w * 0.7, h * 0.6, 'platform').setScale(0.4, 1).refreshBody();
    platforms.create(w * 0.5, h * 0.45, 'platform').setScale(0.4, 1).refreshBody();
    platforms.create(w * 0.2, h * 0.3, 'platform').setScale(0.4, 1).refreshBody();
    platforms.create(w * 0.8, h * 0.3, 'platform').setScale(0.4, 1).refreshBody();
    
    // Игрок — старт на полу, по центру
    player = this.physics.add.sprite(w / 2, h - 80, 'player');
    player.setBounce(0.1);
    player.setCollideWorldBounds(true);
    
    this.physics.add.collider(player, platforms);
    
    // Камера — НЕ следует за игроком, статичный мир
    this.cameras.main.setBounds(0, 0, w, h);
    this.physics.world.setBounds(0, 0, w, h);
    
    // Клавиатура
    cursors = this.input.keyboard.createCursorKeys();
    
    // Тач — чёткие зоны
    this.input.on('pointerdown', (pointer) => {
        const x = pointer.x;
        const zoneWidth = w / 3;
        
        if (x < zoneWidth) {
            isLeftDown = true;
            isRightDown = false;
        } else if (x > zoneWidth * 2) {
            isRightDown = true;
            isLeftDown = false;
        } else {
            isJumpDown = true;
        }
    });
    
    this.input.on('pointerup', () => {
        isLeftDown = false;
        isRightDown = false;
        isJumpDown = false;
    });
    
    // Score
    this.score = 0;
    this.scoreText = this.add.text(16, 16, 'Score: 0', { 
        fontSize: '24px', 
        fill: '#000',
        fontFamily: 'Arial'
    });
    
    // Монеты на платформах
    this.coins = this.physics.add.group();
    
    const coinPositions = [
        { x: w * 0.3, y: h * 0.75 - 30 },
        { x: w * 0.7, y: h * 0.6 - 30 },
        { x: w * 0.5, y: h * 0.45 - 30 },
        { x: w * 0.2, y: h * 0.3 - 30 },
        { x: w * 0.8, y: h * 0.3 - 30 }
    ];
    
    coinPositions.forEach(pos => {
        const coin = this.coins.create(pos.x, pos.y, 'coin');
        coin.setBounceY(0.5);
    });
    
    this.physics.add.collider(this.coins, platforms);
    this.physics.add.overlap(player, this.coins, collectCoin, null, this);
}

function update() {
    const speed = 250;        // увеличил скорость
    const jumpSpeed = 450;    // увеличил прыжок
    let velocityX = 0;
    
    // Клавиатура — чётко
    if (cursors.left.isDown) velocityX = -speed;
    if (cursors.right.isDown) velocityX = speed;
    
    // Прыжок — только когда на земле
    if ((cursors.space.isDown || cursors.up.isDown) && player.body.touching.down) {
        player.setVelocityY(-jumpSpeed);
    }
    
    // Тач
    if (isLeftDown) velocityX = -speed;
    if (isRightDown) velocityX = speed;
    if (isJumpDown && player.body.touching.down) {
        player.setVelocityY(-jumpSpeed);
        isJumpDown = false;
    }
    
    player.setVelocityX(velocityX);
}

function collectCoin(player, coin) {
    coin.disableBody(true, true);
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);
}
