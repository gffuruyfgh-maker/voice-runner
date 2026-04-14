// 游戏常量配置

const CONFIG = {
  // Canvas 尺寸
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 400,

  // 地面配置
  GROUND_HEIGHT: 60,
  GROUND_Y: 400 - 60, // CANVAS_HEIGHT - GROUND_HEIGHT

  // 玩家配置
  PLAYER: {
    WIDTH: 40,
    HEIGHT: 50,
    START_X: 100,
    START_Y: 300, // 站在地面上
    GRAVITY: 0.8,
    MAX_FALL_SPEED: 15,
    MIN_JUMP_FORCE: 10,
    MAX_JUMP_FORCE: 22,
    RUN_SPEED: 3,
    MAX_RUN_SPEED: 6,
    SPEED_INCREMENT: 0.0003, // 每帧增加的速度
  },

  // 平台配置
  PLATFORM: {
    MIN_WIDTH: 100,
    MAX_WIDTH: 250,
    MIN_HEIGHT: 20,
    MAX_HEIGHT: 30,
    MIN_Y: 200,
    MAX_Y: 340,
    GAP_MIN: 150,
    GAP_MAX: 300,
    SPAWN_DISTANCE: 800, // 距离玩家多少时触发生成
  },

  // 障碍物配置
  OBSTACLE: {
    WIDTH: 30,
    HEIGHT: 40,
    MIN_HEIGHT: 30,
    MAX_HEIGHT: 50,
  },

  // 金币配置
  COIN: {
    RADIUS: 12,
    VALUE: 10,
  },

  // 语音配置
  VOICE: {
    THRESHOLD: 10, // 触发跳跃的最小音量（进一步降低提高灵敏度）
    SMOOTHING: 0.3, // 音量平滑系数（降低以提高响应速度）
  },

  // 游戏难度
  DIFFICULTY: {
    SPEED_INCREASE_RATE: 0.0005,
    OBSTACLE_CHANCE: 0.4, // 平台上生成障碍物的概率
    COIN_CHANCE: 0.5, // 平台上生成金币的概率
    COINS_PER_PLATFORM: 3,
  },

  // 颜色配置
  COLORS: {
    SKY: '#87CEEB',
    GROUND: '#8B4513',
    GROUND_TOP: '#228B22',
    PLAYER: '#FF6B6B',
    PLAYER_EYES: '#FFFFFF',
    PLATFORM: '#8B4513',
    PLATFORM_TOP: '#228B22',
    OBSTACLE: '#FF4444',
    COIN: '#FFD700',
    UI_BG: 'rgba(0, 0, 0, 0.7)',
    UI_TEXT: '#FFFFFF',
    VOLUME_BAR_BG: '#333333',
    VOLUME_BAR_FILL: '#00FF00',
  },

  // 游戏状态
  STATES: {
    MENU: 'menu',
    PLAYING: 'playing',
    GAME_OVER: 'gameOver',
  },
};

// 冻结配置防止意外修改
Object.freeze(CONFIG);
Object.freeze(CONFIG.PLAYER);
Object.freeze(CONFIG.PLATFORM);
Object.freeze(CONFIG.OBSTACLE);
Object.freeze(CONFIG.COIN);
Object.freeze(CONFIG.VOICE);
Object.freeze(CONFIG.DIFFICULTY);
Object.freeze(CONFIG.COLORS);
Object.freeze(CONFIG.STATES);
