# 基于深度学习的智能医疗废物分类与环境监测系统 📡

[![Platform](https://img.shields.io/badge/Platform-WeChat%20Mini%20Program-07C160?logo=wechat&logoColor=white)](https://mp.weixin.qq.com/)
[![Language](https://img.shields.io/badge/Language-JavaScript%20%2F%20WXML%20%2F%20WXSS-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/YCH-HUST/DeepLearning-Medical-Waste-System.svg?style=social)](https://github.com/YCH-HUST/DeepLearning-Medical-Waste-System)

本系统是一款专为医疗机构设计的**智能医疗废物分类与环境监测系统**微信小程序终端。它通过低功耗蓝牙（BLE）与传感器控制中心（如 ESP32、K210 等嵌入式设备）进行实时通信，集成了多维度环境监测、AI 废弃物识别分类、智能设备控制以及基于大语言模型的 AI 智能光谱推荐系统，旨在提升医疗废物的处理效率和科室安全防护水平。

---

## 🌟 核心功能

### 1. 📶 蓝牙设备快速发现与重连
* 智能扫描周围的 BLE 监控终端，实时计算信号强度（RSSI）并进行可视化百分比排序。
* **高可靠连接机制**：具备自动重连机制、数据超时监测与网络抖动防护，保证在复杂的医院电磁干扰环境下依然能保持稳定连接。

### 2. 📊 实时环境与安全监测面板
* **温湿度监控**：精确掌握废弃物暂存区的温湿度变化，预防细菌滋生。
* **人体检测（红外IR）**：感知人员出入，提升密闭空间的安防与设备联动体验。
* **安全预警系统**：集成了**烟雾浓度监测**与**火灾/火焰监测**，多级阈值报警，危险级别颜色标红提示。
* **满溢与距离检测**：利用超声波检测垃圾桶盖状态/距离，配合**重量传感器（Load Cell）**精确称重，并通过环形进度条显示垃圾桶满溢度。

### 3. 🤖 AI 智能医疗废物图像分类
* 支持直接调用摄像头拍照或从相册上传医疗废物图片。
* 对接高性能深度学习分类 API（`classify` 接口），快速得出废物名称（例如：注射器、口罩、防护手套、人体组织、金属器械等）及其置信度。
* 根据国家医疗废弃物分类标准进行结果映射与处置引导。

### 4. 💡 智能医疗光谱控制中心
医疗场景下对光谱要求极高，系统提供了三大灯光调控模块：
* **AI 智能光谱生成**：用户输入具体需求（如“检测血迹”、“辅助静脉穿刺”），小程序将通过大模型接口（SiliconFlow 驱动的 Qwen-35B）计算出物理光学互补方案，自动生成对应的 R、G、B 参数与亮度，一键下发给硬件调光。
* **专业光谱预设**：预置紫外近似光（体液残留检测）、蓝光检测（静脉显影）、绿色对比检测（血迹增强）等 9 种专业医疗照明模式。
* **手动精细调节**：提供 R、G、B 三色及亮度的独立滑动调节。

### 5. ⚙️ 设备远程交互
* **去皮（Tare）控制**：一键清除当前重量传感器底数，便于更换垃圾袋或校准。
* **风扇控制**：与温湿度和烟雾传感器联动，支持自动或手动一键开/关环境风扇，加速空气循环。

---

## 🛠️ 技术栈

* **前端框架**：微信小程序原生框架（WXML + WXSS + JavaScript）
* **通信协议**：微信蓝牙小程序 API (BLE 接口: `wx.writeBLECharacteristicValue` / `wx.onBLECharacteristicValueChange`)
* **自然语言处理**：SiliconFlow LLM API (Qwen/Qwen3.6-35B-A3B) 用于 AI 光谱方案推理
* **计算机视觉**：基于 YOLO/深度学习的图像分类 API

---

## 📁 目录结构说明

```text
├── pages
│   ├── index           # 蓝牙连接页（设备发现、RSSI 显示、建立 BLE 握手）
│   ├── conpage         # 核心控制页面（数据监测、AI分类、设备控制、RGB调节）
│   └── logs            # 系统日志页
├── utils
│   └── util.js         # 工具类函数（格式化时间等）
├── app.js              # 小程序逻辑入口
├── app.json            # 全局配置（页面路由、窗口样式）
├── app.wxss            # 全局样式文件
├── project.config.json # 微信开发者工具项目配置
└── sitemap.json        # 微信索引配置
```

---

## 🚀 快速上手

### 1. 克隆本项目
```bash
git clone https://github.com/YCH-HUST/DeepLearning-Medical-Waste-System.git
```

### 2. 导入项目
1. 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)。
2. 打开微信开发者工具，选择 **导入项目**。
3. 选择克隆下来的项目根目录。
4. 填写您的小程序 `AppID`（或使用测试号）。

### 3. 本地调试与配置
* **蓝牙调试**：真机调试效果最佳。确保您的测试手机已开启 **蓝牙** 与 **定位权限**。
* **接口域名配置**：
  * AI 分类接口地址配置在 [conpage.js](file:///Users/yangchenghao/WeChatProjects/基于深度学习的智能医疗废物分类与环境监测系统/pages/conpage/conpage.js) 中（默认为 `http://8.137.77.70:10000`）。
  * 确保在“微信开发者工具 - 详情 - 本地设置”中勾选 **“不校验合法域名、web-view(业务域名)、TLS版本以及HTTPS证书”**，或者在微信公众平台配置对应的合法域名。

---

## 🔒 许可证书

本项目采用 [MIT License](LICENSE) 许可协议。
