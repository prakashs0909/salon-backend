const connectToMongo = require('./db');
const express = require('express');
var cors = require('cors');
require('dotenv').config()

connectToMongo();

const app = express()
const port = process.env.PORT

app.use(cors());
app.use(express.json());

//Available routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/appointment', require('./routes/appointment'))
app.use('/api/services', require('./routes/services'))

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
