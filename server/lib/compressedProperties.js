export const generateRandomColorNumber = () => {
  const randomNum = Math.floor(Math.random() * colorKey.length)
  console.log("random color", colorKey[randomNum]);
  return colorKey[randomNum]
}

export const colorKey = [
  "0x131321",
  "0x173059",
  "0x1E355E",
  "0x58515F",
  "0x806146",
  "0xBD8052",
  "0x#E0B495",
  "0xE901EF",
  "0xEF6DAC",
  "0xFFFFFE",
  "0x02C6B2",
  "0x0287F2",
  "0x02745C",
  "0x024B48",
  "0x01A292",
  "0x0000F7"
]

export function getColor(key){
  return colorKey[key]
}