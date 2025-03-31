import { Sprite } from "../sprite.js";
import { canvas, ctx, setContinueAnimation, setEndGame, setMenuActive } from "../helpers.js";
import { drawMenu, resetProgress, unlockAllDiamonds } from "./menus.js";

//check collision for button in menu
function checkButtonCollision(pos, button) {
    return (
        pos.x > button.position.x &&
        pos.x < button.position.x + button.width &&
        pos.y < button.position.y + button.height &&
        pos.y > button.position.y
    );
}

const TEXT_GAP = {
    3: 70,
    4: 42,
    5: 40,
    6: 10,
    7: 30,
    8: 30,
    10: 20,
    11: 20,
    14: 20,
};

class MenuButton {
    constructor({
        position,
        width,
        height,
        yOffset,
        text,
        runCode,
        outerColor = "rgba(146, 146, 146, 0.5)", // Fondo transparente
        borderColor = "black",
        mainColor = "rgba(132, 132, 132, 0.5)", // Fondo transparente
        fontSize = 75,
    }) {
        this.position = position;

        this.width = width;
        this.height = height;
        this.yOffset = yOffset;
        this.text = text;
        this.fontSize = fontSize;
        this.runCode = runCode;
        this.originalValues = {
            position: {
                x: position.x,
                y: position.y,
            },
            width,
            height,
            text,
            fontSize,
        };

        this.outerColor = outerColor;
        this.borderColor = borderColor;
        this.mainColor = mainColor;

        this.pressed = false;

        this.textGap = TEXT_GAP[this.text.length];
    }

    draw() {
        // Dibujar el fondo transparente
        ctx.fillStyle = this.mainColor;
        ctx.fillRect(this.position.x + 2, this.position.y + 2, this.width - 4, this.height - 4);

        // Dibujar el borde
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.position.x, this.position.y, this.width, this.height);

        // Dibujar el texto
        ctx.font = `${this.fontSize}px Cinzel`;
        ctx.lineWidth = 7;
        ctx.strokeStyle = "black";
        ctx.strokeText(this.text, this.position.x + this.textGap, this.position.y + this.fontSize);

        ctx.font = `${this.fontSize}px Cinzel`;
        ctx.fillStyle = "yellow";
        ctx.fillText(this.text, this.position.x + this.textGap, this.position.y + this.fontSize);
    }

    scaleDown() {
        ctx.fillStyle = this.outerColor;
        ctx.fillRect(this.position.x - 1, this.position.y - 1, this.width + 2, this.height + 2);
        this.position.x += 1;
        this.position.y += 1;
        this.width -= 2;
        this.height -= 2;
        this.fontSize -= 1;
    }

    resetSize() {
        this.position.x = this.originalValues.position.x;
        this.position.y = this.originalValues.position.y;
        this.width = this.originalValues.width;
        this.height = this.originalValues.height;
        this.fontSize = this.originalValues.fontSize;
    }

    run() {
        this.runCode();
    }

    updatePositionY(pos) {
        this.position.y = pos + this.yOffset;
    }
}

const pauseButton = new Sprite({
    position: {
        x: canvas.width - 3 * 36,
        y: 0,
    },
    imgSrc: "./res/img/pause_img.png",
});

const unlockAllDiamondsButton = new MenuButton({
    position: {
        x: canvas.width - 520,
        y: canvas.height * 0.88,
    },
    width: 500,
    height: canvas.height * 0.1,
    yOffset: canvas.height * 0.43,
    text: "Unlock all",
    mainColor: "rgba(92, 70, 20, 0.5)", // Fondo transparente
    borderColor: "rgba(92, 70, 20, 0.8)", // Borde semi-transparente
    outerColor: "rgba(92, 70, 20, 0.5)", // Fondo transparente
    runCode: () => {
        unlockAllDiamonds();
        delete menuButtons.mainMenu.unlock;
        drawMenu();
    },
});

let menuButtons = {
    lost: {
        menu: new MenuButton({
            position: {
                x: canvas.width * 0.1 + (canvas.width * 0.8 - 2 * 300 - 125) / 2,
                y: canvas.height * 0.6,
            },
            width: 300,
            height: canvas.height * 0.1,
            yOffset: canvas.height * 0.4,
            text: "menu",
            runCode: () => {
                setMenuActive("mainMenu");
                drawMenu();
            },
        }),

        retry: new MenuButton({
            position: {
                x: canvas.width * 0.1 + (canvas.width * 0.8 - 2 * 300 - 125) / 2 + 425,
                y: canvas.height * 0.6,
            },
            width: 300,
            height: canvas.height * 0.1,
            yOffset: canvas.height * 0.4,
            text: "retry",
            runCode: () => {
                setEndGame(true);
            },
        }),
    },

    paused: {
        end: new MenuButton({
            position: {
                x: canvas.width * 0.1 + (canvas.width * 0.8 - 2 * 300 - 125) / 2,
                y: canvas.height * 0.5,
            },
            width: 300,
            height: canvas.height * 0.1,
            yOffset: canvas.height * 0.3,
            text: "end",
            runCode: () => {
                setMenuActive("mainMenu");
                drawMenu();
            },
        }),

        retry: new MenuButton({
            position: {
                x: canvas.width * 0.1 + (canvas.width * 0.8 - 2 * 300 - 125) / 2 + 425,
                y: canvas.height * 0.5,
            },
            width: 300,
            height: canvas.height * 0.1,
            yOffset: canvas.height * 0.3,
            text: "retry",
            runCode: () => {
                setEndGame(true);
            },
        }),

        resume: new MenuButton({
            position: {
                x: canvas.width * 0.4,
                y: canvas.height * 0.65,
            },
            width: 300,
            height: canvas.height * 0.1,
            yOffset: canvas.height * 0.45,
            text: "resume",
            runCode: () => {
                setContinueAnimation(true);
            },
        }),
    },

    won: {
        continue: new MenuButton({
            position: {
                x: canvas.width * 0.2 + 450 / 2,
                y: canvas.height * 0.63,
            },
            width: 450,
            height: canvas.height * 0.1,
            yOffset: canvas.height * 0.43,
            text: "continue",
            runCode: () => {
                setMenuActive("mainMenu");
                drawMenu();
            },
        }),
    },
};

export { pauseButton, menuButtons, checkButtonCollision, unlockAllDiamondsButton };
