import React from 'react';
import PropTypes from 'prop-types';
import {
    StyleSheet,
    View,
    Image,
    Text,
    TouchableHighlight,
} from 'react-native';

import CustomText from '../../custom/CustomText';
import Theme from '../../res/styles/Theme';
import Util from '../../util/Util';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import { withNavigation } from 'react-navigation';
import { useNavigation } from '@react-navigation/native';
import NavigationUtils from '../../navigator/NavigationUtils';

/**
 * 国际机票审批项
 */
class IntlFlightApprovalItem extends React.Component {
    static propTypes = {
        order: PropTypes.object.isRequired,
        customerInfo: PropTypes.object.isRequired,
        // approvalStatus: PropTypes.number.isRequired,
        // onDetail: PropTypes.func.isRequired,
        onApprove: PropTypes.func,
        onReject: PropTypes.func
    }
    _toDetail = () => {
        const { order } = this.props;
        order.Id = order.OrderId;
        NavigationUtils.push(this.props.navigation, 'IntlFlightOrderDetail', { 
            order, 
            isApprove: true,
            approveShow:order.ApprovalStatus === 0 ? true : false
         })
    }
    render() {
        const { order , onApprove, onReject,customerInfo,ServiceFeesShow } = this.props;
        if (!order) {
            return null
        }
        let fromDateDesc;
        if (order.DepartureTime) {
            let departureTime = Util.Date.toDate(order.DepartureTime);
            if (departureTime) {
                fromDateDesc = departureTime.format('yyyy-MM-dd HH:mm');
            }
        }
        let _totalPrice = ServiceFeesShow ? (order.Amount + order?.ServiceCharge).toFixed(2) : order.Amount.toFixed(2);
        return (
            <TouchableHighlight onPress={this._toDetail} underlayColor='transparent'>
                <View style={{ backgroundColor: 'white', marginTop: 10,marginHorizontal:10,borderRadius:6,paddingHorizontal:20 }}>
                    <View style={{flexDirection:'row',justifyContent: "space-between",borderBottomWidth:1,borderColor:Theme.lineColor,paddingVertical:10}}>
                        <View style={{flexDirection:'row'}}>
                            <Image source={ require('../../res/Uimage/IntFlightFloder/intflight_lo.png')} style={{ width: 18, height: 18 }}></Image>
                            <CustomText style={{ color: Theme.commonFontColor,marginLeft:8 }} text={order.FeeType === 2 ? '因私出行' : '因公出行'} />
                        </View>
                        <CustomText style={{ color: Theme.theme }} text={order.StatusDesc} />
                    </View>
                    <View style={{ marginTop:10, flexDirection: 'row', justifyContent: 'space-between'}}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {/* <Text allowFontScaling={false} style={{ fontSize: 15,fontWeight:'bold',color:Theme.fontColor }}>{Util.Parse.isChinese() ? order.Departure :order.AirportCities?.[0]?.CityEnName }-{Util.Parse.isChinese() ? order.Destination : order.AirportCities?.[1]?.CityEnName}</Text> */}
                            <Text allowFontScaling={false} style={{ fontSize: 14,fontWeight:'bold',color:Theme.fontColor }}>{order.JourneyDesc ? order.JourneyDesc.replace(/[\r\n]+$/, '') : ''}</Text>
                        </View>
                        <CustomText style={{ color: Theme.theme, fontSize: 17 }} text={'¥' + _totalPrice} />
                    </View>
                    <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                        <View style={{ marginTop: 6,marginBottom:10 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text allowFontScaling={false} numberOfLines={1} style={{ width: 200 , fontSize: 13, color: Theme.commonFontColor}}>{order.TravellerNames}</Text>
                                <CustomText style={{ color: Theme.commonFontColor, fontSize: 10, backgroundColor:Theme.greenBg,height:14,paddingHorizontal:5 ,borderRadius:2,color:Theme.theme }} text={order.OrderTypeDesc} />
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <CustomText style={styles.aidFont} text={fromDateDesc} />
                                <CustomText style={[styles.aidFont,{marginLeft:10}]} text={order.JourneyTypeDesc} />
                            </View>
                        </View>
                        {
                            order.ApprovedStatus === 2 ? (
                                <View>
                                    <Image style={{ width: 40, height: 40 }} source={require('../../res/image/reject_icon.png')} />
                                </View>
                            ) : null
                        }
                        {
                            order.ApprovedStatus === 1 ? (
                                <View>
                                    <Image style={{ width: 40, height: 40 }} source={require('../../res/image/agree_icon.png')} />
                                </View>
                            ) : null
                        }
                    </View>
                    {
                        order.ApprovedStatus === 0 ? (
                            <View style={styles.linViewS}>
                                <TouchableHighlight style={styles.btn2} underlayColor={'transparent'} onPress={onReject}>
                                    <CustomText style={{ color: Theme.theme }} text='驳回' />
                                </TouchableHighlight>
                                <TouchableHighlight style={styles.btn} underlayColor={'transparent'} onPress={onApprove}>
                                    <CustomText style={{ color: 'white' }} text='同意' />
                                </TouchableHighlight>
                            </View>
                        ) : null
                    }
                </View>
            </TouchableHighlight>
        );
    }
}
// 使用 Hook 包装类组件以获取 navigation
export default function(props) {
    const navigation = useNavigation();
    return (
        <IntlFlightApprovalItem {...props}  navigation={navigation}/>
    )
}

const styles = StyleSheet.create({
    mainFont: {
        fontSize: 15
    },
    aidFont: {
        marginTop: 5,
        color: Theme.aidFontColor
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
    },
    linViewS:{ 
        flexDirection: 'row-reverse', 
        paddingBottom: 10, 
        borderTopWidth:1, 
        borderColor:Theme.lineColor,
        paddingVertical:10
    }
});