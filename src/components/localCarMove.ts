import { addMessageListener } from "../utils/local_bridge";
import carURL from "../../assets/car.glb?url";
import radarURL from "../../assets/radar.glb?url";
import pointURL from "../../assets/point6.png?url";
import { reactive } from "vue";
import type { TData } from "../utils/local_bridge";

interface TSampleData {
  speed: number;
  time: number;
  positionArray: [number, number, number];
  position: Cesium.Cartesian3;
}

const entityMap = reactive<Map<String, Cesium.Entity>>(new Map([]));
const sampleMap = reactive<Map<String, TSampleData[]>>(new Map([]));

function hidecar(name: string) {
  const carEntity: Cesium.Entity = entityMap.get(name);
  carEntity.show = false;
}

function deletecar(name: string) {
  if (!entityMap.get(name)) return;
  const carEntity: Cesium.Entity = entityMap.get(name);
  carEntity.show = false;
  sampleMap.delete(name);
}

function createcar(name: string) {
  const carEntity: Cesium.Entity = entityMap.get(name);
  carEntity.show = true;
}

function shouldMove(data: TData): boolean {
  // 如果位置差距不大则不跟新
  const lastSample = sampleMap.get(data.id);
  if (lastSample) {
    const lastPosition = lastSample[lastSample.length - 1].positionArray;
    if (
      Math.abs(data.position[0] - lastPosition[0]) <= 0.00002 &&
      Math.abs(data.position[1] - lastPosition[1]) <= 0.00002
    ) {
      return false;
    }
  }
  return true;
}

function fixHeight(data: TData) {
  // 修正高度，因设置了 clampToHeight 而被废弃
  let height = data.position[2] / 2;
  if (height < 1) height = 1;
  data.position[2] = height;
  return data;
}

function local_focusOn() {
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

var radar = 0;
var car = 1;

function local_car_false() {
  car = 0;
  radar = 0;
}

function local_showradar() {
  if (radar == 0) {
    radar = 1;
  } else {
    radar = 0;
  }
}

function local_carshow() {
  if (car == 0) {
    car = 1;
  } else {
    car = 0;
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

function local_startObserve(dataSource: Cesium.CustomDataSource) {
  return addMessageListener("EventCarMove", (data: TData): void => {
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
      speed: data.speed,
      time: Date.now() + 2000,
      // time: data.time,
      position: clamp,
      positionArray: data.position,
    });
    carSamples.push({
      speed: data.speed,
      time: Date.now() + 60000,
      // time: data.time + 600000,
      position: clamp,
      positionArray: data.position,
    }); // 1 minute holder
    if (carSamples.length > 20) carSamples.shift(); // 防止内存溢出
    if (!entityMap.has(data.id)) {
      // create entity if not exists
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
  const carName = "车辆" + carID;
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
      minimumPixelSize: 1,
      maximumScale: 1,
    }),
    path: new Cesium.PathGraphics({
      show: true,
      leadTime: 0,
      trailTime: 9, // 尾迹持续时间
      resolution: 1,
      material: new Cesium.PolylineGlowMaterialProperty({
        glowPower: 0.1,
        color: Cesium.Color.GREEN,
      }),
      width: 10,
    }),
    label: new Cesium.LabelGraphics({
      show: true,
      text: carName,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      showBackground: true,
      font: "20px sans-serif",
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(50, 500),
      eyeOffset: new Cesium.Cartesian3(0, 15, 0),
    }),
    billboard: new Cesium.BillboardGraphics({
      show: true,
      image: pointURL,
      width: 26,
      height: 30,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      eyeOffset: new Cesium.Cartesian3(0, 5, 0),
      scaleByDistance: new Cesium.NearFarScalar(20, 5, 100, 1), // 近看 scale 5
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
  local_startObserve,
  local_focusOn,
  local_showradar,
  local_carshow,
  local_car_false,
  carplace1,
  carplace2,
  deletecar,
  createcar,
  hidecar,
};
