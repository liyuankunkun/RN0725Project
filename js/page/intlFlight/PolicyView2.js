import React from 'react';
import {
    View,
    ScrollView,
    Text,
    TouchableHighlight,
    Modal,
    Platform,
} from 'react-native';
import I18nUtil from '../../util/I18nUtil';
import Util from '../../util/Util';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Theme from '../../res/styles/Theme';
import CustomText from '../../custom/CustomText';
import { TitleView }  from '../../custom/HighLight';

/**
 * 退改规则视图
 */
export default class ModifyRulesView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isShow: false,
            modifyPolicy: [],
            baggagePolicy: []
        };
    }

    componentDidMount() {
        const { order, type } = this.props;
        this.setState(processData(order, type));
    }

    show = (order) => {
        const { modifyPolicy, baggagePolicy } = this.state;
        if (order) {
            let model = processData(order, this.props.type);
            model.isShow = true;
            this.setState(model);
        } else {
            this.setState({
                isShow: true
            });
        }
    }

    hide = () => {
        this.setState({
            isShow: false
        });
    }

    render() {
        const { isShow, modifyPolicy, baggagePolicy, price, tax, amount,model } = this.state;
        const { order } = this.props;
        return (
            <Modal visible={isShow} transparent={true} onRequestClose={() => { }}   >
                <View style={{  justifyContent: 'center', backgroundColor: Theme.touMingColor, borderRadius: 5,height: global.screenHeight,justifyContent:'center' }}>
                    <View style={{marginHorizontal:20,height:global.screenHeight/3, backgroundColor: '#fff',marginTop:-70,borderRadius:10,paddingHorizontal:20}}>
                        <View style={{flexDirection:'row',justifyContent:'space-between', marginTop: 20 }}>
                        <CustomText style={{ fontSize: 13 , color:Theme.commonFontColor}} text={' '}/>
                            <CustomText style={{ fontSize: 16 , color:Theme.fontColor}} text={'行李说明'}/>
                            
                            <TouchableHighlight underlayColor='transparent' onPress={this.hide}>
                                <AntDesign name={'close'} size={22} color={Theme.assistFontColor} />
                            </TouchableHighlight>
                        </View>
                        <ScrollView keyboardShouldPersistTaps='handled' showsVerticalScrollIndicator={false}>
                            <View style={{  }}>
                                <TitleView title={'行李说明'} style={{marginLeft: -10}}></TitleView>
                                <View style={{ borderWidth:1,borderColor:Theme.lineColor,padding:10 }}>
                                {
                                    baggagePolicy.map((baggage,index)=>{
                                        let a = baggage.split('-')[0]
                                        let b = baggage.split('-')[1]
                                        let c = baggage.split('-')[2]
                                        let aa = a.trim()//去空格
                                        let bb = b.trim()
                                        return(
                                            <View style={{  }}>
                                                <View style={{flexDirection:'row'}}>
                                                <CustomText style={{ fontSize: 13 , color:Theme.commonFontColor}} text={aa}/>
                                                <CustomText style={{ fontSize: 13 , color:Theme.commonFontColor}} text={' - '}/>
                                                <CustomText style={{ fontSize: 13 , color:Theme.commonFontColor}} text={bb}/>
                                                <CustomText style={{ fontSize: 13 , color:Theme.commonFontColor}} text={': '}/>
                                                </View>
                                                <CustomText style={{ fontSize: 13 , color:Theme.commonFontColor}} text={c}/>
                                            
                                            </View>
                                        )
                                    })
                                }
                                </View>
                                <CustomText text='行李额以航司为准' style={{  fontSize: 12,color:Theme.assistFontColor }} />
                            </View>
                            <View style={{height:20}}></View>
                        </ScrollView>
                    </View>
                </View>
            </Modal >
        );
    }
}

const processData = (order, type) => {
    let model = {
        price: 0,
        tax: 0,
        amount: 0,
        baggagePolicy: [],
        modifyPolicy: []
    };
    if (!order) {
        return model;
    }
    if (type === 'morePrice') {
        model.price = order.BasePrice;
        model.tax = order.Tax;
        //退改签
        let policy = order?.IntlFlightRules?.map((item, index) => (
            {
                name: index === 0 ? I18nUtil.translate('行程') + '：\r\n' : I18nUtil.translate('行程') + '：\r\n',
                intro: item.Intro ? item.Intro : '请联系客服'
            }
        ));
        if (policy && policy.length > 0) {
            model.modifyPolicy = policy;
        }
        //行李说明
        if (order.OWFlights && order.OWFlights.FlightSegments) {
            order.OWFlights.FlightSegments.forEach(item => {
                model.baggagePolicy.push(_getBaggage(item, type));
            });
        }
        if (order.RTFlights && order.RTFlights.FlightSegments) {
            order.RTFlights.FlightSegments.forEach(item => {
                model.baggagePolicy.push(_getBaggage(item, type));
            });
        }
        model.amount = model.price + model.tax;
        return model;
    } else if (type === 'createOrder') {
        model.price = order.BasePrice;
        model.tax = order.Tax;
        model.amount = model.price + model.tax;
    } else {
        if (order.OrderType === 2 && order.ReissueInfo) {
            model.price = order.ReissueInfo.PriceDiff;
            model.tax = order.ReissueInfo.TaxDiff;
        } else if (order.OrderType === 3 && order.RefundInfo) {
            model.price = order.RefundInfo.Price * -1;
            model.tax = order.RefundInfo.Tax * -1;
        } else {
            if (Array.isArray(order.PriceList) && order.PriceList.length > 0) {
                model.price = order.PriceList[0].Price;
                model.tax = order.PriceList[0].Tax;
            }
        }

        model.amount = order.Amount;
    }
    if (order.AirList && order.AirList.length > 0) {
        order.AirList.forEach(flight => {
            model.baggagePolicy.push(_getBaggage(flight, type));
            let index = model.modifyPolicy.findIndex(p => (p.RouteType === flight.RouteType));
            if (index === -1) {
                let modifyIntro = flight.ModifyPolicy && flight.ModifyPolicy.Intro ? flight.ModifyPolicy.Intro : '请联系客服';
                model.modifyPolicy.push({
                    name: flight.RouteType === 22 ? I18nUtil.translate('行程') + '：\r\n' : I18nUtil.translate('行程') + '：\r\n',
                    RouteType: flight.RouteType,
                    intro: modifyIntro
                });
            }
        });
    }
    return model;
}

