const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    backgroundColor: '#87CEEB',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

new Phaser.Game(config);

let player, platforms, cursors;

function preload() {
    const g = this.make.graphics({ add: false });
    
    g.fillStyle(0x00ff00, 1);
    g.fillRect(0, 0, 32, 32);
    g.generateTexture('player', 32, 32);
    g.clear();
    
    g.fillStyle(0x8B4513, 1);
    g.fillRect(0, 0, 100, 20);
    g.generateTexture('platform', 100, 20);
}

function create() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    
    platforms = this.physics.add.staticGroup();
    
    // Пол
    platforms.create(w/2, h-20, 'platform').setScale(w/50, 1).refreshBody();
    
    // Платформа — НИЗКО, близко к полу, чтобы точно допрыгнуть
    platforms.create(w * 0.5, h - 100, 'platform').refreshBody();
    platforms.create(w * 0.2, h - 180, 'platform').refreshBody();
    platforms.create(w * 0.8, h - 180, 'platform').refreshBody();
    
    // Игрок — на полу, по центру
    player = this.physics.add.sprite(w/2, h - 60, 'player');
    player.setCollideWorldBounds(true);
    this.physics.add.collider(player, platforms);
    
    // Клавиатура
    cursors = this.input.keyboard.createCursorKeys();
}

function update() {
    const speed = 200;
    const jump = 350;
    
    // Движение
    if (cursors.left.isDown) {
        player.setVelocityX(-speed);
    } else if (cursors.right.isDown) {
        player.setVelocityX(speed);
    } else {
        player.setVelocityX(0);
    }
    
    // Прыжок
    if (cursors.space.isDown && player.body.touching.down) {
        player.setVelocityY(-jump);
    }
}
