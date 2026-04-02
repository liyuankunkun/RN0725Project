import React from 'react';
import {
    View,
    StyleSheet,
    TouchableHighlight,
    Text
} from 'react-native';
import CustomText from '../../custom/CustomText';
import Theme from '../../res/styles/Theme';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FlightEnum from '../../enum/FlightEnum';
import Util from '../../util/Util';
import I18nUtil from '../../util/I18nUtil';
import CropImage from '../../custom/CropImage';
// import { Themed, withNavigation } from 'react-navigation';
import { useNavigation } from '@react-navigation/native';
import NavigationUtils from '../../navigator/NavigationUtils';
class PayOrderListItem extends React.Component {



    _waitforPayAction = () => {
        const { order } = this.props;
        NavigationUtils.push(this.props.navigation, 'FlightPayment', {SerialNumber:order.SerialNumber});
    }
    _itemSigle = (Summary, order) => {
        return (
            <View style={{ flexDirection: 'row', flex: 1 }}>
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row' }}>
                            <CustomText style={{ color: '#333', fontSize: 15,fontWeight:'bold' }} text={I18nUtil.translate(Summary.Departure) + '-' + I18nUtil.translate(Summary.Destination)} />
                            {
                                order.SupplierType === FlightEnum.SupplierType.gw51Book ? (
                                    <View style={{ flexDirection: "row", marginLeft: 10 }}>
                                        <View style={{ borderWidth: 7.5, borderColor: 'transparent', borderRightColor: 'rgb(251,96,0)', width: 0, height: 0 }}></View>
                                        <View style={{ width: 60, height: 15, alignItems: 'center', backgroundColor: 'rgb(251,96,0)', justifyContent: "center" }}><CustomText style={{ color: "white", fontSize: 10 }} text='渠道价' /></View>
                                    </View>
                                ) : null
                            }
                        </View>
                        <Text>
                            <CustomText style={{ color: Theme.theme, fontSize: 14 }} text={'¥'} />
                            <CustomText style={{ color: Theme.theme, fontSize: 18 }} text={ order.Amount} />
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                        <CustomText style={{ color: Theme.commonFontColor , fontSize: 13}} text={(Summary.DepartureTime && Util.Date.toDate(Summary.DepartureTime).format('MM-dd HH:mm')) + ' ' + I18nUtil.translate('至') + ' ' + (Summary.DestinationTime && Util.Date.toDate(Summary.DestinationTime).format('HH:mm'))} />
                        <CustomText style={{ color: '#666',fontSize:12 }} text={Summary?.JourneyType == 2 ? '往返' : '单程'} />
                    </View>
                    <View style={{ flexDirection: 'row', marginTop: 8, marginBottom: 10,alignItems:'center' }}>
                        <CropImage code={Summary.Airline} />
                        <CustomText style={{ color: Theme.commonFontColor, fontSize: 12 }} text={(Util.Parse.isChinese() ? Summary.AirlineName : "") + ' ' + Summary.Airline + Summary.AirNumber + ' ' + (Util.Parse.isChinese() ? Summary.AirPlaceName : (Summary.EnAirPlaceName ? Summary.EnAirPlaceName : Summary.AirPlaceName))} />
                    </View>
                </View>
            </View>)
    }
    _itemReturn = (Summary, order) => {
        return (
            <View style={{ flexDirection: 'row' }}>
                <View style={{ paddingRight: 5, justifyContent: 'space-between' }}>
                    <View style={[styles.box]}>
                        <CustomText style={{ color: Theme.theme, fontSize: 10 }} text='去' />
                    </View>
                    <View style={[styles.box]}>
                        <CustomText style={{ color: Theme.theme, fontSize: 10 }} text='回' />
                    </View>
                </View>
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row' }}>
                            <CustomText style={{ color: '#333', fontSize: 16 }} text={I18nUtil.translate(Summary.Departure) + '-' + I18nUtil.translate(Summary.Destination)} />
                            {
                                order.SupplierType === FlightEnum.SupplierType.gw51Book ? (
                                    <View style={{ flexDirection: "row", marginLeft: 10 }}>
                                        <View style={{ borderWidth: 7.5, borderColor: 'transparent', borderRightColor: 'rgb(251,96,0)', width: 0, height: 0 }}></View>
                                        <View style={{ width: 60, height: 15, alignItems: 'center', backgroundColor: 'rgb(251,96,0)', justifyContent: "center" }}><CustomText style={{ color: "white", fontSize: 10 }} text='渠道价' i
                                        /></View>
                                    </View>
                                ) : null
                            }
                        </View>
                        <View>
                            <CustomText style={{ color: Theme.theme, fontSize: 18 }} text={'¥' + order.Amount} />
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                        <CustomText style={{ color: '#999' }} text={(Summary.DepartureTime && Util.Date.toDate(Summary.DepartureTime).format('MM-dd HH:mm')) + ' ' + I18nUtil.translate('至') + ' ' + (Summary.DestinationTime && Util.Date.toDate(Summary.DestinationTime).format('HH:mm'))} />
                        <CustomText style={{ color: '#666' }} text={Summary?.JourneyType == 2 ? '往返' : '单程'} />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5, marginBottom: 5 }}>
                        <CustomText style={{ color: '#999' }} text={(Util.Parse.isChinese() ? Summary.AirlineName : "") + ' ' + Summary.Airline + Summary.AirNumber + ' ' + (Util.Parse.isChinese() ? Summary.AirPlaceName : (Summary.EnAirPlaceName ? Summary.EnAirPlaceName : Summary.AirPlaceName))} />
                    </View>
                    <View style={{ backgroundColor: Theme.normalBg, height: 1 }}></View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                        <CustomText style={{ color: '#999' }} text={(Summary.RtDepartureTime && Util.Date.toDate(Summary.RtDepartureTime).format('MM-dd HH:mm')) + ' ' + I18nUtil.translate('至') + ' ' + (Summary.RtDestinationTime && Util.Date.toDate(Summary.RtDestinationTime).format('HH:mm'))} />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5, marginBottom: 5 }}>
                        <CustomText style={{ color: '#999' }} text={(Util.Parse.isChinese() ? Summary.RtAirlineName : '') + ' ' + Summary.RtAirline + Summary.RtAirNumber + ' ' + (Util.Parse.isChinese() ? Summary.RtAirPlaceName : (Summary.RtEnAirPlaceName ? Summary.RtEnAirPlaceName : Summary.RtAirPlaceName))} />
                    </View>
                </View>
            </View>
        )
    }
    render() {
        const { order, cancelAction } = this.props;
        if (!order) return null;
        order.DepartureTime = Util.Date.toDate(order.DepartureTime);
        order.DestinationTime = Util.Date.toDate(order.DestinationTime);
        let Summary = order.Summary ? JSON.parse(order.Summary) : null;
        return (
            <View style={styles.row}>
                <View style={styles.content}>
                    {
                        Summary&&Summary?.JourneyType == 2 ? <View style={{ flex: 1 }}>{this._itemReturn(Summary, order)}</View> : <View style={{ flex: 1 }}>{this._itemSigle(Summary, order)}</View>
                    }
                </View>
                <View style={{ flexDirection: 'row-reverse', marginTop: 10 }}>
                    <TouchableHighlight underlayColor='transparent' style={styles.btn} onPress={this._waitforPayAction}>
                        <CustomText style={{ color: 'white' }} text='付款' />
                    </TouchableHighlight>
                    <TouchableHighlight underlayColor='transparent' style={styles.btn2} onPress={cancelAction}>
                        <CustomText style={{ color: Theme.theme }} text='取消' />
                    </TouchableHighlight>
                </View>
            </View>
        )
    }
}
export default function(props) {
    const navigation = useNavigation();
    return (
        <PayOrderListItem {...props} navigation={navigation} />
    )
}
const styles = StyleSheet.create({
    row: {
        backgroundColor: 'white',
        padding: 20,
        paddingBottom: 10,
        marginBottom: 3,
        marginTop:10,
        marginHorizontal:10,
        borderRadius:6
    },
    content: {
        flexDirection: 'row',
        borderBottomColor: Theme.lineColor,
        borderBottomWidth: 1
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
    box: {
        marginBottom: 5,
        paddingHorizontal: 2,
        paddingVertical:1,
        borderWidth: 1,
        justifyContent: "center",
        alignItems: 'center',
        borderColor: Theme.theme,
        borderRadius:2
    }
})