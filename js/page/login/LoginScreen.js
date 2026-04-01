import React from 'react';
import { View, Text, Button, StyleSheet, SafeAreaView,
  TouchableHighlight,
  Image,
  Linking,
  TouchableOpacity,
  ScrollView,
  NativeModules,
  Platform,
 } from 'react-native';
import NavigationUtils from '../../navigator/NavigationUtils';
import SuperView from '../../super/SuperView';
import CustomText from '../../custom/CustomText';
import Theme from '../../res/styles/Theme';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CustomTextInput from '../../custom/CustomTextInput';
import Key from '../../res/styles/Key';
import StorageUtil from '../../util/StorageUtil';
import CommonService from '../../service/CommonService';
import UserInfoDao from '../../service/UserInfoDao';
import { connect } from 'react-redux';
import action from '../../redux/action';
import ViewUtil from '../../util/ViewUtil'
import CryptoJS from "react-native-crypto-js";//加密、解密
import { PermissionsAndroid } from "react-native";
// import NativeView from '../../custom/SignApple';
import Util from '../../util/Util';
import AgreementModal from './AgreementModal';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics'
const FCM_SHOW_ADLIST = 'FCMSHOWADLIST';

class LoginScreen extends SuperView {
  constructor(props) {
    super(props);
    this._navigationHeaderView = {
      hide: true,
      statusBar: {
        barStyle: 'dark-content',
      }
    };
    this.state = {
      userName: '',
      password: '',
      customerCode: '',
      appLogo: '',
      selectCheck: false,
      selectCheck2: false,//是否勾选跨境传输
      root: false,
      languages: { name: '简体中文', value: 'zh' },
      RequireCaptcha: true,
      eyeOff: true,
      publickeyid: '',
      conutLoginDesign: true,
      useFaceId: false,
      fingerId: false,
      //验证码登录---
      btnValideTxt: '获取验证码',
      validateCodeOn: false,
      mobile: '',
      validateCode: '',
      validateSeconds: 60,
      //------------
      modalVisible: false,
    }
  }

  showAgreementModal = () => {
    this.setState({ modalVisible: true });
  }

  hideAgreementModal = () => {
    this.setState({ modalVisible: false });
  }

  componentDidMount() {
      const { languageLoad } = this.props;
      this.loginConfig();//获取是否需要验证码接口
      this.loadBiometrics();
      /** 
     *  获取登录用户名
     */
    StorageUtil.loadKey(Key.LoginUserName).then(result => {
      let bytes = CryptoJS.AES.decrypt(result, Key.LoginUserName);
      let userName = bytes.toString(CryptoJS.enc.Utf8);
      this.setState({
        userName: userName
      })
    }).catch(error => {
      console.log(error);
    })

    StorageUtil.loadKey(Key.UserLogo).then(result => {
      this.setState({
        appLogo: result
      })
    }).catch(error => {
      console.log(error);
    })
    /**
     *  通过TOKen 判断进入的页面
     */
    const deviceLanguage =
      Platform.OS === 'ios'
        ? NativeModules.SettingsManager.settings.AppleLocale ||
        NativeModules.SettingsManager.settings.AppleLanguages[0] // iOS 13
        : NativeModules.I18nManager.localeIdentifier;
    // let languages;
    if (deviceLanguage == 'zh-Hans_US' || deviceLanguage == 'zh_CN' || deviceLanguage == 'zh_CN_#Hans' || deviceLanguage == 'zh_CN_#Hant') {
      // languages = { name: '简体中文', value: 'zh' }
      this.setState({
        languages: { name: '简体中文', value: 'zh' }
      }, () => {
        languageLoad(this.state.languages, () => {
          UserInfoDao.getToken().then(response => {
            if (response) {
              this.push('Main');
              this._getCountryList();
            }
          }).catch(error => {
          })
        })
      })
    } else {
      this.setState({
        languages: { name: 'English', value: 'en' }
      }, () => {
        languageLoad(this.state.languages, () => {
          UserInfoDao.getToken().then(response => {
            if (response) {
              this.push('Main');
              this._getCountryList();
            }
          }).catch(error => {
          })
        })
      })
    }
  }
  loadBiometrics() {
    StorageUtil.loadKey(Key.Publickeyid).then(result => {
      this.setState({
        publickeyid: result,
        conutLoginDesign: result ? false : true
      })
    }).catch(() => {

    })
    this.OpenBiometrics();
  }
  loginConfig = () => {
    CommonService.LoginConfig().then(response => {
      if (response && response.success && response.data) {
        this.setState({
          RequireCaptcha: response.data.RequireCaptcha
        })
      }
    }).catch(error => {
      this.toastMsg(error.message || '获取数据异常');
    })
  }

