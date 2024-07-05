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