<script setup lang="ts">
import { ref, reactive, onUnmounted } from "vue";
import useVueCesium from "../../node_modules/vue-cesium/es/composables/use-vue-cesium";
import type { VcViewerProvider } from "node_modules/vue-cesium/es/utils/types";
import Heatmap from "./Heatmap.vue";
import Rainy from "./Rainy.vue";
import Snow from "./Snow.vue";
import Sunny from "./Sunny.vue";
import { initialPosition } from "../constants";
import carURL from "../../assets/car.glb?url";
import picURL from "../../assets/tag.png?url";
import type { TInstance } from "types/env";
import { removeAllListeners } from "../utils/bridge";
import {
  startObserve,
  focusOn,
  showradar,
  carshow,
  car_false,
  saveHandler,
  startrecord,
  modify_name,
  carplace1,
  carplace2,
  getid,
  deleteCar,
  carspeed,
} from "./carMove";

import {
  startObservePeople,
  focusOnPeople,
  peopleshow,
  people_false,
  savepeopleHandler,
  startpeoplerecord,
  modify_personName,
  personplace1,
  personplace2,
  getpeopleid,
  deletePerson,
  personspeed,
} from "./peopleMove";
//合并OverlayController
import OverlayEchart from "./OverlayEchart.vue";
import {
  overlayData,
  overlaySetup,
  plusePosition,
  heatmapPosition,
  pluseColdr,
  carIdlist,
  radarPosition,
  radarSize,
  radarColdr,
  personIdlist,
  DELpersonIdlist,
  DELcarIdlist,
} from "../constants";

const props = defineProps<{
  instance: TInstance;
}>();

// 节点部分
const overlaydatas = reactive(overlayData);
overlayData.splice(0, 5);
const overlayediting = ref(false);
let overlayselected = "节点1";

const lastPosition = {
  lon: props.instance.lon,
  lat: props.instance.lat,
};

let overlaycount = overlaydatas.length + 1;

function handleBodyClick() {
  if (
    lastPosition.lon === props.instance.lon &&
    lastPosition.lat === props.instance.lat
  ) {
    return; // return if unchanged
  }
  lastPosition.lon = props.instance.lon;
  lastPosition.lat = props.instance.lat;
  overlaydatas.push({
    level: 1,
    symbol: overlaySetup.stationSymbol,
    name: `节点${overlaycount++}`,
    value: [props.instance.lon, props.instance.lat],
    belong: overlayselected,
  });
  showoverlay.value = true;
  if_show();
  if (overlaydatas.length == 1) {
    overlayselected = overlaydatas[0].name;
  }
}

async function toggleEdit() {
  overlayediting.value = !overlayediting.value;
  if (overlaydatas.length != 0) {
    overlayselected = overlaydatas[0].name;
  }
  heatmapediting_false();
  pluseediting_false();
  radarediting_false();
  Dropdown_false();
  Dropdown1_false();
  if (overlayediting.value) {
    document.body.addEventListener("click", handleBodyClick);
    document.body.removeEventListener("click", heatmapClick);
    document.body.removeEventListener("click", pluseClick);
    document.body.removeEventListener("click", radarClick);
  } else {
    document.body.removeEventListener("click", handleBodyClick);
  }
}

function handleDelete() {
  if (overlaydatas.length == 1) {
    overlaydatas.splice(0, overlaydatas.length);
    overlaycount = overlaydatas.length + 1;
    showoverlay.value = false;
  }
  const index = overlaydatas.findIndex((item) => item.name === overlayselected);
  overlaydatas.splice(index, 1);
  if (overlaydatas.length != 0) {
    overlayselected = overlaydatas[0].name;
    overlayselected = "节点1";
  }
  if_show();
}

// 信源图部分
const heatmapdatas = reactive(heatmapPosition);
heatmapPosition.splice(0, 5);
const heatmapediting = ref(false);
let heatmapselected = "信源1";

let heatmapcount = heatmapdatas.length + 1;
let heatmapcount2 = heatmapdatas.length + 1;

function heatmapClick() {
  if (
    lastPosition.lon === props.instance.lon &&
    lastPosition.lat === props.instance.lat
  ) {
    return; // return if unchanged
  }
  lastPosition.lon = props.instance.lon;
  lastPosition.lat = props.instance.lat;
  heatmapdatas.push({
    name: `信源${heatmapcount++}`,
    position: [props.instance.lon, props.instance.lat],
  });
  showHeatmap.value = true;
  if_show();
  if (heatmapdatas.length != 0) {
    heatmapselected = heatmapdatas[0].name;
  }
}

async function toggleheatmapEdit() {
  heatmapediting.value = !heatmapediting.value;
  if (heatmapdatas.length != 0) {
    heatmapselected = heatmapdatas[0].name;
  }
  // overlayediting.value = false;
  // pluseediting.value = false;
  overlayediting_false();
  pluseediting_false();
  radarediting_false();
  Dropdown_false();
  Dropdown1_false();
  if (heatmapediting.value) {
    document.body.addEventListener("click", heatmapClick);
    document.body.removeEventListener("click", handleBodyClick);
    document.body.removeEventListener("click", pluseClick);
    document.body.removeEventListener("click", radarClick);
  } else {
    document.body.removeEventListener("click", heatmapClick);
  }
  if (heatmapcount == 1) {
    showHeatmap.value = false;
    // heatmapdatas.splice(0, 5);
  }
}