    _getCountryList = () => {
    /**
     * 获取国家中英文翻译
     */
    let model = {
      Keyword: ''
    }
    let EnCounty = {}
    CommonService.getCountryList(model).then(response => {
      if (response.success && response.data) {
        response.data.map((item) => {
          EnCounty[item.Name] = item.EnName
        })
        StorageUtil.saveKey(Key.CountryTrans, response.data);
      } else {
        this.toastMsg('获取国家数据失败');
      }
    }).catch(error => {
      // this.hideLoadingView();
      // this.toastMsg(error.message || '获取国家数据异常');
    })
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    this.validateTimer && clearTimeout(this.validateTimer);
  }

  // 通知的返回
  _noticeCallBack = (result) => {
    if (result && result.extras && result.extras.ReferUrl) {
      this.push('WebView', {
        title: '消息通知',
        url: result.extras.ReferUrl
      })
    }
  }

  /** 
   * 注册按钮
   */
  btnRegister = () => {
    this.push('Register');
  }
  /**
   *  登录
   */
  btnLogin = () => {
    const { validateCodeOn,selectCheck,selectCheck2,userName, password,mobile,validateCode } = this.state;

    if(validateCodeOn){
      if (!mobile) {
        this.toastMsg('手机号不能为空');
        return;
      }
      if (!validateCode) {
        this.toastMsg('验证码不能为空');
        return;
      }
    }else{
      if (!userName) {
        this.toastMsg('用户名不能为空');
        return;
      }
      if (!password) {
        this.toastMsg('密码不能为空');
        return;
      }
    }
    if(!selectCheck || !selectCheck2){
      this.showAgreementModal();
      return;
    }
    { validateCodeOn ? this._vlogin() : this._countLogin() }
   
  }

  _vlogin() {
    let validateModel = {
      Mobile: this.state.mobile,
      CaptchaCode: this.state.validateCode
    };
    this.showLoadingView();
    CommonService.SmsValidateForApp(validateModel).then(response => {
      this.hideLoadingView();
      if (response && response.success) {
        this._toCreateToken(response.data);
      } else {
        this.toastMsg(response.message || '验证码不正确');
      }
    }).catch(err => {
      this.hideLoadingView();
      this.toastMsg('验证码校验失败');
    });
  }

  _toCreateToken = (data) => {
    let model = {
      Platform: Platform.OS,
      EquipId: Platform.OS,
      Mobile: this.state.mobile,
      SecurityToken: data
    }
    this.showLoadingView();
    CommonService.CreateUserTokenForMobile(model).then(response => {
      if (response && response.success) {
        let cipher_token = CryptoJS.AES.encrypt(response.data, Key.TOKEN).toString();
        StorageUtil.saveKeyId(Key.TOKEN, cipher_token, 1000 * 3600 * 24 * 30).then(() => {
          CommonService.getUserInfo().then(result => {
            this.hideLoadingView();
            if (result && result.success && result.data) {
              // UMNative.profileSignInWithPUID(result.data.Id.toString());
              this.push('Main');
            } else {
            }
          }).catch(error => {
            this.hideLoadingView();
            this.toastMsg(error.message);
          });
        });
      } else {
        this.hideLoadingView();
        this.toastMsg(response.message || '登录失败');
      }
    }).catch(error => {
      this.hideLoadingView();
      this.toastMsg(error.message || '登录异常');
    })
  }

