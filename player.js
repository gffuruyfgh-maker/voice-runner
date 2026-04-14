// 玩家角色控制模块
class Player {
  constructor() {
    this.width = CONFIG.PLAYER.WIDTH;
    this.height = CONFIG.PLAYER.HEIGHT;
    this.x = CONFIG.PLAYER.START_X;
    this.y = CONFIG.PLAYER.START_Y;
    this.velocityY = 0;
    this.velocityX = CONFIG.PLAYER.RUN_SPEED;
    this.isJumping = false;
    this.isOnGround = true;
    this.jumpCount = 0; // 跳跃次数（用于动画等）
    this.currentRunSpeed = CONFIG.PLAYER.RUN_SPEED;
  }

  // 重置玩家状态
  reset() {
    this.x = CONFIG.PLAYER.START_X;
    this.y = CONFIG.PLAYER.START_Y;
    this.velocityY = 0;
    this.velocityX = CONFIG.PLAYER.RUN_SPEED;
    this.isJumping = false;
    this.isOnGround = true;
    this.jumpCount = 0;
    this.currentRunSpeed = CONFIG.PLAYER.RUN_SPEED;
  }

  // 执行跳跃
  jump(force) {
    if (this.isOnGround) {
      this.velocityY = -force; // 负数向上
      this.isJumping = true;
      this.isOnGround = false;
      this.jumpCount++;
    }
  }

  // 更新玩家状态
  update(platforms) {
    // 应用重力
    this.velocityY += CONFIG.PLAYER.GRAVITY;

    // 限制下落速度
    if (this.velocityY > CONFIG.PLAYER.MAX_FALL_SPEED) {
      this.velocityY = CONFIG.PLAYER.MAX_FALL_SPEED;
    }

    // 更新位置
    this.y += this.velocityY;

    // 逐渐增加跑步速度
    if (this.currentRunSpeed < CONFIG.PLAYER.MAX_RUN_SPEED) {
      this.currentRunSpeed += CONFIG.DIFFICULTY.SPEED_INCREASE_RATE;
    }

    // 碰撞检测 - 地面
    const groundY = CONFIG.GROUND_Y - this.height;
    if (this.y >= groundY) {
      this.y = groundY;
      this.velocityY = 0;
      this.isOnGround = true;
      this.isJumping = false;
    }

    // 碰撞检测 - 平台
    for (const platform of platforms) {
      const result = this.checkPlatformCollision(platform);
      if (result === 'death') {
        return false; // 碰撞死亡
      }
      if (result === 'safe') {
        break;
      }
    }

    // 检测是否掉落屏幕
    if (this.y > CONFIG.CANVAS_HEIGHT) {
      return false; // 游戏结束
    }

    return true;
  }

  // 平台碰撞检测
  // 返回: 'safe' = 安全着陆, 'death' = 碰撞死亡, null = 无碰撞
  checkPlatformCollision(platform) {
    const playerBottom = this.y + this.height;
    const playerTop = this.y;
    const playerRight = this.x + this.width;
    const playerLeft = this.x;

    // 检查是否有任何重叠
    const horizontalOverlap = playerRight > platform.x + 5 && playerLeft < platform.x + platform.width - 5;
    const verticalOverlap = playerBottom > platform.y && playerTop < platform.y + platform.height;

    if (!horizontalOverlap || !verticalOverlap) {
      return null; // 没有重叠
    }

    // 有重叠，判断是安全着陆还是碰撞死亡
    // 安全着陆条件：下落中（velocityY >= 0），脚底刚好在平台顶部附近
    const prevPlayerBottom = playerBottom - this.velocityY;

    if (this.velocityY > 0 &&
        prevPlayerBottom <= platform.y + 5 &&
        playerBottom >= platform.y &&
        playerBottom <= platform.y + platform.height) {
      // 安全着陆在平台顶部
      this.y = platform.y - this.height;
      this.velocityY = 0;
      this.isOnGround = true;
      this.isJumping = false;
      return 'safe';
    }

    // 其他情况：碰到平台侧面或从下面撞上去 = 死亡
    return 'death';
  }

  // 碰撞箱
  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }
}

// 导出模块
window.Player = Player;
