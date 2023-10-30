> author: symant233

- 优化项目结构，去除多余文件，使用 Git 保存更改。
- 改变 CSS 样式，使地图充满窗口，按钮和坐标用绝对定位挂在窗口底部。
- 增加天地图作为卫星地图瓦片提供。
- ❎ 因为天地图访问次数限制去除天地图。
- 加入 Sentinel-2 卫星地图瓦片提供（注册后在 Cesium ION 中的 Asset Depot 中加入，[地址](https://ion.cesium.com/assetdepot/3954)。如果不更改我的 Cesium ION token 就不需要重新注册账号做此操作。）本次更改代码如下：

```js
// Remove default base layer
viewer.imageryLayers.remove(viewer.imageryLayers.get(0));
// Add Sentinel-2 imagery from ION assets
viewer.imageryLayers.addImageryProvider(
  new Cesium.IonImageryProvider({ assetId: 3954 })
);
// Load Cesium World Terrain
viewer.terrainProvider = Cesium.createWorldTerrain({
  requestWaterMask: false, // required for water effects
  requestVertexNormals: false, // required for terrain lighting
});
// Enable lighting based on sun/moon positions
viewer.scene.globe.enableLighting = true;
```

- 加入动画的点，覆盖在`show5`里了。

```js
datasource.entities.remove(datasource.entities.getById("pointtest5"));
// change to pulse point
var start = new Cesium.JulianDate();
var mid = Cesium.JulianDate.addSeconds(start, 0.5, new Cesium.JulianDate());
var stop = Cesium.JulianDate.addSeconds(start, 1, new Cesium.JulianDate());

var clock = viewer.clock;
clock.startTime = start;
clock.currentTime = start;
clock.stopTime = stop;
clock.clockRange = Cesium.ClockRange.LOOP_STOP;

var pulseProperty = new Cesium.SampledProperty(Number);
pulseProperty.setInterpolationOptions({
  interpolationDegree: 3,
  interpolationAlgorithm: Cesium.HermitePolynomialApproximation,
});

pulseProperty.addSample(start, 7.0);
pulseProperty.addSample(mid, 15.0);
pulseProperty.addSample(stop, 7.0);

var pointentity = datasource.entities.add({
  id: "pointtest5",
  position: Cesium.Cartesian3.fromDegrees(lon, lat),
  point: {
    pixelSize: pulseProperty,
    color: Cesium.Color.LIME,
  },
});
```

- 改了下模型高度, 并重新适配了行车路径（在`move1`函数中）。

```js
let offset = Cesium.Cartesian3.fromRadians(0, 0, 25);
```

- 调整了下`maximumScreenSpaceError`，不然会偶尔出现[报错](https://community.cesium.com/t/typeerror-failed-to-execute-shadersource-on-webglrenderingcontext-parameter-1-is-not-of-type/5815/1)

```js
var tileSetModel = new Cesium.Cesium3DTileset({
  url: "./Data/scene.json",
  maximumScreenSpaceError: 10,
});
```

- 资源文件上传到了 Cesium ION, 使用方法为：

```js
const tileset = viewer.scene.primitives.add(
  new Cesium.Cesium3DTileset({
    url: Cesium.IonResource.fromAssetId(1667756),
  })
);
```

- ❎ 因为资源添加到了云端，以下代码被*删除*：(后续因为需求离线加回去了)

```js
var tileSetModel = new Cesium.Cesium3DTileset({
  url: "./Data/scene.json",
  maximumScreenSpaceError: 10,
});
tileSetModel.readyPromise
  .then((tileset) => {
    console.log("加载完成");

    let surface = Cesium.Cartesian3.fromRadians(0, 0, 0);
    //模型改变的位置
    let offset = Cesium.Cartesian3.fromRadians(0, 0, 25);
    //定义模型的改变状态
    let translation = Cesium.Cartesian3.subtract(
      offset,
      surface,
      new Cesium.Cartesian3()
    );

    tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
    viewer.scene.primitives.add(tileset);
    viewer.zoomTo(
      tileset,
      new Cesium.HeadingPitchRange(1, -1, tileset.boundingSphere.radius * 1.0)
    );
  })
  .catch(function (error) {
    console.log(error);
  });
```

- 添加波纹效果，[参考](https://juejin.cn/post/7030802698744102942)，实现在`show4`函数中。

- 加入 WebView2 的通信测试示例，[文档](https://learn.microsoft.com/en-us/microsoft-edge/webview2/reference/win32/icorewebview2?view=webview2-1.0.902.49#add_webmessagereceived)

```js
//webview2 transmition test
if (window.chrome.webview) {
  window.chrome.webview.addEventListener("message", (arg) => {
    alert(arg);
    console.log(arg);
  });
  function postMessage() {
    window.chrome.webview.postMessage("hello");
    window.chrome.webview.postMessage("{tester: true}");
  }
  postMessage();
} else {
  console.error("window.chrome.webview is not defined");
}
```

- 集成 `vue-cesium` 包，使用其提供的雷达和波纹控件。

- 修复 gltf 模型缩放大小问题。（更改`minimumPixelSize`和`maximumScale`为`1`）

```js
model: {
  uri: "./assets/car.gltf",
  scale: 1,
  minimumPixelSize: 1,
  maximumScale: 1,
},
```

- 修复 gltf png 文件的引入，参考[vitejs.dev](https://vitejs.dev/guide/assets.html#explicit-url-imports)

- 添加 home 按键，不通过 tileset 聚焦到目标点的坐标。

```js
viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(
    instance.lon - 0.001,
    instance.lat - 0.0025,
    280
  ),
  orientation: {
    heading: Cesium.Math.toRadians(0), // 朝向
    pitch: Cesium.Math.toRadians(-45), // 俯仰
    roll: 0.0, //滚转
  },
  duration: 1,
});
```

- ❎ 去掉删除默认 imageryLayer 的代码。

```js
viewer.imageryLayers.remove(viewer.imageryLayers.get(0));
```

- ❎ 去掉车辆运动中设置`viewer.clock`:

```js
props.instance.viewer.clock.currentTime = Cesium.JulianDate.fromDate(starttime); //修改时间轴的当前时间
props.instance.viewer.clock.stopTime = Cesium.JulianDate.fromDate(stoptime);
props.instance.viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
```

- 添加 Analysis 组件，内有 viewshed。

- 添加 TypeScript 集成。

- 更改右键旋转：

```js
viewer.scene.screenSpaceCameraController.zoomEventTypes = [
  Cesium.CameraEventType.WHEEL,
  Cesium.CameraEventType.PINCH,
];
viewer.scene.screenSpaceCameraController.tiltEventTypes = [
  Cesium.CameraEventType.MIDDLE_DRAG,
  Cesium.CameraEventType.RIGHT_DRAG,
];
```

- 添加`cesium-heatmap-es6`实现热力图效果，代码地址`src/components/Heatmap.vue`。

- 修复 option.assetId 弃用，改用 fromAssetId fromUrl.

```typescript
viewer.imageryLayers.add(
  Cesium.ImageryLayer.fromProviderAsync(
    Cesium.IonImageryProvider.fromAssetId(3954)
  )
);
```

- 常量添加入 constants.ts

- 子组件外套一层 template, v-if 保证子组件在获取到实例对象后加载。

- ❎ 删除车辆运动中无用代码：

```typescript
property.setInterpolationOptions({
  interpolationDegree: 0.0001,
  interpolationAlgorithm: Cesium.LagrangePolynomialApproximation,
});
```

- 代码优化，TS 修复。更新 vue-cesium 到 3.1.8 修复 TS 类型定义问题。去除不需要的包 vite-plugin-cesium。微调 Heatmap.vue。去除无用的 type 定义。

- 阻止相机进入地下

```javascript
viewer.scene.screenSpaceCameraController.enableCollisionDetection = true;
```

- 添加车辆 Label

```js
label: new Cesium.LabelGraphics({
  text: "车辆x",
  verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
  showBackground: true,
  font: "20px sans-serif",
  distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 1000),
  eyeOffset: new Cesium.Cartesian3(0, 20, 0),
}),
```

- 为车辆添加 billboard:

```js
billboard: new Cesium.BillboardGraphics({
  image: pointURL,
  width: 26,
  height: 30,
  verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
  eyeOffset: new Cesium.Cartesian3(0, 5, 0),
}),
```

- 加载后自动关闭 Analyses 组件。

```js
import { ref } from "vue";
import type { VcFabRef } from "node_modules/vue-cesium/es/components/ui";

const analysesRef = ref(null);

function analysesReady() {
  const fabRef: VcFabRef = analysesRef.value.getFabRef();
  fabRef.hide(); // auto hide
}
```

- billboard 属性添加 `scaleByDistance`，使相机靠近时放大图片。

```js
scaleByDistance: new Cesium.NearFarScalar(20, 5, 100, 1), // 近看 scale 5
```

- 添加信号传输图 (OverlayEchart), `src/components/OverlayEchart.vue`

- 添加雨天效果, `src/components/Rainy.vue`

- 添加下雪效果, `src/components/Snow.vue`, 使用`ShaderProgram.js`

- 调整 Overlay 线条与动画速度 (`src/components/OverlayEchart.vue`)

```js
effect: {
  // ...
  symbolSize: [15, 30],
  period: 1, // 动画时间（秒）
},
lineStyle: {
  // ...
  opacity: 1,
},
```

- 自定义 OverlayEchart 信源与链接点：新增 `src/components/OverlayController.vue`，控制数据动态渲染，提供界面操纵按钮。`src/components/OverlayController.vue` 更改，在修改时显示 Label。

- 添加 `src/utils/bridge.ts` 用于对接 C# webview2 接口。

- 修改 `bridge.ts` 函数，新增模拟接口函数，用于模拟实时 GPS 信号传输。添加监听器移除方法。

```ts
import { carMovePath } from "../constants";

interface TData {
  type: string;
  id: string;
  position?: [number, number, number];
}

const closerStack: Function[] = [];

export const removeAllListeners = () => {
  closerStack.map((closer) => {
    closer();
  });
};

function addMockListener(type: string, func: (data: TData) => void) {
  if (type === "EventCarMove") {
    let i = 0;
    const trigger = () => {
      if (i >= carMovePath.length) i = 0;
      func({ type: "EventCarMove", position: carMovePath[i], id: "mockCar" });
      i++;
    };
    trigger();
    const interval = setInterval(trigger, 2000);
    const closer = () => clearInterval(interval);
    closerStack.push(closer);
    return closer;
  }
}

// ...

export const addMessageListener = (
  type: string,
  func: (data: TData) => void
) => {
  if (!window?.chrome?.webview) return addMockListener(type, func);
  // listener function
  function listener({ data }: { data: string }) {
    const message: TData = JSON.parse(data);
    if (message.type === type) {
      func(message);
    }
  }
  window.chrome.webview.addEventListener("message", listener);
  const closer = () =>
    window.chrome.webview.removeEventListener("message", listener);
  closerStack.push(closer);
  return closer;
};
```

- `carMove.ts` 中新增用于对接 webview2 接口的方法：

```ts
interface TSampleData {
  time: number;
  position: [number, number, number];
}

function startObserve(dataSource: Cesium.CustomDataSource) {
  const carSamples: TSampleData[] = [];
  let carEntity: Cesium.Entity = null;
  return addMessageListener("EventCarMove", (data) => {
    carSamples.pop();
    carSamples.push({ time: Date.now() + 2000, position: data.position });
    carSamples.push({ time: Date.now() + 100000, position: data.position }); // holder
    if (carSamples.length > 20) carSamples.shift();
    if (!carEntity) carEntity = carMove(dataSource, carSamples, data.id);
    else {
      // update position
      const property: Cesium.SampledPositionProperty =
        new Cesium.SampledPositionProperty();
      carSamples.forEach((sample: TSampleData) => {
        property.addSample(
          Cesium.JulianDate.fromDate(new Date(sample.time)),
          Cesium.Cartesian3.fromDegrees(...sample.position)
        );
      });
      carEntity.position = property;
      carEntity.orientation = new Cesium.VelocityOrientationProperty(property);
    }
  });
}
```

- 信号热力图闪动效果，更改`Heatmap.vue`，间隔一定时间更新随机值的信源强度。目前只写成随机信源强度，如果之后需要信源位置变化，也可以通过更改传入的位置数据数组实现。

```ts
let timer: NodeJS.Timer;
const cH = ref<Ref>(null);
onMounted(() => {
  initThis(cH);
  console.log("[Heatmap] render heatmap...");
  cH.value = initThis();
  timer = setInterval(() => {
    cH.value.viewer.entities.remove(cH.value.provider);
    cH.value = initThis();
  }, 1500);
});

const initThis = (): CesiumHeatmap => {
  // ...
  data.forEach(function (i) {
    points.push({
      // ...
      value: Math.floor(Math.random() * (100 - 40 + 1)) + 40, // i[2] as value, current all random
    });
  });
};
```

- 调通实时 GPS 运动，支持多个实体/车辆/人员：

```ts
const entityMap = reactive<Map<String, Cesium.Entity>>(new Map([]));
const sampleMap = reactive<Map<String, TSampleData[]>>(new Map([]));

function startObserve(dataSource: Cesium.CustomDataSource) {
  return addMessageListener("EventCarMove", (data: TData): void => {
    const carSamples = sampleMap.get(data.id) || [];
    carSamples.pop();
    carSamples.push({ time: Date.now() + 2000, position: data.position });
    carSamples.push({ time: Date.now() + 100000, position: data.position }); // holder
    if (carSamples.length > 20) carSamples.shift();
    if (!entityMap.has(data.id)) {
      const carEntity = carMove(dataSource, carSamples, data);
      entityMap.set(data.id, carEntity);
    } else {
      const carEntity: Cesium.Entity = entityMap.get(data.id);
      // update position
      const property: Cesium.SampledPositionProperty =
        new Cesium.SampledPositionProperty();
      carSamples.forEach((sample: TSampleData) => {
        property.addSample(
          Cesium.JulianDate.fromDate(new Date(sample.time)),
          Cesium.Cartesian3.fromDegrees(...sample.position)
        );
      });
      carEntity.position = property;
      carEntity.orientation = new Cesium.VelocityOrientationProperty(property);
    }
    sampleMap.set(data.id, carSamples);
  });
}
```

- 修改 `carMvoe.ts`，实现模型贴地（贴 3D Tiles）。使用 `viewer.scene.clampToHeight` 方法。

```ts
interface TSampleData {
  time: number;
  position: Cesium.Cartesian3;
}

function startObserve(dataSource: Cesium.CustomDataSource) {
  // ...
  const clamp = window.viewer.scene.clampToHeight(
    Cesium.Cartesian3.fromDegrees(...data.position),
    entityMap.values()
  );
  // ...
  carSamples.push({ time: Date.now() + 2000, position: clamp });
  carSamples.push({ time: Date.now() + 60000, position: clamp }); // 1 min holder
  // ...
  carSamples.forEach((sample: TSampleData) => {
    property.addSample(
      Cesium.JulianDate.fromDate(new Date(sample.time)),
      sample.position
    );
  });
}
// ...
const carMove = (
  dataSource: Cesium.CustomDataSource,
  carSamples: TSampleData[],
  data: TData
): Cesium.Entity => {
  // ...
  carSamples.forEach((sample: TSampleData) => {
    property.addSample(
      Cesium.JulianDate.fromDate(new Date(sample.time)),
      sample.position
    );
  });
  // ...
};
```

> 之后更改日志将写入 https://www.kdocs.cn/l/cpgbVweGQJkl
