// 语音输入模块
class VoiceInput {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.microphone = null;
    this.stream = null;
    this.volume = 0;
    this.smoothedVolume = 0;
    this.isInitialized = false;
    this.isSupported = false;
  }

  // 检查浏览器是否支持 Web Audio API
  checkSupport() {
    this.isSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    return this.isSupported;
  }

  // 初始化麦克风
  async init() {
    if (this.isInitialized) return true;

    if (!this.checkSupport()) {
      console.warn('浏览器不支持麦克风输入');
      return false;
    }

    try {
      // 请求麦克风权限
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        }
      });

      // 创建音频上下文
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // 创建分析器
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.3;

      // 连接麦克风到分析器
      this.microphone = this.audioContext.createMediaStreamSource(this.stream);
      this.microphone.connect(this.analyser);

      this.isInitialized = true;
      console.log('麦克风初始化成功');
      return true;
    } catch (error) {
      console.error('麦克风初始化失败:', error);
      return false;
    }
  }

  // 获取当前音量 (0-255)
  getVolume() {
    if (!this.isInitialized || !this.analyser) {
      return 0;
    }

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);

    // 计算平均音量
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    this.volume = sum / dataArray.length;

    // 平滑处理
    this.smoothedVolume = this.smoothedVolume * CONFIG.VOICE.SMOOTHING +
                          this.volume * (1 - CONFIG.VOICE.SMOOTHING);

    return this.smoothedVolume;
  }

  // 检查是否超过阈值
  isAboveThreshold() {
    return this.getVolume() > CONFIG.VOICE.THRESHOLD;
  }

  // 获取标准化的音量 (0-1)
  getNormalizedVolume() {
    const vol = this.getVolume();
    return Math.min(vol / 128, 1); // 128 作为一个参考最大值
  }

  // 获取跳跃力度
  getJumpForce() {
    const normalized = this.getNormalizedVolume();
    const { MIN_JUMP_FORCE, MAX_JUMP_FORCE } = CONFIG.PLAYER;
    return MIN_JUMP_FORCE + normalized * (MAX_JUMP_FORCE - MIN_JUMP_FORCE);
  }

  // 清理资源
  destroy() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.isInitialized = false;
  }
}

// 导出模块
window.VoiceInput = VoiceInput;
