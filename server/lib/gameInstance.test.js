import GameInstance from "./gameInstance";

describe('Game Instance Tests 🕹️', ()=> {

  const gc = {
    gridSize: 30,
    refreshRadius: 3
  }

  let g;

  beforeEach(() => {
      g = new GameInstance(
        gc.gridSize,
        gc.gridSize,
        gc.refreshRadius
      )
  });

  test('Rows and columns of game instance should be equal', ()=>{
    expect(g.rows).toEqual(g.cols)
  })

  test('GameInstance.grid length should be g.gridSize^2', ()=>{
    expect(g.grid.length).toEqual(gc.gridSize ** 2)
  })

  test('Expect all tile.space and .spirit layers to be null on creation', ()=>{
    for (let tile of g.grid){
      const { space, spirit } = tile
      expect(space).toBeNull()
      expect(spirit).toBeNull()
    }
  })

  test('Expect terrain tiles to be given a noise between 0 and 1', ()=>{
    for (let tile of g.grid){
      const { terrain } = tile
      expect(terrain.noise).toBeGreaterThanOrEqual(0)
      expect(terrain.noise).toBeLessThanOrEqual(1)
    }
  })

  test("Check that all tile x and y's are within limits", ()=>{
    for (let tile of g.grid){
      const state = tile.getState()
      expect(state.terrain.position.x).toBeLessThan(gc.gridSize)
      expect(state.terrain.position.x).toBeGreaterThanOrEqual(0)
      expect(state.terrain.position.y).toBeLessThan(gc.gridSize)
      expect(state.terrain.position.y).toBeGreaterThanOrEqual(0)
    }
  })

  
})

// Still in progress - flakey. I think that some player state issues are cropping up.
// describe('Player Behavior Tests 🕹️', ()=> {

//   const gc = {
//     gridSize: 30,
//     refreshRadius: 3
//   }

//   let g;
//   beforeEach(() => {
//       g = new GameInstance(
//         gc.gridSize,
//         gc.gridSize,
//         gc.refreshRadius
//       )
//   });

//   test("Create Player", ()=>{
//     const playerA = g.playerOnlineOrAddPlayer('z')
//     expect(playerA).toBeTruthy()
//   })


// })