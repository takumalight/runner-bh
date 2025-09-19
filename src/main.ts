import { makeEnemy, makeMangosteen, makeRunner } from "./entities";
import k from "./kaplayCtx";
import type { GameObj } from "kaplay";

 /*
  * LOAD ASSETS
  */
//  Load Sprites
k.loadSprite("background", "graphics/ph_background.png");
k.loadSprite("platforms", "graphics/ph_platform.png");
k.loadSprite("mangosteen", "graphics/ph_mangosteen.png");
k.loadSprite("runner", "graphics/bh_spritesheet_eljay.png", {
    sliceX: 8,
    sliceY: 4,
    anims: {
        run: { from: 16, to: 23, loop: true, speed: 15 },
        jump: { frames: [3] }
    }
});
k.loadSprite("takuma", "graphics/bh_spritesheet_takuma_flip-sheet.png", {
    sliceX: 6,
    anims: {
        walk: { from: 0, to: 5, loop: true, speed: 10 }
    }
});

// Load Sounds
// TODO

// Load Fonts
k.loadFont("bionrg_", "fonts/bionrg_.TTF");

k.scene("game", () => {
    /* 
     * CONSTANTS
     */
    const PLATFORM_HEIGHT = 550;

    /* 
    GAME LOGIC
     */
    let gameSpeed = 100;
    k.loop(1, () => {
        gameSpeed += 50;
    });
    k.setGravity(3100);
    let score = 0;
    let scoreMultiplier = 0;
    const scoreText = k.add([
        k.text("SCORE: 0", {
            // font: "bionrg_",
            size: 60,
            letterSpacing: 5
        }),
        k.pos(20, 20),
        k.z(2)
    ]);

    /* 
     * ENVIRONMENT
     */
    const bgPieceWidth = 1920;
    const bgPieces = [
        k.add([
            k.sprite("background"),
            k.pos(0,0),
            k.opacity(0.8),
            k.scale(1.5)
        ]),
        k.add([
            k.sprite("background"),
            k.pos(bgPieceWidth, 0),
            k.opacity(0.8),
            k.scale(1.5)
        ])
    ];

    const platformWidth = 2560;
    const platforms = [
        k.add([
            k.sprite("platforms"),
            k.pos(0, PLATFORM_HEIGHT),
            k.scale(2)
        ]),
        k.add([
            k.sprite("platforms"),
            k.pos(2560, PLATFORM_HEIGHT),
            k.scale(2)
        ])
    ];

    // Solid Ground
    k.add([
        k.rect(1280, 200),
        k.opacity(0),
        k.pos(0, PLATFORM_HEIGHT),
        k.area(),
        k.body({ isStatic: true })
    ]);

    /*
     * ADD RUNNER
     */
    const runner = makeRunner(k.vec2(100, 100));
    runner.setControls();
    runner.setEvents();
    const mangosteenCollectUI = runner.add([
        k.text("", {
            // font: "bionrg_",
            size: 20
        }),
        k.color(255, 255, 255),
        k.anchor("center"),
        k.pos(30, -60)
    ]);

    /* 
     * INTERACTABLES
     */
    const spawnMangosteen = () => {
        const mangosteen = makeMangosteen(k.vec2(1280, PLATFORM_HEIGHT + 5));
        mangosteen.onUpdate(() => {
            mangosteen.move(-gameSpeed, 0);
        });
        mangosteen.onExitScreen(() => {
            k.destroy(mangosteen);
        });

        const waitTime = k.rand(0.5, 3);
        k.wait(waitTime, spawnMangosteen);
    };
    spawnMangosteen();

    runner.onCollide("mangosteen", (mangosteen: GameObj) => {
        // k.play("pickup", { volume: 0.5 });
        k.destroy(mangosteen);
        score++;
        scoreText.text = `SCORE: ${score}`;
        mangosteenCollectUI.text = "Yum!";
        k.wait(1, () => {
            mangosteenCollectUI.text = "";
        });
    });

    const spawnEnemy = () => {
        const enemy = makeEnemy(k.vec2(1280, PLATFORM_HEIGHT-1));
        enemy.onUpdate(() => {
            if (gameSpeed < 3000) {
                enemy.move(-(gameSpeed + 300), 0);
                return;
            }
            enemy.move(-gameSpeed, 0);
        });
        enemy.onExitScreen(() => {
            k.destroy(enemy);
        });

        const waitTime = k.rand(0.5, 2.5);
        k.wait(waitTime, spawnEnemy);
    };
    spawnEnemy();
    
    runner.onCollide("enemy", (enemy) => {
        if (!runner.isGrounded() && runner.vel > k.vec2(0,0)) {
            // TODO: destroy sound
            // TODO: scoring sound
            k.destroy(enemy);
            runner.play("jump");
            runner.jump();
            scoreMultiplier += 1;
            score += 10 * scoreMultiplier;
            scoreText.text = `SCORE: ${score}`;
            if (scoreMultiplier === 1) {
                mangosteenCollectUI.text = "Stomp!";
            }
            if (scoreMultiplier > 1) {
                mangosteenCollectUI.text = "Combo!"
            }
            k.wait(1, () => {
                mangosteenCollectUI.text = "";
            });
            return;
        }

        // TODO: hurt sound
        k.setData("current-score", score);
        k.go("game-over");
    });

    runner.onGround(() => {
        scoreMultiplier = 0;
    });


    /* 
    * GAME LOOP
     */
    k.onUpdate(() => {
        if (bgPieces[1].pos.x < 0) {
            bgPieces[0].moveTo(bgPieces[1].pos.x + bgPieceWidth, 0);
            const frontBgPiece = bgPieces.shift();
            if (frontBgPiece) bgPieces.push(frontBgPiece);
        }
        bgPieces[0].move(-100, 0);
        bgPieces[1].moveTo(bgPieces[0].pos.x + bgPieceWidth, 0);

        if (platforms[1].pos.x < 0) {
            platforms[0].moveTo(
                platforms[1].pos.x + platformWidth,
                platforms[1].pos.y
            );
            const frontPlatform = platforms.shift();
            if (frontPlatform) platforms.push(frontPlatform);
        }

        platforms[0].move(-gameSpeed, 0);
        platforms[1].moveTo(platforms[0].pos.x + platformWidth, platforms[0].pos.y);
    });
});

k.scene("game-over", () => {
    let bestScore = k.getData("best-score") || 0;
    const currentScore = k.getData("current-score") || 0;

    if (currentScore && bestScore < currentScore) {
        k.setData("best-score", currentScore);
        bestScore = currentScore;
    }

    k.add([
        k.text("GAME OVER", {
            font: "bionrg_",
            size: 64
        }),
        k.anchor("center"),
        k.pos(k.center().x, k.center().y - 300)
    ]);
    k.add([
        k.text(`BEST SCORE: ${bestScore}`, {
            // font: "bionrg_",
            size: 32
        }),
        k.anchor("center"),
        k.pos(k.center().x - 400, k.center().y - 200)
    ]);
    k.add([
        k.text(`CURRENT SCORE: ${currentScore}`, {
            // font: "bionrg_",
            size: 32
        }),
        k.anchor("center"),
        k.pos(k.center().x + 400, k.center().y - 200)
    ]);

    k.wait(1, () => {
        k.add([
            k.text("Press Space, Click, or Touch Screen to Play Again", {
                // font: "bionrg_",
                size: 32
            }),
            k.anchor("center"),
            k.pos(k.center().x, k.center().y + 200)
        ]);
        k.onButtonPress("jump", () => k.go("game"));
    });
});

k.go("game");
