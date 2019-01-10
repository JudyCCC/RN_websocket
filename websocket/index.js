import md5 from 'md5';
// import AES from 'aes';
import WebSocket from 'websocket';
import * as CryptoJS from 'crypto-js';

const W3CWebSocket = WebSocket.w3cwebsocket;
/**
 * 
 * 前端的WebSocket开发库
 * 依赖AES,MD5,Base64的加密库
 * 
 */
var MessageType = {
  CommonMessage: "CommonMessage",   //普通消息
  ChannelMessage: "ChannelMessage",   //通道
  AutoResponse: "AutoResponse",   //自动回复
  Reach: "Reach",   //已达
  Read: "Read"    //已读
}
/**
* 传入服务器地址，
* {url:'',socketKey:'',token:'',onMessage:function(){},onError:function(){},onOpen:function(){},onClose:function():{}}
*/
function MgoClient(m) {

  // var MgoClient=function(m){
  //第一步创建连接，构建请求参数
  if (m == null || m.token == null || m.socketKey == null || m.url == null) {
    console.error("参数错误，请检查参数！")
    return null;
  }

  // var url = m.url;
  var url =m.url + "?token=" + (encrypt("register", m.socketKey)).replace(/=/g, "") + "&solt=" + m.token;
  var socket = new W3CWebSocket(url);
  socket.onopen = function () {
    console.log('open');
    //发送获取本通道的命令
    var content = new MgoMessage("MgoMachine", "Get channel info.", MessageType.ChannelMessage, "null");
    socket.send(encrypt(JSON.stringify(content), m.socketKey));
    if (m.onOpen != null && typeof m.onOpen === "function") {
      m.onOpen()
    }
  }
  socket.onerror = function (err) {
    console.log('onerror');
    console.log(err);
    if (m.onError != null && typeof m.onError === "function") {
      m.onError()
    }
  }
  socket.onmessage = function (mg) {
    console.log('onmessage');
    var data = JSON.parse(decrypt(mg.data, m.socketKey));

    console.log('data');
    console.log(data);

    if (data.messageType == MessageType.AutoResponse) {
      this.sender = data.receiver
    } else if (data.messageType == MessageType.CommonMessage) {
      var content=new MgoMessage(data.sender,"",MessageType.Read,data.receiver,data.id);
      socket.send(encrypt(JSON.stringify(content),m.socketKey));
    }
    if (m.onMessage != null && typeof m.onMessage === "function") {
      m.onMessage(data);
    }
  }
  this.send = function (content, receiver) {
    if (this.sender == null) {
      var content = new MgoMessage(receiver, content, MessageType.CommonMessage, m.solt);
      socket.send(encrypt(JSON.stringify(content), m.socketKey))
    } else {
      console.info("发送失败，校验未通过!")
    }
  }
  socket.onclose = function () {
    console.info("连接已经断开")
    if (m.onClose != null && typeof m.onClose === "function") {
      m.onClose()
    }
  }
  this.socket=socket;
  
  return this;
}

var uuid = function () {
  var s = [];
  var hexDigits = "0123456789abcdef";
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";

  var uuid = s.join("");
  return uuid;
}

/**
* 构建对应的消息对象
* @param recevier 消息的接收者
* @param content 消息的内容
* @param messageType 消息类型
*/
const MgoMessage = function (receiver, content, messageType, sender, id) {
  if(id==null)
  this.id = uuid();
  else 
  this.id = id;
  this.content = content;
  this.messageType = messageType;
  this.receiver = receiver;
  this.sender = sender;
  this.sendTime = new Date();
  this.sign = md5(this.content + this.receiver + this.sender + this.sendTime.getTime());
  return this;
}

/**
* 加密
*/
function encrypt(word, socketToken) {
  var key = CryptoJS.enc.Utf8.parse(socketToken);
  var srcs = CryptoJS.enc.Utf8.parse(word);
  var encrypted = CryptoJS.AES.encrypt(srcs, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
  return encrypted.toString();
}

/**
* 解密
* @param word
*/
function decrypt(word, socketToken) {
  var key = CryptoJS.enc.Utf8.parse(socketToken);
  var decrypt = CryptoJS.AES.decrypt(word, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
  return CryptoJS.enc.Utf8.stringify(decrypt).toString();
}

export { MgoClient, MessageType };