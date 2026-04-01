import React from 'react';
import {
    View,
    Text,
    Platform,
    StyleSheet,
    TouchableHighlight,
    DeviceEventEmitter
} from 'react-native';
import SuperView from '../../super/SuperView';
import ViewUtil from '../../util/ViewUtil';
import NavigationUtils from '../../navigator/NavigationUtils';
import BackPress from '../../common/BackPress';
import Util from '../../util/Util';
import Theme from '../../res/styles/Theme';
import CustomText from '../../custom/CustomText';
import I18nUtil from '../../util/I18nUtil';
import AntDesign from 'react-native-vector-icons/AntDesign';
import CommonService from '../../service/CommonService';
import UserInfoDao from '../../service/UserInfoDao';
import PayTypeView from '../common/PayTypeView';
import PayPriceInfoView from './PayPriceInfoView';
import CustomTextInput from '../../custom/CustomTextInput';
import HotelService from '../../service/HotelService';
import CommonEnum from '../../enum/CommonEnum';
export default class HotelPaymentScreen extends SuperView {

    constructor(props) {
        super(props);
        this.params = props.navigation.state.params || {};
        this._navigationHeaderView = {
            title: '信息核实'
        }
        this._tabBarBottomView = {
            bottomInset: true,
        }
        this.backPress = new BackPress({ backPress: () => this._backBtnClick() })
        this.state = {
            order: null,
            customerInfo: null,
            PaymentInfo: {
                alipay: null,
                wechat: null
            },
            comment: ''
        }
    }

    // 重置手势滑动
    static navigationOptions = ({ navigation }) => {
        return {
            gesturesEnabled: false
        }
    }


    /**
     *  返回按钮
     */
    _backBtnClick = () => {
        const { fromId } = this.params;
        if (fromId === 'newNoticeCenter') {
            this.pop()
        }else{
            this.showAlertView('您还未完成订单支付，如现在退出，可稍后进入【支付列表】页完成支付。确认退出吗', () => {
                return ViewUtil.getAlertButton('退出', () => {
                    this.dismissAlertView();
                    DeviceEventEmitter.emit('deleteApply', {});
                    NavigationUtils.popToTop(this.props.navigation);
                }, '继续支付', () => {
                    this.dismissAlertView();
                })
            })
            return true;
        }
    }
    componentDidMount() {
        this.backPress.componentDidMount();
        let model={
            SerialNumber:this.params.SerialNumber
        }
        this.showLoadingView();
        UserInfoDao.getCustomerInfo().then(customerInfo => {
            CommonService.PaymentInfo(model).then(response => {
                this.hideLoadingView();
                if (response && response.success) {
                    this.setState({
                        order: response.data,
                        customerInfo: customerInfo
                    },()=>{
                        this.isShowSevFee(response.data)
                    })
                } else {
                    this.toastMsg(response.message || '获取支付信息失败');
                }
            }).catch(error => {
                this.hideLoadingView();
                this.toastMsg(error.message || '获取数据异常');
            })
        }).catch(error => {
            this.hideLoadingView();
        })

    }

    isShowSevFee = (order) => {
        let model = {
            OrderCategory: this.params.from==='inthotel'? 6 : 4,
            MatchModel: {
                IsAgreement: order?.Addition?.IsAgreement,
                IsExAgreement:order?.Addition?.isExAgreement,
                SettleType:order?.SettleType,
            },
            SettleType:order?.SettleType,
            ReferenceEmployeeId:order.Addition?.ReferenceEmployeeId,
            ReferencePassengerId:order.Addition?.ReferencePassengerId,
        }
        CommonService.CurrentCustomerServiceFees(model).then(response => {
            if (response && response.success && response.data) {
                order.IsShowServiceFee = response.data.IsShowServiceFee;
                this.setState({
                    order:order
                })
                
            }
        }).catch(error => {

        })
    }

