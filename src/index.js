import dotenv from "dotenv"
import { app } from "./app.js";
import connectDB from "./db/index.js";

dotenv.config({ //its used to config where my variables are in the file  
    path: "./.env"
})

const PORT = process.env.PORT || 8001;

app.get("/", (req, res) => {
    res.send("Hello World")
});

connectDB()
.then(() => {
   app.listen(PORT, () =>{
    console.log(`Server is listening at port: ${PORT}`)
   })
})
.catch((error) =>{
    console.log("Mongodb connection error", error)
})

