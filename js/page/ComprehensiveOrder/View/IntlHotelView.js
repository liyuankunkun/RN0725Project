
import React from 'react';
import {
    View,
    StyleSheet,
    TouchableHighlight,
    FlatList,
    Image,
    TouchableOpacity,
    Text
} from 'react-native';
import CustomText from '../../../custom/CustomText';
// import { withNavigation } from 'react-navigation';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Theme from '../../../res/styles/Theme';
import DashLine from '../../../custom/Dashline';
import Util from '../../../util/Util'
import I18nUtil from '../../../util/I18nUtil';
class IntlHotelView extends React.Component {
    render() {
        const { item ,Status,needCvvCallback} = this.props;
        let internalOrder = item&&item.InternalOrder
        if(!internalOrder || !internalOrder.Hotel){return null};
        let hotel = internalOrder.Hotel
        let room = internalOrder.Room
        let checkInTime = Util.Date.toDate( internalOrder.CheckInDate ).format('MM.dd')
        let checkOutTime = Util.Date.toDate( internalOrder.CheckOutDate ).format('MM.dd')
        let travellerNames = []
        item.InternalOrder.Customers.map((travel_item)=>{
              travellerNames.push(travel_item.Name) 
        }) 
        let travellerString = travellerNames.join('、')
        return (
            <View style={styles.borderStyle}>
                <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                    <View style={{ backgroundColor:internalOrder.OrderHotelReasons&&internalOrder.OrderHotelReasons[0]&&internalOrder.OrderHotelReasons[0].RuleType===17?Theme.theme:Theme.redColor,color:'#fff',alignItems:'center',justifyContent:'center',borderTopLeftRadius:4,borderBottomRightRadius:4,height:16}}>
                        <CustomText text={internalOrder.OrderHotelReasons&&internalOrder.OrderHotelReasons[0]&&internalOrder.OrderHotelReasons[0].RuleType===17?'符合政策':'违反政策'} style={{color:'#fff',fontSize:11}} />
                    </View>
                    {this.props.showBtn?<TouchableOpacity style={{width:50,flexDirection:'row',justifyContent:'flex-end',alignItems:'center'}}
                            onPress={this.props.deleteClick}
                    >
                        {Status===0&&<AntDesign name="close" size={22} style={{color:Theme.promptFontColor}}></AntDesign>}
                    </TouchableOpacity>:null}
                </View>
                <View style={styles.titleStyle}>
                   <View style={{flexDirection:'row',justifyContent:'space-between',flexWrap:'wrap'}}>
                      <CustomText text={ hotel.Name } />
                      <CustomText text={internalOrder.StatusDesc} style={{fontSize:13,color:Theme.assistFontColor}}/>
                   </View> 
                </View>
                <View style={styles.massegeStyle}>
                    <View style={{width:100,marginRight:-20}}>
                        <CustomText text={checkInTime} style={{fontSize:24}}/>
                        <CustomText text={'14:00后入住'} style={{fontSize:13,color:Theme.darkColor}}/>
                    </View>
                    <View>
                         <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
                            <View style={{height:1,width:20,backgroundColor:Theme.assistFontColor}}></View>
                            <View style={{height:18,borderRadius:9,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:Theme.assistFontColor,paddingHorizontal:6}}>
                                <CustomText text={I18nUtil.tranlateInsert('{{noun}}晚',internalOrder.NightCount )} style={{fontSize:12,color:Theme.assistFontColor}}/>
                            </View>
                            <View style={{height:1,width:20,backgroundColor:Theme.assistFontColor}}></View>
                         </View>
                    </View>
                    <View style={{alignItems:'flex-end',width:100,marginLeft:-20}}>
                        <CustomText text={checkOutTime} style={{fontSize:24}}/>
                        <CustomText text={'12:00前离店'} style={{fontSize:13,color:Theme.darkColor,textAlign:'right'}}/>
                    </View>
                </View>
                <View style={{paddingHorizontal:20,paddingVertical:3,flexDirection:'row',}}>
                      <CustomText text={Util.Parse.isChinese()? room.RoomName :room.EnRoomName}  style={{color:Theme.assistFontColor}}/>
                      <CustomText text={' | '}  style={{color:Theme.assistFontColor}}/>
                      <CustomText text={item.Travellers.length + (Util.Parse.isChinese()? '人入住':'Guests')}  style={{color:Theme.assistFontColor}}/>
                      <CustomText text={' | '}  style={{color:Theme.assistFontColor}}/>
                      <CustomText text={internalOrder.RatePlan.RatePlanName}  style={{color:Theme.assistFontColor}}/>
                </View> 
                <View style={{flexDirection:'row', paddingHorizontal:20, paddingVertical:3 ,justifyContent:'space-between',alignItems:'center'}}>
                   <View style={{flexDirection:'row'}}>
                      <Feather name={'map-pin'} size={16} style={{color:Theme.theme}}/>
                      <CustomText text={Util.Parse.isChinese()? hotel.Address: hotel.EnAddress} style={{marginLeft:5,color:Theme.assistFontColor,width:160}} />
                   </View>
                   <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
                      {
                       item.InternalOrder.Status==1&&(Status==3||Status==4)?
                            <TouchableOpacity style={{ paddingVertical:3,paddingHorizontal:6,backgroundColor:Theme.theme,borderRadius:5}}
                                            onPress={this.props.IntlGuaranteedCallback}
                            >
                                <CustomText text={'担保'} style={{color:'#fff',fontSize:12}} />
                            </TouchableOpacity> 
                        :null
                      }
                   </View>
                   <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
                      {
                       item.InternalOrder.Status==2 && item.InternalOrder.RatePlan.IsNeedCreditCard && item.InternalOrder?.RatePlan?.PrepayRules?.[0]?.NeedCvv ?
                            <TouchableOpacity style={{ paddingVertical:3,paddingHorizontal:6,backgroundColor:Theme.theme,borderRadius:5}}
                                            onPress={needCvvCallback}
                            >
                                <CustomText text={'填写CVV'} style={{color:'#fff',fontSize:12}} />
                            </TouchableOpacity>
                        :null
                      }
                   </View> 
                </View>
                <Text style={{flexDirection:'row', paddingHorizontal:20, paddingVertical:3}}>
                        <CustomText text={'描述：'} style={{marginLeft:5,color:Theme.assistFontColor}} />
                        <CustomText text={room.Description} style={{marginLeft:5,color:Theme.assistFontColor}} />
                </Text>
                <View style={{backgroundColor:Theme.greenLine,height:1,marginHorizontal:20,marginVertical:10}}/>
                <TouchableOpacity style={styles.personStyle} onPress={this.props.callback}>
                         <View style={{flexDirection:'row'}}>
                            <CustomText text={'入住人' } style={{fontSize: 14}}/>
                            <CustomText text={':' } style={{fontSize: 14}}/>
                            <CustomText text={travellerString } style={{fontSize: 14}} numberOfLines={1} />
                        </View>
                   <View style={{flexDirection:'row', alignItems:'center',justifyContent:'space-between'}}>
                        <View style={styles.button}>
                            <CustomText text={'详情'} style={{marginLeft:20, color:Theme.theme, fontSize: 14}}/>
                            <View style={styles.arrow}></View>
                        </View>
                   </View> 
                </TouchableOpacity>
            </View>
        )
    }
}
export default function(props) {
    const navigation = useNavigation();
    return (
        <IntlHotelView {...props} navigation={navigation} />
    )
}

