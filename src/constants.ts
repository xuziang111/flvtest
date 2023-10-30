import type { TEchartData } from "types/env";

export const cesiumPath = {
  local: "../Cesium/Cesium.js", // gitignored
  node: "../node_modules/cesium/Build/CesiumUnminified/Cesium.js",
  online: "https://unpkg.com/cesium@1.104.0/Build/Cesium/Cesium.js",
};

// My Cesium Ion Token
export const IonToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjNzY1ODY1YS04YzYxLTQ2NTAtODg0ZS05MDZlY2M3M2ExMTciLCJpZCI6MTM0ODQ0LCJpYXQiOjE2ODIwNDgxMzZ9.juOJhj7bsAs5GY9xcyGO41eviCwwft0sh_m5ykh_ipw`;

export const localTileset = "/Data/scene.json";

// 初始点位
export const initialPosition = {
  lon: 111.7621614091938,
  lat: 30.47899935094819,
};

// 车辆运动路径 [lon, lat, height]
export const carMovePath: {
  type: string;
  id: string;
  position: [number, number, number];
  speed: number;
}[] = [
  {
    type: "EventCarMove",
    id: "mockCar1",
    position: [114.31505372943577, 30.557669475272437, 1000],
    speed: 1,
  },

  {
    type: "EventCarMove",
    position: [114.31504045866231, 30.55790402680506, 1000],
    id: "mockCar1",
    speed: 2,
  },

  {
    type: "EventCarMove",
    position: [114.31502718788885, 30.558138578337683, 1000],
    id: "mockCar1",
    speed: 3,
  },

  {
    type: "EventCarMove",
    position: [114.31501391711539, 30.558373129870306, 1000],
    id: "mockCar1",
    speed: 4,
  },

  {
    type: "EventCarMove",
    position: [114.3150064634194, 30.55860768140293, 1000],
    id: "mockCar1",
    speed: 5,
  },

  {
    type: "EventCarMove",
    position: [114.31499464691531, 30.558842232935553, 1000],
    id: "mockCar1",
    speed: 6,
  },

  {
    type: "EventCarMove",
    position: [114.31498283041122, 30.559076784468177, 1000],
    id: "mockCar1",
    speed: 7,
  },

  {
    type: "EventCarMove",
    position: [114.31497101390713, 30.5593113360008, 1000],
    id: "mockCar1",
    speed: 8,
  },

  {
    type: "EventCarMove",
    position: [114.31495919740304, 30.559545887533424, 1000],
    id: "mockCar1",
    speed: 9,
  },

  {
    type: "EventCarMove",
    position: [114.31468340965942, 30.559581383931782, 1000],
    id: "mockCar1",
    speed: 10,
  },

  {
    type: "EventCarMove",
    position: [114.31461401947915, 30.559529117497046, 1000],
    id: "mockCar1",
    speed: 11,
  },

  {
    type: "EventCarMove",
    position: [114.31457433878435, 30.559470302912644, 1000],
    id: "mockCar1",
    speed: 12,
  },

  {
    type: "EventCarMove",
    position: [114.3144776907716, 30.559476209698527, 1000],
    id: "mockCar1",
    speed: 13,
  },

  {
    type: "EventCarMove",
    position: [114.31432847167447, 30.559475565499575, 1000],
    id: "mockCar1",
    speed: 14,
  },
];

export const peopleMovePath: {
  type: string;
  position: [number, number, number];
  id: string;
  speed: number;
}[] = [
  {
    type: "EventPeopleMove",
    id: "mockPeople1",
    position: [114.31505372943577, 30.557669475272437, 1000],
    speed: 1,
  },

  {
    type: "EventPeopleMove",
    position: [114.31504045866231, 30.55790402680506, 1000],
    id: "mockPeople1",
    speed: 2,
  },

  {
    type: "EventPeopleMove",
    position: [114.31502718788885, 30.558138578337683, 1000],
    id: "mockPeople1",
    speed: 3,
  },

  {
    type: "EventPeopleMove",
    position: [114.31501391711539, 30.558373129870306, 1000],
    id: "mockPeople1",
    speed: 4,
  },

  {
    type: "EventPeopleMove",
    position: [114.3150064634194, 30.55860768140293, 1000],
    id: "mockPeople1",
    speed: 5,
  },

  {
    type: "EventPeopleMove",
    position: [114.31499464691531, 30.558842232935553, 1000],
    id: "mockPeople1",
    speed: 6,
  },

  {
    type: "EventPeopleMove",
    position: [114.31498283041122, 30.559076784468177, 1000],
    id: "mockPeople1",
    speed: 7,
  },

  {
    type: "EventPeopleMove",
    position: [114.31497101390713, 30.5593113360008, 1000],
    id: "mockPeople1",
    speed: 8,
  },

  {
    type: "EventPeopleMove",
    position: [114.31495919740304, 30.559545887533424, 1000],
    id: "mockPeople1",
    speed: 9,
  },

  {
    type: "EventPeopleMove",
    position: [114.31468340965942, 30.559581383931782, 1000],
    id: "mockPeople1",
    speed: 10,
  },

  {
    type: "EventPeopleMove",
    position: [114.31461401947915, 30.559529117497046, 1000],
    id: "mockPeople1",
    speed: 11,
  },

  {
    type: "EventPeopleMove",
    position: [114.31457433878435, 30.559470302912644, 1000],
    id: "mockPeople1",
    speed: 12,
  },

  {
    type: "EventPeopleMove",
    position: [114.3144776907716, 30.559476209698527, 1000],
    id: "mockPeople1",
    speed: 13,
  },

  {
    type: "EventPeopleMove",
    position: [114.31432847167447, 30.559475565499575, 1000],
    id: "mockPeople1",
    speed: 14,
  },
];

// Heatmap 点位 [lon, lat, value], 值在 1-100 越高越红
export const heatmapPosition = [];

export const overlaySetup = {
  lineColor: "#f6fb05",
  lineSymbol:
    "image://https://zouyaoji.top/vue-cesium/images/symbol-yellow.png",
  stationSymbol:
    "image://https://zouyaoji.top/vue-cesium/images/station-blue.png",
};

export const overlayData: TEchartData[] = [];
export const plusePosition = [];

export const pluseColdr = ["黄色", "蓝色", "红色", "紫色", "白色"];

export const radarSize = ["小", "中", "大"];

export const radarColdr = ["蓝色", "绿色", "黄色"];

export const radarPosition = [];

export const carColdrURL = [
  "../../assets/car1.png?url",
  "../../assets/car2.png?url",
  "../../assets/car3.png?url",
  "../../assets/car4.png?url",
];

export const peopleColdrURL = [
  "../../assets/person1.png?url",
  "../../assets/person2.png?url",
  "../../assets/person3.png?url",
  "../../assets/person4.png?url",
];

export const carIdlist = [];
export const personIdlist = [];

export const DELcarIdlist = [];
export const DELpersonIdlist = [];

export const localMovePath: {
  type: string;
  id: string;
  position: [number, number, number];
  time: number;
  speed: number;
}[] = [];
