require(["scenes/need-files", "resources", "pixi"], function(NeedFiles, Resources, PIXI) {
    // Global constants
    window.TIME_CONSTANT = 1000;
    window.NOTE_APPEAR = 0.5 * TIME_CONSTANT;
    window.NOTE_FULL_APPEAR = 0.4 * TIME_CONSTANT;
    window.NOTE_DISAPPEAR = -0.2 * TIME_CONSTANT;
    window.NOTE_DESPAWN = -2 * TIME_CONSTANT;
    window.SLIDER_LINEAR = "L";
    window.SLIDER_CATMULL = "C";
    window.SLIDER_BEZIER = "B";
    window.SLIDER_PASSTHROUGH = "P";

    window.RESULT_EXPAND_SCALE = 0.5;
    window.RESULT_SHRINK_SCALE = 0.2;

    window.AudioContext = window.AudioContext || window.webkitAudioContext;

    PIXI.Sprite.prototype.bringToFront = function() {
        if (this.parent) {
            var parent = this.parent;
            parent.removeChild(this);
            parent.addChild(this);
        }
    }

    var canvas = document.querySelector("canvas");

    var game = {
        canvas: canvas,
        renderer: null,
        stage: null,
        scene: null,
        mouseX: 0,
        mouseY: 0,
        click: 100,
        lastFrameTime: -1
    };
    window.game = game;

    window.addEventListener("keydown", function(e) {
        if (e.keyCode === 70 || e.keyCode === 68 // fd
            || e.keyCode === 90 || e.keyCode === 88 // zx
            ) {
            game.click = 151;
        }
    });
    window.addEventListener("keyup", function(e) {
        if (e.keyCode === 70 || e.keyCode === 68 // fd
            || e.keyCode === 90 || e.keyCode === 88 // zx
            ) {
            game.click = 150;
        }
    });
    canvas.addEventListener("mousemove", function(e) {
        game.mouseX = e.clientX;
        game.mouseY = e.clientY;
    });
    canvas.addEventListener("mousedown", function(e) {
        e.preventDefault();
        game.click = 151;
    });
    canvas.addEventListener("mouseup", function(e) {
        game.click = 150;
    });
    document.addEventListener("contextmenu", function(e) {
        e.preventDefault();
        return false;
    });

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    game.renderer = PIXI.autoDetectRenderer(canvas.width, canvas.height,
        { view: canvas, backgroundColor: 0xFFFFFF });
    game.stage = new PIXI.Container();

    game.cursor = null;
    game.cursorMiddle = null;

    var statusText = new PIXI.Text("Loading...", { font: "24px sans" });
    statusText.anchor.x = statusText.anchor.y = 0.5;
    statusText.x = game.canvas.width / 2;
    statusText.y = game.canvas.height / 2;
    game.stage.addChild(statusText);

    var wipText = new PIXI.Text("WORK IN PROGRESS", { font: "24px sans", fill: 0xFF0000 });
    wipText.anchor.x = 0.5;
    wipText.x = game.canvas.width / 2;
    wipText.y = 0;
    game.stage.addChild(wipText);

    Resources.oncomplete = function() {
        game.cursor = new PIXI.Sprite(Resources["cursor.png"]);
        game.cursorMiddle = new PIXI.Sprite(Resources["cursormiddle.png"]);
        game.cursor.anchor.x = game.cursor.anchor.y = 0.5;
        game.cursorMiddle.anchor.x = game.cursorMiddle.anchor.y = 0.5;
        game.stage.addChild(game.cursor);
        game.stage.addChild(game.cursorMiddle);
        game.stage.removeChild(statusText);
        game.scene = new NeedFiles(game);
    };
    Resources.loadDefault();

    function gameLoop(timestamp) {
        var timediff = timestamp - game.lastFrameTime;

        if (game.cursor && game.cursorMiddle) {
            // Handle cursor
            game.cursor.x = game.mouseX;
            game.cursor.y = game.mouseY;
            game.cursorMiddle.x = game.mouseX;
            game.cursorMiddle.y = game.mouseY;
            if (game.click > 100 && game.click <= 150) {
                game.click -= timediff * 0.2;
            }
            if (game.click < 100) {
                game.click = 100;
            }
            game.cursor.scale.x = game.cursor.scale.y = (game.click / 100);
            game.cursor.rotation += timediff * 0.001;
            game.cursor.bringToFront();
            game.cursorMiddle.bringToFront();
        }

        if (game.scene) {
            game.scene.render(timestamp);
        }

        wipText.bringToFront();
        game.renderer.render(game.stage);
        game.lastFrameTime = timestamp;

        window.requestAnimationFrame(gameLoop);
    }

    window.requestAnimationFrame(gameLoop);
});
