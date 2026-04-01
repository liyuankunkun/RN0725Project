
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
import Util from '../../../util/Util';
import StorageUtil from '../../../util/StorageUtil';
import Key from '../../../res/styles/Key';

class TrainView extends React.Component {
    render() {
        const {item ,Status} = this.props;
        let internalOrder = item&&item.InternalOrder
        if(!internalOrder || !internalOrder.TrainInfo){return null}
        let trainInfo = internalOrder.TrainInfo
        let DepartureDate = Util.Date.toDate( trainInfo.DepartureTime ).format('yyyy-MM-dd')
        let DepartureTime = Util.Date.toDate( trainInfo?.DepartureTime ).format('HH:mm')
        let ArrivalTime = Util.Date.toDate( trainInfo.ArrivalTime ).format('HH:mm')

        var cha = Util.Date.toDate(trainInfo.ArrivalTime).valueOf()-Util.Date.toDate(trainInfo?.DepartureTime).valueOf()
        var chadays = cha%(24*3600*1000)//相差天数
        var hours=Math.floor(chadays/(3600*1000));
        var leave2=chadays%(3600*1000);        //计算小时数后剩余的毫秒数
        var minutes=Math.floor(leave2/(60*1000));
        let hour = '';
        let minute = '';
        if(hours>0){ hour = hours+'h' }
        if(minutes>0){ minute = minutes+'m'}
        StorageUtil.loadKeyId(Key.TrainCitysData,).then(response => {
            response&&response.map((item)=>{
                if(item.Code == trainInfo.FromStationCode){
                    trainInfo.FromStationEnName = item.EnName
                }else if(item.Code == trainInfo.ToStationCode){
                    trainInfo.ToStationEnName = item.EnName
                }
            })
        })
        return (
            <View style={styles.borderStyle}>
                <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                        <View style={{ 
                                        backgroundColor:internalOrder.TrainRcReason&&internalOrder.TrainRcReason.length>0?
                                        item.InternalOrder.TrainRcReason[0].RuleType!=17?Theme.redColor:Theme.theme
                                        :Theme.theme,height:16,
                                        color:'#fff',alignItems:'center',justifyContent:'center',borderTopLeftRadius:4,borderBottomRightRadius:4}}>
                            <CustomText text={internalOrder.TrainRcReason&&internalOrder.TrainRcReason.RuleType===17?'符合政策':'违反政策'} 
                                        style={{color:'#fff',fontSize:11}} />
                        </View>
                        {this.props.showBtn?<TouchableOpacity style={{width:50,flexDirection:'row',justifyContent:'flex-end',alignItems:'center'}}
                                onPress={this.props.deleteClick}
                        >
                            {Status===0&&<AntDesign name="close" size={22} style={{color:Theme.promptFontColor}}></AntDesign>}
                        </TouchableOpacity>:null}
                </View>
                <View style={styles.titleStyle}>
                   <View style={{flexDirection:'row',alignItems:'center'}}>
                      <CustomText text={ DepartureDate +' '+Util.Date.toDate(trainInfo?.DepartureTime).getWeek()} style={{fontWeight:'bold'}}/>
                   </View>
                   <CustomText text={item.StatusDesc} style={{fontSize:13,color:Theme.assistFontColor}}/>
                </View>
                <View style={styles.massegeStyle}>
                    <View >
                        <CustomText text={DepartureTime} style={{fontSize:24}}/>
                        <View style={{flexDirection:'row'}}>
                        <View style={{height:14,paddingHorizontal:2,backgroundColor:Theme.orangeColor,alignItems:'center',justifyContent:'center',borderRadius:2}}>
                            <CustomText text={'始'} style={{fontSize:10, color:'#fff'}}></CustomText>
                        </View>
                        <CustomText text={Util.Parse.isChinese()? trainInfo.FromStationName:trainInfo.FromStationEnName} style={{fontSize:12,color:Theme.darkColor}}/>
                        </View>
                    </View>
                    <View style={{alignItems:'center'}}>
                         <CustomText text={hour+minute} style={{fontSize:11,paddingTop:3,color:Theme.assistFontColor}}/>
                         <Image source={require('../../../res/Uimage/compDetailIcon/arrowIcon.png')} style={{width:60,height:3}}></Image>
                         <CustomText text={trainInfo.Checi} style={{fontSize:11,color:Theme.assistFontColor}}/>
                    </View>
                    <View style={{alignItems:'flex-end'}}>
                        <CustomText text={ArrivalTime} style={{fontSize:24}}/>
                        <View style={{flexDirection:'row'}}>
                        <View style={{height:14,paddingHorizontal:2, backgroundColor:Theme.theme,alignItems:'center',justifyContent:'center',borderRadius:2}}>
                            <CustomText text={'终'} style={{fontSize:10, color:'#fff'}}></CustomText>
                        </View>
                        <CustomText text={Util.Parse.isChinese()? trainInfo.ToStationName:trainInfo.ToStationEnName} style={{fontSize:12,color:Theme.darkColor}}/>
                        </View>
                    </View>
                </View>
                <View style={styles.titleStyle2}>
                   <View style={{flexDirection:'row'}}>
                      <CustomText text={'坐席'}  style={{fontSize:12, color:Theme.commonFontColor}} />
                      <CustomText text={': '}  style={{fontSize:12, color:Theme.commonFontColor}} />
                      <CustomText text={trainInfo.Zwname } style={{fontSize:12, color:Theme.commonFontColor}} />
                   </View> 
                </View>
                <View style={{backgroundColor:Theme.greenLine,height:1,marginHorizontal:20,marginVertical:10}}
                               color={''}  lineWidth={1} />
                <TouchableOpacity style={styles.personStyle}
                                  onPress={this.props.callback}
                >
                        <View style={{flexDirection:'row'}}>
                            <CustomText text={'乘车人' } style={{fontSize: 14}}/>
                            <CustomText text={'：' } style={{fontSize: 14}}/>
                            <CustomText text={internalOrder.OrderPassenger.Name } style={{fontSize: 14}}/>
                        </View>
                        <View style={styles.button}>
                            <CustomText text={'详情'} style={{color:Theme.theme, fontSize: 14}}/>
                            <View style={styles.arrow}></View>
                        </View>
                </TouchableOpacity>
            </View>
        )
    }
}
export default function(props) {
    const navigation = useNavigation();
    return (
        <TrainView {...props} navigation={navigation} />
    )
}

const styles = StyleSheet.create({
    borderStyle:{
        // marginBottom:10,
        marginHorizontal:15,
        backgroundColor:Theme.greenBg,
        borderRadius:4,
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
        flexWrap:'wrap'
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