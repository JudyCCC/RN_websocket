/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
} from 'react-native';
// import { Button } from 'antd-mobile-rn';
import {MgoClient,MessageType} from './websocket/index';
import './util/base';
import axios from 'axios'

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      token1:'',    //用户1的token
      socketKey1:'',    //用户1的socketKey
      token2:'',    //用户2的token
      socketKey2:'',    //用户2的socketKey
      talk:[],    //聊天框
      text1:'',   //user1的输入框
      text2:'',   //user2的输入框
    }
  }

  // componentWillMount(){
  //   global._c.mc1 = this.newMC1();
  //   global._c.mc2 = this.newMC2();
  // }

  componentDidMount(){
    this.getInfo();
  }
  
  getInfo = () => {
    // axios.post('http://119.27.165.230:8080/gwx/api/user',{})
    // .then((res) => {
    //   this.setState({
    //     token1:res.data[0].token,
    //     socketKey1:res.data[0].socketKey,
    //     token2:res.data[1].token,
    //     socketKey2:res.data[1].socketKey,
    //   },()=>{
    //     global._c.mc1 = this.newMC1();
    //     global._c.mc2 = this.newMC2();
    //   });
    // })
    // .catch((err) => {
    //   console.log(err);
    // });
    this.setState({
      token1:"IXGlUfnZEH3EXOun98n2BbNspNLcc5rqVkoZ3BXkUKkxIh7AlNl9ZykW3ebQmzu2tiJHdc1IS5DYteHezeaIhQ",
      socketKey1:"9cfe189524dbd5a1b810e6825a101723"
    },()=>{
      global._c.mc1 = this.newMC1();
    })
  }

  onButtonPress1 = () => {
    // global._c.mc = this.newMC();
    // console.log(global._c.mc);
    global._c.mc1.send(this.state.text1,'050000026000540511');

    //实际写到onmessage中，此处假设网络良好，发送成功
    // this.setState({
    //   talk:[...this.state.talk,{msg:this.state.text1,user:'1'}],
    //   text1:'',
    // });
    
  };

  onButtonPress2 = () => {
    // global._c.mc = this.newMC();
    // console.log(global._c.mc);
    global._c.mc2.send(this.state.text2,'050000030206761641');

    //实际写到onmessage中，此处假设网络良好，发送成功
    // this.setState({
    //   talk:[...this.state.talk,{msg:this.state.text2,user:'2'}],
    //   text2:'',
    // });
  };

  newMC1 = () => {//张伟
    let mc = new MgoClient({
      // url:"ws://119.27.165.230:2020/socket",
      url:"ws://10.10.1.228:2020/socket",
      socketKey:this.state.socketKey1,
      token:this.state.token1,
      onMessage:(data)=>{
        if (data.messageType == MessageType.Reach) {
          this.setState({
            talk:[...this.state.talk,{msg:this.state.text1,user:'1'}],
            text1:'',
          });
        } else if (data.messageType == MessageType.CommonMessage) {
          console.log(data);
        }
      },
      onClose:()=>{
        let timer = setTimeout(()=>{
          clearTimeout(timer);
          this.newMC1();
        },5000);
      }
    });
    return mc;
  }

  newMC2 = () => {    //何
    let mc = new MgoClient({
      url:"ws://119.27.165.230:2020/socket",
      socketKey:this.state.socketKey2,
      token:this.state.token2,
      onMessage:(data)=>{
        if (data.messageType == MessageType.Reach) {
          this.setState({
            talk:[...this.state.talk,{msg:this.state.text2,user:'2'}],
            text2:'',
          });
        } else if (data.messageType == MessageType.CommonMessage) {
          console.log(data);
        }
      },
      onClose:()=>{
        let timer = setTimeout(()=>{
          clearTimeout(timer);
          this.newMC2();
        },5000);
      }
    });
    return mc;
  }

  render() {
    return (
      <View style={styles.container}>
        <View>
          {
            this.state.talk.map((tk,index) => (
              <Text key={index} style={tk.user==='1'?styles.viewLeft:styles.viewRight}>{tk.msg}</Text>
            ))
          }
        </View>
        <TextInput
          style={{height: 40, width: 150, borderColor: '#841584', borderWidth: 2}}
          onChangeText={(text) => {if(text!=null){this.setState({text1:text})}}}
          value={this.state.text1}
        />
        <Button
          onPress={this.onButtonPress1}
          title="sendMessage1"
          color="#841584"
        />
        <TextInput
          style={{height: 40, width: 150, borderColor: '#d06045', borderWidth: 2}}
          onChangeText={(text) => {if(text!=null){this.setState({text2:text})}}}
          value={this.state.text2}
        />
        <Button
          onPress={this.onButtonPress2}
          title="sendMessage2"
          color="#d06045"
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  viewLeft:{
    borderWidth:1,
    borderColor:'#841584',
    marginBottom:5,
    padding:10,
  },
  viewRight:{
    borderWidth:1,
    borderColor:'#d06045',
    marginBottom:5,
    padding:10,
  }
});