<template>
  <vc-post-process-stage
    :fragmentShader="fragmentShader"
  ></vc-post-process-stage>
</template>

<script setup lang="ts">
import { ref } from "vue";

const fragmentShader = ref(`
  uniform sampler2D colorTexture;
  uniform sampler2D depthTexture;
  uniform float visibility;
  uniform vec4 fogColor;
  in vec2 v_textureCoordinates;
  void main(void){
    vec4 origcolor = texture(colorTexture, v_textureCoordinates);
    float y=gl_FragCoord.y / czm_viewport.w;
    float x=gl_FragCoord.x / czm_viewport.z;
    float f=(1.0-x)*y;
    out_FragColor = mix(origcolor, vec4(1.0,1.0,1.0,1), f);
  }
`);
</script>
