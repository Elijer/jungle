const thousands = (num: number | string): string => {
  // Convert string to number if num is a string
  const value = typeof num === 'string' ? parseFloat(num) : num;

  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'm'; // Convert to millions with one decimal place
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'k'; // Convert to thousands with one decimal place
  } else {
    return value.toString(); // Numbers less than 1000 remain unchanged
  }
}

const memoryCheck = () => {
  if ('deviceMemory' in navigator) {
    console.info(`Device memory: ${navigator.deviceMemory} GB`);
  }
}

const memoryCrashAvoider = (limit: number) => {
  if (window.performance && (window.performance as Performance & { memory: any }).memory){
    if ((window.performance as Performance & { memory: any }).memory.usedJSHeapSize > (window.performance as Performance & { memory: any }).memory.jsHeapSizeLimit * limit){
      console.log("Heap is full, reloading")
      window.location.reload()
    }
  }
}

export { thousands, memoryCrashAvoider, memoryCheck }