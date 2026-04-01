
import React from 'react';
import {
    View,
    StyleSheet,
    TouchableHighlight,
    FlatList,
    Image,
    TouchableOpacity
} from 'react-native';
import PropTypes from 'prop-types';
import CustomText from '../../../custom/CustomText';
// import { withNavigation } from 'react-navigation';
import { useNavigation } from '@react-navigation/native';
import NavigationUtils from '../../../navigator/NavigationUtils';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Theme from '../../../res/styles/Theme';
import DashLine from '../../../custom/Dashline';
import Util from '../../../util/Util'
import CropImage from '../../../custom/CropImage';
import airlines from '../../../res/js/airline';
class FlightView extends React.Component {
    static propTypes = {
        // item:PropTypes.string
    }
    render() {
        const { item,Status } = this.props;
        if(!item.InternalOrder || !item.InternalOrder.OrderAir){return null}
        let airData = item.InternalOrder.OrderAir
        let DepartureDate
        let DepartureTime
        let DestinationTime
        let hour = '';
        let minute = '';
        if(airData.DepartureTime !='0001-01-01T00:00:00'){
             DepartureDate = Util.Date.toDate( airData.DepartureTime ).format('yyyy-MM-dd')
             DepartureTime = Util.Date.toDate( airData.DepartureTime ).format('HH:mm')
        }
        if(airData.DestinationTime!='0001-01-01T00:00:00'){
             DestinationTime = Util.Date.toDate( airData.DestinationTime ).format('HH:mm')
        }
        if(airData.DestinationTime!='0001-01-01T00:00:00'&&airData.DepartureTime !='0001-01-01T00:00:00'){
            var cha = Util.Date.toDate(airData.DestinationTime).valueOf()-Util.Date.toDate(airData.DepartureTime).valueOf()
            var chadays = cha%(24*3600*1000)//相差天数
            var hours=Math.floor(chadays/(3600*1000));
            var leave2=chadays%(3600*1000);        //计算小时数后剩余的毫秒数
            var minutes=Math.floor(leave2/(60*1000));
            if(hours>0){ hour = hours+'h' }
            if(minutes>0){ minute = minutes+'m'}
        }
        let travellerNames = []
        item.InternalOrder.Travellers.map((travel_item)=>{
            travellerNames.push(travel_item.Name) 
        }) 
        let travellerString = travellerNames.join('、')
        return (
            item?
            <View style={styles.borderStyle}>
                <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                    {/* <View style={{ backgroundColor:item.InternalOrder.RcReasonLst&&item.InternalOrder.RcReasonLst.length>0?
                                    item.InternalOrder.RcReasonLst[0].RuleType!=17?Theme.redColor:Theme.theme
                                    :Theme.theme,height:16,
                                    color:'#fff',alignItems:'center',justifyContent:'center',borderTopLeftRadius:4,borderBottomRightRadius:4}}>
                        <CustomText style={{color:'#fff',fontSize:11}} text={
                                        item.InternalOrder.RcReasonLst&&item.InternalOrder.RcReasonLst.length>0?
                                            item.InternalOrder.RcReasonLst[0].RuleType!=17?'违反政策':'符合政策'
                                        :'符合政策'
                                    } />
                    </View> */}
                    <View 
                        style={{ 
                            backgroundColor: 
                                item?.InternalOrder?.RcReasonLst?.length > 0 
                                    ? (item.InternalOrder.RcReasonLst[0].RuleType !== 17 ? Theme.redColor : Theme.theme) 
                                    : Theme.theme,
                            height: 16,
                            color: '#fff',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderTopLeftRadius: 4,
                            borderBottomRightRadius: 4
                        }}
                    >
                        <CustomText 
                            style={{ color: '#fff', fontSize: 11 }} 
                            text={
                                item?.InternalOrder?.RcReasonLst?.length > 0 && item.InternalOrder.RcReasonLst[0]
                                    ? (item.InternalOrder.RcReasonLst[0].RuleType !== 17 ? '违反政策' : '符合政策') 
                                    : '符合政策'
                            } 
                        />
                    </View>
                    {this.props.showBtn?<TouchableOpacity style={{width:50,flexDirection:'row',justifyContent:'flex-end',alignItems:'center'}}
                            onPress={this.props.deleteClick}
                    >
                        {Status===0&& <AntDesign name="close" size={22} style={{color:Theme.promptFontColor}}></AntDesign>}
                    </TouchableOpacity>:null}
                </View>
                <View style={styles.titleStyle}>
                   <View style={{flexDirection:'row'}}>
                      <CustomText text={ DepartureDate +' '+Util.Date.toDate(airData.DepartureTime).getWeek()} style={{}}/>
                      <CustomText text={'('} style={{marginLeft:3}}/>
                      <CustomText text={airData.Departure} style={{marginLeft:5}}/>
                      <CustomText text={'-'} style={{}}/>
                      <CustomText text={airData.Destination} style={{}}/>
                      <CustomText text={' )'} style={{}}/>
                   </View>
                   <CustomText text={item.StatusDesc} style={{fontSize:13,color:Theme.assistFontColor}}/>
                </View>
                <View style={styles.massegeStyle}>
                    <View style={{width:120,marginRight:-20}}>
                        <CustomText text={DepartureTime} style={{fontSize:24}}/>
                        <View style={{flexDirection:'row'}}>
                        <CustomText text={Util.Parse.isChinese()? airData.DepartureAirportName:airData.DepartureAirport} style={{fontSize:12,color:Theme.darkColor}}/>
                        <CustomText text={airData.DepartureAirportTerminal==null?'':airData.DepartureAirportTerminal} style={{fontSize:12,color:Theme.darkColor,marginLeft:3}}/>
                        </View>
                    </View>
                    <View style={{alignItems:'center'}}>
                         <CustomText text={hour+minute} style={{fontSize:11,paddingTop:3,color:Theme.assistFontColor}}/>
                         <Image source={require('../../../res/Uimage/compDetailIcon/arrowIcon.png')} style={{width:60,height:3}}></Image>
                         <CustomText text={airData.Stop<=0?'':'经停'+airData.Stop} style={{fontSize:11}}/>
                    </View>
                    <View style={{alignItems:'flex-end',width:120,marginLeft:-20}}>
                        <CustomText text={DestinationTime} style={{fontSize:24}}/>
                        <View style={{flexDirection:'row'}}>
                        <CustomText text={Util.Parse.isChinese()?airData.DestinationAirportName:airData.DestinationAirport} style={{fontSize:12,color:Theme.darkColor,textAlign:'right'}}/>
                        <CustomText text={airData.DestinationAirportTerminal==null?'':airData.DestinationAirportTerminal} style={{fontSize:12,color:Theme.darkColor,textAlign:'right'}}/>
                        </View>
                    </View>
                </View>
                <View style={styles.titleStyle2}>
                   <View style={{flexDirection:'row',alignItems:'center',flexWrap:'wrap'}}>
                      <CropImage code={airData.Airline} />
                      {/* <CustomText style={{marginLeft:3, fontSize:12}} text={  Util.Parse.isChinese() ? airData.AirlineName : getAirlineEngliSHName(airData.Airline)} /> */}
                      <CustomText style={{marginLeft:5, fontSize:12, color:Theme.commonFontColor}} text={airData.Airline} />
                      <CustomText style={{ fontSize:12, color:Theme.commonFontColor}} text={airData.AirNumber } />
                      <CustomText text={'|'} style={{marginLeft:4,fontSize:12, color:Theme.commonFontColor}}/>
                      <CustomText text={Util.Parse.isChinese()? airData.AirPlaceName:airData.EnAirPlaceName} style={{fontSize:12,marginLeft:6, color:Theme.commonFontColor}}/>
                      {/* <CustomText text={Util.Parse.isChinese()? airData.DiscountDescML: airData.DiscountDesc} style={{fontSize:12,marginLeft:8}}/> */}
                      {/* <CustomText text={'机型'} style={{fontSize:12,marginLeft:8}}/>
                      <CustomText text={':'} style={{fontSize:12}}/>
                      <CustomText text={airData.EquipType} style={{fontSize:12}}/> */}
                      <CustomText text={'|'} style={{marginLeft:4,fontSize:12, color:Theme.commonFontColor}}/>
                      <CustomText text={airData.MealDesc} style={{marginLeft:6,fontSize:12, color:Theme.commonFontColor}}/>
                   </View> 
                  
                </View>
              
                <View style={{backgroundColor:Theme.greenLine,height:1,marginHorizontal:20,marginVertical:10}}/>
               
                <TouchableOpacity style={styles.personStyle} onPress={this.props.callback}>
                        <View style={{flexDirection:'row'}}>
                            <CustomText text={'乘机人' } style={{fontSize: 14}}/>
                            <CustomText text={'：' } style={{fontSize: 14}}/>
                            <CustomText text={ travellerString } style={{fontSize: 14}}/>
                        </View>
                        <View style={styles.button}>
                            <CustomText text={'详情'} style={{color:Theme.theme, fontSize: 14}}/>
                            <View style={styles.arrow}></View>
                        </View>
                </TouchableOpacity>
            </View>
            :null
        )
    }
}
// export default withNavigation(FlightView);
export default function(props) {
    const navigation = useNavigation();
    return (
        <FlightView {...props} navigation={navigation} />
    )
}

const getAirlineEngliSHName = (airlineCode) => {
    if (airlines && Array.isArray(airlines)) {
        let index = airlines.findIndex(airline => (airline.Code === airlineCode));
        if (index === -1) {
            return null;
        }
        return airlines[index].EnFullName;
    }
}

const styles = StyleSheet.create({
    borderStyle:{
        marginHorizontal:15,
        backgroundColor:Theme.greenBg,
        borderRadius:4,
        marginBottom:10,
    },
    titleStyle:{
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        paddingHorizontal:20,
        paddingVertical:4,
        flexWrap:'wrap'
    },
    titleStyle2:{
        flexDirection:'row',
        paddingHorizontal:20,
        paddingVertical:6,
        justifyContent:'space-between',
        alignItems:'center',
    },
    massegeStyle:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between',
        paddingVertical:10,
        paddingHorizontal:20
    },
    ttstyle:{
        paddingVertical:4,
        paddingHorizontal:6,
        backgroundColor:'rgba(156, 204, 102, 1)',
        color:'#fff',
       borderRadius:5
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