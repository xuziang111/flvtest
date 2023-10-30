import {
  overlayData,
  heatmapPosition,
  plusePosition,
  radarPosition,
} from "../constants";

function load_overlay_data() {
  let overlay_data_url = "../../overlay_data.json";
  let overlay_data_request = new XMLHttpRequest();
  overlay_data_request.open("get", overlay_data_url); /*设置请求方法与路径*/
  overlay_data_request.send(null); /*不发送数据到服务器*/
  overlay_data_request.onload = function () {
    /*XHR对象获取到返回信息后执行*/
    if (overlay_data_request.status == 200) {
      /*返回状态为200，即为数据获取成功*/
      let json = JSON.parse(overlay_data_request.responseText);
      for (let i = 0; i < json.length; i++) {
        overlayData.push({
          level: json[i].level,
          symbol: json[i].symbol,
          name: json[i].name,
          value: json[i].value,
          belong: json[i].belong,
        });
      }
    }
  };
}

function load_heatmap_data() {
  let heatmap_data_url = "../../heatmap_data.json";
  let heatmap_data_request = new XMLHttpRequest();
  heatmap_data_request.open("get", heatmap_data_url); /*设置请求方法与路径*/
  heatmap_data_request.send(null); /*不发送数据到服务器*/
  heatmap_data_request.onload = function () {
    /*XHR对象获取到返回信息后执行*/
    if (heatmap_data_request.status == 200) {
      /*返回状态为200，即为数据获取成功*/
      let json = JSON.parse(heatmap_data_request.responseText);
      for (let i = 0; i < json.length; i++) {
        heatmapPosition.push({
          name: json[i].name,
          position: json[i].position,
        });
      }
    }
  };
}

function load_pluse_data() {
  let pluse_data_url = "../../pluse_data.json";
  let pluse_data_request = new XMLHttpRequest();
  pluse_data_request.open("get", pluse_data_url); /*设置请求方法与路径*/
  pluse_data_request.send(null); /*不发送数据到服务器*/
  pluse_data_request.onload = function () {
    /*XHR对象获取到返回信息后执行*/
    if (pluse_data_request.status == 200) {
      /*返回状态为200，即为数据获取成功*/
      let json = JSON.parse(pluse_data_request.responseText);
      for (let i = 0; i < json.length; i++) {
        plusePosition.push({
          show: json[i].show,
          name: json[i].name,
          position: json[i].position,
          radius: json[i].radius,
          interval: json[i].interval,
          color: json[i].color,
        });
      }
    }
  };
}

function load_radar_data() {
  let radar_data_url = "../../radar_data.json";
  let radar_data_request = new XMLHttpRequest();
  radar_data_request.open("get", radar_data_url); /*设置请求方法与路径*/
  radar_data_request.send(null); /*不发送数据到服务器*/
  radar_data_request.onload = function () {
    /*XHR对象获取到返回信息后执行*/
    if (radar_data_request.status == 200) {
      /*返回状态为200，即为数据获取成功*/
      let json = JSON.parse(radar_data_request.responseText);
      for (let i = 0; i < json.length; i++) {
        radarPosition.push({
          show: json[i].show,
          name: json[i].name,
          position: json[i].position,
          radius: json[i].radius,
          interval: json[i].interval,
          color: json[i].color,
        });
      }
    }
  };
}

export {
  load_overlay_data,
  load_heatmap_data,
  load_pluse_data,
  load_radar_data,
};
