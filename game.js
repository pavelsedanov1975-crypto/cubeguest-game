const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    backgroundColor: '#87CEEB',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 },
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
let cursors;
let leftBtn, rightBtn, jumpBtn;
let isLeftDown = false;
let isRightDown = false;
let isJumpDown = false;

function preload() {}

function create() {
    const tg = window.Telegram.WebApp;
    tg.expand();
    tg.ready();
    
    const user = tg.initDataUnsafe?.user;
    const username = user ? user.first_name : 'Гость';
    
    this.add.text(this.scale.width / 2, 30, 'CubeQuest - Привет, ' + username + '!', {
        fontSize: '20px',
        fill: '#fff',
        fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    player = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, 40, 60, 0xFF6B6B);
    this.physics.add.existing(player);
    player.body.setCollideWorldBounds(true);
    
    const groundY = this.scale.height - 30;
    const ground = this.add.rectangle(this.scale.width / 2, groundY, this.scale.width, 60, 0x4ECDC4);
    this.physics.add.existing(ground, true);
    this.physics.add.collider(player, ground);
    
    if (!this.sys.game.device.os.desktop) {
        createMobileControls(this);
    } else {
        cursors = this.input.keyboard.createCursorKeys();
    }
    
    this.scale.on('resize', resize, this);
}

function createMobileControls(scene) {
    const btnSize = 60;
    const padding = 20;
    const bottomY = scene.scale.height - 100;
    
    leftBtn = scene.add.circle(padding + btnSize/2, bottomY, btnSize/2, 0x000000, 0.5);
    leftBtn.setInteractive();
    leftBtn.on('pointerdown', () => isLeftDown = true);
    leftBtn.on('pointerup', () => isLeftDown = false);
    leftBtn.on('pointerout', () => isLeftDown = false);
    scene.add.text(leftBtn.x, leftBtn.y, '←', { fontSize: '30px', fill: '#fff' }).setOrigin(0.5);
    
    rightBtn = scene.add.circle(padding + btnSize * 1.8, bottomY, btnSize/2, 0x000000, 0.5);
    rightBtn.setInteractive();
    rightBtn.on('pointerdown', () => isRightDown = true);
    rightBtn.on('pointerup', () => isRightDown = false);
    rightBtn.on('pointerout', () => isRightDown = false);
    scene.add.text(rightBtn.x, rightBtn.y, '→', { fontSize: '30px', fill: '#fff' }).setOrigin(0.5);
    
    jumpBtn = scene.add.circle(scene.scale.width - padding - btnSize/2, bottomY, btnSize/2, 0x000000, 0.5);
    jumpBtn.setInteractive();
    jumpBtn.on('pointerdown', () => isJumpDown = true);
    jumpBtn.on('pointerup', () => isJumpDown = false);
    jumpBtn.on('pointerout', () => isJumpDown = false);
    scene.add.text(jumpBtn.x, jumpBtn.y, '↑', { fontSize: '30px', fill: '#fff' }).setOrigin(0.5);
}

function update() {
    const speed = 200;
    const jumpSpeed = 330;
    let velocityX = 0;
    
    if (cursors) {
        if (cursors.left.isDown) velocityX = -speed;
        if (cursors.right.isDown) velocityX = speed;
        if (cursors.space.isDown && player.body.touching.down) {
            player.body.setVelocityY(-jumpSpeed);
        }
    }
    
    if (isLeftDown) velocityX = -speed;
    if (isRightDown) velocityX = speed;
    if (isJumpDown && player.body.touching.down) {
        player.body.setVelocityY(-jumpSpeed);
        isJumpDown = false;
    }
    
    player.body.setVelocityX(velocityX);
}

function resize(gameSize) {
    this.cameras.main.setViewport(0, 0, gameSize.width, gameSize.height);
}
