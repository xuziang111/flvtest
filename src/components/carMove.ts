import { addMessageListener } from "../utils/bridge";
import carURL from "../../assets/tag.png?url";
import radarURL from "../../assets/radar.glb?url";
import { reactive } from "vue";
import type { TData } from "../utils/bridge";
import { carColdrURL } from "../constants";
import { carIdlist, DELcarIdlist } from "../constants";
import { Color } from "cesium";

interface TSampleData {
  time: number;
  positionArray: [number, number, number];
  position: Cesium.Cartesian3;
  speed: number;
}

const entityMap = reactive<Map<String, Cesium.Entity>>(new Map([]));
const sampleMap = reactive<Map<String, TSampleData[]>>(new Map([]));

function modify_name(name1: string, name2: string) {
  for (let i = 0; i < carIdlist.length; i++) {
    if (carIdlist[i].name == name1) {
      carIdlist[i].name = name2;
      const carEntity: Cesium.Entity = entityMap.get(carIdlist[i].id);
      carEntity.name = name2;
      carEntity.label.text = name2;
      break;
    }
  }
}

function carplace1(name: string) {
  const lastSample = sampleMap.get(name);
  if (!lastSample) {
    return;
  }
  const lastPosition = lastSample[lastSample.length - 1].positionArray;
  return lastPosition[0].toFixed(8);
}

function carplace2(name: string) {
  const lastSample = sampleMap.get(name);
  if (!lastSample) {
    return;
  }
  const lastPosition = lastSample[lastSample.length - 1].positionArray;
  return lastPosition[1].toFixed(8);
}

function carspeed(name: string) {
  const lastSample = sampleMap.get(name);
  if (!lastSample) {
    return;
  }
  const lastSpeed = lastSample[lastSample.length - 1].speed;
  return lastSpeed;
}

function getid(name: string) {
  for (let i = 0; i < carIdlist.length; i++) {
    if (carIdlist[i].name == name) {
      return carIdlist[i].id;
    }
  }
}

function getname(id: string) {
  for (let i = 0; i < carIdlist.length; i++) {
    if (carIdlist[i].id == id) {
      return carIdlist[i].name;
    }
  }
}

function shouldMove(data: TData): boolean {
  // 如果位置差距不大则不跟新
  const lastSample = sampleMap.get(data.id);
  // if (lastSample) {
  //   const lastPosition = lastSample[lastSample.length - 1].positionArray;
  //   if (
  //     Math.abs(data.position[0] - lastPosition[0]) <= 0.000025 &&
  //     Math.abs(data.position[1] - lastPosition[1]) <= 0.000025
  //   ) {
  //     return false;
  //   }
  // }
  return true;
}

function fixHeight(data: TData) {
  // 修正高度，因设置了 clampToHeight 而被废弃
  let height = data.position[2] / 2;
  if (height < 1) height = 1;
  data.position[2] = height;
  return data;
}

function focusOn() {
  return addMessageListener("FocusOn", (data: TData): void => {
    const theSample = sampleMap.get(data.id);
    if (theSample) {
      const lastPosition = theSample[theSample.length - 1].positionArray;
      window.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          lastPosition[0],
          lastPosition[1],
          lastPosition[2] + 100
        ), //相机（眼睛）位置  不是地图位置
        //相机的姿态
        orientation: {
          heading: Cesium.Math.toRadians(0.0), // 朝向
          pitch: Cesium.Math.toRadians(-90), // 俯仰
          roll: 0.0, //滚转
        },
        duration: 1,
      });
    }
  });
}

let radar = 0;
let car = 1;
let record = 0;
let pointnum = 0;
let pointkey = [0, 0, 0, 0, 0];
let select_car;

function car_false() {
  car = 0;
  radar = 0;
}

function showradar() {
  if (radar == 0) {
    radar = 1;
  } else {
    radar = 0;
  }
}

function carshow() {
  if (car == 0) {
    car = 1;
  } else {
    car = 0;
  }
}

function startrecord(name: string) {
  if (record == 0) {
    record = 1;
  } else {
    record = 0;
  }
  select_car = name;
}

let localData = [];

function saveData(data: TData) {
  localData.push({
    type: data.type,
    id: select_car,
    position: data.position,
    time: Date.now(),
    speed: data.speed,
  });
}

