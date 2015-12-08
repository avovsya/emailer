var express        = require('express');
var path           = require('path');
var logger         = require('morgan');
var bodyParser     = require('body-parser');
var multer         = require('multer');
var upload         = multer({ storage: multer.memoryStorage() }); // NOT IN PRODUCTION!

var router         = express.Router();
var lettersHandler = require('./routes/letters');

var app            = express();

app.use(logger('dev'));
app.use(bodyParser.json());
// app.use(express.static(path.join(__dirname, 'public')));
app.use('/swagger', express.static(path.join(__dirname, 'swagger')));

router.post('/letters', lettersHandler.create);
router.post('/letters/:id/send', lettersHandler.send);
router.put('/letters/:id', upload.single('file'), lettersHandler.addAttachment);

app.use('/api/1/', router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send({
      success: false,
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.send({
    success: false,
    message: err.message,
    error: err
  });
});

module.exports = app;
