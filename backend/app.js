const express = require('express');
const morgan = require('morgan');
const nodemon = require('nodemon');
const cors = require('cors');
const signupRoute = require('./routes/signupRoute');
const loginRoute = require('./routes/loginRoute');
const uploadRoute = require('./routes/uploadRoute');
const allItemRoute = require('./routes/allItemRoute');
const updateRoute = require('./routes/updateRoute');
const deleteRoute = require('./routes/deleteRoute');
const salesrecordRoute = require('./routes/salesRoute');
const viewbranchsalesRoute = require('./routes/viewbranchsalesRoute');
const categoryCRUDRoute = require('./routes/categoryCRUDRoute');
const app = express();


let corsOptions = {
    origin: ['http://127.0.0.1:5173', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  };

app.use(express.json());
app.use(morgan("dev"));
app.use(cors(corsOptions));
app.use('/images', express.static('images'));

app.use('/api', signupRoute);
app.use('/api', loginRoute);
app.use('/api', uploadRoute);
app.use('/api', allItemRoute);
app.use('/api', updateRoute);
app.use('/api', deleteRoute);
app.use('/api', salesrecordRoute);
app.use('/api', viewbranchsalesRoute);
app.use('/api', categoryCRUDRoute);

app.listen(3000, () => {
    console.log('Server running on port 3000');
});