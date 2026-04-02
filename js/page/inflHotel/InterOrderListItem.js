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
import HotelService from '../../service/HotelService';
class InterOrderListItem extends React.PureComponent {

    _toDetail = () => {
        const { data,enterprise } = this.props;
        NavigationUtils.push(this.props.navigation, 'InterHotelOrderDetail', { orderId: data.Id ,enterprise:enterprise});
    }

    render() {
        const { data, pay, cancel,remindBtn,userId,refundBtn,creditCVVBtn } = this.props;
        if (!data) return null;
        let checkIn = Utils.Date.toDate(data.CheckInDate);
        let checkOut = checkIn.addDays(data.NightCount);
        let showBtn = data.CreateEmployeeId===userId ?true:false;
        return (
            <TouchableHighlight underlayColor='transparent' onPress={this._toDetail}>
             <View style={{ backgroundColor: '#fff', marginHorizontal: 10,borderRadius:6,marginTop:10,paddingHorizontal:20 }}>

                {/* <View style={{ borderBottomColor: Theme.lineColor, height: 40, flexDirection: 'row', alignItems: 'center',marginLeft:10,marginRight:10 }}>
                    <FontAwesome5 style={{ marginLeft: 5 }} name={'hotel'} color={Theme.theme} size={17} />
                    <CustomText style={{ marginLeft: 10, flex: 1,fontSize:15, fontWeight:'bold' }} numberOfLines={1} text={data.HotelName} />
                    <View style={{ marginRight: 7, justifyContent: 'center' }}>
                        <CustomText text={data.StatusDesc} />
                    </View>
                </View> */}
                <View style={{flexDirection:'row',justifyContent: "space-between",borderBottomWidth:1,borderColor:Theme.lineColor,paddingVertical:10}}>
                    <View style={{flexDirection:'row'}}>
                    <Image source={require('../../res/Uimage/intHotelFloder/inthotle_lo.png')} style={{width:18,height:18,marginRight:5}}/>
                    <CustomText style={{ color: Theme.commonFontColor }} text={data.FeeType === 2 ? '因私出行' : '因公出行'} />
                    </View>
                    <View style={{ marginRight: 7, justifyContent: 'center' }}>
                        <CustomText text={data.StatusDesc} style={{ color:Theme.theme}}/>
                    </View>
                </View> 
                <View style={{ marginTop: 6, flexDirection: 'row', justifyContent: 'space-between' }}>
                    {/* <Text allowFontScaling={false} style={{ marginLeft: 10, flex: 1 }}>{data.CustomerNames}</Text> */}
                    <CustomText style={{ fontSize:15, fontWeight:'bold',width:200 }} text={Utils.Parse.isChinese()? data.HotelName:data.EnHotelName} /> 
                    <Text allowFontScaling={false} style={{ color: Theme.theme, fontSize: 18 }}>¥{data.Amount}</Text>
                </View>
                <Text allowFontScaling={false} style={{ flex: 1,color: Theme.commonFontColor, fontSize: 13}}>{data.CustomerNames}</Text>
                <Text allowFontScaling={false} style={{  color: Theme.assistFontColor,marginTop: 6, fontSize: 13}}>
                    {I18nUtil.translate('入住')} ：{checkIn.format('yyyy-MM-dd')}  {I18nUtil.translate('离店')} ：{checkOut.format('yyyy-MM-dd')}
                </Text>
                <Text allowFontScaling={false} style={{ marginTop: 6, color: Theme.assistFontColor, fontSize: 13 }}>{I18nUtil.translate('共')} {data.NightCount} {I18nUtil.translate('晚')} {data.RoomName}</Text>
                <View style={{ marginTop: 6, flexDirection: 'row' }}>
                    <Octicons name={'location'} color={Theme.theme} size={16} />
                    <Text allowFontScaling={false} style={{ fontSize: 12, color: Theme.commonFontColor, marginBottom: 10, flex: 1, marginRight: 10,marginLeft:5 }} numberOfLines={1}>{data.Address}</Text>
                </View>
                {
                   !this.props.dontShow  && showBtn &&
                   <View>
                        {
                           data.Status === 23 && (!data.MassOrderId || data.OrderType===3)?
                                <View style={{ flexDirection: 'row-reverse', paddingVertical: 10 ,borderTopColor:Theme.lineColor, borderTopWidth:1}}>
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
                           data.Status === 1 && !data.MassOrderId?
                                <View style={{ flexDirection: 'row-reverse',paddingVertical: 10 ,borderTopColor:Theme.lineColor, borderTopWidth:1}}>
                                    <TouchableHighlight underlayColor='transparent' style={styles.btn} onPress={pay}>
                                        <CustomText style={{ color: 'white' }} text='担保' />
                                    </TouchableHighlight>
                                    <TouchableHighlight underlayColor='transparent' style={styles.btn2} onPress={cancel}>
                                        <CustomText style={{ color: Theme.theme }} text='取消' />
                                    </TouchableHighlight>
                                </View>:null
                        }
                        {   
                            (data.Status === 4 || data.Status === 17 || data.Status === 1) && data.CanRefund?
                            <View style={{ flexDirection: 'row-reverse', paddingVertical: 10 ,borderTopColor:Theme.lineColor, borderTopWidth:1,alignItems:'center'}}>
                                <TouchableHighlight underlayColor='transparent' style={styles.btn2} onPress={refundBtn}>
                                    <CustomText style={{ color: Theme.theme  }} text='退订' />
                                </TouchableHighlight>
                            </View>
                            :null
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
                        {/* {
                            data.Status===18 && !data.MassOrderId?
                            <View style={{ flexDirection: 'row-reverse', padding: 88 ,borderTopColor:Theme.lineColor, borderTopWidth:1}}>
                                <TouchableHighlight underlayColor='transparent' style={styles.btn} onPress={remindBtn}>
                                <CustomText style={{ color: '#fff' }} text='催审' />
                            </TouchableHighlight>
                            </View>:null
                        } */}
                    </View>
                }
            </View>
            </TouchableHighlight>
        )
    }
}
export default function(props) {
    const navigation = useNavigation();
    return (
        <InterOrderListItem {...props} navigation={navigation} />
    )
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