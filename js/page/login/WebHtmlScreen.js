import React, { Component } from 'react'
import { Text, StyleSheet, View, Button, TouchableOpacity } from 'react-native'
import WebView from 'react-native-webview'
import SuperView from '../../super/SuperView';
import CryptoJS from "react-native-crypto-js";//加密、解密
import Key from '../../res/styles/Key';
import CommonService from '../../service/CommonService';
import StorageUtil from '../../util/StorageUtil';
const FCM_SHOW_ADLIST = 'FCMSHOWADLIST';

export default class WebHtmlScreen extends SuperView {
  constructor(props) {
    super(props);
    this.params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};
    this.state = {
        linkStr:'',
    }
  }


  renderBody() {
    const {linkStr, emailStr} = this.params;
    const injectedJavascript = `(function() {
      window.postMessage = function(data) {
        window.ReactNativeWebView.postMessage(data);
      };
    })()`;
    return (
      <View style={{flex:1}}> 
        <WebView 
            onMessage={(event) => {
              let uname= JSON.parse(event.nativeEvent.data)
              if( !uname.Token ){ return }
              let cipher_token = CryptoJS.AES.encrypt(uname.Token , Key.TOKEN).toString();
              this.showLoadingView();
              StorageUtil.saveKeyId(Key.TOKEN, cipher_token, 1000 * 3600 * 24 * 30).then(() => {
                CommonService.getUserInfo().then(result => {
                  this.hideLoadingView();
                  if (result && result.success && result.data) {
                    StorageUtil.removeKey(Key.UserLogo);
                    // UMNative.profileSignInWithPUID(result.data.Id.toString());
                    StorageUtil.saveKeyId(FCM_SHOW_ADLIST,'on');
                    StorageUtil.saveKeyId(Key.SaveSsoEmal, emailStr);
                    this.push('Main');
                  } else {
                  }
                }).catch(error => {
                  this.hideLoadingView();
                  this.toastMsg(error.message);
                });
              });

            }} 
            injectedJavaScript={injectedJavascript} 
            onLoad={this.webviewload}
            source={{uri:linkStr}}
            />
      </View>
    )
  }
}

const styles = StyleSheet.create({})
