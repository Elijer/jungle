import { v4 as uuidv4 } from 'uuid';

export default class Entity {
  constructor(cohort, position, id){
    this.id = id ?? uuidv4()
    this.cohort = cohort
    this.position = position
    cohort[this.id] = position
  }

  getState(){
    return{
      id: this.id
    }
  }
}