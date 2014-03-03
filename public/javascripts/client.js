jQuery(function($) {
  "use strict";
  //socket.ioのサーバにに接続
  var socket = io.connect('http://'+location.host+'/');
  
  //サーバDBからの初期化データで
  socket.on('init',function(chatData){
    //$('#list').append('</span>');
    chatData.forEach(function(data){
      $('#list').prepend($('<div/>').text(data.name + 
        '(' + data.ipaddress +  ')> ' + data.text));
    });
    //$('#list').prepend('<span style="font-size:x-small;">');
  });

  //サーバからmessageイベントが送信された時
  socket.on('message',function(data){
    $('#list').prepend($('<div/>').text(data.name + 
      '(' + data.ipaddress +  ')> ' + data.text));
  });

  //sendボタンがクリックされた時
  $('#send').click(function(){
    var name = $('#name').val();
    var text = $('#input').val();
    if(text !== ''){
      //サーバにテキストを送信
      socket.emit('message',{name:name, text:text});
      $('#list').prepend($('<div/>').text(name + '> ' + text));
      $('#input').val('');
    }
  });

});
