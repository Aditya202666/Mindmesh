import { nanoid } from "nanoid";

const  generateId = (prefix) =>{

    return `${prefix}-${nanoid()}`
}

export default generateId