const processData2 = (order, type) => {
    let model = {
        price: 0,
        tax: 0,
        amount: 0,
        baggagePolicy: [],
        modifyPolicy: []
    };
    if (!order) {
        return model;
    }
    if (type === 'morePrice') {
        model.price = order.BasePrice;
        model.tax = order.Tax;
        //退改签
        let policy = order.ModifyPolicy.map((item, index) => (
            {
                name: index === 0 ? I18nUtil.translate('行程') + '：\r\n' : I18nUtil.translate('行程') + '：\r\n',
                intro: item.Intro && item.Intro ? item.Intro.replace(/[\r\n]/g, '') : '请联系客服'
            }
        ));
        if (policy && policy.length > 0) {
            model.modifyPolicy = policy;
        }
        //行李说明
        if (order.OWFlights && order.OWFlights.Flights) {
            order.OWFlights.Flights.forEach(item => {
                model.baggagePolicy.push(_getBaggage(item, type));
            });
        }
        if (order.RTFlights && order.RTFlights.Flights) {
            order.RTFlights.Flights.forEach(item => {
                model.baggagePolicy.push(_getBaggage(item, type));
            });
        }
        model.amount = model.price + model.tax;
        return model;
    } else if (type === 'createOrder') {
        model.price = order.BasePrice;
        model.tax = order.Tax;
        model.amount = model.price + model.tax;
    } else {
        if (order.OrderType === 2 && order.ReissueInfo) {
            model.price = order.ReissueInfo.PriceDiff;
            model.tax = order.ReissueInfo.TaxDiff;
        } else if (order.OrderType === 3 && order.RefundInfo) {
            model.price = order.RefundInfo.Price * -1;
            model.tax = order.RefundInfo.Tax * -1;
        } else {
            if (Array.isArray(order.PriceList) && order.PriceList.length > 0) {
                model.price = order.PriceList[0].Price;
                model.tax = order.PriceList[0].Tax;
            }
        }

        model.amount = order.Amount;
    }
    if (order.AirList && order.AirList.length > 0) {
        order.AirList.forEach(flight => {
            if (order.AirportCities && order.AirportCities.length > 0) {
                order.AirportCities.forEach((item, index) => {
                    if (item.CityName === flight.Departure) {
                        flight.DepartureEname = item.CityEnName;
                    }
                    if (item.CityName === flight.Destination) {
                        flight.DestinationEname = item.CityEnName;
                    }
                })
            }
            model.baggagePolicy.push(_getBaggage(flight));
            let index = model.modifyPolicy.findIndex(p => (p.RouteType === flight.RouteType));
            if (index === -1) {
                let modifyIntro = flight.ModifyPolicy && flight.ModifyPolicy.Intro ? flight.ModifyPolicy.Intro.replace(/[\r\n]/g, '') : '请联系客服';
                model.modifyPolicy.push({
                    name: flight.RouteType === 22 ? I18nUtil.translate('行程') + '：\r\n' : I18nUtil.translate('行程') + '：\r\n',
                    RouteType: flight.RouteType,
                    intro: modifyIntro
                });
            }
        });
    }
    return model;
}

/**
 * 获取行李说明
 */
const _getBaggage = (flight, type) => {
    let baggageDesc = null;
    let Baggage = null;
    if (type === 'morePrice') {
        Baggage = flight.ExInfos[0].Baggage;
    } else {
        Baggage = flight.BaggagePolicy;
    }
    if (Baggage) {
        baggageDesc = Baggage.Intro;
        if (!Util.Parse.isChinese()) {
            baggageDesc = baggageDesc.replace('千克', ' KG');
            baggageDesc = baggageDesc.replace('件', ' piece');
        }
    } else {
        baggageDesc = I18nUtil.translate('暂无');
    }
    if (type === 'morePrice') {
        return Util.Parse.isChinese()?`${flight.DepartureCityName}-${flight.ArrivalCityName}-${baggageDesc}`: `${flight.DepartureCityCode}-${flight.ArrivalCityCode}-${baggageDesc}`;
    }
    return Util.Parse.isChinese()?`${flight.Departure} - ${flight.Destination}-${baggageDesc}`: `${flight.DepartureCode} - ${flight.DestinationCode}-${baggageDesc}`;
}