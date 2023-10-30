<script setup lang="ts">
import { ref, onMounted, reactive } from "vue";
import { IonToken, initialPosition, localTileset } from "./constants";
import Controller from "./components/Controller.vue";
import localCarMoveController from "./components/localCarMoveController.vue";
import Analysis from "./components/Analysis.vue";
import type { VcReadyObject } from "node_modules/vue-cesium/es/utils/types";
import type { TInstance } from "types/env";
// import OverlayController from "./components/OverlayController.vue";
import { postMessage } from "./utils/bridge";
import {
  load_overlay_data,
  load_heatmap_data,
  load_pluse_data,
  load_radar_data,
} from "./components/process_data";

const instance = reactive<TInstance>({
  Cesium: null,
  viewer: null,
  lon: initialPosition.lon,
  lat: initialPosition.lat,
});

const viewerRef = ref(null);
const viewerReady = ref(false);

onMounted(async () => {
  const readyObj: VcReadyObject = await viewerRef.value.creatingPromise;
  const Cesium = readyObj.Cesium;
  const viewer = readyObj.viewer;
  window.viewer = viewer; // add global variable
  Cesium.Ion.defaultAccessToken = IonToken;
  // 使实体贴合到地表,否则会陷入地下
  viewer.scene.globe.depthTestAgainstTerrain = true;
  // 阻止相机进入地下
  viewer.scene.screenSpaceCameraController.enableCollisionDetection = true;
  // Add Sentinel-2 imagery from ION assets
  viewer.imageryLayers.add(
    Cesium.ImageryLayer.fromProviderAsync(
      Cesium.IonImageryProvider.fromAssetId(3954, {}),
      {}
    )
  );
  viewer.scene.globe.enableLighting = true;
  viewer.clock.shouldAnimate = true; // enable animation
  // 更改右键旋转
  viewer.scene.screenSpaceCameraController.zoomEventTypes = [
    Cesium.CameraEventType.WHEEL,
    Cesium.CameraEventType.PINCH,
  ];
  viewer.scene.screenSpaceCameraController.tiltEventTypes = [
    Cesium.CameraEventType.MIDDLE_DRAG,
    Cesium.CameraEventType.RIGHT_DRAG,
  ];

  const imageryProvider = new Cesium.UrlTemplateImageryProvider({
    url: "../Tiles/{z}/{x}/{y}.jpg", // 设置瓦片的URL模板
    tilingScheme: new Cesium.WebMercatorTilingScheme(), // 使用Web墨卡托投影坐标系
    maximumLevel: 19, // 设置最大层级
  });
  imageryProvider.errorEvent.addEventListener((_) => {});
  // viewer.imageryLayers.addImageryProvider(imageryProvider);
  viewer.imageryLayers.addImageryProvider(Cesium.createWorldImagery());

  // start to load tileset
  let tileset: Cesium.Cesium3DTileset;
  try {
    // tileset = await Cesium.Cesium3DTileset.fromUrl(localTileset, {});
    tileset = await Cesium.Cesium3DTileset.fromUrl(
      ".//zhijiang2/tileset.json",
      {}
    );
  } catch (_) {
    tileset = await Cesium.Cesium3DTileset.fromIonAssetId(1667756, {});
  } finally {
    var cartographic = Cesium.Cartographic.fromCartesian(
      tileset.boundingSphere.center
    );
    //根据经纬度和高度0，得到地面笛卡尔坐标
    var surface = Cesium.Cartesian3.fromRadians(
      cartographic.longitude,
      cartographic.latitude,
      cartographic.height
    );
    //根据经纬度和需要的高度，得到偏移后的笛卡尔坐标
    // var offset = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 60);
    var offset = Cesium.Cartesian3.fromRadians(
      cartographic.longitude,
      cartographic.latitude,
      0
    );
    //计算坐标变换，得到新的笛卡尔坐标
    var translation = Cesium.Cartesian3.subtract(
      offset,
      surface,
      new Cesium.Cartesian3()
    );
    //调整3dtiles位置
    tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);

    viewer.scene.primitives.add(tileset);
    viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0, -0.7, 300));
  }
  // click handler
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas); //鼠标事件
  handler.setInputAction(function (movement) {
    const pick = viewer.scene.pick(movement.position);
    if (pick && pick.id) {
      // Entity as pick.id
      console.debug("[Debug] Entity Pick:", pick.id._id);
      postMessage(JSON.stringify({ type: "entity_click", id: pick.id._id }));
    }
    const ray = viewer.camera.getPickRay(movement.position); // 表示从提供的原点沿提供的方向无限延伸的射线。
    if (!ray) return;
    const position = viewer.scene.globe.pick(ray, viewer.scene); //转化为世界坐标（笛卡尔坐标系）
    if (!position) return;
    const cartographic =
      Cesium.Ellipsoid.WGS84.cartesianToCartographic(position); //世界坐标转弧度坐标
    instance.lon = Cesium.Math.toDegrees(cartographic.longitude); //弧度转经度
    instance.lat = Cesium.Math.toDegrees(cartographic.latitude); //经纬度转弧度
    window.lastPosition = [instance.lon, instance.lat]; // 记录点击位置坐标
    document.getElementById("div_1").innerText = instance.lon.toString();
    document.getElementById("div_2").innerText = instance.lat.toString();
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK); //左击触发
  // bind vue props
  instance.Cesium = Cesium;
  instance.viewer = viewer;
  // 保证子组件可以拿到实体对象
  viewerReady.value = true;
});

//载入数据
load_overlay_data();
load_heatmap_data();
load_pluse_data();
load_radar_data();
</script>

<template>
  <vc-viewer ref="viewerRef" :selection-indicator="true" :info-box="true">
    <template v-if="viewerReady">
      <Controller :instance="instance"></Controller>
      <Analysis></Analysis>
      <div id="div_1"></div>
      <div id="div_2"></div>
      <localCarMoveController :instance="instance"></localCarMoveController>
      <!-- <OverlayController :instance="instance"></OverlayController> -->
    </template>
  </vc-viewer>
</template>