  _countLogin() {
    const { customerCode, userName, password, selectCheck, selectCheck2, RequireCaptcha, validateCodeOn } = this.state;
    this.refs.password && this.refs.password._root && this.refs.password._root.blur();
    if (RequireCaptcha) {
      RctBridage.loadTencentCaptcha(this.state.userName, (event) => {
        if (typeof event === 'string') {
          event = JSON.parse(event);
        }
        if (event && event.ret === 0) {
          let model = {
            Version: 2.0,
            Ticket: event.ticket,
            TicketRand: event.randstr,
            UserName: userName,
            Password: password,
            CustomerCode: customerCode
          }
          this.login(model);
        } else {
          this.toastMsg('验证失败');
        }
      });
    } else {
      let model = {
        Version: 2.0,
        Ticket: null,
        TicketRand: null,
        UserName: userName,
        Password: password,
        CustomerCode: customerCode
      }
      this.login(model);
    }
  }
  login = (loginModel) => {
    /** 
     * 存储登录用户名
     */
    const { fingerId, useFaceId } = this.state;
    CommonService.login(loginModel).then(response => {
      if (response && response.success) {
        let cipher_token = CryptoJS.AES.encrypt(response.data, Key.TOKEN).toString();
        StorageUtil.saveKeyId(Key.TOKEN, cipher_token, 1000 * 3600 * 24 * 7).then(() => {
          CommonService.getUserInfo().then(result => {
            if (result && result.success && result.data) {
              StorageUtil.removeKey(Key.UserLogo);
              // UMNative.profileSignInWithPUID(result.data.Id.toString());
              let userName = CryptoJS.AES.encrypt(this.state.userName, Key.LoginUserName).toString();
              StorageUtil.saveKey(Key.LoginUserName, userName);
              StorageUtil.saveKeyId(FCM_SHOW_ADLIST, 'on');
              // this.push('Main');
              StorageUtil.loadKey(Key.Publickeyid).then(result => {//下次不提醒
                if (result) {
                  this.push('Main');
                }
              }).catch(err => {
                StorageUtil.loadKey(Key.NoAgain).then(result1 => {
                  if (result1) {
                    this.push('Main');
                  }
                }).catch(err => {
                  if (fingerId || useFaceId) {
                    let strAlert = fingerId ? '你可以开启指纹登录，后续登录更便捷' : '你可以开启人脸识别登录，后续登录更便捷'
                    this.showAlertView(strAlert, () => {
                      return ViewUtil.getAlertButton('取消', () => {
                        this.dismissAlertView();
                        this.push('Main');
                      }, '开启', () => {
                        this.CreateBiometrics();
                        this.dismissAlertView();
                      })
                    }, null, () => {
                      StorageUtil.loadKey(Key.NoAgain).then(result1 => {
                        if (result1) {
                          StorageUtil.removeKey(Key.NoAgain);
                        }
                      }).catch(err => {
                        StorageUtil.saveKey(Key.NoAgain, 'NoAgain');
                      })
                    }
                    )
                  } else {
                    this.push('Main');
                  }
                })
              })
            }
          }).catch(error => {
            this.toastMsg(error.message);
          });
        });
      } else {
        this.toastMsg(response.message || '登录失败');
      }
    }).catch(err => {
      this.toastMsg(err.message || '登录失败');
    });
  }

  OpenBiometrics(markItem) {
    const rnBiometrics = new ReactNativeBiometrics()
    rnBiometrics.isSensorAvailable()
      .then((resultObject) => {
        const { available, biometryType } = resultObject
        if (available && biometryType === BiometryTypes.TouchID) {
          // console.log('TouchID is supported')
          this.setState({
            fingerId: true
          })
        } else if (available && biometryType === BiometryTypes.FaceID) {
          // console.log('FaceID is supported')
          this.setState({
            useFaceId: true
          })

        } else if (available && biometryType === BiometryTypes.Biometrics) {
          // console.log('Biometrics is supported')
          this.setState({
            fingerId: true
          })
        } else {
          if (markItem) {
            // console.log('Biometrics not supported')
            this.showAlertView('生物识别未注册', () => {
              return ViewUtil.getAlertButton('确定', () => {
                this.dismissAlertView();
              })
            })
          }
        }
      })
  }

  CreateBiometrics() {
    const { fingerId } = this.state
    const rnBiometrics = new ReactNativeBiometrics()
    rnBiometrics.simplePrompt({ promptMessage: 'Confirm fingerprint' }).then((resultObject) => {
      const { success } = resultObject
      if (success) {
        rnBiometrics.createKeys().then((resultObject) => {
          const { publicKey } = resultObject
          let model = {
            BiometriciKey: publicKey
          }
          CommonService.CurrentUserBiometriciBind(model).then(response => {
            if (response.success && response.data) {
              StorageUtil.saveKey(Key.Publickeyid, response.data.PublicKeyId,1000 * 3600 * 24 * 365);
              let alerStr = fingerId ? '指纹识别登录开启成功' : '人脸识别登录开启成功'
              this.showAlertView(alerStr, () => {
                return ViewUtil.getAlertButton('确定', () => {
                  this.dismissAlertView();
                  this.push('Main');
                })
              })
            } else {
              this.push('Main');
              this.toastMsg('获取数据失败');
            }
          }).catch(error => {
            this.push('Main');
            this.toastMsg(error.message || '获取数据异常');
          })
        })
      } else {
        this.push('Main');
        // console.log('用户取消生物识别登录')
      }
    }).catch(() => {
      // console.log('biometrics failed')
      this.push('Main');
    })

  }

