import express, { json } from "express"
import dotenv from "dotenv/config"

const app = express()
const port = process.env.Port || 3030


app.use(json())

app.get('/', (req, res)=>{
    res.send('Happy coding')
})

app.listen(port, ()=>{
    console.log(`Server is running on port http://localhost:${port}`)
})

