var AMOUNT_DIAMONDS = 30;
var AMOUNT_BOOBLES = 30
var musicLoop; 

GamePlayManager = {
  init: function () {
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;

    this.flagFirstMouse = false;
    this.amountDiamondsCaught = 0;
    this.endGame= false;
    this.countSmile = -1;
  },
  preload: function () {
    game.load.image("background", "assets/images/background.png");
    game.load.spritesheet("horse", "assets/images/horse.png", 84, 156, 2);
    //cargamos 84 de ancho ( el original es el doble) y 156 de alto y este png contiene 2 imagenes
    game.load.spritesheet("diamonds", "assets/images/diamonds.png", 81, 84, 4);
    game.load.image("stash", "assets/images/explosion.png");
    game.load.image("shark", "assets/images/shark.png")
    game.load.image("fishes", "assets/images/fishes.png")
    game.load.image("mollusk", "assets/images/mollusk.png")
    game.load.image("booble1", "assets/images/booble1.png")
    game.load.image("booble2", "assets/images/booble2.png")
    game.load.audio("musicLoop", "assets/images/musicLoop.png")
  },
  create: function () {
    musicLoop = game.add.audio('musicLoop') 
    game.add.sprite(0, 0, "background");
    this.booblesArr= []
    for (let index = 0; index < AMOUNT_BOOBLES; index++) {
      var xboobles = game.rnd.integerInRange(1,1140)
      var yboobles = game.rnd.integerInRange(600,950)

      var boobles= game.add.sprite(xboobles, yboobles,'booble'+ game.rnd.integerInRange(1,2))
      boobles.vel= 0.2 + game.rnd.frac() * 2
      boobles.alpha= 0.9
      boobles.scale.setTo(0.2 + game.rnd.frac())
      this.booblesArr[index]= boobles
    }

    this.booble1= game.add.sprite(0, 0, "booble1")
    this.booble2= game.add.sprite(0, 0, "booble2")
    this.mollusk = game.add.sprite(700,150,'mollusk')
    this.shark = game.add.sprite(1600, 20 ,'shark')
    this.fishes = game.add.sprite(-200, 520, 'fishes')
    this.horse = game.add.sprite(0, 0, "horse");
    this.horse.frame = 0;
    this.horse.x = game.width / 2;
    this.horse.y = game.height / 2;
    this.horse.anchor.setTo(0.5);

    game.input.onDown.add(this.onTap, this);

    this.diamonds = [];
    for (let index = 0; index < AMOUNT_DIAMONDS; index++) {
      var diamond = game.add.sprite(100, 100, "diamonds");
      diamond.frame = game.rnd.integerInRange(0, 3);
      diamond.scale.setTo(0.3 + game.rnd.frac());
      diamond.anchor.setTo(0.5);
      diamond.x = game.rnd.integerInRange(50, 1050);
      diamond.y = game.rnd.integerInRange(50, 600);

      this.diamonds[index] = diamond;
      var rectCurrentDiamond = this.getBoundDiamond(diamond);
      var rectHorse = this.getBoundDiamond(this.horse);

      while (
        this.isOverlappingOtherDiamond(index, rectCurrentDiamond) ||
        this.isRectanguleOverlapping(rectHorse, rectCurrentDiamond)
      ) {
        diamond.x = game.rnd.integerInRange(50, 1050);
        diamond.y = game.rnd.integerInRange(50, 600);
        rectCurrentDiamond = this.getBoundDiamond(diamond);
      }
    }
    this.explosionGroup = game.add.group();
    for (let index = 0; index < 10; index++) {
      this.explosion = this.explosionGroup.create(100, 100, "stash");
      this.explosion.tweenScale = game.add.tween(this.explosion.scale).to(
        {
          x: [0.4, 0.8, 0.4],
          y: [0.4, 0.8, 0.4],
        },
        600,
        Phaser.Easing.Exponential.Out,
        false,
        0,
        0,
        false
      );
      this.explosion.tweenAlpha = game.add.tween(this.explosion).to(
        {
          alpha: [1, 0.6, 0],
        },
        600,
        Phaser.Easing.Exponential.Out,
        false,
        0,
        0,
        false
      );

      this.explosion.anchor.setTo(0.5);
      this.explosion.kill();
    }
    this.currentScore = 0;
    var style = {
      font: "bold 30pt Arial",
      fill: "#FFFFFF",
      align: "center",
    };
    var styleText = {
      font: "bold 15pt Arial",
      fill: "#000",
    };
    game.add.text(10, 600, "Created by Cristian Lucatti", styleText);
    this.scoreText = game.add.text(game.width / 2, 40, "0", style);
    this.scoreText.anchor.setTo(0.5);

    this.totalTime = 30
    this.timerText = game.add.text( 1000, 40, '0:'+this.totalTime+'', style);
    this.timerText.anchor.setTo(0.5);
    //=== Otra formna de timer guardandolo en una variable y removiendo con el events====
       
    // this.totalTime = 5;
    // this.timerText = game.add.text(1000, 40, this.totalTime+'', style);
    // this.timerText.anchor.setTo(0.5);
    
    // this.timerGameOver = game.time.events.loop(Phaser.Timer.SECOND, function(){
    //     if(this.flagFirstMouseDown){
    //         this.totalTime--;
    //         this.timerText.text = this.totalTime+'';
    //         if(this.totalTime<=0){
    //             game.time.events.remove(this.timerGameOver);
    //             this.endGame = true;
    //             this.showFinalMessage('GAME OVER');
    //         }
    //     }
    // },this);

    //=====================================================================================

    this.timerGameOver = game.time.events.loop(Phaser.Timer.SECOND, function(){
      if(this.totalTime >= 1 ){
        if(this.flagFirstMouse){
          this.totalTime--
          this.timerText.text = this.totalTime> 10 ? '0:'+ this.totalTime+'' : '0:0'+ this.totalTime+''
        }
      }else{
          game.time.events.remove(this.timerGameOver);
          this.endGame = true 
          this.showFinalMessage('GAME OVER');
        }
    },this)
    sounds=[musicLoop]
    game.sound.setDecodedCallback(sounds,start, this);
    sounds.shift();
  },
  start: function (){
    
    musicLoop.loopFull(0.6);
    musicLoop.onLoop.add(hasLooped, this);
},
  increaseScore: function () {
    this.countSmile = 0
    this.horse.frame = 1
    this.currentScore += 100;
    this.scoreText.text = this.currentScore;
    this.amountDiamondsCaught++;
    if (this.amountDiamondsCaught >= AMOUNT_DIAMONDS) {
      game.time.events.remove(this.timerGameOver);
      this.showFinalMessage("Felicitaciones");
      this.endGame = true
    }
  },
  showFinalMessage: function (msg) {
    this.tweenMollusk.stop()
    var bgAlpha = game.add.bitmapData(game.width, game.height);
    bgAlpha.ctx.fillStyle = "#00d0ff";
    bgAlpha.ctx.fillRect(0, 0, game.width, game.height);
    var bg = game.add.sprite(0, 0, bgAlpha);
    bg.alpha = 0.5;

    var style = {
      font: "bold 60pt Arial",
      fill: "#FFFFFF",
      align: "center",
    };

    this.textFieldFinalMsg = game.add.text(
      game.width / 2,
      game.height / 2,
      msg,
      style
    );
    this.textFieldFinalMsg.anchor.setTo(0.5);    
  },
  onTap: function () {
    if(!this.flagFirstMouse){
      this.tweenMollusk = game.add.tween(this.mollusk.position).to(
        {y:-0.001},5800, Phaser.Easing.Cubic.InOut, true, 0, 1000, true).loop(true)
    }
    this.flagFirstMouse = true;
  },
  getBoundDiamond: function (currentDiamond) {
    return new Phaser.Rectangle(
      currentDiamond.left,
      currentDiamond.top,
      currentDiamond.width,
      currentDiamond.height
    );
  },
  isRectanguleOverlapping: function (rect1, rect2) {
    if (rect1.x > rect2.x + rect2.width || rect2.x > rect1.x + rect1.width) {
      return false;
    }
    if (rect1.y > rect2.y + rect2.height || rect2.y > rect1.y + rect1.height) {
      return false;
    }
    return true;
  },
  isOverlappingOtherDiamond: function (index, rect2) {
    for (let i = 0; i < index; i++) {
      var rect1 = this.getBoundDiamond(this.diamonds[i]);
      if (this.isRectanguleOverlapping(rect1, rect2)) {
        return true;
      }
    }
    return false;
  },
  getBoundHorse: function () {
    var x0 = this.horse.x - Math.abs(this.horse.width) / 4;
    var width = Math.abs(this.horse.width) / 2;
    var y0 = this.horse.y - this.horse.height / 2;
    var height = this.horse.height;

    return new Phaser.Rectangle(x0, y0, width, height);
  },
  //========= Debaguer de los rectangulos ==================
  // render: function (){
  //   game.debug.spriteBounds(this.horse)
  //   for (let index = 0; index < AMOUNT_DIAMONDS; index++) {
  //     game.debug.spriteBounds(this.diamonds[index])
  //   }
  // },
  //==========================================================

  update: function () {
    //este flag es para que al iniciar la figura no siga al mouse

    if (this.flagFirstMouse && !this.endGame) {

      for (let index = 0; index < AMOUNT_BOOBLES; index++) {
       var booble = this.booblesArr[index]
       booble.y-= booble.vel
       if(booble.y<= -30){
         booble.y = 700
         booble.x = game.rnd.integerInRange(1,1140)
       }  
      }

      if(this.countSmile>=0){
        this.countSmile++;
        if(this.countSmile> 15){
          this.countSmile= -1
          this.horse.frame = 0
        }
      }

      this.shark.x-=2
      if(this.shark.x < -300){
        this.shark.x = 1300
      }
      this.fishes.x+= 1
      if(this.fishes > 1300){
        this.fishes = -300
      }
      

      var pointerX = game.input.x;
      var pointerY = game.input.y;

      var distX = pointerX - this.horse.x;
      var distY = pointerY - this.horse.y;

      if (distX > 0) {
        this.horse.scale.setTo(1, 1);
      } else {
        this.horse.scale.setTo(-1, 1);
      }
      // para que se mueva hacia el mouse...si queremos mas rapido le damos mas porcentaje
      this.horse.x += distX * 0.02;
      this.horse.y += distY * 0.02;

      for (let index = 0; index < AMOUNT_DIAMONDS; index++) {
        var rectHorse = this.getBoundHorse();
        var rectDiamond = this.getBoundDiamond(this.diamonds[index]);

        if (
          this.diamonds[index].visible &&
          this.isRectanguleOverlapping(rectHorse, rectDiamond)
        ) {
          this.diamonds[index].visible = false;
          this.increaseScore();
          var explosion = this.explosionGroup.getFirstDead();
          if (explosion !== null) {
            explosion.reset(this.diamonds[index].x, this.diamonds[index].y);
            explosion.tweenScale.start();
            explosion.tweenAlpha.start();
            explosion.tweenAlpha.onComplete.add(function (
              currentTarget,
              currentTween
            ) {
              currentTarget.kill();
            },
            this);
          }
        }
      }
    }
  },
};

var game = new Phaser.Game(1136, 640, Phaser.CANVAS);

game.state.add("gameplay", GamePlayManager);
game.state.start("gameplay");

// this.horse.scalesetTo()
// this.horse.angle()
// this.horse.alpha() opacidad 0 es invisible y 1 normal
