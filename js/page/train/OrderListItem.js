
import React from 'react';
import {
    TouchableHighlight,
    View,
    Text,
    StyleSheet,
    Image
} from 'react-native';
import CustomText from '../../custom/CustomText';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Theme from '../../res/styles/Theme';
import I18nUtil from '../../util/I18nUtil';
import TrainEnum from '../../enum/TrainEnum';
import PropTypes from 'prop-types';
// import { Themed, withNavigation } from 'react-navigation';
import { useNavigation } from '@react-navigation/native';
import NavigationUtils from '../../navigator/NavigationUtils';
import TrainService from '../../service/TrainService';
import DashLine from '../../custom/Dashline';
import Util from '../../util/Util';
import CommonService from '../../service/CommonService';
import ViewUtil from '../../util/ViewUtil';
class OrderListItem extends React.PureComponent {

    static propTypes = {
        order: PropTypes.object.isRequired,
        otwThis: PropTypes.object.isRequired
    }
    constructor(props) {
        super(props);
        this.state = {
            showServiceCharge:true
        }
    }
    componentDidMount = () => {
        let model = {
            OrderCategory: 5,//火车
            MatchModel: {
                IsGrabTicket: this.props.order.IsGragTicketOrder ? true : false
            },
        }
        CommonService.CurrentCustomerServiceFees(model).then(response => {
            if (response && response.success && response.data) {
                this.setState({
                    showServiceCharge: response.data.IsShowServiceFee
                })
            }else{
                this.toastMsg('获取数据异常');
            }
        }).catch(error => {
            this.toastMsg(error.message);
        })
    }
    _toDetail = () => {
        const {order,userInfoId} = this.props;
        const isShowBtn = (userInfoId === order.CreateEmployeeId) && (order.Status === TrainEnum.OrderStatus.TicketIssued);
        NavigationUtils.push(this.props.navigation, 'TrainOrderDetailScreen', { Id: order.Id, IsGragTicketOrder:order.IsGragTicketOrder,isShowBtn:isShowBtn });
    }
    /**
     * 退票
     */
    _onRefund = () => {
            NavigationUtils.push(this.props.navigation, 'TrainOrderRefundScreen', { order: this.props.order });
    }
    _onRefund2 = () => {
        const {otwThis} = this.props
        otwThis.toastMsg('已超过退票期限，不能退票')
    }
    _onRefund3 = () => {
        const {otwThis} = this.props
        otwThis.toastMsg('距离发车时间较短，不能提交退票')
    }
    __onRefunds=()=> {
        const {otwThis} = this.props
        otwThis.toastMsg('已过发车时间，不能提交退票')
    }
    _onRefunds4=()=> {
        const {otwThis} = this.props
        otwThis.toastMsg('发车后改签的订单无法提交退票')
    }
    /**
     * 改签
     */
    _onReissue = () => {
        const {order} = this.props
        order.TrainIsOutage?
        otwThis.toastMsg('此次行程已停运，不能改签')
        :
        NavigationUtils.push(this.props.navigation, 'TrainChangeIndex', { order: this.props.order });
    }
    _onReissue2 =()=>{
        const {otwThis, order} = this.props
        order.TrainIsOutage?
        otwThis.toastMsg('此次行程已停运，不能改签')
        :
        otwThis.toastMsg('已过在线改签时间，不能改签')
    }
    _cancel=()=>{
        const { otwThis } = this.props;
        otwThis.showAlertView('确认取消订单?', () => {
            return ViewUtil.getAlertButton('取消', () => {
                otwThis.dismissAlertView();
            }, '确定', () => {
                otwThis.dismissAlertView();
                this._cancelBtn()
            })
        })
    }
    /**
     *  取消
     */
    _cancelBtn = () => {
        const { otwThis, order } = this.props;
        otwThis.showLoadingView();
        TrainService.orderCancel(order.Id).then(response => {
            otwThis.hideLoadingView();
            if (response && response.success) {
                order.StatusDesc = '已取消';
                order.Status = TrainEnum.OrderStatus.Canceled;
                this.setState({},()=>{
                    otwThis.toastMsg('取消订单成功');
                })
            } else {
                otwThis.toastMsg(response.message || '取消订单失败');
            }
        }).catch(error => {
            otwThis.hideLoadingView();
            otwThis.toastMsg(error.message || '取消订单异常');
        });
    }
    /**
     * 催审
     */
    _remindBtn = () => {
        const { otwThis, order } = this.props;
        otwThis.showLoadingView();
        TrainService.orderRemind(order.Id).then(response => {
            otwThis.hideLoadingView();
            if (response && response.success) {
                otwThis.toastMsg('催审订单成功');
            } else {
                otwThis.toastMsg(response.message || '催审订单失败');
            }
        }).catch(error => {
            otwThis.hideLoadingView();
            otwThis.toastMsg(error.message || '催审订单异常');
        });
    }

