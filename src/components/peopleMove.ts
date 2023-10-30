import { addMessageListener } from "../utils/bridge";
import peopleURL from "../../assets/man.glb?url";
import pointURL from "../../assets/point1.png?url";
import { reactive } from "vue";
import type { TData } from "../utils/bridge";
import { peopleColdrURL } from "../constants";
import { personIdlist, DELpersonIdlist } from "../constants";
import { Color } from "cesium";

interface TSampleData {
  time: number;
  positionArray: [number, number, number];
  position: Cesium.Cartesian3;
  speed: number;
}

const entityMap = reactive<Map<String, Cesium.Entity>>(new Map([]));
const sampleMap = reactive<Map<String, TSampleData[]>>(new Map([]));

function modify_personName(name1: string, name2: string) {
  for (let i = 0; i < personIdlist.length; i++) {
    if (personIdlist[i].name == name1) {
      personIdlist[i].name = name2;
      const peopleEntity: Cesium.Entity = entityMap.get(personIdlist[i].id);
      peopleEntity.name = name2;
      peopleEntity.label.text = name2;
      break;
    }
  }
}

function personplace1(name: string) {
  const lastSample = sampleMap.get(name);
  if (!lastSample) {
    return;
  }
  const lastPosition = lastSample[lastSample.length - 1].positionArray;
  return lastPosition[0].toFixed(8);
}

function personplace2(name: string) {
  const lastSample = sampleMap.get(name);
  if (!lastSample) {
    return;
  }
  const lastPosition = lastSample[lastSample.length - 1].positionArray;
  return lastPosition[1].toFixed(8);
}

function personspeed(name: string) {
  const lastSample = sampleMap.get(name);
  if (!lastSample) {
    return;
  }
  const lastSpeed = lastSample[lastSample.length - 1].speed;
  return lastSpeed;
}

function getpeopleid(name: string) {
  for (let i = 0; i < personIdlist.length; i++) {
    if (personIdlist[i].name == name) {
      return personIdlist[i].id;
    }
  }
}

function getpeoplename(id: string) {
  for (let i = 0; i < personIdlist.length; i++) {
    if (personIdlist[i].id == id) {
      return personIdlist[i].name;
    }
  }
}

function shouldMove(data: TData): boolean {
  // 如果位置差距不大则不跟新
  const lastSample = sampleMap.get(data.id);
  if (lastSample) {
    const lastPosition = lastSample[lastSample.length - 1].positionArray;
    if (
      Math.abs(data.position[0] - lastPosition[0]) <= 0.00001 &&
      Math.abs(data.position[1] - lastPosition[1]) <= 0.00001
      // Math.abs(data.position[0] - lastPosition[0]) *
      //   Math.abs(data.position[0] - lastPosition[0]) +
      //   Math.abs(data.position[1] - lastPosition[1]) *
      //     Math.abs(data.position[1] - lastPosition[1]) <=
      // 0.00002 * 0.00002
    ) {
      return false;
    }
  }
  return true;
}

