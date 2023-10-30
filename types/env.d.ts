/// <reference types="node" />

declare global {
  interface Window {
    viewer: Cesium.Viewer;
    lastPosition: number[];
    chrome: any;
  }
}

export interface TInstance {
  Cesium: typeof Cesium;
  viewer: Cesium.Viewer;
  lon: number;
  lat: number;
}

export interface TEchartData {
  level: number;
  symbol: string;
  name: string;
  value: [number, number];
  symbolSize?: number | [number, number];
  belong?: string;
}
