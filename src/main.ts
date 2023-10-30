import { createApp, ref } from "vue";
import VueCesium from "vue-cesium";
import "./style.css";
import "vue-cesium/dist/index.css";
import App from "./App.vue";
import { IonToken, cesiumPath } from "./constants";

const app = createApp(App);

app.use(VueCesium, {
  cesiumPath:
    import.meta.env.MODE === "production" ? cesiumPath.online : cesiumPath.node,
  accessToken: IonToken,
});
app.mount("#app");

window.console.clear();
