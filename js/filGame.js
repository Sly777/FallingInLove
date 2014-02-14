/**
 * Created by Ilker Guller on 14.02.2014.
 */

var stage, isTouchEnable = true, w, h, loader, background, sprSheet,
    ground, outerPadding = 0, items = {}, startX, startY, wiggleDelta,
    pipes, isGameStart = false, isHeartDead = false, masterPipeDelay = 1.5,
    pipeDelay = masterPipeDelay, gap = 250, pipe, pipe2;

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
      [0, 0, 288, 512, 0],      // light Bg
      [292, 0, 288, 512, 0],    // dark Bg
      [584, 0, 336, 112, 0],    // ground

      [6, 982, 29, 24, 0],    // heart1
      [62, 982, 29, 24, 0],    // heart2
      [118, 982, 29, 24, 0],    // heart3

      [702, 182, 178, 37, 0],    // Game Name
      [702, 234, 116, 70, 0],    // Start Button
      [884, 182, 121, 14, 0],    // Credit
      [584, 182, 114, 98, 0],    // Tutorial
      [584, 116, 196, 62, 0],    // GetReady

      [0, 646, 52, 320, 0],    // Pipe1
      [168, 646, 52, 320, 0]     // Pipe2
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

  for (var key in items) {
    if(key == 'heart') continue;
    var obj = items[key];
    obj.paused = true;
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

  items['ground1'].y = h - items['ground1'].getBounds().height;
  items['ground2'].y = h - items['ground2'].getBounds().height;
  items['ground2'].x = w;

  stage.addChild(items['lightBg']);

  startX = (w/2) - (items['heart'].getBounds().width/2);
  startY = 150 + outerPadding;
  wiggleDelta = 18;

  items['heart'].setTransform(startX, startY, 1, 1);
  items['heart'].framerate = 30;
  createjs.Tween.get(items['heart'], {loop:true}).to({y:startY + wiggleDelta}, 380, createjs.Ease.sineInOut).to({y:startY}, 380, createjs.Ease.sineInOut);

  createjs.Tween.get(items['ground1']).to({x:-(items['ground1'].getBounds().width)}, 3000).call(function() {
    items['ground1'].x = w;

    createjs.Tween.get(items['ground1'], {loop:true}).to({x:-(items['ground1'].getBounds().width)}, 6000).call(function() {
      items['ground1'].x = w;
    });
  });
  createjs.Tween.get(items['ground2']).wait(400).to({x:-(items['ground2'].getBounds().width)}, 5600).call(function() {
    items['ground2'].x = w;

    createjs.Tween.get(items['ground2'], {loop:true}).to({x:-(items['ground2'].getBounds().width)}, 6000).call(function() {
      items['ground2'].x = w;
    });
  });

  stage.addChild(items['heart'], items['ground1'], items['ground2']);

  pipes = new createjs.Container();
  stage.addChild(pipes);

  onCreateStartScreen();

  createjs.Ticker.timingMode = createjs.Ticker.RAF;
  createjs.Ticker.addEventListener("tick", onTick);
}

function onCreateStartScreen() {
  items['gameName'].setTransform(((w/2) - (items['gameName'].getBounds().width/2)), startY-50, 1, 1);
  items['startButton'].setTransform(((w/2) - (items['startButton'].getBounds().width/2)), startY+60, 1, 1);
  items['credit'].setTransform(((w/2) - (items['credit'].getBounds().width/2)), startY+130, 1, 1);

  items['startButton'].addEventListener('click', onBeforeGameStart);

  stage.addChild(items['gameName'], items['startButton'], items['credit']);
}

function onBeforeGameStart() {
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

  createjs.Tween.get(items['tutorial']).to({alpha: 1}, 500);
  createjs.Tween.get(items['getReady']).to({alpha: 1}, 500);
}

function onGameStart() {
  createjs.Tween.get(items['tutorial']).to({alpha: 0}, 500);
  createjs.Tween.get(items['getReady']).to({alpha: 0}, 500);
  isGameStart = true;
}

function onTick(event) {
  var deltaS = event.delta/1000;

  var l = pipes.getNumChildren();

  if (items['heart'].y > (items['ground1'] - 40)) {
    if (!isHeartDead) {
      die();
    }

    if (items['heart'].y > (items['ground1'] - 30)) {
      createjs.Tween.removeTweens(items['heart']);
    }
  }

  if (isGameStart && !isHeartDead) {
    if (pipeDelay < 0) {
      pipe = items["pipe1"];
      pipe.x = w-10;
      pipe.y = 0;//(items['ground1'].getBounds().y - gap*2) * Math.random() + gap*1.5;
      pipes.addChild(pipe);

      pipe2 = items["pipe1"];
      pipe2.scaleX = -1;
      pipe2.rotation = 180;
      pipe2.x = pipe.x;
      pipe2.y = pipe.y - gap;

      pipes.addChild(pipe2);
      pipeDelay = masterPipeDelay;
    } else {
      pipeDelay = pipeDelay - 1*deltaS;
    }

    for(var i = 0; i < l; i++) {
      pipe = pipes.getChildAt(i);
      if (pipe) {
        pipe.x = (pipe.x - deltaS*100);
/*        if (pipe.x <= 338 && pipe.rotation == 0 && pipe.name != "counted") {
          pipe.name = "counted" //using the pipe name to count pipes
          counter.text = counter.text + 1
          counterOutline.text = counterOutline.text + 1
        }*/
        if (pipe.x + pipe.getBounds().width <= -pipe.w) {
          pipes.removeChild(pipe);
        }
      }
    }

    /*
      if (counterShow) {
      counter.alpha = 1
      counterOutline.alpha = 1
      counterShow = false
    }*/

  }

  stage.update(event);
}

function onCreatePipes() {
  pipes = new createjs.Container();
  stage.addChild(pipes);
}