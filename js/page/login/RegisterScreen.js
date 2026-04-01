import React from 'react';

import {
  View,
  Text,
  Linking,
  StyleSheet,
  TouchableHighlight
} from 'react-native';
import SuperView from '../../super/SuperView';
import CustomText from '../../custom/CustomText';
import CustomTextInput from '../../custom/CustomTextInput';
import Theme from '../../res/styles/Theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Util from '../../util/Util';
import ViewUtil from '../../util/ViewUtil';
import CommonService from '../../service/CommonService';
import I18nUtil from '../../util/I18nUtil';
import AntDesign from 'react-native-vector-icons/AntDesign';
export default class RegisterScreen extends SuperView {
  constructor(props) {
    super(props);
    this._navigationHeaderView = {
      title: '注册企业账号'
    }
    this.state = {
      companyName: '',
      userName: '',
      mobile: '',
      email: '',
      validateCode: '',
      btnValideTxt: '验证',
      validateSeconds: 60
    }
  }
  componentWillUnmount() {
    super.componentWillUnmount();
    this.validateTimer && clearInterval(this.validateTimer);
  }
  dismissAlertView() {
    super.dismissAlertView();
    this.pop();
  }

  /**
   * 查看条款
   */
  btnGoToTerms = () => {
    // this.push('WebView', {
    //   title: 'FCM企业商旅服务条款',
    //   url: 'http://t.otw.cn/content/pages/agreement/index.html',
    // });
  };


  /**
   *  防水墙
   */
  _loadTenxun = () => {

    if (!this.state.mobile) {
      this.toastMsg('手机号不能为空');
      return;
    }
    if (this.state.btnValideTxt !== '验证') {
      return;
    }
    RctBridage.loadTencentCaptcha(this.state.mobile, (event) => {
      if (typeof event === 'string') {
        event = JSON.parse(event);
      }
      if (event && event.ret === 0) {
        let model = {
          Mobile: this.state.mobile,
          Ticket: event.ticket,
          TicketRand: event.randstr,
          IsEmployee: true
        }
        this.btnGetValidateCode(model);
      } else {
        this.toastMsg('验证失败');
      }
    });
  }


  /**
     * 获取验证码
     */
  btnGetValidateCode = (model) => {

    this.showLoadingView();
    CommonService.SmsSendForApp(model).then(response => {
      this.hideLoadingView();
      if (response && response.success) {
        this.validateTimer = setInterval(() => {
          if (this.state.validateSeconds === 0) {
            if (this.validateTimer) {
              clearInterval(this.validateTimer);
            }
            this.setState(() => ({
              validateSeconds: 60,
              btnValideTxt: '验证'
            }));
          } else {
            this.setState(() => ({
              validateSeconds: this.state.validateSeconds - 1,
              btnValideTxt: this.state.validateSeconds + ''
            }));
          }
        }, 1000);
      } else {
        this.toastMsg(response.message || '获取验证码失败');
      }
    }).catch(error => {
      this.hideLoadingView();
      this.toastMsg('获取验证码失败');
    });
  };
  /**
    * 提交注册
    */
  btnRegister = () => {
    const { companyName, userName, email, mobile, validateCode } = this.state;
    if (!companyName) {
      this.toastMsg('企业名称不能为空');
      return;
    }
    if (!userName) {
      this.toastMsg('姓名不能为空');
      return;
    }
    if (!email) {
      this.toastMsg('邮箱不能为空');
      return;
    } else {
      if (!Util.RegEx.isEmail(email)) {
        this.toastMsg('邮箱格式不正确');
        return;
      }
    }
    if (!mobile) {
      this.toastMsg('手机号不能为空');
      return;
    }
    if (!validateCode) {
      this.toastMsg('验证码不能为空');
      return;
    }

    this.showLoadingView();
    let checkModel = {
      Mobile: this.state.mobile,
      CaptchaCode: this.state.validateCode
    };
    CommonService.SmsValidateForApp(checkModel).then(validateResponse => {
      if (validateResponse && validateResponse.success) {
        let registerModel = {
          Name: companyName,
          ContractName: userName,
          Mobile: mobile,
          Email: email,
          SecurityToken: validateResponse.data
        };
        CommonService.enterpriseRegister(registerModel).then(response => {
          this.hideLoadingView();
          if (response && response.success) {
            this.showAlertView('注册成功，客服人员将会尽快和您联系，请保持电话畅通～',()=>{
              return ViewUtil.getAlertButton('确定',()=>{
                this.dismissAlertView();
                this.pop();
              })
            });
          } else {
            this.toastMsg(response.message || '注册提交失败，请联系客服处理');
          }
        }).catch(error => {
          this.hideLoadingView();
          this.toastMsg('注册提交失败，请联系客服处理');
        });
      } else {
        this.hideLoadingView();
        this.toastMsg(validateResponse.message || '验证码不正确');
      }
    }).catch(error => {
      this.hideLoadingView();
      this.toastMsg('验证码校验失败');
    });
  };



