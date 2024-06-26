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