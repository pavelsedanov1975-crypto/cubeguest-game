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