function focusOnPeople() {
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

let record = 0;
var people = 1;
let pointnum = 0;
let pointkey = [0, 0, 0, 0, 0];
let select_people;

function people_false() {
  people = 0;
}

function peopleshow() {
  if (people == 0) {
    people = 1;
  } else {
    people = 0;
  }
}

function startpeoplerecord(name: string) {
  if (record == 0) {
    record = 1;
  } else {
    record = 0;
  }
  select_people = name;
}

let localData = [];
function savepeopleData(data: TData) {
  localData.push({
    type: data.type,
    id: select_people,
    position: data.position,
    time: Date.now(),
    speed: data.speed,
  });
}

function savepeopleHandler() {
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
  aTag.download = `${select_people}.json`;
  // 给 a 标签添加点击事件
  aTag.click();
  // 释放一个之前已经存在的、通过调用 URL.createObjectURL() 创建的 URL 对象。
  // 当你结束使用某个 URL 对象之后，应该通过调用这个方法来让浏览器知道不用在内存中继续保留对这个文件的引用了。
  URL.revokeObjectURL(objectURL);
  localData = [];
  record = 0;
}

function deletePerson(name) {
  for (let i = 0; i < personIdlist.length; i++) {
    if (personIdlist[i].name == name) {
      entityMap.get(personIdlist[i].id).show = false;
      // entityMap.delete(personIdlist[i].id);
      DELpersonIdlist.push(personIdlist[i]);
      personIdlist.splice(i, 1);
      break;
    }
  }
}

function getlastposition(data: TData) {
  const lastSample = sampleMap.get(data.id);
  if (!lastSample) {
    return;
  }
  return lastSample[lastSample.length - 1].position;
}

function startObservePeople(dataSource: Cesium.CustomDataSource) {
  return addMessageListener("EventPeopleMove", (data: TData): void => {
    let del = 0;
    for (let i = 0; i < DELpersonIdlist.length; i++) {
      if (DELpersonIdlist[i].id == data.id) {
        del = 1;
        break;
      }
    }
    if (del == 1) {
      return;
    }
    if (record == 1 && data.id == getpeopleid(select_people)) {
      savepeopleData(data);
    }
    // if (!shouldMove(data)) return;
    // const peopleSamples = sampleMap.get(data.id) || [];
    // const clamp = window.viewer.scene.clampToHeight(
    //   Cesium.Cartesian3.fromDegrees(data.position[0], data.position[1])
    // );
    const peopleSamples = sampleMap.get(data.id) || [];
    let key = 0;
    let clamp;

    // let lon1 = String(data.position[0]).slice(0, 3);
    // let lon2 = String(data.position[0]).slice(3);
    // let lon = Number(lon1) + Number(lon2) / 60;
    //  let lon1 = String(data.position[0]).split('.');
    // let lon = Number(lon1[0])+Number(lon1[1])/60000
    // let lon = Number(lon1) + Number(lon2) / 60;

    // let lat1 = String(data.position[1]).slice(0, 2);
    // let lat2 = String(data.position[1]).slice(2);
    // let lat = Number(lat1) + Number(lat2) / 60;
    // console.log(lon);
    // console.log(lat);

    if (entityMap.has(data.id)) {
      if (!shouldMove(data)) {
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
    // console.log(height);
    // height = 0;
    // data.position = [lon, lat, height];
    // clamp = Cesium.Cartesian3.fromDegrees(lon, lat, height);
    if (!clamp) return; // 出错则返回，不能写入空数据
    peopleSamples.pop(); // remove last holder
    peopleSamples.push({
      time: Date.now() + 2000,
      position: clamp,
      positionArray: data.position,
      speed: data.speed,
    });
    peopleSamples.push({
      time: Date.now() + 30000,
      position: clamp,
      positionArray: data.position,
      speed: data.speed,
    }); // 1 minute holder
    if (peopleSamples.length > 20) peopleSamples.shift(); // 防止内存溢出
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
      personIdlist.push({
        id: data.id,
        name: "人" + data.id,
      });
      const peopleEntity = createEntity(dataSource, peopleSamples, data);
      entityMap.set(data.id, peopleEntity);
    } else {
      const peopleEntity: Cesium.Entity = entityMap.get(data.id);
      if (people == 1) {
        peopleEntity.show = true;
      } else {
        peopleEntity.show = false;
        window.viewer.trackedEntity = undefined;
        window.viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
      }
      // update position
      const property: Cesium.SampledPositionProperty =
        new Cesium.SampledPositionProperty();
      peopleSamples.forEach((sample: TSampleData) => {
        property.addSample(
          Cesium.JulianDate.fromDate(new Date(sample.time)),
          sample.position
        );
      });
      peopleEntity.position = property;
      peopleEntity.orientation = new Cesium.VelocityOrientationProperty(
        property
      );
    }
    sampleMap.set(data.id, peopleSamples);
  });
}

// 创建新的 Cesium 实体，相同 ID 只能存在一个实体
const createEntity = (
  dataSource: Cesium.CustomDataSource,
  peopleSamples: TSampleData[],
  data: TData
): Cesium.Entity => {
  const peopleID = data.id; // ID 信息
  const peopleName = "人" + peopleID;
  const property: Cesium.SampledPositionProperty =
    new Cesium.SampledPositionProperty();

  peopleSamples.forEach((sample: TSampleData) => {
    property.addSample(
      Cesium.JulianDate.fromDate(new Date(sample.time)),
      sample.position
    );
  });

  const peopleEntity = dataSource.entities.add({
    id: "人" + peopleID, // 后端id
    name: peopleName,
    position: property, // 点集
    orientation: new Cesium.VelocityOrientationProperty(property),
    model: new Cesium.ModelGraphics({
      show: true,
      uri: pointURL,
      scale: 0.05,
      minimumPixelSize: 3,
      maximumScale: 3,
    }),
    label: new Cesium.LabelGraphics({
      show: true,
      text: peopleName,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      // showBackground: true,
      fillColor: Color.YELLOW,
      font: "20px sans-serif",
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(50, 500),
      eyeOffset: new Cesium.Cartesian3(0, 10, 0),
    }),
    path: new Cesium.PathGraphics({
      show: true,
      leadTime: 0,
      // trailTime: 120000, // 尾迹持续时间
      resolution: 1,
      material: new Cesium.PolylineGlowMaterialProperty({
        glowPower: 0.1,
        color: Cesium.Color.GREEN,
      }),
      width: 10,
    }),
    billboard: new Cesium.BillboardGraphics({
      show: true,
      image: peopleColdrURL[pointnum],
      width: 40,
      height: 80,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      eyeOffset: new Cesium.Cartesian3(0, 0, 0),
      scaleByDistance: new Cesium.NearFarScalar(10, 5, 100, 1), // 近看 scale 5
    }),
  });
  return peopleEntity;
};

export {
  startObservePeople,
  focusOnPeople,
  peopleshow,
  people_false,
  savepeopleHandler,
  startpeoplerecord,
  modify_personName,
  personplace1,
  personplace2,
  personspeed,
  getpeopleid,
  deletePerson,
};
