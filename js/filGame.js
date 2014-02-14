/**
 * Created by Ilker Guller on 14.02.2014.
 */

var stage, isTouchEnable = true, w, h, loader, background, sprSheet,
    ground, outerPadding = 0, items = {}, startX, startY, wiggleDelta,
    pipes, isGameStart = false, isHeartDead = false, masterPipeDelay = 1.75,
    pipeDelay = masterPipeDelay, gap = 80, pipe, pipe2, counter = 0, deltaS,
    animationList = {}, isRestarted = false, scoreTexts = null,
    isJumped = false, jumpAmount = 50, jumpTime = 266;

document.onkeydown = handleKeyDown;

function handleKeyDown(e) {
  //cross browser issues exist
  if(!e){ var e = window.event; }
  switch(e.keyCode) {
    case KEYCODE_SPACE: handleJumpStart();
  }
}

function handleJumpStart() {
  if (!dead) {
    createjs.Tween.removeTweens ( bird );
    bird.gotoAndPlay("jump");
    startJump = true;
    if (!started) {
      isGameStart = true;
      counterShow = true;
    }
  }
}

function createSpriteSheet() {
  var data = {
    images: [loader.getResult("sprFil")],
    frames: [
      [0, 0, 288, 512, 0],        // light Bg
      [292, 0, 288, 512, 0],      // dark Bg
      [584, 0, 336, 112, 0],      // ground

      [6, 982, 29, 24, 0],        // heart1
      [62, 982, 29, 24, 0],       // heart2
      [118, 982, 29, 24, 0],      // heart3

      [702, 182, 178, 37, 0],     // Game Name
      [702, 234, 116, 70, 0],     // Start Button
      [884, 182, 121, 14, 0],     // Credit
      [584, 182, 114, 98, 0],     // Tutorial
      [584, 116, 196, 62, 0],     // GetReady

      [0, 646, 52, 320, 0],       // Pipe1
      [168, 646, 52, 320, 0],     // Pipe2
      [784, 116, 204, 54, 0],     // Game Over
      [584, 284, 80, 28, 0],      // Share

      [992, 120, 24, 36, 0],      // 0
      [272, 910, 16, 36, 0],      // 1
      [584, 320, 24, 36, 0],      // 2
      [612, 320, 24, 36, 0],      // 3
      [640, 320, 24, 36, 0],      // 4
      [668, 320, 24, 36, 0],      // 5
      [584, 368, 24, 36, 0],      // 6
      [612, 368, 24, 36, 0],      // 7
      [640, 368, 24, 36, 0],      // 8
      [668, 368, 24, 36, 0]       // 9
    ],
    animations: {
      fly: [3,5, 'fly', 0.21]
    }
  };
  sprSheet = new createjs.SpriteSheet(data);

  items['lightBg'] = new createjs.Sprite(sprSheet, 0);
  items['darkBg'] = new createjs.Sprite(sprSheet, 1);
  items['ground1'] = new createjs.Sprite(sprSheet, 2);
  items['ground2'] = new createjs.Sprite(sprSheet, 2);
  items['heart'] = new createjs.Sprite(sprSheet, 'fly');
  items['gameName'] = new createjs.Sprite(sprSheet, 6);
  items['startButton'] = new createjs.Sprite(sprSheet, 7);
  items['credit'] = new createjs.Sprite(sprSheet, 8);
  items['tutorial'] = new createjs.Sprite(sprSheet, 9);
  items['getReady'] = new createjs.Sprite(sprSheet, 10);
  items['pipe1'] = new createjs.Sprite(sprSheet, 11);
  items['pipe2'] = new createjs.Sprite(sprSheet, 12);
  items['gameOver'] = new createjs.Sprite(sprSheet, 13);
  items['share'] = new createjs.Sprite(sprSheet, 14);

  items['numbers'] = [];
  for(var i=15; i<=24; i++) { // 15 to 24
    items['numbers'].push(new createjs.Sprite(sprSheet, i));
  }

  for (var key in items) {
    if(key == 'heart') continue;
    var obj = items[key];
    obj.paused = true;
  }

  for (var key in items['numbers']) {
    var obj = items['numbers'][parseInt(key)];
    if(typeof obj != 'undefined') obj.paused = true;
  }
}