function saveHandler() {
  // var FileSaver = require("file-saver");
  const content = JSON.stringify(localData);
  const blob = new Blob([content], {
    type: "application/json",
  });
  // FileSaver.saveas(blob, "data1.txt");
  // 根据 blob生成 url链接
  const objectURL = URL.createObjectURL(blob);

  // 创建一个 a 标签Tag
  const aTag = document.createElement("a");
  // 设置文件的下载地址
  aTag.href = objectURL;
  // 设置保存后的文件名称
  // aTag.download = "json文件.json";
  aTag.download = `${select_car}.json`;
  // 给 a 标签添加点击事件
  aTag.click();
  // 释放一个之前已经存在的、通过调用 URL.createObjectURL() 创建的 URL 对象。
  // 当你结束使用某个 URL 对象之后，应该通过调用这个方法来让浏览器知道不用在内存中继续保留对这个文件的引用了。
  URL.revokeObjectURL(objectURL);
  localData = [];
  record = 0;
}

function showEntity(data: TData) {
  const carEntity: Cesium.Entity = entityMap.get(data.id);
  const radarEntity: Cesium.Entity = entityMap.get(data.id + "-radar");
  if (radar == 1) {
    radarEntity.show = true;
  } else {
    radarEntity.show = false;
  }
  if (car == 1) {
    carEntity.show = true;
  } else {
    carEntity.show = false;
    radarEntity.show = false;
    window.viewer.trackedEntity = undefined;
    window.viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
  }
}

function getlastposition(data: TData) {
  const lastSample = sampleMap.get(data.id);
  if (!lastSample) {
    return;
  }
  return lastSample[lastSample.length - 1].position;
}

function deleteCar(name) {
  for (let i = 0; i < carIdlist.length; i++) {
    if (carIdlist[i].name == name) {
      entityMap.get(carIdlist[i].id).show = false;
      entityMap.get(carIdlist[i].id + "-radar").show = false;
      // entityMap.delete(carIdlist[i].id);
      DELcarIdlist.push(carIdlist[i]);
      carIdlist.splice(i, 1);
      break;
    }
  }
}

function startObserve(dataSource: Cesium.CustomDataSource) {
  return addMessageListener("EventCarMove", (data: TData): void => {
    let del = 0;
    for (let i = 0; i < DELcarIdlist.length; i++) {
      if (DELcarIdlist[i].id == data.id) {
        del = 1;
        break;
      }
    }
    if (del == 1) {
      return;
    }
    if (record == 1 && data.id == getid(select_car)) {
      saveData(data);
    }
    const carSamples = sampleMap.get(data.id) || [];
    let key = 0;
    let clamp;
    if (entityMap.has(data.id)) {
      if (!shouldMove(data)) {
        showEntity(data);
        key = 1;
      }
    }
    if (key == 0) {
      clamp = window.viewer.scene.clampToHeight(
        Cesium.Cartesian3.fromDegrees(data.position[0], data.position[1]),
        [...entityMap.values()]
        // [dataSource.entities.getById(data.id + "-radar")]
      );
    } else {
      clamp = getlastposition(data);
    }
    const ellipsoid = window.viewer.scene.globe.ellipsoid;
    const cartographic = ellipsoid.cartesianToCartographic(clamp);
    var height = cartographic.height;
    if (height < 0) {
      height = 0;
    }
    clamp = Cesium.Cartesian3.fromDegrees(
      data.position[0],
      data.position[1],
      height
    );
    if (!clamp) return; // 出错则返回，不能写入空数据
    carSamples.pop(); // remove last holder
    carSamples.push({
      time: Date.now() + 2000,
      position: clamp,
      positionArray: data.position,
      speed: data.speed,
    });
    carSamples.push({
      time: Date.now() + 30000,
      position: clamp,
      positionArray: data.position,
      speed: data.speed,
    }); // 1 minute holder
    if (carSamples.length > 20) carSamples.shift(); // 防止内存溢出
    if (!entityMap.has(data.id)) {
      // create entity if not exists
      let i = 0;
      let j = 0;
      while (i < 4) {
        if (pointkey[i] == 0) {
          pointkey[i] = 1;
          pointnum = i;
          j = 1;
          break;
        }
        i++;
      }
      if (j == 0) {
        pointnum = 0;
      }
      carIdlist.push({
        id: data.id,
        name: "车辆" + data.id,
      });
      const carEntity = createEntity(dataSource, carSamples, data);
      const radarEntity = createRadarEntity(dataSource, carSamples, data);
      entityMap.set(data.id, carEntity);
      entityMap.set(data.id + "-radar", radarEntity);
      showEntity(data);
    } else {
      showEntity(data);
      const carEntity: Cesium.Entity = entityMap.get(data.id);
      const radarEntity: Cesium.Entity = entityMap.get(data.id + "-radar");

      // update position
      const property: Cesium.SampledPositionProperty =
        new Cesium.SampledPositionProperty();
      carSamples.forEach((sample: TSampleData) => {
        property.addSample(
          Cesium.JulianDate.fromDate(new Date(sample.time)),
          sample.position
        );
      });
      carEntity.position = property;
      carEntity.orientation = new Cesium.VelocityOrientationProperty(property);
      radarEntity.position = property;
    }
    sampleMap.set(data.id, carSamples);
  });
}

