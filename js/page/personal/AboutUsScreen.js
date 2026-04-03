
import React from 'react';
import {
    View,
    Image,
    StyleSheet,
    ScrollView,
    TouchableHighlight,
    Clipboard,
    TouchableOpacity,
    Platform,
    Alert,
    Linking,
    Text
} from 'react-native';
import SuperView from '../../super/SuperView';
import CustomText from '../../custom/CustomText';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Theme from '../../res/styles/Theme';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import ShareItem from '../common/ShareItem';
import ViewUtil from '../../util/ViewUtil';
import Util from '../../util/Util';
import CommonService from '../../service/CommonService';

export default class SetUpScreen extends SuperView {
    constructor(props) {
        super(props);
        this._navigationHeaderView = {
            title: '关于我们'
        }
        this.state = {}
    }

    /**
   *  升级检测
   */
  _getVersionUpGrade = () => {
    this.showLoadingView();
    CommonService.versionUpgrade().then(response => {
      this.hideLoadingView();
      if (response && response.data && response.success) {
        let alerString = Util.Parse.isChinese()?
             '为了提供更好的用户体验，请点击“确认”对软件版本进行更新。\n版本更新内容：'+response.data.Content:
             'In order to provide a better user experience, please click "Confirm" to update the software version. \nVersion update content:'+response.data.Content
        let alertSr = Util.Parse.isChinese()?'温馨提示':'Notice'
        let huSr = Util.Parse.isChinese()?'忽略':'Ignore'
        let sjSr = Util.Parse.isChinese()?'去升级':'Update'
        if (response.data.Version > global.appBuildVersion) {
          if (response.data.ForceUpdate) {
            Alert.alert(
              alertSr,
              alerString || '提升用户体验',
              [
                {text: '确认', onPress: () => {
                    this.dismissAlertView();
                    this._downLoadNewVersion()
                }},
              ],
              {cancelable: false},
            );
          } else {
            Alert.alert(
              alertSr,
              alerString|| '提升用户体验',
              [
                {
                  text: huSr,
                  onPress: () => {
                    this.state.isIngore = true;
                    this.dismissAlertView();
                  },
                  style: 'cancel',
                },
                {text: sjSr, onPress: () => {
                   this.dismissAlertView();
                   this._downLoadNewVersion();
                }},
              ],
              {cancelable: false},
            );
          }
        }else{
            this.toastMsg('已是最新版本');
        }
      }
    }).catch(error => {
        this.hideLoadingView();
        console.log(error);
    })
  }

    /** 
   * 下载版本
   */
    _downLoadNewVersion = () => {
        let url = Platform.OS === 'ios' ? itunceConnectUrl : tencentUrl;
        Linking.canOpenURL(url).then(supported => {
          if (supported) {
            return Linking.openURL(url);
          } else {
            console.log('Can\'t handle url: ' + url);
          }
        }).catch(err => {
          this.toastMsg(err.message || '操作失败');
        });
      }


    /**
     * 转至微信公众号
     */
    _btnToWechat() {
     Clipboard.setString('FCM');
        this.showAlertView('已成功复制FCM商旅公众号"FCM",打开微信后搜索并关注', () => {
            return ViewUtil.getAlertButton('关闭', () => {
                this.dismissAlertView();
            }, '打开微信', () => {
                this.dismissAlertView();
                wechat.isWXAppInstalled().then(isInstall => {
                    if (isInstall) {
                        wechat.openWXApp();
                    } else {
                        this.toastMsg('没有安装微信，请您安装微信之后再试')
                    }
                }).catch(error => {
                    this.toastMsg('打开微信异常');
                });
            })
        })

    }
    /**
      *  弹框错误
      */
    _toastInfoMessage = (message) => {
        this.toastMsg(message);
    }
    /**
     *  分享
     */
    _renderShare = () => {
        return (
            <TouchableHighlight underlayColor='transparent' onPress={() => { this.refs.share._show() }}>
                <View style={{ flexDirection: 'row', backgroundColor: 'white', alignItems: 'center', paddingHorizontal: 10, marginTop: 10 }}>
                    <View style={{ padding: 10, flex: 1 }}>
                        <CustomText text='分享FCM给好友' />
                        <View style={{ flexDirection: "row", marginTop: 5 }}>
                            <FontAwesome name={'weixin'} size={20} color={'green'} style={{ marginLeft: 5 }} />
                            {/* <FontAwesome name={'qq'} size={20} color={Theme.theme} style={{ marginLeft: 5 }} /> */}
                            <Image style={{ marginLeft: 5, width: 20, height: 20 }} source={require('../../res/image/personal_circle.png')} />
                            {/* <Image style={{ marginLeft: 5, width: 20, height: 20 }} source={require('../../res/image/personal_zone.png')} /> */}
                        </View>
                    </View>
                    <Ionicons name={'chevron-forward'} size={22} color={'lightgray'} />
                </View>
            </TouchableHighlight>
        )
    }

     /**
     * 查看条款
     */
    btnGoToTerms = () => {
        this.push('Web', {
        title: 'FCM个人信息保护政策',
        url: 'https://app.fcmonline.com.cn/content/pages/agreement/privacy_agreement.html',
        });
    };
    btnGoToTerms2 = () => {
        this.push('Web', {
        title: '服务协议',
        url: 'https://app.fcmonline.com.cn/content/pages/agreement/index.html',
        });
    };
    btnGoToTerms3 = () => {
        this.push('Web', {
        title: 'ICP备案号',
        url: 'http://beian.miit.gov.cn/',
        });
    };
    btnGoToTerms4 = () => {
        this.push('Web', {
          title: 'FCM儿童个人信息保护政策及监护人须知',
          url: 'https://app.fcmonline.com.cn/content/pages/agreement/children_privacy_agreement.html',
        });
    }
    btnGoToTerms5 = () => {
        this.push('Web', {
          title: '个人信息跨境传输同意函',
          url: 'https://app.fcmonline.com.cn/content/pages/agreement/cross_border_transfer_agreement.html',
        });
    }

