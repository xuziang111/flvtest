<script setup lang="ts">
import useVueCesium from "../../node_modules/vue-cesium/es/composables/use-vue-cesium";
import type { VcViewerProvider } from "node_modules/vue-cesium/es/utils/types";
import { reactive, ref, onUnmounted } from "vue";
import {
  local_startObserve,
  local_focusOn,
  carplace1,
  carplace2,
  deletecar,
} from "./localCarMove";
import {
  firsttime,
  movetime1,
  movespeed1,
  showcar1,
  getname1,
} from "../utils/local_bridge";
import { localMovePath } from "../constants";

let check = 0;
function check_first() {
  if (check == 0) {
    local_carkey();
    local_startObserve(dataSource);
    local_focusOn();
    check = 1;
  }
}

const showController = ref(false);
function toggleController() {
  showController.value = !showController.value;
}

const showCardata = ref(false);
function toggleCardata() {
  showCardata.value = true;
}

function toggleCardatafalse() {
  showCardata.value = false;
}

let local_car = ref(false);
function local_carkey() {
  local_car.value = !local_car.value;
}

let show1 = ref(false);
function show_1() {
  show1.value = true;
}

function show_1false() {
  show1.value = false;
}

const vc: VcViewerProvider = useVueCesium();

const { Cesium, viewer } = vc;

// custom dataSource for entities
const dataSource = new Cesium.CustomDataSource("customDataSource");
viewer.dataSources.add(dataSource);

function get_value1() {
  var selectedFile = (document.getElementById("name1") as HTMLInputElement)
    .files[0];
  var reader = new FileReader(); //这里是核心！！！读取操作就是由它完成的。
  reader.readAsText(selectedFile); //读取文件的内容
  reader.onload = function () {
    // console.log("读取结果：", this.result); //当读取完成之后会回调这个函数，然后此时文件的内容存储到了result中。直接操作即可。

    //      console.log("读取结果转为JSON：");
    let json = JSON.parse(this.result as string);
    //      console.log(json.name);
    //      console.log(json.age);
    if (localMovePath.length != 0) {
      deletecar(localMovePath[0].id);
    }
    localMovePath.splice(0, localMovePath.length);
    for (let i = 0; i < json.length; i++) {
      localMovePath.push({
        type: json[i].type,
        id: json[i].id,
        position: json[i].position,
        time: json[i].time,
        speed: json[i].speed,
      });
    }
  };
}

function delectALL() {
  if (localMovePath.length != 0) {
    deletecar(localMovePath[0].id);
    localMovePath.splice(0, localMovePath.length);
  }
  show_1false();
  toggleCardatafalse();
  (document.getElementById("name1") as HTMLInputElement).value = null;
}
</script>

<template>
  <div id="showcontroller2" v-if="!showController">
    <button id="button_style2" type="button" @click="toggleController()">
      &lt;
    </button>
  </div>

  <div id="hidecontroller2" v-if="showController">
    <button id="button_style2" type="button" @click="toggleController()">
      >
    </button>
  </div>
  <div id="local_style" v-if="showController">
    <ul>
      <li>
        <input
          type="file"
          id="name1"
          @change="
            get_value1();
            toggleCardata();
            show_1false();
          "
        /><button
          v-if="showCardata"
          type="button"
          @click="
            show_1();
            showcar1();
            check_first();
          "
        >
          运行
        </button>
        <button v-if="showCardata" type="button" @click="delectALL()">
          清除
        </button>
      </li>
      <li v-if="show1">车辆名称：{{ localMovePath[0].id }}</li>
      <li v-if="show1">
        当前位置：{{ carplace1(localMovePath[0].id) }}&nbsp;&nbsp;{{
          carplace2(localMovePath[0].id)
        }}
      </li>
      <li v-if="show1">出发时间：{{ firsttime(getname1()) }}</li>
      <li v-if="show1">结束时间：{{ movetime1() }}</li>
      <li v-if="show1">当前速度：{{ movespeed1() }}</li>
    </ul>
    <!-- <button
      v-if="!showCardata"
      id="button_style4"
      @click="
        toggleCardata();
        get_value1();
      "
    >
      获取数据
    </button> -->
  </div>
</template>

<style></style>