function heatmapDelete() {
  if (heatmapdatas.length === 1) {
    showHeatmap.value = false;
    heatmapdatas.splice(0, heatmapdatas.length);
    heatmapcount = heatmapdatas.length + 1;
    heatmapcount2 = heatmapdatas.length + 1;
    overlayselected = "信源1";
    return;
  }
  if (heatmapdatas.length === 0) {
    return; // 如果为空，直接退出函数
  }
  const index = heatmapdatas.findIndex((item) => item.name === heatmapselected);
  heatmapcount2++;
  // if (heatmapcount == heatmapcount2) {
  //   showHeatmap.value = false;
  // } else {
  //   showHeatmap.value = true;
  // }
  heatmapdatas.splice(index, 1);
  if (heatmapdatas.length != 0) {
    heatmapselected = heatmapdatas[0].name;
  }
  if_show();
}

// 雷达部分
const radardatas = reactive(radarPosition);
radardatas.splice(0, 1);
const radarediting = ref(false);
let radarselected = "雷达1";
let radar_size = "小";
let radar_color = "蓝色";

let radarcount = radardatas.length + 1;

function radarClick() {
  if (
    lastPosition.lon === props.instance.lon &&
    lastPosition.lat === props.instance.lat
  ) {
    return; // return if unchanged
  }
  lastPosition.lon = props.instance.lon;
  lastPosition.lat = props.instance.lat;
  if (radar_color == "蓝色") {
    if (radar_size == "小") {
      radardatas.push({
        show: true,
        name: `雷达${radarcount++}`,
        position: [props.instance.lon, props.instance.lat],
        radius: 7,
        interval: 1500,
        color: [110, 221, 195, 255],
      });
    }
    if (radar_size == "中") {
      radardatas.push({
        show: true,
        name: `雷达${radarcount++}`,
        position: [props.instance.lon, props.instance.lat],
        radius: 14,
        interval: 1500,
        color: [110, 221, 195, 255],
      });
    }
    if (radar_size == "大") {
      radardatas.push({
        show: true,
        name: `雷达${radarcount++}`,
        position: [props.instance.lon, props.instance.lat],
        radius: 21,
        interval: 1500,
        color: [110, 221, 195, 255],
      });
    }
  }

  if (radar_color == "绿色") {
    if (radar_size == "小") {
      radardatas.push({
        show: true,
        name: `雷达${radarcount++}`,
        position: [props.instance.lon, props.instance.lat],
        radius: 7,
        interval: 1500,
        color: [80, 200, 120, 255],
      });
    }
    if (radar_size == "中") {
      radardatas.push({
        show: true,
        name: `雷达${radarcount++}`,
        position: [props.instance.lon, props.instance.lat],
        radius: 14,
        interval: 1500,
        color: [80, 200, 120, 255],
      });
    }
    if (radar_size == "大") {
      radardatas.push({
        show: true,
        name: `雷达${radarcount++}`,
        position: [props.instance.lon, props.instance.lat],
        radius: 21,
        interval: 1500,
        color: [80, 200, 120, 255],
      });
    }
  }

  if (radar_color == "黄色") {
    if (radar_size == "小") {
      radardatas.push({
        show: true,
        name: `雷达${radarcount++}`,
        position: [props.instance.lon, props.instance.lat],
        radius: 7,
        interval: 1500,
        color: [225, 225, 106, 255],
      });
    }
    if (radar_size == "中") {
      radardatas.push({
        show: true,
        name: `雷达${radarcount++}`,
        position: [props.instance.lon, props.instance.lat],
        radius: 14,
        interval: 1500,
        color: [225, 225, 106, 255],
      });
    }
    if (radar_size == "大") {
      radardatas.push({
        show: true,
        name: `雷达${radarcount++}`,
        position: [props.instance.lon, props.instance.lat],
        radius: 21,
        interval: 1500,
        color: [225, 225, 106, 255],
      });
    }
  }

  show_radar.value = true;
  if_show();
  if (radardatas.length != 0) {
    radarselected = radardatas[0].name;
  }
}

async function toggleradarEdit() {
  radarediting.value = !radarediting.value;
  if (radardatas.length != 0) {
    radarselected = radardatas[0].name;
  }
  // heatmapediting.value = false;
  // overlayediting.value = false;
  heatmapediting_false();
  overlayediting_false();
  pluseediting_false();
  Dropdown_false();
  Dropdown1_false();
  if (radarediting.value) {
    document.body.addEventListener("click", radarClick);
    document.body.removeEventListener("click", handleBodyClick);
    document.body.removeEventListener("click", heatmapClick);
    document.body.removeEventListener("click", pluseClick);
  } else {
    document.body.removeEventListener("click", radarClick);
  }
}

function radarDelete() {
  if (radardatas.length == 1) {
    radardatas.splice(0, radardatas.length);
    radarcount = radardatas.length + 1;
    show_radar.value = false;
  }
  const index = radardatas.findIndex((item) => item.name === radarselected);
  radardatas.splice(index, 1);
  if (radardatas.length != 0) {
    radarselected = radardatas[0].name;
  }
  if_show();
}

// 波纹部分
const plusedatas = reactive(plusePosition);
plusedatas.splice(0, 1);
const pluseediting = ref(false);
let pluseselected = "波纹1";
let pluse_color = "黄色";

let plusecount = plusedatas.length + 1;

