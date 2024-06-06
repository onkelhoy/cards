/**
 * @file this file is dedicated for all canvas related functionalities - this is rather simple 
 * @module engine
 * @author Henry Pap [onkelhoy@gmail.com]
 */

/**
 * @typedef {object} EngineSettings
 * @property {string} [query]
 * @property {string} [type=2d]
 * @property {number} [width] 
 * @property {number} [height] 
 * @property {Function[]} [callbacks] 
 */

export class Engine {
  /**
   * 
   * @param  {...string|EngineSettings} selectors 
   */
  constructor(...selectors) {
    // allows for multiple canvases to exist
    this.info = [];
    if (selectors.length === 0) selectors.push('canvas');
    for (const selector of selectors)
    {
      const setting = {
        query: selector.query ?? selector,
        type: selector.type ?? "2d",
        width: selector.width ?? window.innerWidth,
        height: selector.height ?? window.innerHeight,
        timer: null,
        previous: null,
        callbacks: selector.callbacks || []
      }
      const element = document.querySelector(setting.query);
      const context = element.getContext(setting.type);
      element.width = setting.width;
      element.height = setting.height;

      this.info.push({
        setting,
        element,
        context,
      })
    }
  }

  get canvas () {
    return this.getCanvas(0);
  }
  get element () {
    return this.getCanvas(0);
  }
  get setting() {
    return this.getSetting(0);
  }
  get context() {
    return this.getContext(0);
  }
  get ctx() {
    return this.getContext(0);
  }

  getSetting(index) {
    return this.info[index]?.setting;
  }
  getContext(index) {
    return this.info[index]?.context;
  }
  getElement(index) {
    return this.info[index]?.element;
  }
  getCanvas(index) { // this is mostly there as I'd probably forget about element : but element makes more sense as a name
    return this.info[index]?.element;
  }

  loop(callback, index = 0) {
    const setting = this.getSetting(index);

    const loopfunction = () => {
      let delta = -1;
      const now = performance.now();
      if (setting.previous)
      {
        delta = now - setting.previous;
      }
      setting.previous = now;
      if (callback) callback(delta);
      setting.callbacks.forEach(cb => cb(delta)); 
      this.info[index].setting.timer = requestAnimationFrame(loopfunction);
    }

    loopfunction();
  }
  stop(index) {
    const setting = this.getSetting(index);
    cancelAnimationFrame(setting.timer);
  }
}


export function LoadImage(src) {
  return new Promise(res => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      res(img);
    }
  });
}