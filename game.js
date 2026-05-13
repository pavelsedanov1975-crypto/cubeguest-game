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
    // Пол
    const ground = this.physics.add.staticGroup();
    ground.create(400, 580, 'ground').setScale(4, 1).refreshBody();
    
    // Платформа для прыжка — близко
    ground.create(400, 400, 'ground').setScale(1, 1).refreshBody();
    
    // Игрок
    player = this.physics.add.sprite(100, 500, 'player');
    player.setCollideWorldBounds(true);
    this.physics.add.collider(player, ground);
    
    // Клавиатура
    cursors = this.input.keyboard.createCursorKeys();
}

function update() {
    const speed = 200;
    const jump = 400;
    
    // Движение
    if (cursors.left.isDown) player.setVelocityX(-speed);
    else if (cursors.right.isDown) player.setVelocityX(speed);
    else player.setVelocityX(0);
    
    // Прыжок
    if (cursors.space.isDown && player.body.touching.down) {
        player.setVelocityY(-jump);
    }
}
