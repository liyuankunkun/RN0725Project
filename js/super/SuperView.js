import React from 'react';
import {
    View,
    TouchableHighlight,
    NativeModules,
    NativeEventEmitter,
    NativeAppEventEmitter,
    DeviceEventEmitter,
    Platform,
    Image,
    StyleSheet,
    Text,
    ImageBackground,
    TouchableOpacity,
} from 'react-native';
import NavigationBar from '../custom/NavigationBar';
import ViewUtil from '../util/ViewUtil';
import NavigationUtils from '../navigator/NavigationUtils';
import LoadingView from '../custom/LoadingView';
import ToastView from '../custom/ToastView';
import AlertView from '../custom/AlertView';
import CustomText from '../custom/CustomText';
import SafeAreaViewPlus from '../custom/SafeAreaViewPlus';
import Key from '../res/styles/Key';
// import UserInfoDao from '../service/UserInfoDao';
import { ScrollView } from 'react-native';
import Theme from '../res/styles/Theme';
export default class SuperView extends React.Component {
    /** 
     *  设置导航栏
     */
    _navigationHeaderView = {};
    /**
     * 
     * @param  底部适配
     *  
     */
    _tabBarBottomView = {};
    // 展示弹框
    _showCaptureAlert = false;//分享、反馈btn

    constructor(props) {
        super(props);

        this.addLossTokenListener = DeviceEventEmitter.addListener(Key.ErrorFailuer, this._errorLossTokenFailuer);
        if (Platform.OS === 'ios') {
            // 添加时间监听
            let iOSExport = NativeModules.SendMessageModule;
            if (iOSExport) {
                const manageEmitter = new NativeEventEmitter(iOSExport);
                this.nativeEvent = manageEmitter.addListener('UserDidTakeScreenshot', () => {
                    this.screenDisplay();
                })
            }
        } else {
            this.nativeEvent = NativeAppEventEmitter.addListener('UserDidTakeScreenshot', () => {
                this.screenDisplay();
            })
        }
    }

    componentWillUnmount() {
        // this.addLossTokenListener && this.addLossTokenListener.remove();
        // this.hideRightTimer && clearTimeout(this.hideRightTimer);
        // this.nativeEvent && this.nativeEvent.remove();
        // this.setState = (state, callBack) => {
        //     return;
        // }

    }

    /**
     *  错误处理时间
     */
    _errorLossTokenFailuer = (e) => {
        // this.showAlertView('登录失效，请重新登录', () => {
        //     return ViewUtil.getAlertButton('确定', () => {
        //         this.dismissAlertView();
        //         UserInfoDao.removeAllInfo().then(() => {
        //             // UMNative.profileSignOff();
        //             this.push('Init');
        //         }).catch(error => {

        //         })
        //         // 注销推送标签
        //         AliyunPush.listTags(1).then((result)=>{
        //                 // console.log("listTags1 success");
        //                 // console.log(JSON.stringify(result));
        //                 let arr = result.split(",")
        //                 AliyunPush.unbindTag(1,arr,"")
        //                 .then((result)=>{
        //                     // console.log("unbindTag succcess");
        //                     // console.log(JSON.stringify(result));
        //                 })
        //                 .catch((error)=>{
        //                     console.log("unbindTag error");
        //                     console.log(JSON.stringify(error));
        //                 });
        //         }).catch((error)=>{
        //             console.log("listTags error");
        //             console.log(JSON.stringify(error));
        //         });
        //     })
        // })
    }

    _backBtnClick = () => {
        this.pop();
    }




    /**
     * 返回上一个页面
     */
    pop() {
        NavigationUtils.pop(this.props.navigation);
    }
    /**
     * 前往下一个页面
     */
    push(routeName, params) {
        NavigationUtils.push(this.props.navigation, routeName, params);
    }

    screenDisplay = () => {
        this._showCaptureAlert = true;
        this.setState({

        }, () => {
            this.hideRightTimer = setTimeout(() => {
                this._showCaptureAlert = false;
                this.setState({});
                clearTimeout(this.hideRightTimer);
            }, 8000);
        })
    }


    /**
     *  显示Loading遮罩
     */
    showLoadingView(title) {
        if (title) {
            this.refs.loadingView.setTitle(title);
        }else{
            this.refs.loadingView.show();
        }
    }
    /**
     *  隐藏Loading加载
     */
    hideLoadingView() {
        this.refs.loadingView.dismiss();
    }
    /**
     *  toast 显示
     * @param  message 
     */
    toastMsg(message) {
        if (message) {
            this.refs.toastView.show(message);
        }
    }
    /**
  * 显示alertView(回调事件可重写：_alertBtnClick)
  * @param content  内容string 或 返回React元素function
  * @param btnView  按钮元素 (可选) 默认为【"确定"】
  * @param title    标题 默认为"温馨提示"
  * @param alertType 弹窗类型，默认‘yes'
  */
    showAlertView(content, btnView, title, callBack,redBack) {
        const alertObj = {};
        if (content instanceof Function) {
            alertObj.contentView = content;
        } else {
            alertObj.contentView = null;
            alertObj.content = content || '';
        }
        if (btnView) {
            alertObj.btnView = btnView;
        }
        if (title !== undefined) {
            alertObj.title = title;
        }
        if (callBack) {
            alertObj.callBack = callBack;
        }
        if(redBack){
            alertObj.redBack = redBack;
        }
        this.refs.alertView.showAlertView(alertObj);
    }


