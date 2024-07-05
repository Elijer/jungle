import yup from 'yup';

// This is what an object inside of a state grid can look like
// Players, terrain, and whatever else may follow
const positionSchema = yup.object({
  x: yup.number().required(),
  y: yup.number().required()
})

export const stateSchema = yup.object({
  id: yup.string().required(),
  position: positionSchema,
  geometry: yup.string().required(),
  color: yup.string(),
  layer: yup.string().required(),
})

// This is what a socket update event can return
// export const actionResultSchema = yup.object({
//   color: yup.string().required(),
//   geometry: yup.string().required(),
//   id: yup.string().required(),
//   position: yup.object({
//     x: yup.number().required(),
//     y: yup.number().required()
//   }),
//   layer: yup.string().required(),
// })

// It would be kind of cool to unify these by never passing state,
// But initial state is useful to pass
// Ultimately it's necessary because the alternative is passing the entire game state in the form of individual entity updates