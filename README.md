# About
A 3D multiplayer online game build with Typescript, Node, 3JS, Websockets, and tested with Playwright. Optimization improvements are still underway. The next phase after optimization is interactivity gameplay.
- [The Vision](https://elijer.github.io/garden/Projects/Eco-Mog)
- [Notes on Optimization](https://elijer.github.io/garden/Dev-Notes/Javascript/9-Ways-to-optimize-a-Node-Webapp)

# Live App
[Live Demo](https://jungle.rcdis.co/)
- WASD to move (sorry Devorak, having reached you yet)
- Check that browser VIM bindings aren't interfering

## Debugging view
- 0 to toggle 3D debugging view
- click and drag to change angle
- click shift drag to pan

# To Run

## Quick Setup
```
git clone https://github.com/Elijer/jungle; cd jungle; npm start;
```
The app should now be running at: [http://localhost:3000/](http://localhost:3000/)

## Dev Setup
For hot-reloading 
```
git clone https://github.com/Elijer/jungle;
cd jungle;
npm i;
```

Run the server:
```
cd server;
npm run serve;
```

Run the client from `jungle/client`:
```
npm i;
npm run dev;
```

Welcome to the jungle!
You should see [http://localhost:5173/](http://localhost:5173/) displayed as the port where the game's frontend is being served

# Testing
Start at the top-level directory of the project.
```
npm run test;
```

In order to print results from paralell tests,
```
cd testServer;
node index.js
```
This runs a testing server that aggregates results from multiple browser instances. I am still looking for a way to do in a more playwright-specific way. Playwright has a `teardown` function that can be implemented that may work for this case.

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
VSCode has a tab that makes this easier called `ports`.

ipconfig getifaddr en0

Jeff feature request
- W & D : be able to able to move diagonally -> for fun mode
