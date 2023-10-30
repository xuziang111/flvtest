<template>
  <vc-overlay-echarts :options="options"></vc-overlay-echarts>
</template>

<script lang="ts">
import type {
  EChartsOption,
  EffectScatterSeriesOption,
  LinesSeriesOption,
} from "echarts";
import { overlaySetup } from "../constants";
import { reactive } from "vue";
import type { TEchartData } from "types/env";

export default {
  props: ["datas", "editing"],
  setup(props) {
    const datas = props.datas as TEchartData[];
    datas.forEach((data) => {
      data.symbol = overlaySetup.stationSymbol;
    });

    const arrs = reactive([[], [], []]); // 不同级别的数据

    datas.forEach((data) => {
      if (data.belong) {
        const belongs = Array.isArray(data.belong)
          ? data.belong
          : [data.belong];
        belongs.forEach((belong) => {
          // 添加关联线段
          datas.forEach((item) => {
            if (belong === item.name) {
              arrs[data.level - 1].push([
                { coord: item.value },
                { coord: data.value },
              ]);
            }
          });
        });
      }
    });

    const seriesEffectScatter: EffectScatterSeriesOption[] = [
      {
        type: "effectScatter",
        coordinateSystem: "cesium",
        symbolSize: [20, 20],
        symbolOffset: [0, -10],
        data: datas,
      },
    ];

    if (props.editing) {
      seriesEffectScatter.forEach((item) => {
        item.label = {
          show: true,
          position: "right",
          formatter: "{b}",
          fontSize: 16,
          color: "#fff",
          textBorderColor: "#2aa4e8",
          textBorderWidth: 2,
          offset: [0, 20],
        };
      });
    }

    const seriesLines: LinesSeriesOption[] = [];
    arrs.forEach((arr) => {
      seriesLines.push({
        type: "lines",
        coordinateSystem: "cesium",
        effect: {
          show: true,
          trailLength: 0,
          symbol: overlaySetup.lineSymbol,
          symbolSize: [15, 30],
          period: 1, // 动画时间（秒）
        },
        lineStyle: {
          width: 2,
          color: overlaySetup.lineColor,
          curveness: -0.2, // 弯曲程度
          opacity: 1,
        },
        data: arr,
      });
    });

    const options: EChartsOption = {
      animation: true,
      series: [...seriesEffectScatter, ...seriesLines],
    };
    return {
      options,
    };
  },
};
</script>

<style></style>
