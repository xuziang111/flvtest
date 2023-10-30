<script setup lang="ts">
import { onMounted, onUnmounted, nextTick, ref, reactive } from "vue";
import { CesiumHeatmap, type HeatmapPoint } from "cesium-heatmap-es6";
import type { Ref } from "vue";
import { heatmapPosition } from "../constants";
import type { TInstance } from "types/env";

const props = defineProps<{
  instance: TInstance;
}>();

// 默认热力图参数
const defaultObj = reactive({
  data: [0, 100],
  opacity: 0.55,
  radius: [100, 125, 150, 175, 200],
  gradient: {
    ".05": "#5ca6e2",
    ".33": "green",
    ".5": "yellow",
    ".77": "red",
  },
});

// @ts-ignore ! overwrite CesiumHeatmap.getBounds(this.initOptions.points)
CesiumHeatmap.prototype.getBounds = function (points: HeatmapPoint[]) {
  if (!points) return [0, 0, 0, 0];
  let lonMin = 180;
  let lonMax = -180;
  let latMin = 90;
  let latMax = -180;
  points.forEach(function (point) {
    const { x: longitude, y: latitude } = point;
    lonMin = longitude < lonMin ? longitude : lonMin;
    latMin = latitude < latMin ? latitude : latMin;
    lonMax = longitude > lonMax ? longitude : lonMax;
    latMax = latitude > latMax ? latitude : latMax;
  });
  const xRange = lonMax - lonMin > 0.002 ? lonMax - lonMin : 0.002;
  const yRange = latMax - latMin > 0.002 ? latMax - latMin : 0.002;

  return [
    lonMin - xRange / 2,
    latMin - yRange / 2,
    lonMax + xRange / 2,
    latMax + yRange / 2,
  ];
};
let timer: NodeJS.Timer;
const cH = ref<Ref | null>(null);
const oldCH = ref<CesiumHeatmap | null>(null);

onMounted(() => {
  console.log("[Heatmap] render heatmap...");
  cH.value = initThis();
  let index = 0;
  timer = setInterval(() => {
    cH.value.viewer.entities.remove(cH.value.provider);
    oldCH.value = cH.value;
    index += 1;
    if (index >= defaultObj.radius.length) index = 0;
    cH.value = initThis(defaultObj.radius[index]);
    nextTick(() => {
      if (oldCH.value) {
        // oldCH.value.hide(); // 隐藏旧的热力图对象
        oldCH.value.remove(); // 移除旧的热力图对象
        oldCH.value = null;
      }
    });
  }, 2000);
});
// let timer: NodeJS.Timer;
// const cH = ref<Ref>(null);

// onMounted(() => {
//   console.log("[Heatmap] render heatmap...");
//   cH.value = initThis();
//   timer = setInterval(() => {
//     cH.value.viewer.entities.remove(cH.value.provider);
//     cH.value = initThis();
//   }, 1500);
// });

const initThis = (radius = 200): CesiumHeatmap => {
  const points: HeatmapPoint[] = [];
  const data = heatmapPosition; // 导入constants
  data.forEach(function (i) {
    points.push({
      x: i.position[0],
      y: i.position[1],
      value: Math.floor(Math.random() * (100 - 40 + 1)) + 40, // i[2] as value, current all random
    });
  });
  return new CesiumHeatmap(window.viewer, {
    points,
    renderType: "entity", // 渲染实体,primitive报错,imagery会被模型覆盖
    heatmapDataOptions: {
      max: defaultObj.data[1],
      min: defaultObj.data[0],
    },
    heatmapOptions: {
      radius: radius,
      opacity: defaultObj.opacity,
      gradient: defaultObj.gradient,
      useLocalExtrema: true,
    },
  });
};

onUnmounted(() => {
  // 重写 CesiumHeatmap.prototype.remove
  clearInterval(timer);
  document.body.removeChild(cH.value.element);
  cH.value.viewer.entities.remove(cH.value.provider);
});
</script>

<template>
  <div style="display: none"></div>
</template>
