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
// import { withNavigation } from 'react-navigation';
import { useNavigation } from '@react-navigation/native';
import NavigationUtils from '../../navigator/NavigationUtils';

class ApplicationApprovalItem extends React.Component {

    static propTypes = {
        order: PropTypes.object.isRequired,
        approve: PropTypes.func,
        reject: PropTypes.func
    }

    _toDetail = () => {
        const { approve, reject, order } = this.props;
        NavigationUtils.push(
            this.props.navigation, 'ApplicationOrderDetail', { 
               isApprove:true, Id:this.props.order.Id, 
               approve: approve, 
               approveShow:order.ApprovalStatus === 0 ? true : false
        })
    }

    render() {
        const { order, approve, reject, } = this.props;
        let date = Util.Date.toDate(order.CreateTime);
        console.log('order--',order.CreateTime);

        let journeyIntro2 = [];
        let JourneyDateDesc = [];
        if (order.JourneyList) {
            order.JourneyList.forEach((item, index) => {
                item.DepartureTime = item.DepartureTime &&  Util.Date.toDate(item.DepartureTime);
                item.ReturnTime =item.ReturnTime && Util.Date.toDate(item.ReturnTime);
                journeyIntro2.push(
                    <Text key={index} style={{ flex: 1, fontSize: 15,fontWeight:'bold',color:Theme.fontColor }} numberOfLines={2} allowFontScaling={false}>{`${I18nUtil.translate(item.Departure)} - ${I18nUtil.translate(item.Destination)}`}</Text>
                )
                JourneyDateDesc.push(
                    `${ item.DepartureTime ? item.DepartureTime.format('MM-dd'):''} - ${item.ReturnTime ? item.ReturnTime.format('MM-dd'):''}`
                )
            })
        }else{
            if(order.Destination){
                    order.Destination.BeginTime = order.Destination.BeginTime&& Util.Date.toDate(order.BeginTime);
                    order.Destination.EndTime = order.Destination.BeginTime&& Util.Date.toDate(order.BeginTime);
                    // item.ReturnTime =item.ReturnTime && Util.Date.toDate(item.ReturnTime);
                    journeyIntro2.push(
                        <Text style={{ flex: 1, fontSize: 15,fontWeight:'bold',color:Theme.fontColor  }} numberOfLines={2} allowFontScaling={false}>{`${I18nUtil.translate(order.Destination.Departure)} - ${I18nUtil.translate(order.Destination&&order.Destination.Destination)}`}</Text>
                    )
                    // JourneyDateDesc.push(
                    //     `${ order.Destination.BeginTime ? order.Destination.BeginTime.format('MM-dd'):''} - ${order.Destination.EndTime ? order.Destination.EndTime.format('MM-dd'):''}`
                    // )
            }
                
        }
    
        return (
            < View style={{backgroundColor: 'white', marginHorizontal:10,paddingHorizontal: 20 ,borderRadius:6,marginTop:10}}>
                <TouchableHighlight underlayColor='transparent' onPress={this._toDetail}>
                    <View style={{flex: 1,marginBottom:10 }}>
                           
                           <View style={{flexDirection:'row',justifyContent: "space-between",borderBottomWidth:1,borderColor:Theme.lineColor,paddingVertical:10}}>
                                <View style={{flexDirection:'row'}}>
                                    <Image source={ require('../../res/Uimage/bag.png')} style={{ width: 18, height: 18 }}></Image>
                                    <CustomText style={{ color: Theme.commonFontColor,marginLeft:8 }} text={order.SerialNumber} />
                                </View>
                                <CustomText style={{ color: Theme.theme }} text={order.StatusDesc} />
                            </View>
                            <View style={{flexDirection:'row',alignItems:'center'}}>
                                <View style={{ flex: 1 }}>
                                    <View style={{ flex: 1 ,marginTop: 6}}>
                                         {journeyIntro2.map((item, index) => (
                                            <React.Fragment key={index}>
                                                {item}
                                            </React.Fragment>
                                        ))}
                                    </View>
                                    <Text allowFontScaling={false} style={{ color: Theme.commonFontColor,marginTop: 6, }}>{date.format('yyyy-MM-dd')}</Text>
                                    <Text allowFontScaling={false} style={{ marginTop: 6, color: Theme.assistFontColor }}>{order.TravellerDesc}</Text>
                                </View>
                                {
                                        order.ApprovalStatus !== 0 ? <View style={{ marginTop: 10 }}>
                                            {order.ApprovalStatus === 2 ? <Image style={{ width: 40, height: 40 }} source={require('../../res/image/reject_icon.png')} /> : <Image style={{ width: 40, height: 40 }} source={require('../../res/image/agree_icon.png')} />}
                                        </View> : null
                                }
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
        <ApplicationApprovalItem {...props}  navigation={navigation}/>
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