const styles = StyleSheet.create({
    borderStyle:{
        marginHorizontal:15,
        backgroundColor:Theme.greenBg,
        borderRadius:4,
    },
    titleStyle:{
        justifyContent:'space-between',
        paddingVertical:5,
        paddingHorizontal:20,
        paddingTop:10,
        flexWrap:'wrap'
    },
    titleStyle2:{
        flexDirection:'row',
        paddingRight:10,
        justifyContent:'space-between',
        alignItems:'center',
        paddingVertical:3,
        flexWrap:'wrap'
    },
    massegeStyle:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between',
        paddingVertical:10,
        paddingHorizontal:20
    },
    personStyle:{
        flexDirection:'row',
        paddingBottom:20,
        justifyContent:'space-between',
        paddingHorizontal:20,       
    },
    button:{
        flexDirection:'row',
        justifyContent: 'center',
        alignItems: 'center' 
    },
    arrow:{
        marginLeft:5,
        marginTop:1,
        width:0,
        height:0,
        borderStyle:'solid',
        borderWidth:6,
        borderTopColor:Theme.greenBg,//下箭头颜色
        borderLeftColor:Theme.theme,//右箭头颜色
        borderBottomColor:Theme.greenBg,//上箭头颜色
        borderRightColor:Theme.greenBg//左箭头颜色
    }
})