  /**
   * 忘记密码
   */
  btnForget = () => {
    this.push('Forget1');
  }
  /**
 * 查看条款
 */
  btnGoToTerms = () => {
    this.push('WebView', {
      title: 'FCM个人信息保护政策',
      url: 'https://app.fcmonline.com.cn/content/pages/agreement/privacy_agreement.html',
    });
  };
  btnGoToTerms2 = () => {
    this.push('WebView', {
      title: 'FCM服务协议',
      url: 'https://app.fcmonline.com.cn/content/pages/agreement/index.html',
    });
  };
  btnGoToTerms3 = () => {
    this.push('WebView', {
      title: 'FCM儿童个人信息保护政策及监护人须知',
      url: 'https://app.fcmonline.com.cn/content/pages/agreement/children_privacy_agreement.html',
    });
  }
  btnGoToTerms4 = () => {
    this.push('WebView', {
      title: '个人信息跨境传输同意函',
      url: 'https://app.fcmonline.com.cn/content/pages/agreement/cross_border_transfer_agreement.html',
    });
  }

  /**
   *  验证码登录
   */
  _toDynamiceLogin = () => {
    const { validateCodeOn } = this.state
    if (validateCodeOn) {
      this.setState({
        validateCodeOn: false,
        conutLoginDesign: true,
      })
    } else {
      this.setState({
        validateCodeOn: true
      })
    }
  }
  /**
 * 联系客服
 */
  btnContactTel = (mobile_number) => {
    // var url = 'tel:021-22111889';
    var url = 'tel:' + mobile_number
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

  clickCheck = () => {
    this.setState({
      selectCheck: !this.state.selectCheck,
    })
  }

  clickCheck2 = () => {
    this.setState({
      selectCheck2: !this.state.selectCheck2,
    })
  }

  //检查是否获取读取权限
  checkPermissionReadWrite() {
    try {
      //返回Promise类型
      const granted = PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      )

      granted.then((data) => {

        if (data == false) {

          this.requestPermissionReadWrite();
        }
      }).catch((err) => {
        Toast.info(err.toString())
      })
    } catch (err) {
      Toast.info(err.toString())
    }
  }

