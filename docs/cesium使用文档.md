# **cesium 使用文档**

### 1. 倾斜模型 osgb 格式转换（使用 osgblab 工具）（推荐）

#### **1.1 工具安装**

在相关工具文件夹中双击并安装，或从 Github 项目中的 Release 中下载，或从网上搜索下载。

​![本地路径](.\image\osgblab.png "osgblab安装")

#### **1.2 进行配置设置**

以下是 osgb 文件格式： ![本地路径](.\image\osgb格式表现.png "osgb文件格式如下：")

将 matadata.xml 所在目录即上图文件夹所在路径放入输入目录中，再配置相应的输出目录。![本地路径](.\image\osgb转3dtile1.png "osgb文件格式如下：")

切片完成格式如下：
![本地路径](.\image\osgb切片完成后格式.png "配置展示")

#### **1.3 在 cesium 中加载倾斜模型**

```javascript
var tileSetModel = new Cesium.Cesium3DTileset({
  url: "./Data/scene.json", //此处路径为相对路径
  maximumScreenSpaceError: 1,
});

tileSetModel.readyPromise.then((tileset) => {
  console.log("加载完成");
  //
  let surface = Cesium.Cartesian3.fromRadians(0, 0, 0);
  //模型改变的位置
  let offset = Cesium.Cartesian3.fromRadians(0, 0, 270); //（参数依次为：经度，纬度，高度）根据需要自行调整
  //定义模型的改变状态
  let translation = Cesium.Cartesian3.subtract(
    offset,
    surface,
    new Cesium.Cartesian3()
  );
  tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);

  viewer.scene.primitives.add(tileset); //添加模型
  viewer.zoomTo(
    tileset,
    new Cesium.HeadingPitchRange(0.5, -0.2, tileset.boundingSphere.radius * 1.0)
  ); //视角转移到模型中
});
```

### 2.倾斜模型 obj 格式转换（使用 osgblab 工具）

将 obj 格式转换为 osgb 格式。

![本地路径](.\image\obj转osgb.png "配置展示")

输入配置选择保存所有 obj 文件的文件夹即可，转换为 osgb 格式后其他操作同上。

### **3.倾斜模型 osgb 格式（大疆智图）转换** (使用 cesiumlab 工具)

#### **1.1 在[Cesium 实验室官网 (cesiumlab.com)](https://www.cesiumlab.com/)下载 cesiumlab 工具并安装**

#### **1.2 在桌面打开 cesiumlab 在登陆界面注册并登陆**

#### **1.3 在 cesiumlab 界面点击倾斜模型转换**

![本地路径](.\image\osgb2.png "配置展示")

#### **1.4 进行配置设置**

![本地路径](.\image\osgb3.png "配置展示")

**存储类型选择散列** ，然后选择输出路径，其他配置全部保持默认。（一次只能传入一个 osgb 格式数据）

在 cesium 中加载方式同上。

### **4.数字正射 tif 格式转换** (使用 cesiumlab 工具)

#### **4.1 在 cesiumlab 中点击影像切片**

![本地路径](.\image\tif数字正射数据.png "配置展示")

#### **4.2 进行配置**

![本地路径](.\image\数字正射配置.png "配置展示")

输入 tif 数据，**输出格式选择散列**。

#### **4.3 在 cesium 中加载倾斜模型数据**

使用相对路径进行加载

```javascript
let domImage = new Cesium.UrlTemplateImageryProvider({
  url: "./data/zhengshe/{z}/{x}/{y}.png", //html文件与data文件夹在同一文件夹下，zhengshe文件夹内部数据如上图所示。
});

viewer.scene.imageryLayers.addImageryProvider(domImage);
```

####

### **5.高程数据 tif/dem 格式转换** (使用 cesiumlab 工具)

#### **5.1 在 cesiumlab 中选择地形切片**

![本地路径](.\image\tif高程数据.png "配置展示")

​

#### **5.2 进行配置**

![本地路径](.\image\高程数据配置.png "配置展示")

**输出类型选择散列**，处理参数三角算法根据需要选择 vcg 或者 ctb

vcg 使用更精确的算法，得出的高程数据精确度高，完成度好，但是处理时间为 ctb 算法的 10~60 倍。

ctb 算法速度更快。

切片成功后数据格式如下所示：

![本地路径](.\image\高程数据展示.png "配置展示")

#### **5.3 在 cesium 中加载高程数据**

```javascript
viewer.terrainProvider = new Cesium.CesiumTerrainProvider({
  url: "./data/newhigh/", //此处为相对路径
});
```
