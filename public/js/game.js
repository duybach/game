class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'bullet');

    this.lastBullet = 0
  }

  fire(x, y, direction) {
    this.body.reset(x, y);

    this.setActive(true);
    this.setVisible(true);

    direction ? this.setVelocityX(500) : this.setVelocityX(-500);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    if (this.x > 800 || this.x < 0) {
      this.setActive(false);
      this.setVisible(false);
    }
  }

}

class Bullets extends Phaser.Physics.Arcade.Group {
  constructor(scene) {
    super(scene.physics.world, scene);

    this.bullets = this.createMultiple({
      frameQuantity: 1,
      key: 'bullet',
      active: false,
      visible: false,
      classType: Bullet
    });

    scene.physics.add.overlap(this.bullets, scene.otherPlayers.getChildren(), function(x, y) {
      x.setActive(false);
      x.setVisible(false);
      y.setActive(false);
      y.setVisible(false);
    }, (x, y) => {
      return this.checkOverlap(x, y);
    }, null);

    scene.physics.add.overlap(this.bullets, [scene.ship], function(x, y) {
      if (x.active && y.active) {
        scene.socket.emit('playerDied', true);
      }

      x.setActive(false);
      x.setVisible(false);
      y.setActive(false);
      y.setVisible(false);
    }, (x, y) => {
      return this.checkOverlap(x, y);
    }, null);
  }

  checkOverlap(spriteA, spriteB) {
    if (!(spriteA.active && spriteA.visible && spriteB.active && spriteB.visible)) {
      return false;
    } else {
      var boundsA = spriteA.getBounds();
      var boundsB = spriteB.getBounds();

      return Phaser.Geom.Intersects.RectangleToRectangle(boundsA, boundsB);
    }
  }

  fireBullet(x, y, direction) {
    let bullet = this.getFirstDead(false);

    if (bullet) {
      bullet.fire(x, y, direction);
    }
  }
}

class Example extends Phaser.Scene {
  constructor() {
    super();

    this.bullets;
    this.ship;

    this.addPlayer = this.addPlayer.bind(this);
    this.addOtherPlayers = this.addOtherPlayers.bind(this);
    this.lastFired = 0;
  }

  preload() {
    this.load.image('ship', 'assets/spaceShips_001.png');
    this.load.image('otherPlayer', 'assets/enemyBlack5.png');
    this.load.image('star', 'assets/star_gold.png');
    this.load.image('bullet', 'assets/bullet.png');
    this.load.image('sky', 'assets/forests.png');
    this.load.image('forest', 'assets/forestt.png');
    this.load.image('land', 'assets/land1.png');
    this.load.image('barrel', 'assets/barrel.png');
  }