    renderBody() {
        return (
            <ScrollView style={{ flex: 1 ,backgroundColor: Theme.normalBg}} scrollEnabled={true}>
                <View style={{ flex: 1,backgroundColor: '#fff', marginTop: 5  }}>
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: "center", marginTop: 20 }}>
                        <Image style={{ width: 120, height: 48 }} source={require('../../res/Uimage/img.png')} />
                    </View>
                    <View style={[styles.center, { flex: 1 ,padding:10, paddingHorizontal:25}]}>
                        <CustomText style={{ fontSize: 15,fontStyle:'italic',fontWeight:'bold' }} text='欢迎探索非凡之旅' />
                        <CustomText style={{ marginTop: 15,color:Theme.commonFontColor,lineHeight:21 }} text='FCM是世界最大的商旅管理公司之一，我们的全天候服务运营网络覆盖全球约100个国家及地区，旗下的专业团队遍布各地。FCM也是澳交所上市公司Flight Centre Travel Group（FCTG）的全球旗舰差旅分支机构，拥有丰富的航司、酒店、地面交通等全球资源。无论您身在何地，都能获取专属于您的最佳差旅解决方案。成千上万的全球大型企业和跨国机构，包括众多家喻户晓的品牌、财富与富时100强企业，都信赖FCM的技术与专家团队助其轻松无忧踏上旅程，实现差旅投资回报最大化。' />
                        <CustomText style={{ marginTop: 10,color:Theme.commonFontColor ,lineHeight:21}} text='FCM的敏捷、可定制化商旅技术平台能够预测并满足不同企业的需求。我们全球联网的专家团队拥有卓越的协商能力、丰富的当地行业经验，为您的商旅人员提供差旅安全照管支持，让企业尽享非凡的个性¬化商旅体验。无论您是定期去往国外出差，还是临时决定出行，或是想要整合多个国家间的差旅服务，FCM是您值得信赖的商旅合作伙伴。'/>
                        <CustomText style={{ marginTop: 10,color:Theme.commonFontColor,marginLeft:-34 }} text={Util.Parse.isChinese()?'欲了解更多信息，请访问www.fcmtravel.com。':''}/>
                    </View>
                </View>
                <View style={{ flex: 1, paddingHorizontal:20,backgroundColor:'#fff',marginTop:5 }}>
                    <View style={{ marginTop: 5}}>
                        {/* <View style={styles.row}>
                            <CustomText style={{color:Theme.aidFontColor}} text='关注商旅公众号' />
                            <TouchableOpacity onPress={this._btnToWechat.bind(this)}>
                                <CustomText style={{ color: Theme.theme }} text='OTW-TMC' />
                            </TouchableOpacity>
                        </View> */}
                        <TouchableOpacity onPress={() => this.btnGoToTerms2()}
                            style={[styles.row,{borderBottomWidth:0}]}>
                            <CustomText text='服务协议' />
                            <Ionicons name={'chevron-forward'} size={22} color={'lightgray'} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.btnGoToTerms()}
                            style={[styles.row,{borderBottomWidth:0}]}>
                            <CustomText  text='FCM个人信息保护政策' />
                            <Ionicons name={'chevron-forward'} size={22} color={'lightgray'} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.btnGoToTerms4()}
                            style={[styles.row,{borderBottomWidth:0}]}>
                            <CustomText text='FCM儿童个人信息保护政策及监护人须知' />
                            <Ionicons name={'chevron-forward'} size={22} color={'lightgray'} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.btnGoToTerms5()}
                            style={[styles.row,{borderBottomWidth:0}]}>
                            <CustomText text='个人信息跨境传输同意函' />
                            <Ionicons name={'chevron-forward'} size={22} color={'lightgray'} />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={()=>{
                                            this._getVersionUpGrade()
                                          }} 
                            style={[styles.row,{borderBottomWidth:0}]}>
                            <CustomText  text='当前版本号'/>
                            {/* <CustomText text={appVersion} style={{color:Theme.theme}}/> */}
                            <Text style={{color:Theme.theme}}> {appVersion}</Text>
                        </TouchableOpacity>
                    {/* {this._renderShare()} */}
                    <ShareItem ref='share' isHome={true} toastMessage={this._toastInfoMessage} filePath={baseH5Url + '/event/download'} title='FCM' description='推荐下载FCM-企业商旅服务升级版,差旅预订，审批管理' />
                </View>
                <TouchableOpacity onPress={() => this.btnGoToTerms3()}
                      style={{justifyContent:'center', alignItems:'center',marginTop:10}}>
                   <CustomText style={{color:Theme.darkColor}}  text='ICP备案号：沪ICP备14034926号-7A >' />
                </TouchableOpacity>
            </ScrollView >
        )
    }
}


const styles = StyleSheet.create({
    center: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    row: {
        flexDirection: 'row',
        backgroundColor: 'white',
        height: 50,
        borderBottomColor: Theme.lineColor,
        borderBottomWidth: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10
    }
})