    _waitforPayAction = (index) => {
        const { otwThis, order,cancelAction } = this.props;
        otwThis.showLoadingView();
        CommonService.TrainOrderApiPay({OrderId:order.Id}).then(response => {
            otwThis.hideLoadingView();
            if (response && response.success && response.data) {
                if(index === 2){
                   cancelAction(response.data?.payment?.SerialNumber)
                }else{
                    this.getPayMess() 
                }
            } else {
                otwThis.toastMsg(response.message || '获取支付信息失败');
            }
        }).catch(error => {
            otwThis.hideLoadingView();
            otwThis.toastMsg(error.message || '获取数据异常');
        })
    }

    getPayMess=(obj)=>{
        const { otwThis } = this.props;
        otwThis.showLoadingView();
        CommonService.PaymentInfo({SerialNumber:obj.payment.SerialNumber}).then(response => {
            otwThis.hideLoadingView();
            if (response && response.success) {
                NavigationUtils.push(this.props.navigation, 'TrainPayment', {SerialNumber:obj.payment.SerialNumber});
            } else {
                otwThis.toastMsg(response.message || '获取支付信息失败');
            }
        }).catch(error => {
            otwThis.hideLoadingView();
            otwThis.toastMsg(error.message || '获取数据异常');
        })
    }

