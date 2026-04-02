import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Linking,
    DeviceEventEmitter,
    Platform
} from 'react-native';
import SuperView from '../../super/SuperView';
import CustomText from '../../custom/CustomText';
import CustomeTextInput from '../../custom/CustomTextInput';
import Theme from '../../res/styles/Theme';
import I18nUtil from '../../util/I18nUtil';
import TrainService from '../../service/TrainService';
import StorageUtil from '../../util/StorageUtil';

class TrainValidateScreen extends SuperView {

    constructor(props) {
        super(props);
        this.params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};
        this._navigationHeaderView = {
            title: I18nUtil.translate('短信核验'),
        }
        this.state = {
            VerificatCode:''
        }
    }

    renderBody() {
        const{} = this.state;
        return (
            <View style={{padding:15}}>
                <View style={{flexDirection:'row',alignItems:'center'}}>
                    <CustomText text={'*'} style={{color:'red',fontSize: 26}}></CustomText>
                    <CustomText text={'请按以下程序进行手机双向核验'} style={{}}></CustomText>
                </View>
                <CustomText text={'第一步：请您用手机尾号XXXX发送短信666至12306，以便确认您的手机可以联络。'} style={{}}></CustomText>
                <CustomText text={'第二步：12306接收到您的短信后将给你的手机回复六位数字短信，请您在十分钟内将六位数字短信填写在下方空白框中，并点击完成校验按钮。'} style={{}}></CustomText>
                <View style={{flexDirection:'row',height:50,paddingLeft:15,alignItems:'center',borderBottomWidth:0.5,borderColor:Theme.lineColor,marginTop:30,backgroundColor:'#fff',borderRadius:3}}>
                    <CustomText style={{flex:1.5,}} text='核验码'/>
                    <CustomeTextInput placeholder='发送短信666到12306获取' style={{flex:5}}  onChangeText={(text) => {this.setState({VerificatCode:text})}} />
                    <CustomText style={{ fontSize: 15, color: 'rgba(0, 122, 204, 1)',textDecorationLine:'underline', flex:3 }} 
                                            onPress={this._btnContactMessege}
                                            text={'发送短信息'} />
                </View>
                <View style={{marginTop:10}}>
                    <TouchableOpacity onPress={this._relactClick}
                        style={{backgroundColor:Theme.theme,height:50,borderRadius:4,marginTop:10,justifyContent:'center',alignItems:'center'}}>
                       <CustomText style={{color:'#fff',fontSize:17}} text={'完成校验'}/>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    _btnContactMessege =()=> {
        let phoneNumber = '12306';
        let message = '666';
        let smsUrl;
        if (Platform.OS === 'android') {
            smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
        }else{
            smsUrl = `sms:${phoneNumber}&body=${encodeURIComponent(message)}`;
        }        
        Linking.canOpenURL(smsUrl).then(supported => {
            if (supported) {
              Linking.openURL(smsUrl);
            } else {
              console.log('Cannot send SMS');
            }
        });
    }

    _relactClick=()=>{
        const {name,passWord,orderNum,value} = this.params
        const { VerificatCode } = this.state
        if(!VerificatCode){
            this.toastMsg('请填写核验码');
            return;
        }
        let SmsVerifyModel = {
            OrderId:orderNum?orderNum:'',
            TrainAccount:{
                trainAccount:name,
                pass:passWord,
            },
            RememberPassword:value, 
            VerifyCode:VerificatCode,
        }
        TrainService.Train12306SmsVerify(SmsVerifyModel).then(response =>{
            if (response && response.success) {
                DeviceEventEmitter.emit('load123', null);// 监听刷新 前一个页面显示登录成功的账号
                StorageUtil.saveKey('login12306Data',response.data);
                this.pop();
                
            }else{
                this.toastMsg(response.message||'操作失败');
            }
        }).catch(error => {
            this.hideLoadingView();
            this.toastMsg(error.message || '操作失败');
        })
    }

}

export default TrainValidateScreen;

const styles = StyleSheet.create({
    
})