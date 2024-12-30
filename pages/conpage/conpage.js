var app = getApp()
var hexStr
var intStr

Page({

  /**
   * 页面的初始数据
   */
  data: {
    temperatureValue: "", // 温度
    humidityValue: "",    // 湿度
    infraredStatus: "",   // 红外状态
    microphoneValue: "",  // 麦克风
    smokeValue: "",       // 烟雾
    rainValue: "",        // 雨滴
    distanceValue: "",    // 距离
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.receive();
    setInterval(this.receive.bind(this), 1000);
  },

  receive: function () {
    let self = this; // 创建一个指向当前页面实例的变量
    wx.onBLECharacteristicValueChange(function (characteristic) {
      console.log(characteristic.value);
      var dataView = new DataView(characteristic.value);
      var length = dataView.byteLength; // 获取数据的长度
      var dataArray = new Uint8Array(characteristic.value); // 将 ArrayBuffer 转换为 Uint8Array

      // 将 Uint8Array 转换为十六进制字符串
      hexStr = Array.from(dataArray).map(byte => ('00' + byte.toString(16)).slice(-2)).join('');
      
      // 声明和定义 hexStrToStr 函数  
      // 用于解析发送过来的ASCII hex值
      function hexStrToStr(hexStr) {
        var str = "";
        for (var i = 0; i < hexStr.length; i += 2) {
          var charCode = parseInt(hexStr.substring(i, i + 2), 16);
          if (charCode >= 0x10000) { // 如果是代理对    
            var highSurrogate = (charCode - 0x10000) / 0x400 + 0xD800;    
            var lowSurrogate = (charCode - 0x10000) % 0x400 + 0xDC00;    
            str += String.fromCharCode(highSurrogate);    
            str += String.fromCharCode(lowSurrogate);    
          } else { // 如果是常规字符    
            str += String.fromCharCode(charCode);    
          }
        }
        return str;
      }

      // 转换成字符串
      intStr = hexStrToStr(hexStr);
      console.log('Received data (hex):', hexStr);
      console.log('Received data (String):', intStr);

      // 校验数据是否以 <START> 开头，且以 <END> 结尾
      if (intStr.startsWith("<START>") && intStr.endsWith("<END>")) {
        // 提取中间的有效数据部分
        var dataContent = intStr.substring(7, intStr.length - 5); // 去除 <START> 和 <END>

        // 使用逗号拆分字符串
        var dataArray = dataContent.split(',');

        // 解析数据并映射到变量
        var infraredStatus = parseInt(dataArray[0]);  // 红外状态
        var microphoneValue = parseInt(dataArray[1]); // 麦克风值
        var smokeValue = parseInt(dataArray[2]);      // 烟雾值
        var rainValue = parseInt(dataArray[3]);       // 雨滴值
        var distanceValue = parseFloat(dataArray[4]); // 距离值
        var temperatureValue = parseFloat(dataArray[5]); // 温度
        var humidityValue = parseFloat(dataArray[6]);    // 湿度

        // 更新页面数据
        self.setData({
          infraredStatus,
          microphoneValue,
          smokeValue,
          rainValue,
          distanceValue,
          temperatureValue,
          humidityValue
        });
      } else {
        console.log("Received data format is incorrect!");
      }
    });

    // 读取蓝牙数据
    wx.readBLECharacteristicValue({
      deviceId: app.globalData.appdid,
      serviceId: app.globalData.appsid,
      characteristicId: app.globalData.appcid,
      success(res) {
        console.log('readBLECharacteristicValue:', res.errCode);
      }
    });
  },

  // 向蓝牙设备发送数据
  writeBLECharacteristicValue(leddata) {
    // 向蓝牙设备发送一个0x00的16进制数据
    let buffer = new ArrayBuffer(1);
    let dataView = new DataView(buffer);
    dataView.setUint8(0, leddata);
    wx.writeBLECharacteristicValue({
      deviceId: app.globalData.appdid,
      serviceId: app.globalData.appsid,
      characteristicId: app.globalData.appcid,
      value: buffer,
    });
  },

});