function pluseClick() {
  if (
    lastPosition.lon === props.instance.lon &&
    lastPosition.lat === props.instance.lat
  ) {
    return; // return if unchanged
  }
  lastPosition.lon = props.instance.lon;
  lastPosition.lat = props.instance.lat;
  if (pluse_color == "黄色") {
    plusedatas.push({
      show: true,
      name: `波纹${plusecount++}`,
      position: [props.instance.lon, props.instance.lat],
      radius: 6,
      interval: 1500,
      color: [225, 225, 106, 255],
    });
  }
  if (pluse_color == "蓝色") {
    plusedatas.push({
      show: true,
      name: `波纹${plusecount++}`,
      position: [props.instance.lon, props.instance.lat],
      radius: 6,
      interval: 1500,
      color: [0, 0, 255, 255],
    });
  }
  if (pluse_color == "红色") {
    plusedatas.push({
      show: true,
      name: `波纹${plusecount++}`,
      position: [props.instance.lon, props.instance.lat],
      radius: 6,
      interval: 1500,
      color: [139, 0, 0, 255],
    });
  }
  if (pluse_color == "紫色") {
    plusedatas.push({
      show: true,
      name: `波纹${plusecount++}`,
      position: [props.instance.lon, props.instance.lat],
      radius: 6,
      interval: 1500,
      color: [81, 40, 136, 255],
    });
  }
  if (pluse_color == "白色") {
    plusedatas.push({
      show: true,
      name: `波纹${plusecount++}`,
      position: [props.instance.lon, props.instance.lat],
      radius: 6,
      interval: 1500,
      color: [255, 255, 255, 255],
    });
  }
  showpluse.value = true;
  if_show();
  if (plusedatas.length != 0) {
    pluseselected = plusedatas[0].name;
  }
}

async function togglepluseEdit() {
  pluseediting.value = !pluseediting.value;
  if (plusedatas.length != 0) {
    pluseselected = plusedatas[0].name;
  }
  // heatmapediting.value = false;
  // overlayediting.value = false;
  heatmapediting_false();
  overlayediting_false();
  radarediting_false();
  Dropdown_false();
  Dropdown1_false();
  if (pluseediting.value) {
    document.body.addEventListener("click", pluseClick);
    document.body.removeEventListener("click", handleBodyClick);
    document.body.removeEventListener("click", heatmapClick);
    document.body.removeEventListener("click", radarClick);
  } else {
    document.body.removeEventListener("click", pluseClick);
  }
}

function pluseDelete() {
  if (plusedatas.length == 1) {
    plusedatas.splice(0, plusedatas.length);
    plusecount = plusedatas.length + 1;
    showpluse.value = false;
  }
  const index = plusedatas.findIndex((item) => item.name === pluseselected);
  plusedatas.splice(index, 1);
  if (plusedatas.length != 0) {
    pluseselected = plusedatas[0].name;
  }
  if_show();
}

function pluseediting_false() {
  pluseediting.value = false;
  document.body.removeEventListener("click", pluseClick);
}

function radarediting_false() {
  radarediting.value = false;
  document.body.removeEventListener("click", radarClick);
}

function heatmapediting_false() {
  heatmapediting.value = false;
  document.body.removeEventListener("click", handleBodyClick);
}

function overlayediting_false() {
  overlayediting.value = false;
  document.body.removeEventListener("click", heatmapClick);
}

const vc: VcViewerProvider = useVueCesium();

const { Cesium, viewer } = vc;

// custom dataSource for entities
const dataSource = new Cesium.CustomDataSource("customDataSource");
viewer.dataSources.add(dataSource);

startObserve(dataSource);
focusOn();

startObservePeople(dataSource);
focusOnPeople();

function home() {
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(
      initialPosition.lon - 0.001,
      initialPosition.lat - 0.0025,
      280
    ),
    orientation: {
      heading: Cesium.Math.toRadians(0), // 朝向
      pitch: Cesium.Math.toRadians(-45), // 俯仰
      roll: 0.0, //滚转
    },
    duration: 1,
  });
}

let pointcount = 1;

function showPoint() {
  dataSource.entities.add({
    id: `point-${pointcount++}`,
    position: Cesium.Cartesian3.fromDegrees(
      props.instance.lon,
      props.instance.lat,
      10
    ),
    point: {
      pixelSize: 10,
      color: Cesium.Color.YELLOW,
      outlineColor: Cesium.Color.RED,
      outlineWidth: 2,
    },
  });
}

let piccount = 1;

function showPic() {
  dataSource.entities.add({
    id: `pic-${piccount++}`,
    position: Cesium.Cartesian3.fromDegrees(
      props.instance.lon,
      props.instance.lat,
      50
    ),
    billboard: {
      image: picURL,
      scale: 0.5,
      pixelOffset: new Cesium.Cartesian2(0, -120),
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    },
  });
}

let carcount = 1;

function showCar() {
  dataSource.entities.add({
    id: `car-${carcount++}`,
    position: Cesium.Cartesian3.fromDegrees(
      props.instance.lon,
      props.instance.lat,
      8
    ),
    model: {
      uri: carURL,
      scale: 1,
      minimumPixelSize: 1,
      maximumScale: 1,
    },
  });
}

function showRadar() {
  options1.position = [props.instance.lon, props.instance.lat];
  options1.show = true;
}

const showRain = ref(false);
const showSnow = ref(false);
const showSunny = ref(false);

