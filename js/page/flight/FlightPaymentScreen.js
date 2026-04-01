import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableHighlight,
    ScrollView,
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
import PayInfoView from './PayInfoView';
import UserInfoDao from '../../service/UserInfoDao';
import PayTypeView from '../common/PayTypeView';
import CommonEnum from '../../enum/CommonEnum';
import { connect } from 'react-redux';

class FlightPaymentScreen extends SuperView {

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
            }
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
                    DeviceEventEmitter.emit('deleteApply', {}),
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
        this.showAlertView('确定要取消订单吗？', () => {
            return ViewUtil.getAlertButton('我再想想', () => {
                this.dismissAlertView();
            }, '确定', () => {
                this.dismissAlertView();
                this.showLoadingView();
                let model = {
                    SerialNumber: this.state.order.SerialNumber
                }
                CommonService.PaymentCancel(model).then(response => {
                    this.hideLoadingView();
                    if (response && response.success) {
                        this.showAlertView('取消订单成功', () => {
                            return ViewUtil.getAlertButton('确定', () => {
                                this.push('FlightOrderList');
                                this.dismissAlertView();
                            })
                        })
                    } else {
                        this.toastMsg(response.message || '取消订单失败');
                    }
                }).catch(error => {
                    this.hideLoadingView();
                    this.toastMsg(error.message || '取消订单异常');
                })
            })
        })
    }

    isShowSevFee = (title, data) => {
       const {order} = this.state;
        const {customerInfo} = this.state;
        //服务费
        let model2={
            OrderCategory:1,
            MatchModel:{
                IsRoundTrip:order.Addition?.JourneyType===2?true:false,
                AirlineCode:order.Addition?.AirList[0]?.Airline,
                ReturnAirlineCode:order.Addition?.AirList[1]?.Airline,
            },
            ReferenceEmployeeId:customerInfo&&customerInfo.ReferenceEmployeeId?customerInfo.ReferenceEmployeeId:0,
            ReferencePassengerId:order.Addition?.TravellerList[0]?.PassengerOrigin?.EmployeeId,
        }
        CommonService.CurrentCustomerServiceFees(model2).then(response => {
            if (response && response.success,response.data) {
                data.IsShowServiceFee = response.data.IsShowServiceFee;
                this.payInfoView.show(title, data);
            }
        }).catch(error => {
            
        })
    }

    _showDetail = (title, data) => {
        this.payInfoView.show(title, data);
    }
    /**
     *  直接支付
     */
    _toPay = () => {
        const { order } = this.state;
        if(!order){ return; }
        if (order.SettleType === CommonEnum.PaymnetSettleType.Prestored) {
            this.showLoadingView();
            CommonService.PaymentWallet(this.params).then(response => {
                this.hideLoadingView();
                if (response && response.success) {
                    this.showAlertView('订单支付成功,您可去我的订单中查看', () => {
                        return ViewUtil.getAlertButton('取消', () => {
                            this.dismissAlertView();
                            DeviceEventEmitter.emit('deleteApply', {}),
                            NavigationUtils.popToTop(this.props.navigation);
                        }, '确定', () => {
                            this.dismissAlertView();
                            this.push('FlightOrderList');
                        })
                    })
                } else {
                    this.toastMsg(response.message || '支付失败');
                }
            }).catch(error => {
                this.hideLoadingView();
                this.toastMsg(error.message || '操作失败');
            })
            return;
        }
        this.payTypeView.show();
    }
    renderBody() {
        const { order, customerInfo, PaymentInfo } = this.state;
        if (!order) return null;
        let totalCount = order.Amount;
        let paymentLimit = Util.Date.toDate(order.PaymentLimit);
        let airTrip = {};
        let returnTrip = null;
        if (order.Addition) {
            if (order.Addition.Status === 12) {
                totalCount = order.Addition.Amount;
                airTrip = Util.Encryption.clone(order.Addition.OrderAir);
                airTrip.DepartureTime = Util.Date.toDate(airTrip.DepartureTime);
                    totalCount += order.Addition.ServiceCharge;
            } else {
                if(order.Addition.OrderAir){
                    airTrip = Util.Encryption.clone(order.Addition.OrderAir);
                    airTrip.DepartureTime = Util.Date.toDate(airTrip.DepartureTime);
                }
                if (order.Addition && order.Addition.AirList && order.Addition.AirList.length > 0) {
                    airTrip = order.Addition.AirList[0];
                    airTrip.DepartureTime = Util.Date.toDate(airTrip.DepartureTime);
                    if (order.Addition.AirList.length > 1) {
                        returnTrip = order.Addition.AirList[1];
                        returnTrip.DepartureTime = Util.Date.toDate(returnTrip.DepartureTime);
                    }
                }
                customerInfo.SettingItems.map((item) => {
                    if (item.Code == 'flight_show_ser_fee') {
                        if(item.Value!=2 && order.Addition && order.Addition.TotalAmount){
                            totalCount = order.Addition.TotalAmount
                        }
                    }
                })
            }
        }



        return (
            <View style={{flex:1}}>
            <ScrollView keyboardShouldPersistTaps='handled'>
                <View style={{ paddingHorizontal: 10 ,paddingTop:10,backgroundColor:Theme.yellowBg}}>
                    {
                        Util.Parse.isChinese() ?
                            <Text style={{ lineHeight:23,color:Theme.commonFontColor,fontSize:13 }}>预订成功,请在<Text style={{ color: Theme.theme }}>{paymentLimit.format('HH:mm')}</Text> 前完成支付,逾期自动取消预订,以免售完或价格变化,给您的出行带来不便</Text> 
                            :
                            <Text style={{ color:Theme.commonFontColor }} >Please finish payment before <Text style={{ color: Theme.theme }}>{paymentLimit.format('HH:mm')}</Text> Overdue payment will lead to cancellation of booking and passengers need to rebook again.</Text>
                    }
                </View>
                {
                order.Addition?
                <View style={{marginHorizontal:10,marginTop:10,padding:10, backgroundColor: 'white',borderRadius:6}}>
                    <View style={styles.row}>
                        <CustomText style={{fontSize:14,fontWeight:'bold'}} text={I18nUtil.translate(airTrip.Departure) + '-' + I18nUtil.translate(airTrip.Destination)} />
                    </View>
                    <TouchableHighlight underlayColor='transparent' onPress={this._showDetail.bind(this, '航班详情', order.Addition.OrderList ? order.Addition.OrderList[0].OrderAir : order.Addition.OrderAir)}>
                        <View style={styles.row}>
                            <CustomText style={{fontSize:14,color:Theme.commonFontColor}} text={airTrip.DepartureTime.format('yyyy年MM月dd日 HH:mm') + airTrip.DepartureTime.getWeek()} />
                            <AntDesign name={'infocirlceo'} size={18} color={Theme.theme} />
                        </View>
                    </TouchableHighlight>
                    {
                        returnTrip ?
                            <TouchableHighlight underlayColor='transparent' onPress={this._showDetail.bind(this, '航班详情', order.Addition.OrderList[1].OrderAir)}>
                                <View style={styles.row}>
                                    <CustomText style={{fontSize:14,color:Theme.commonFontColor}} text={returnTrip.DepartureTime.format('yyyy年MM月dd日 HH:mm') + returnTrip.DepartureTime.getWeek()} />
                                    <AntDesign name={'infocirlceo'} size={18} color={Theme.theme} />
                                </View>
                            </TouchableHighlight> :
                            null
                    }
                    <TouchableHighlight underlayColor='transparent' onPress={this._showDetail.bind(this, '乘客信息', order.Addition.TravellerList || order.Addition.Travellers)}>
                        <View style={styles.row}>
                            <CustomText style={{fontSize:14,color:Theme.commonFontColor}} text='人员信息' />
                            <AntDesign name={'infocirlceo'} size={18} color={Theme.theme} />
                        </View>
                    </TouchableHighlight>
                </View>
                :null
                }
                <View style={{marginHorizontal:10,marginTop:10,padding:10, backgroundColor: 'white',borderRadius:6}}>
                <TouchableHighlight underlayColor='transparent' onPress={this.isShowSevFee.bind(this, '价格信息', order)}>
                    <View style={styles.row} >
                        <CustomText text='订单金额'style={{ color:Theme.fontColor,fontSize:13 }} />
                        <View style={{ flexDirection: "row", alignItems: 'center' }}>
                            <CustomText text={'¥' +Number(totalCount).toFixed(2) } style={{ marginRight: 10,fontWeight:'bold' }} />
                            <AntDesign name={'infocirlceo'} size={18} color={Theme.theme} />
                        </View>
                    </View>
                </TouchableHighlight>
                <View style={styles.row}>
                    <CustomText text='还需支付' style={{ color:Theme.commonFontColor,fontSize:13 }}/>
                    <CustomText text={'¥' + order.Amount} style={{ color: "orange" }} />
                </View>
                <View style={styles.row}>
                    <CustomText text='支付方式'style={{ color:Theme.commonFontColor,fontSize:13 }} />
                    <CustomText text={order.SettleType === CommonEnum.PaymnetSettleType.Prestored?'钱包支付':(order.SettleType === CommonEnum.PaymnetSettleType.Credit?'企业月结':'在线支付')} />
                </View>
                </View>
                <PayInfoView ref={o => this.payInfoView = o} customerInfo={customerInfo} />
                <PayTypeView ref={o => this.payTypeView = o} PaymentInfo={PaymentInfo} order={order} otwTHis={this} from={'flight'} />
            </ScrollView>
            {
                ViewUtil.getTwoBottomBtn('取消订单',this._cancelBtn,'直接支付',this._toPay)
            }
            </View>
        )
    }
}
const getPropState = state => ({
    feeType: state.feeType.feeType
})
export default connect(getPropState)(FlightPaymentScreen)

const styles = StyleSheet.create({
    row: {
        paddingHorizontal: 10,
        height: 44,
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: "space-between",
        borderBottomColor: Theme.lineColor,
        borderBottomWidth: 0.5,
       
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