    /**
     * 隐藏alertView
     */
    dismissAlertView() {
        this.refs.alertView.dismiss();
    }
    /**
     * 导航栏内容
     */
    _renderNavigationBar() {
        const headerView = this._navigationHeaderView;
        if (!headerView) return null;
        return (
            <NavigationBar
                title={headerView.title}
                titleView={headerView.titleView}
                hide={headerView.hide}
                rightButton={headerView.rightButton}
                leftButton={
                      headerView.hideLeft ? null : 
                      (
                        headerView.leftButton ? 
                        headerView.leftButton :
                            headerView.leftButton2? // 自定义返回按钮颜色
                            ViewUtil.getLeftBackButton2(this._backBtnClick.bind(this)):
                            ViewUtil.getLeftBackButton(this._backBtnClick.bind(this))
                      )
                }
                statusBar={headerView.statusBar}
                style={headerView.style}
                titleStyle={headerView.titleStyle}
            />
        )
    }
   
    /** 
     *  继续补充内容
     */
    renderBody() {
        return <View />
    }
    renderAlert() {
       let alertStr1 = '感谢您使用FCM商旅APP！\n我们根据相关法律要求，制定了';
       let alertStr2 ='为向您提供更好的服务，在使用我们的产品前，请您务必阅读《隐私协议》的全部内容，我们通过《隐私协议》向您说明：1、为向您提供出行预订服务、交易支付在内的基本功能，我们可能会基于具体业务场景收集您的个人信息；2、我们会通过技术方案管理和保护您的个人信息；3、未经您同意，我们不会将您的个人信息共享给第三方；4、我们会基于您的授权来为您提供更好的出行服务，这些授权包括设备信息（为了保障账户和交易安全，我们会获取IMEI，IMSI，UUID在内的设备标识符）、定位(为您推荐附近的优质酒店资源）、存储空间（减少重复加载、节省流量），您有权拒绝或取消这些授权；5、为向您提供更好的商旅服务，需要您授权同意接受FCM向您的电子邮件、手机、通信地址等发送商业信息，包括但不限于预订业务的通知信息、审批信息、出行提示信息等。6、请您务必阅读并理解《隐私协议》内容，完全知情并同意后再继续使用FCMAPP提供的服务。'
       return(
            <ImageBackground style={styles.alertViewStyle} source={require('../res/login_dragon_bg1.jpg')}>
                <View style={{backgroundColor: 'rgba(52, 52, 52, 0.5)',width: '100%',height:'100%',padding:40 , alignItems:'center',justifyContent:'center'}}>
                    <View style={{flexDirection:'row', alignItems:'center',justifyContent:'center',backgroundColor:'#fff', borderRadius:8,paddingVertical:40,paddingHorizontal:20,height:global.screenHeight/2}}>
                        <View>
                            <View style={{ alignItems:'center',justifyContent:'center'}}>
                                <CustomText text={'温馨提示'} style={{fontSize:20, fontWeight:'bold'}}></CustomText>
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    <Text style={{lineHeight:20,marginTop:8}}>
                                    {alertStr1}
                                    {/* <Text onPress={() => this.btnGoToTerms()} style={{color:Theme.theme}}>
                                    {' '}《服务条款》
                                    </Text>
                                    和 */}
                                    <Text onPress={() => this.btnGoToTerms()} style={{color:Theme.theme}}>
                                    {' '}《隐私协议》
                                    </Text>
                                    {alertStr2}
                                    </Text>
                                </ScrollView>
                            </View>
                            <View style={{flexDirection:'row',justifyContent:'space-around',borderTopWidth:1, borderColor:Theme.lineColor,marginTop:8}}>
                                <TouchableOpacity onPress={()=>this.clickOut()} style={{marginTop:8,borderRightWidth:1,borderColor:Theme.lineColor,width:'50%',alignItems:'center'}}>
                                  <CustomText text={'不同意'} style={{fontSize:18}}/>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={()=>this.clickOut2()} style={{marginTop:8,borderRightWidth:1,borderColor:Theme.lineColor,width:'50%',alignItems:'center'}}>
                                  <CustomText text={'同意并继续'} style={{fontSize:18, color:Theme.theme}}/>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </ImageBackground>
        )  
    }
    render() {
        let topColor = Theme.TopColor;
        if (this._navigationHeaderView) {
            if (this._navigationHeaderView.statusBar && this._navigationHeaderView.statusBar.backgroundColor) {
                topColor = this._navigationHeaderView.statusBar.backgroundColor;
            } else if (this._navigationHeaderView.style && this._navigationHeaderView.style.backgroundColor) {
                topColor = this._navigationHeaderView.style.backgroundColor;
            }
        }

        return (
            <SafeAreaViewPlus 
                ref={'superSafeView'} 
                {...this.props} 
                topColor={topColor}
                topInset={this._navigationHeaderView ? true : false} 
                {...this._tabBarBottomView}
            >
                <View style={{ flex: 1, position: 'relative' }}>
                    {this._renderNavigationBar()}
                    {this.renderBody()}
                    <ToastView ref='toastView' position={'center'} />
                    <LoadingView ref='loadingView' />
                    <AlertView ref='alertView' />
                    {/* {this._renderShareFeed()} */}
                </View>
            </SafeAreaViewPlus >
        )
    }
}
const styles = StyleSheet.create({
    alertStyle:{
    width: '80%',
    backgroundColor:'#fff',
    borderRadius:8,
    padding:20,
    marginTop:-200
    },
    alertViewStyle:{
    flex:1,
    }
})