// 统一的函数用于切换天气状态
function toggleWeather(weatherType) {
  switch (weatherType) {
    case "rain":
      showRain.value = !showRain.value;
      // 如果出太阳，则关闭下雪功能
      if (showSunny.value) {
        showSunny.value = false;
      }
      break;
    case "snow":
      showSnow.value = !showSnow.value;
      // 如果出太阳，则关闭下雨功能
      if (showSunny.value) {
        showSunny.value = false;
      }
      break;
    case "sunny":
      showSunny.value = !showSunny.value;
      // 如果出太阳，则关闭下雨和下雪功能
      if (showSunny.value) {
        showRain.value = false;
        showSnow.value = false;
      }
      break;
    default:
      // 默认情况下关闭所有天气
      showRain.value = false;
      showSnow.value = false;
      showSunny.value = false;
      break;
  }
}

const showController = ref(false);
function toggleController() {
  showController.value = !showController.value;
}

const showController1 = ref(false);
function toggleController1() {
  showController1.value = !showController1.value;
  get_value();
}

let radar = ref(false);
function radarkey() {
  radar.value = !radar.value;
}

let local_radar = ref(false);
function local_radarkey() {
  local_radar.value = !local_radar.value;
}

let car = ref(false);
function carkey() {
  car.value = !car.value;
}

let local_car = ref(false);
function local_carkey() {
  local_car.value = !local_car.value;
}

const people = ref(false);
function peoplekey() {
  people.value = !people.value;
}

const showpeople = ref(true);
function people_show() {
  showpeople.value = !showpeople.value;
}

const showcar = ref(true);
function car_show() {
  showcar.value = !showcar.value;
}

const radarbutton = ref(false);
function showradarbutton() {
  radarbutton.value = !radarbutton.value;
}

let choose = 0;

let dataname = "";

let carId_list = "";

let clicknum = 0;
const car_select = ref(false);
function showcar_select() {
  if (carIdlist.length == 0) {
    return;
  }
  car_select.value = !car_select.value;
  if (clicknum == 0) {
    carId_list = carIdlist[0].name;
    clicknum++;
  }
}

let personId_list = "";

let clicknum1 = 0;
const people_select = ref(false);
function showpeople_select() {
  if (personIdlist.length == 0) {
    return;
  }
  people_select.value = !people_select.value;
  if (clicknum1 == 0) {
    personId_list = personIdlist[0].name;
    clicknum1++;
  }
}

function showcar_select_false() {
  car_select.value = false;
}

function showpeople_select_false() {
  people_select.value = false;
}

const local_radarbutton = ref(false);
function local_showradarbutton() {
  local_radarbutton.value = !local_radarbutton.value;
}

function deleteEntities() {
  for (let i = 1; i < pointcount; i++) {
    dataSource.entities.removeById(`point-${i}`);
  }
  pointcount = 1;
  for (let i = 1; i < piccount; i++) {
    dataSource.entities.removeById(`pic-${i}`);
  }
  piccount = 1;
  for (let i = 1; i < carcount; i++) {
    dataSource.entities.removeById(`car-${i}`);
  }
  carcount = 1;

  showHeatmap.value = false;
  heatmapdatas.splice(0, heatmapdatas.length);
  heatmapcount = heatmapdatas.length + 1;
  heatmapcount2 = heatmapdatas.length + 1;
  overlayselected = "信源1";

  plusedatas.splice(0, plusedatas.length);
  plusecount = plusedatas.length + 1;
  pluseselected = "波纹1";

  overlaydatas.splice(0, overlaydatas.length);
  overlaycount = overlaydatas.length + 1;
  overlayselected = "节点1";

  radardatas.splice(0, radardatas.length);
  radarcount = radardatas.length + 1;
  radarselected = "雷达1";

  showRain.value = false;
  showSnow.value = false;
  showSunny.value = false;

  // car_false();
  radar.value = false;
  radarbutton.value = false;
  car_select.value = false;

  // people_false();
}

const radarRef = ref(null);
const circleRef = ref(null);
const showHeatmap = ref(false);
// const showHeatmapButton = ref(false);
const showpluse = ref(false);
const show_radar = ref(false);
const showoverlay = ref(false);
const showDropdown = ref(false);
const showDropdown1 = ref(false);

function toggleDropdown() {
  showDropdown.value = !showDropdown.value;
}

function Dropdown_false() {
  showDropdown.value = false;
}

function toggleDropdown1() {
  showDropdown1.value = !showDropdown1.value;
}

function Dropdown1_false() {
  showDropdown1.value = false;
}

const options1 = reactive({
  show: false,
  position: [initialPosition.lon, initialPosition.lat],
  radius: 10,
  interval: 1500,
  color: [110, 221, 195, 255],
});

function renew_button(obj1, obj2) {
  (document.getElementById(obj1) as HTMLButtonElement).disabled = true;
  (document.getElementById(obj2) as HTMLButtonElement).disabled = false;
}

onUnmounted(() => {
  dataSource.entities.removeAll();
  removeAllListeners();
});

const showdata = ref(false);
function toggleCardata() {
  showdata.value = true;
  dataname = carId_list;
  choose = 1;
  document.getElementById("button_style_icon7").click();
  document.getElementById("button_style_icon7").click();
}

function togglePeopledata() {
  showdata.value = true;
  dataname = personId_list;
  choose = 2;
  document.getElementById("button_style_icon6").click();
  document.getElementById("button_style_icon6").click();
}

function change_name() {
  dataname = (document.getElementById("name") as HTMLInputElement).value;
}

