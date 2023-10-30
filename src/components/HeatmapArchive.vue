<!-- this is an archived file -->
<template>
  <vc-overlay-heatmap
    v-if="data.length"
    ref="heatmap"
    :data="data"
    :rectangle="rectangle"
    :max="max"
    :min="min"
    :show="show"
    :options="options"
    @ready="onHeatmapReady"
    type="imagery-layer"
    :segments="segments"
  >
  </vc-overlay-heatmap>
</template>

<script>
import geoURL from "../../assets/pop.json?url";

export default {
  props: ["instance"],
  data() {
    return {
      show: true,
      data: [],
      max: 346.05413818359375,
      min: 0.5259535908699036,
      rectangle: { east: 0, west: 0, north: 0, south: 0 },
      segments: [
        [10, "#4A90C3"],
        [20, "#81AAAC"],
        [40, "#B2C899"],
        [60, "#E5EA84"],
        [100, "#F8DE6D"],
        [150, "#EFA451"],
        [200, "#E46C38"],
        [346, "#D53127"],
      ],
      options: {
        backgroundColor: "rgba(0,0,0,0)",
        opacity: 0.8,
        radius: 10,
        maxOpacity: 0.6,
        minOpacity: 0.3,
        blur: 0.75,
      },
    };
  },
  methods: {
    onHeatmapReady() {
      this.$refs.heatmap.childRef.value.creatingPromise.then(
        ({ Cesium, viewer, cesiumObject }) => {
          viewer.camera.flyTo({
            destination: cesiumObject.imageryProvider.rectangle,
          });
        }
      );
    },
  },
  mounted() {
    fetch(geoURL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        this.rectangle = res.bounds;
        this.min = res.min;
        this.max = res.max;
        this.data = res.data;
      })
      .catch((e) => {
        console.log(e);
      });
  },
};
</script>