function browserInit() {
  stage = new createjs.Stage("cnvsFIL");
  if(isTouchEnable) createjs.Touch.enable(stage);

  w = stage.canvas.width;
  h = stage.canvas.height;

  loader = new createjs.LoadQueue(false);
  loader.addEventListener("complete", onLoaderComplete);
  loader.loadManifest([
    {src: 'img/fallinglove.png', id: 'sprFil'}
  ]);
}

function onLoaderComplete() {
  createSpriteSheet();

  playGroundAnimation();

  stage.addChild(items['lightBg']);

  startX = (w/2) - (items['heart'].getBounds().width/2);
  startY = 150 + outerPadding;
  wiggleDelta = 10;

  items['heart'].setTransform(startX, startY, 1, 1);
  items['heart'].framerate = 30;
  createjs.Tween.get(items['heart'], {loop:true}).to({y:startY + wiggleDelta}, 380, createjs.Ease.sineInOut).to({y:startY}, 380, createjs.Ease.sineInOut);

  pipes = new createjs.Container();
  stage.addChild(items['ground1'], items['ground2'], pipes, items['heart']);
  stage.addEventListener("stagemousedown", onJumpPressed);

  onCreateStartScreen();

  createjs.Ticker.timingMode = createjs.Ticker.RAF;
  createjs.Ticker.addEventListener("tick", onTick);
}

function onJumpPressed() {
  if (!isHeartDead && isGameStart) {
    createjs.Tween.removeTweens(items['heart']);
    isJumped = true;
  }
}

function playGroundAnimation() {
  items['ground1'].y = h - items['ground1'].getBounds().height;
  items['ground2'].y = h - items['ground2'].getBounds().height;
  items['ground1'].x = 0;
  items['ground2'].x = w;

  animationList = {};

  animationList['ground1'] = createjs.Tween.get(items['ground1']);
  animationList['ground1'].to({x:-(items['ground1'].getBounds().width)}, 3000).call(function() {
    items['ground1'].x = w;

    animationList['ground1loop'] = createjs.Tween.get(items['ground1'], {loop:true});
    animationList['ground1loop'].to({x:-(items['ground1'].getBounds().width)}, 6000).call(function() {
      items['ground1'].x = w;
    });
  });

  animationList['ground2'] = createjs.Tween.get(items['ground2']);
  animationList['ground2'].to({x:-(items['ground2'].getBounds().width)}, 6000).call(function() {
    items['ground2'].x = w;

    animationList['ground2loop'] = createjs.Tween.get(items['ground2'], {loop:true});
    animationList['ground2loop'].to({x:-(items['ground2'].getBounds().width)}, 6000).call(function() {
      items['ground2'].x = w;
    });
  });
}

function onCreateStartScreen() {
  items['gameName'].setTransform(((w/2) - (items['gameName'].getBounds().width/2)), startY-50, 1, 1);
  items['startButton'].setTransform(((w/2) - (items['startButton'].getBounds().width/2)), startY+60, 1, 1);
  items['credit'].setTransform(((w/2) - (items['credit'].getBounds().width/2)), startY+130, 1, 1);

  items['credit'].addEventListener('click', function() {
    window.open("http://ilkerguller.com");
  });

  items['startButton'].addEventListener('click', onBeforeGameStart);

  stage.addChild(items['gameName'], items['startButton'], items['credit']);
}

