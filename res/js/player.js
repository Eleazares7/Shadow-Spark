import { Sprite } from "./sprite.js";
import { ctx } from "./helpers.js";

export class Player extends Sprite {
    constructor({
        position,
        collisionBlocks,
        blocksAssets,
        diamonds,
        imgSrc,
        frameRate,
        frameDelay,
        currentRow,
        imgRows,
        legs,
        keys,
        animations,
        element,
    }) {
        super({ position, imgSrc, frameRate, frameDelay, currentRow, imgRows, animations });
        this.position = position;
        this.velocity = {
            x: 0,
            y: 0,
        };
        this.keys = keys;
        this.element = element;

        this.collisionBlocks = collisionBlocks;
        this.blocksAssets = blocksAssets;
        this.diamonds = diamonds;

        this.isOnBlock = false;

        this.lastPosition = position;

        this.hitbox = {
            position: {
                x: this.position.x + 4,
                y: this.position.y + 12,
            },
            width: 36,
            height: 60,
            legs: {
                position: {
                    x: this.position.x,
                    y: this.position.y,
                },
                width: 12,
                height: 24,
            },
        };

        this.legs = legs;

        this.sliding = {
            left: false,
            right: false,
        };

        this.currentAnimation = "idle";

        this.died = false;

        this.rampBlocked = false;
        this.isOnRamp = false;
    }
    update() {
        this.hitboxPositionCalc();
        this.lastPosition = this.hitbox.position;

        ctx.fillStyle = "rgba(0,0,255,0.5)";
        ctx.fillRect(
            this.hitbox.position.x,
            this.hitbox.position.y,
            this.hitbox.width,
            this.hitbox.height - this.hitbox.legs.height
        );
        ctx.fillStyle = "rgba(0,255,0, 0.5)";
        ctx.fillRect(
            this.hitbox.legs.position.x,
            this.hitbox.legs.position.y,
            this.hitbox.legs.width,
            this.hitbox.legs.height
        );

        this.position.x += this.velocity.x;

        this.hitboxPositionCalc();
        this.horizontalCollision(this.blocksAssets);

        this.hitboxPositionCalc();
        this.horizontalCollision(this.collisionBlocks);

        //gravity
        this.gravity();

        this.hitboxPositionCalc();
        this.isOnBlock = false;
        this.sliding.right = false;
        this.sliding.left = false;
        this.rampBlocked = false;
        this.verticalCollision(this.collisionBlocks);

        this.hitboxPositionCalc();
        this.isOnRamp = false;
        this.verticalCollision(this.blocksAssets);

        this.hitboxPositionCalc();
        this.calculateAngle();

        this.legs.position = {
            x: this.position.x + 37,
            y: this.position.y + 72,
        };
    }
    changeSprite(name) {
        if (name != this.currentAnimation) {
            //head animation
            this.currentFrame = 0;
            this.frameCount = 0;

            this.frameRate = this.animations[name].frameRate;
            this.currentRow = this.animations[name].currentRow;
            if (this.animations[name].flipImage) this.flipImage = true;
            else this.flipImage = false;

            this.currentAnimation = name;

            if (name == "up" || name == "down") {
                name = "idle";
            }

            //legs animation
            this.legs.currentFrame = 0;
            this.legs.frameCount = 0;

            this.legs.frameRate = this.legs.animations[name].frameRate;
            this.legs.currentRow = this.legs.animations[name].currentRow;
            if (this.legs.animations[name].flipImage) this.legs.flipImage = true;
            else this.legs.flipImage = false;
        }
    }
    checkDiamonds() {
        for (let i = 0; i < this.diamonds.length; i++) {
            let diamond = this.diamonds[i];
            if (
                this.element == diamond.element &&
                this.hitbox.position.x <= diamond.position.x + diamond.width &&
                this.hitbox.position.x + this.hitbox.width >= diamond.position.x &&
                this.hitbox.position.y <= diamond.position.y + diamond.height &&
                this.hitbox.position.y + this.hitbox.height >= diamond.position.y
            ) {
                //collect diamond
                this.diamonds.splice(i, 1);
            }
        }
    }
    calculateAngle() {
        this.angle =
            Math.atan2(
                this.hitbox.position.y - this.lastPosition.y,
                Math.abs(this.hitbox.position.x - this.lastPosition.x)
            ) / 4;
        if (this.angle > 0) {
            this.angle /= 1.5;
        }
    }
    hitboxPositionCalc() {
        this.hitbox.position = {
            x: this.position.x + 31,
            y: this.position.y + 37,
        };
        this.hitbox.legs.position = {
            x: this.hitbox.position.x + (this.hitbox.width - this.hitbox.legs.width) / 2,
            y: this.hitbox.position.y + this.hitbox.height - this.hitbox.legs.height,
        };
    }
    gravity() {
        this.velocity.y += 0.5;
        this.position.y += this.velocity.y;
    }
    horizontalCollision(blocks) {
        for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i];

