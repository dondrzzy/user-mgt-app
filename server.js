if (process.env.NODE_ENV !== 'production') {
  require('dotenv').load();
}

var express = require('express');
var app = express();
var morgan = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var conf = require('./config/database');
var apiRoutes = require('./app/routes/api');
var path = require('path');

var passport = require('passport')
var social = require('./app/passport/passport')(app, passport);

const PORT = process.env.PORT || 8080;

//Middleware
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.use('/api/v1', apiRoutes);

//connect to the db
mongoose.connect(conf.dbUri, { useNewUrlParser: true })
//on conn
mongoose.connection.on('connected', () => console.log('connected to database at 27017'));
//incase of error in conn
mongoose.connection.on('error', err => {
  if (err) { console.log('Error in database conn', err);}    
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
});

app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});
