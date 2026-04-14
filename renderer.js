// 渲染系统模块
class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = CONFIG.CANVAS_WIDTH;
    this.height = CONFIG.CANVAS_HEIGHT;
  }

  // 清空画布
  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  // 绘制背景
  drawBackground() {
    // 天空渐变
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // 绘制云朵
    this.drawClouds();
  }

  // 绘制云朵（装饰）
  drawClouds() {
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    const time = Date.now() * 0.0001;

    // 固定位置的云朵
    const clouds = [
      { x: 100, y: 60, size: 30 },
      { x: 300, y: 40, size: 40 },
      { x: 550, y: 70, size: 25 },
      { x: 700, y: 50, size: 35 },
    ];

    for (const cloud of clouds) {
      const x = (cloud.x + time * 50) % (this.width + 100) - 50;
      this.ctx.beginPath();
      this.ctx.arc(x, cloud.y, cloud.size, 0, Math.PI * 2);
      this.ctx.arc(x + cloud.size * 0.6, cloud.y - cloud.size * 0.2, cloud.size * 0.7, 0, Math.PI * 2);
      this.ctx.arc(x + cloud.size * 1.2, cloud.y, cloud.size * 0.8, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  // 绘制地面
  drawGround() {
    const groundY = CONFIG.GROUND_Y;

    // 草地
    this.ctx.fillStyle = CONFIG.COLORS.GROUND_TOP;
    this.ctx.fillRect(0, groundY, this.width, 15);

    // 泥土
    this.ctx.fillStyle = CONFIG.COLORS.GROUND;
    this.ctx.fillRect(0, groundY + 15, this.width, CONFIG.GROUND_HEIGHT - 15);
  }

  // 绘制平台
  drawPlatforms(platforms) {
    for (const platform of platforms) {
      if (platform.x > this.width || platform.x + platform.width < 0) continue;

      // 平台顶部（草地）
      this.ctx.fillStyle = CONFIG.COLORS.PLATFORM_TOP;
      this.ctx.fillRect(platform.x, platform.y, platform.width, 8);

      // 平台主体
      this.ctx.fillStyle = CONFIG.COLORS.PLATFORM;
      this.ctx.fillRect(platform.x, platform.y + 8, platform.width, platform.height - 8);
    }
  }

  // 绘制玩家
  drawPlayer(player) {
    const { x, y, width, height, isJumping } = player;

    // 身体
    this.ctx.fillStyle = CONFIG.COLORS.PLAYER;
    this.ctx.fillRect(x, y, width, height);

    // 眼睛
    this.ctx.fillStyle = CONFIG.COLORS.PLAYER_EYES;
    const eyeY = y + 12;
    const eyeSize = 6;
    this.ctx.fillRect(x + 8, eyeY, eyeSize, eyeSize);
    this.ctx.fillRect(x + width - 14, eyeY, eyeSize, eyeSize);

    // 跳跃时的表情变化
    if (isJumping) {
      // 嘴巴 (惊讶)
      this.ctx.fillStyle = '#FF9999';
      this.ctx.fillRect(x + width/2 - 4, y + height - 15, 8, 6);
    } else {
      // 嘴巴 (正常)
      this.ctx.fillStyle = '#FF9999';
      this.ctx.fillRect(x + width/2 - 6, y + height - 12, 12, 3);
    }
  }

  // 绘制障碍物
  drawObstacles(obstacles) {
    this.ctx.fillStyle = CONFIG.COLORS.OBSTACLE;
    for (const obs of obstacles) {
      if (obs.x > this.width || obs.x + obs.width < 0) continue;

      // 绘制三角形障碍物（钉子风格）
      this.ctx.beginPath();
      this.ctx.moveTo(obs.x + obs.width / 2, obs.y);
      this.ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
      this.ctx.lineTo(obs.x, obs.y + obs.height);
      this.ctx.closePath();
      this.ctx.fill();
    }
  }

  // 绘制金币
  drawCoins(coins) {
    for (const coin of coins) {
      if (coin.collected) continue;
      if (coin.x > this.width || coin.x + coin.radius < 0) continue;

      // 简单的圆形金币
      this.ctx.fillStyle = CONFIG.COLORS.COIN;
      this.ctx.beginPath();
      this.ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
      this.ctx.fill();

      // 金币光泽
      this.ctx.fillStyle = '#FFF8DC';
      this.ctx.beginPath();
      this.ctx.arc(coin.x - 3, coin.y - 3, coin.radius * 0.3, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  // 绘制 UI
  drawUI(score, voiceVolume, gameState) {
    // 分数背景
    this.ctx.fillStyle = CONFIG.COLORS.UI_BG;
    this.roundRect(10, 10, 150, 40, 8);
    this.ctx.fill();

    // 分数文字
    this.ctx.fillStyle = CONFIG.COLORS.UI_TEXT;
    this.ctx.font = 'bold 20px Arial';
    this.ctx.fillText(`分数: ${score}`, 20, 38);

    // 音量指示器背景
    this.ctx.fillStyle = CONFIG.COLORS.UI_BG;
    this.roundRect(this.width - 160, 10, 150, 40, 8);
    this.ctx.fill();

    // 音量条背景
    this.ctx.fillStyle = CONFIG.COLORS.VOLUME_BAR_BG;
    this.roundRect(this.width - 150, 20, 130, 20, 4);
    this.ctx.fill();

    // 音量条填充
    const volumeWidth = (voiceVolume / 128) * 130;
    const volumeColor = voiceVolume > CONFIG.VOICE.THRESHOLD ? '#00FF00' : '#FFFF00';
    this.ctx.fillStyle = volumeColor;
    this.roundRect(this.width - 150, 20, Math.min(volumeWidth, 130), 20, 4);
    this.ctx.fill();

    // 音量文字
    this.ctx.fillStyle = CONFIG.COLORS.UI_TEXT;
    this.ctx.font = '12px Arial';
    this.ctx.fillText('音量', this.width - 150, 55);

    // 菜单状态提示
    if (gameState === CONFIG.STATES.MENU) {
      this.drawCenteredText('点击开始游戏', this.height / 2 - 50, 'bold 28px Arial');
      this.drawCenteredText('对着麦克风说话来跳跃', this.height / 2, '18px Arial');
      this.drawCenteredText('声音越大，跳得越高！', this.height / 2 + 30, '16px Arial');
    }

    // 游戏结束状态
    if (gameState === CONFIG.STATES.GAME_OVER) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      this.ctx.fillRect(0, 0, this.width, this.height);

      this.drawCenteredText('游戏结束', this.height / 2 - 50, 'bold 36px Arial', '#FF4444');
      this.drawCenteredText(`最终分数: ${score}`, this.height / 2, '24px Arial');
      this.drawCenteredText('点击重新开始', this.height / 2 + 50, '20px Arial');
    }
  }

  // 绘制居中文字
  drawCenteredText(text, y, font, color = '#FFFFFF') {
    this.ctx.fillStyle = color;
    this.ctx.font = font;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(text, this.width / 2, y);
    this.ctx.textAlign = 'left';
  }

  // 圆角矩形辅助函数
  roundRect(x, y, width, height, radius) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
  }

  // 渲染所有内容
  render(gameState, data) {
    this.clear();
    this.drawBackground();
    this.drawGround();
    this.drawPlatforms(data.platforms);
    this.drawCoins(data.coins);
    this.drawObstacles(data.obstacles);
    this.drawPlayer(data.player);
    this.drawUI(data.score, data.voiceVolume, gameState);
  }
}

// 导出模块
window.Renderer = Renderer;
