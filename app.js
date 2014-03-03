
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var MongoStore = require('connect-mongo')(express);
var mongoose = require('mongoose');
var socketio = require('socket.io');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.bodyParser());
app.use(express.cookieParser()); 
app.use(express.session({
    secret: 'secret',
    store: new MongoStore({
        db: 'session',
        host: 'localhost',
        clear_interval: 60 * 60
    }),
    cookie: {
        httpOnly: false,
        maxAge: new Date(Date.now() + 60 * 60 * 1000)
    }
})); 

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var loginCheck = function(req, res, next) {
    if(req.session.user){
      next();
    }else{
      res.redirect('/login');
    }
};

// app.get('/', routes.index);
// app.get('/users', user.list);
app.get('/', loginCheck, routes.index);
app.get('/login', routes.login);
app.post('/add', routes.add);
app.get('/logout', function(req, res){
  req.session.destroy();
  console.log('deleted sesstion');
  res.redirect('/');
});

var server = http.createServer(app);
// http.createServer(app).listen(app.get('port'), function(){
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// 待ち受けをSocket.IOに渡す
var io = socketio.listen(server);

//storechatというコレクションを使って（始めは作って）
var db = mongoose.connect('mongodb://localhost/storechat')
//スキーマ宣言
var ChatSchema = new mongoose.Schema({
  text:{type: String}
  ,name:{type: String}
  ,ipaddress:{type: String}
});
//スキーマからモデル生成
var Chat = db.model('chat', ChatSchema);

// クライアントの接続対応
io.sockets.on('connection',function(socket){
  //初めにチャットの全データをクライアントがもらう。
  Chat.find(function(err, items){
    if(err){console.log(err);}
    //接続ユーザにDBのデータ送信
    socket.emit('init', items);
  });

  // 個々のクライアントからの通信
  socket.on('message',function(data){
    // クライアントからもらってきたデータ（名前とメッセージ）を取得
    var chat = new Chat(data);
    // クライアントのアドレスを取得する
    chat.ipaddress = socket.handshake.address.address
      + ':' + socket.handshake.address.port;
    chat.save(function(err){
      if(err){return;}
      socket.broadcast.emit('message',chat);
    });
  });
});