function get_value() {
  if (choose == 1)
    (document.getElementById("name") as HTMLInputElement).value = carId_list;
  if (choose == 2)
    (document.getElementById("name") as HTMLInputElement).value = personId_list;
}

function get_input() {
  return (document.getElementById("name") as HTMLInputElement).value;
}

function place1() {
  if (choose == 1) return carplace1(getid(carId_list));
  if (choose == 2) return personplace1(getpeopleid(personId_list));
}

function place2() {
  if (choose == 1) return carplace2(getid(carId_list));
  if (choose == 2) return personplace2(getpeopleid(personId_list));
}

function getspeed() {
  if (choose == 1) return carspeed(getid(carId_list));
  if (choose == 2) return personspeed(getpeopleid(personId_list));
}

function gettime(time) {
  let date = new Date(time);
  let Y = date.getFullYear() + "-";
  let M =
    (date.getMonth() + 1 < 10
      ? "0" + (date.getMonth() + 1)
      : date.getMonth() + 1) + "-";
  let D = (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()) + " ";
  let h =
    (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) + ":";
  let m =
    (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()) +
    ":";
  let s = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
  return Y + M + D + h + m + s;
}

function modifyName() {
  if (choose == 1) modify_name(carId_list, get_input());
  if (choose == 2) modify_personName(personId_list, get_input());
}

function modify_carId_list() {
  if (choose == 1) carId_list = get_input();
  if (choose == 2) personId_list = get_input();
}

function recordData() {
  if (choose == 1) startrecord(carId_list);
  if (choose == 2) startpeoplerecord(personId_list);
}

function saveData() {
  if (choose == 1) saveHandler();
  if (choose == 2) savepeopleHandler();
}

function toggle_heatmap_show() {
  showHeatmap.value = !showHeatmap.value;
}

function toggle_overlay_show() {
  showoverlay.value = !showoverlay.value;
}
function toggle_pluse_show() {
  showpluse.value = !showpluse.value;
}
function toggle_radar_show() {
  show_radar.value = !show_radar.value;
}

function if_show() {
  if (overlaydatas.length == 0) {
    (
      document.getElementById("button_style_icon1") as HTMLButtonElement
    ).disabled = true;
  } else {
    (
      document.getElementById("button_style_icon1") as HTMLButtonElement
    ).disabled = false;
  }
  if (heatmapdatas.length == 0) {
    (
      document.getElementById("button_style_icon2") as HTMLButtonElement
    ).disabled = true;
  } else {
    (
      document.getElementById("button_style_icon2") as HTMLButtonElement
    ).disabled = false;
  }
  if (plusedatas.length == 0) {
    (
      document.getElementById("button_style_icon3") as HTMLButtonElement
    ).disabled = true;
  } else {
    (
      document.getElementById("button_style_icon3") as HTMLButtonElement
    ).disabled = false;
  }
  if (radardatas.length == 0) {
    (
      document.getElementById("button_style_icon4") as HTMLButtonElement
    ).disabled = true;
  } else {
    (
      document.getElementById("button_style_icon4") as HTMLButtonElement
    ).disabled = false;
  }
}

function del_car() {
  if (carIdlist.length == 1) {
    showcar_select_false();
  }
  deleteCar(carId_list);
  if (carIdlist.length > 0) {
    carId_list = carIdlist[0].name;
  } else {
    carId_list = "";
  }
  document.getElementById("button_style_icon7").click();
  document.getElementById("button_style_icon7").click();
}

function del_people() {
  if (personIdlist.length == 1) {
    showpeople_select_false();
  }
  deletePerson(personId_list);
  if (personIdlist.length > 0) {
    personId_list = personIdlist[0].name;
  } else {
    personId_list = "";
  }
  document.getElementById("button_style_icon6").click();
  document.getElementById("button_style_icon6").click();
}

// car.value = false;
// people.value = false;
// radarbutton.value = false;

function redata() {
  for (let i = 0; i < DELpersonIdlist.length; i++) {
    personIdlist.push(DELpersonIdlist[i]);
  }
  for (let i = 0; i < DELcarIdlist.length; i++) {
    carIdlist.push(DELcarIdlist[i]);
  }
  if (personIdlist.length > 0) {
    personId_list = personIdlist[0].name;
  } else {
    personId_list = "";
  }
  document.getElementById("button_style_icon6").click();
  document.getElementById("button_style_icon6").click();
  if (carIdlist.length > 0) {
    carId_list = carIdlist[0].name;
  } else {
    carId_list = "";
  }
  document.getElementById("button_style_icon7").click();
  document.getElementById("button_style_icon7").click();
  DELpersonIdlist.splice(0, DELpersonIdlist.length);
  DELcarIdlist.splice(0, DELcarIdlist.length);
}
</script>