  //请求读写取权限
  requestPermissionReadWrite = async () => {
    // PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
    try {
      //返回string类型
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        // {
        //     //第一次请求拒绝后提示用户你为什么要这个权限
        //     'title': '我要读取权限',
        //     'message': '没权限我不能工作，同意就好了'
        // }
      )
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        // console.log("-----用户已授权")
      } else {
        Toast.info("请先开启读取权限")
        this.backButtonPress();
      }
    } catch (err) {
      // console.log("-----出现错误")
    }
  }

  ssoClick = () => {
    this.push('SSOScreen');
  }

  /*
  *苹果登录
  */
  appleLogin(nativeEvent) {
    if (nativeEvent.success && nativeEvent.successtwo) {
      let model = {
        AuthorizationCode: nativeEvent.successtwo,
        IdentityToken: nativeEvent.success,
        // EquipId: DeviceInfo.getDeviceId(),
        Platform: Platform.OS,
        IdentityProvider: 2
      }
      CommonService.CreateUserTokenForIdentityProvider(model).then(response => {
        if (!response.success && response.code == -1) {
          that.showAlertView('您还没有绑定苹果账号，请用账号密码登录', () => {
            return ViewUtil.getAlertButton('取消', () => {
              that.dismissAlertView();
            }, '确定', () => {
              that.dismissAlertView();
              that.setState({
                AuthorizationCode: nativeEvent.successtwo,
                IdentityProvider: 2
              })
            })
          })
        } else if (response.success && response.data) {
          let cipher_token = CryptoJS.AES.encrypt(response.data, Key.TOKEN).toString();
          StorageUtil.saveKeyId(Key.TOKEN, cipher_token, 1000 * 3600 * 24 * 30).then(() => {
            that.showLoadingView();
            this._getUserInfoZToMain();
          });
        } else {
          this.hideLoadingView();
          this.toastMsg(response.message || '登录失败');
        }
      })
    }
  }

   biometrics = (index) => {
    const { useFaceId } = this.state
    const rnBiometrics = new ReactNativeBiometrics()
    StorageUtil.loadKey(Key.Publickeyid).then(result => {
      rnBiometrics.createSignature({
        promptMessage: Util.Parse.isChinese() ? '登录' : 'LOGIN',
        payload: result,
        cancelButtonText: Util.Parse.isChinese() ? '取消' : ' CANCEL',
      }).then((resultObject) => {
        const { success, signature } = resultObject
        if (success) {
          let model = {
            Key: result,
            Signature: signature,
            EquipId: Platform.OS,
            Platform: Platform.OS
          }
          CommonService.CheckUserBiometricIdentification(model).then(response => {
            if (response.success && response.data) {
              let cipher_token = CryptoJS.AES.encrypt(response.data, Key.TOKEN).toString();
              StorageUtil.saveKeyId(Key.TOKEN, cipher_token, 1000 * 3600 * 24 * 7).then(() => {
                CommonService.getUserInfo().then(result => {
                  if (result && result.success && result.data) {
                    StorageUtil.removeKey(Key.UserLogo);
                    let userName = CryptoJS.AES.encrypt(this.state.userName, Key.LoginUserName).toString();
                    StorageUtil.saveKey(Key.LoginUserName, userName);
                    this.push('Main');
                  }
                }).catch(error => {
                  this.push('Main');
                });
              });
            } else {
              this.toastMsg(response.message || '获取数据异常');
            }
          }).catch(error => {
            this.toastMsg(error.message || '获取数据异常');
          })
        }
      }).catch(error => {
        let alertStr = useFaceId ? '人脸登录失败，请稍后重试或者切换其他登录方式登录' : '指纹登录失败，请稍后重试或者切换其他登录方式登录'
        if (index == 1) {
          alertStr = '设备未开启或不支持生物识别登录'
        }
        this.showAlertView(alertStr, () => {
          return ViewUtil.getAlertButton('确定', () => {
            this.dismissAlertView();
            this.setState({
              conutLoginDesign: true
            })
          })
        })
      })
    }).catch(error => {
      this.toastMsg(error.Error || '获取数据异常');
    })
  }
  
   handleAgree = () => {
      this.setState({
        selectCheck:true,
        selectCheck2:true,
      },()=>{
        this.btnLogin()
      })
    };

  _changeLanguage = () => {
    const { languageLoad } = this.props;
    this.setState({
      languages: this.state.languages.value === 'zh' ? {
        name: 'English',
        value: 'en'
      } : {
        name: '简体中文',
        value: 'zh'
      }
    }, () => {
      const { languageChange } = this.props;
      const { languages } = this.state;
      languageChange(languages, () => {
        // let model = {
        //   UiLanguage: languages.value === 'zh' ? 'zh-cn' : 'en-us',
        //   NotifyLanguage: '',
        // }
        // CommonService.CurrentUserChangeLanguage(model).then(response => {
        //   if (response && response.success) {
        //     this.showAlertView('切换语言成功', () => {
        //       return ViewUtil.getAlertButton('确定', () => {
        //         this.dismissAlertView();
        //       })
        //     })
        //   }
        // })
      });

      // languageLoad({ name: 'English', value: 'en' }, () => {
      //   UserInfoDao.getToken().then(response => {
      //     if (response) {
      //       this.push('Main');
      //       this._getCountryList();
      //     }
      //   }).catch(error => {
      //   })
      // })
    })
  }

  renderBody() {
    const { navigation } = this.props;
    const { appLogo, languages, conutLoginDesign, validateCodeOn,modalVisible,selectCheck, selectCheck2, } = this.state;
    let en = require('../../res/Uimage/En.png')
    let zh = require('../../res/Uimage/Zn.png')
    return (
      <SafeAreaView style={styles.container}>
        {/* <View style={styles.content}>
          <Text style={styles.title}>登录页面</Text>
          <Button
            title="去首页"
            onPress={() => {
              console.log('Login pressed');
              NavigationUtils.push(navigation, 'Home', { userId: 1001 });
            }}
          />
        </View> */}
        <View style={{ height: global.screenHeight, width: global.screenWidth, backgroundColor: '#fff' }}>
        <ScrollView keyboardShouldPersistTaps={'handled'} showsVerticalScrollIndicator={false}>
          <TouchableHighlight underlayColor='transparent' onPress={this._changeLanguage} style={{ marginTop: 44, alignItems: 'flex-end', right:20,marginLeft:300,width:60 }}>
            <Image style={styles.ZhEn} resizeMode={'contain'} source={languages.value === 'zh' ? en : zh} />
          </TouchableHighlight>
          <View style={{ alignItems: 'center', marginTop: 30 }}>
            {
              appLogo ?
                <Image style={styles.icon} resizeMode={'contain'} source={{ uri: appLogo }} />
                :
                <Image style={styles.icon} resizeMode={'contain'} source={require('../../res/Uimage/logo.png')} />
            }
            <CustomText allowFontScaling={false} style={{ fontSize: 15, marginTop: 15,fontStyle:'italic',fontWeight:'bold' }} text='欢迎探索非凡之旅' />
          </View>
          {
            validateCodeOn ? this._VerifiLoginView() :
              conutLoginDesign ? this._conutLogin() : this._BiometricsLogin()
          }
          {(conutLoginDesign || validateCodeOn) ? this._agreeClickView() : null}
          {
            (!conutLoginDesign && !validateCodeOn) ? null :
              <TouchableHighlight 
                      onPress={
                          this.btnLogin
                      } 
                      style={styles.loginBtn} underlayColor={Theme.themebg}>
                <CustomText style={{ textAlign: 'center', color: 'white', fontSize: 16 }} text='立即登录' />
              </TouchableHighlight>
          }
          {this._loginNowView()}
          <AgreementModal 
            visible={modalVisible}
            onClose={this.hideAgreementModal}
            onAgree={this.handleAgree}
            callback={this.btnGoToTerms}
            callback2={this.btnGoToTerms2}
            callback3={this.btnGoToTerms3}
            callback4={this.btnGoToTerms4}
          />
            <View style={{ alignItems: 'center' }}>
              <CustomText allowFontScaling={false} style={{ fontSize: 12, marginTop: 15, color: Theme.assistFontColor }} text='- 其他登录方式 -' />
            </View>
            <TouchableOpacity onPress={() => { this.ssoClick() }} style={styles.loginBtn1} underlayColor={Theme.themebg}>
              <CustomText style={{ fontSize: 14 }} text='单点登录' />
            </TouchableOpacity>
            </ScrollView>
       
      </View>
      </SafeAreaView>
    );
  }

  /**
  * 登录按钮view
  */
  _loginNowView() {
    const { publickeyid, useFaceId, validateCodeOn } = this.state;
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
        <View style={{ flexDirection: 'row' }}>
          <TouchableHighlight style={{ marginLeft: 20, height: 30 }} underlayColor='transparent' onPress={this._toDynamiceLogin}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <CustomText allowFontScaling={false} style={{ color: Theme.assistFontColor, fontSize: 13, marginLeft: 5 }} text={validateCodeOn ? '账号登录' : '验证码登录'} />
            </View>
          </TouchableHighlight>
          {
            publickeyid ?
              <TouchableHighlight underlayColor='transparent' onPress={() => { this.biometrics(1) }}>
                <CustomText style={{ color: Theme.assistFontColor, fontSize: 13 }} text={useFaceId ? '/Face ID 登录' : '/指纹登录'} />
              </TouchableHighlight>
              : null
          }
        </View>
        <TouchableHighlight underlayColor='transparent' style={{ marginRight: 20 }} onPress={this.btnForget}>
          <CustomText style={{ color: Theme.assistFontColor, fontSize: 13 }} text={'忘记密码?'} />
        </TouchableHighlight>
      </View>
    )
  }

  /**
   * 点击同意政策view
   */
  _agreeClickView() {
    const { selectCheck, selectCheck2 } = this.state;
    return (
      <View style={{ marginTop: 20, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity style={{ height: 16, width: 16, justifyContent: 'center', alignItems: 'center' }} onPress={() => { this.clickCheck() }}>
            <MaterialIcons
              name={selectCheck ? 'check-box' : 'check-box-outline-blank'}
              size={16}
              color={selectCheck ? Theme.theme : Theme.promptFontColor}
            />
          </TouchableOpacity>
          <Text style={{ flexDirection: 'row', flexWrap: 'wrap', paddingRight: 30 }}>
            <CustomText onPress={() => { this.clickCheck() }} style={{ fontSize: 11, alignItems: 'center', alignContent: 'center' }} text={'我同意'}></CustomText>
            <CustomText onPress={this.btnGoToTerms} style={{ color: Theme.theme, fontSize: 11, }} text={'《FCM个人信息保护政策》'}></CustomText>
            <CustomText onPress={this.btnGoToTerms2} style={{ color: Theme.theme, fontSize: 11, }} text={'《服务协议》'}></CustomText>
            <CustomText onPress={this.btnGoToTerms3} style={{ color: Theme.theme, fontSize: 11 }} text={'《FCM儿童个人信息保护政策及监护人须知》'}></CustomText>
          </Text>
        </View>
        <View style={{ flexDirection: 'row', marginTop: 10 }}>
          <TouchableOpacity style={{ height: 16, width: 16, justifyContent: 'center', alignItems: 'center' }} onPress={() => { this.clickCheck2() }}>
            <MaterialIcons
              name={selectCheck2 ? 'check-box' : 'check-box-outline-blank'}
              size={16}
              color={selectCheck2 ? Theme.theme : Theme.promptFontColor}
            />
          </TouchableOpacity>
          {Util.Parse.isChinese() ?
            <Text style={{ flexDirection: 'row', flexWrap: 'wrap', paddingRight: 30 }}>
              <CustomText onPress={() => { this.clickCheck2() }} style={{ fontSize: 11, alignItems: 'center', alignContent: 'center' }} text={'我同意按照'}></CustomText>
              <CustomText onPress={this.btnGoToTerms4} style={{ color: Theme.theme, fontSize: 11, }} text={'《个人信息跨境传输同意函》'}></CustomText>
              <CustomText style={{ fontSize: 11, alignItems: 'center', alignContent: 'center' }} text={'将个人信息跨境传输'}></CustomText>
            </Text>
            :
            <Text style={{ flexDirection: 'row', flexWrap: 'wrap', paddingRight: 30 }}>
              <CustomText onPress={() => { this.clickCheck2() }} style={{ fontSize: 12, alignItems: 'center', alignContent: 'center' }} text={'Please confirm you have read and agree to'}></CustomText>
              <CustomText onPress={this.btnGoToTerms4} style={{ color: Theme.theme, fontSize: 12, }} text={'《Consent Letter for Cross-border Transfer of Personal Information》'}></CustomText>
            </Text>
          }
        </View>
      </View>
    )

  }
  /**
   * 账号登录填写view
   */
  _conutLogin() {
    const { eyeOff } = this.state;
    return (
      <View style={{ backgroundColor: '#fff', marginTop: 50, borderRadius: 8 }}>
        <View style={[styles.viewStyle, { marginTop: 0 }]}>
          <CustomTextInput placeholder="请输入账号" style={styles.rightTextInput} placeholderTextColor={Theme.promptFontColor} onChangeText={text => this.setState({ userName: text })} value={this.state.userName} />
          <TouchableOpacity style={{ padding: 15, paddingRight: 10 }} onPress={() => { this.setState({ userName: '' }) }}>
            <AntDesign name={'closecircle'} size={16} color={Theme.promptFontColor} />
          </TouchableOpacity>
        </View>
        <View style={styles.viewStyle}>
          <CustomTextInput ref='password' placeholder="请输入密码" style={styles.rightTextInput} placeholderTextColor={Theme.promptFontColor} secureTextEntry={eyeOff} onChangeText={text => this.setState({ password: text })} value={this.state.password} />
          <TouchableOpacity style={{ padding: 8 }} onPress={() => { this.setState({ eyeOff: !eyeOff }) }}>
            <Feather name={eyeOff ? 'eye-off' : 'eye'} size={20} color={Theme.promptFontColor} style={{ marginLeft: 5 }} />
          </TouchableOpacity>
          <TouchableOpacity style={{ padding: 8, paddingRight: 10 }} onPress={() => { this.setState({ password: '' }) }}>
            <AntDesign name={'closecircle'} size={16} color={Theme.promptFontColor} />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  //苹果登录 没用
  _appleLogin() {
    return (
      <View>
        <View style={{ alignItems: 'center', marginVertical: 15 }}>
          <Image style={{ width: 49, height: 49 }} source={require('../../res/image/apple.png')} />
        </View>
        <View style={{ alignItems: 'center', marginVertical: 15 }}>
          {Platform.OS === 'android' ? null :
            !selectCheck ?
              <TouchableOpacity onPress={() => { this.toastMsg('请阅读并勾选《用户协议及服务条款》和《隐私协议》'); }}>
                <Image style={{ width: 49, height: 49 }} source={require('../../res/image/apple.png')} />
              </TouchableOpacity>
              :
              <NativeView
                style={{ width: 49, height: 49 }}
                onClick={(info) => {
                  var version = Platform.Version;
                  var version_last = version.substring(0, 2);
                  if (version_last >= 13) {
                    //info.nativeEvent.success是identityToken 见iOS CoustomView.m 文件 106行
                    //info.nativeEvent.successtwo是authorizationCode 见iOS CoustomView.m 文件 106行
                    if (info.nativeEvent.success) {
                      this.appleLogin(info.nativeEvent);
                    } else if (info.nativeEvent.error) {
                      this.toastMsg('获取苹果账号失败');
                    }
                  } else {
                    alert('请将您的iOS系统升级到13.0以上');
                  }
                }}
              >
                <Image style={{ width: 49, height: 49 }} source={require('../../res/image/apple.png')} />
              </NativeView>
          }
        </View>
        <View style={{ position: 'absolute', bottom: 30, alignItems: 'center', justifyContent: 'center', marginTop: 30, backgroundColor: 'red' }} />
      </View>
    )
  }

  /**
   * 生物识别登录view
   */
  _BiometricsLogin() {
    const { conutLoginDesign, useFaceId } = this.state;
    return (
      <View style={{ backgroundColor: '#fff', marginHorizontal: 25, marginTop: 15, borderRadius: 8 }}>
        <TouchableOpacity style={styles.containView2} onPress={this.biometrics}>
          <CustomText style={{ color: Theme.theme, fontSize: 13 }} text={useFaceId ? "Face ID 登录" : "点击进行指纹登录"}></CustomText>
          {
            useFaceId ?
              <Image style={{ width: 58, height: 58, marginTop: 15 }} source={require('../../res/image/faceId.jpg')} />
              :
              <Image style={{ width: 58, height: 58, marginTop: 15 }} source={require('../../res/image/fingerLogin.jpeg')} />
          }
        </TouchableOpacity>
      </View>
    )
  }

  /**
   * 验证码登录view
   */
  _VerifiLoginView() {
    return (
      <View style={{ backgroundColor: '#fff', marginTop: 50, borderRadius: 8 }}>
        <View style={[styles.viewStyle, { marginTop: 0 }]}>
          <CustomTextInput placeholder="请输入绑定手机号" style={styles.rightTextInput} keyboardType={'numeric'}  placeholderTextColor={Theme.promptFontColor}  onChangeText={text => this.setState({ mobile: text })} value={this.state.mobile}/>
          <TouchableOpacity style={{ padding: 15, paddingRight: 10 }} onPress={() => { this.setState({ mobile: '' }) }}>
            <AntDesign name={'closecircle'} size={16} color={Theme.promptFontColor} />
          </TouchableOpacity>
        </View>
        <View style={styles.viewStyle}>
          <CustomTextInput placeholder="请输入验证码"
            style={styles.rightTextInput}
            placeholderTextColor={Theme.promptFontColor}
            keyboardType='numeric'
            onChangeText={(validateCode) => { this.setState({ validateCode }) }}
          />
          <TouchableOpacity style={styles.verification} onPress={this.btnSendValidataCode}>
            <CustomText style={{ color: this.state.btnValideTxt === '获取验证码' ? Theme.theme : Theme.promptFontColor }} text={this.state.btnValideTxt} />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  btnSendValidataCode = () => {
    if (!this.state.mobile) {
      this.toastMsg('手机号不能为空');
      return;
    }
    if (this.state.btnValideTxt !== '获取验证码') {
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
        this.btnSendValidateCode(model);
      } else {
        this.toastMsg('验证失败');
      }
    });
  }

  /**
     *  发送验证码
     */
  btnSendValidateCode = (model) => {
    this.showLoadingView();
    CommonService.SmsSendForApp(model).then((response) => {
      this.hideLoadingView();
      if (response && response.success) {
        this.validateTimer = setInterval(() => {
          if (this.state.validateSeconds === 0) {
            if (this.validateTimer) {
              clearInterval(this.validateTimer);
            }
            this.setState(() => ({
              validateSeconds: 60,
              btnValideTxt: '获取验证码'
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
    }).catch((error) => {
      this.hideLoadingView();
      this.toastMsg(error.message || '获取验证码失败');
    });
  }
}
const languageprops = state => ({
  language: state.language.language
})
const languageToAction = dispatch => ({
  languageLoad: (languages, callBack) => dispatch(action.languageLoad(languages, callBack)),
  languageChange: (language, callBack) => dispatch(action.languageChange(language, callBack))
})

export default connect(languageprops, languageToAction)(LoginScreen)

const styles = StyleSheet.create({
  icon: {
    width: 120,
    height: 40,
  },
  ZhEn: {
    width: 20,
    height: 20,
    //  resizeMode: "cover",
  },
  containView2: {
    marginRight: 20,
    marginLeft: 20,
    borderRadius: 4,
    marginTop: 30,
    alignItems: 'center',
    marginBottom: 40
  },
  rightTextInput: {
    height: 50,
    marginLeft: 20,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,

  },
  loginBtn: {
    marginHorizontal: 20,
    justifyContent: 'center',
    marginTop: 30,
    height: 50,
    backgroundColor: Theme.themebg,
    borderRadius: 2,
  },
  loginBtn1: {
    borderWidth: 1,
    marginBottom: 80,
    alignItems: 'center',
    height: 50,
    justifyContent: 'center',
    marginHorizontal: 20,
    borderColor: Theme.promptFontColor,
    marginTop: 20
  },

  viewStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.normalBg,
    borderRadius: 2,
    marginHorizontal: 20,
    marginTop: 20
  },
  verification: {
    marginRight: 10,
    height: 50,
    justifyContent: 'center',
    width: 100,
    alignItems: 'flex-end'
  }
});

