import express from "express";
import mongoose from "mongoose";
import cors from "cors";
// const morgan = require("morgan");
import dotenv from 'dotenv'
import { readdirSync } from 'fs'

dotenv.config();

const app = express();

const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ["GE", "POST"],
        allowedHeaders: ["Contet-type"]
    }
})





mongoose.connect(`mongodb+srv://hadiraza:852728..@hadiraza.btzq4od.mongodb.net/?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('db connected'))
    .catch((err) => console.log(err))


app.use(express.json({ limit: "5mb" }))
app.use(express.urlencoded({ extended: true }))
app.use(cors({
    origin: [process.env.CLIENT_URL]
}));


// auto load routes
// readdirSync('./routers').map((r) => app.use('/api', require(`./routers/${r}`)))

import AuthRouter from './routers/Auth'
import PostRouter from './routers/PostRouter'

app.use('/api', AuthRouter)
app.use('/api', PostRouter)


// socket.io 
// real time
// io.on('connect', (socket) => (
//     // console.log("socket.io", socket.id)
//     socket.on('send-message', (message) => (
//         console.log("message recived", message)
//     ))
// ))


if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'mine/build')))

    app.get('*', (req, res) =>
        res.sendFile(path.resolve(__dirname, 'mine', 'build', 'index.html'))
    )
} else {
    app.get('/', (req, res) => {
        res.send('API is running....')
    })
}



app.listen(process.env.PORT || 8000, () => console.log(`server is running on ${process.env.PORT}`))