export const generateRandomColor = () => {
  return `${Math.floor(Math.random()*16777215).toString(16)}`
}

export const getUserFingerPrint = (socket) => {
  let userIp = socket.handshake.headers['x-forwarded-for']
  let browser = socket.handshake.headers['user-agent']
  let browser2 = socket.handshake.headers['sec-ch-ua']
  let platform = socket.handshake.headers['sec-ch-ua-platform']
  let mobile = socket.handshake['sec-ch-ua-mobile']
  return userIp + browser + browser2 + platform + mobile
}