  create() {
    var self = this;
    this.socket = io();

    this.physics.world.setBounds(0, 245, 800, 600-245);
    this.add.image(400, 150, 'sky');
    this.add.image(0, 245, 'forest');
    this.add.image(250, 245, 'forest');
    this.add.image(500, 245, 'forest');
    this.add.image(750, 245, 'forest');
    this.add.image(15, 360, 'land');
    this.add.image(115, 360, 'land');
    this.add.image(215, 360, 'land');
    this.add.image(315, 360, 'land');
    this.add.image(415, 360, 'land');
    this.add.image(515, 360, 'land');
    this.add.image(615, 360, 'land');
    this.add.image(715, 360, 'land');
    this.add.image(15, 415, 'land');
    this.add.image(115, 415, 'land');
    this.add.image(215, 415, 'land');
    this.add.image(315, 415, 'land');
    this.add.image(415, 415, 'land');
    this.add.image(515, 415, 'land');
    this.add.image(615, 415, 'land');
    this.add.image(715, 415, 'land');
    this.add.image(15, 465, 'land');
    this.add.image(115, 465, 'land');
    this.add.image(215, 465, 'land');
    this.add.image(315, 465, 'land');
    this.add.image(415, 465, 'land');
    this.add.image(515, 465, 'land');
    this.add.image(615, 465, 'land');
    this.add.image(715, 465, 'land');
    this.add.image(15, 515, 'land');
    this.add.image(115, 515, 'land');
    this.add.image(215, 515, 'land');
    this.add.image(315, 515, 'land');
    this.add.image(415, 515, 'land');
    this.add.image(515, 515, 'land');
    this.add.image(615, 515, 'land');
    this.add.image(715, 515, 'land');
    this.add.image(15, 565, 'land');
    this.add.image(115, 565, 'land');
    this.add.image(215, 565, 'land');
    this.add.image(315, 565, 'land');
    this.add.image(415, 565, 'land');
    this.add.image(515, 565, 'land');
    this.add.image(615, 565, 'land');
    this.add.image(715, 565, 'land');

    this.otherPlayers = this.physics.add.group();

    this.socket.on('currentPlayers', function (players) {
      Object.keys(players).forEach(function (id) {
        if (players[id].playerId === self.socket.id) {
          self.addPlayer(players[self.socket.id]);
        }
      });
      Object.keys(players).forEach(function (id) {
        if (players[id].playerId !== self.socket.id) {
          self.addOtherPlayers(players[id]);
        }
      });
    });

    this.socket.on('newPlayer', function (playerInfo) {
      self.addOtherPlayers(playerInfo);
    });

    this.socket.on('disconnect', function (playerId) {
      self.otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (playerId === otherPlayer.playerId && otherPlayer.active) {
          otherPlayer.destroy();
        }
      });
    });

    this.socket.on('playerMoved', function (playerInfo) {
      self.otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (playerInfo.playerId === otherPlayer.playerId && otherPlayer.active) {
          otherPlayer.setPosition(playerInfo.x, playerInfo.y);
        }
      });
    });

    this.socket.on('playerBulletMoved', function (playerInfo) {
      self.otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (playerInfo.playerId === otherPlayer.playerId && otherPlayer.active) {
          otherPlayer.setPosition(playerInfo.x, playerInfo.y);

          if (playerInfo.bullet) {
            otherPlayer.bullets.fireBullet(playerInfo.team === 'blue' ? playerInfo.x + 56: playerInfo.x - 56, playerInfo.y, playerInfo.team === 'blue');
          }
        }
      });
    });

    this.socket.on('playerDied', function (playerInfo) {
      self.otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (playerInfo.playerId === otherPlayer.playerId && otherPlayer.active && playerInfo.death) {
          this.otherPlayers.killAndHide(otherPlayer);
        }
      }, self);
    });

    this.socket.on('playerRespawned', function (playerInfo) {
      if (!(playerInfo.death)) {
        if (playerInfo.playerId === self.socket.id) {
          self.ship.x = playerInfo.x;
          self.ship.y = playerInfo.y;
          self.ship.setActive(true);
          self.ship.setVisible(true);
        } else {
          self.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (playerInfo.playerId === otherPlayer.playerId) {
              otherPlayer.x = playerInfo.x;
              otherPlayer.y = playerInfo.y;
              otherPlayer.setActive(true);
              otherPlayer.setVisible(true);
            }
          }, self);
        }
      }
    });

    this.blueScoreText = this.add.text(16, 16, '', { fontSize: '32px', fill: '#0000FF' });
    this.redScoreText = this.add.text(564, 16, '', { fontSize: '32px', fill: '#FF0000' });

    this.socket.on('scoreUpdate', function (scores) {
      self.blueScoreText.setText('Blue: ' + scores.blue);
      self.redScoreText.setText('Red: ' + scores.red);
    });

    this.socket.on('starLocation', function (starLocation) {
      if (self.star) self.star.destroy();
      self.star = self.physics.add.image(starLocation.x, starLocation.y, 'star');
      self.physics.add.overlap(self.ship, self.star, function () {
        this.socket.emit('starCollected');
      }, null, self);
    });

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update(time) {
    if (this.ship && this.ship.active) {
      if (this.cursors.left.isDown) {
        this.ship.x -= 3;
      } else if (this.cursors.right.isDown) {
        this.ship.x += 3;
      }

      if (this.cursors.up.isDown) {
        this.ship.y -= 3;
      } else if (this.cursors.down.isDown) {
        this.ship.y += 3;
      }

      if (this.cursors.space.isDown && time > this.lastFired) {
        this.socket.emit('playerBulletMovement', true);
        this.bullets.fireBullet(this.data.get('playerInfo').team === 'blue' ? this.ship.x + 56 : this.ship.x - 56, this.ship.y, this.data.get('playerInfo').team === 'blue');
        this.lastFired = time + 500;
      }

      // emit player movement
      var x = this.ship.x;
      var y = this.ship.y;
      if (this.ship.oldPosition && (x !== this.ship.oldPosition.x || y !== this.ship.oldPosition.y)) {
        this.socket.emit('playerMovement', { x: this.ship.x, y: this.ship.y });
      }

      // save old position data
      this.ship.oldPosition = {
        x: this.ship.x,
        y: this.ship.y,
      };
    }
  }

  addPlayer(playerInfo) {
    this.ship = this.physics.add.sprite(playerInfo.x, playerInfo.y, 'ship').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
    if (playerInfo.team === 'blue') {
      this.ship.setTint(0x0000ff);
    } else {
      this.ship.setTint(0xff0000);
    }

    this.ship.setCollideWorldBounds(true);

    // var barrel = this.add.tileSprite(400, 400, 90, 90, 'barrel');

    this.data.set('playerInfo', playerInfo);
    this.bullets = new Bullets(this);
  }

  addOtherPlayers(playerInfo) {
    const otherPlayer = this.add.sprite(playerInfo.x, playerInfo.y, 'otherPlayer').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
    if (playerInfo.team === 'blue') {
      otherPlayer.setTint(0x0000ff);
    } else {
      otherPlayer.setTint(0xff0000);
    }
    otherPlayer.playerId = playerInfo.playerId;
    otherPlayer.bullets = new Bullets(this);

    this.otherPlayers.add(otherPlayer);
  }
}

let config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 0 }
    }
  },
  scene: Example
};

let game = new Phaser.Game(config);