  renderBody() {
    return (
      <View >
        <View style={{ margin: 10 }}>
          <CustomText style={{ fontSize: 13 }} text='如果贵公司已签约为FCM商旅客户，请联系差旅负责人获得个人登录账号，请勿重复注册' />
        </View>
        <View style={{ backgroundColor: 'white' }}>
          <View style={styles.row}>
            <CustomText style={styles.text} text='企业名称' />
            <CustomTextInput placeholder='所在公司名称' style={styles.textInput} onChangeText={(companyName) => this.setState({ companyName })} />
          </View>
          <View style={styles.row}>
            <CustomText style={styles.text} text='姓名' />
            <CustomTextInput placeholder='中文/英文名' style={styles.textInput} onChangeText={(userName) => this.setState({ userName })} />
          </View>
          <View style={[styles.row, { borderBottomWidth: 0 }]}>
            <CustomText style={styles.text} text='邮箱' />
            <CustomTextInput placeholder='常用邮箱地址' keyboardType='email-address' style={styles.textInput} onChangeText={(email) => this.setState({ email })} />
          </View>
        </View>
        <View style={{ marginTop: 15, backgroundColor: 'white' }}>
          <View style={[styles.row, { paddingRight: 0 }]}>
            <CustomText style={styles.text} text='手机号' />
            <CustomTextInput placeholder='手机号输入' keyboardType='numeric' style={styles.textInput} onChangeText={(mobile) => this.setState({ mobile })} />
            <TouchableHighlight underlayColor={this.state.btnValideTxt === '验证' ? Theme.theme : 'lightgray'} style={[styles.code, { backgroundColor: this.state.btnValideTxt === '验证' ? Theme.theme : 'lightgray' }]} onPress={this._loadTenxun} disabled={this.state.codeDisable}>
              <CustomText text={this.state.btnValideTxt} style={{ color: 'white', fontSize: 18 }} />
            </TouchableHighlight>
          </View>
          <View style={[styles.row]}>
            <CustomText allowFontScaling={false} style={styles.text} text='验证码' />
            <CustomTextInput placeholder='4位/6位数字' keyboardType='numeric' style={styles.textInput} onChangeText={(validateCode) => this.setState({ validateCode })} />
          </View>
        </View>
        <View style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center' }}>
          <Ionicons
            color={Theme.theme}
            size={26}
            name={'md-checkmark-circle'}
            style={{ marginLeft: 10 }}
          />
          <View style={{ flexDirection: 'row', marginLeft: 5 }}>
            {/* <Text style={{ fontSize: 12 }}>{I18nUtil.translate('点击注册表示同意')}<Text onPress={this.btnGoToTerms} style={{ color: Theme.theme }}>{I18nUtil.translate('《服务协议和FCM个人信息保护政策》')}</Text></Text> */}
          </View>
        </View>
        {
          ViewUtil.getSubmitButton('注册', this.btnRegister)
        }
        {
          this._renderTel()
        }
      </View>
    );
  }
  /**
    * 联系客服
    */
  _btnContactTel = () => {
    var url = 'tel:021-22111889';
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        return Linking.openURL(url);
      } else {
        console.log('Can\'t handle url: ' + url);
      }
    }).catch(err => {
      console.log(err);
    });
  }
  /**
   *  底部客服电话
   */
  _renderTel = () => {
    return (
      <View style={{ alignItems: 'center', marginTop: 20 }}>
        <TouchableHighlight underlayColor='transparent' onPress={this._btnContactTel}>
          <View style={{ flexDirection: 'row' }}>
            <AntDesign name={'customerservice'} size={26} color={'gray'} />
            <CustomText style={{ fontSize: 20, color: 'gray', marginLeft: 5 }} text='021-22111889' />
          </View>
        </TouchableHighlight>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderBottomColor: Theme.lineColor,
    borderBottomWidth: 0.5,
    alignItems: 'center',
    height: 44,
    paddingHorizontal: 10
  },
  text: {
    width: 100
  },
  textInput: {
    flex: 1,
    fontSize: 16
  },
  code: {
    width: 80,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'red'
  }
})