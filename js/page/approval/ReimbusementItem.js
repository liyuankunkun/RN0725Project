import React from 'react';
import {
    TouchableHighlight,
    View,
    Image,
    Text,
    StyleSheet
} from 'react-native';

import CustomText from '../../custom/CustomText';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Theme from '../../res/styles/Theme';
import Util from '../../util/Util';
import I18nUtil from '../../util/I18nUtil';
import PropTypes from 'prop-types';
// 使用 Hook 包装类组件以获取 navigation
import { useNavigation } from '@react-navigation/native';
import NavigationUtils from '../../navigator/NavigationUtils';

class ReimbusementItem extends React.Component {

    static propTypes = {
        order: PropTypes.object.isRequired,
        approve: PropTypes.func,
        reject: PropTypes.func
    }

    _toDetail = () => {
        NavigationUtils.push(this.props.navigation, 'ReimbusementOrderDetail', { isApprove: true, Id: this.props.order.Id })
    }

    render() {
        const { order, approve, reject, } = this.props;
        let date = Util.Date.toDate(order.CreateTime);


        return (
            < View style={{ backgroundColor: 'white', marginTop: 3 }}>
                <TouchableHighlight underlayColor='transparent' onPress={this._toDetail}>
                    <View style={{}}>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ margin: 15 }}>
                                <FontAwesome name={'shopping-bag'} size={22} color={Theme.theme} />
                            </View>
                            <View style={{ margin: 10, marginLeft: 0, flex: 1 }}>
                                <View style={{ flex: 1, flexDirection: "row", justifyContent: 'space-between', alignItems: "center" }}>
                                    <View style={{ flex: 1 }}>
                                        <Text>{`申请单号：${order.SerialNumber}`}</Text>
                                    </View>
                                    <Text allowFontScaling={false} style={{ color: 'gray', marginLeft: 10 }}>{order.StatusDesc}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <View style={{ flex: 1 }}>
                                        <Text allowFontScaling={false} style={{ marginTop: 10, color: 'gray' }}>{`报销金额：${order.Amount}`}</Text>
                                        <Text allowFontScaling={false} style={{ marginTop: 10, flex: 1 }} numberOfLines={2}>{`申请时间：${date.format('MM-dd HH:mm')}`}</Text>
                                    </View>
                                    {
                                        order.ApprovalStatus !== 0 ? <View style={{ marginRight: 10, marginTop: 10, marginLeft: 10 }}>
                                            {order.ApprovalStatusDesc === '不同意' || order.ApprovalStatusDesc === '已驳回' ? <Image style={{ width: 40, height: 30 }} source={require('../../res/image/reject_icon.png')} /> : <Image style={{ width: 40, height: 30 }} source={require('../../res/image/agree_icon.png')} />}
                                        </View> : null
                                    }
                                </View>
                            </View>
                        </View>
                    </View>
                </TouchableHighlight>
                {
                    order.ApprovalStatus === 0 ? (
                        <View style={styles.linViewS}>
                            <TouchableHighlight style={styles.btn2} underlayColor={'transparent'} onPress={reject}>
                                <CustomText style={{ color: Theme.theme }} text='驳回' />
                            </TouchableHighlight>
                            <TouchableHighlight style={styles.btn} underlayColor={'transparent'} onPress={approve}>
                                <CustomText style={{ color: 'white' }} text='同意' />
                            </TouchableHighlight>
                        </View>
                    ) : null
                }
            </View >
        )
    }

}
// 使用 Hook 包装类组件以获取 navigation
export default function(props) {
    const navigation = useNavigation();
    return (
        <ReimbusementItem {...props}  navigation={navigation}/>
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