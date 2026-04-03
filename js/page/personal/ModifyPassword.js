import React from 'react';
import {
    View,
    Text,
} from 'react-native';
import SuperView from '../../super/SuperView';
import ViewUtil from '../../util/ViewUtil';
import SimpleInput from '../../custom/SimpleInput';
import UserInfoDao from '../../service/UserInfoDao';
import CommonService from '../../service/CommonService';
import Theme from '../../res/styles/Theme';
import AntDesign from 'react-native-vector-icons/AntDesign';
import CustomText from '../../custom/CustomText';
// import AliyunPush from 'react-native-aliyun-push';


export default class ModifyPassword extends SuperView {
    constructor(props) {
        super(props);
        this._navigationHeaderView = {
            title: '修改密码',
            // rightButton: ViewUtil.getRightButton('完成', this._btnModifyPassword)
        }
        this.state = {
            curPassword: '',
            newPassword: '',
            rePassword: '',
            eyeOff1:true,
            eyeOff2:true,
            eyeOff3:true,
        }
    }
    /**
     *  完成操作
     */
    _btnModifyPassword = () => {
        const { curPassword, newPassword, rePassword } = this.state;
        if (!curPassword) {
            this.toastMsg('请输入当前密码');
            return;
        }
        if (!newPassword) {
            this.toastMsg('请输入新密码');
            return;
        }
        if (!rePassword) {
            this.toastMsg('请再次输入新密码');
            return;
        }
        let modifyModel = {
            OldPassword: this.state.curPassword,
            NewPassword: this.state.newPassword,
            ReNewPassword: this.state.rePassword
        }
        this.showLoadingView();
        CommonService.modifyPassword(modifyModel).then(response => {
            this.hideLoadingView();
            if (response && response.success) {
                this.showAlertView('修改密码成功，请重新登录', () => {
                    return ViewUtil.getAlertButton('确定', () => {
                        this.dismissAlertView();
                        this.showLoadingView();
                        CommonService.logout().then(response => {
                            if (response && response.success) {
                                UserInfoDao.removeAllInfo().then(() => {
                                    this.hideLoadingView();
                                    // UMNative.profileSignOff();
                                    this.push('Init');
                                }).catch(error => {
                                    this.hideLoadingView();
                                    this.toastMsg(error.message || '退出登录失败');
                                })
                                // // 注销推送标签
                                // AliyunPush.listTags(1).then((result)=>{
                                //     // console.log("listTags1 success");
                                //     // console.log(JSON.stringify(result));
                                //     let arr = result.split(",")
                                //     AliyunPush.unbindTag(1,arr,"")
                                //     .then((result)=>{
                                //         // console.log("unbindTag succcess");
                                //         // console.log(JSON.stringify(result));
                                //     })
                                //     .catch((error)=>{
                                //         console.log("unbindTag error");
                                //         console.log(JSON.stringify(error));
                                //     });
                                // }).catch((error)=>{
                                //     console.log("listTags error");
                                //     console.log(JSON.stringify(error));
                                // });
                            } else {
                                this.hideLoadingView();
                                this.toastMsg(response.message || '退出登录失败');
                            }
                        }).catch(error => {
                            this.hideLoadingView();
                            this.toastMsg(error.message || '退出登录失败');
                        });
                    })
                })
            } else {
                this.toastMsg(response.message || '修改密码失败');
            }
        }).catch(error => {
            this.hideLoadingView();
            this.toastMsg(error.message || '修改密码异常');
        })

    }
    renderBody() {
        const { eyeOff1,eyeOff2,eyeOff3 } = this.state;
        // () => { this.setState({ secureTextEntry: !secureTextEntry }) }
        let markStr="密码长度为 8-32 位，且须同时包含数字、大写字母、小写字母、符号。"
        return (
            <View style={{ flex: 1 }}>
                <View style={{ flex: 1 }}>
                <View style={{ borderTopWidth:1, borderColor:Theme.lineColor,justifyContent:'center',alignItems:'center', padding:15,backgroundColor:Theme.yellowBg}}>
                     <Text style={{flexDirection:'row',lineHeight:18}}>
                        <AntDesign name={'exclamationcircleo'} color={Theme.theme} backgroundColor={'yellow'} size={14}/> 
                        <CustomText text={' '} style={{fontSize:12, color:Theme.theme}}/>
                        <CustomText text={markStr} style={{fontSize:12, color:Theme.theme}}/>
                     </Text>
                </View>
                <View style={{padding:10,backgroundColor:'#fff',margin:10,borderRadius:6}}>
                    <SimpleInput name='当前密码' 
                             maxLength={20} 
                             placeholder='请输入当前密码' 
                             action={curPassword => { this.setState({ curPassword }) }} 
                             style={{ }} 
                             secureTextEntry={eyeOff1} 
                             eyeOffAction = {()=>{this.setState({ eyeOff1: !eyeOff1 })}}
                             />
                
                    <SimpleInput name='新密码' maxLength={20} placeholder='请输入新密码' 
                                 action={newPassword => { this.setState({ newPassword }) }} 
                                 secureTextEntry={eyeOff2}
                                 eyeOffAction = {()=>{this.setState({ eyeOff2: !eyeOff2 })}}
                                />
                    <SimpleInput name='确认密码' maxLength={20} placeholder='请再次输入新密码' 
                                 action={rePassword => { this.setState({ rePassword }) }} 
                                 secureTextEntry={eyeOff3}
                                 eyeOffAction = {()=>{this.setState({ eyeOff3: !eyeOff3 })}}
                                />
                </View>
                </View>
                {ViewUtil.getThemeButton('完成',this._btnModifyPassword)}
            </View>
        )
    }
}
