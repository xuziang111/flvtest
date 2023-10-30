#### Development

```bash
npm i --registry=https://registry.npmmirror.com # 安装依赖
npm run dev # 启动开发服务
npm run build # 打包构建
```

#### 主要依赖

- [Vue.js](https://cn.vuejs.org/guide/introduction.html) 3
- [CesiumJS](https://www.cesium.com/learn/cesiumjs-learn/cesiumjs-quickstart/)
- [vue-cesium](https://zouyaoji.top/vue-cesium/#/zh-CN/component)

#### 项目结构

```
├── assets
├── Cesium // 固定版本的Cesium程序，git忽略了
├── Data // 3Dtiles模型文件，git忽略了
├── docs // 文档
│   ├── cesium使用文档.md // 老项目继承下来的文档
│   ├── changelog.md // 本项目更改日志
│   └── image // 文档图片
├── index.html // 项目vite模板HTML文件
├── load3D.html // 老项目继承的存档
├── package-lock.json
├── package.json
├── readme.md
├── road-map.html // 老项目继承的存档
├── src // 代码文件夹
│   ├── App.vue // Vue入口组件，在此初始化Cesium
│   ├── components // Vue组件文件夹
│   │   ├── Analysis.vue
│   │   ├── Controller.vue
│   │   ├── Heatmap.vue
│   │   └── ...
│   ├── constants.ts // 常量存储文件
│   ├── main.ts // 项目入口文件, 再此初始化Vue
│   └── style.css // 全局css文件
├── tsconfig.json // Typescript配置文件
├── types // Typescript类型定义文件夹
│   └── env.d.ts // 全局type定义
├── vercel.json // vercel自动化部署配置
└── vite.config.ts // vite配置文件
```

其中`Cesium`和`Data`文件夹因为大小问题没有上传。本地没有这些文件将自动加载线上资源。