function onBeforeGameStart() {
  pipes.removeAllChildren();
  counter = 0;
  pipeDelay = masterPipeDelay;
  isHeartDead = false;
  items['heart'].paused = false;
  items['heart'].setTransform(startX, startY, 1, 1);
  items['heart'].rotation = 0;

  if(isRestarted) {
    createjs.Tween.get(items['heart'], {loop:true})
      .to({y:startY + wiggleDelta}, 380, createjs.Ease.sineInOut)
      .to({y:startY}, 380, createjs.Ease.sineInOut);

    createjs.Tween.get(items['gameOver']).to({alpha: 0}, 500);
    createjs.Tween.get(items['share']).to({alpha: 0}, 500);
    createjs.Tween.get(items['startButton']).to({alpha: 0}, 500);

    playGroundAnimation();
  }

  createjs.Tween.get(items['gameName']).to({alpha: 0}, 500);
  createjs.Tween.get(items['startButton']).to({alpha: 0}, 500);
  createjs.Tween.get(items['credit']).to({alpha: 0}, 500);

  items['tutorial'].setTransform(((w/2) - (items['tutorial'].getBounds().width/2)), startY+60, 1, 1);
  items['tutorial'].alpha = 0;
  items['tutorial'].addEventListener('click', onGameStart);
  stage.addChild(items['tutorial']);

  items['getReady'].setTransform(((w/2) - (items['getReady'].getBounds().width/2)), startY-60, 1, 1);
  items['getReady'].alpha = 0;
  items['getReady'].addEventListener('click', onGameStart);
  stage.addChild(items['getReady']);

  if(scoreTexts != null) scoreTexts.alpha = 0;

  createjs.Tween.get(items['tutorial']).to({alpha: 1}, 500);
  createjs.Tween.get(items['getReady']).to({alpha: 1}, 500);
}

function onGameStart() {
  createjs.Tween.get(items['tutorial']).to({alpha: 0}, 500);
  createjs.Tween.get(items['getReady']).to({alpha: 0}, 500);
  isGameStart = true;
  showScore();
}

