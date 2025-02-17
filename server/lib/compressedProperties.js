export const generateRandomColorNumber = () => {
  const randomNum = Math.floor(Math.random() * colorKey.length)
  console.log("random color", colorKey[randomNum]);
  return colorKey[randomNum]
}

export const colorKey = [
  "0x806146", // beige, it's okay
  "0xBD8052", // nicer beige
  // "0xEF6DAC", // not a terrible pink
  // "0xFFFFFE", // weird white
  "0x02C6B2", // nice green
  "0x0287F2", // nice blue, maybe a bit intense though
  "0x02745C", // hell yeah, great subdued green
  "0x01A292", // yet another beautiful green
]

export function getColor(key){
  return colorKey[key]
}