            if (
                this.hitbox.position.x <= block.hitbox.position.x + block.hitbox.width &&
                this.hitbox.position.x + this.hitbox.width >= block.hitbox.position.x &&
                this.hitbox.position.y + this.hitbox.height >= block.hitbox.position.y + 1 &&
                this.hitbox.position.y <= block.hitbox.position.y + block.hitbox.height
            ) {
                //ramp blocked
                if (this.rampBlocked) {
                    break;
                }

                if (block.shape == "square" || block.shape == "ramp" || block.shape == "lever") {
                    //head collision
                    if (
                        this.hitbox.position.y + this.hitbox.height - this.hitbox.legs.height >=
                            block.hitbox.position.y &&
                        Math.round(this.hitbox.position.y) <
                            block.hitbox.position.y + block.hitbox.height &&
                        !this.sliding.right &&
                        !this.sliding.left
                    ) {
                        let moveTo;
                        if (block.shape == "lever") {
                            //pushing lever to left
                            if (
                                this.velocity.x < 0 &&
                                Math.round(block.angle / (Math.PI / 180)) > -30
                            ) {
                                block.angle -= Math.PI / 180;
                            }
                            //pushing lever to right
                            else if (
                                this.velocity.x > 0 &&
                                Math.round(block.angle / (Math.PI / 180)) < 30
                            ) {
                                block.angle += Math.PI / 180;
                            }
                            //lever pushing player to left
                            else if (
                                this.velocity.x == 0 &&
                                this.hitbox.position.x <= block.hitbox.position.x
                            ) {
                                moveTo = "left";
                            }
                            //lever pushing player to right
                            else if (
                                this.velocity.x == 0 &&
                                this.hitbox.position.x >= block.hitbox.position.x
                            ) {
                                moveTo = "right";
                            }
                        }
                        //player going to left
                        if (this.velocity.x < 0 || moveTo == "right") {
                            const offset = this.hitbox.position.x - this.position.x;
                            this.position.x =
                                block.hitbox.position.x + block.hitbox.width - offset + 0.01;
                            break;
                        }
                        //player going to right
                        else if (this.velocity.x > 0 || moveTo == "left") {
                            const offset =
                                this.hitbox.position.x - this.position.x + this.hitbox.width;
                            this.position.x = block.hitbox.position.x - offset - 0.01;
                            break;
                        }
                    }
                    //player sliding
                    else if (this.sliding.left) this.position.x--;
                    else if (this.sliding.right) this.position.x++;
                    //legs collision
                    else if (
                        this.hitbox.legs.position.y + this.hitbox.legs.height >=
                            block.hitbox.position.y &&
                        this.hitbox.legs.position.y <= block.hitbox.position.y + block.hitbox.height
                    ) {
                        //player going to left
                        if (
                            this.velocity.x < 0 &&
                            this.hitbox.legs.position.x <=
                                block.hitbox.position.x + block.hitbox.width &&
                            this.hitbox.legs.position.x + this.hitbox.legs.width >=
                                block.hitbox.position.x
                        ) {
                            const offset = this.hitbox.legs.position.x - this.position.x;
                            this.position.x =
                                block.hitbox.position.x + block.hitbox.width - offset + 0.01;
                            break;
                        }
                        //player going to right
                        else if (
                            this.velocity.x > 0 &&
                            this.hitbox.legs.position.x + this.hitbox.legs.width >=
                                block.hitbox.position.x &&
                            this.hitbox.legs.position.x <= block.hitbox.position.x
                        ) {
                            const offset =
                                this.hitbox.legs.position.x -
                                this.position.x +
                                this.hitbox.legs.width;
                            this.position.x = block.hitbox.position.x - offset - 0.01;
                            break;
                        }
                    }
                }
                //triangle collision
                else if (
                    block.shape == "triangle" &&
                    block.direction.y == "up" &&
                    this.isOnBlock == false
                ) {
                    //head collision
                    if (
                        this.hitbox.position.y + this.hitbox.height - this.hitbox.legs.height >=
                            block.hitbox.position.y + block.hitbox.height &&
                        this.hitbox.position.y <= block.hitbox.position.y + block.hitbox.height &&
                        !this.sliding.left &&
                        !this.sliding.right
                    ) {
                        //player going to left
                        if (this.velocity.x < 0) {
                            const offset = this.hitbox.position.x - this.position.x;
                            this.position.x =
                                block.hitbox.position.x + block.hitbox.width - offset + 0.01;
                            break;
                        }
                        //player going to right
                        else if (this.velocity.x > 0) {
                            const offset =
                                this.hitbox.position.x - this.position.x + this.hitbox.width;
                            this.position.x = block.hitbox.position.x - offset - 0.01;
                            break;
                        }
                    }
                    //player sliding
                    else if (this.sliding.left) this.position.x--;
                    else if (this.sliding.right) this.position.x++;
                    //legs collision
                    else if (
                        this.hitbox.legs.position.y + this.hitbox.legs.height >=
                            block.hitbox.position.y + block.hitbox.height &&
                        this.hitbox.legs.position.y <= block.hitbox.position.y + block.hitbox.height
                    ) {
                        //triangle left
                        if (
                            block.direction.x == "right" &&
                            this.hitbox.legs.position.x <=
                                block.hitbox.position.x + block.hitbox.width &&
                            this.lastPosition.x +
                                (this.hitbox.width - this.hitbox.legs.width) / 2 >=
                                block.hitbox.position.x + block.hitbox.width
                        ) {
                            const offset = this.hitbox.legs.position.x - this.position.x;
                            this.position.x =
                                block.hitbox.position.x + block.hitbox.width - offset + 0.01;
                            break;
                        }
                        //triangle right
                        else if (
                            block.direction.x == "left" &&
                            this.hitbox.legs.position.x + this.hitbox.legs.width >=
                                block.hitbox.position.x &&
                            this.lastPosition.x +
                                (this.hitbox.width - this.hitbox.legs.width) / 2 +
                                this.hitbox.legs.width <=
                                block.hitbox.position.x
                        ) {
                            const offset =
                                this.hitbox.legs.position.x -
                                this.position.x +
                                this.hitbox.legs.width;
                            this.position.x = block.hitbox.position.x - offset - 0.01;
                            break;
                        }
                    }
                }
            }
        }
    }
    //calculate XPosition in square 36*36
    calculateXPos(block) {
        let xPos;
        //triangle up
        if (block.direction.y == "up") {
            xPos = this.hitbox.legs.position.x % 36;
            //triangle to left
            if (block.direction.x == "left") {
                xPos = (this.hitbox.legs.position.x + this.hitbox.legs.width) % 36;

                xPos = 36 - xPos;
                if (xPos == 36 || xPos < 1) xPos = 0;
            }
            //triangle to right
            else if (xPos < 1) xPos = 0;

            if (block.shape == "pondTriangle") xPos /= 2;
        }
        //triangle down
        else {
            xPos = this.hitbox.position.x % 36;

            if (block.direction.x == "left") xPos = 36 - xPos;
            else {
                if (xPos == 0) xPos = 36;
                else if (xPos < 1) xPos = 0;
            }
        }
        return xPos;
    }
    //change position for collision in triangle
    triangleChangePosition(block, xPos) {
        //for triangle up
        if (
            block.direction.y == "up" &&
            this.hitbox.position.y + this.hitbox.height >= block.hitbox.position.y + xPos
        ) {
            this.isOnBlock = true;
            this.velocity.y = 0;
            const offset = this.hitbox.position.y + this.hitbox.height - this.position.y;
            this.position.y = block.hitbox.position.y + xPos - offset - 0.01;
        }
        //for triangle down
        else if (
            block.direction.y == "down" &&
            this.hitbox.position.y < block.hitbox.position.y + block.hitbox.height - xPos
        ) {
            const offset = this.hitbox.position.y - this.position.y;
            this.position.y = block.hitbox.position.y + block.hitbox.height - xPos - offset + 0.01;
            this.velocity.y = 0;
        }
    }
    verticalCollision(blocks) {
        for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i];

            if (
                this.hitbox.position.x <= block.hitbox.position.x + block.hitbox.width &&
                this.hitbox.position.x + this.hitbox.width >= block.hitbox.position.x &&
                this.hitbox.position.y + this.hitbox.height >= block.hitbox.position.y &&
                this.hitbox.position.y <= block.hitbox.position.y + block.hitbox.height
            ) {
                //collision for square
                if (block.shape == "square" || block.shape == "ramp" || block.shape == "lever") {
                    //ramp is blocked
                    if (
                        this.isOnRamp &&
                        Math.round(this.hitbox.position.y) <=
                            block.hitbox.position.y + block.hitbox.height
                    ) {
                        this.rampBlocked = true;
                        break;
                    }
                    //player going down legs collision
                    if (
                        this.velocity.y > 0 &&
                        this.hitbox.legs.position.x <
                            block.hitbox.position.x + block.hitbox.width &&
                        this.hitbox.legs.position.x + this.hitbox.legs.width >
                            block.hitbox.position.x
                    ) {
                        if (block.shape == "button") {
                            block.pressed = true;
                        }
                        if (block.shape == "ramp") {
                            this.isOnRamp = true;
                        }
                        this.isOnBlock = true;
                        const offset =
                            this.hitbox.position.y + this.hitbox.height - this.position.y;

                        this.velocity.y = 0;
                        this.position.y = block.hitbox.position.y - offset - 0.01;
                        break;
                    }
                    //player going down head collision
                    else if (
                        this.velocity.y > 0 &&
                        this.hitbox.position.y + this.hitbox.height - this.hitbox.legs.height >=
                            block.hitbox.position.y
                    ) {
                        //player going left
                        if (this.hitbox.position.x <= block.hitbox.position.x) {
                            this.position.x -= 3;
                            this.sliding.left = true;
                        }
                        //player going right
                        else {
                            this.position.x += 3;
                            this.sliding.right = true;
                        }
                        break;
                    }
                    //player going up
                    else if (
                        this.velocity.y < 0 &&
                        this.hitbox.position.y <= block.hitbox.position.y + block.hitbox.height &&
                        this.hitbox.position.y >= block.hitbox.position.y
                    ) {
                        this.velocity.y = 0;
                        const offset = this.hitbox.position.y - this.position.y;
                        this.position.y =
                            block.hitbox.position.y + block.hitbox.height - offset + 0.01;
                        //player blocking ramp
                        if (
                            block.shape == "ramp" &&
                            Math.round(this.position.y + offset) ==
                                block.hitbox.position.y + block.hitbox.height
                        ) {
                            block.blocked = true;
                            block.blockedDirection = "down";
                        }
                        break;
                    }
                    //player blocking ramp
                    else if (
                        this.isOnBlock &&
                        block.shape == "ramp" &&
                        Math.round(this.hitbox.position.y) ==
                            block.hitbox.position.y + block.hitbox.height
                    ) {
                        block.blocked = true;
                        block.blockedDirection = "down";
                        break;
                    }
                } else if (block.shape == "button") {
                    if (
                        this.hitbox.legs.position.x <
                            block.hitbox.position.x + block.hitbox.width &&
                        this.hitbox.legs.position.x + this.hitbox.legs.width >
                            block.hitbox.position.x
                    ) {
                        block.pressed = true;
                    }
                }
                //collision for triangle left
                else if (block.direction.x == "left") {
                    //player going from down to triangle
                    if (
                        block.direction.y == "up" &&
                        this.lastPosition.y >= block.hitbox.position.y + block.hitbox.height
                    ) {
                        const offset = this.hitbox.position.y - this.position.y;
                        this.velocity.y = 0;
                        this.position.y =
                            block.hitbox.position.y + block.hitbox.height - offset + 0.01;
                        break;
                    }
                    //check collision for triangle up left
                    else if (
                        this.hitbox.legs.position.x + this.hitbox.legs.width >
                            block.hitbox.position.x &&
                        this.hitbox.legs.position.x + this.hitbox.legs.width <=
                            block.hitbox.position.x + block.hitbox.width &&
                        block.direction.y == "up"
                    ) {
                        let xPos = this.calculateXPos(block);

                        this.triangleChangePosition(block, xPos);
                        break;
                    }
                    // check collision for triangle down left
                    else if (
                        this.hitbox.position.x + this.hitbox.width >= block.hitbox.position.x &&
                        this.hitbox.position.x + this.hitbox.width <=
                            block.hitbox.position.x + block.hitbox.width &&
                        block.direction.y == "down" &&
                        this.velocity.y < 0
                    ) {
                        let xPos = this.calculateXPos(block);
                        this.triangleChangePosition(block, xPos);
                        break;
                    }
                    //player going down head collision
                    else if (block.direction.y == "up" && this.velocity.y > 0) {
                        let myBlock = {
                            direction: {
                                x: block.direction.x,
                                y: "down",
                            },
                        };
                        let xPos = this.calculateXPos(myBlock);
                        if (
                            this.hitbox.position.y + this.hitbox.height - this.hitbox.legs.height >=
                            block.hitbox.position.y + xPos
                        ) {
                            this.position.x--;
                            this.sliding.left = true;
                            break;
                        }
                    }
                }
                //collision for triangle right
                else if (block.direction.x == "right") {
                    //check pond
                    if (
                        block.shape == "pondTriangle" &&
                        this.element != block.element &&
                        this.hitbox.position.y + this.hitbox.height >= block.hitbox.position.y + 10
                    ) {
                        //end
                        this.died = true;
                    }

                    //player going from down to triangle
                    if (
                        block.direction.y == "up" &&
                        this.lastPosition.y >= block.hitbox.position.y + block.hitbox.height
                    ) {
                        const offset = this.hitbox.position.y - this.position.y;
                        this.velocity.y = 0;
                        this.position.y =
                            block.hitbox.position.y + block.hitbox.height - offset + 0.01;
                        break;
                    }
                    // check collision for triangle up right
                    else if (
                        block.direction.y == "up" &&
                        this.hitbox.legs.position.x >= block.hitbox.position.x &&
                        this.hitbox.legs.position.x < block.hitbox.position.x + block.hitbox.width
                    ) {
                        let xPos = this.calculateXPos(block);

                        this.triangleChangePosition(block, xPos);
                        break;
                    }

                    //check collision for triangle down right
                    else if (block.direction.y == "down" && this.velocity.y < 0) {
                        let xPos = this.calculateXPos(block);

                        this.triangleChangePosition(block, xPos);
                        break;
                    }
                    //player going down head collision
                    else if (block.direction.y == "up" && this.velocity.y > 0) {
                        let myBlock = {
                            direction: {
                                x: block.direction.x,
                                y: "down",
                            },
                        };
                        let xPos = this.calculateXPos(myBlock);
                        if (
                            this.hitbox.position.y + this.hitbox.height - this.hitbox.legs.height >=
                            block.hitbox.position.y + xPos
                        ) {
                            this.position.x++;
                            this.sliding.right = true;
                            break;
                        }
                    }
                }
                //collision for pond
                else if (block.shape == "pond") {
                    //check pond
                    if (
                        this.element != block.element &&
                        this.hitbox.position.y + this.hitbox.height >=
                            block.hitbox.position.y + 10 &&
                        this.hitbox.position.y + this.hitbox.height <=
                            block.hitbox.position.y + block.hitbox.height
                    ) {
                        //end
                        this.died = true;
                    }
                    //player going down
                    if (
                        this.hitbox.legs.position.x <=
                            block.hitbox.position.x + block.hitbox.width &&
                        this.hitbox.legs.position.x >= block.hitbox.position.x &&
                        this.hitbox.position.y + this.hitbox.height >=
                            block.hitbox.position.y + block.hitbox.height / 2 &&
                        this.hitbox.position.y + this.hitbox.height <=
                            block.hitbox.position.y + block.hitbox.height &&
                        !(
                            blocks[i + 1].shape == "pondTriangle" &&
                            this.hitbox.legs.position.x + this.hitbox.legs.width >
                                blocks[i + 1].position.x
                        )
                    ) {
                        this.isOnBlock = true;
                        this.velocity.y = 0;
                        const offset =
                            this.hitbox.position.y + this.hitbox.height - this.position.y;

                        this.position.y =
                            block.hitbox.position.y - offset - 0.01 + block.hitbox.height / 2;
                        break;
                    }
                    //player going up
                    else if (
                        this.hitbox.position.x <= block.hitbox.position.x + block.hitbox.width &&
                        this.hitbox.position.x >= block.hitbox.position.x &&
                        this.hitbox.position.y >=
                            block.hitbox.position.y + block.hitbox.height / 2 &&
                        this.hitbox.position.y <= block.hitbox.position.y + block.hitbox.height
                    ) {
                        this.velocity.y = 0;
                        const offset = this.hitbox.position.y - this.position.y;
                        this.position.y =
                            block.hitbox.position.y + block.hitbox.height - offset + 0.01;
                        break;
                    }
                }
            }
        }
    }
}
