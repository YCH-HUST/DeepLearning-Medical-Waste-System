var app = getApp()
var hexStr
var intStr

const LABEL_MAP = {
  zhusheqi: '注射器',
  shoutao: '手套',
  shabu: '纱布',
  zhizhi: '纸质',
  rentizuzhi: '人体组织',
  niezi: '镊子',
  kouzhao: '口罩',
  zhusheqizhentou: '注射器针头',
  suliao: '塑料',
  youji: '有机',
  jinshu: '金属',
  boli: '玻璃'
};

Page({
  /**
   * 页面的初始数据
   */
  data: {
    deviceId: '',
    serviceId: '',
    characteristicId: '',
    
    // 环境数据
    temperatureValue: 0,
    humidityValue: 0,
    
    // 页面切换
    currentTab: 'monitor', // 当前选中的标签页
    
    // 触摸相关
    touchStartX: 0,
    touchEndX: 0,
    pageSwipeDisabled: false, // 禁用页面滑动标志
    
    // 传感器数据
    irValue: "",         // 人体检测
    smokeValue: "",      // 烟雾
    flameValue: "",      // 火焰
    distanceValue: "",   // 距离
    weightValue: "",     // 重量
    weightPercentage: 0,
    
    // K210分类结果
    classificationValue: "未检测",  // 分类结果
    confidenceValue: "0.00",        // 置信度
    
    // 状态文本和颜色
    irText: "无人",          // 人体检测描述
    smokeText: "正常",       // 烟雾描述
    flameText: "正常",       // 火焰描述
    distanceText: "关闭",    // 距离描述
    weightText: "无物品",      // 重量描述
    
    // 颜色状态
    irColor: "#ffffff",
    smokeColor: "#ffffff",
    flameColor: "#ffffff",
    distanceColor: "#ffffff",
    weightColor: "#ffffff",
    
    // 风扇控制
    fanStatus: "关闭",
    fanOnActive: "",
    fanOffActive: "active",
    fanOn: false, // 风扇状态，默认为关闭
    
    // RGB灯控制
    redValue: 0,
    greenValue: 0,
    blueValue: 0,
    brightnessValue: 0, // 默认关闭状态
    lightOn: false,
    lightPresets: [
      { name: '紫外近似光', r: 148, g: 0, b: 211, description: '紫光/黑光，用于验钞、荧光液检测、体液痕迹（血液、尿液、唾液等）残留检测、荧光标记药物识别、某些细菌检测、酒精喷洒残留观察' },
      { name: '蓝光检测', r: 0, g: 0, b: 255, description: '蓝色光源，用于观察血管（辅助静脉穿刺）、透析液微粒检测、某些药液沉淀观察、清洗效果验证' },
      { name: '青色折射检测', r: 0, g: 255, b: 255, description: '青蓝色光源，辅助检测某些液体的折射差异（如消毒液、某些药液混浊度检测）' },
      { name: '绿色对比检测', r: 0, g: 255, b: 0, description: '纯绿色光源，红绿互补色对比，可显著提升血迹识别度，适合观察是否有血液污染' },
      { name: '黄色体液检测', r: 255, g: 255, b: 0, description: '暖黄色光源，用于检测血浆、胆汁、部分药液（如维生素B复合液）的颜色异常变化' },
      { name: '橙色医废标识', r: 255, g: 165, b: 0, description: '医废橙色光源，与医疗废物颜色标准（如橙色医废袋）匹配，可用于医疗废物分类提示灯光' },
      { name: '红色警示照明', r: 255, g: 0, b: 0, description: '红光警示光源，用于危险品提醒警告、辅助夜间环境照明（不干扰视觉暗适应）、观察血迹/红色液体变化' },
      { name: '白色通用照明', r: 255, g: 255, b: 255, description: '标准白光照明，通用医疗照明、观察所有液体原色变化、常规医疗检查' },
      { name: '粉色特殊识别', r: 255, g: 105, b: 180, description: '医用粉色光源，用于识别特殊药液（如雌激素类）、情绪安抚照明、特定病房环境照明' }
    ],
    selectedPresetIndex: null,
    
    // 系统状态
    connectionStatus: '已连接',
    lastUpdateTime: 'N/A',
    deviceConnected: false, // 添加设备连接状态变量
    
    // 手动调节控制标志
    manualControl: false,
    manualTimeout: null,   // 手动调节的倒计时句柄
    
    // 数据读取动画状态
    isLoadingData: true,
    hasReceivedData: false, // 添加数据接收标志
    
    // 自动重连相关
    isReconnecting: false,  // 是否正在重连
    reconnectAttempts: 0,   // 重连尝试次数
    maxReconnectAttempts: 5, // 最大重连次数
    reconnectInterval: null, // 重连定时器
    lastDataTime: 0,        // 最后接收数据的时间
    dataTimeout: 10000,     // 数据超时时间（10秒）
    dataCheckInterval: null, // 数据检查定时器
    
    // 数据更新防抖
    updateTimeout: null,    // 数据更新防抖定时器
    previewImage: '',
    result: null,
    loading: false,
    tempFilePath: '', // 新增临时图片路径
    
    // AI 智能光谱推荐相关数据
    aiInput: '',
    aiLoading: false,
    aiResult: null,
    aiPresets: [
      '检测血迹与血水残留',
      '辅助进行静脉穿刺',
      '检测化学药液浑浊度与沉淀',
      '黄色医疗废物满溢警示'
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      msg: '开始连接',
      loopi: true,
      isScanning: false,
      isLoadingData: true // 确保动画显示
    });
    
    // 从全局获取设备信息
    const app = getApp();
    if (app.globalData && app.globalData.appdid) {
      this.setData({
        deviceId: app.globalData.appdid,
        serviceId: app.globalData.appsid,
        characteristicId: app.globalData.appcid
      });
      console.log('从全局获取设备信息成功:', {
        deviceId: app.globalData.appdid,
        serviceId: app.globalData.appsid,
        characteristicId: app.globalData.appcid
      });
    } else {
      console.log('全局数据中没有设备信息');
    }
    
    // 检查初始连接状态
    this.checkInitialConnectionStatus();
    
    // 设置一次性的、稳定的蓝牙数据监听器
    this.setupBLEListener();
    
    // 设置BLE连接状态监听
    this.setupBLEConnectionListener();
    
    // 设置数据超时检查
    this.setupDataTimeoutCheck();

    // 页面加载完成后，通知ESP32小程序已准备就绪
    this.notifyEspReady();
    
    // 设置最低3秒的动画显示时间
    this.minLoadingTime = setTimeout(() => {
      // 只有在收到数据后才隐藏动画
      if (this.data.hasReceivedData) {
        this.setData({
          isLoadingData: false
        });
      } else {
        // 3秒后还没收到数据，弹窗提示
        wx.showModal({
          title: '提示',
          content: '3秒内未读取到设备数据，是否跳过？',
          confirmText: '跳过',
          cancelText: '等待',
          success: (res) => {
            if (res.confirm) {
              // 跳过，直接进入页面
              this.setData({
                isLoadingData: false
              });
            } else {
              // 继续等待，不做处理
            }
          }
        });
      }
    }, 3000);
    
    // 测试页面切换
    console.log('Initial currentTab:', this.data.currentTab);
  },

  onReady: function() {
    // 移除默认置0，让状态由ESP32实时数据决定
    // this.setOff();
  },

  // 英文标签到中文的映射函数
  mapLabelToChinese: function(englishLabel) {
    return LABEL_MAP[englishLabel] || "无结果";
  },

  // 更新当前时间
  updateTime: function() {
    const now = new Date();
    const timeStr = now.toLocaleString('zh-CN');
    this.setData({
      lastUpdateTime: timeStr
    });
  },

  // 禁用页面滑动
  disablePageSwipe: function() {
    this.setData({ pageSwipeDisabled: true });
  },

  // 启用页面滑动
  enablePageSwipe: function() {
    this.setData({ pageSwipeDisabled: false });
  },

  // 触摸开始
  touchStart: function(e) {
    if (this.data.pageSwipeDisabled) return;
    this.setData({
      touchStartX: e.touches[0].clientX
    });
  },

  // 触摸结束
  touchEnd: function(e) {
    if (this.data.pageSwipeDisabled) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchStartX = this.data.touchStartX;
    const diffX = touchEndX - touchStartX;
    
    // 判断滑动方向和距离
    if (Math.abs(diffX) > 50) { // 滑动距离大于50px才触发
      if (diffX > 0) {
        // 向右滑动，切换到上一个页面
        this.swipeToPrevious();
      } else {
        // 向左滑动，切换到下一个页面
        this.swipeToNext();
      }
    }
  },

  // 滑动到上一个页面
  swipeToPrevious: function() {
    const tabOrder = ['monitor', 'classification', 'device', 'rgb'];
    const currentIndex = tabOrder.indexOf(this.data.currentTab);
    if (currentIndex > 0) {
      const previousIndex = currentIndex - 1;
      this.switchTab({ currentTarget: { dataset: { tab: tabOrder[previousIndex] } } });
    }
  },

  // 滑动到下一个页面
  swipeToNext: function() {
    const tabOrder = ['monitor', 'classification', 'device', 'rgb'];
    const currentIndex = tabOrder.indexOf(this.data.currentTab);
    if (currentIndex < tabOrder.length - 1) {
      const nextIndex = currentIndex + 1;
      this.switchTab({ currentTarget: { dataset: { tab: tabOrder[nextIndex] } } });
    }
  },

  // 页面切换功能
  switchTab: function(e) {
    const tab = e.currentTarget.dataset.tab;
    console.log('Switching to tab:', tab);
    this.setData({
      currentTab: tab
    });
    console.log('Current tab set to:', this.data.currentTab);
  },

  // 设置蓝牙数据监听器 (替换原来的receive函数)
  setupBLEListener: function () {
    let self = this;
    wx.onBLECharacteristicValueChange(function (characteristic) {
      console.log("Received data via notification.");

      const buffer = characteristic.value;
      const dataView = new DataView(buffer);
      let hexStr = '';
      for (let i = 0; i < dataView.byteLength; i++) {
        let hex = dataView.getUint8(i).toString(16);
        if (hex.length === 1) {
          hex = '0' + hex;
        }
        hexStr += hex;
      }
      
      function hexStrToStr(hexStr) {
        var str = "";
        for (var i = 0; i < hexStr.length; i += 2) {
          str += String.fromCharCode(parseInt(hexStr.substring(i, i + 2), 16));
        }
        return str;
      }
      const intStr = hexStrToStr(hexStr);

      if (intStr.startsWith("<START>") && intStr.endsWith("<END>")) {
        var dataContent = intStr.substring(7, intStr.length - 5);
        var dataPairs = dataContent.split(',');
        var parsedData = {};
        dataPairs.forEach(function(item) {
          var pair = item.split('=');
          if(pair.length === 2) {
            parsedData[pair[0]] = pair[1];
          }
        });

        const irValue = parseInt(parsedData.IR || 0);
        const smokeValue = parseInt(parsedData.SMOKE || 0);
        const flameValue = 4095 - parseInt(parsedData.FLAME || 0);
        const distanceValue = parseInt(parsedData.DIST || 0);
        const weightValue = parseInt(parsedData.WEIGHT || 0);
        const temperatureValue = parseFloat(parsedData.TEMPERATURE || 0);
        const humidityValue = parseFloat(parsedData.HUMIDITY || 0);
        const weightPercentage = Math.min((weightValue / 5000) * 100, 100);

        const brightnessValue = parseInt(parsedData.BRIGHTNESS || 0);
        const rgbRed = parseInt(parsedData.RGB_R || 0);
        const rgbGreen = parseInt(parsedData.RGB_G || 0);
        const rgbBlue = parseInt(parsedData.RGB_B || 0);
        const lightOn = parsedData.LIGHT_ON === "1";
        const fanOn = parsedData.FAN_ON === "1";

        // K210分类结果 - 使用映射函数
        const rawClassification = parsedData.CLASSIFICATION || "未检测";
        const classificationValue = self.mapLabelToChinese(rawClassification);
        const confidenceValue = parseFloat(parsedData.CONFIDENCE || 0).toFixed(2);

        var irText = irValue === 1 ? "有人" : "无人";
        var smokeText = smokeValue <= 150 ? "正常" : smokeValue <= 1500 ? "低浓度" : smokeValue <= 3000 ? "中浓度" : "高浓度";
        var flameText = flameValue < 1000 ? "正常" : "检测到火焰";
        var distanceText = distanceValue > 15 ? "开启" : "关闭";
        var weightText = weightValue > 0 ? "有物品" : "无物品";

        var irColor = (irText === "有人") ? "#4CAF50" : "#ffffff";
        var smokeColor;
        if (smokeValue <= 150) { smokeColor = "#ffffff"; } else if (smokeValue <= 1500) { smokeColor = "#FFD700"; } else if (smokeValue <= 3000) { smokeColor = "#FF8C00"; } else { smokeColor = "#FF4444"; }
        var flameColor = (flameText === "正常") ? "#ffffff" : "#FF1744";
        var distanceColor;
        if (distanceValue <= 5) { distanceColor = "#FF1744"; } else if (distanceValue <= 10) { distanceColor = "#FFD700"; } else if (distanceValue <= 15) { distanceColor = "#4CAF50"; } else { distanceColor = "#ffffff"; }
        var weightColor;
        if (weightValue === 0) { weightColor = "#ffffff"; } else if (weightValue <= 1000) { weightColor = "#2196F3"; } else if (weightValue <= 2000) { weightColor = "#4CAF50"; } else if (weightValue <= 3500) { weightColor = "#FFD700"; } else if (weightValue <= 4500) { weightColor = "#FF8C00"; } else { weightColor = "#FF1744"; }

        var updateData = { irValue, smokeValue, flameValue, distanceValue, weightValue, temperatureValue, humidityValue, weightPercentage, irText, smokeText, flameText, distanceText, weightText, irColor, smokeColor, flameColor, distanceColor, weightColor, classificationValue, confidenceValue };
        
        if (parsedData.BRIGHTNESS !== undefined) {
          updateData.brightnessValue = brightnessValue;
          updateData.redValue = rgbRed;
          updateData.greenValue = rgbGreen;
          updateData.blueValue = rgbBlue;
          updateData.lightOn = lightOn;
          console.log("Updated light state from ESP32:", { R: rgbRed, G: rgbGreen, B: rgbBlue, Brightness: brightnessValue, LightOn: lightOn });
        }
        
        if (parsedData.FAN_ON !== undefined) {
          updateData.fanOn = fanOn;
          if (fanOn) {
            updateData.fanStatus = "开启";
            updateData.fanOnActive = "active";
            updateData.fanOffActive = "";
          } else {
            updateData.fanStatus = "关闭";
            updateData.fanOnActive = "";
            updateData.fanOffActive = "active";
          }
          console.log("Updated fan state from ESP32: " + fanOn);
        }
        
        const date = new Date();
        updateData.lastUpdateTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
        updateData.connectionStatus = '已连接';

        // 收到数据后设置标志
        updateData.hasReceivedData = true;
        
        // 更新最后接收数据的时间
        updateData.lastDataTime = Date.now();
        
        // 如果已经过了3秒，立即隐藏动画
        if (!self.data.isLoadingData) {
          updateData.isLoadingData = false;
        }

        // 添加防抖：避免频繁更新
        if (self.data.updateTimeout) {
          clearTimeout(self.data.updateTimeout);
        }
        
        const timeout = setTimeout(() => {
          self.setData(updateData);
        }, 100); // 100ms防抖
        
        self.setData({
          updateTimeout: timeout
        });
      } else {
        console.log("Received data with incorrect format:", intStr);
      }
    });
  },

  // 风扇控制功能
  turnOnFan: function() {
    this.setData({
      fanStatus: "开启",
      fanOnActive: "active",
      fanOffActive: "",
      fanOn: true
    });
    this.sendToBluetooth("FAN_ON");
  },

  turnOffFan: function() {
    this.setData({
      fanStatus: "关闭",
      fanOnActive: "",
      fanOffActive: "active",
      fanOn: false
    });
    this.sendToBluetooth("FAN_OFF");
  },

  // 风扇开关切换（用于WXML中的switch组件）
  toggleFan: function(e) {
    const isFanOn = e.detail.value;
    if (isFanOn) {
      this.turnOnFan();
    } else {
      this.turnOffFan();
    }
  },

  // 主光源开关切换（用于WXML中的switch组件）
  toggleLight: function(e) {
    const isOn = e.detail.value;
    if (isOn) {
      // 打开时默认设置为白光
      this.setData({
        lightOn: true,
        redValue: 255,
        greenValue: 255,
        blueValue: 255,
        brightnessValue: 255,
        selectedPresetIndex: 7 // 白色通用照明
      });
      this.sendToBluetooth("RGB=255,255,255,255");
    } else {
      // 关闭时所有灯光熄灭
      this.setData({
        lightOn: false,
        redValue: 0,
        greenValue: 0,
        blueValue: 0,
        brightnessValue: 0,
        selectedPresetIndex: null
      });
      this.sendToBluetooth("RGB=0,0,0,0");
    }
  },

  // 去皮功能
  tareWeight: function() {
    if (!this.data.deviceConnected) {
      wx.showToast({
        title: '设备未连接',
        icon: 'error',
        duration: 2000
      });
      return;
    }

    // 显示确认弹窗
    wx.showModal({
      title: '确认去皮',
      content: '确定要将当前重量设为零点吗？',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 用户确认后，显示加载动画
          wx.showLoading({
            title: '去皮中...',
            mask: true
          });

          // 发送去皮指令
          this.sendToBluetooth("TARE");

          // 1.5秒后隐藏加载动画并显示成功提示
          setTimeout(() => {
            wx.hideLoading();
            wx.showToast({
              title: '去皮成功',
              icon: 'success',
              duration: 2000
            });
          }, 1500);
        }
      }
    });
  },

  // RGB灯预设选择
  selectPreset: function(e) {
    const index = e.currentTarget.dataset.index;
    const preset = this.data.lightPresets[index];
    
    // 检查预设是否有RGB值
    const hasRGBValue = preset.r > 0 || preset.g > 0 || preset.b > 0;
    
    this.setData({
      selectedPresetIndex: index,
      redValue: preset.r,
      greenValue: preset.g,
      blueValue: preset.b,
      brightnessValue: 255,
      lightOn: hasRGBValue
    });
    
    // 发送RGB控制指令
    const rgbCommand = `RGB=${preset.r},${preset.g},${preset.b},255`;
    this.sendToBluetooth(rgbCommand);
    
    wx.showToast({
      title: preset.name,
      icon: 'none',
      duration: 2000
    });
  },

  // 手动调节RGB
  adjustRGB: function(e) {
    const type = e.currentTarget.dataset.type;
    const value = e.detail.value;
    
    // 获取当前RGB值
    const currentRed = type === 'redValue' ? value : this.data.redValue;
    const currentGreen = type === 'greenValue' ? value : this.data.greenValue;
    const currentBlue = type === 'blueValue' ? value : this.data.blueValue;
    
    // 检查是否需要自动开关控制
    const hasRGBValue = currentRed > 0 || currentGreen > 0 || currentBlue > 0;
    
    this.setData({
      [type]: value,
      manualControl: true,
      lightOn: hasRGBValue,
      brightnessValue: hasRGBValue ? 255 : 0,
      selectedPresetIndex: null // 清除预设选择
    });
    
    // 清除之前的定时器
    if (this.data.manualTimeout) {
      clearTimeout(this.data.manualTimeout);
    }
    
    // 设置新的定时器
    const timeout = setTimeout(() => {
      const rgbCommand = `RGB=${this.data.redValue},${this.data.greenValue},${this.data.blueValue},${this.data.brightnessValue}`;
      this.sendToBluetooth(rgbCommand);
      this.setData({
        manualControl: false,
        manualTimeout: null
      });
    }, 500);
    
    this.setData({
      manualTimeout: timeout
    });
  },

  // RGB单独控制方法（用于WXML中的slider组件）
  onRedChange: function(e) {
    const newRedValue = e.detail.value;
    const currentGreen = this.data.greenValue;
    const currentBlue = this.data.blueValue;
    const currentBrightness = this.data.brightnessValue;
    
    const hasColor = newRedValue > 0 || currentGreen > 0 || currentBlue > 0;
    
    if (hasColor) {
      this.setData({
        redValue: newRedValue,
        lightOn: true,
        brightnessValue: currentBrightness > 0 ? currentBrightness : 255,
        selectedPresetIndex: null
      });
    } else {
      this.setData({
        redValue: newRedValue,
        lightOn: false,
        brightnessValue: 0,
        selectedPresetIndex: null
      });
    }
    this.sendRGBToBluetooth();
  },

  onGreenChange: function(e) {
    const newGreenValue = e.detail.value;
    const currentRed = this.data.redValue;
    const currentBlue = this.data.blueValue;
    const currentBrightness = this.data.brightnessValue;
    
    const hasColor = currentRed > 0 || newGreenValue > 0 || currentBlue > 0;
    
    if (hasColor) {
      this.setData({
        greenValue: newGreenValue,
        lightOn: true,
        brightnessValue: currentBrightness > 0 ? currentBrightness : 255,
        selectedPresetIndex: null
      });
    } else {
      this.setData({
        greenValue: newGreenValue,
        lightOn: false,
        brightnessValue: 0,
        selectedPresetIndex: null
      });
    }
    this.sendRGBToBluetooth();
  },

  onBlueChange: function(e) {
    const newBlueValue = e.detail.value;
    const currentRed = this.data.redValue;
    const currentGreen = this.data.greenValue;
    const currentBrightness = this.data.brightnessValue;
    
    const hasColor = currentRed > 0 || currentGreen > 0 || newBlueValue > 0;
    
    if (hasColor) {
      this.setData({
        blueValue: newBlueValue,
        lightOn: true,
        brightnessValue: currentBrightness > 0 ? currentBrightness : 255,
        selectedPresetIndex: null
      });
    } else {
      this.setData({
        blueValue: newBlueValue,
        lightOn: false,
        brightnessValue: 0,
        selectedPresetIndex: null
      });
    }
    this.sendRGBToBluetooth();
  },

  onBrightnessChange: function(e) {
    const newBrightness = e.detail.value;
    const currentRed = this.data.redValue;
    const currentGreen = this.data.greenValue;
    const currentBlue = this.data.blueValue;
    
    if (newBrightness > 0) {
      const hasColor = currentRed > 0 || currentGreen > 0 || currentBlue > 0;
      this.setData({
        brightnessValue: newBrightness,
        lightOn: true,
        redValue: hasColor ? currentRed : 255,
        greenValue: hasColor ? currentGreen : 255,
        blueValue: hasColor ? currentBlue : 255,
        selectedPresetIndex: null
      });
    } else {
      this.setData({
        brightnessValue: newBrightness,
        lightOn: false,
        redValue: 0,
        greenValue: 0,
        blueValue: 0,
        selectedPresetIndex: null
      });
    }
    this.sendRGBToBluetooth();
  },

  // 发送RGB数据到蓝牙
  sendRGBToBluetooth: function() {
    const rgbCommand = `RGB=${this.data.redValue},${this.data.greenValue},${this.data.blueValue},${this.data.brightnessValue}`;
    this.sendToBluetooth(rgbCommand);
  },

  // 关闭所有灯光
  setOff: function() {
    this.setData({
      redValue: 0,
      greenValue: 0,
      blueValue: 0,
      brightnessValue: 0,
      lightOn: false,
      selectedPresetIndex: null
    });
    this.sendToBluetooth("RGB=0,0,0,0");
  },

  // 预设选择器变化处理
  onPresetChange: function(e) {
    const index = parseInt(e.detail.value);
    const preset = this.data.lightPresets[index];
    
    if (preset) {
      // 检查预设是否有RGB值
      const hasRGBValue = preset.r > 0 || preset.g > 0 || preset.b > 0;
      
      this.setData({
        selectedPresetIndex: index,
        redValue: preset.r,
        greenValue: preset.g,
        blueValue: preset.b,
        brightnessValue: 255,
        lightOn: hasRGBValue
      });
      
      const rgbCommand = `RGB=${preset.r},${preset.g},${preset.b},255`;
      this.sendToBluetooth(rgbCommand);
      
      wx.showToast({
        title: preset.name,
        icon: 'none',
        duration: 2000
      });
    }
  },

  // 发送蓝牙数据
  sendToBluetooth: function(data) {
    if (this.data.deviceConnected && this.data.characteristicId) {
      const buffer = new ArrayBuffer(data.length);
      const dataView = new DataView(buffer);
      for (let i = 0; i < data.length; i++) {
        dataView.setUint8(i, data.charCodeAt(i));
      }
      
      wx.writeBLECharacteristicValue({
        deviceId: this.data.deviceId,
        serviceId: this.data.serviceId,
        characteristicId: this.data.characteristicId,
        value: buffer,
        success: (res) => {
          console.log('发送成功:', data);
        },
        fail: (err) => {
          console.error('发送失败:', err);
        }
      });
    } else {
      console.log('设备未连接，无法发送数据');
    }
  },

  // 检查初始连接状态
  checkInitialConnectionStatus: function() {
    // 使用更可靠的方法检查连接状态
    wx.getBLEDeviceServices({
      deviceId: this.data.deviceId,
      success: (res) => {
        console.log('设备已连接，服务列表:', res);
        this.setData({
          deviceConnected: true,
          connectionStatus: '已连接'
        });
        
        // 重新启用通知
        this.enableBLECharacteristicNotification();
      },
      fail: (err) => {
        console.log('设备未连接:', err);
        this.setData({
          deviceConnected: false,
          connectionStatus: '未连接'
        });
        
        // 如果设备未连接，尝试重连
        if (!this.data.isReconnecting) {
          console.log('初始检查发现设备未连接，开始重连');
          this.startReconnection();
        }
      }
    });
  },

  // 设置BLE连接状态监听
  setupBLEConnectionListener: function() {
    wx.onBLEConnectionStateChange((res) => {
      console.log('BLE连接状态变化:', res);
      
      // 立即更新连接状态
      this.setData({
        deviceConnected: res.connected,
        connectionStatus: res.connected ? '已连接' : '连接断开'
      });
      
      if (!res.connected) {
        // 连接断开，立即开始重连
        console.log('设备连接断开，开始重连...');
        
        // 显示断开提示
        wx.showToast({
          title: '设备连接断开',
          icon: 'error',
          duration: 2000
        });
        
        this.startReconnection();
      } else {
        // 连接成功，停止重连
        console.log('设备连接成功');
        
        // 显示连接成功提示
        wx.showToast({
          title: '设备连接成功',
          icon: 'success',
          duration: 2000
        });
        
        this.stopReconnection();
        
        // 连接成功后重新发送就绪信号
        setTimeout(() => {
          this.sendToBluetooth("APP_READY");
        }, 500);
      }
    });
  },

  // 开始重连
  startReconnection: function() {
    if (this.data.isReconnecting) return;
    
    console.log('开始重连流程');
    this.setData({
      isReconnecting: true,
      reconnectAttempts: 0,
      connectionStatus: '重连中...'
    });
    
    // 显示重连开始提示
    wx.showToast({
      title: '正在重连设备...',
      icon: 'loading',
      duration: 2000
    });
    
    this.attemptReconnection();
  },

  // 尝试重连
  attemptReconnection: function() {
    if (this.data.reconnectAttempts >= this.data.maxReconnectAttempts) {
      this.stopReconnection();
      this.setData({
        connectionStatus: '连接失败'
      });
      
      // 显示重连失败提示
      wx.showModal({
        title: '连接失败',
        content: '设备重连失败，请检查设备是否开启并重新进入页面',
        showCancel: false,
        confirmText: '确定'
      });
      
      return;
    }
    
    this.setData({
      reconnectAttempts: this.data.reconnectAttempts + 1
    });
    
    console.log(`重连尝试 ${this.data.reconnectAttempts}/${this.data.maxReconnectAttempts}`);
    
    // 尝试重新连接设备
    this.tryReconnectDevice();
    
    // 设置下次重连时间（递增间隔）
    const nextInterval = Math.min(2000 + (this.data.reconnectAttempts * 1000), 10000); // 2秒到10秒递增
    this.data.reconnectInterval = setTimeout(() => {
      this.attemptReconnection();
    }, nextInterval);
  },

  // 尝试重新连接设备
  tryReconnectDevice: function() {
    if (!this.data.deviceId) {
      console.log('没有设备ID，无法重连');
      return;
    }
    
    // 尝试创建BLE连接
    wx.createBLEConnection({
      deviceId: this.data.deviceId,
      timeout: 10000,
      success: (res) => {
        console.log('重连成功:', res);
        this.setData({
          deviceConnected: true,
          connectionStatus: '已连接',
          isReconnecting: false,
          reconnectAttempts: 0
        });
        
        // 显示重连成功提示
        wx.showToast({
          title: '重连成功',
          icon: 'success',
          duration: 2000
        });
        
        // 停止重连
        this.stopReconnection();
        
        // 重新获取服务和特征值
        this.getBLEServices();
      },
      fail: (err) => {
        console.log('重连失败:', err);
        this.setData({
          connectionStatus: `重连失败 (${this.data.reconnectAttempts}/${this.data.maxReconnectAttempts})`
        });
      }
    });
  },

  // 获取BLE服务
  getBLEServices: function() {
    wx.getBLEDeviceServices({
      deviceId: this.data.deviceId,
      success: (res) => {
        console.log('获取服务成功:', res);
        // 重新获取特征值
        this.getBLECharacteristics();
      },
      fail: (err) => {
        console.log('获取服务失败:', err);
      }
    });
  },

  // 获取BLE特征值
  getBLECharacteristics: function() {
    wx.getBLEDeviceCharacteristics({
      deviceId: this.data.deviceId,
      serviceId: this.data.serviceId,
      success: (res) => {
        console.log('获取特征值成功:', res);
        // 重新启用通知
        this.enableBLECharacteristicNotification();
      },
      fail: (err) => {
        console.log('获取特征值失败:', err);
      }
    });
  },

  // 启用BLE特征值通知
  enableBLECharacteristicNotification: function() {
    wx.notifyBLECharacteristicValueChange({
      deviceId: this.data.deviceId,
      serviceId: this.data.serviceId,
      characteristicId: this.data.characteristicId,
      state: true,
      success: (res) => {
        console.log('重新启用通知成功');
        // 发送就绪信号
        setTimeout(() => {
          this.sendToBluetooth("APP_READY");
        }, 500);
      },
      fail: (err) => {
        console.log('重新启用通知失败:', err);
      }
    });
  },

  // 停止重连
  stopReconnection: function() {
    console.log('停止重连');
    this.setData({
      isReconnecting: false,
      reconnectAttempts: 0
    });
    
    if (this.data.reconnectInterval) {
      clearTimeout(this.data.reconnectInterval);
      this.setData({
        reconnectInterval: null
      });
    }
  },

  // 设置数据超时检查
  setupDataTimeoutCheck: function() {
    this.data.dataCheckInterval = setInterval(() => {
      const now = Date.now();
      if (this.data.lastDataTime > 0 && (now - this.data.lastDataTime) > this.data.dataTimeout) {
        console.log('数据超时，可能需要重连');
        this.setData({
          connectionStatus: '连接异常'
        });
        
        // 如果设备显示已连接但数据超时，尝试重新连接
        if (this.data.deviceConnected && !this.data.isReconnecting) {
          console.log('数据超时但设备显示已连接，尝试重新连接');
          this.startReconnection();
        }
      }
    }, 3000); // 每3秒检查一次，更频繁
  },

  // 通知ESP32小程序已准备就绪
  notifyEspReady: function() {
    setTimeout(() => {
      this.sendToBluetooth("APP_READY");
    }, 1000);
  },

  chooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        const tempFilePath = res.tempFilePaths[0];
        this.setData({
          previewImage: tempFilePath,
          result: null,
          tempFilePath: tempFilePath
        });
      }
    });
  },

  clearImage() {
    this.setData({
      previewImage: '',
      result: null,
      tempFilePath: ''
    });
  },

  startRecognition() {
    const filePath = this.data.tempFilePath;
    if (!filePath) return;
    wx.showLoading({
      title: '云端运算中',
      mask: true
    });
    this.setData({ isRecognizing: true });
    wx.uploadFile({
      url: 'http://8.137.77.70:10000/classify',
      filePath: filePath,
      name: 'image',
      formData: {},
      success: res => {
        wx.hideLoading();
        this.setData({ isRecognizing: false });
        try {
          const data = JSON.parse(res.data);
          if (data.success) {
            // 用映射表转中文
            const label = data.result.topPrediction.label;
            const labelZh = LABEL_MAP[label] || label;
            wx.showToast({
              title: `${labelZh} (${data.result.topPrediction.percentage}%)`,
              icon: 'success',
              duration: 3000
            });
          } else {
            this.setData({ isRecognizing: false });
            wx.showToast({ title: '识别失败', icon: 'none' });
          }
        } catch (e) {
          wx.showToast({ title: '返回数据异常', icon: 'none' });
        }
      },
      fail: err => {
        wx.hideLoading();
        wx.showToast({ title: '上传失败', icon: 'none' });
      }
    });
  },

  onAiInputChange: function(e) {
    this.setData({
      aiInput: e.detail.value
    });
  },

  onAiPresetClick: function(e) {
    const text = e.currentTarget.dataset.text;
    this.setData({
      aiInput: text
    }, () => {
      this.sendAIRequest();
    });
  },

  sendAIRequest: function() {
    const query = this.data.aiInput.trim();
    if (!query) {
      wx.showToast({
        title: '请输入您的需求',
        icon: 'none'
      });
      return;
    }

    this.setData({
      aiLoading: true,
      aiResult: null
    });

    const apiKey = "sk-awzypccehztaldwxdwokkfmarjtvqqzbqgrqwlkjtlmslywa";
    const apiUrl = "https://api.siliconflow.cn/v1/chat/completions";
    const systemPrompt = `你是一个智能医疗设备光照助手，专门为医疗废弃物检测、环境污染排查、医学检验以及临床护理推荐最合适的光源（RGB颜色及亮度参数）。
请根据用户的检测需求，给出最科学的光谱解决方案。你必须只返回一个符合以下JSON格式的字符串，不要包含任何前言、后记、Markdown标记（如\`\`\`json）或额外的解释文字。

JSON格式模板：
{
  "success": true,
  "presetName": "方案名称（简短，如：血迹增强检测）",
  "r": 红色通道值（0-255的整数）,
  "g": 绿色通道值（0-255的整数）,
  "b": 蓝色通道值（0-255的整数）,
  "brightness": 推荐亮度（0-255的整数，通常建议为255以保证清晰度，特殊微弱光照除外）,
  "reason": "科学物理解释（30字以内，极其简短说明为什么这个RGB比例最适合，如互补色吸收等原理）"
}

如果无法识别需求或不属于医疗光照场景，请返回：
{
  "success": false,
  "presetName": "无法匹配",
  "r": 0,
  "g": 0,
  "b": 0,
  "brightness": 0,
  "reason": "抱歉，我无法识别此项需求对应的医疗光照光谱，请重新描述您的检测任务。"
}`;

    wx.request({
      url: apiUrl,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      data: {
        model: 'Qwen/Qwen3.6-35B-A3B',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        temperature: 0.1,
        thinking: {
          type: "disabled"
        }
      },
      success: (res) => {
        this.setData({ aiLoading: false });
        if (res.statusCode === 200 && res.data && res.data.choices && res.data.choices.length > 0) {
          let content = res.data.choices[0].message.content.trim();
          
          // 容错处理：去除可能包含的 markdown json 代码块包裹
          if (content.startsWith("```")) {
            content = content.replace(/^```json\s*/, "").replace(/```$/, "").trim();
          }

          try {
            const parsed = JSON.parse(content);
            if (parsed.success) {
              this.setData({
                aiResult: parsed
              });
              // 自动应用灯光
              this.applyAiLight(parsed);
              wx.showToast({
                title: this.data.deviceConnected ? '已自动应用光谱' : '已应用（设备未连接）',
                icon: 'success'
              });
            } else {
              this.setData({
                aiResult: {
                  success: false,
                  reason: parsed.reason || '大模型未能匹配到适合的光谱方案，请换个需求试试。'
                }
              });
            }
          } catch (e) {
            console.error("JSON parse error:", e, content);
            wx.showToast({
              title: '推荐方案解析失败',
              icon: 'none'
            });
          }
        } else {
          console.error("API Error Response:", res);
          wx.showToast({
            title: '服务暂时不可用',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        this.setData({ aiLoading: false });
        console.error("API request failed:", err);
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      }
    });
  },

  applyAiLight: function(aiData) {
    if (!aiData) return;
    
    // 如果没有传入具体参数，使用当前的 aiResult
    const dataToApply = aiData.r !== undefined ? aiData : this.data.aiResult;
    if (!dataToApply || !dataToApply.success) return;

    this.setData({
      redValue: dataToApply.r,
      greenValue: dataToApply.g,
      blueValue: dataToApply.b,
      brightnessValue: dataToApply.brightness,
      lightOn: dataToApply.r > 0 || dataToApply.g > 0 || dataToApply.b > 0,
      selectedPresetIndex: null // 清除常规的预设索引
    });

    // 下发蓝牙数据
    this.sendRGBToBluetooth();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    // 清理定时器
    if (this.data.manualTimeout) {
      clearTimeout(this.data.manualTimeout);
    }
    if (this.data.reconnectInterval) {
      clearTimeout(this.data.reconnectInterval);
    }
    if (this.data.dataCheckInterval) {
      clearInterval(this.data.dataCheckInterval);
    }
    if (this.minLoadingTime) {
      clearTimeout(this.minLoadingTime);
    }
  }
}) 