export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

export function toggleArrowKeyInterface(show: boolean, className: string) {
  const elements = document.querySelectorAll("." + className);
  elements.forEach(element => {
    (element as HTMLElement).style.display = show ? 'block' : 'none';
  });
}

export function hideClassIfTouchDevice(className: string) {
  if (window.matchMedia("(pointer: coarse)").matches) {
    console.log("This is a touch device");
    toggleArrowKeyInterface(true, className);
  } else {
    toggleArrowKeyInterface(false, className)
  }
}

export function throttle<T extends (...args: any[]) => void>(func: T, limit: number): T {
  let inThrottle: boolean;
  return function(this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  } as T;
}

export function gid(id: string){
  return document.getElementById(id)
}