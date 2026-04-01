import React from 'react';
import {
    TouchableHighlight,
    Text,
    View,
    Image,
    StyleSheet
} from 'react-native';
import Util from '../../util/Util';
import I18nUtil from '../../util/I18nUtil';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Theme from '../../res/styles/Theme';
import CustomText from '../../custom/CustomText';
import NavigationUtils from '../../navigator/NavigationUtils';
// import {  withNavigation } from 'react-navigation';
import { useNavigation } from '@react-navigation/native';
import Octicons from 'react-native-vector-icons/Octicons';

 class HotelApprovalItem extends React.Component {

    _toDetail = () => {
        NavigationUtils.push(this.props.navigation, 'HotelOrderDetailScreen', {
            OrderId: this.props.data.Id,
            isApprove: true
        })
    }
    render() {
        const { data, onApprove, onReject,from,ServiceFeesShow } = this.props;
        if (!data || !data.HotelId) {
            return null;
        }
        let checkIn = Util.Date.toDate(data.CheckInDate);
        let nightCount = data.NightCount;
        let checkOut = checkIn.addDays(+nightCount);
        let _totalPrice = ServiceFeesShow ? (data.Price + data?.ServiceCharge).toFixed(2) : data.Price.toFixed(2);
        return (
            <TouchableHighlight underlayColor='transparent' onPress={this._toDetail}>
                <View style={{ backgroundColor: 'white', marginTop: 10, marginHorizontal:10,borderRadius:6,paddingHorizontal:20 }}>
                       
                    <View style={{flexDirection:'row',justifyContent: "space-between",borderBottomWidth:1,borderColor:Theme.lineColor,paddingVertical:10}}>
                        <View style={{flexDirection:'row'}}>
                        <Image source={from=='hotel'? require('../../res/Uimage/hotelFloder/hotle_lo.png') : require('../../res/Uimage/intHotelFloder/inthotle_lo.png')} style={{width:18,height:18,marginRight:5}}/>
                        <CustomText style={{ color: Theme.commonFontColor }} text={data.FeeType === 2 ? '因私出行' : '因公出行'} />
                        </View>
                        <View style={{ marginRight: 7, justifyContent: 'center' }}>
                            <CustomText text={data.StatusDesc} style={{ color:Theme.theme}}/>
                        </View>
                    </View> 
                    <View style={{ marginTop: 6, flexDirection: 'row', justifyContent: 'space-between' }}>
                        
                        <CustomText style={{ fontSize:15, fontWeight:'bold',width:200 }} text={data.HotelName} /> 
                        <Text allowFontScaling={false} style={{ color: Theme.theme, fontSize: 18 }}>¥{_totalPrice}</Text>
                    </View>
                    <View style={{ flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                        <View>
                            <Text allowFontScaling={false} style={{ flex: 1, color: Theme.commonFontColor }}>{data.CustomerNames}</Text>
                            <Text allowFontScaling={false} style={{  color: Theme.assistFontColor,marginTop: 6,fontSize: 13 }}>
                                {I18nUtil.translate('入住')} ：{checkIn.format('yyyy-MM-dd')}  {I18nUtil.translate('离店')} ：{checkOut.format('yyyy-MM-dd')}
                            </Text>
                            <Text allowFontScaling={false} style={{ marginTop: 6, color: Theme.assistFontColor,fontSize: 13 }}>{I18nUtil.translate('共')} {data.NightCount} {I18nUtil.translate('晚')} {data.RoomName}</Text>
                            <View style={{ marginTop: 6, flexDirection: 'row' }}>
                                <Octicons name={'location'} color={Theme.theme} size={16} />
                                <Text allowFontScaling={false} style={{ fontSize: 12, color: Theme.commonFontColor, marginBottom: 10, flex: 1, marginRight: 10,marginLeft:5 }} numberOfLines={1}>{data.Address}</Text>
                            </View>
                        </View>
                        {
                            data.ApprovedStatus === 2 ? (
                                <View>
                                    <Image style={{ width: 40, height: 40 }} source={require('../../res/image/reject_icon.png')} />
                                </View>
                            ) : null
                        }
                        {

                            data.ApprovedStatus === 1 ? (
                                <View>
                                    <Image style={{ width: 40, height: 40 }} source={require('../../res/image/agree_icon.png')} />
                                </View>
                            ) : null
                        }
                    </View>
                    

                    {
                        data.ApprovedStatus === 0 ?
                                <View style={styles.linViewS}>
                                    <TouchableHighlight onPress={onApprove} style={styles.btn} underlayColor='transparent'>
                                        <CustomText style={{ color: 'white' }} text='同意' />
                                    </TouchableHighlight>
                                    <TouchableHighlight underlayColor='transparent' onPress={onReject} style={styles.btn2}>
                                        <CustomText style={{ color: Theme.theme }} text='驳回' />
                                    </TouchableHighlight>
                                </View>
                            : null
                    }
                </View>
            </TouchableHighlight>
        )
    }
}
// 使用 Hook 包装类组件以获取 navigation
export default function(props) {
    const navigation = useNavigation();
    return (
        <HotelApprovalItem {...props}  navigation={navigation}/>
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
    },
    linViewS:{ 
        flexDirection: 'row-reverse', 
        paddingBottom: 10, 
        borderTopWidth:1, 
        borderColor:Theme.lineColor,
        paddingVertical:10
    }
})