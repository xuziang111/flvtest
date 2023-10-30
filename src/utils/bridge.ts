import { carMovePath, peopleMovePath } from "../constants";

export interface TData {
  type: string;
  id: string;
  position?: [number, number, number];
  speed: number;
}

const closerStack: Function[] = [];

export const removeAllListeners = () => {
  closerStack.map((closer) => {
    closer();
  });
  closerStack.length = 0;
};

function addMockListener(type: string, func: (data: TData) => void) {
  // const mockID = "mockCar";
  if (type === "EventCarMove") {
    let i = 0;
    const trigger = () => {
      if (i >= carMovePath.length) i = 0;
      func({
        type: carMovePath[i].type,
        position: carMovePath[i].position,
        id: carMovePath[i].id,
        speed: carMovePath[i].speed,
      });
      i++;
    };
    trigger();
    const interval = setInterval(trigger, 2000);
    const closer = () => clearInterval(interval);
    closerStack.push(closer);
    return closer;
  }
  if (type === "EventPeopleMove") {
    let i = 0;
    const trigger = () => {
      if (i >= peopleMovePath.length) i = 0;
      // console.log(peopleMovePath[i].position);
      func({
        type: peopleMovePath[i].type,
        position: peopleMovePath[i].position,
        id: peopleMovePath[i].id,
        speed: peopleMovePath[i].speed,
      });
      i++;
    };
    trigger();
    const interval = setInterval(trigger, 2000);
    const closer = () => clearInterval(interval);
    closerStack.push(closer);
    return closer;
  }
  if (type === "FocusOn") {
    const mockData = {
      type: "FocusOn",
      id: "mockCar",
    };
    const timmer = setTimeout(() => {
      console.debug("[Debug] FocusOn:", "mockCar");
      func(mockData);
    }, 5000);
    closerStack.push(() => timmer);
    return timmer;
  }
  // if (type === "peopleFocusOn") {
  //   const mockData = {
  //     type: "FocusOn",
  //     id: "mockPerson",
  //   };
  //   const timmer = setTimeout(() => {
  //     console.debug("[Debug] FocusOn:", "mockPerson");
  //     func(mockData);
  //   }, 5000);
  //   closerStack.push(() => timmer);
  //   return timmer;
  // }
}

// webview2 transmition
export const postMessage = (str: string) => {
  if (!window?.chrome?.webview) return;
  window.chrome.webview.postMessage(str);
};

export const addMessageListener = (
  type: string,
  func: (data: TData) => void
) => {
  if (!window?.chrome?.webview) return addMockListener(type, func);
  // listener function
  function listener({ data }: { data: string }) {
    // console.log(data);
    const message: TData = JSON.parse(data);
    // console.log(message);
    if (message.type === type) {
      func(message);
    }
  }
  window.chrome.webview.addEventListener("message", listener);
  const closer = () =>
    window.chrome.webview.removeEventListener("message", listener);
  closerStack.push(closer);
  return closer;
};
