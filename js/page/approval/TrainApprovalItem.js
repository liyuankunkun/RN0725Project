import React from 'react';
import PropTypes from 'prop-types';
import {
    View,
    Image,
    Text,
    TouchableHighlight,
    StyleSheet
} from 'react-native';
import CustomText from '../../custom/CustomText';
import Theme from '../../res/styles/Theme';
import I18nUtil from '../../util/I18nUtil';
import NavigationUtils from '../../navigator/NavigationUtils';
// import {withNavigation} from 'react-navigation';
import { useNavigation } from '@react-navigation/native';

import Util from '../../util/Util';
/**
 * 火车票审批项
 */
class TrainApprovalItem extends React.Component {
    static propTypes = {
        order: PropTypes.object.isRequired,
        customerInfo: PropTypes.object.isRequired,
        reject: PropTypes.func.isRequired,
        agree: PropTypes.func.isRequired
    }
    _toDetail = () => {
        NavigationUtils.push(this.props.navigation, 'TrainOrderDetailScreen', { 
            Id: this.props.order.Id ,
            isApprove:true,
            approveShow:this.props.order.ApprovalStatus === 0 ? true : false
        });
    }
    render() {
        const { order, reject, agree, customerInfo,ServiceFeesShow } = this.props;
        if (!order || !order.TrainInfo) return null;
        const { TrainInfo: trainInfo } = order;
        let _totalPrice = ServiceFeesShow ? (order.Price + order?.ServiceCharge).toFixed(2) : order.Price.toFixed(2);
        return (
            <TouchableHighlight onPress={this._toDetail} underlayColor='transparent'>
                <View style={{ backgroundColor: 'white', marginTop: 10, marginHorizontal:10, borderRadius:6,paddingHorizontal:20 }}>
                    <View style={{flexDirection:'row',justifyContent: "space-between",borderBottomWidth:1,borderColor:Theme.lineColor,paddingVertical:10}}>
                        <View style={{flexDirection:'row'}}>
                            <Image source={ require('../../res/Uimage/trainFloder/train_lo.png')} style={{ width: 18, height: 18 }}></Image>
                            <CustomText allowFontScaling={false} style={{fontWeight:'bold',marginLeft:8}} text={trainInfo.Checi}></CustomText>
                            <CustomText style={{ color: Theme.commonFontColor,marginLeft:8 }} text={order.FeeType === 2 ? '因私出行' : '因公出行'} />
                        </View>
                        <CustomText style={{ color: Theme.theme }} text={order.StatusDesc} />
                    </View>
                    <View style={{ marginVertical:10 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            {
                                Util.Parse.isChinese()?
                                <Text allowFontScaling={false} style={{ fontSize:15, fontWeight:'bold',color:Theme.fontColor }} numberOfLines={1}>{trainInfo.FromStationName+'-'+trainInfo.ToStationName}</Text>
                                :
                                <Text allowFontScaling={false} style={{ flex: 1 }} numberOfLines={1}>{trainInfo.FromStationEnName+'-'+trainInfo.ToStationEnName}</Text>
                            } 
                            <CustomText style={{color: Theme.theme, fontSize: 17}} text={'¥' + _totalPrice} />
                        </View>
                        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                            <View>
                                <CustomText text={order.Name}  style={{ marginTop: 6 }}/>
                                <Text allowFontScaling={false} style={styles.aidFont}>{trainInfo.TrainDate} {trainInfo.StartTime} {I18nUtil.translate('-')} {trainInfo.ArriveTime}</Text>
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
                    </View>
                    {
                        order.ApprovedStatus === 0 ? (
                            <View style={styles.linViewS}>
                                <TouchableHighlight style={styles.btn2} underlayColor={'transparent'} onPress={reject}>
                                    <CustomText style={{ color: Theme.theme }} text='驳回' />
                                </TouchableHighlight>
                                <TouchableHighlight style={styles.btn} underlayColor={'transparent'} onPress={agree}>
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
        <TrainApprovalItem {...props} navigation={navigation} />
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
    },
    mainFont: {
        fontSize: 15
    },
    aidFont: {
        fontSize: 13,
        color: Theme.commonFontColor,
        marginTop:6
    },
})