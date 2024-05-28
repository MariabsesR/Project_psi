var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');

var indexRouter = require('./routes/index');


var app = express();
app.use(cors());

// como nao tenho nada escrito manda o nome teste como nome da database
//para correr no dos stores
//const mongoDB = "mongodb://psi016:psi016@localhost:27017/psi016?retryWrites=true&authSource=psi016";
//para correr no atlas
const mongoDB = "mongodb+srv://jackyxu1117:sgPM5NMJV7agXJGD@cluster0.d10p18f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
//const mongoDB = "mongodb+srv://pankenmors:bana12345@cluster0.zwkscvz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
//const mongoDB = "mongodb+srv://fc58203:palavrapasse@clusterplswork.wrsrff8.mongodb.net/?retryWrites=true&w=majority&appName=ClusterPlsWork"
//const mongoDB = "mongodb+srv://pankenmors:bana12345@cluster0.zwkscvz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
//const mongoDB = "mongodb+srv://fc58203:palavrapasse@clusterplswork.wrsrff8.mongodb.net/?retryWrites=true&w=majority&appName=ClusterPlsWork"
// Connect to MongoDB

mongoose.connect(mongoDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// Error handler middleware
app.use(function(err, req, res, next) {
  if (err.status === 404) {
    res.status(404).json({ message: 'Resource not found' });
  } else {
    // Handle other types of errors
    next(err);
  }
});


// Error handler
app.use(function(err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error');
});


const PORT = process.env.PORT || 3066;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
