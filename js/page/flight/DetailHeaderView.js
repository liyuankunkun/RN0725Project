import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    TouchableHighlight,
    ImageBackground,
    Image
} from 'react-native';
import Util from '../../util/Util';
import I18nUtil from '../../util/I18nUtil';
import Theme from '../../res/styles/Theme';
import CustomText from '../../custom/CustomText';
import CropImage from '../../custom/CropImage';
import ViewUtil from '../../util/ViewUtil';
export default class DetailHeaderView extends React.PureComponent {
    _modifyRules = () => {
        const { otwTHis, order } = this.props;
        otwTHis.ruleView.show(order && order.OrderAir);
    }
    _modifyRules2 = () => {
        const { otwTHis, order } = this.props;
        otwTHis.ruleView2.show(order && order.OrderAir);
    }
    _baggeShow = () => {
        const { otwTHis, order } = this.props;
        otwTHis.toastMsg((order.OrderAir.PolicyInfo ? order.OrderAir.PolicyInfo.BagDesc : ''));
    }
    render() {
        const { order, otwTHis } = this.props;
        if (!order) return;
        const orderAir = order.OrderAir || {};
        let iDays = 0;
        orderAir.DestinationTime = Util.Date.toDate(orderAir.DestinationTime);
        orderAir.DepartureTime = Util.Date.toDate(orderAir.DepartureTime);
        let des = orderAir.DestinationTime && orderAir.DestinationTime.format('yyyy-MM-dd');
        let dep = orderAir.DepartureTime && orderAir.DepartureTime.format('yyyy-MM-dd');
        iDays = parseInt(Math.abs(Util.Date.toDate(des) - Util.Date.toDate(dep)) / 1000 / 60 / 60 / 24);
        let DiscountDesc = orderAir.DiscountDesc;
        if (!Util.Parse.isChinese()) {
            if (Util.Parse.isNumber(orderAir.Discount) && orderAir.Discount < 1 && orderAir.Discount > 0) {
                DiscountDesc = (parseInt((1 - orderAir.Discount) * 100)) + '% off';
            }
        }
        let hour = '';
        let minute = '';
        if(orderAir.DestinationTime!='0001-01-01T00:00:00'&&orderAir.DepartureTime !='0001-01-01T00:00:00'){
            var cha = Util.Date.toDate(orderAir.DestinationTime).valueOf()-Util.Date.toDate(orderAir.DepartureTime).valueOf()
            var chadays = cha%(24*3600*1000)//相差天数
            var hours=Math.floor(chadays/(3600*1000));
            var leave2=chadays%(3600*1000);        //计算小时数后剩余的毫秒数
            var minutes=Math.floor(leave2/(60*1000));
            if(hours>0){ hour = hours+'h' }
            if(minutes>0){ minute = minutes+'m'}
        }
        return (
         <View  style={{}}> 
            <View>
            <View style={{ flexDirection: 'row', alignItems: 'center',justifyContent:'space-between',flexWrap:'wrap' }}>
                <CustomText style={{ fontSize:14 }} text={orderAir.DepartureTime && (orderAir.DepartureTime.format('yyyy-MM-dd') + ' ' + orderAir.DepartureTime.getWeek()) + '( ' + I18nUtil.translate(orderAir.Departure) + '-' + I18nUtil.translate(orderAir.Destination) + ' )' + (orderAir.StopInfo ? I18nUtil.translate('经停') + I18nUtil.translate(orderAir.StopInfo.CityName) : "")} />
                <View style={{flexDirection:'row'}}>
                        <CustomText style={{ color: Theme.theme, fontSize: 12 ,textDecorationLine: 'underline',textDecorationStyle:'solid'}} onPress={this._modifyRules} text='退改规则' />
                        <CustomText style={{ color: Theme.theme, fontSize: 12,marginLeft:5, textDecorationLine: 'underline',textDecorationStyle:'solid'}} onPress={this._modifyRules2} text='行李说明' />
                </View>
            </View>
            <View style={{ flexDirection: 'row', paddingVertical: 10, justifyContent:'space-between' }}>
                <View>
                    <View style={{ alignItems: 'center' }}>
                        <CustomText style={{ fontSize: 26, fontWeight:'bold'}} text={orderAir.DepartureTime && orderAir.DepartureTime.format('HH:mm')} />
                    </View>
                    <View style={{ alignItems: 'flex-start',marginTop:5 }}>
                        <CustomText style={{ fontSize: 12, color:Theme.commonFontColor}} text={(Util.Parse.isChinese() ? orderAir.DepartureAirportName : orderAir.DepartureAirport) + ' ' + (orderAir.DepartureAirportTerminal ? orderAir.DepartureAirportTerminal : '')} />
                    </View>
                </View>
                <View style={styles.center}>
                    <CustomText text={hour+minute} style={{fontSize:11,paddingTop:3,color:Theme.assistFontColor}}/>
                    <Image source={require('../../res/Uimage/compDetailIcon/arrowIcon.png')} style={{width:60,height:3}}></Image>
                </View>
                <View style={{alignItems: 'flex-end' }}>
                    <View style={{ justifyContent: 'center', flexDirection: 'row' }}>
                        <CustomText style={{ fontSize: 26, fontWeight:'bold'}} text={orderAir.DestinationTime && orderAir.DestinationTime.format('HH:mm')} />
                        {iDays > 0 ? <CustomText style={{}} text={'+' + iDays} /> : null}
                    </View>
                    <View style={{ alignItems: 'center',marginTop:5  }}>
                        <CustomText style={{ fontSize: 12, color:Theme.commonFontColor}} text={(Util.Parse.isChinese() ? orderAir.DestinationAirportName : orderAir.DestinationAirport) + ' ' + (orderAir.DestinationAirportTerminal ? orderAir.DestinationAirportTerminal : '')} />
                    </View>
                </View>
            </View>
            </View> 
            <View>
                <View style={{marginTop:10 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <CropImage code={orderAir.Airline} />
                            <View style={{ flexDirection: 'row' }}>
                                <CustomText style={{  fontSize: 12, marginLeft: 5,color:Theme.assistFontColor }} text={orderAir.Airline + orderAir.AirNumber + ' ' } />
                                <CustomText text={'|'} style={{marginLeft:4,fontSize:12, color:Theme.assistFontColor}}/>
                                <CustomText style={{  fontSize: 12, marginLeft: 5,color:Theme.assistFontColor  }} text ={(Util.Parse.isChinese() ? orderAir.AirPlaceName : (orderAir.EnAirPlaceName ? orderAir.EnAirPlaceName : orderAir.AirPlaceName))}></CustomText>
                                <CustomText text={'|'} style={{marginLeft:4,fontSize:12, color:Theme.assistFontColor}}/>
                                <CustomText style={{  fontSize: 12, marginLeft: 5,color:Theme.assistFontColor }} text ={orderAir.AirPlace}></CustomText>
                                <CustomText  style={{ fontSize: 12, marginLeft: 5,color:Theme.assistFontColor  }} text={orderAir.Discount > 0 ? DiscountDesc : ''}/>
                                {orderAir.EquipType&&<CustomText style={{ fontSize: 12, marginLeft: 5,color:Theme.assistFontColor  }} text='机型' />}
                                {orderAir.EquipType&&<CustomText style={{ fontSize: 12,color:Theme.assistFontColor  }} text={'：' + orderAir.EquipType} />}
                                <CustomText text={'|'} style={{marginLeft:4,fontSize:12, color:Theme.assistFontColor}}/>
                            </View>
                            {order.SupplierType === 3 ? <CustomText style={{   borderWidth: 1, paddingHorizontal: 1, fontSize: 10, marginLeft: 5 ,color:Theme.assistFontColor,borderColor:Theme.assistFontColor }} onPress={this._baggeShow} text='行李限额' /> : null}
                        </View>
                         <View style={{ marginTop:5 ,flexDirection:"row"}}>
                        {
                           
                            orderAir.ProductCabins&&orderAir.ProductCabins.map((item)=>{
                                return( <CustomText style={styles.xyStyle3} 
                                            text={Util.Parse.isChinese()? item.ProductTag: item.ProductEnTag} 
                                            onPress={()=>{
                                                otwTHis.showAlertView(Util.Parse.isChinese()? item.ProductDesc: item.ProductEnDesc,()=>{
                                                    return ViewUtil.getAlertButton("确定",()=>{
                                                        otwTHis.dismissAlertView();
                                                    })
                                                })
                                            }}
                                />)
                            })
                        }
                        
                       {
                        orderAir.CabinTag ? <TouchableOpacity underlayColor='transparent' onPress={() => {
                            otwTHis.toastMsg(Util.Parse.isChinese()? orderAir.CabinTagDesc:orderAir.CabinEnTagDesc?orderAir.CabinEnTagDesc:orderAir.CabinTagDesc);
                        }}>
                            <CustomText style={{ color: "#fff",backgroundColor:Theme.theme,paddingHorizontal:6,borderRadius:2,fontSize: 11 }} text={Util.Parse.isChinese() ? orderAir.CabinTag : orderAir.CabinEnTag?orderAir.CabinEnTag:orderAir.CabinTag} />
                        </TouchableOpacity> : null
                        }
                        </View>
                    {
                        orderAir.ShareAirline && orderAir.ShareAirNumber ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                                <View style={[{ paddingHorizontal: 4, paddingVertical: 1, backgroundColor: Theme.specialColor2,borderRadius:2 }, styles.center]}>
                                    <CustomText style={{  fontSize: 11,color:'#fff' }} text='共享航班' />
                                </View>
                                <View style={styles.center}>
                                    <CustomText style={{  fontSize: 12, color:Theme.commonFontColor,marginLeft:5 }} text={I18nUtil.translate('实际承运') + '  ' + (Util.Parse.isChinese() ? orderAir.ShareAirlineName : Util.Read.domesticAirlines(orderAir.ShareAirline)) + orderAir.ShareAirline + orderAir.ShareAirNumber} />
                                </View>
                            </View>
                        ) : null
                    }
                </View>
            </View>
        </View>
        )
    }
}

const styles = StyleSheet.create({
    center: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    xyStyle3:{
        borderRadius: 2, 
        color: Theme.orangeColor, 
        paddingHorizontal: 3, 
        fontSize: 11,
        marginRight:4,
        borderWidth:1,
        height:15,
        borderColor:Theme.orangeColor,
        textAlign:'center',
        justifyContent:'center',
        alignItems:'center',
    },
})