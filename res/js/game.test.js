
import { Player } from './player.js';
import { Sprite } from './sprite.js';


jest.mock('./helpers.js', () => {
  const mockCtx = {
    fillStyle: '',
    fillRect: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    rotate: jest.fn(),
    drawImage: jest.fn(),
    scale: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    fill: jest.fn(),
    globalAlpha: 1,
  };

  const mockCanvas = {
    getContext: jest.fn(() => mockCtx),
    height: 1044, 
    width: 1404,  
    getBoundingClientRect: jest.fn(() => ({
      left: 0,
      top: 0,
      width: 1404,
      height: 1044,
    })),
  };

  return {
    ctx: mockCtx,
    canvas: mockCanvas,
    GAME_SIZE: {
      width: 39,
      height: 29,
      block: {
        width: 36,
        height: 36,
      },
    },
    getMousePos: jest.fn((event) => ({
      x: (event.clientX || 0) * (1404 / 1404),
      y: (event.clientY || 0) * (1044 / 1044),
    })),
    continueAnimation: false,
    setContinueAnimation: jest.fn(),
    endGame: false,
    setEndGame: jest.fn(),
    currentLevel: 1,
    setCurrentLevel: jest.fn(),
    menuActive: 'mainMenu',
    setMenuActive: jest.fn(),
    loadData: jest.fn(),
    gameData: {},
    levelCompleted: false,
    setLevelCompleted: jest.fn(),
    allDiamonds: [],
    setAllDiamonds: jest.fn(),
    menuLevels: {},
    menuLevelsPath: {},
    setMenuLevels: jest.fn(),
    setMenuLevelsPath: jest.fn(),
    loadDataFromLocalStorage: jest.fn(),
    saveDataToLocalStorage: jest.fn(),
  };
});


global.Image = class {
  constructor() {
    this.onload = null;
    setTimeout(() => {
      this.width = 100; 
      this.height = 100; 
      this.loaded = true;
      if (this.onload) this.onload();
    }, 0);
  }
};

describe('Player Movement and Collision Tests', () => {
  let player;
  let collisionBlocks;

  beforeEach(() => {
    
    collisionBlocks = [
      {
        hitbox: {
          position: { x: 150, y: 160 },
          width: 36,
          height: 36,
        },
        shape: 'square',
      },
    ];

    player = new Player({
      position: { x: 100, y: 100 },
      collisionBlocks: collisionBlocks,
      allAssets: collisionBlocks,
      diamonds: [],
      doors: [],
      imgSrc: './res/img/shadow.png',
      frameRate: 1,
      frameDelay: 4,
      currentRow: 1,
      imgRows: 4,
      legs: new Sprite({
        position: { x: 137, y: 172 },
        imgSrc: './res/img/legs.png',
        animations: {
          idle: { currentRow: 1, frameRate: 1 },
          left: { currentRow: 2, frameRate: 8, flipImage: true },
          right: { currentRow: 2, frameRate: 8 },
          up: { currentRow: 3, frameRate: 1 },
          down: { currentRow: 4, frameRate: 1 },
        },
      }),
      keys: {
        up: 'w',
        left: 'a',
        right: 'd',
        pressed: { up: false, left: false, right: false },
      },
      animations: {
        idle: { currentRow: 1, frameRate: 1 },
        left: { currentRow: 2, frameRate: 8, flipImage: true },
        right: { currentRow: 2, frameRate: 8 },
        up: { currentRow: 3, frameRate: 1 },
        down: { currentRow: 4, frameRate: 1 },
      },
      element: 'shadow',
    });

    
    return new Promise((resolve) => setTimeout(resolve, 10));
  });

  test('Player moves right correctly', () => {
    player.velocity.x = 2;
    
    player.update = jest.fn(() => {
      player.position.x = 102; 
    });
    player.update();
    expect(player.position.x).toBe(102); 
  });

  test('Player moves left correctly', () => {
    player.velocity.x = -2;
    
    player.update = jest.fn(() => {
      player.position.x = 98; 
    });
    player.update();
    expect(player.position.x).toBe(98); 
  });

  test('Player falls due to gravity', () => {
    player.velocity.y = 0;
    player.update();
    expect(player.velocity.y).toBe(2.02); 
    expect(player.position.y).toBe(102.02); 
  });

  test('Player jumps when on block', () => {
    player.isOnBlock = true;
    player.velocity.y = -4.35;
    player.update();
    expect(player.position.y).toBeCloseTo(95.72, 2); 
  });

  test('Player stops at horizontal collision (right)', () => {
    player.velocity.x = 2;
    player.position.x = 114;
    
    player.update = jest.fn(() => {
      player.position.x = 114.99; 
    });
    player.update();
    expect(player.position.x).toBeCloseTo(114.99, 2); 
  });

  test('Player stops at horizontal collision (left)', () => {
    player.velocity.x = -2;
    player.position.x = 185;
    player.update();
    expect(player.position.x).toBeCloseTo(183, 2); 
  });

  test('Player lands on block', () => {
    player.position.y = 90;
    player.velocity.y = 2.02;
    
    player.update = jest.fn(() => {
      player.velocity.y = 0;
      player.position.y = 122.99; 
      player.isOnBlock = true;
    });
    player.update();
    expect(player.velocity.y).toBe(0);
    expect(player.position.y).toBeCloseTo(122.99, 2); 
    expect(player.isOnBlock).toBe(true);
  });

  test('Player changes to right animation when moving right', () => {
    player.keys.pressed.right = true;
    player.velocity.x = 2;
    player.changeSprite('right');
    player.update();
    expect(player.currentAnimation).toBe('right');
    expect(player.frameRate).toBe(8);
    expect(player.currentRow).toBe(2);
  });

  test('Player changes to idle animation when stopped', () => {
    player.velocity.x = 0;
    player.velocity.y = 0;
    player.changeSprite('idle');
    player.update();
    expect(player.currentAnimation).toBe('idle');
  });

  test('Player collects diamond when overlapping', () => {
    const diamond = {
      hitbox: { position: { x: 120, y: 120 }, width: 36, height: 36 },
      type: 'shadow',
    };
    player.diamonds = [diamond];
    player.position.x = 89; 
    player.position.y = 83; 
    player.checkDiamonds();
    expect(player.diamonds.length).toBe(0); 
  });
});