export const generateRandomColor = () => {
  return Math.floor(Math.random() * 16);
}

export const colorKey = [
  "131321",
  "173059",
  "1E355E",
  "58515F",
  "806146",
  "BD8052",
  "#E0B495",
  "E901EF",
  "EF6DAC",
  "FFFFFE",
  "02C6B2",
  "0287F2",
  "02745C",
  "024B48",
  "01A292",
  "0000F7"
]

export function getColor(key){
  return colorKey[key]
}