// 创建新的 Cesium 实体，相同 ID 只能存在一个实体
const createEntity = (
  dataSource: Cesium.CustomDataSource,
  carSamples: TSampleData[],
  data: TData
): Cesium.Entity => {
  const carID = data.id; // ID 信息
  const carName = getname(carID);
  const property: Cesium.SampledPositionProperty =
    new Cesium.SampledPositionProperty();

  carSamples.forEach((sample: TSampleData) => {
    property.addSample(
      Cesium.JulianDate.fromDate(new Date(sample.time)),
      sample.position
    );
  });

  const carEntity = dataSource.entities.add({
    id: carID, // 后端id
    show: true,
    name: carName,
    position: property, // 点集
    orientation: new Cesium.VelocityOrientationProperty(property),
    model: new Cesium.ModelGraphics({
      show: true,
      uri: carURL,
      scale: 1,
      minimumPixelSize: 30,
      maximumScale: 20,
    }),
    path: new Cesium.PathGraphics({
      show: true,
      leadTime: 0,
      trailTime: 120000, // 尾迹持续时间
      resolution: 1,
      material: new Cesium.PolylineGlowMaterialProperty({
        glowPower: 0.1,
        color: Cesium.Color.GREEN,
      }),
      width: 15,
    }),
    label: new Cesium.LabelGraphics({
      show: true,
      text: carName,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      showBackground: false,
      font: "20px sans-serif",
      fillColor: Color.YELLOW,
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(50, 500),
      eyeOffset: new Cesium.Cartesian3(0, 10, 0),
      // scaleByDistance: new Cesium.NearFarScalar(20, 10, 100, 1), // 近看 scale 5
    }),
    billboard: new Cesium.BillboardGraphics({
      show: true,
      image: carColdrURL[pointnum],
      width: 40,
      height: 80,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      eyeOffset: new Cesium.Cartesian3(0, 0, 0),
      scaleByDistance: new Cesium.NearFarScalar(10, 5, 100, 1), // 近看 scale 5
    }),
  });
  return carEntity;
};

const createRadarEntity = (
  dataSource: Cesium.CustomDataSource,
  radarSamples: TSampleData[],
  data: TData
): Cesium.Entity => {
  const radarID = data.id + "-radar"; // ID 信息
  const radarName = data.id + "-radar";
  const property: Cesium.SampledPositionProperty =
    new Cesium.SampledPositionProperty();

  radarSamples.forEach((sample: TSampleData) => {
    property.addSample(
      Cesium.JulianDate.fromDate(new Date(sample.time)),
      sample.position
    );
  });

  const radarEntity = dataSource.entities.add({
    id: radarID, // 后端id
    show: true,
    name: radarName,
    position: property, // 点集
    orientation: new Cesium.VelocityOrientationProperty(property),
    model: new Cesium.ModelGraphics({
      show: true,
      uri: radarURL,
      scale: 1,
      minimumPixelSize: 1,
      maximumScale: 1,
    }),
    path: null,
    label: null,
    billboard: null,
  });
  return radarEntity;
};

export {
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
  carspeed,
  getid,
  deleteCar,
};