    render() {
        const { order,cityList,userInfoId } = this.props;
        const { showServiceCharge } = this.state;

        if (!order || (!order.TrainInfo && !order.Summary)) {//
            return null
        }
        const trainInfo = order.TrainInfo || JSON.parse(JSON.parse(order.Summary).TrainInfo);
        const isShowBtn = userInfoId === order.CreateEmployeeId;
        
        var dateX = order.TrainInfo.DepartureTime//发车时间
        let date3 = new Date()//当前日期
        var cha = Util.Date.toDate(dateX).getTime()-Util.Date.toDate(date3).getTime()//发车时间减去当前时间
        var chaMinuse=(cha/(1000*60));
        //发车一个月后
        var mouth_cha =Util.Date.toDate(dateX).getTime()+30*24*3600*1000 - Util.Date.toDate(date3).getTime()
        
        let now = new Date().toLocaleDateString();//当前日期
        let dateTime = new Date(order.TrainInfo.TrainDate).toLocaleDateString()//发车日期 
        var timeline=true;//true可以改签
        if(cha<0){//超出发车时间
            if(now==dateTime){//判断发车是当前日期
                if((date3.getHours()*60 + date3.getMinutes()) < (23*60 + 50)) {//判断已发车并且在23：50前还可改签
                    timeline = true 
                }else{
                    timeline = false
                }
            }else{
                timeline = false
            }            
        }
        cityList&&cityList.map((_item)=>{
            if(_item.Code == trainInfo.FromStationCode){
                trainInfo.FromStationEnName = _item.EnName
            }else if(_item.Code == trainInfo.ToStationCode){
                trainInfo.ToStationEnName = _item.EnName
            }
        })
        return (
            <TouchableHighlight onPress={this._toDetail} underlayColor='transparent'>
                <View style={{ backgroundColor: '#fff', marginHorizontal: 10 ,marginTop:10,borderRadius:6,paddingHorizontal:20,paddingBottom:10}}>
                    <View style={{flexDirection:'row',justifyContent: "space-between",borderBottomWidth:1,borderColor:Theme.lineColor,paddingVertical:10}}>
                        <View style={{flexDirection:'row'}}>
                            <Image source={ require('../../res/Uimage/trainFloder/train_lo.png')} style={{ width: 18, height: 18 }}></Image>
                            <CustomText allowFontScaling={false} style={{fontWeight:'bold',marginLeft:8}} text={trainInfo.Checi}></CustomText>
                            <CustomText style={{ color: Theme.commonFontColor,marginLeft:8 }} text={order.FeeType === 2 ? '因私出行' : '因公出行'} />
                        </View>
                        <CustomText style={{ color: Theme.theme }} text={order.StatusDesc} />
                    </View>
                    <View style={{ marginTop:10 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            {
                                Util.Parse.isChinese()?
                                <Text allowFontScaling={false} style={{ fontSize:15, fontWeight:'bold',color:Theme.fontColor }} numberOfLines={1}>{trainInfo.FromStationName+'-'+trainInfo.ToStationName}</Text>
                                :
                                <Text allowFontScaling={false} style={{ flex: 1 }} numberOfLines={1}>{trainInfo.FromStationEnName+'-'+trainInfo.ToStationEnName}</Text>
                            } 
                            {
                                showServiceCharge ? (
                                    <CustomText style={{ color: Theme.theme, fontSize: 17 }} text={'¥' + ((order.Amount + order.ServiceCharge)?(order.Amount + order.ServiceCharge).toFixed(2):0)} />
                                ) : (
                                        <CustomText style={{color: Theme.theme, fontSize: 17}} text={'¥' + (order.Amount?order.Amount.toFixed(2):0)} />
                                    )
                            }
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                            <CustomText text={order.PassengerName} />
                            <CustomText style={{color: Theme.commonFontColor, fontSize: 10, backgroundColor:Theme.greenBg,height:14,paddingHorizontal:5 ,borderRadius:2,color:Theme.theme}} text={order.OrderType === 1 ? '订票单' : order.OrderType === 2 ? '改签单' : order.OrderType === 3 ? '退票单' : ''} />
                        </View>
                        <Text allowFontScaling={false} style={curStyle.aidFont}>{trainInfo.TrainDate} {trainInfo.StartTime} {I18nUtil.translate('-')} {trainInfo.ArriveTime}</Text>
                    </View>
                    
                    {
                     !this.props.dontShow  &&  isShowBtn ? (
                            <View style={{ padding: 5, flexDirection: 'row-reverse',borderTopColor:Theme.lineColor, borderTopWidth:1 }}>
                                { order.Status === TrainEnum.OrderStatus.TicketIssued&&<View>
                                {
                                    order.TrainIsOutage || (order.ordertype==2&&order.IsAfterDepartureChange==true)?
                                        <TouchableHighlight onPress={(mouth_cha<0)?this._onRefund2:this._onRefund} underlayColor='transparent' 
                                                style={{ backgroundColor:(mouth_cha<0)?Theme.assistFontColor: Theme.theme,paddingHorizontal:8,height: 22,marginLeft: 10,alignItems: 'center',justifyContent: 'center',borderRadius:2}}>
                                            <CustomText style={{ color: 'white' }} text='退票' />
                                        </TouchableHighlight>
                                    : 
                                    <View style={{flexDirection:'row'}}>
                                        <TouchableHighlight onPress={
                                                (order.IsAfterDepartureChange)?this._onRefunds4:
                                                (chaMinuse>10)?this._onRefund:
                                                (chaMinuse<0)?this.__onRefunds:
                                                this._onRefund3
                                        } underlayColor='transparent' 
                                                style={{ backgroundColor:(chaMinuse<10) || (order.IsAfterDepartureChange) ? Theme.assistFontColor: Theme.theme,paddingHorizontal:8,height: 22,marginLeft: 10,alignItems: 'center',justifyContent: 'center',borderRadius:2}}>
                                            <CustomText style={{ color: 'white' }} text='退票' />
                                        </TouchableHighlight>
                                    </View>
                                }
                                </View>
                                }
                                {
                                    order.Status === TrainEnum.OrderStatus.TicketIssued && order.OrderType === TrainEnum.OrderType.Issued ? (
                                        timeline&&order.ordertype!=2 ?
                                        <View>
                                        <TouchableHighlight onPress={this._onReissue} underlayColor='transparent' 
                                                            style={{backgroundColor:order.TrainIsOutage?Theme.assistFontColor: Theme.theme,paddingHorizontal:8,height: 22,marginLeft: 10,alignItems: 'center',justifyContent: 'center',borderRadius:2}}>
                                            <CustomText style={{ color: 'white' }} text='改签' />
                                        </TouchableHighlight>
                                        </View>
                                        :
                                        <TouchableHighlight onPress={this._onReissue2} underlayColor='transparent' 
                                                            style={{backgroundColor:Theme.assistFontColor,height: 22,marginLeft: 10,alignItems: 'center',justifyContent: 'center',borderRadius:2, paddingHorizontal:8}}>
                                            <CustomText style={{ color: 'white' }} text='改签' />
                                        </TouchableHighlight>
                                       
                                    ) : null
                                }
                                {
                                    (order.Status === 22 || order.Status === 24) && (!order.MassOrderId || order.OrderType===2) ? (//待付款、抢票中
                                        <View style={{flexDirection:'row'}}>
                                        <TouchableHighlight underlayColor='transparent' onPress={()=>{order.Status === 22 ? this._waitforPayAction(2) : this._cancel}} style={curStyle.btn2}>
                                            <CustomText style={{ color: Theme.theme }} text='取消' />
                                        </TouchableHighlight>
                                        {order.Status === 22 ? <TouchableHighlight underlayColor='transparent' style={curStyle.btn} onPress={this._waitforPayAction}>
                                            <CustomText style={{ color: 'white' }} text='付款' />
                                        </TouchableHighlight>:null}
                                        </View>
                                    ) : null
                                }
                                {
                                    order.Status === TrainEnum.OrderStatus.Approving? (
                                        <TouchableHighlight underlayColor='transparent' onPress={this._remindBtn} style={curStyle.btn}>
                                            <CustomText style={{ color: 'white' }} text='催审' />
                                        </TouchableHighlight>
                                    ) : null
                                }
                            </View>
                        ) : null
                    }
                </View>
            </TouchableHighlight>
        )
    }
}

export default function(props) {
    const navigation = useNavigation();
    return (
        <OrderListItem {...props} navigation={navigation} />
    )
}

const curStyle = StyleSheet.create({
    mainFont: {
        fontSize: 15
    },
    aidFont: {
        fontSize: 13,
        color: Theme.commonFontColor,
        marginTop:6
    },
    btn: {
        backgroundColor: Theme.theme,
        height: 22,
        marginLeft: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius:2,
        paddingHorizontal:15,  
    },
    btn2: {
        height: 22,
        marginLeft: 10,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal:15,
        borderWidth:1,
        borderColor:Theme.theme,
        borderRadius:2       
    }
});