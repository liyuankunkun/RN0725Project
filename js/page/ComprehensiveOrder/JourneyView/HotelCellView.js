
import React from 'react';
import {
    View,
    StyleSheet,
    Image,
    TouchableOpacity
} from 'react-native';
import CustomText from '../../../custom/CustomText';
import { useNavigation } from '@react-navigation/native';
import Theme from '../../../res/styles/Theme';
import Util from '../../../util/Util'
class HotelCellView extends React.Component {
    render() {
        const { item } = this.props;
        var DepartureTime = Util.Date.toDate(item.DepartureTime).format('yyyy-MM-dd')
        var ArrivalTime = Util.Date.toDate(item.ArrivalTime).format('yyyy-MM-dd')
        var DepartureDate = item.DepartureTime.slice(0, 10);
        var week = Util.Date.toDate(item.DepartureTime).getWeek();
        let diffDay = Util.Date.getDiffTime(item.DepartureTime, item.ArrivalTime);
        return (
            <View style={{ paddingHorizontal: 15, paddingVertical: 10, marginHorizontal: 10, marginBottom: 5, borderRadius: 6, marginTop: -15, backgroundColor: '#fff', marginTop: -15 }}>
                <View style={{ backgroundColor: Theme.greenBg, borderRadius: 4, paddingHorizontal: 10 }}>
                    <CustomText text={item.Carrier} style={{ marginTop: 10, marginLeft: 10 }} />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ alignItems: 'flex-start', padding: 10 }}>
                            <CustomText text={DepartureTime} style={{ fontSize: 16, fontWeight: '300' }} />
                            <CustomText text={item.DepartureLocation} style={{ fontSize: 12 }} />
                        </View>
                        <View style={{ alignItems: 'center' }}>
                            <Image source={require('../../../res/Uimage/arrow.png')} style={{ width: 60, height: 3 }}></Image>
                        </View>
                        <View style={{ alignItems: 'flex-end', padding: 10 }} >
                            <CustomText text={ArrivalTime} style={{ fontSize: 16, fontWeight: '300' }} />
                            <CustomText text={item.ArrivalLocation} style={{ fontSize: 12 }} />
                        </View>
                    </View>
                    <View>
                        <CustomText text={item.Seat} style={{ marginLeft: 10, fontSize: 11, color: Theme.assistFontColor }} />
                    </View>
                    <TouchableOpacity style={{ borderTopWidth: 1, borderColor: Theme.theme, marginLeft: 5, paddingVertical: 15, marginTop: 10, flexDirection: Util.Parse.isChinese ? 'row' : 'column', alignItems: 'center', justifyContent: 'space-between' }}
                                      onPress={this.props.callback}
                    >
                        <View style={{ flexDirection: 'row' }}>
                            <CustomText text={'入住人'} style={{ marginLeft: 4, fontSize: 14 }} />
                            <CustomText text={':'} />
                            <CustomText text={item.TravellerNames} style={{ marginHorizontal: 4, fontSize: 14 }} />
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <CustomText text={'详情'} style={{ color: Theme.theme, fontSize: 14 }} />
                            <View style={styles.arrow}></View>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}
// 使用 Hook 包装类组件以获取 navigation
export default function(props) {
    const navigation = useNavigation();
    return <HotelCellView {...props} navigation={navigation} />;
}

const styles = StyleSheet.create({

    arrow: {
        marginLeft: 5,
        marginTop: 3,
        width: 0,
        height: 0,
        borderStyle: 'solid',
        borderWidth: 6,
        borderTopColor: Theme.greenBg,//下箭头颜色
        borderLeftColor: Theme.theme,//右箭头颜色
        borderBottomColor: Theme.greenBg,//上箭头颜色
        borderRightColor: Theme.greenBg//左箭头颜色
    }
})