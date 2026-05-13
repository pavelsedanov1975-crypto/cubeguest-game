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
let wasd;

function preload() {
    const g = this.make.graphics({ add: false });
    
    g.fillStyle(0x00ff00, 1);
    g.fillRect(0, 0, 32, 32);
    g.generateTexture('player', 32, 32);
    g.clear();
    
    g.fillStyle(0x8B4513, 1);
    g.fillRect(0, 0, 200, 20);
    g.generateTexture('platform', 200, 20);
    g.clear();
    
    g.fillStyle(0xFFD700, 1);
    g.fillCircle(8, 8, 8);
    g.generateTexture('coin', 16, 16);
}

function create() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    
    platforms = this.physics.add.staticGroup();
    
    // Пол
    platforms.create(w/2, h-15, 'platform').setScale(w/100, 1).refreshBody();
    
    // Платформы — лесенка, близко друг к другу
    const steps = [
        [w*0.2, h*0.82],
        [w*0.5, h*0.72],
        [w*0.8, h*0.62],
        [w*0.5, h*0.52],
        [w*0.2, h*0.42],
        [w*0.5, h*0.32]
    ];
    
    steps.forEach(([x, y]) => {
        platforms.create(x, y, 'platform').setScale(0.6, 1).refreshBody();
    });
    
    // Игрок
    player = this.physics.add.sprite(w*0.1, h-60, 'player');
    player.setBounce(0.1);
    player.setCollideWorldBounds(true);
    player.body.setMaxVelocity(300, 600);
    
    this.physics.add.collider(player, platforms);
    
    // Клавиатура — стрелки + WASD
    cursors = this.input.keyboard.createCursorKeys();
    wasd = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        right: Phaser.Input.Keyboard.KeyCodes.D,
        jump: Phaser.Input.Keyboard.KeyCodes.SPACE
    });
    
    // Монеты
    this.coins = this.physics.add.group();
    steps.forEach(([x, y]) => {
        const coin = this.coins.create(x, y-25, 'coin');
        coin.setBounceY(0.3);
    });
    this.physics.add.collider(this.coins, platforms);
    this.physics.add.overlap(player, this.coins, (p, c) => {
        c.disableBody(true, true);
    });
    
    // Тач — виртуальные кнопки
    this.add.rectangle(80, h-80, 120, 120, 0x000000, 0.3).setScrollFactor(0);
    this.add.rectangle(w-80, h-80, 120, 120, 0x000000, 0.3).setScrollFactor(0);
    this.add.circle(w/2, h-80, 50, 0x000000, 0.3).setScrollFactor(0);
    
    this.add.text(80, h-80, '←', {fontSize:'40px'}).setOrigin(0.5).setScrollFactor(0);
    this.add.text(w-80, h-80, '→', {fontSize:'40px'}).setOrigin(0.5).setScrollFactor(0);
    this.add.text(w/2, h-80, '↑', {fontSize:'40px'}).setOrigin(0.5).setScrollFactor(0);
    
    // Тач зоны
    this.input.on('pointerdown', (p) => {
        const x = p.x, y = p.y;
        if (y > h-140) {
            if (x < w/3) this.touchLeft = true;
            else if (x > w*2/3) this.touchRight = true;
            else this.touchJump = true;
        }
    });
    this.input.on('pointerup', () => {
        this.touchLeft = this.touchRight = this.touchJump = false;
    });
    
    this.touchLeft = this.touchRight = this.touchJump = false;
}

function update() {
    const speed = 200;
    const jumpSpeed = 420;
    const airControl = 0.6; // контроль в воздухе (0-1)
    
    let vx = 0;
    const onGround = player.body.touching.down;
    
    // Ввод
    const left = cursors.left.isDown || wasd.left.isDown || this.touchLeft;
    const right = cursors.right.isDown || wasd.right.isDown || this.touchRight;
    const jump = cursors.up.isDown || cursors.space.isDown || wasd.jump.isDown || wasd.up.isDown || this.touchJump;
    
    // Горизонтальное движение
    if (left) vx = -speed;
    if (right) vx = speed;
    
    // В воздухе — меньший контроль, но можно менять направление
    if (!onGround) {
        if (left || right) {
            vx *= airControl;
        } else {
            // Если не жмём — сохраняем инерцию (как в Марио)
            vx = player.body.velocity.x * 0.98;
        }
    }
    
    player.setVelocityX(vx);
    
    // Прыжок — только с земли
    if (jump && onGround) {
        player.setVelocityY(-jumpSpeed);
    }
}
