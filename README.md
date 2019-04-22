```
   __    ____  __  __  _  _   _
( \/\/ )(____)(  \/  )( )( \_/ )
 )    (  )__)  )    ( ( ) ) _ (
(__/\__)(____)( /\/\ )(_)(_/ \_)

```

# <font color=#34495e>小程序 wemix 框架使用指南</font>

## <font color=#34495e>使用前阅读</font>

1. 基础库最低版本要求：微信端：2.3.0； 支付宝端：1.11.0； 百度端：2.0.3； 头条端： 无
2. 为兼容多端 for 语句的 key 不要用{{}}包裹
3. 为兼容多端资源引用路径请使用绝对路径
4. 不要在 extends wemix.app 类内的函数中调用 wemix.getApp() 函数，使用 this 就可以拿到 app 实例
5. 不要在 onLaunch 中调用 wemix.getCurrentPages() ，此时，page 还没有生成

## <font color=#34495e>项目创建</font>

### <font color=#34495e>安装**wemix**工具</font>

```
npm install @wemix/cli -g
```

### <font color=#34495e>进入开发目录生成空项目并开启实时编译</font>

```
cd xxx
wemix new projectName -t empty
cd projectName
wemix build --config wemix.development.config.js -w // 开发
wemix build --config wemix.development.config.js // 线上
wemix mkpage `path` // path不带/可以自动在pages目录内生成
wemix mkcomponent `path` // path不带/可以自动在components目录内生成
```

#### <font color=#34495e>目录结构</font>

```
|-- wechat                     微信开发者工具指定的目录
|-- alipay                     支付宝开发者工具指定的目录
|-- swan                       百度开发者工具指定的目录
|-- tt                         头条开发者工具指定的目录
|-- wemixconfig                小程序配置文件信息
|-- node_modules
|-- src                        开发目录
|   |-- pages                  页面文件夹
|   |   |-- index.js
|   |   |-- index.html
|   |   |-- index.less
|   |-- components             页面依赖的组件文件夹
|   |   |-- normal
|   |   |   |-- index.js
|   |   |   |-- index.html
|   |   |   |-- index.less
|   |   |-- wechat
|   |   |   |-- index.js
|   |   |   |-- index.html
|   |   |   |-- index.less
|   |   |-- alipay
|   |   |   |-- index.js
|   |   |   |-- index.html
|   |   |   |-- index.less
|   |   |-- swan
|   |   |   |-- index.js
|   |   |   |-- index.html
|   |   |   |-- index.less
|   |   |-- tt
|   |   |   |-- index.js
|   |   |   |-- index.html
|   |   |   |-- index.less
|   |-- app.js
|   |-- app.less
|-- package-lock.json
|-- package.json
```

## <font color=#34495e>使用**wemix**的优点</font>

在原有的小程序的开发模式下进行再次封装：

1. App 实例增加 onPageShow 生命周期,监听页面变化。
2. App 实例增加 onPageHide 生命周期,监听页面变化。
3. App 实例增加 onLog 事件捕获器,监听点击事件。
4. 支持加载外部 NPM 包。
5. 支持 less 编译。
6. 针对 wx.request 并发问题进行优化。
7. @iconfont: '//at.alicdn.com/t/xxx.css';可自动引入 iconfont

单独新建一个 iconfont.less 文件存放@iconfont: '//at.alicdn.com/t/xxx.css';
其它文件引用该文件@import 'iconfont.less' 或者通过配置信息的 imports 自动全局注入 iconfont.less

## <font color=#34495e>实例</font>

### <font color=#34495e>App 实例</font>

```js
import wemix from "@wemix/core"

export default class Main extends wemix.app {
  constructor() {
    super()
  }
  onLaunch(options) {}
  onShow(options) {}
  onHide() {}
  onError(msg) {}
  onPageShow() {}
  onPageHide(tp) {}
  onLog(type, e, data) {}
}

Main.config = {
  pages: [""],
  debug: false,
  subpackages: [],
  window: {
    navigationBarBackgroundColor: "",
    navigationBarTextStyle: "",
    navigationBarTitleText: "",
    backgroundColor: "",
    backgroundTextStyle: "",
    enablePullDownRefresh: false,
    onReachBottomDistance: 50
  },
  tabBar: {
    color: "",
    selectedColor: "",
    backgroundColor: "",
    list: [
      {
        pagePath: "",
        text: "",
        iconPath: "",
        selectedIconPath: ""
      }
    ]
  },
  wechat: {
    window: {}
  },
  alipay: {},
  swan: {},
  tt: {}
}
```

### <font color=#34495e>Page 实例</font>

```js
import wemix from "@wemix/core"

export default class Index extends wemix.page {
  constructor() {
    super()
    this.data = {}
  }

  onLoad(options) {}
  onShow() {}
  onHide() {}
  onUnload() {}
  onShareAppMessage() {}
  onPageScroll() {}
  onReachBottom() {}
  onPullDownRefresh() {}
}

Index.config = {
  navigationBarBackgroundColor: "",
  navigationBarTextStyle: "",
  navigationBarTitleText: "",
  backgroundColor: "",
  backgroundTextStyle: "",
  enablePullDownRefresh: false,
  disableScroll: false,
  onReachBottomDistance: 50,
  usingComponents: {
    "a-component": "/components/normal/a"
  },
  wechatComponents: {
    "b-component": "/components/wechat/b"
  },
  alipayComponents: {
    "b-component": "/components/alipay/b"
  },
  swanComponents: {
    "b-component": "/components/swan/b"
  },
  ttComponents: {
    "b-component": "/components/tt/b"
  }
}
```

