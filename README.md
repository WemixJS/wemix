```
   __    ____  __  __  _  _   _
( \/\/ )(____)(  \/  )( )( \_/ )
 )    (  )__)  )    ( ( ) ) _ (
(__/\__)(____)( /\/\ )(_)(_/ \_)

```

使用绝对路径
:key 用字符串 不要用{{}}包裹

# <font color=#34495e>小程序 wemix 框架使用指南</font>

## <font color=#34495e>使用前阅读</font>

1. 基础库最低版本要求：微信端：1.6.3； 支付宝端：1.7.0； 百度端：1.10.13； 头条端： 无

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
wemix build -w //开发
wemix build -p --no-cache //线上
wemix mkpage `path` //path不带/可以自动在pages目录内生成
wemix mkcomponent `path` //path不带/可以自动在components目录内生成
wemix mkbehavior `path` //path不带/可以自动在behaviors目录内生成
```

#### <font color=#34495e>目录结构</font>

```
|-- dist                     微信开发者工具指定的目录
|-- node_modules
|-- src                      开发目录
|   |-- pages                页面文件夹(文件夹名不允许改动)
|   |   |-- index.js
|   |   |-- index.html
|   |   |-- index.less
|   |-- components           页面依赖的组件文件夹(文件夹名不允许改动)
|   |   |-- index.js
|   |   |-- index.html
|   |   |-- index.less
|   |-- behaviors            组件间代码共享的特性mixins(文件夹名不允许改动)
|   |   |-- index.js
|   |-- app.js
|   |-- app.less
|-- package-lock.json
|-- package.json
```

⚠️<font color=#FF5E45>注：命名为 pages,components,behaviors 的文件夹请勿更改</font>

### <font color=#FF5E45>`重要`</font><font color=#34495e>微信开发者工具设置</font>

1. 本地开发选择`dist`目录
2. 详情-->项目设置-->取消勾选 ES6 转 ES5
3. 详情-->项目设置-->取消勾选上传代码时样式自动补全
4. 详情-->项目设置-->取消勾选上传代码时自动压缩

## <font color=#34495e>使用**wemix**的优点</font>

在原有的小程序的开发模式下进行再次封装：

1. App 实例增加 onPageShow 生命周期,监听页面变化。
2. App 实例增加 onPageHide 生命周期,监听页面变化。
3. App 实例增加 onLog 事件捕获器,监听点击事件。
4. Page 实例增加 onRoute 生命周期避免 onShow 方法多次执行。
5. 支持加载外部 NPM 包。
6. 支持 less 编译。
7. 针对 wx.request 并发问题进行优化。
8. @iconfont: '//at.alicdn.com/t/xxx.css';可自动引入 iconfont
9. page 和 component 实例添加 this.emit({listenCurrentRoute: false, listenerName: 'triggerListener'}, ...args)

component 内样式无法直接使用 app.less 内的样式所以建议
单独新建一个 iconfont.less 文件存放@iconfont: '//at.alicdn.com/t/xxx.css';其它文件引用该文件@import 'iconfont.less'

listenCurrentRoute false 则会遍历路由栈内所有页面及组件
listenCurrentRoute true 只会遍历当前路由的页面及组件

## <font color=#34495e>实战说明</font>

### <font color=#34495e>关于编译及插件</font>

- 当前仅支持 less 编译
- babel 使用的 preset 为 babel-preset-env，配置为：

```
{
  "presets": [
    ["env", {
      "debug": false,
      "targets": {
        "chrome": "53",
        "ios": "8",
        "browsers": ["Chrome >= 53", "ChromeAndroid >= 53", "iOS >= 8"]
      }
    }]
  ],
  "plugins": [
    [
      "transform-runtime", {
        "helpers": false,
        "polyfill": true,
        "regenerator": true,
        "moduleName": "babel-runtime"
      }
    ],
    ["transform-object-rest-spread"]
  ]
}
```

- 线上构建的时候指定以下插件进行压缩：

```
  uglify-js
  imagemin
  pretty-data
  cssnano
```

### <font color=#34495e>WEMIX 额外封装的一些事件</font>

1. wemix.bridge 封装了小程序的方法，以及添加了

   wemix.bridge.compareVersion(v1, v2) 比较版本号

   wemix.bridge.refresh() 刷新当前页面

   wemix.bridge.add(a, b) 用来得到精确的加法结果

   wemix.bridge.sub(a, b) 用来得到精确的减法结果

   wemix.bridge.mul(a, b) 用来得到精确的乘法结果

   wemix.bridge.div(a, b) 用来得到精确的除法结果

2. wemix.route 保存了小程序的路由

   wemix.route.current.page

   wemix.route.current.search

   wemix.route.previous.page 上一个路由栈信息

   wemix.route.previous.search 上一个路由栈信息

3. wemix.config 所有的 json 配置文件

4. wemix.global 全局数据的缓存存储

   wemix.global.sysInfo 默认存储了 getSystemInfoSync 的数据

5. wemix.getStackRoutes() 获取当前路由栈的所有路由；禁止在 onLaunch 方法内使用

   禁止使用 getApp()方法，使用 wemix.instance.app 代替

   禁止使用 getCurrentPages()方法，使用 wemix.instance.pages[wemix.getStackRoutes()[index]]代替

### <font color=#34495e>实例</font>

##### <font color=#34495e>App 实例</font>

```html
import wemix from 'wemix' /** * 类名不要使用App字段 */ export default class Main
extends wemix.app { onLaunch (options) { } onShow (options) { } onHide () { }
onError (msg) { } onPageShow () { } onPageHide (tp) { } // 在点击事件(bindtap,
catchtap bindsubmit等)元素中定义以data-wemixlog开头的属性
data-wemixlog-click-area='a_b_c_d' // 接收data-wemixlog数据对象 data =
{clickArea: 'a_b_c_d'} onLog (type, e, data) { } onPageNotFound () { } }
Main.config = { pages: [ 'pages/index' ], window: { backgroundTextStyle:
'light', navigationBarBackgroundColor: '#FFFFFF', navigationBarTitleText:
'WEMIX', navigationBarTextStyle: 'black' } }
```

##### <font color=#34495e>Page 实例</font>

```html
import wemix from 'wemix' /** * 类名不要使用Page字段 */ export default class
Index extends wemix.page { onLoad (options) { } onReady () { } onShow () { }
onHide () { } onUnload () { } onPullDownRefresh () { } onReachBottom () { }
onShareAppMessage () { } onPageScroll () { } onTabItemTap () { } } Index.data =
{} Index.config = { navigationBarTitleText: 'WEMIX', usingComponents: {} }
```

##### <font color=#34495e>Component 实例</font>

```html
import wemix from 'wemix' /** * 类名不要使用Component字段 */ export default
class Index extends wemix.component { onPageShow () { } onPageHide () { }
created () { } attached () { } ready () { } moved () { } detached () { } }
Index.config = { component: true, usingComponents: {} } Index.data = {}
Index.properties = {} // behaviors的引入和原生小程序有区别,直接填路径即可 //
引入方式为['/behaviors/a', '/behaviors/a/b',...] Index.behaviors = []
Index.methods = {}
```

##### <font color=#34495e>Behaviors</font>

```html
export default { behaviors: [], properties: {}, data: {}, attached () { },
methods: {} }
```
