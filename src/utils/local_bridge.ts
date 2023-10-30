import { deletecar, createcar } from "../components/localCarMove";
import { localMovePath } from "../constants";

export interface TData {
  type: string;
  id: string;
  position?: [number, number, number];
  time: number;
  speed: number;
}

const closerStack: Function[] = [];

export const removeAllListeners = () => {
  closerStack.map((closer) => {
    closer();
  });
  closerStack.length = 0;
};

let timekey1 = -1;
let speedkey1 = -1;

let num1 = 0;

let checknum1 = 0;

function getname1() {
  return localMovePath[0].id;
}

function modify_name1(name: string) {
  let i = 0;
  let carname = localMovePath[0].id;
  while (i < localMovePath.length) {
    localMovePath[i].id = name;
    i++;
  }
  deletecar(carname);
}

function gettime(car, key: number) {
  if (key == -1) {
    let date = new Date(car[0].time);
    let Y = date.getFullYear() + "-";
    let M =
      (date.getMonth() + 1 < 10
        ? "0" + (date.getMonth() + 1)
        : date.getMonth() + 1) + "-";
    let D = (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()) + " ";
    let h =
      (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) + ":";
    let m =
      (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()) +
      ":";
    let s =
      date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
    return Y + M + D + h + m + s;
  } else {
    let date = new Date(car[key].time);
    let Y = date.getFullYear() + "-";
    let M =
      (date.getMonth() + 1 < 10
        ? "0" + (date.getMonth() + 1)
        : date.getMonth() + 1) + "-";
    let D = (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()) + " ";
    let h =
      (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) + ":";
    let m =
      (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()) +
      ":";
    let s =
      date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
    return Y + M + D + h + m + s;
  }
}

function firsttime(name: string) {
  return gettime(localMovePath, 0);
}

function check_time() {
  if (timekey1 >= localMovePath.length) {
    timekey1 = localMovePath.length - 1;
  }
}

function movetime1() {
  check_time();
  return gettime(localMovePath, timekey1);
}

function movespeed1() {
  if (speedkey1 >= localMovePath.length || speedkey1 == -1) {
    return 0;
  }
  return localMovePath[speedkey1].speed;
}

let car1 = 0;
function showcar1() {
  car1 = 1;
  num1 = 0;
  timekey1 = -1;
  speedkey1 = -1;
  if (checknum1 != 0) {
    deletecar(localMovePath[0].id);
  }
  checknum1++;
}

function addMockListener(type: string, func: (data: TData) => void) {
  const mockID = "mockCar";
  if (type === "EventCarMove") {
    const trigger = () => {
      if (num1 < localMovePath.length && car1 == 1) {
        func({
          type: localMovePath[num1].type,
          position: localMovePath[num1].position,
          id: localMovePath[num1].id,
          time: localMovePath[num1].time,
          speed: localMovePath[num1].speed,
        });
        if (num1 == 1) {
          createcar(localMovePath[0].id);
        }
        num1++;
        timekey1++;
        speedkey1++;
      }

      if (num1 >= localMovePath.length) {
        num1 = localMovePath.length - 1;
      }
    };
    trigger();
    const interval = setInterval(trigger, 2000);
    const closer = () => clearInterval(interval);
    closerStack.push(closer);
    return closer;
  }
  // if (type === "EventPeopleMove") {
  //   let i = 0;
  //   const trigger = () => {
  //     if (i >= peopleMovePath.length) i = 0;
  //     func({
  //       type: peopleMovePath[i].type,
  //       position: peopleMovePath[i].position,
  //       id: peopleMovePath[i].id,
  //     });
  //     i++;
  //   };
  //   trigger();
  //   const interval = setInterval(trigger, 2000);
  //   const closer = () => clearInterval(interval);
  //   closerStack.push(closer);
  //   return closer;
  // }
  if (type === "FocusOn") {
    const mockData = {
      type: "FocusOn",
      id: mockID,
      time: 0,
      speed: 0,
    };
    const timmer = setTimeout(() => {
      console.debug("[Debug] FocusOn:", mockID);
      func(mockData);
    }, 5000);
    closerStack.push(() => timmer);
    return timmer;
  }
}

// webview2 transmition
export const postMessage = (str: string) => {
  // if (!window?.chrome?.webview) return;
  window.chrome.webview.postMessage(str);
};

export const addMessageListener = (
  type: string,
  func: (data: TData) => void
) => {
  return addMockListener(type, func);
  // listener function
  function listener({ data }: { data: string }) {
    const message: TData = JSON.parse(data);
    if (message.type === type) {
      func(message);
    }
  }
};

export { firsttime, movetime1, movespeed1, showcar1, getname1, modify_name1 };
