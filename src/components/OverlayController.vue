<script setup lang="ts">
import { reactive, ref, onUnmounted } from "vue";
import OverlayEchart from "./OverlayEchart.vue";
import { overlayData, overlaySetup } from "../constants";
import type { TInstance } from "types/env";

const props = defineProps<{
  instance: TInstance;
}>();

const datas = reactive(overlayData);
const editing = ref(false);
const selected = ref("Center");

const lastPosition = {
  lon: props.instance.lon,
  lat: props.instance.lat,
};

let count = 0;

function handleBodyClick() {
  if (
    lastPosition.lon === props.instance.lon &&
    lastPosition.lat === props.instance.lat
  ) {
    return; // return if unchanged
  }
  lastPosition.lon = props.instance.lon;
  lastPosition.lat = props.instance.lat;
  datas.push({
    level: 1,
    symbol: overlaySetup.stationSymbol,
    name: `temp${count++}`,
    value: [props.instance.lon, props.instance.lat],
    belong: selected.value,
  });
}

async function toggleEdit() {
  editing.value = !editing.value;
  if (editing.value) {
    document.body.addEventListener("click", handleBodyClick);
  } else {
    document.body.removeEventListener("click", handleBodyClick);
  }
}

function handleDelete() {
  const index = datas.findIndex((item) => item.name === selected.value);
  datas.splice(index, 1);
}

onUnmounted(() => {
  document.body.removeEventListener("click", handleBodyClick);
});
</script>

<template>
  <div
    class="overlay-controller"
    @click="
      ($event) => {
        $event.stopPropagation();
      }
    "
  >
    <button @click="toggleEdit()">切换编辑</button>
    <div v-if="editing">
      <select name="target" id="target" v-model="selected">
        <option v-for="i in datas" :key="i.name" :value="i.name">
          {{ i.name }}
        </option>
      </select>
      <button @click="handleDelete()">删除选中</button>
    </div>
  </div>
  <OverlayEchart
    :datas="datas"
    :editing="editing"
    :key="`${datas.length}-${editing}`"
  />
</template>

<style>
.overlay-controller {
  position: absolute;
  right: 0;
  top: 0;
  background-color: transparent;
  display: flex;
  flex-direction: column;
}
</style>
