const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const connection = require('./config/db')
const server = express();
const userRouter = require('./routes/user.routes')

server.use(express.json());
server.use('/user',userRouter)
const port = process.env.PORT;

server.listen(port, async() => {
    try {
    await connection;
    console.log('Server is running on port 3000 and database is connected');
    } catch (error) {
        console.log('Error in connecting to database',error);
    }
})