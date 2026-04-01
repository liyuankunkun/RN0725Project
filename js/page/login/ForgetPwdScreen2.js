import React from 'react';

import { View, StyleSheet,TouchableOpacity } from 'react-native';
import CustomTextInput from '../../custom/CustomTextInput';
import SuperView from '../../super/SuperView';
import ViewUtil from '../../util/ViewUtil';
import NavigationUtils from '../../navigator/NavigationUtils';
import CommonService from '../../service/CommonService';
import Feather from 'react-native-vector-icons/Feather';
import Theme from '../../res/styles/Theme';

export default class ForgetPwdScreen2 extends SuperView {
  constructor(props) {
    super(props);
    this.params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};
    this._navigationHeaderView = {
      title: '重置密码'
    }
    this.state = {
      password: '',
      rePassword: '',
      eyeOff: true,
      eyeOff2: true,
    }
  }

  dismissAlertView() {
    super.dismissAlertView();
    NavigationUtils.popToTop(this.props.navigation);
  }

  /**
  * 重置密码
  */
  btnResetPwd = () => {
    const { password, rePassword } = this.state;
    if (!password) {
      this.toastMsg('请输入新密码');
      return;
    }
    if (!rePassword) {
      this.toastMsg('请再次输入密码');
      return;
    }
    if (password !== rePassword) {
      this.toastMsg('两次输入不一致');
      return;
    }

    const routeParams = (this.props.route && this.props.route.params) || this.params || {};
    let resetModel = Object.assign({
      SerialNumber: this.params.SerialNumber,
      Email: this.params.Email,
      Source: 2,
      EmailCode: this.params.EmailCode,
      password: password,
      repassword: rePassword
    }, routeParams);
    let RequestService = routeParams.mobile ? CommonService.resetPassword : CommonService.EmailResetPassword
    this.showLoadingView();
    RequestService(resetModel).then(response => {
      this.hideLoadingView();
      if (response && response.success) {
        this.showAlertView('密码重置成功', () => {
          return ViewUtil.getAlertButton('确定', () => {
            this.dismissAlertView();
            NavigationUtils.popToTop(this.props.navigation);
          })
        });
      } else {
        this.toastMsg(response.message || '密码重置失败');
      }
    }).catch(error => {
      this.hideLoadingView();
      this.toastMsg('重置密码异常');
    });
  }

  renderBody() {
    const { eyeOff,eyeOff2 } = this.state;
    return (
      <View style={{ flex: 1 }}><View style={{ flex: 1 }}>
        <View style={{flexDirection:'row',alignItems: 'center',}}>
        <CustomTextInput placeholder='密码长度为 8-32 位，且须同时包含数字、大写字母、小写字母、符号。' secureTextEntry={eyeOff}  onChangeText={(password) => { this.setState({ password }) }} style={[curStyle.textInput, { paddingLeft: 5,width:global.screenWidth-50 }]} />
        <TouchableOpacity style={{ padding: 8,marginTop: 15, }} onPress={() => { this.setState({ eyeOff: !eyeOff }) }}>
            <Feather name={eyeOff ? 'eye-off' : 'eye'} size={18} color={Theme.assistFontColor} style={{  }} />
          </TouchableOpacity>
        </View>
        <View style={{flexDirection:'row',alignItems: 'center',}}>
        <CustomTextInput placeholder='请再次输入密码' secureTextEntry={eyeOff2} onChangeText={(rePassword) => { this.setState({ rePassword }) }} style={[curStyle.textInput, { paddingLeft: 5,width:global.screenWidth-50 }]} />
        <TouchableOpacity style={{ padding: 8,marginTop: 15, }} onPress={() => { this.setState({ eyeOff2: !eyeOff2 }) }}>
            <Feather name={eyeOff2 ? 'eye-off' : 'eye'} size={18} color={Theme.assistFontColor} style={{}} />
          </TouchableOpacity>
        </View>
        </View>
        {ViewUtil.getSubmitButton('确定', this.btnResetPwd)}
      </View>
    );
  }
}
const curStyle = StyleSheet.create({
  textInput: {
    marginTop: 15,
    // marginRight: 10,
    marginLeft: 10,
    borderRadius: 4,
    height: 40,
    backgroundColor: 'white',
  },
});
