import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableHighlight,
    StyleSheet
} from 'react-native';
import PropType from 'prop-types'
import Theme from '../../res/styles/Theme';
import I18nUtil from '../../util/I18nUtil';
import Util from '../../util/Util';
import CustomText from '../../custom/CustomText';
// import { withNavigation } from 'react-navigation';
import NavigationUtils from '../../navigator/NavigationUtils';
import CropImage from '../../custom/CropImage';
import { useNavigation } from '@react-navigation/native';

class FlightApprovalItem extends React.PureComponent {
    static propTypes = {
        order: PropType.object.isRequired,
        customerInfo: PropType.object.isRequired,
        reject: PropType.func.isRequired,
        agree: PropType.func.isRequired
    }

    _toDetail = () => {
        const { approve, reject, order } = this.props;
        NavigationUtils.push(this.props.navigation, 'FlightOrderDetail', { 
            Id: this.props.order.Id, 
            isApprove: true,
            approveShow:order.ApprovedStatus === 0 ? true : false 
        });
    }

    render() {
        const { order, customerInfo,agree,reject,ServiceFeesShow } = this.props;
        if (!order) return null;
        order.DepartureTime = Util.Date.toDate(order.DepartureTime);
        order.DestinationTime = Util.Date.toDate(order.DestinationTime);
        let _totalPrice = ServiceFeesShow ? (order.Amount + order?.ServiceCharge).toFixed(2) : order.Amount.toFixed(2);
        return (
            <View style={{backgroundColor: 'white', marginHorizontal:10,paddingHorizontal: 20 ,borderRadius:6,marginTop:10 }}>
                <TouchableHighlight underlayColor='transparent' onPress={this._toDetail} style={{ backgroundColor: 'white',borderRadius:6,marginTop:10}}>
                <View style={{ flex: 1,marginBottom:10 }}>
                    
                    <View style={{flexDirection:'row',justifyContent: "space-between",borderBottomWidth:1,borderColor:Theme.lineColor,paddingVertical:10}}>
                        <View style={{flexDirection:'row'}}>
                            <Image source={ require('../../res/Uimage/flightFloder/flight_lo.png')} style={{ width: 18, height: 18 }}></Image>
                            <CustomText style={{ color: Theme.commonFontColor,marginLeft:8 }} text={order.FeeType === 2 ? '因私出行' : '因公出行'} />
                        </View>
                        <CustomText style={{ color: Theme.theme }} text={order.StatusDesc} />
                    </View>
                    <View style={[{ flexDirection: 'row' }]}>
                        <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between',marginTop:6 }}>
                                <View style={{ flexDirection: 'row' }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <CustomText style={{ fontSize: 15,fontWeight:'bold' }} text={I18nUtil.translate(order.Departure) + '-' + I18nUtil.translate(order.Destination)} />
                                    </View>
                                </View>
                                <View>
                                    <CustomText style={{ color: Theme.theme, fontSize: 17 }} text={'¥' + _totalPrice} />
                                </View>
                            </View>
                            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                                <View>
                                <CustomText style={{ marginTop: 6 }} text={order.TravellerNames} />
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                                    <CustomText style={{ color: Theme.commonFontColor }} text={(order.DepartureTime && order.DepartureTime.format('yyyy-MM-dd HH:mm')) + I18nUtil.translate('-') + (order.DestinationTime && order.DestinationTime.format('HH:mm'))} />
                                </View>
                                <View style={{ flexDirection: 'row', marginTop: 6, marginBottom: 5 }}>
                                    <CropImage code={order.Airline} />
                                    <CustomText style={{ color: Theme.commonFontColor}} text={(Util.Parse.isChinese() ? order.AirlineName : order.AirlineNameEn) + ' ' + order.Airline + order.AirNumber +'  '} />
                                    <CustomText style={{ color: Theme.commonFontColor }} text={(Util.Parse.isChinese() ? order.AirPlaceName :order.EnAirPlaceName)+order.AirPlace} />
                                </View>
                                </View>
                                {
                                    order.Status === 5 ? (
                                        <View>
                                            <Image style={{ width: 40, height: 40 }} source={require('../../res/image/reject_icon.png')} />
                                        </View>
                                    ) : null
                                }{
                                    order.ApprovedStatus === 1 ? (
                                        <View>
                                            <Image style={{ width: 40, height: 40 }} source={require('../../res/image/agree_icon.png')} />
                                        </View>
                                    ) : null
                                }
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableHighlight>
                {
                    order.ApprovedStatus === 0 ? (
                        <View style={styles.linViewS}>
                            <TouchableHighlight style={styles.btn2} underlayColor={'transparent'} onPress={reject} >
                                <CustomText style={{ color: Theme.theme }} text='驳回' />
                            </TouchableHighlight>
                            <TouchableHighlight style={styles.btn} underlayColor={'transparent'} onPress={agree}>
                                <CustomText style={{ color: 'white' }} text='同意' />
                            </TouchableHighlight>
                        </View>
                    ) : null
                }
            </View>
        )
    }
}
//使用 Hook 包装类组件以获取 navigation
export default function(props) {
    const navigation = useNavigation();
    return <FlightApprovalItem {...props} navigation={navigation} />;
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
    },
    linViewS:{ 
        flexDirection: 'row-reverse', 
        paddingBottom: 10, 
        borderTopWidth:1, 
        borderColor:Theme.lineColor,
        paddingVertical:10
    }
})