import React, { useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ImageBackground,
    TouchableOpacity,
    DeviceEventEmitter
} from 'react-native';
import SuperView from '../../super/SuperView';
import CustomText from '../../custom/CustomText';
import Theme from '../../res/styles/Theme';
import RNFetchBlob from 'rn-fetch-blob';
import CommonService from '../../service/CommonService';
import TrainService from '../../service/TrainService';
import { RNCamera } from 'react-native-camera';


export default class CameryScreen extends SuperView {
    constructor(props) {
        super(props);
        this._navigationHeaderView = {
            title: "人脸核验"
        }
        this.params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};

    }

    renderBody() {
        return (
            <View>
              <RNCamera
                ref="camera"
                style={{ width: global.screenWidth, height: 600,}}
                type={RNCamera.Constants.Type.front}
                flashMode={RNCamera.Constants.FlashMode.off}
              >
                <ImageBackground style={{ width:global.screenWidth, height:global.screenHeight,alignItems:'center' }} source={require('../../res/image/ceramy.png')} >
                   <View style={{flexDirection:'row',marginTop:50}}>
                      <CustomText style={{fontSize:24,color:'red',marginTop:-7}} text={'*'}></CustomText>
                      <CustomText style={{fontSize:14,width:250}} text={'请不要戴眼镜，正面免冠对准下方圆框，点击下方按钮进行核验。'}></CustomText>
                   </View>
                   <TouchableOpacity onPress={this.takePicture.bind(this)} style={{height:40, width:120,backgroundColor:Theme.theme,marginTop:380,alignItems:'center',justifyContent:'center',borderRadius:6}}>
                    <CustomText style={{fontSize:17,color:'#fff'}} text={'开始核验'}></CustomText>
                   </TouchableOpacity>
                </ImageBackground>

              </RNCamera>
            </View>
          );
    }

    /*
    * 点击拍照
    * */
    //拍摄照片
    takePicture(){
        const options = { quality: 0.5, base64: true }
        this.refs.camera.takePictureAsync(options).then( (response) => {
            let url = null;
            if (response.uri.search('file://') > -1) {
                url = response.uri.slice(7);
            } else {
                url = response.uri;
            }
            let pos = url.lastIndexOf('/')
            let fileName = url.slice(pos+1)
            let pname = fileName.substring(0, fileName.lastIndexOf("."))
            let phouzhui = url.substring(url.lastIndexOf(".")+1)
            let data = RNFetchBlob.wrap(url)
            let model = [];
            model.unshift({ name: pname , data: data, filename: fileName, type:phouzhui});
            this.showLoadingView('收集面部信息…');
            CommonService.OrderFileUpload(model).then(response => {
              this.hideLoadingView();
                if (response && response.success) {
                    this._upDataFacePic(response.data);
                } else {
                  this.toastMsg('上传失败');
                }
            }).catch(error => {
              this.hideLoadingView();
              this.toastMsg(error);
            })
        }).catch((error => {
          this.hideLoadingView();
            console.log("error:"+error)
        }))
    }

    _upDataFacePic = (picData) =>{
        let model = {
            TrainAccount:{ trainAccount:this.params.name, pass:this.params.passWord},
            // TrainAccount:{ trainAccount:'18518982658', pass:'901228kun'},
            photoInfo:picData[0].Url
        }
        this.showLoadingView('核验中...');
        TrainService.Train12306FaceLogin(model).then(response => {
          this.hideLoadingView();
            if (response && response.success && response.data) {
              this.toastMsg('校验通过，登录成功');
              DeviceEventEmitter.emit('load123', null);// 监听刷新 前一个页面显示登录成功的账号
              this.pop();
            } else {
              this.toastMsg('12306人脸登录失败');
            }
        }).catch(error => {
            this.hideLoadingView();
            this.toastMsg('12306人脸登录失败');
        })
    }


}
const styles = StyleSheet.create({
    row: {
        height: 50,
        paddingHorizontal: 10,
        flexDirection: 'row',
        alignItems: "center"
    }
})