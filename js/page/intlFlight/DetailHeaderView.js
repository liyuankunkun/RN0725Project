import React from 'react';
import {
    View,
    TouchableHighlight,
    Text,
    Image,
    TouchableOpacity,
    ImageBackground
} from 'react-native';
import PropTypes from 'prop-types';
import Util from '../../util/Util';
import Theme from '../../res/styles/Theme';
import CustomText from '../../custom/CustomText';
import Ionicons from 'react-native-vector-icons/Ionicons';
import I18nUtil from '../../util/I18nUtil';
import CropImage from '../../custom/CropImage';
import AntDesign from 'react-native-vector-icons/AntDesign';

export default class DetailHeaderView extends React.Component {

    _modifyRules = () => {
        const { otwThis, order } = this.props;
        otwThis.ruleView.show(order && order.OrderAir);
    }
    _modifyRules2 = () => {
        const { otwThis, order } = this.props;
        otwThis.ruleView2.show(order && order.OrderAir);
    }
    static propTypes = {
        order: PropTypes.object.isRequired,
        showRules:PropTypes.func.isRequired
    }
    constructor(props) {
        super(props);
        this.state = {}
    }
     /**
     * 渲染订单详情
     */
    _renderFlightDetail = (flight, index, isFrom) => {
        if (!flight) {
            return null;
        }
        let shareTxt = '';
        if (flight.ShareAirlineCode && flight.ShareAirlineNumber) {
            // shareTxt = `实际共享航班 ${flight.ShareAirlineName} ${flight.ShareAirlineCode}${flight.ShareAirlineNumber}`;
            shareFlightDesc = I18nUtil.translate('实际承运') + '  ' + (Util.Parse.isChinese() ? flight.ShareAirlineName : Util.Read.domesticAirlines(flight.ShareAirlineCode)) + flight.ShareAirlineCode + flight.ShareAirlineNumber;
        }
        let stopOverDesc = '';
        if(flight.StopOver && flight.StopOver.length > 0){
            stopOverDesc = flight.StopOver[0] && flight.StopOver[0]["Desc"];
        }
        let diffday = Util.Date.getDiffDay(flight.DepartureTime, flight.DestinationTime);
        return (
            <View key={index} style={{ }}>
                <View style={{ flexDirection: 'row',marginTop:15, marginBottom:20 }}>
                    <View style={{ flex: 1 }}>
                        <Text allowFontScaling={false} style={{ fontSize: 12,color:Theme.assistFontColor }}>{flight.DepartureTime && flight.DepartureTime.format('MM-dd')} {flight.DepartureTime && flight.DepartureTime.getWeek()}</Text>
                        <Text allowFontScaling={false} style={{ fontSize: 24,color:Theme.fontColor,marginTop:5,fontWeight:'bold' }}>{flight.DepartureTime && flight.DepartureTime.format('HH:mm')}</Text>
                        <Text allowFontScaling={false} style={{ fontSize: 12,color:Theme.commonFontColor,marginTop:5}}>{Util.Parse.isChinese() ? flight.DepartureAirportName : flight.DepartureAirport}</Text>
                    </View>
                    <View style={{alignItems:'center',justifyContent:'center'}}>
                        <Text allowFontScaling={false} style={{ fontSize: 12 }}>{flight.Duration}</Text>
                        <Image style={{width:60,height:3 }} source={require('../../res/Uimage/compDetailIcon/arrowIcon.png')} />
                    </View>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        <Text allowFontScaling={false} style={{ fontSize: 12,color:Theme.assistFontColor }}>{flight.DestinationTime && flight.DestinationTime.format('MM-dd')} {flight.DestinationTime && flight.DestinationTime.getWeek()}</Text>
                        <View style={{flexDirection:'row'}}>
                        <Text allowFontScaling={false} style={{ fontSize: 24,color:Theme.fontColor,marginTop:5,fontWeight:'bold'   }}>{flight.DestinationTime && flight.DestinationTime.format('HH:mm')}</Text>
                        {
                            diffday > 0 ?
                                <CustomText style={{ marginRight: -11, fontSize: 10, marginLeft: 3 }} text={'+' + diffday } />
                            : null
                        }</View>
                        <Text allowFontScaling={false} style={{ fontSize: 12,color:Theme.commonFontColor,marginTop:5}}>{Util.Parse.isChinese() ? flight.DestinationAirportName : flight.DestinationAirport}</Text>
                    </View>
                </View>
                <View style={{flexDirection:'row'}}>
                    <CropImage code={flight.AirlineCode} />
                    <Text allowFontScaling={false} style={{ fontSize:12 , marginBottom:10, color:Theme.commonFontColor}}>
                        {Util.Parse.isChinese() ? flight.AirlineName : ''}{flight.AirlineCode}{flight.AirlineNumber} {flight.EquipTypeDesc}  {Util.Parse.isChinese() ? (flight.CabinName + flight.ServiceCabin) :(flight.CabinCode + flight.ServiceCabin) + ' '} {shareTxt} {stopOverDesc}
                        </Text>
                </View>
            </View>
        );
    }

