
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
// import DashLine from '../../../custom/Dashline';
import Util from '../../../util/Util'
import CropImage from '../../../custom/CropImage';
import I18nUtil from '../../../util/I18nUtil';
class IntlFlightView extends React.Component {
    static propTypes = {
        // item:PropTypes.string
    }
    render() {
        const { item,Travellers,Status,airPortData,AirLineArr } = this.props;
        if(!item.InternalOrder || !item.InternalOrder.AirList){return null};
        let airDataList = item.InternalOrder.AirList
        let travellerNames = []
        Travellers.map((travel_item)=>{
            // travellerNames.push(travel_item.Name) 
            if(travel_item.GivenName&&travel_item.Surname){
                travellerNames.push(travel_item.GivenName+' '+travel_item.Surname) 
              }
        }) 
        let travellerString = travellerNames.join('、')
        return (
            item?
            <View style={styles.borderStyle}>
                <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                    <View 
                        style={{ 
                            backgroundColor: 
                                item?.InternalOrder?.RcReasonLst?.length > 0 && item.InternalOrder.RcReasonLst[0]
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
                            text={
                                item?.InternalOrder?.RcReasonLst?.length > 0 && item.InternalOrder.RcReasonLst[0] && typeof item.InternalOrder.RcReasonLst[0].RuleType === 'number'
                                    ? (item.InternalOrder.RcReasonLst[0].RuleType !== 17 ? '违反政策' : '符合政策') 
                                    : '符合政策'
                            } 
                            style={{ color: '#fff', fontSize: 11 }} 
                        />
                    </View>
                    {this.props.showBtn?<TouchableOpacity style={{width:50,flexDirection:'row',justifyContent:'flex-end',alignItems:'center'}}
                                        onPress={this.props.deleteClick}
                                >
                                {Status===0&&<AntDesign name="close" size={22} style={{color:Theme.promptFontColor}}></AntDesign>}
                    </TouchableOpacity>:null}
                </View>
            {
              airDataList&&airDataList.map((airData,index)=>{
                let DepartureDate = Util.Date.toDate( airData.DepartureTime ).format('yyyy-MM-dd')
                let DepartureTime = Util.Date.toDate( airData.DepartureTime ).format('HH:mm')
                let DestinationTime = Util.Date.toDate( airData.DestinationTime ).format('HH:mm')

                var cha = Util.Date.toDate(airData.DestinationTime).valueOf()-Util.Date.toDate(airData.DepartureTime).valueOf()
                var chadays = cha%(24*3600*1000)//相差天数
                var hours=Math.floor(chadays/(3600*1000));
                var leave2=chadays%(3600*1000);        //计算小时数后剩余的毫秒数
                var minutes=Math.floor(leave2/(60*1000));
                let hour = '';
                let minute = '';
                if(hours>0){ hour = hours+'h' }
                if(minutes>0){ minute = minutes+'m'}
                let DepartureAirportEnName;
                let DestinationAirportEnName;
                airPortData.map((item)=>{
                    if(item.AirportName == airData.DepartureAirportName ){
                        DepartureAirportEnName = item.AirportEnName
                        airData.EnDeparture = item.CityEnName
                    }
                    if(item.AirportName == airData.DestinationAirportName ){
                        DestinationAirportEnName = item.AirportEnName
                        airData.EnDestination = item.CityEnName
                    }
                })
                let EnAirLineName
                AirLineArr.map((item)=>{
                    if(item.Code==airData.AirlineCode){
                        EnAirLineName = item.EnName
                    }
                })
                let EnlineName = Util.Parse.isChinese()?airData.AirlineName:EnAirLineName
                return(  
                 <View key={index} style={{paddingHorizontal:20,paddingTop:10}}>
                    {
                        index>0?
                        <View style={{backgroundColor:Theme.greenLine,height:1,marginBottom:20}}/>
                        :null
                    } 
                    <View style={styles.titleStyle}>
                        <View style={{flexDirection:'row',alignItems:'center',width:200,flexWrap:"wrap"}}>
                            <CustomText text={airData.RouteTypeDesc} style={{borderRadius:2,color:'#fff',backgroundColor:Theme.orangeColor,paddingHorizontal:2,fontSize:11}}/>
                            <CustomText text={ DepartureDate +' '+Util.Date.toDate(airData.DepartureTime).getWeek()} style={{marginLeft:3}}/>
                            {
                                Util.Parse.isChinese()?
                                <CustomText text={'('+airData.Departure+'-'+airData.Destination+')'} style={{marginLeft:5}}/>
                                :
                                <CustomText text={'('+airData.EnDeparture+'-'+airData.EnDestination+')'} style={{marginLeft:5}}/>
                            }
                        </View>
                        <CustomText text={item.StatusDesc} style={{fontSize:13,color:Theme.assistFontColor,textAlign:'right'}}/>
                    </View>
                    <View style={styles.massegeStyle}>
                        <View style={{width:120,marginRight:-20}}>
                            <CustomText text={DepartureTime} style={{fontSize:24}}/>
                            {
                              Util.Parse.isChinese()?
                                <CustomText text={`${airData.DepartureAirportName}${airData.DepartureAirportTerminal==null?'':airData.DepartureAirportTerminal}`} style={{fontSize:12,color:Theme.darkColor}}/>
                                :
                            <CustomText text={DepartureAirportEnName} style={{fontSize:12,color:Theme.darkColor}}/>
                        }
                        </View>
                        <View style={{alignItems:'center'}}>
                            <CustomText text={hour+minute} style={{fontSize:11,paddingTop:3,color:Theme.assistFontColor}}/>
                            <Image source={require('../../../res/Uimage/compDetailIcon/arrowIcon.png')} style={{width:60,height:3}}></Image>
                            <CustomText text={airData.StopQuantity<=0?'':I18nUtil.tranlateInsert('经停')+airData.StopQuantity} style={{fontSize:11}}/>
                        </View>
                        <View style={{alignItems:'flex-end',width:120,marginLeft:-20}}>
                            <CustomText text={DestinationTime} style={{fontSize:24}}/>
                            {
                              Util.Parse.isChinese()?
                              <CustomText text={airData.DestinationAirportName+(airData.DestinationAirportTerminal==null?'':airData.DestinationAirportTerminal)} style={{fontSize:12,color:Theme.darkColor,textAlign:'right'}}/>
                              : 
                              <CustomText text={DestinationAirportEnName} style={{fontSize:12,color:Theme.darkColor,textAlign:'right'}}/>
                            }
                        </View>
                    </View>
                    <View style={styles.titleStyle2}>
                        <View style={{flexDirection:'row',alignItems:'center',flexWrap:'wrap'}}>
                            <CropImage code={airData.AirlineCode} />
                            {/* <CustomText style={{marginLeft:3}} text={EnlineName+airData.AirlineCode+airData.AirlineNumber } /> */}
                            <CustomText style={{marginLeft:3}} text={airData.AirlineCode+airData.AirlineNumber } />
                            <CustomText text={'|'} style={{marginLeft:4,fontSize:12, color:Theme.commonFontColor}}/>
                            <CustomText text={airData.CabinName} style={{fontSize:14,marginLeft:8}}/>
                            <CustomText text={'|'} style={{marginLeft:4,fontSize:12, color:Theme.commonFontColor}}/>
                            <CustomText text={airData.EquipType} style={{fontSize:14,marginLeft:8}}/>
                        </View> 
                    </View>
                </View> 
                )
              })  
             }
                <View style={{backgroundColor:Theme.greenLine,height:1,marginHorizontal:20,marginVertical:10}}/>
                <TouchableOpacity style={styles.personStyle} onPress={this.props.callback}>
                        <View style={{flexDirection:'row'}}>
                            <CustomText text={'乘机人' } style={{fontSize: 14}}/>
                            <CustomText text={'：'} style={{fontSize: 14}}/>
                            <CustomText text={ travellerString } style={{fontSize: 14 }}/>
                        </View>
                   <View style={{flexDirection:'row', alignItems:'center',justifyContent:'space-between'}}>
                   
                        <View style={styles.button}>
                            <CustomText text={'详情'} style={{marginLeft:20, color:Theme.theme, fontSize: 14}}/>
                            <View style={styles.arrow}></View>
                        </View>
                   </View> 
                </TouchableOpacity>
            </View>
            :null
        )
    }
}

export default function(props) {
    const navigation = useNavigation();
    return (
        <IntlFlightView {...props} navigation={navigation} />
    )
}



const styles = StyleSheet.create({
    borderStyle:{
        marginHorizontal:15,
        backgroundColor:Theme.greenBg,
        borderRadius:6,
        // elevation:1.5, shadowColor:'#999999', shadowOffset:{width:2,height:3}, shadowOpacity: 0.4, shadowRadius: 3
    },
    titleStyle:{
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        flexWrap:'wrap',
    },
    titleStyle2:{
        flexDirection:'row',
        paddingRight:10,
        justifyContent:'space-between',
        alignItems:'center',
        paddingVertical:10,
        flexWrap:'wrap'
    },
    massegeStyle:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between',
        paddingVertical:10
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