    isShowSevFee1 = (order) => {
        this.priceView.show(order);
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.backPress.componentWillUnmount();
    }
    /**
     *  稍后支付
     */
    _laterPay = () => {
        this._backBtnClick();
    }
    /**
     *  取消订单
     */
    _cancelBtn = () => {

        this.showAlertView(() => {
            return (<View style={{ padding: 5, justifyContent: 'center', alignItems: 'center' }}>
                <CustomText text='请输入取消原因' />
                <CustomTextInput onChangeText={text => this.setState({ comment: text })} multiline={true} style={{ height: 60, width: 250, marginTop: 10, borderWidth: 1, borderColor: Theme.lineColor }} />
            </View>)
        }, () => {
            return ViewUtil.getAlertButton('我再想想', () => {
                this.dismissAlertView();
            }, '确定取消', () => {
                this.dismissAlertView();
                let model = {
                    OrderId: this.state.order.BusinessId,
                    CancelCode: '其它',
                    Reason: this.state.comment,
                    Platform: Platform.OS
                }
                this.showLoadingView();

                HotelService.HotelOrderCancel(model).then(response => {
                    this.hideLoadingView();
                    if (response && response.success) {
                        this.showAlertView('取消订单成功', () => {
                            return ViewUtil.getAlertButton('确定', () => {
                                NavigationUtils.popToTop(this.props.navigation);
                                this.dismissAlertView();
                            })
                        })
                    } else {
                        this.toastMsg(response.message || "取消订单失败");
                    }
                }).catch(error => {
                    this.hideLoadingView();
                    this.toastMsg(error.message || "取消订单异常");
                })
            })
        })



    }
    _showDetail = (data) => {
        this.priceView.show(data);
    }
    _walletPay = () => {
        this.showLoadingView();
        CommonService.PaymentWallet(this.params).then(response => {
            this.hideLoadingView();
            if (response && response.success) {
                this.showAlertView('订单支付成功,您可去我的订单中查看', () => {
                    return ViewUtil.getAlertButton('取消', () => {
                        this.dismissAlertView();
                        NavigationUtils.popToTop(this.props.navigation);
                    }, '确定', () => {
                        this.dismissAlertView();
                        this.push('HotelOrderListScreen');
                    })
                })
            } else {
                this.toastMsg(response.message || '支付失败');
            }
        }).catch(error => {
            this.hideLoadingView();
            this.toastMsg(error.message || '操作失败');
        })
    }
    /**
     *  直接支付
     */
    _toPay = () => {
        const { order } = this.state;
        if(!order){ return; }
        if (this.state.order.SettleType === CommonEnum.PaymnetSettleType.Prestored) {
            this._walletPay();
        } else {
            this.payTypeView.show();
        }
    }
    renderBody() {
        const { order, customerInfo, PaymentInfo } = this.state;
        const { from } = this.params
        if (!order) return null;
        let totalCount = order.Amount;
        let paymentLimit = Util.Date.toDate(order.PaymentLimit);
        let hotel = order.Addition.Hotel;
        let CheckInDate = Util.Date.toDate(order.Addition.CheckInDate);
        let CheckOutDate = Util.Date.toDate(order.Addition.CheckOutDate);
        let Customers = order.Addition.Customers;
        let roomPeople = Customers.map(obj => {
            return obj.Name;
        })
        customerInfo.SettingItems.map((item) => {
            if (from=='hotel' && item.Code == 'hotel_show_ser_fee') {
                if(item.Value!=2 && order.Addition && order.Addition.Amount){
                    totalCount = order.Addition.Amount
                }
            }
            if (from=='inthotel' && item.Code == 'foreign_hotel_show_ser_fee') {
                if(item.Value!=2 && order.Addition && order.Addition.Amount){
                    totalCount = order.Addition.Amount
                }
            }
        })
        let _total =  order.IsShowServiceFee ? totalCount + order.Addition.ServiceCharge : totalCount
        return (
            <View style={{flex:1}}>
                <View style={{flex:1}}>
                <View style={{ padding: 10,backgroundColor:Theme.yellowBg }}>
                    {
                        Util.Parse.isChinese() ?
                            <Text style={{ color: Theme.theme,color:Theme.commonFontColor,fontSize:13 }} >预订成功,请在<Text style={{ color: Theme.theme,fontSize:13 }}>{paymentLimit.format('HH:mm')}</Text> 前完成支付,逾期自动取消预订,以免售完或价格变化,给您的出行带来不便</Text> :
                            <Text>If the reservation is successful, please complete the payment before <Text style={{ color: Theme.theme }}>{paymentLimit.format('HH:mm')}</Text>. If the reservation is delayed, the reservation will be cancelled automatically, so as to avoid the inconvenience caused to you when the ticket is sold out or the price changes</Text>
                    }
                </View>
                <View style={{marginHorizontal:10,marginTop:10,padding:10, backgroundColor: 'white',borderRadius:6}}>
                <View style={styles.row}>
                    <CustomText text={hotel.Name} />
                </View>
                <View style={styles.row}>
                    <CustomText style={{color:Theme.commonFontColor}} text={I18nUtil.translate('入住时间') + '：' + CheckInDate.format('MM-dd') + ' ' + I18nUtil.translate('离店时间') + '：' + CheckOutDate.format('MM-dd')} />
                </View>
                <View style={styles.row}>
                    <CustomText style={{color:Theme.commonFontColor}} text={I18nUtil.tranlateInsert('住{{noun}}间', Customers.length) + ',' + I18nUtil.translate('入住人') + '：' + roomPeople.join('、')} />
                </View>
                </View>
                <View style={{marginHorizontal:10,marginTop:10,padding:10, backgroundColor: 'white',borderRadius:6}}>
                <TouchableHighlight underlayColor='transparent' onPress={this.isShowSevFee1.bind(this, order)}>
                    <View style={styles.row}>
                        <CustomText text='订单金额' />
                        <View style={{ flexDirection: "row", alignItems: 'center' }}>
                            <CustomText text={'¥' + parseFloat( _total).toFixed(2)} style={{ marginRight: 10 }} />
                            <AntDesign name={'infocirlceo'} size={18} color={Theme.theme} />
                        </View>
                    </View>
                </TouchableHighlight>
                <View style={styles.row}>
                    <CustomText text='还需支付' style={{color:Theme.commonFontColor}}/>
                    {/* <CustomText text={'¥' + (order.SettleType === CommonEnum.PaymnetSettleType.Prestored?order.Addition.Amount:order.Addition.PersonalAmount)  } style={{ color: "orange" }} /> */}
                    <CustomText text={'¥' + order.Amount } style={{ color: "orange" }} />
                </View>
                <View style={styles.row}>
                    <CustomText text='支付方式' style={{color:Theme.commonFontColor}}/>
                    <CustomText text={order.SettleType === CommonEnum.PaymnetSettleType.Prestored?'钱包支付':(order.SettleType === CommonEnum.PaymnetSettleType.Credit?'企业月结':'在线支付')} />
                </View>
                {/* <View style={{ marginVertical: 25, justifyContent: 'center', alignItems: 'center' }}>
                    <TouchableHighlight underlayColor='transparent' onPress={this._cancelBtn}>
                        <View style={styles.cancelBtn}>
                            <CustomText text='取消订单' />
                        </View>
                    </TouchableHighlight>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'center', height: 40 }}>
                    <TouchableHighlight underlayColor='transparent' onPress={this._laterPay} style={{ flex: 1, marginHorizontal: 20 }}>
                        <View style={[styles.payBtn, { backgroundColor: Theme.theme}]}>
                            <CustomText style={{ color: 'white' }} text='稍后支付' />
                        </View>
                    </TouchableHighlight>
                    <TouchableHighlight style={{ flex: 1, marginHorizontal: 20 }} underlayColor='transparent' onPress={this._toPay.bind(this)}>
                        <View style={[styles.payBtn, { backgroundColor: Theme.theme }]}>
                            <CustomText style={{ color: 'white' }} text='直接支付' />
                        </View>
                    </TouchableHighlight>
                </View> */}
                </View>
                <PayPriceInfoView ref={o => this.priceView = o} />
                <PayTypeView ref={o => this.payTypeView = o} PaymentInfo={PaymentInfo} order={order} otwTHis={this} from={'hotel'} />
                </View>
                {
                ViewUtil.getTwoBottomBtn('取消订单',this._cancelBtn,'直接支付',this._toPay)
                }
            </View>
        )
    }
}

const styles = StyleSheet.create({
    row: {
        paddingHorizontal: 10,
        height: 44,
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: "space-between",
        borderBottomColor: Theme.lineColor,
        borderBottomWidth: 0.5,
        backgroundColor: 'white',
        // marginTop: 10
    },
    cancelBtn: {
        backgroundColor: "white",
        borderColor: Theme.lineColor,
        borderWidth: 0.5,
        justifyContent: "center",
        alignItems: "center",
        width: 200,
        height: 40,
    },
    payBtn: {
        height: 40,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center'
    }
})