    _renderFlights = (flights, isFrom) => {
        if (flights && flights.length > 0) {
            return flights.map((item, index) => {
                return this._renderFlightDetail(item, index, isFrom);
            });
        }
        return null;
    }
     /**
     * 渲染价格信息
     */
    _renderPriceInfo = () => {
        const { order } = this.props;
        if (order.OrderType === 2) {
            return (
                <View style={{ marginTop:10}}>
                    <Text allowFontScaling={false} style={{  fontSize: 13 }}>{I18nUtil.translate('改签费')}：¥{order.ReissueInfo.ReissueAmount}</Text>
                </View>
            );
        } else if (order.OrderType === 3) {
            return (
                <View style={{  marginTop:10}}>
                    <Text allowFontScaling={false} style={{  fontSize: 13 }}>{I18nUtil.translate('退票费')}：¥{order.RefundInfo.RefundAmount}</Text>
                </View>
            );
        } 
        // else {
        //     if (Array.isArray(order.PriceList) && order.PriceList.length > 0) {
        //         let priceInfo = order.PriceList.length > 0 ? order.PriceList[0] : {};
        //         return (
        //             <View style={{ justifyContent: 'center' }}>
        //                 <Text allowFontScaling={false} style={{  fontSize: 13 }}>{I18nUtil.translate("机票价")}：¥{priceInfo.Price || '0'}    {I18nUtil.translate('税')}：¥{priceInfo.Tax || '0'}</Text>
        //             </View>
        //         );
        //     }
        //     return null;
        // }
    }
    /**
     * 订单信息
     */
    _orderInfo() {
        const { order } = this.props;
        let Comment = null;
        if (order.ApprovedList && Array.isArray(order.ApprovedList) && order.ApprovedList.length > 0) {
            Comment = order.ApprovedList.find(item => {
                return item.StatusDesc === '不同意';
            })
        }
        return (
            <View style={{  }}>
                {
                    order.ReissueInfo ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop:10  }}>
                            <CustomText style={{ color: Theme.specialColor2, fontSize: 12}} text='改签原因' />
                            <CustomText style={{ color: Theme.specialColor2, fontSize: 12 }} text='：' />
                            <CustomText style={{ color: Theme.specialColor2, fontSize: 12, flex: 1 }} numberOfLines={1} text={order.ReissueInfo.ReasonDesc} />
                        </View>
                    ) : null
                }
                {
                    order.RefundInfo ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center' , marginTop:10}}>
                            <CustomText style={{ color: Theme.specialColor2, fontSize: 12 }} text='退票原因' />
                            <CustomText style={{ color: Theme.specialColor2, fontSize: 12 }} text='：' />
                            <CustomText style={{ color: Theme.specialColor2, fontSize: 12, flex: 1 }} numberOfLines={1} text={order.RefundInfo.ReasonDesc} />
                        </View>
                    ) : null
                }
                {
                    Comment ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center' , marginTop:10}}>
                            <AntDesign name={'infocirlce'} size={16} color={Theme.theme} style={{ marginRight: 2 }} />
                            <CustomText style={{ color: Theme.specialColor2, fontSize: 10 }} text='驳回原因' />
                            <CustomText style={{ color: Theme.specialColor2, fontSize: 10 }} text='：' />
                            <CustomText style={{ color: Theme.annotatedFontColor, fontSize: 10, flex: 1 }} numberOfLines={1} text={Comment.Comment} />
                        </View>
                    ) : null
                }
                {
                    Array.isArray(order.RcReasonLst) && order.RcReasonLst.length > 0 ?
                        this._ruleReasonShow(order.RcReasonLst) 
                    : null
                }
            </View>
        );
    }
    _ruleReasonShow = (list) => {
        if(!list){return}
        let arr = [];
        for (let i = 0; i < list.length; i++) {
            let obj = list[i];
            if (obj.Reason && obj.RuleType == 1) {
                obj.Reason = obj.Reason.replace(' ', '');
                arr.push(
                    <View key={i} style={{ flexDirection: 'row', flex: 1, alignItems: 'center',marginTop:10 }}>
                        <AntDesign name={'infocirlce'} size={14} color={Theme.theme} style={{ marginRight: 2 }} />
                        <CustomText style={{ color: Theme.specialColor2, fontSize: 12 }} text='违反最低价规则原因：' />
                        <CustomText style={{ color: Theme.annotatedFontColor, fontSize: 12, flex: 1 }} numberOfLines={1} text={obj.Reason} />
                    </View>
                )
            }
            if (obj.Reason && obj.RuleType == 2) {
                obj.Reason = obj.Reason.replace(' ', '');
                arr.push(
                    <View key={i} style={{ flexDirection: 'row', marginTop: 5, flex: 1, alignItems: 'center',marginTop:10 }}>
                        <AntDesign name={'infocirlce'} size={14} color={Theme.theme} style={{ marginRight: 2 }} />
                        <CustomText style={{ color: Theme.specialColor2, fontSize: 12 }} text='违反提前预定规则原因：' />
                        <CustomText style={{ color: Theme.annotatedFontColor, fontSize: 12, flex: 1 }} numberOfLines={1} text={obj.Reason} />
                    </View>
                )
            }
            if (obj.Reason && obj.RuleType == 7) {
                obj.Reason = obj.Reason.replace(' ', '');
                arr.push(
                    <View key={i} style={{ flexDirection: 'row', marginTop: 5, flex: 1, alignItems: 'center',marginTop:10 }}>
                        <AntDesign name={'infocirlce'} size={14} color={Theme.theme} style={{ marginRight: 2 }} />
                        <CustomText style={{ color: Theme.specialColor2, fontSize: 12 }} text='违反指定折扣的原因：' />
                        <CustomText style={{ color: Theme.annotatedFontColor, fontSize: 12, flex: 1 }} numberOfLines={1} text={obj.Reason} />
                    </View>
                )
            }
            if (obj.Reason && obj.RuleType == 3) {
                obj.Reason = obj.Reason.replace(' ', '');
                arr.push(
                    <View key={i} style={{ flexDirection: 'row', marginTop: 5, flex: 1, alignItems: 'center',marginTop:10 }}>
                        <AntDesign name={'infocirlce'} size={14} color={Theme.theme} style={{ marginRight: 2 }} />
                        <CustomText style={{ color: Theme.specialColor2, fontSize: 12 }} text='违反指定舱位的原因：' />
                        <CustomText style={{ color: Theme.annotatedFontColor, fontSize: 12, flex: 1 }} numberOfLines={1} text={obj.Reason} />
                    </View>
                )
            }
        }
        return (
            <View>
                {arr}
            </View>
        )
    }

    render() {
        const { order , showRules} = this.props;
        const { owJourney, rtJourney } = order;
        const isChinese = Util.Parse.isChinese();
        return (
            <View style={{ backgroundColor: "#fff", padding: 20, borderRadius:6,marginTop:20 }}>
                <View style={{}}>
                    {
                       owJourney.list&& owJourney.list.length > 0 ? (
                            <View underlayColor='transparent'>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between',flexWrap:'wrap' }}>
                                    <View style={{ flexDirection: 'row',alignItems: 'center' }}>
                                        <View style={{backgroundColor: Theme.specialColor2,alignItems: 'center', justifyContent: 'center',borderRadius:2,paddingHorizontal:2,paddingVertical:1}}>
                                            <CustomText style={{ fontSize: 12, color:'#fff'}} text='去' />
                                        </View>
                                            <Text allowFontScaling={false} style={{ marginLeft: 5, fontSize: 14,color:'#333' }}>{owJourney.DepartureTime && owJourney.DepartureTime.format('MM-dd')} {owJourney.DepartureTime && owJourney.DepartureTime.getWeek()} {isChinese ? '('+owJourney.Departure : '('+owJourney.DepartureEname}-{isChinese ? owJourney.Destination+')' : owJourney.DestinationEname+')'}</Text>
                                    </View>
                                    <View style={{flexDirection:'row'}}>
                                        <CustomText style={{ color: Theme.theme, fontSize: 12 ,textDecorationLine: 'underline',textDecorationStyle:'solid'}} onPress={()=>showRules(1)} text='退改规则' />
                                        <CustomText style={{ color: Theme.theme, fontSize: 12,marginLeft:5, textDecorationLine: 'underline',textDecorationStyle:'solid' }} onPress={()=>showRules(2)} text='行李说明' />
                                    </View>
                                </View>
                            </View>
                        ) : null
                    }
                    {
                        this._renderFlights(owJourney.list, true)
                    }
                    {
                       rtJourney.list && rtJourney.list.length > 0 ? (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1,borderColor: Theme.lineColor,paddingTop:10,flexWrap:'wrap' }}>
                                <View style={{ flexDirection: 'row',alignItems: 'center' }}>
                                    <View style={{ backgroundColor: Theme.specialColor2,alignItems: 'center', justifyContent: 'center',borderRadius:2,paddingHorizontal:2,paddingVertical:1 }}>
                                        <CustomText style={{ fontSize: 12 ,color:'#fff'}} text='回' />
                                    </View>
                                    <Text allowFontScaling={false} style={{ marginLeft: 5, fontSize: 14,color:'#333' }}>{rtJourney.DepartureTime && rtJourney.DepartureTime.format('MM-dd')} {rtJourney.DepartureTime.getWeek()} {isChinese ? '('+rtJourney.Departure : '('+rtJourney.DepartureEname}-{isChinese ? rtJourney.Destination+')' : rtJourney.DestinationEname+')'}</Text>
                                </View>
                                <View style={{flexDirection:'row'}}>
                                        <CustomText style={{ color: Theme.theme, fontSize: 12 ,textDecorationLine: 'underline',textDecorationStyle:'solid'}} onPress={()=>showRules(1)} text='退改规则' />
                                        <CustomText style={{ color: Theme.theme, fontSize: 12,marginLeft:5, textDecorationLine: 'underline',textDecorationStyle:'solid' }} onPress={()=>showRules(2)} text='行李说明' />
                                </View>
                            </View>
                        ) : null
                    }
                    {
                      this._renderFlights(rtJourney.list, false)
                    }
                    <View style={{height:1,backgroundColor: Theme.lineColor}}></View>
                    {this._renderPriceInfo()}
                    {this._orderInfo()}
                </View>
                    
            </View>
        );

    }
}