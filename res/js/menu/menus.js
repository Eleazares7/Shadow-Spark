import { Sprite } from "../sprite.js";
import { menuButtons, unlockAllDiamondsButton } from "./buttons.js";
import {
    canvas,
    ctx,
    currentLevel,
    menuLevels,
    menuLevelsPath,
    setMenuLevels,
    setMenuLevelsPath,
} from "../helpers.js";
import { levelTime } from "../time.js";
import { drawArrow, quests } from "./quests.js";
import { MenuLevel } from "./menuLevel.js";

const menuBg = new Sprite({
    position: {
        x: canvas.width * 0.1,
        y: canvas.height * 0.2,
    },
    imgSrc: "./res/img/menu_bg.png",
});

const menuDiamondsBorderColor = {
    true: "#fac702",
    false: "#4d3b0e",
};

// Cargar la imagen de fondo
const menuBackground = new Sprite({
    position: {
        x: 0,
        y: 0,
    },
    imgSrc: "./res/img/bg-menu.webp", // Ruta de la nueva imagen de fondo
});

// Función para aplicar un desenfoque a una imagen
function applyBlurToImage(image, blurAmount) {
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");

    // Establecer las dimensiones del canvas temporal
    tempCanvas.width = image.width;
    tempCanvas.height = image.height;

    // Dibujar la imagen en el canvas temporal
    tempCtx.drawImage(image, 0, 0, tempCanvas.width, tempCanvas.height);

    // Aplicar el desenfoque usando el filtro de CSS (si está disponible)
    if (tempCtx.filter) {
        tempCtx.filter = `blur(${blurAmount}px)`;
        tempCtx.drawImage(tempCanvas, 0, 0);
    } else {
        // Si el filtro no está disponible, aplicar un desenfoque manual (menos eficiente)
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            // Aplicar un desenfoque básico (promedio de píxeles cercanos)
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = avg;     // Red
            data[i + 1] = avg; // Green
            data[i + 2] = avg; // Blue
        }

        tempCtx.putImageData(imageData, 0, 0);
    }

    return tempCanvas;
}

// Variable para almacenar la imagen desenfocada
let blurredBackground = null;

// Cargar la imagen y aplicar el desenfoque
menuBackground.image.onload = () => {
    blurredBackground = applyBlurToImage(menuBackground.image, 5); // Ajusta el valor de blurAmount según sea necesario
};

const menusTexts = {
    lost: () => {
        ctx.font = "120px Cinzel";
        ctx.lineWidth = 7;
        ctx.strokeStyle = "black";
        ctx.strokeText("Game Over", canvas.width * 0.25, menuBg.position.y + canvas.height * 0.25);

        ctx.fillStyle = "yellow";
        ctx.fillText("Game Over", canvas.width * 0.25, menuBg.position.y + canvas.height * 0.25);
    },
    paused: () => {
        ctx.font = "120px Cinzel";
        ctx.lineWidth = 7;
        ctx.strokeStyle = "black";
        ctx.strokeText("Paused", canvas.width * 0.35, menuBg.position.y + canvas.height * 0.25);

        ctx.fillStyle = "yellow";
        ctx.fillText("Paused", canvas.width * 0.35, menuBg.position.y + canvas.height * 0.25);
    },
    won: () => {
        const fullText = `Time : ${levelTime.minutes}:${levelTime.seconds}`;
        //time
        ctx.font = "50px Cinzel";
        ctx.lineWidth = 7;
        ctx.strokeStyle = "black";
        ctx.strokeText(fullText, 600, menuBg.position.y + 160);

        ctx.fillStyle = "yellow";
        ctx.fillText(fullText, 600, menuBg.position.y + 160);

        menuLevels[currentLevel].quests.forEach((quest) => {
            quest.updatePositionY(menuBg.position.y);
            quest.draw();
        });

        drawArrow(menuBg.position.y);

        menuWonDiamond.position.y = menuBg.position.y + 280;
        menuWonDiamond.setQuestsStatus(menuLevels[currentLevel].questsStatus);
        menuWonDiamond.drawFullDiamond();
    },
};

let menuWonDiamond = new MenuLevel({
    position: {
        x: 900,
        y: 270,
    },
    unlocked: true,
});

function drawInGameMenu(name, transform) {
    menuBg.position.y += transform;
    menuBg.draw();

    menusTexts[name]();

    for (const btnName in menuButtons[name]) {
        menuButtons[name][btnName].updatePositionY(menuBg.position.y);
        menuButtons[name][btnName].draw();
    }

    menuBg.position.y -= transform;
}

