import React from 'react';
import {
    TouchableHighlight,
    View,
    Text,
    StyleSheet,
    Image
} from 'react-native';
import Utils from '../../util/Util';
import CustomText from '../../custom/CustomText';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Octicons from 'react-native-vector-icons/Octicons';
import Theme from '../../res/styles/Theme';
import I18nUtil from '../../util/I18nUtil';
// import { Themed, withNavigation } from 'react-navigation';
import { useNavigation } from '@react-navigation/native';
import NavigationUtils from '../../navigator/NavigationUtils';
import DashLine from '../../custom/Dashline';
import CommonService from '../../service/CommonService';

class OrderListItem extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            showServiceCharge:true
        }
    }
    componentDidMount = () => {
        let model = {
            OrderCategory:4,//国内酒店
            MatchModel:{
                IsAgreement:this.props.data.IsAgreement
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
        const { data,enterprise } = this.props;
        NavigationUtils.push(this.props.navigation, 'HotelOrderDetailScreen', { OrderId: data.Id ,enterprise:enterprise});
    }
    render() {
        const { data, pay, cancel, refundPay, guaranteeValidationBtn, userId, refundBtn, creditCVVBtn } = this.props;
        const {showServiceCharge} = this.state;
        if (!data) return null;
        let checkIn = Utils.Date.toDate(data.CheckInDate);
        let checkOut = checkIn.addDays(data.NightCount);
        let showBtn = data.CreateEmployeeId===userId ?true:false;
        return (
            <TouchableHighlight underlayColor='transparent' onPress={this._toDetail}><View style={{ backgroundColor: '#fff', marginHorizontal: 10,borderRadius:6,marginTop:10,paddingHorizontal:20 }}>
                <View style={{flexDirection:'row',justifyContent: "space-between",borderBottomWidth:1,borderColor:Theme.lineColor,paddingVertical:10}}>
                    <View style={{flexDirection:'row'}}>
                    <Image source={require('../../res/Uimage/hotelFloder/hotle_lo.png')} style={{width:18,height:18,marginRight:5}}/>
                    <CustomText style={{ color: Theme.commonFontColor }} text={data.FeeType === 2 ? '因私出行' : '因公出行'} />
                    </View>
                    <View style={{ marginRight: 7, justifyContent: 'center' }}>
                        <CustomText text={data.StatusDesc} style={{ color:Theme.theme}}/>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between',marginTop:6 }}>
                    <CustomText style={{ fontSize:15, fontWeight:'bold',width:200 }} text={data.HotelName} />
                    {
                       showServiceCharge ?
                       <Text allowFontScaling={false} style={{  color: Theme.theme, fontSize: 17 }}>¥{((data.Amount + data.ServiceCharge)?(data.Amount + data.ServiceCharge).toFixed(2):0)}</Text>
                       :
                       <Text allowFontScaling={false} style={{  color: Theme.theme, fontSize: 17 }}>¥{(data.Amount?data.Amount.toFixed(2):0)}</Text>
                    }                   
                </View>
                <Text allowFontScaling={false} style={{ marginTop:6 ,color: Theme.commonFontColor}}>{data.CustomerNames}</Text>
                <Text allowFontScaling={false} style={{ color: Theme.assistFontColor,marginTop:6, fontSize: 13 }}>
                    {I18nUtil.translate('入住')} ：{checkIn.format('MM-dd')} {I18nUtil.translate('离店')} ：{checkOut.format('MM-dd')}
                </Text>
                <Text allowFontScaling={false} style={{ marginTop: 6, color: Theme.assistFontColor, fontSize: 13 }}>{I18nUtil.translate('共')} {data.NightCount} {I18nUtil.translate('晚')} {data.RoomName}</Text>
                <View style={{ marginTop: 6, flexDirection: 'row' }}>
                    <Octicons name={'location'} color={Theme.theme} size={16} />
                    <Text allowFontScaling={false} style={{ fontSize: 12, color: Theme.commonFontColor, marginBottom: 10,marginLeft:5 }} numberOfLines={1}>{data.Address}</Text>
                </View>
                {
                    !this.props.dontShow  && showBtn &&
                    <View>
                    {
                        data.Status === 23 && (!data.MassOrderId || data.OrderType===3) ?
                            <View style={{ flexDirection: 'row-reverse',paddingVertical: 10 ,borderTopColor:Theme.lineColor, borderTopWidth:1,alignItems:'center'}}>
                                <TouchableHighlight underlayColor='transparent' style={styles.btn} onPress={pay}>
                                    <CustomText style={{ color: 'white' }} text='付款' />
                                </TouchableHighlight>
                                <TouchableHighlight underlayColor='transparent' style={styles.btn2} onPress={cancel}>
                                    <CustomText style={{ color: Theme.theme }} text='取消' />
                                </TouchableHighlight>
                            </View>
                        : null
                    }
                    {
                        data.Status === 25 && (!data.MassOrderId || data.OrderType===3) ?
                            <View style={{ flexDirection: 'row-reverse', paddingVertical: 10 ,borderTopColor:Theme.lineColor, borderTopWidth:1,alignItems:'center'}}>
                                <TouchableHighlight underlayColor='transparent' style={styles.btn} onPress={refundPay}>
                                    <CustomText style={{ color: 'white' }} text='付款' />
                                </TouchableHighlight>
                                <TouchableHighlight underlayColor='transparent' style={styles.btn2} onPress={cancel}>
                                    <CustomText style={{ color: Theme.theme  }} text='取消' />
                                </TouchableHighlight>
                            </View>
                            : null
                    }
                    {
                        data.Status === 1 && !data.MassOrderId ?
                            <View style={{ flexDirection: 'row-reverse', paddingVertical: 10 ,borderTopColor:Theme.lineColor, borderTopWidth:1,alignItems:'center'}}>
                                <TouchableHighlight underlayColor='transparent' style={styles.btn} onPress={pay}>
                                    <CustomText style={{ color: 'white' }} text='担保' />
                                </TouchableHighlight>
                                <TouchableHighlight underlayColor='transparent' style={styles.btn2} onPress={cancel}>
                                    <CustomText style={{ color: Theme.theme  }} text='取消' />
                                </TouchableHighlight>
                            </View>
                            : null
                    }
                    {
                        data.Status === 3 && data.NeedGuaranteeValidation?
                            <View style={{ flexDirection: 'row-reverse',paddingVertical: 10 ,borderTopColor:Theme.lineColor, borderTopWidth:1,alignItems:'center'}}>
                                <TouchableHighlight underlayColor='transparent' style={styles.btn} onPress={guaranteeValidationBtn}>
                                    <CustomText style={{ color: '#fff' }} text='填写担保验证码' />
                                </TouchableHighlight>
                            </View>
                        : null
                    }
                    {
                        data.Status === 2 && data.IsNeedCreditCard && data.RatePlan?.PrepayRules?.[0]?.NeedCvv?
                            <View style={{ flexDirection: 'row-reverse',paddingVertical: 10 ,borderTopColor:Theme.lineColor, borderTopWidth:1,alignItems:'center'}}>
                                <TouchableHighlight underlayColor='transparent' style={styles.btn} onPress={creditCVVBtn}>
                                    <CustomText style={{ color: '#fff' }} text='填写CVV' />
                                </TouchableHighlight>
                            </View>
                        : null
                    }
                    {   
                        // data.Status === 4 && data.CanRefund && !data.MassOrderId?
                        (data.Status === 4 || data.Status === 17 || data.Status === 1) && data.CanRefund ?
                        <View style={{ flexDirection: 'row-reverse', paddingVertical: 10 ,borderTopColor:Theme.lineColor, borderTopWidth:1,alignItems:'center'}}>
                            <TouchableHighlight underlayColor='transparent' style={styles.btn2} onPress={refundBtn}>
                                <CustomText style={{ color: Theme.theme  }} text='退订' />
                            </TouchableHighlight>
                        </View>
                        :null
                    }
                    </View>
                }
            </View>
            </TouchableHighlight>
        )
    }
}
export default function(props){
    const navigation = useNavigation();
    return <OrderListItem {...props} navigation={navigation}/>
}
const styles = StyleSheet.create({
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
})