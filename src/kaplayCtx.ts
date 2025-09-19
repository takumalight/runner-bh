import kaplay from "kaplay";

const k = kaplay ({
    width: 1280,
    height: 800,
    letterbox: true,
    global: false,
    buttons: {
        jump: {
            keyboard: ["space"],
            mouse: "left"
        },
    },
    touchToMouse: true,
    debug: true, // turn off when deploying
    pixelDensity: window.devicePixelRatio,
    background: [0,0,0]
});

export default k;