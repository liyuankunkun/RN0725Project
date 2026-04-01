import React from 'react';
import {
    Modal,
    Animated,
    Text,
    View,
    TouchableHighlight,
    StyleSheet,
    Image,
    AppState,
    Platform,
    NativeModules,
    DeviceEventEmitter
} from 'react-native';
import I18nUtil from '../../util/I18nUtil';
import Theme from '../../res/styles/Theme';
import DeviceUtil from '../../util/DeviceUtil';
import CustomText from '../../custom/CustomText';
import PropTypes from 'prop-types';
import CommonService from '../../service/CommonService';
import ViewUtil from '../../util/ViewUtil';
import NavigationUtils from '../../navigator/NavigationUtils';
import Alipay from '@0x5e/react-native-alipay';
import * as WeChat from 'react-native-wechat-lib';
import Key from '../../res/styles/Key';
export default class PayTypeView extends React.Component {

    static propTypes = {
        order: PropTypes.object.isRequired,
        PaymentInfo: PropTypes.object.isRequired,
        otwTHis: PropTypes.object.isRequired,
        from: PropTypes.string.isRequired,
    }

    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            modelHeight: new Animated.Value(0),
            payType: null,
        }
    }

    componentDidMount() {
        // 处理android 接受不到回调的问题
        if (Platform.OS === 'android') {
            AppState.addEventListener('change', (state) => {
                if (this.props.PaymentInfo && this.props.PaymentInfo.wechat && state === 'active') {
                    setTimeout(() => { // 延迟加载，目的接口更新慢
                        CommonService.PaymentInfo({ SerialNumber: this.props.order.SerialNumber, }).then(response => {
                            if (response && response.success) {
                                if (response.data.PaymentStatus == 2) {
                                    this.props.otwTHis.showAlertView('订单支付成功,您可去我的订单中查看', () => {
                                        return ViewUtil.getAlertButton('取消', () => {
                                            this.props.otwTHis.dismissAlertView();
                                            NavigationUtils.popToTop(this.props.otwTHis.props.navigation);
                                        }, '确定', () => {
                                            this.props.otwTHis.dismissAlertView();
                                            if (this.props.from === 'flight') {
                                                NavigationUtils.push(this.props.otwTHis.props.navigation, 'FlightOrderList');
                                            } else if (this.props.from === 'train') {
                                                NavigationUtils.push(this.props.otwTHis.props.navigation, 'TrainOrderListScreen');
                                            }else if (this.props.from === 'intlFlight') {
                                                NavigationUtils.push(this.props.otwTHis.props.navigation, 'IntlFlightOrderList');
                                            } else if (this.props.from === 'application' || this.props.from === 'hotel') {
                                                NavigationUtils.popToTop(this.props.otwTHis.props.navigation);
                                            }
                                        })
                                    })
                                }
                            }
                        })
                    }, 500);

                }
            });
        }
    }

    componentWillUnmount() {
        // AppState.removeAllListeners();
        // if(Platform.OS === 'android'){
        //     AppState.removeEventListener('change');
        // }

    }
    show() {
        const {order} = this.props;
        const BOTTOM_HEIGHT = DeviceUtil.is_iphonex() ? order.ExtraInfo.Vendors.length*84 : order.ExtraInfo.Vendors.length*70;
        this.setState({
            visible: true,
        }, () => {
            Animated.timing(this.state.modelHeight, {
                toValue: BOTTOM_HEIGHT,
                duration: 200
            }).start()
        })
    }
    dismiss = () => {
        Animated.timing(this.state.modelHeight, {
            toValue: 0,
            duration: 200
        }).start(() => {
            this.setState({
                visible: false,
            })
        })

    }

    _detailMoadl = (type) => {
        Animated.timing(this.state.modelHeight, {
            toValue: 0,
            duration: 200
        }).start(() => {
            this.setState({
                visible: false,
            }, () => {
                this._loadPaymentInfo(type);
            })
        })
    }

    pay = (type) => {
        const { PaymentInfo, otwTHis,from } = this.props;
        if (type === PayType.alipay) {    //原生支付宝支付
            this.payWithAlipay(PaymentInfo.alipay);
        }
        else if (type === PayType.wechat || type === PayType.wechatAlias) {     //原生微信支付
            this.payWithWeixin(PaymentInfo.wechat);
        }
        else if (type === PayType.yeepay) {     //易宝支付
            otwTHis.push('Web', {
                title: '易宝支付',
                url: PaymentInfo.yeepay
            });
        }
        else if (type === PayType.ums_alipay) {     //银联渠道支付宝支付
            NativeModules.ChinaUmsModule.payAliPayMiniPro(JSON.stringify(PaymentInfo.ums_alipay.appPayRequest)).then((req)=>{
                if (req=='0000') {
                    if (this.props.from === 'flight') {
                        otwTHis.push('FlightOrderList');
                        DeviceEventEmitter.emit(Key.FlightOrderListChange);
                    } else if (this.props.from === 'train') {
                        otwTHis.push('TrainOrderListScreen');
                        DeviceEventEmitter.emit(Key.TrainOrderListChange);
                    } else if (this.props.from === 'hotel') {
                        otwTHis.push('HotelOrderListScreen');
                        DeviceEventEmitter.emit('HotelOrderListScreenLoad');
                    }else if (this.props.from === 'intlHotel') {
                        otwTHis.push('InterHotelOrderListScreen');
                        DeviceEventEmitter.emit('InterHotelOrderListScreenLoad');
                    }else{
                        otwTHis.push('Personal');
                    }
                 }else{
                     alert('支付失败请重新支付');
                 }
            }).catch(error => {
                alert('支付失败请重新支付')
            })
        }
        else if (type === PayType.ums_wxpay) {      //银联渠道微信支付
            WeChat.launchMiniProgram({
                userName: PaymentInfo.ums_wxpay.wxMiniMetaId,
                miniProgramType: 0, //miniProgramType - 拉起小程序的类型. 0-正式版 1-开发版 2-体验版
                path: PaymentInfo.ums_wxpay.wxMiniPath
            }).then(function(req){
                if (req.errCode == 0 && req.extMsg=="success=true&message=") {
                    if (from === 'flight') {
                        otwTHis.push('FlightOrderList');
                        DeviceEventEmitter.emit(Key.FlightOrderListChange);
                    } else if (from === 'train') {
                        otwTHis.push('TrainOrderListScreen');
                        DeviceEventEmitter.emit(Key.TrainOrderListChange);
                    } else if (from === 'hotel') {
                        otwTHis.push('HotelOrderListScreen');
                        DeviceEventEmitter.emit('HotelOrderListScreenLoad');
                    }else if (from === 'intlHotel') {
                        otwTHis.push('InterHotelOrderListScreen');
                        DeviceEventEmitter.emit('InterHotelOrderListScreenLoad');
                    }else{
                        otwTHis.push('Personal');
                    }
                }else{
                    alert('支付失败请重新支付');
                }
            })
        }
        else if (type === PayType.ums_uac) {        //银联渠道银联支付
            otwTHis.push('Web', {
                title: '银联支付',
                url: PaymentInfo.ums_uac
            });
        }
        else{
            otwTHis.toastMsg('获取支付数据失败');
        }
    }

    //原生支付宝支付
    async payWithAlipay(AppPayload) {
        let otwThis = this.props.otwTHis;
        try {
            let response = await Alipay.pay(AppPayload);
            if (response.resultStatus === '6001') {
                otwThis.toastMsg('用户中途取消');
            } else if (response.resultStatus === '4000') {
                otwThis.toastMsg('操作失败');
            } else if (response.resultStatus === '6002') {
                otwThis.toastMsg('网络连接出错');
            } else if (response.resultStatus === '5000') {
                otwThis.toastMsg('重复请求');
            } else if (response.resultStatus === '9000') {
                otwThis.showAlertView('订单支付成功,您可去我的订单中查看', () => {
                    return ViewUtil.getAlertButton('取消', () => {
                        otwThis.dismissAlertView();
                        NavigationUtils.popToTop(otwThis.props.navigation);
                    }, '确定', () => {
                        otwThis.dismissAlertView();
                        if (this.props.from === 'flight') {
                            NavigationUtils.push(otwThis.props.navigation, 'FlightOrderList');
                        } else if (this.props.from === 'train') {
                            NavigationUtils.push(otwThis.props.navigation, 'TrainOrderListScreen');
                        } else if (this.props.from === 'application' || this.props.from === 'hotel') {
                            NavigationUtils.popToTop(otwThis.props.navigation);
                        }

                    })
                })
            }
        } catch (error) {
            if (error.message === '4000:系统繁忙，请稍后再试') {
                otwThis.toastMsg('请安装支付宝客户端进行支付');
                return;
            }
            otwThis.toastMsg('订单支付失败，请重新进行支付');
        }
    }
    //原生微信支付
    payWithWeixin(AppPayload) {
        if (!AppPayload) {
            this.props.otwTHis.toastMsg('获取支付数据失败');
            return;
        }
        const partnerId = AppPayload.PartnerId;
        const prepayId = AppPayload.PrepayId;
        const nonceStr = AppPayload.NonceStr;
        const timeStamp = AppPayload.Timestamp;
        const wxPackage = AppPayload.Package;
        const sign = AppPayload.Sign;
        if (!partnerId || !prepayId || !nonceStr || !timeStamp || !wxPackage || !sign) {
            this.props.otwTHis.toastMsg('获取支付数据失败');
            return;
        }
        const obj = {
            partnerId: partnerId,
            prepayId: prepayId,
            nonceStr: nonceStr,
            timeStamp: String(timeStamp),
            package: wxPackage,
            sign: sign
        }
        WeChat.isWXAppInstalled().then(isInstall => {
            if (!isInstall) {
                this.props.otwTHis.toastMsg('没有安装微信，请您安装微信之后再试')
                return;
            }
            return WeChat.pay(obj).then((response) => {
                if (response && parseInt(response.errCode) === 0) {
                    this.props.otwTHis.showAlertView('订单支付成功,您可去我的订单中查看', () => {
                        return ViewUtil.getAlertButton('取消', () => {
                            this.props.otwTHis.dismissAlertView();
                            NavigationUtils.popToTop(this.props.otwTHis.props.navigation);
                        }, '确定', () => {
                            this.props.otwTHis.dismissAlertView();
                            if (this.props.from === 'flight') {
                                NavigationUtils.push(this.props.otwTHis.props.navigation, 'FlightOrderList');
                            } else if (this.props.from === 'train') {
                                NavigationUtils.push(this.props.otwTHis.props.navigation, 'TrainOrderListScreen');
                            } else if (this.props.from === 'application' || this.props.from === 'hotel') {
                                NavigationUtils.popToTop(this.props.otwTHis.props.navigation);
                            }
                        })
                    })
                } else {
                    this.props.otwTHis.toastMsg((response && response.errStr) || '支付失败，请重新进行支付');
                }
            })
        }).catch(() => {
            this.props.otwTHis.toastMsg('打开微信异常');
        })
    }

    _loadPaymentInfo = (type) => {
        const { order, PaymentInfo, otwTHis } = this.props;
        let model = {
            SerialNumber: order.SerialNumber,
            PaymentType: type,
            TradeType: 'APP'
        }
        otwTHis.showLoadingView('订单确认中');
        //请求支付参数
        CommonService.paymenPayload(model).then(response => {
            otwTHis.hideLoadingView();
            if (response && response.success) {
                if (type === PayType.alipay) {    //原生支付宝支付
                    PaymentInfo.alipay = response.data.Payload;
                }
                else if (type === PayType.wechat || type === PayType.wechatAlias) {     //原生微信支付
                    PaymentInfo.wechat = response.data;
                }
                else if (type === PayType.yeepay) {     //易宝支付
                    PaymentInfo.yeepay = response.data.Payload;
                }
                else if (type === PayType.ums_alipay) {     //银联渠道支付宝支付
                    PaymentInfo.ums_alipay = response.data;
                }
                else if (type === PayType.ums_wxpay) {      //银联渠道微信支付
                    PaymentInfo.ums_wxpay = response.data;
                }
                else if (type === PayType.ums_uac) {        //银联渠道银联支付
                    PaymentInfo.ums_uac = response.data.Payload;
                }
                else{
                    otwTHis.toastMsg('支付失败');
                    return;
                }

                //发起支付
                this.pay(type);
            }else if(response.code===0){
                otwTHis.toastMsg('支付失败');
                return;
            }
             else {
                // otwTHis.toastMsg(response.message || '获取支付数据失败');
                otwTHis.toastMsg('支付失败');
            }
        }).catch(error => {
            otwTHis.hideLoadingView();
            // otwTHis.toastMsg(error.message || '获取支付数据失败');
            otwTHis.toastMsg('支付失败');
        })

    }

    render() {
        const { visible, modelHeight } = this.state;
        const { order } = this.props;
        return (
            <Modal transparent visible={visible}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end', }}>
                    <TouchableHighlight underlayColor='transparent' style={{ flex: 1 }} onPress={this.dismiss}>
                        <View></View>
                    </TouchableHighlight>
                    <Animated.View style={{ backgroundColor: 'white', height: modelHeight }}>
                        <View style={{  height: 45, justifyContent: 'center', alignItems: "center" ,borderBottomWidth:1,borderColor:Theme.lineColor}}>
                            <Text style={{ fontSize: 16,color:Theme.fontColor }}>{I18nUtil.translate('需支付')}<Text style={{ color: Theme.theme ,fontWeight:'bold'}}>¥{order && order.Amount}</Text>，{I18nUtil.translate('请选择支付方式')}</Text>
                        </View>
                        {
                             order.ExtraInfo.Vendors&&order.ExtraInfo.Vendors.map((item,index) => {
                                return <TouchableHighlight key={item.Code} style={{ height: 60 }} underlayColor='transparent' onPress={this._detailMoadl.bind(this, item.Code)}>
                                    <View style={styles.row}>
                                        <Image style={{ width: 24, height: 24, resizeMode: 'contain' }} source={ imageLo[index] } />
                                        <CustomText style={{ marginLeft: 15 }} text={item.Name} />
                                    </View>
                                </TouchableHighlight>
                            })
                        }
                        {/* <TouchableHighlight style={{ height: 60 }} underlayColor='transparent' onPress={this._detailMoadl.bind(this, PayType.wechat)}>
                            <View style={styles.row}>
                                <Image style={{ width: 20, height: 20 }} source={require('../../res/image/weinxin.png')} />
                                <CustomText style={{ marginLeft: 15 }} text='微信支付' />
                            </View>
                        </TouchableHighlight>
                        <View style={{ backgroundColor: Theme.lineColor, height: 1 }}></View>
                        <TouchableHighlight style={{ height: 60 }} underlayColor='transparent' onPress={this._detailMoadl.bind(this, PayType.alipay)}>
                            <View style={styles.row}>
                                <Image style={{ width: 20, height: 20 }} source={require('../../res/image/alipay.png')} />
                                <CustomText style={{ marginLeft: 15 }} text='支付宝' />
                            </View>
                        </TouchableHighlight>
                        <View style={{ backgroundColor: Theme.lineColor, height: 1 }}></View>
                        <TouchableHighlight style={{ height: 60 }} underlayColor='transparent' onPress={this._detailMoadl.bind(this, PayType.yeepay)}>
                            <View style={styles.row}>
                                <Image style={{ width: 20, height: 20 }} source={require('../../res/image/yeepay.png')} />
                                <CustomText style={{ marginLeft: 15 }} text='易宝支付' />
                            </View>
                        </TouchableHighlight> */}
                        <View style={styles.bottom}>
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        )
    }
}


const styles = StyleSheet.create({
    row:
    {
        height: 60,
        flexDirection: "row",
        padding: 10,
        alignItems: 'center',
    },
    bottom: {
        height: DeviceUtil.is_iphonex() ? 34 : 0
    }
})

const PayType = {
    // wechat: 'WxPay',
    wechat: 'Wechatpay',    //原生微信支付
    wechatAlias: 'WxPay',   //原生微信支付的别名（旧版APP硬编码的写法），处理逻辑同原生微信支付
    alipay: 'Alipay',       //原生支付宝支付
    yeepay: 'Yeepay',       //易宝支付
    //unipay: 'UMS_Uac',
    ums_wxpay: 'UMS_Wxpay',     //银联渠道的微信支付，采用自研小程序桥接的方式完成支付
    ums_alipay: 'UMS_Alipay',   //银联渠道的支付宝支付，采用银联支付宝小程序桥接的方式完成支付
    ums_uac: 'UMS_Uac',         //银联渠道的银行卡支付，采用打开银联商务网关的方式完成支付
}

const imageLo = [
    require('../../res/Uimage/eboPay.png'), 
    require('../../res/Uimage/wechartPay.png'),
    require('../../res/Uimage/aliPay.png'),  
  ]
