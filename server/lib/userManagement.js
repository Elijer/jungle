
let IPs = {}
let sampleWindow = 1000
let requestLimit = 12

const getUserFingerPrint = (socket) => {
  let userIp = socket.handshake.headers['x-forwarded-for']
  let browser = socket.handshake.headers['user-agent']
  let browser2 = socket.handshake.headers['sec-ch-ua']
  let platform = socket.handshake.headers['sec-ch-ua-platform']
  let mobile = socket.handshake['sec-ch-ua-mobile']
  return userIp + browser + browser2 + platform + mobile
}

export const logOffPrimaryUser = (socket) => {
  let userIp = getUserFingerPrint(socket)
  if (IPs[userIp] && IPs[userIp].id === socket.id) delete IPs[userIp].id
}

// Limit only one IP/user agent per socket, and also limit rate of requests
export const isUserLegit = (socket) => {

  let now = Date.now()

  if (!socket.handshake.headers['x-forwarded-for']) return true // local host
  let userIp = getUserFingerPrint(socket)

  if (!userIp) return true

    // No record of user fingerprint exists; create one
    if (!IPs[userIp] || !IPs[userIp].requests || !IPs[userIp].lastRequest){
      IPs[userIp] = {
        id: socket.id,
        requests: 0,
        lastRequest: now
      }
      IPs[userIp].requests++
      return true
    }

    let userRecord = IPs[userIp]

    // If a record but not the current user's socket, don't let them vibe
    if (userRecord && userRecord.id && userRecord.id !== socket.id){
      socket.emit("redundant connection", "redundant connection")
      console.log("User action rejected - you are late to the party")
      return false
    }

    if (now - userRecord.lastRequest > sampleWindow){
      userRecord.requests = 1
      userRecord.lastRequest = now
      console.log("User action accepted - new sample window")
      return true
    }

    if (userRecord.requests >= requestLimit) {
      socket.emit("rate limit exceeded", "rate limit exceeded")
      console.log("User action rejected - rate limit exceeded")
      return false
    }

    userRecord.requests++
    console.log("User action accepted")
    return true

}