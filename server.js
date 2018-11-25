const express     = require('express');
const app         = express();
const morgan      = require('morgan');
const compression = require('compression');
const serveStatic = require('serve-static');
const Glasses = require("./glasses");


let connects = [];

app.set('port', process.env.PORT || 3000);

app.use(morgan('dev'));
app.use(compression());
app.use(serveStatic(`${__dirname}/public`));


let glasses = new Glasses("YOUR_OBNIZ_ID");

app.ws('/', (ws, req) => {
  console.log("connection " + connects.length);
  connects.push(ws);

  ws.on('message', message => {
    // console.log('Received -', message);
    if(message.indexOf("グラデーション") >= 0 || message.indexOf("秋葉原") >= 0){
      glasses.changeMode(glasses.MODE_TYPES.GRADATION);
      message += " ###obniz### グラデーションにするよ！"
    }else if(message.indexOf("RGBW") >= 0 || message.indexOf("順番") >= 0 ){
      glasses.changeMode(glasses.MODE_TYPES.RGBCOLOR);
      message += " ###obniz### 色を順番に回すよ！"
    }else if(message.indexOf("赤") >= 0 || message.indexOf("あか") >= 0){
      glasses.changeMode(glasses.MODE_TYPES.STAY);
      glasses.color = glasses.COLOR.RED();
      message += " ###obniz### 赤に変えたよ！"
    }else if(message.indexOf("青") >= 0 || message.indexOf("あお") >= 0){
      glasses.changeMode(glasses.MODE_TYPES.STAY);
      glasses.color = glasses.COLOR.BLUE();
      message += " ###obniz### 青に変えたよ！"
    }else if(message.indexOf("緑") >= 0 || message.indexOf("みどり") >= 0){
      glasses.changeMode(glasses.MODE_TYPES.STAY);
      glasses.color = glasses.COLOR.GREEN();
      message += " ###obniz### 緑に変えたよ！"
    }else if(message.indexOf("白") >= 0 || message.indexOf("しろ") >= 0){
      glasses.changeMode(glasses.MODE_TYPES.STAY);
      glasses.color = glasses.COLOR.WHITE();
      message += " ###obniz### 白に変えたよ！"
    }else if(message.indexOf("明") >= 0){
      glasses.contrast = Math.min(1,glasses.contrast+0.3);
      message += " ###obniz### 明るくしたよ！(明るさ:" + glasses.contrast.toFixed(2) +")"
    }else if(message.indexOf("暗") >= 0){
      glasses.contrast =  Math.max(0.1,glasses.contrast-0.3);
      message += " ###obniz### 暗くしたよ！(明るさ:" + glasses.contrast.toFixed(2) +")"
    }else if(message.indexOf("ライト") >= 0){
      glasses.changeMode(glasses.MODE_TYPES.STAY);
      glasses.color = glasses.COLOR.WHITE();
      glasses.contrast =  1;
      message += " ###obniz### 明るさMAX!"
    }
    
    connects.forEach(socket => {
      socket.send(message);
    });
  });
  
  ws.on('close', () => {
    connects = connects.filter(conn => {
      return (conn === ws) ? false : true;
    });
    console.log("connection " + connects.length);
  });
});

app.listen(app.get('port'), () => {
  console.log('Server listening on port %s', app.get('port'));
});
