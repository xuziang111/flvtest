<template>
  <vc-analyses
    ref="analysesRef"
    position="bottom-left"
    :offset="[10, 15]"
    :editable="true"
    :mainFabOpts="{
      icon: 'vc-icons-overview-toggle',
    }"
    @ready="analysesReady"
  ></vc-analyses>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { VcFabRef } from "node_modules/vue-cesium/es/components/ui";

const analysesRef = ref(null);

function analysesReady() {
  const fabRef: VcFabRef = analysesRef.value.getFabRef();
  fabRef.hide(); // auto hide
}
</script>

<style>
.vc-fab--opened .vc-fab__icon {
  opacity: unset;
}
</style>
