// 游戏主逻辑模块
class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new Renderer(canvas);
    this.voiceInput = new VoiceInput();
    this.player = new Player();
    this.scene = new SceneGenerator();

    this.state = CONFIG.STATES.MENU;
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('voiceRunnerHighScore')) || 0;
    this.lastTime = 0;
    this.canJump = true; // 防止连续跳跃

    this.isVoiceInitialized = false;
    this.jumpCooldown = false;
  }

  // 初始化游戏
  async init() {
    // 绑定点击事件
    this.canvas.addEventListener('click', () => this.handleClick());

    // 尝试初始化语音
    await this.initVoice();

    // 开始游戏循环
    this.gameLoop(0);
  }

  // 初始化语音
  async initVoice() {
    const success = await this.voiceInput.init();
    if (success) {
      this.isVoiceInitialized = true;
    } else {
      console.warn('语音初始化失败，游戏仍可运行但无法使用语音控制');
    }
  }

  // 处理点击事件
  handleClick() {
    switch (this.state) {
      case CONFIG.STATES.MENU:
        this.startGame();
        break;
      case CONFIG.STATES.PLAYING:
        // 手动触发跳跃（备用控制方式）
        this.tryJump();
        break;
      case CONFIG.STATES.GAME_OVER:
        this.resetGame();
        break;
    }
  }

  // 开始游戏
  async startGame() {
    if (!this.isVoiceInitialized) {
      await this.initVoice();
    }

    this.state = CONFIG.STATES.PLAYING;
    this.resetGame();
  }

  // 重置游戏
  resetGame() {
    this.player.reset();
    this.scene.reset();
    this.score = 0;
    this.state = CONFIG.STATES.PLAYING;
    this.canJump = true;
  }

  // 尝试跳跃
  tryJump() {
    if (!this.canJump || this.jumpCooldown) return;

    const volume = this.voiceInput.getVolume();

    if (volume > CONFIG.VOICE.THRESHOLD) {
      const force = this.voiceInput.getJumpForce();
      this.player.jump(force);
      this.canJump = false;

      // 跳跃冷却，防止连续触发
      this.jumpCooldown = true;
      setTimeout(() => {
        this.canJump = true;
        this.jumpCooldown = false;
      }, 100); // 缩短冷却时间提高响应
    }
  }

  // 更新游戏状态
  update(deltaTime) {
    if (this.state !== CONFIG.STATES.PLAYING) return;

    // 语音控制跳跃
    this.tryJump();

    // 更新场景（需要在检测平台碰撞之前更新，以便检测当前屏幕上的平台）
    this.scene.generateIfNeeded(this.player.x);
    this.scene.update(this.player.currentRunSpeed);

    // 更新玩家
    const platforms = this.scene.getActivePlatforms();
    const playerAlive = this.player.update(platforms);

    if (!playerAlive) {
      this.gameOver();
      return;
    }

    // 障碍物碰撞检测
    const collision = this.scene.checkCollisions(this.player);
    if (collision.gameOver) {
      this.gameOver();
      return;
    }

    // 更新分数
    this.score += collision.coinsCollected;
    this.score += Math.floor(this.player.currentRunSpeed * 0.1); // 距离奖励
  }

  // 游戏结束
  gameOver() {
    this.state = CONFIG.STATES.GAME_OVER;

    // 更新最高分
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('voiceRunnerHighScore', this.highScore);
    }
  }

  // 渲染游戏
  render() {
    const voiceVolume = this.voiceInput.getVolume();

    this.renderer.render(this.state, {
      player: this.player,
      platforms: this.scene.getActivePlatforms(),
      obstacles: this.scene.obstacles,
      coins: this.scene.coins,
      score: this.score,
      highScore: this.highScore,
      voiceVolume: voiceVolume,
    });
  }

  // 游戏主循环
  gameLoop(timestamp) {
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    // 更新
    this.update(deltaTime);

    // 渲染
    this.render();

    // 继续循环
    requestAnimationFrame((t) => this.gameLoop(t));
  }
}

// 导出模块
window.Game = Game;
