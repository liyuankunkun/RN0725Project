import React from 'react';
import {
    View,
    StyleSheet,
    Platform,
    Text,
    DeviceEventEmitter,
    TouchableHighlight,
    TouchableOpacity,
    ImageBackground,
    Image,
} from 'react-native';
import SuperView from '../../super/SuperView';
import HeaderView1 from './HeaderView1';
import Theme from '../../res/styles/Theme';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import CustomText from '../../custom/CustomText';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomeTextInput from '../../custom/CustomTextInput';
import CustomActioSheet from '../../custom/CustomActionSheet';
import ViewUtil from '../../util/ViewUtil';
import Key from '../../res/styles/Key';
import Util from '../../util/Util';
import I18nUtil from '../../util/I18nUtil';
import TrainEnum from '../../enum/TrainEnum';
import TrainService from '../../service/TrainService';
import CommonService from '../../service/CommonService';
import  LinearGradient from 'react-native-linear-gradient';
import AntDesign from 'react-native-vector-icons/AntDesign';

export default class TrainRefundScreen extends SuperView {

    constructor(props) {
        super(props);
        this.params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};
        this._navigationHeaderView = {
            title: '退票申请',
            statusBar: {
                backgroundColor: Theme.theme,
            },
            // hide:true,
            style: {
                backgroundColor: Theme.theme,
            },
            titleStyle: {
                color: 'white'
            },
            leftButton2:true,
        }
        this.state = {
            order: null,
            reasonDesc: null,
            reasonCode: null,
            inputReason: '',
            options: ['因公司原因行程退票', '因个人原因行程退票', '其他'],
            IsNightConfirm: false,
            login12306Name:null,
            login12306Data:null,
            Is12306Login:false,
            customerInfo: {}
        }
    }

    componentDidMount = ()=> {
        this._loadAgain();
        this.backFromShopListener = DeviceEventEmitter.addListener(
            'load123',  //监听器名
            () => {
                this._loadAgain();
            },
        );
    }

    _loadAgain=()=>{
        CommonService.customerInfo().then(response => {
            this.setState({
                customerInfo:response.data
            },()=>{
                this._getTrainLink(response.data);
            })
        }).catch(error => {
            this.toastMsg(error.message || '获取数据异常');
        })
    }

    _getTrainLink=(customerInfo)=>{
        if(customerInfo&&customerInfo.TrainAccount){
          //获取完信息先免密登录12306---------------------------
          this.hideLoadingView();
              let model = {
                  TrainAccount:customerInfo.TrainAccount
              } 
              this.showLoadingView(); 
              TrainService.Train12306AutoLogin(model).then(response =>{
                  this.hideLoadingView();
                  if(response.success){
                        this.setState({
                              login12306Name:customerInfo.TrainAccount,
                              login12306Data:customerInfo.TrainAccountId,
                              Is12306Login:true
                            //   trainLinkloading:true,
                        })
                  }else{
                    this.setState({
                        // trainLinkloading:true,
                    })
                  }
              }).catch(error=>{
                  this.hideLoadingView();
                  this.toastMsg(error || '操作失败');
              })
        }else{
            this.setState({
                // trainLinkloading:true,
            })
        }
    }

    /**
     *  选择
     */
    _handlePress = (index) => {
        this.setState({
            reasonCode: index + 1,
            reasonDesc: this.state.options[index]
        })
    }
    /**
     *  选择退票原因
     */
    _selectReason = () => {
        this.actionSheet.show();
    }
    /**
     *  取消退票
     */
    _cancelRefund = () => {
        this.pop();
    }

    /**
     *  提交退票
     */
    _submitRefund = () => {
        const { reasonCode, inputReason, IsNightConfirm,login12306Data,Is12306Login,customerInfo } = this.state;
        const { order } = this.params
        if (!reasonCode || reasonCode === 0) {
            this.toastMsg('请选择退票原因');
            return;
        }
        if (!inputReason) {
            this.toastMsg('请填写退票原因');
            return;
        }
        if(customerInfo&&customerInfo.Setting&&customerInfo.Setting.IsNeedBind12306 && !login12306Data){
            this.toastMsg('请关联12306账号');
            return;
        }
        let str = Util.Parse.isChinese()?'此次订单为停运车次行程订单，退款以12306最终退款为准，是否继续提交退票?':'The scheduled train has been cancelled. The exact refund amount may vary depending on the final validation of the refund application by 12306. Continue to submit refund request?'
        let alertA = Util.Parse.isChinese()? TrainEnum.trainRefundNotice.cn : TrainEnum.trainRefundNotice.en
        let alertB = Util.Parse.isChinese()? TrainEnum.trainRefundNoticeGSG.cn : TrainEnum.trainRefundNoticeGSG.en
        let alertStr =order.TrainIsOutage ? str : (order.TrainInfo.ToStationCode==="XJA" || order.TrainInfo.FromStationCode==="XJA")?alertB: alertA
        this.showAlertView(alertStr, () => {
                return ViewUtil.getAlertButton('取消', () => {
                    this.dismissAlertView();
                    this.pop();
                }, '继续提交', () => {
                    this.dismissAlertView();  
                    this.showLoadingView();
                    let refundModel = {
                        Platform: Platform.OS,
                        OrderId: this.params.order.Id,
                        ReasonCode: reasonCode,
                        ReasonDesc: inputReason,
                        IsNightConfirm: IsNightConfirm,
                        TrainInfo:{
                            EmployeeTrainAccountId:login12306Data,
                            Is12306Login:Is12306Login
                        }
                    };
                    this.showLoadingView();
                    TrainService.orderRefund(refundModel).then(response => {
                        this.hideLoadingView();
                        if (response && response.success) {
                            this.showAlertView('提交退票成功', () => {
                                return ViewUtil.getAlertButton('确定', () => {
                                    this.dismissAlertView();
                                    DeviceEventEmitter.emit(Key.TrainOrderListChange, this.params.order);
                                    DeviceEventEmitter.emit('goHome', {});
                                    this.pop();
                                })
                            })
                        } else if (response.code == '7') {
                            this.showAlertView(response.message, () => {
                                return ViewUtil.getSubmitButton('取消', () => {
                                    this.dismissAlertView();
                                }, '继续预订', () => {
                                    this.dismissAlertView();
                                    this.setState({
                                        IsNightConfirm: true
                                    }, () => {
                                        this._submitRefund();
                                    })
                                })
                            })
                        } else {
                            this.toastMsg(response.message || '提交退票失败');
                        }
                    }).catch(error => {
                        this.hideLoadingView();
                        this.toastMsg(error.message || '提交退票异常');
                    })
                })
        }); 
        
       
    }

    _showRules = () => {
        const { order } = this.params;
        let _alertA = Util.Parse.isChinese() ? TrainEnum.trainOrderNotice.cn : TrainEnum.trainOrderNotice.en
        let _alertB = Util.Parse.isChinese() ? TrainEnum.trainOrderNoticeGSG.cn : TrainEnum.trainOrderNoticeGSG.en
        this.showAlertView( (order.TrainInfo.ToStationCode==="XJA" || order.TrainInfo.FromStationCode==="XJA") ? _alertB : _alertA );
    }

    _LeftTitleBtn(){
        this.pop();
    }

    renderBody() {
        const { order } = this.params;
        const { reasonDesc, options, customerInfo } = this.state;
        if (!order) return null;
        const { TrainInfo: trainInfo,Amount } = this.params.order;
        console.log(trainInfo)
        return (
            <LinearGradient  start={{x: 1, y: 0}} end={{x: 1, y: 0.5}} style={{flex:1}} colors={[Theme.theme,Theme.normalBg]}>
                {/* <View style={{flexDirection:'row',paddingHorizontal:15,justifyContent:'space-between',height:44,alignItems:'center'}}>
                    <TouchableOpacity onPress={()=>{this._LeftTitleBtn()}}>
                        <AntDesign name={'arrowleft'} size={20} color={'#fff'} />
                    </TouchableOpacity>
                    <CustomText text={'退票申请'} style={{fontSize:16, color:'#fff'}} />
                    <CustomText style={{fontSize:16, color:'#fff'}} text={''}></CustomText>
                </View> */}
                <KeyboardAwareScrollView keyboardShouldPersistTaps="handled" style={{flex:1}} showsVerticalScrollIndicator={false}>
                    {/* {this._trainInfo()} */}
                    <HeaderView1 trainInfo={trainInfo} Amount={Amount} otwThis={this}/>
                    {customerInfo&&customerInfo.Setting&&customerInfo.Setting.IsShowBind12306?this._renderRelate():null}
                    <View style={{margin:10,borderRadius:6,padding:10,backgroundColor: "white",}}>
                        <View style={{  paddingHorizontal: 10, paddingVertical: 10,flexDirection:'row' }}>
                            <Image source={require('../../res/Uimage/shu.png')} style={{width:14,height:14}}/>
                            <CustomText text={`${I18nUtil.translate('乘车人')}：${order.PassengerName || (order.OrderPassenger?.Name)}`} />
                        </View>
                        <View style={{ height: 1, backgroundColor: Theme.lineColor }}></View>
                        <TouchableHighlight underlayColor='transparent' onPress={this._selectReason}>
                            <View style={{ backgroundColor: "white", alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', padding: 10 }}>
                                <CustomText text={reasonDesc ? reasonDesc : '请选择退票原因'} />
                                <Ionicons name={'chevron-forward'} size={22} color={'lightgray'} />
                            </View>
                        </TouchableHighlight>
                    </View>
                    <CustomeTextInput style={styles.input} placeholder='请输入退票原因' maxLength={125} multiline={true} onChangeText={text => this.setState({ inputReason: text })} />
                    <CustomActioSheet ref={o => this.actionSheet = o} options={options} onPress={this._handlePress} />
                </KeyboardAwareScrollView>
            {
                ViewUtil.getTwoBottomBtn('取消退票',this._cancelRefund,'确定退票',this._submitRefund)
            }
            </LinearGradient>
        )
    }
        /**关联12306 */
        _renderRelate =()=>{
            const{login12306Name}=this.state;
            return(
                <View style={styles.viewStyle}>  
                <View style={{flexDirection:'row',alignItems:'center'}}>
                <ImageBackground style={{width:38,height:38}} source={require('../../res/Uimage/trainFloder/train12306.png')}/>
                    {login12306Name?
                    <View style={{flexDirection:'row',flex:1,justifyContent:'space-between'}}>
                        <View style={{flexDirection:'column'}}>
                            <CustomText style={{fontSize:14,marginLeft:10,width:Util.Parse.isChinese()?150:100}} text={login12306Name}/>
                            <CustomText style={{fontSize:12,marginLeft:10,color:Theme.theme}} text={'已关联'}/>
                        </View>
                        <View style={{flexDirection:'row',alignItems:'center'}}>
                            <TouchableOpacity onPress={this._logoutClick} style={styles.toucStyle}>
                                <CustomText style={{fontSize:14,color:'#fff',paddingHorizontal:10}} text={'退出'}></CustomText>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={this._relateClick2} style={styles.toucStyle2}>
                                <CustomText style={{fontSize:14,color:'#fff',paddingHorizontal:10}} text={'切换'}></CustomText>
                            </TouchableOpacity>
                        </View>
                    </View>
                    :
                    <View style={{flexDirection:'row',alignItems:'center'}}>
                        <View style={{width:230,marginLeft:10}}>
                            <CustomText style={{fontSize:14,fontWeight:'bold',color:Theme.commonFontColor}} text='铁路局规定购票必须实名制'/>
                            <CustomText style={{marginTop:5,fontSize:12,color:Theme.assistFontColor}} text='登录12306账号提高出票成功率' />
                        </View>
                        <TouchableOpacity onPress={this._relateClick1} style={styles.toucStyle3}>
                                <CustomText style={{fontSize:14,color:'#fff',paddingHorizontal:10}} text={'关联'}></CustomText>
                        </TouchableOpacity>
                    </View>
                    }
                </View>
             </View> 
            )
        }
            //退出绑定12306
        _logoutClick =() =>{
            this.showLoadingView();
            const {login12306Name} = this.state;
            let model = {
                    trainAccount:login12306Name, 
            }
            TrainService.TrainAccountCancelApp(model).then(response => {
                this.hideLoadingView();
                if (response && response.success) {
                    this.setState({
                        login12306Name:null,
                        login12306Data:null,
                    })
                } else {
                    this.toastMsg(response.message || '退出12306账号失败');
                }
            }).catch(error => {
                this.hideLoadingView();
                this.toastMsg(error.message || '退出12306账号异常');
            })
        
        }

        _relateClick1= ()=>{
            this.push('TrainRelateScreen',{callBack:(name,passWord,data)=>{
                this.setState({
                    login12306Name:name,
                    passWord:passWord,
                    login12306Data:data
                })
            }})
        }
        _relateClick2= ()=>{
            this.push('TrainRelateScreen',{_switch:true, callBack:(name,passWord,data)=>{
                this.setState({
                    login12306Name:name,
                    passWord:passWord,
                    login12306Data:data
                })
            }})
        }
 
}
const styles = StyleSheet.create({
    input: {
        marginHorizontal: 10,
        height: 80,
        backgroundColor: 'white',
        padding: 10,
        borderRadius:6
    },
    btn: {
        flex: 1,
        backgroundColor: Theme.theme,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        height: 40
    },
    center: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    detailAidFont: {
        fontSize: 12,
        color: Theme.aidFontColor
    },
    detailMarkFont: {
        fontSize: 12,
        color: Theme.annotatedFontColor
    },
    aidFont: {
        color: Theme.aidFontColor,
        fontSize: 15
    },
    detailTimeFont: {
        fontSize: 25,
        fontWeight:'bold'
    },
    imageStyle: {
        width: 30,
        height: 30,
        marginLeft: 5
    },
    detailMainFont: {
        color: Theme.commonFontColor
    },
    viewStyle:{
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        padding:10,
        alignContent:'center',
        backgroundColor:'#fff',
        marginHorizontal:10,
        borderRadius:6,
        marginTop:10
    },
    toucStyle:{
        height:28,
        backgroundColor:Theme.theme,
        borderRadius:4,
        justifyContent:'center',
        alignItems:'center',
        borderStartWidth:1,
        borderColor:Theme.theme
    },
    toucStyle2:{
        height:28,
        backgroundColor:Theme.theme,
        borderRadius:4,
        justifyContent:'center',
        alignItems:'center',
        marginLeft:5
    },
    toucStyle3:{
        right:10,
        height:28,
        backgroundColor:Theme.theme,
        borderRadius:4,
        justifyContent:'center',
        alignItems:'center'
    }
})