var retry = 0;

var retryTime = [
    1,1,2,5,10,20,30,60,120,300,
]

var HOST = location.origin.replace(/^http/, 'ws');
var ws;

function send(text){
  if(ws){
    ws.send(text);
  }
  return false;
}
function connect() {
  ws = new WebSocket(HOST);
  
  var form = document.querySelector('.form');


  form.onsubmit = function() {
    var input = document.querySelector('.input');
    var text = input.value;
    ws.send(text);
    input.value = '';
    input.focus();
    return false;
  }

  ws.onmessage = function(msg) {
    var response = msg.data;
    let data = response.split("###obniz###")
    append(data[0],data[1]);
  }

  ws.onerror = function(err){
    append(null,"Websocketエラーが発生しました "+ (err.message ? err.message : err));
  }
  ws.onopen = function(){
    retry = 0;
    append(null,"Websocketに接続しました");
  }
  ws.onclose = function(){
    let time = retryTime[retry];
    if(!time){
      time = 500;
    }
    retry++;
    ws = undefined;
    append(null,"Websocketが切断されました "+time+"秒後に再接続を試します");
    setTimeout(connect,time*1000);
  }
}


function append(text,systemMessage){
  var messageList = document.querySelector('.messages');
  var li = document.createElement('li');
  var span = document.createElement('span');
  span.innerText = text;
  li.appendChild(span)
  if(systemMessage) {
    var systemSpan = document.createElement('span');
    systemSpan.innerText = systemMessage;
    systemSpan.style.color = "red";
    li.appendChild(systemSpan);
  }
  messageList.insertBefore(li, messageList.firstChild);
}

connect();