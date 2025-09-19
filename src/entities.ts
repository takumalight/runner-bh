import type { Vec2, GameObj } from "kaplay";
import k from "./kaplayCtx";

export function makeRunner(position: Vec2) {
    return k.add([
        k.sprite("runner", { anim: "run" }),
        k.scale(3),
        k.area({ shape: new k.Rect(k.vec2(10, 0), 25, 45) }),
        k.anchor("bot"),
        k.pos(position),
        k.body({ jumpForce: 1400 }),
        {
            setControls(this: GameObj) {
                k.onButtonPress("jump", () => {
                    if (this.isGrounded()) {
                        this.play("jump");
                        this.jump();
                        // k.play("aud_jump", { volume: 0.5 });
                    }
                });
            },
            setEvents(this: GameObj) {
                this.onGround(() => {
                    this.play("run");
                });
            },
        },
    ]);
}

export function makeMangosteen(position: Vec2) {
    return k.add([
        k.sprite("mangosteen"),
        k.area(),
        k.scale(3),
        k.anchor("bot"),
        k.pos(position),
        k.offscreen(),
        "mangosteen"
    ]);
}

export function makeEnemy(position: Vec2) {
    return k.add([
        k.sprite("takuma", { anim: "walk", flipX: true }),
        k.area({ shape: new k.Rect(k.vec2(0, 0), 20, 52) }),
        k.scale(3),
        k.anchor("bot"),
        k.pos(position),
        k.offscreen(),
        "enemy"
    ]);
}
