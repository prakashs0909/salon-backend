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
app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.use('/api/auth', require('./routes/auth'))
app.use('/api/appointment', require('./routes/appointment'))
app.use('/api/services', require('./routes/services'))
app.use('/api/salonStatus', require('./routes/salonStatus'))

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
