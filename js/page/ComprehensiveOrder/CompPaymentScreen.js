import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableHighlight,
    ScrollView
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
// import PayInfoView from '../train/PayInfoView';
import PayInfoView from './View/PayInfoView';
import CommonEnum from '../../enum/CommonEnum';
import { connect } from 'react-redux';
class CompPaymentScreen extends SuperView {

    constructor(props) {
        super(props);
        this.params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};
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
            loading: true,
            loadError: null,
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
        this._loadData();

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
                                this.dismissAlertView();
                                NavigationUtils.popToTop(this.props.navigation);
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
    _showDetail = (title, data) => {
        this.payInfoView.show(title, data);
    }

    _loadData = () => {
        const TradeNumber = this.params.TradeNumber;
        if (!TradeNumber) {
            this.setState({
                loading: false,
                loadError: '缺少支付单号',
            })
            return;
        }
        this.setState({ loading: true, loadError: null })
        this.showLoadingView();
        let model={
            SerialNumber: TradeNumber
        }
        UserInfoDao.getCustomerInfo().then(customerInfo => {
            CommonService.PaymentInfo(model).then(response => {
                console.log('PaymentInfo response===',response);
                this.hideLoadingView();
                if (response && response.success) {
                    this.setState({
                        order: response.data,
                        customerInfo: customerInfo,
                        loading: false,
                        loadError: null,
                    })
                } else {
                    const msg = (response && response.message) ? response.message : '获取支付信息失败';
                    this.setState({ loading: false, loadError: msg })
                    this.toastMsg(msg);
                }
            }).catch(error => {
                this.hideLoadingView();
                const msg = (error && error.message) ? error.message : '获取数据异常';
                this.setState({ loading: false, loadError: msg })
                this.toastMsg(msg);
            })
        }).catch(() => {
            this.hideLoadingView();
            this.setState({ loading: false, loadError: '获取数据异常' })
        })
    }
    /**
     *  直接支付
     */
    _toPay = () => {
        const { customerInfo ,order} = this.state;
        if(!order){ return; }
        let model={
            SerialNumber: this.params.TradeNumber
        }
        if (order.SettleType === CommonEnum.PaymnetSettleType.Prestored) {
            this.showLoadingView();
            CommonService.PaymentWallet(model).then(response => {
                this.hideLoadingView();
                if (response && response.success) {
                    this.showAlertView('订单支付成功,您可去我的订单中查看', () => {
                        return ViewUtil.getAlertButton('取消', () => {
                            this.dismissAlertView();
                            NavigationUtils.popToTop(this.props.navigation);
                        }, '确定', () => {
                            this.dismissAlertView();
                            this.push('TrainOrderListScreen');
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
        const { order, customerInfo, PaymentInfo, loading, loadError } = this.state;
        const { OrderItems, OrderItems_pay,Travellers} = this.params;
        if (!order) {
            return (
                <View style={{ padding: 20 }}>
                    <CustomText text={loading ? '加载中...' : (loadError || '暂无数据')} style={{ color: Theme.assistFontColor }} />
                    {
                        loading ? null :
                            <TouchableHighlight underlayColor='transparent' onPress={this._loadData}>
                                <View style={{ marginTop: 12, height: 40, borderRadius: 6, backgroundColor: Theme.theme, alignItems: 'center', justifyContent: 'center' }}>
                                    <CustomText text='重试' style={{ color: '#fff' }} />
                                </View>
                            </TouchableHighlight>
                    }
                </View>
            );
        }
        let paymentLimit = Util.Date.toDate(order.PaymentLimit);  
	    // let OrderItems_payArr = OrderItems.filter(obj=>OrderItems_pay.some(obj1=>obj1.InternalOrderId==obj.InternalOrderId))
        let OrderItems_payArr = OrderItems
        return (
            <ScrollView> 
                <PayInfoView ref={o => this.payInfoView = o} />
                {
                    OrderItems_payArr&&OrderItems_payArr.map((item)=>{
                        let payObject = item.InternalOrder
                        let airData;
                        let airData1
                        let DepartureDate;
                        let DepartureTime;
                        let detailTitle;
                        let week;
                        if(item.Category==1){
                             detailTitle = '航班详情';
                             airData=payObject.OrderAir
                             DepartureDate = Util.Date.toDate( airData.DepartureTime ).format('yyyy-MM-dd')
                             DepartureTime = Util.Date.toDate( airData.DepartureTime ).format('HH:mm')
                            let DestinationTime = Util.Date.toDate( airData.DestinationTime ).format('HH:mm')
                            week = airData.DepartureTime
                        }if(item.Category==7){
                            detailTitle = '国际航班详情'
                            airData=payObject.AirList
                            airData1=payObject.AirList[0]
                            DepartureDate = Util.Date.toDate( airData1.DepartureTime ).format('yyyy-MM-dd')
                            DepartureTime = Util.Date.toDate( airData1.DepartureTime ).format('HH:mm') 
                            week = airData1.DepartureTime
                             
                        }else if(item.Category==5){
                            // let internalOrder = item&&item.InternalOrder
                            detailTitle = '列车详情'
                            airData = payObject.TrainInfo&&payObject.TrainInfo
                            DepartureDate = Util.Date.toDate( airData.DepartureTime ).format('yyyy-MM-dd')
                            DepartureTime = Util.Date.toDate( airData.DepartureTime ).format('HH:mm')
                            week = airData.DepartureTime
                        }else if(item.Category==6){
                            detailTitle = '港澳台及国际酒店详情',
                            airData = payObject
                            DepartureDate = Util.Date.toDate( payObject.CheckInDate ).format('yyyy-MM-dd')
                            DepartureTime = Util.Date.toDate( payObject.CheckInDate ).format('HH:mm')
                            week = payObject.CheckInDate
                        }else if(item.Category==4){
                            detailTitle = '国内酒店详情',
                            airData = payObject
                            DepartureDate = Util.Date.toDate( payObject.CheckInDate ).format('yyyy-MM-dd')
                            DepartureTime = Util.Date.toDate( payObject.CheckInDate ).format('HH:mm')
                            week = payObject.CheckInDate
                        }
                        return(
                            <View>
                                <View style={styles.row}>
                                        <CustomText text={I18nUtil.translate(item.CategoryDesc) + '--' + I18nUtil.translate(item.JourneyDesc.slice(17))} />
                                </View>
                                    <TouchableHighlight underlayColor='transparent' onPress={
                                          this._showDetail.bind(this, detailTitle, airData)
                                        }>
                                            <View style={styles.row2}>
                                                {/* <CustomText text={DepartureDate +' '+DepartureTime+' '+ Util.Date.toDate(week).getWeek()} /> */}
                                                <CustomText text={DepartureDate + Util.Date.toDate(week).getWeek()} />
                                                <AntDesign name={'infocirlceo'} size={22} color={Theme.theme} />
                                            </View>
                                    </TouchableHighlight>
                            </View>
                        )
                    })

                }
                {
                    Travellers&&Travellers.length>0?
                    <TouchableHighlight underlayColor='transparent' onPress={
                        this._showDetail.bind(this, '乘客信息',Travellers)
                        }>
                        <View style={styles.row}>
                            <CustomText text='人员信息' />
                            <AntDesign name={'infocirlceo'} size={22} color={Theme.theme} />
                        </View>
                    </TouchableHighlight>
                    :null
                }
                
                <View style={styles.row}>
                    <CustomText text='还需支付' />
                    <CustomText text={'¥' + order.Amount} style={{ color: "orange" }} />
                </View>
                <View style={styles.row}>
                    <CustomText text='支付方式' />
                    <CustomText text={order.SettleType === CommonEnum.PaymnetSettleType.Prestored?'钱包支付':(order.SettleType === CommonEnum.PaymnetSettleType.Credit?'企业月结':'在线支付')} />
                </View>
                <View style={{ marginVertical: 25, justifyContent: 'center', alignItems: 'center' }}>
                    <TouchableHighlight underlayColor='transparent' onPress={this._cancelBtn}>
                        <View style={styles.cancelBtn}>
                            <CustomText text='取消订单' />
                        </View>
                    </TouchableHighlight>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'center', height: 40 }}>
                    <TouchableHighlight underlayColor='transparent' onPress={this._laterPay} style={{ flex: 1, marginHorizontal: 20 }}>
                        <View style={[styles.payBtn, { backgroundColor: Theme.theme }]}>
                            <CustomText style={{ color: 'white' }} text='稍后支付' />
                        </View>
                    </TouchableHighlight>
                    <TouchableHighlight style={{ flex: 1, marginHorizontal: 20 }} underlayColor='transparent' onPress={this._toPay.bind(this)}>
                        <View style={[styles.payBtn, { backgroundColor: Theme.theme }]}>
                            <CustomText style={{ color: 'white' }} text='直接支付' />
                        </View>
                    </TouchableHighlight>
                </View>

                <PayTypeView ref={o => this.payTypeView = o} PaymentInfo={PaymentInfo} order={order} otwTHis={this} from={'train'} />
            </ScrollView>
        )
    }
}
const getState = state => ({
    feeType: state.feeType.feeType
})
export default connect(getState)(CompPaymentScreen)
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
        marginTop: 10
    },
    row2: {
        paddingHorizontal: 10,
        height: 44,
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: "space-between",
        borderBottomColor: Theme.lineColor,
        borderBottomWidth: 0.5,
        backgroundColor: 'white',
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