### <font color=#34495e>Component 实例</font>

```js
import wemix from "@wemix/core"

export default class Index extends wemix.component {
  constructor() {
    super()
    this.data = {}
  }
  onLoad() {}
  onUnload() {}
}

Index.config = {
  component: true,
  usingComponents: {}
}
Index.properties = {
  name: {
    type: String,
    value: ""
  }
}
```

### <font color=#34495e>打包配置文件</font>

```js
const path = require("path")
const TransformPlugin = require("@wemix/transform-plugin")

module.exports = {
  entry: [
    path.join(__dirname, "src/app.js"),
    path.join(__dirname, "src/assets")
  ],
  loaders: [
    {
      test: /\.js$/,
      include: [path.join(__dirname, "src")],
      use: [
        {
          loader: "@wemix/babel-loader",
          options: {
            configFile: path.resolve("babel.config.js")
          }
        }
      ]
    },
    {
      test: /\.less$/,
      // 样式文件可以通过imports 注入进所有的样式页面，方便变量的使用
      imports: [path.join(__dirname, "src/global.less")],
      use: [
        {
          loader: "@wemix/postcss-loader",
          options: {
            configFile: path.resolve("postcss.config.js")
          }
        },
        { loader: "@wemix/less-loader" }
      ]
    },
    {
      test: /\.css$/,
      use: [
        {
          loader: "@wemix/postcss-loader",
          options: {
            configFile: path.resolve("postcss.config.js")
          }
        }
      ]
    }
  ],
  plugins: [new TransformPlugin()]
}
```

## <font color=#34495e>wemix 属性及方法</font>

部分 api 需要做兼容处理，其他未列出的 api 暂时调用 wemix.wx wemix.my wemix.swan wemix.tt 调用

0. wemix.env // wechat alipay swan tt
1. wemix.global // 全局变量可以存在此处
1. wemix.config // app 和 page 的 json 文件信息
1. wemix.wx // 微信 api
1. wemix.my // 支付宝 api
1. wemix.swan // 百度 api
1. wemix.tt // 头条 api
1. wemix.getApp() // 获取 app 实例
1. wemix.getCurrentPages() // 获取路由栈 pages 实例
1. wemix.compareVersion() // 比较版本
1. wemix.parse()
1. wemix.stringify()
1. wemix.isString()
1. wemix.isArray()
1. wemix.isBoolean()
1. wemix.isUndefined()
1. wemix.isNull()
1. wemix.isNumber()
1. wemix.isObject()
1. wemix.isEmptyObject()
1. wemix.isFunction()
1. wemix.isSymbol()

1. wemix.saveImageToPhotosAlbum
1. wemix.previewImage
1. wemix.getImageInfo
1. wemix.compressImage
1. wemix.chooseMessageFile
1. wemix.chooseImage
   // 数据存储
1. wemix.setStorageSync
1. wemix.setStorage
1. wemix.removeStorageSync
1. wemix.removeStorage
1. wemix.getStorageSync
1. wemix.getStorage
1. wemix.getStorageInfoSync
1. wemix.getStorageInfo
1. wemix.clearStorageSync
1. wemix.clearStorage
   // 下拉刷新
1. wemix.stopPullDownRefresh
1. wemix.startPullDownRefresh
   // 转发
1. wemix.updateShareMenu
1. wemix.showShareMenu
1. wemix.hideShareMenu
1. wemix.getShareInfo
   // 位置
1. wemix.openLocation
1. wemix.getLocation
1. wemix.chooseLocation
   // 导航栏
1. wemix.showNavigationBarLoading
1. wemix.setNavigationBarTitle
1. wemix.setNavigationBarColor
1. wemix.hideNavigationBarLoading
   // 背景
1. wemix.setBackgroundTextStyle
1. wemix.setBackgroundColor
   // 收获地址
1. wemix.chooseAddress
   // 交互
1. wemix.showToast
1. wemix.showModal
1. wemix.showLoading
1. wemix.showActionSheet
1. wemix.hideToast
1. wemix.hideLoading
   // 系统信息
1. wemix.getSystemInfoSync
1. wemix.getSystemInfo
   // 路由
1. wemix.navigateTo
1. wemix.redirectTo
1. wemix.navigateBack
1. wemix.switchTab
1. wemix.reLaunch
   // 网络
1. request
   // 用户信息
1. getUserInfo

## <font color=#34495e>page 实例属性</font>

1. this.data
2. this.options
3. this.route
4. this.search
5. this.setData()
6. this.selectComponent()
7. this.selectAllComponents()

## <font color=#34495e>component 实例属性</font>

1. this.data
2. this.props
3. this.setData()
4. this.selectComponent()
5. this.selectAllComponents()
6. this.triggerEvent()
