# To Run
For a hotreaload development setup run
- cd into server and run `npm run server`
- cd into client and run `npm run dev`
And navigate to http://localhost:5173/ or whatever is specified in the terminal

Or to preview the deployment build, do
`npm run start` and go to  `localhost:3000`

OR
Do `heroku local` if you have Heroku setup. But you'd have to do that.

# Disco
Disco docs for recursers: disco projects:add --github elijer/jungle --name jumanji --domain jumanji.rcdis.co
The remote repo is `jungle`, I have connected my github account
disco projects:add --github elijer/jungle --name jumanji --domain jumanji.rcdis.co

# Docker
Pain point: running `docker compose up` had permissions issues, but doing `docker run -i -t <image-id>` worked fine

# Three.js
### Gotchas
- Weird location-based bug in which ghost boxes change color depending on player's current location: make sure that all materials are set to transparent before their opacity is changed (this interacts with box recycling in a weird way)

# Tone.js
https://tonejs.github.io/docs/15.0.4/index.html

# Sharing over local network:
ipconfig getifaddr en0

" The idea of, let me send the whole state and render it works, but the idea of a little extra complexity to create some divs, is way more efficient"

Jeff feature request
- W & D : be able to able to move diagonally -> for fun mode