function onTick(event) {
  deltaS = event.delta/1000;

  if(items['heart'].y > (items['ground1'].y - 35) || items['heart'].y > (items['ground2'].y - 35)) {
    if(!isHeartDead) {
      heartDie();
    }

    if(items['heart'].y > (items['ground1'].y - 25) || items['heart'].y > (items['ground2'].y - 25)) {
      createjs.Tween.removeTweens(items['heart']);
    }
  }

  if(isGameStart && !isHeartDead) {
    createPipes();
    onMovePipe();
  }

  if(isJumped == true) {
    isJumped = false;

    if(items['heart'].rotation < 0) {
      rotationDelta = (-items['heart'].rotation - 20)/5;
    } else {
      rotationDelta = (items['heart'].rotation + 20)/5;
    }

    if(items['heart'].y < -200) {
      items['heart'].y = -200;
    }

    createjs.Tween
      .get(items['heart'])
      .to({y:items['heart'].y - rotationDelta, rotation: -20}, rotationDelta, createjs.Ease.linear) //rotate to jump position and jump bird
      .to({y:items['heart'].y - jumpAmount, rotation: -20}, jumpTime - rotationDelta, createjs.Ease.quadOut) //rotate to jump position and jump bird
      .to({y:items['heart'].y}, jumpTime, createjs.Ease.quadIn) //reverse jump for smooth arch
      .to({y:items['heart'].y + 150, rotation: 90}, (400)/1.5, createjs.Ease.linear) //rotate back
      .to({y:items['ground1'].y - 30}, (h - (items['heart'].y+200))/1.5, createjs.Ease.linear); //drop to the bedrock
  }

  stage.update(event);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function createPipes() {
  if (pipeDelay < 0) {
    pipe = items["pipe" + getRandomInt(1,2)].clone();
    pipe.x = w-10;
    pipe.y = (items['ground1'].y - gap*2) * Math.random() + gap*1.5;
    pipes.addChild(pipe);

    pipe2 = items["pipe" + getRandomInt(1,2)].clone();
    pipe2.scaleX = -1;
    pipe2.rotation = 180;
    pipe2.x = pipe.x;
    pipe2.y = pipe.y - (gap+10);

    pipes.addChild(pipe2);
    pipeDelay = masterPipeDelay;
  } else {
    pipeDelay = pipeDelay - 1*deltaS;
  }
}

function onMovePipe() {
  var l = pipes.getNumChildren();

  for(var i = 0; i < l; i++) {
    pipe = pipes.getChildAt(i);
    var nextPipe = (i%2 && i!=0) || (i == l-1) ? pipes.getChildAt(i-1) : pipes.getChildAt(i+1);
    if (pipe && nextPipe) {
      var collision = ndgmr.checkRectCollision(pipe, items['heart']);
      if(collision) {
        if (collision.width > 6 && collision.height > 6) {
          heartDie();
        }
      }

      pipe.x = pipe.x - (deltaS * 100);

      if (pipe.x <= (w/2)-pipe.getBounds().width && pipe.rotation == 0 && pipe.name != "countedLine") {
        pipe.name = "countedLine";
        counter = counter + 1;
        showScore();
      }

      if (pipe.x + pipe.getBounds().width <= -pipe.w) {
        pipes.removeChild(pipe);
      }
    }
  }
}

function heartDie() {
  isHeartDead = true;
  items['heart'].paused = true;

  createjs.Tween.removeAllTweens();

  onHeartDie();
}

function onHeartDie() {
  createjs.Tween.get(items['heart']).to({
    rotation: 90,
    y: items['ground1'].y - items['heart'].getBounds().height/2
  }, (380)/1.5, createjs.Ease.linear);

  items['gameOver'].setTransform(((w/2) - (items['gameOver'].getBounds().width/2)), startY-60, 1, 1);
  items['gameOver'].alpha = 0;
  items['gameOver'].addEventListener('click', onGameStart);
  stage.addChild(items['gameOver']);

  createjs.Tween.get(scoreTexts).to({y: items['gameOver'].y + items['gameOver'].getBounds().height + 10}, 250);

  items['startButton'].setTransform(((w/2) - (items['startButton'].getBounds().width/2)),
                                    items['gameOver'].y + items['gameOver'].getBounds().height + 55, 1, 1);
  items['startButton'].removeEventListener('click');

  items['share'].setTransform(((w/2) - (items['share'].getBounds().width/2)),
                                    items['startButton'].y + items['startButton'].getBounds().height + 5, 1, 1);
  items['share'].alpha = 0;
  items['share'].addEventListener('click', onShare);
  stage.addChild(items['share']);

  createjs.Tween.get(items['gameOver']).to({alpha: 1}, 500);
  createjs.Tween.get(items['share']).to({alpha: 1}, 500);
  createjs.Tween.get(items['startButton']).to({alpha: 1}, 500);
  isGameStart = false;
  isRestarted = true;
}

function showScore() {
  if(scoreTexts == null) {
    scoreTexts = new createjs.Container();
    stage.addChild(scoreTexts);
  } else {
    scoreTexts.alpha = 1;
  }
  scoreTexts.removeAllChildren();

  var letters = counter.toString().split('');
  for(var i= 0, l= letters.length; i < l; i++) {
    var _txt = items['numbers'][parseInt(letters[i])].clone();
    if(i == 0) {
      _txt.x = 0;
      _txt.y = 0;
    } else {
      _txt.x = scoreTexts.getChildAt(i-1).x + scoreTexts.getChildAt(i-1).getBounds().width + 1;
      _txt.y = 0;
    }

    scoreTexts.addChild(_txt);
  }

  scoreTexts.setTransform(((w/2) - (scoreTexts.getBounds().width/2)), startY-80, 1, 1);
}

function onShare() {
  var countText = '';
  if (counter == 1) {
    countText = "1 point";
  } else {
    countText = counter + " points";
  }
  window.open("https://twitter.com/share?url=http%3A%2F%2Ffallinginlove.me&text=I scored " + countText +  " on 'Falling in Love' game!");
}