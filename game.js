const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#87CEEB',
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 600 } }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

new Phaser.Game(config);

let player, cursors;

function preload() {
    const g = this.make.graphics({ add: false });
    g.fillStyle(0x00ff00, 1).fillRect(0, 0, 32, 32);
    g.generateTexture('player', 32, 32);
    g.clear();
    g.fillStyle(0x8B4513, 1).fillRect(0, 0, 200, 20);
    g.generateTexture('ground', 200, 20);
}

function create() {
    const w = 800, h = 600;
    
    // Пол
    const ground = this.physics.add.staticGroup();
    ground.create(400, h-20, 'ground').setScale(4, 1).refreshBody();
    
    // Платформа — ближе и ниже, чтобы точно допрыгнуть
    ground.create(300, h-180, 'ground').setScale(0.8, 1).refreshBody();
    ground.create(500, h-300, 'ground').setScale(0.8, 1).refreshBody();
    
    // Игрок
    player = this.physics.add.sprite(100, h-80, 'player');
    player.setCollideWorldBounds(true);
    this.physics.add.collider(player, ground);
    
    // Клавиатура
    cursors = this.input.keyboard.createCursorKeys();
}

function update() {
    const speed = 200;
    const jump = 380;          // сильнее прыжок
    const airSpeed = 150;      // скорость в воздухе (меньше, чем на земле)
    const onGround = player.body.touching.down;
    
    // === ГОРИЗОНТАЛЬНОЕ ДВИЖЕНИЕ ===
    if (onGround) {
        // На земле — полный контроль
        if (cursors.left.isDown) player.setVelocityX(-speed);
        else if (cursors.right.isDown) player.setVelocityX(speed);
        else player.setVelocityX(0);
    } else {
        // В ВОЗДУХЕ — как в Марио: можно менять направление, но плавно
        if (cursors.left.isDown) {
            player.setVelocityX(Math.max(player.body.velocity.x - 10, -airSpeed));
        } else if (cursors.right.isDown) {
            player.setVelocityX(Math.min(player.body.velocity.x + 10, airSpeed));
        }
        // Если не жмём — сохраняем инерцию (не останавливаемся резко)
    }
    
    // === ПРЫЖОК ===
    if ((cursors.space.isDown || cursors.up.isDown) && onGround) {
        player.setVelocityY(-jump);
    }
}