function drawMenu() {
    // Dibujar el fondo desenfocado
    if (blurredBackground) {
        ctx.drawImage(blurredBackground, 0, 0, canvas.width, canvas.height);
    }

    // Resto del código para dibujar el texto, botones, diamantes, etc.
    let fullText = "Shadow";
    ctx.font = "75px Cinzel";
    ctx.lineWidth = 7;
    ctx.strokeStyle = "black";

    // Configura la sombra para "Shadow"
    ctx.shadowBlur = 10;
    ctx.shadowColor = "white";
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;

    ctx.strokeText(fullText, canvas.width * 0.18, canvas.height * 0.08);
    ctx.fillStyle = "black";
    ctx.fillText(fullText, canvas.width * 0.18, canvas.height * 0.08);

    // Restablece la sombra para "and"
    ctx.shadowBlur = 0;
    ctx.shadowColor = "transparent";
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    fullText = "and";
    ctx.font = "75px Cinzel";
    ctx.strokeStyle = "black";
    ctx.strokeText(fullText, canvas.width * 0.42, canvas.height * 0.08);
    ctx.fillStyle = "#cccccc";
    ctx.fillText(fullText, canvas.width * 0.42, canvas.height * 0.08);

    // Dibuja "Spark" con sombra negra
    fullText = "Spark";
    ctx.font = "75px Cinzel";
    ctx.strokeStyle = "black";

    // Configura la sombra para "Spark"
    ctx.shadowBlur = 10;
    ctx.shadowColor = "black";
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;

    ctx.strokeText(fullText, canvas.width * 0.62, canvas.height * 0.08);
    ctx.fillStyle = "#ffd700";
    ctx.fillText(fullText, canvas.width * 0.62, canvas.height * 0.08);

    // Restablece la sombra para el resto del texto
    ctx.shadowBlur = 0;
    ctx.shadowColor = "transparent";
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Texto de creador
    fullText = "Created by:";
    ctx.font = "50px Cinzel";
    ctx.strokeStyle = "black";
    ctx.strokeText(fullText, canvas.width * 0.01, canvas.height * 0.80);
    ctx.fillStyle = "yellow";
    ctx.fillText(fullText, canvas.width * 0.01, canvas.height * 0.80);

    // Nombres de los creadores
    let creators = [
        "Medirec",
        "Hernández Hernández José Eleazar",
        "Banda Rayo Diana Monserrat",
        "Romo Mañon Rodrigo de Jesús"
    ];

    ctx.font = "30px Cinzel";
    let startY = canvas.height * 0.85;

    creators.forEach((name, index) => {
        ctx.strokeText(name, canvas.width * 0.01, startY + index * 50);
        ctx.fillText(name, canvas.width * 0.01, startY + index * 50);
    });

    // Botones
    for (const btnName in menuButtons.mainMenu) {
        menuButtons.mainMenu[btnName].draw();
    }

    // Paths
    for (const key in menuLevelsPath) {
        const path = menuLevelsPath[key];
        drawFullPath(path);
    }

    // Diamonds
    for (const key in menuLevels) {
        const diamond = menuLevels[key];
        diamond.drawFullDiamond();
    }
}



function drawFullPath(path) {
    const mainColor = menuDiamondsBorderColor[path.unlocked];
    drawPathPart(path, 0, 3, "black");
    drawPathPart(path, 3, 9, mainColor);
    drawPathPart(path, 12, 3, "black");
}

function drawPathPart(path, offset, width, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(path.position.x + offset, path.position.y);
    ctx.lineTo(path.finalPosition.x + offset, path.finalPosition.y);
    ctx.lineTo(path.finalPosition.x + width + offset, path.finalPosition.y);
    ctx.lineTo(path.position.x + width + offset, path.position.y);
    ctx.lineTo(path.position.x + offset, path.position.y);
    ctx.fill();
}

function checkMenuDiamondsCollision(pos, diamond) {
    return (
        diamond.unlocked &&
        pos.x > diamond.position.x &&
        pos.x < diamond.position.x + diamond.height * 0.9 &&
        pos.y < diamond.position.y + diamond.height &&
        pos.y > diamond.position.y
    );
}

function unlockAllDiamonds() {
    for (const index in menuLevels) {
        menuLevels[index].unlocked = true;
    }
    for (const index in menuLevelsPath) {
        menuLevelsPath[index].unlocked = true;
    }
    drawMenu();
}

function resetProgress() {
    localStorage.clear();

    for (const index in menuLevels) {
        menuLevels[index].setQuestsStatus(0);
        if (index == 1) {
            menuLevels[index].unlocked = true;
            continue;
        }
        menuLevels[index].unlocked = false;
    }

    for (const index in menuLevelsPath) {
        menuLevelsPath[index].unlocked = false;
    }

    menuButtons.mainMenu.unlock = unlockAllDiamondsButton;

    drawMenu();
}

let menuLevelX = canvas.width * 0.48;

setMenuLevels({
    1: new MenuLevel({
        position: {
            x: menuLevelX,
            y: canvas.height * 0.5,
        },
        questsStatus: 0,
        unlocked: true,
        pathUnlocking: [1],
        levelsUnlocking: [2],
        quests: [quests.levelCompleted, quests.allDiamonds],
    }),
    
});

let menuLevelPathX = 691;

// setMenuLevelsPath({
//     1: {
//         position: {
//             x: menuLevelPathX,
//             y: canvas.height * 0.9,
//         },
//         finalPosition: {
//             x: menuLevelPathX,
//             y: canvas.height * 0.81,
//         },
//         unlocked: false,
//     },
//     2: {
//         position: {
//             x: menuLevelPathX,
//             y: canvas.height * 0.75,
//         },
//         finalPosition: {
//             x: menuLevelPathX,
//             y: canvas.height * 0.66,
//         },
//         unlocked: false,
//     },
//     3: {
//         position: {
//             x: menuLevelPathX,
//             y: canvas.height * 0.6,
//         },
//         finalPosition: {
//             x: menuLevelPathX,
//             y: canvas.height * 0.51,
//         },
//         unlocked: false,
//     },
//     4: {
//         position: {
//             x: menuLevelPathX,
//             y: canvas.height * 0.45,
//         },
//         finalPosition: {
//             x: menuLevelPathX,
//             y: canvas.height * 0.36,
//         },
//         unlocked: false,
//     },
//     5: {
//         position: {
//             x: menuLevelPathX,
//             y: canvas.height * 0.3,
//         },
//         finalPosition: {
//             x: menuLevelPathX,
//             y: canvas.height * 0.21,
//         },
//         unlocked: false,
//     },
// });

export {
    drawMenu,
    drawInGameMenu,
    checkMenuDiamondsCollision,
    unlockAllDiamonds,
    menuDiamondsBorderColor,
    resetProgress,
};