<template>
  <vc-post-process-stage-scan
    v-for="(option, index) in radardatas"
    :key="index"
    v-if="show_radar"
    ref="radarRef"
    type="radar"
    :options="option"
  ></vc-post-process-stage-scan>
  <vc-post-process-stage-scan
    v-for="(option, index) in plusedatas"
    :key="index"
    v-if="showpluse"
    ref="circleRef"
    type="circle"
    :options="option"
  ></vc-post-process-stage-scan>
  <Heatmap v-if="showHeatmap" :instance="instance"></Heatmap>
  <Rainy v-if="showRain"></Rainy>
  <Snow v-if="showSnow"></Snow>
  <Sunny v-if="showSunny"></Sunny>
  <OverlayEchart
    v-if="showoverlay"
    :datas="overlaydatas"
    :editing="overlayediting"
    :key="`${overlaydatas.length}-${overlayediting}`"
  />
  <link
    rel="stylesheet"
    href="../../iconfont/font_4265849_7so4odyazpf/iconfont.css"
  />
  <div id="showcontroller" v-if="!showController">
    <button id="button_style2" type="button" @click="toggleController()">
      &lt;
    </button>
  </div>

  <div id="hidecontroller" v-if="showController">
    <button id="button_style2" type="button" @click="toggleController()">
      >
    </button>
  </div>

  <div id="controller" v-show="showController">
    <button id="button_style" type="button" @click="home()">还原视角</button>

    <!-- 天气--下拉菜单 -->
    <div class="dropdown">
      <button
        id="button_style"
        type="button"
        @click="
          toggleDropdown();
          heatmapediting_false();
          pluseediting_false();
          overlayediting_false();
          Dropdown1_false();
        "
      >
        设置天气
      </button>
      <div class="dropdown-content" v-if="showDropdown">
        <!-- 💦、❄ 和 ☀ 三个选项 -->
        <button id="button_style3" type="button" @click="toggleWeather('rain')">
          💦
        </button>
        <button id="button_style3" type="button" @click="toggleWeather('snow')">
          ❄
        </button>
        <button
          id="button_style3"
          type="button"
          @click="toggleWeather('sunny')"
        >
          ☀
        </button>
      </div>
    </div>

    <!-- 标记--下拉菜单 -->
    <div class="dropdown">
      <button
        id="button_style"
        type="button"
        @click="
          toggleDropdown1();
          heatmapediting_false();
          pluseediting_false();
          overlayediting_false();
          Dropdown_false();
        "
      >
        设置标记
      </button>
      <div class="dropdown-content" v-if="showDropdown1">
        <!-- 点标、图标 和 车辆 三个选项 -->
        <button id="button_style3" type="button" @click="showPoint()">
          点标
        </button>
        <button id="button_style3" type="button" @click="showPic()">
          图标
        </button>
        <button id="button_style3" type="button" @click="showCar()">
          车辆
        </button>
      </div>
    </div>

    <!-- <button
      id="button_style"
      type="button"
      @click="
        showRadar();
        heatmapediting_false();
        pluseediting_false();
        overlayediting_false();
        Dropdown_false();
        Dropdown1_false();
      "
    >
      放置雷达
    </button> -->

    <!-- <button id="button_style" type="button" @click="toggleHeatmap()">
      信号图
    </button> -->
    <!-- 节点 -->
    <div
      id="overlay-controller"
      class="overlay-controller"
      @click="
        ($event) => {
          $event.stopPropagation();
        }
      "
    >
      <div>
        <button
          id="button_style_icon"
          v-if="showController"
          @click="
            toggleEdit()
            // toggleoverlay();
          "
        >
          <span id="span1">放置节点</span>
        </button>
        <button
          id="button_style_icon1"
          disabled
          type="button"
          @click="
            toggle_overlay_show();
            if_show();
          "
        >
          <span
            v-if="showoverlay"
            id="overlayId"
            class="iconfont icon-yanjing_xianshi"
          ></span>
          <span
            v-if="!showoverlay"
            id="overlayId"
            class="iconfont icon-yanjing_yincang"
          ></span>
          <!-- {{ showoverlay == true ? "隐藏节点" : "显示节点" }} -->
        </button>
      </div>
      <div v-if="overlayediting">
        <select
          style="
            background-color: rgba(30, 31, 31, 0.5);
            color: rgba(243, 239, 247);
            height: 30px;
            width: 80px;
          "
          name="target"
          id="target"
          v-model="overlayselected"
        >
          <option
            id="button_style1"
            v-for="i in overlaydatas"
            :key="i.name"
            :value="i.name"
          >
            {{ i.name }}
          </option>
        </select>
        <button
          id="button_style5"
          @click="
            handleDelete();
            if_show();
          "
        >
          删除
        </button>
      </div>
    </div>
    <!-- 信源图 -->
    <div
      id="overlay-controller"
      class="overlay-controller"
      @click="
        ($event) => {
          $event.stopPropagation();
        }
      "
    >
      <div>
        <button
          id="button_style_icon"
          v-if="showController"
          @click="
            toggleheatmapEdit();
            if_show();
            // toggleHeatmap();
          "
        >
          <span id="span1">放置信源</span>
        </button>
        <button
          id="button_style_icon2"
          disabled
          type="button"
          @click="
            toggle_heatmap_show();
            if_show();
          "
        >
          <span
            v-if="showHeatmap"
            id="heatmapId"
            class="iconfont icon-yanjing_xianshi"
          ></span>
          <span
            v-if="!showHeatmap"
            id="heatmapId"
            class="iconfont icon-yanjing_yincang"
          ></span>
          <!-- {{ showHeatmap == true ? "隐藏信源" : "显示信源" }} -->
        </button>
      </div>
      <div v-if="heatmapediting">
        <select
          style="
            background-color: rgba(30, 31, 31, 0.5);
            color: rgba(243, 239, 247);
            height: 30px;
            width: 80px;
          "
          name="target"
          id="target"
          v-model="heatmapselected"
        >
          <option
            id="button_style1"
            v-for="i in heatmapdatas"
            :key="i.name"
            :value="i.name"
          >
            {{ i.name }}
          </option>
        </select>
        <button
          id="button_style5"
          @click="
            heatmapDelete();
            if_show();
          "
        >
          删除
        </button>
      </div>
    </div>
    <!-- 波纹 -->
    <div
      id="overlay-controller"
      class="overlay-controller"
      @click="
        ($event) => {
          $event.stopPropagation();
        }
      "
    >
      <div>
        <button
          id="button_style_icon"
          v-if="showController"
          @click="
            togglepluseEdit();
            if_show();
            // togglepluse();
          "
        >
          <span id="span1">放置波纹</span>
        </button>
        <button
          id="button_style_icon3"
          disabled
          type="button"
          @click="
            toggle_pluse_show();
            if_show();
          "
        >
          <span
            v-if="showpluse"
            id="pluseId"
            class="iconfont icon-yanjing_xianshi"
          ></span>
          <span
            v-if="!showpluse"
            id="pluseId"
            class="iconfont icon-yanjing_yincang"
          ></span>
          <!-- {{ showpluse == true ? "隐藏波纹" : "显示波纹" }} -->
        </button>
      </div>

      <div v-if="pluseediting">
        <select
          style="
            background-color: rgba(30, 31, 31, 0.5);
            color: rgba(243, 239, 247);
            height: 30px;
            width: 53.333px;
          "
          name="target"
          id="target"
          v-model="pluse_color"
        >
          <option
            id="button_style4"
            v-for="i in pluseColdr"
            :key="i"
            :value="i"
          >
            {{ i }}
          </option>
        </select>
        <select
          style="
            background-color: rgba(30, 31, 31, 0.5);
            color: rgba(243, 239, 247);
            height: 30px;
            width: 53.333px;
          "
          name="target"
          id="target"
          v-model="pluseselected"
        >
          <option
            id="button_style1"
            v-for="i in plusedatas"
            :key="i.name"
            :value="i.name"
          >
            {{ i.name }}
          </option>
        </select>
        <button
          id="button_style3"
          @click="
            pluseDelete();
            if_show();
          "
        >
          删除
        </button>
      </div>
    </div>

    <div>
      <button
        id="button_style_icon"
        v-if="showController"
        @click="
          toggleradarEdit();
          if_show();
          // togglepluse();
        "
      >
        <span id="span1">放置雷达</span>
      </button>
      <button
        id="button_style_icon4"
        disabled
        type="button"
        @click="
          toggle_radar_show();
          if_show();
        "
      >
        <span
          v-if="show_radar"
          id="radarId"
          class="iconfont icon-yanjing_xianshi"
        ></span>
        <span
          v-if="!show_radar"
          id="radarId"
          class="iconfont icon-yanjing_yincang"
        ></span>
      </button>
    </div>

    <div v-if="radarediting">
      <select
        style="
          background-color: rgba(30, 31, 31, 0.5);
          color: rgba(243, 239, 247);
          height: 30px;
          width: 40px;
          font-size: 10px;
        "
        name="target"
        id="target"
        v-model="radar_color"
      >
        <option id="button_style4" v-for="i in radarColdr" :key="i" :value="i">
          {{ i }}
        </option>
      </select>
      <select
        style="
          background-color: rgba(30, 31, 31, 0.5);
          color: rgba(243, 239, 247);
          height: 30px;
          width: 40px;
          font-size: 10px;
        "
        name="target"
        id="target"
        v-model="radar_size"
      >
        <option id="button_style4" v-for="i in radarSize" :key="i" :value="i">
          {{ i }}
        </option>
      </select>
      <select
        style="
          background-color: rgba(30, 31, 31, 0.5);
          color: rgba(243, 239, 247);
          height: 30px;
          width: 40px;
          font-size: 10px;
        "
        name="target"
        id="target"
        v-model="radarselected"
      >
        <option
          id="button_style1"
          v-for="i in radardatas"
          :key="i.name"
          :value="i.name"
        >
          {{ i.name }}
        </option>
      </select>
      <button
        id="radar_del"
        @click="
          radarDelete();
          if_show();
        "
      >
        删除
      </button>
    </div>

    <!-- 人员组件 -->
    <div>
      <div>
        <button
          v-if="!people"
          id="button_style_icon6"
          type="button"
          @click="
            peoplekey();
            // startObservePeople(dataSource);
            // focusOnPeople();
            heatmapediting_false();
            pluseediting_false();
            overlayediting_false();
            Dropdown_false();
            Dropdown1_false();
            showpeople_select();
          "
        >
          <span id="span1">人员列表</span>
        </button>
        <button
          v-if="people"
          id="button_style_icon6"
          type="button"
          @click="
            heatmapediting_false();
            pluseediting_false();
            overlayediting_false();
            Dropdown_false();
            Dropdown1_false();
            showpeople_select();
          "
        >
          <span id="span1">人员列表</span>
        </button>
        <button
          id="button_style_icon5"
          type="button"
          @click="
            peopleshow();
            people_show();
          "
        >
          <span v-if="showpeople" class="iconfont icon-yanjing_xianshi"></span>
          <span v-if="!showpeople" class="iconfont icon-yanjing_yincang"></span>
          <!-- {{ showoverlay == true ? "隐藏节点" : "显示节点" }} -->
        </button>
      </div>

      <div v-if="people_select">
        <select
          style="
            background-color: rgba(30, 31, 31, 0.5);
            color: rgba(243, 239, 247);
            height: 30px;
            width: 80px;
          "
          name="peopleid"
          id="peopleid"
          v-model="personId_list"
        >
          <option
            id="button_style5"
            v-bind:v-model="personId_list"
            v-for="j in personIdlist"
            :key="j"
            :value="j.name"
          >
            {{ j.name }}
          </option>
        </select>
        <button id="button_style6" type="button" @click="togglePeopledata()">
          <span id="span2">确认</span>
        </button>
        <button
          id="button_style6"
          type="button"
          @click="
            heatmapediting_false();
            pluseediting_false();
            overlayediting_false();
            Dropdown_false();
            Dropdown1_false();
            del_people();
          "
        >
          <span id="span2">删除</span>
        </button>
      </div>
    </div>

    <!-- 车辆组件 -->
    <div>
      <div>
        <button
          v-if="!car"
          id="button_style_icon7"
          type="button"
          @click="
            carkey();
            // startObserve(dataSource);
            // focusOn();
            showradarbutton();
            heatmapediting_false();
            pluseediting_false();
            overlayediting_false();
            Dropdown_false();
            Dropdown1_false();
            showcar_select();
          "
        >
          <span id="span1">车辆列表</span>
        </button>
        <button
          v-if="car"
          id="button_style_icon7"
          type="button"
          @click="
            showradarbutton();
            heatmapediting_false();
            pluseediting_false();
            overlayediting_false();
            Dropdown_false();
            Dropdown1_false();
            // showcar_select_false();
            showcar_select();
          "
        >
          <span id="span1">车辆列表</span>
        </button>
        <button
          id="button_style_icon5"
          type="button"
          @click="
            carshow();
            car_show();
          "
        >
          <span v-if="showcar" class="iconfont icon-yanjing_xianshi"></span>
          <span v-if="!showcar" class="iconfont icon-yanjing_yincang"></span>
          <!-- {{ showoverlay == true ? "隐藏节点" : "显示节点" }} -->
        </button>
      </div>

      <div>
        <!-- <button id="button_style1" @click="showcar_select()">车辆列表</button> -->
        <div v-if="car_select">
          <select
            style="
              background-color: rgba(30, 31, 31, 0.5);
              color: rgba(243, 239, 247);
              height: 30px;
              width: 80px;
            "
            name="carid"
            id="carid"
            v-model="carId_list"
          >
            <option
              id="button_style5"
              v-for="j in carIdlist"
              :key="j"
              :value="j.name"
            >
              {{ j.name }}
            </option>
          </select>
          <button id="button_style5" type="button" @click="toggleCardata()">
            确认
          </button>
        </div>
        <div v-if="car_select">
          <button
            v-if="!radar"
            id="button_style1"
            type="button"
            @click="
              showradar();
              radarkey();
              heatmapediting_false();
              pluseediting_false();
              overlayediting_false();
              Dropdown_false();
              Dropdown1_false();
            "
          >
            开启雷达
          </button>
          <button
            v-if="radar"
            id="button_style1"
            type="button"
            @click="
              showradar();
              radarkey();
              heatmapediting_false();
              pluseediting_false();
              overlayediting_false();
              Dropdown_false();
              Dropdown1_false();
            "
          >
            关闭雷达
          </button>
          <button
            id="button_style1"
            type="button"
            @click="
              heatmapediting_false();
              pluseediting_false();
              overlayediting_false();
              Dropdown_false();
              Dropdown1_false();
              del_car();
            "
          >
            删除
          </button>
        </div>
      </div>
    </div>

    <button
      id="button_style"
      type="button"
      @click="
        heatmapediting_false();
        pluseediting_false();
        overlayediting_false();
        radarediting_false();
        Dropdown_false();
        Dropdown1_false();
        redata();
      "
    >
      恢复数据
    </button>

    <button
      id="button_style"
      type="button"
      @click="
        deleteEntities();
        heatmapediting_false();
        pluseediting_false();
        overlayediting_false();
        radarediting_false();
        Dropdown_false();
        Dropdown1_false();
      "
    >
      清除实体
    </button>
  </div>

  <div id="showcontroller1" v-if="!showController1">
    <button id="button_style2" type="button" @click="toggleController1()">
      &lt;
    </button>
  </div>
  <div id="hidecontroller1" v-if="showController1">
    <button id="button_style2" type="button" @click="toggleController1()">
      >
    </button>
  </div>
  <div>
    <div id="data_style" v-if="showController1">
      <ul>
        <li>
          名称：<input
            type="text"
            id="name"
            v-bind:value="dataname"
            @input="change_name()"
          />
          <button
            v-if="showdata"
            id="confirm_button"
            type="button"
            @click="
              // modify_name(carId_list, get_input());
              modifyName();
              modify_carId_list();
            "
          >
            确定
          </button>
          <button
            v-if="showdata"
            id="record_button"
            type="button"
            @click="
              // startrecord(carId_list);
              recordData();
              renew_button('record_button', 'save_button');
            "
          >
            开始记录
          </button>
          <button
            v-if="showdata"
            id="save_button"
            type="button"
            @click="
              // startrecord(carId_list);
              recordData();
              saveData();
              // saveHandler();
              renew_button('save_button', 'record_button');
            "
            disabled
          >
            保存
          </button>
        </li>
        <li>
          当前位置：
          <span v-if="showdata">
            {{ place1() }}&nbsp;&nbsp;{{ place2() }}
          </span>
        </li>
        <li>
          当前时间：
          <span v-if="showdata">{{ gettime(Date.now()) }}</span>
        </li>
        <li>
          当前速度：
          <span v-if="showdata">{{ getspeed() }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
