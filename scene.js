// 场景生成器模块
class SceneGenerator {
  constructor() {
    this.platforms = [];
    this.obstacles = [];
    this.coins = [];
    this.lastPlatformEndX = 0;
    this.distanceTraveled = 0;
  }

  // 重置场景
  reset() {
    this.platforms = [];
    this.obstacles = [];
    this.coins = [];
    this.lastPlatformEndX = 0;
    this.distanceTraveled = 0;

    // 初始地面平台
    this.createPlatform(0, CONFIG.GROUND_Y, CONFIG.CANVAS_WIDTH);
  }

  // 创建平台
  createPlatform(x, y, width) {
    const platform = {
      x,
      y,
      width,
      height: CONFIG.PLATFORM.MAX_HEIGHT,
    };
    this.platforms.push(platform);
    this.lastPlatformEndX = x + width;

    // 可能在平台上生成障碍物或金币
    this.generateContent(platform);

    return platform;
  }

  // 在平台上生成内容
  generateContent(platform) {
    // 生成障碍物
    if (Math.random() < CONFIG.DIFFICULTY.OBSTACLE_CHANCE && platform.width > 80) {
      const obsX = platform.x + 20 + Math.random() * (platform.width - 60);
      const obsHeight = CONFIG.OBSTACLE.MIN_HEIGHT +
        Math.random() * (CONFIG.OBSTACLE.MAX_HEIGHT - CONFIG.OBSTACLE.MIN_HEIGHT);
      this.obstacles.push({
        x: obsX,
        y: platform.y - obsHeight,
        width: CONFIG.OBSTACLE.WIDTH,
        height: obsHeight,
      });
    }

    // 生成金币
    if (Math.random() < CONFIG.DIFFICULTY.COIN_CHANCE) {
      const numCoins = Math.floor(1 + Math.random() * CONFIG.DIFFICULTY.COINS_PER_PLATFORM);
      const spacing = platform.width / (numCoins + 1);
      for (let i = 0; i < numCoins; i++) {
        this.coins.push({
          x: platform.x + spacing * (i + 1),
          y: platform.y - 50 - Math.random() * 30,
          radius: CONFIG.COIN.RADIUS,
          collected: false,
        });
      }
    }
  }

  // 生成新平台（当需要时）
  generateIfNeeded(playerX) {
    const spawnDistance = playerX + CONFIG.CANVAS_WIDTH;
    while (this.lastPlatformEndX < spawnDistance) {
      const gap = CONFIG.PLATFORM.GAP_MIN +
        Math.random() * (CONFIG.PLATFORM.GAP_MAX - CONFIG.PLATFORM.GAP_MIN);
      const width = CONFIG.PLATFORM.MIN_WIDTH +
        Math.random() * (CONFIG.PLATFORM.MAX_WIDTH - CONFIG.PLATFORM.MIN_WIDTH);
      const y = CONFIG.PLATFORM.MIN_Y +
        Math.random() * (CONFIG.PLATFORM.MAX_Y - CONFIG.PLATFORM.MIN_Y);

      this.createPlatform(this.lastPlatformEndX + gap, y, width);
    }
  }

  // 更新场景（移动和清理）
  update(runSpeed) {
    // 移动所有元素
    for (const platform of this.platforms) {
      platform.x -= runSpeed;
    }
    for (const obstacle of this.obstacles) {
      obstacle.x -= runSpeed;
    }
    for (const coin of this.coins) {
      coin.x -= runSpeed;
    }

    // 清理屏幕外的元素
    this.platforms = this.platforms.filter(p => p.x + p.width > -100);
    this.obstacles = this.obstacles.filter(o => o.x + o.width > -100);
    this.coins = this.coins.filter(c => c.x + c.radius > -100);

    // 更新最后平台位置
    if (this.platforms.length > 0) {
      const lastPlatform = this.platforms[this.platforms.length - 1];
      this.lastPlatformEndX = lastPlatform.x + lastPlatform.width;
    }

    this.distanceTraveled += runSpeed;
  }

  // 获取活跃的平台
  getActivePlatforms() {
    return this.platforms.filter(p =>
      p.x < CONFIG.CANVAS_WIDTH && p.x + p.width > 0
    );
  }

  // 碰撞检测
  checkCollisions(player) {
    const bounds = player.getBounds();
    let gameOver = false;
    let coinsCollected = 0;

    // 检测障碍物碰撞
    for (const obs of this.obstacles) {
      if (this.aabbCollision(bounds, obs)) {
        gameOver = true;
        break;
      }
    }

    // 检测金币碰撞
    for (const coin of this.coins) {
      if (!coin.collected && this.circleRectCollision(coin, bounds)) {
        coin.collected = true;
        coinsCollected += CONFIG.COIN.VALUE;
      }
    }

    return { gameOver, coinsCollected };
  }

  // AABB 碰撞检测
  aabbCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  }

  // 圆形与矩形碰撞检测
  circleRectCollision(circle, rect) {
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
    const distanceX = circle.x - closestX;
    const distanceY = circle.y - closestY;
    return (distanceX * distanceX + distanceY * distanceY) < (circle.radius * circle.radius);
  }
}

// 导出模块
window.SceneGenerator = SceneGenerator;
