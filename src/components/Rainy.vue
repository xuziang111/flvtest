<template>
  <vc-post-process-stage
    :fragmentShader="fragmentShader"
  ></vc-post-process-stage>
</template>

<script setup lang="ts">
import { ref } from "vue";

const fragmentShader = ref(`
  uniform sampler2D colorTexture;
  in vec2 v_textureCoordinates;
  float hash(float x){
    return fract(sin(x*23.3)*13.13);
  }
  void main(void){
    float time = czm_frameNumber / 100.0;
    vec2 resolution = czm_viewport.zw;
    vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);
    vec3 c=vec3(.6,.7,.8);
    float a=-.4;
    float si=sin(a),co=cos(a);
    uv*=mat2(co,-si,si,co);
    uv*=length(uv+vec2(0,4.9))*.3+12.;
    float v=1.-sin(hash(floor(uv.x*100.))*2.);
    float b=clamp(abs(sin(20.*time*v+uv.y*(5./(2.+v))))-.95,0.,1.)*20.;
    c*=v*b;
    out_FragColor = mix(texture(colorTexture, v_textureCoordinates), vec4(c,1), 0.5);
  }
`);
// float time = czm_frameNumber / 100.0;速度
//uv*=length(uv+vec2(0,4.9))*.3+6.; 长度
</script>
