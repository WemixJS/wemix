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
|   |   |-- index.js
|   |   |-- index.html
|   |   |-- index.less
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

1. wemix.global // 全局变量可以存在此处
2. wemix.config // app 和 page 的 json 文件信息
3. wemix.wx // 微信 api
4. wemix.my // 支付宝 api
5. wemix.swan // 百度 api
6. wemix.tt // 头条 api
7. wemix.getApp() // 获取 app 实例
8. wemix.getCurrentPages() // 获取路由栈 pages 实例
9. wemix.compareVersion() // 比较版本
10. wemix.parse()
11. wemix.stringify()
12. wemix.isString()
13. wemix.isArray()
14. wemix.isBoolean()
15. wemix.isUndefined()
16. wemix.isNull()
17. wemix.isNumber()
18. wemix.isObject()
19. wemix.isEmptyObject()
20. wemix.isFunction()
21. wemix.isSymbol()

22. wemix.saveImageToPhotosAlbum
23. wemix.previewImage
24. wemix.getImageInfo
25. wemix.compressImage
26. wemix.chooseMessageFile
27. wemix.chooseImage
    // 数据存储
28. wemix.setStorageSync
29. wemix.setStorage
30. wemix.removeStorageSync
31. wemix.removeStorage
32. wemix.getStorageSync
33. wemix.getStorage
34. wemix.getStorageInfoSync
35. wemix.getStorageInfo
36. wemix.clearStorageSync
37. wemix.clearStorage
    // 下拉刷新
38. wemix.stopPullDownRefresh
39. wemix.startPullDownRefresh
    // 转发
40. wemix.updateShareMenu
41. wemix.showShareMenu
42. wemix.hideShareMenu
43. wemix.getShareInfo
    // 位置
44. wemix.openLocation
45. wemix.getLocation
46. wemix.chooseLocation
    // 导航栏
47. wemix.showNavigationBarLoading
48. wemix.setNavigationBarTitle
49. wemix.setNavigationBarColor
50. wemix.hideNavigationBarLoading
    // 背景
51. wemix.setBackgroundTextStyle
52. wemix.setBackgroundColor
    // 收获地址
53. wemix.chooseAddress
    // 交互
54. wemix.showToast
55. wemix.showModal
56. wemix.showLoading
57. wemix.showActionSheet
58. wemix.hideToast
59. wemix.hideLoading
    // 系统信息
60. wemix.getSystemInfoSync
61. wemix.getSystemInfo
    // 路由
62. wemix.navigateTo
63. wemix.redirectTo
64. wemix.navigateBack
65. wemix.switchTab
66. wemix.reLaunch

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
