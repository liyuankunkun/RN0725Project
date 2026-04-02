import React from 'react';
import {
    Modal,
    View,
    Animated,
    StyleSheet,
    ScrollView,
    TouchableHighlight
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomText from '../../../custom/CustomText';
import Theme from '../../../res/styles/Theme';
import Util from '../../../util/Util';
import I18nUtil from '../../../util/I18nUtil';

export default class PayInfoView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            moadlHeight: new Animated.Value(0),
            orderAir: null,
            title: "",
            travellerList: null,
            orderFlight:null,
            orderIntFlight:null,
            orderIntHotel:null,
            orderHotel:null

        }
    }
    /**
     * 
     * @param 标题 title 
     * @param  数据 data 
     */
    show(title, data) {
        if (title === '列车详情') {
            this.state.orderAir = data;
        } else if (title === '乘客信息') {
            this.state.travellerList = data;
        } else if (title ==='航班详情'){
            this.state.orderFlight = data;
        } else if(title ==='国际航班详情'){
            this.state.orderIntFlight = data;
        }else if(title ==='港澳台及国际酒店详情'){
            this.state.orderIntHotel = data;
        }else if(title ==='国内酒店详情'){
            this.state.orderHotel = data;
        }
        this.setState({
            title,
            visible: true
        }, () => {
            Animated.parallel([
                Animated.timing(this.state.moadlHeight, {
                    toValue: screenHeight * 0.65,
                    duration: 200,
                    useNativeDriver: false
                }),
            ]).start();
        })
    }
    _dismiss = () => {
        Animated.timing(this.state.moadlHeight, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false
        }).start(() => {
            this.setState({
                visible: false,
                orderAir: null,
                title: '',
                travellerList: null,
            })
        });
    }
    /**
     *  航班信息
     */
     _renderOrderFlight = () => {
        const { orderFlight } = this.state;
        if (!orderFlight) return null;
        orderFlight.DepartureTime = Util.Date.toDate(orderFlight.DepartureTime);
        orderFlight.DestinationTime = Util.Date.toDate(orderFlight.DestinationTime);
        let isChinese = Util.Parse.isChinese();
        let refundRule = '';
        if (orderFlight.RefundRules && orderFlight.RefundRules.length > 0) {
            orderFlight.RefundRules.forEach(item => {
                refundRule += item.rule_description;
            })
        }
        if (!refundRule) {
            refundRule = I18nUtil.translate('请联系客服') + I18nUtil.translate('电话') + '021-22111889';
        }
        let changeRule = '';
        if (orderFlight.ReissueRules && orderFlight.ReissueRules.length > 0) {
            orderFlight.ReissueRules.forEach(item => {
                changeRule += item.rule_description;
            })
        }
        if (!changeRule) {
            changeRule = I18nUtil.translate('请联系客服') + I18nUtil.translate('电话') + '021-22111889';
        }
        return (
            <View>
                <View style={{ paddingHorizontal: 10 }}>
                    <CustomText text={orderFlight.Departure + '--' + orderFlight.Destination} />
                    <View style={{ marginLeft: 20 }}>
                        <CustomText text={orderFlight.DepartureTime.format('yyyy/MM/dd') + ' ' + orderFlight.DepartureTime.getWeek()} style={{ marginTop: 5 }} />
                        <CustomText text={(isChinese ? orderFlight.AirlineName : '') + ' ' + orderFlight.Airline + orderFlight.AirNumber + (isChinese ? orderFlight.AirPlaceName : orderFlight.EnAirPlaceName) + ' ' + orderFlight.DiscountDesc} style={{ marginTop: 5 }} />
                        <CustomText text={orderFlight.DepartureTime.format('HH:mm') + (isChinese ? orderFlight.DepartureAirportName : orderFlight.DepartureAirport) + (orderFlight.DepartureAirportTerminal ? orderFlight.DepartureAirportTerminal : '')} style={{ marginTop: 5 }} />
                        <CustomText text={orderFlight.DestinationTime.format('HH:mm') + (isChinese ? orderFlight.DestinationAirportName : orderFlight.DestinationAirport) + ' ' + (orderFlight.DestinationAirportTerminal ? orderFlight.DestinationAirportTerminal : '')} style={{ marginTop: 5 }} />
                    </View>
                </View>
                <View style={{ paddingHorizontal: 10, paddingVertical: 10 }}>
                    <CustomText text='退改规则' />
                    <View style={{ marginLeft: 20 }}>
                        <CustomText text ={'退票规则'}  style={{ marginTop: 5 }}/>
                        <CustomText text={refundRule} style={{ marginTop: 5 }} />
                        <CustomText text ={'改签规则'}  style={{ marginTop: 5 }}/>
                        <CustomText text={changeRule} style={{ marginTop: 5 }} />
                    </View>
                </View>
            </View>
        )
    }
    /**
     *  国际航班信息
     */
     _renderOrderInfFlight = () => {
        const { orderIntFlight} = this.state;
        if (!orderIntFlight) return null;
        return (
            <View>
            {
                orderIntFlight.map((item)=>{
                    item.DepartureTime = Util.Date.toDate(item.DepartureTime);
                    item.DestinationTime = Util.Date.toDate(item.DestinationTime);
                    let isChinese = Util.Parse.isChinese();
                    let refundRule = '';
                    if (item.RefundRules && item.RefundRules.length > 0) {
                        item.RefundRules.forEach(item => {
                            refundRule += item.rule_description;
                        })
                    }
                    if (!refundRule) {
                        refundRule = I18nUtil.translate('请联系客服') + I18nUtil.translate('电话') + '021-22111889';
                    }
                    let changeRule = '';
                    if (item.ReissueRules && item.ReissueRules.length > 0) {
                        item.ReissueRules.forEach(item => {
                            changeRule += item.rule_description;
                        })
                    }
                    if (!changeRule) {
                        changeRule = I18nUtil.translate('请联系客服') + I18nUtil.translate('电话') + '021-22111889';
                    }
                    return(
                        <View>
                            <View style={{ paddingHorizontal: 10 }}>
                                <CustomText text={item.Departure + '--' + item.Destination} />
                                <View style={{ marginLeft: 20 }}>
                                    <CustomText text={item.DepartureTime.format('yyyy/MM/dd') + ' ' + item.DepartureTime.getWeek() +' '+ item.RouteTypeDesc} style={{ marginTop: 5 }} />
                                    <CustomText text={(isChinese ? item.AirlineName : '') + ' ' + item.AirlineCode + item.AirlineNumber +  ' ' +item.CabinName + item.ServiceCabin} style={{ marginTop: 5 }} />
                                    <CustomText text={item.DepartureTime.format('HH:mm') + (isChinese ? item.DepartureAirportName : item.DepartureAirport) + (item.DepartureAirportTerminal ? item.DepartureAirportTerminal : '')} style={{ marginTop: 5 }} />
                                    <CustomText text={item.DestinationTime.format('HH:mm') + (isChinese ? item.DestinationAirportName : item.DestinationAirport) + ' ' + (item.DestinationAirportTerminal ? item.DestinationAirportTerminal : '')} style={{ marginTop: 5 }} />
                                </View>
                            </View>
                            {/* <View style={{ paddingHorizontal: 10, paddingVertical: 10 }}>
                                <CustomText text='退改规则' />
                                <View style={{ marginLeft: 20 }}>
                                    <CustomText text ={'退票规则'}  style={{ marginTop: 5 }}/>
                                    <CustomText text={refundRule} style={{ marginTop: 5 }} />
                                    <CustomText text ={'改签规则'}  style={{ marginTop: 5 }}/>
                                    <CustomText text={changeRule} style={{ marginTop: 5 }} />
                                </View>
                            </View> */}
                        </View>
                    )
                }) 
            }
            </View>
        )
    }
    /**
     *  列车信息
     */
    _renderOrderAir = () => {
        const { orderAir } = this.state;
        if (!orderAir) return null;
        orderAir.DepartureTime = Util.Date.toDate(orderAir.DepartureTime);
        orderAir.DestinationTime = Util.Date.toDate(orderAir.DestinationTime);
        return (
            <View>
                <View style={{ paddingHorizontal: 10 }}>
                    <CustomText text={orderAir.FromStationName + '--' + orderAir.ToStationName} />
                    <View style={{ marginLeft: 20 }}>
                        <CustomText text={orderAir.DepartureTime.format('yyyy/MM/dd') + ' ' + orderAir.DepartureTime.getWeek()} style={{ marginTop: 5 }} />
                        <CustomText text={orderAir.Checi + ' ' + orderAir.Zwname} style={{ marginTop: 5 }} />
                    </View>
                </View>

            </View>
        )
    }
    /**
     * 港澳台及国际酒店
     */
    _renderOrderInfHotel=()=>{
        const { orderIntHotel } = this.state;
        if (!orderIntHotel) return null;
        orderIntHotel.DepartureTime = Util.Date.toDate(orderIntHotel.CheckInDate);
        orderIntHotel.DestinationTime = Util.Date.toDate(orderIntHotel.CheckOutDate);
        return (
            <View>
                <View style={{ paddingHorizontal: 10 }}>
                    <CustomText text={orderIntHotel.Hotel.HotelName} />
                    <View style={{ marginLeft: 20 }}>
                        <CustomText text={orderIntHotel.DepartureTime.format('yyyy/MM/dd') + ' ' + orderIntHotel.DepartureTime.getWeek()} style={{ marginTop: 5 }} />
                        <CustomText text={orderIntHotel.RatePlan.PlanName+orderIntHotel.RatePlan.BedName} style={{ marginTop: 5 }} />
                    </View>
                </View>

            </View>
        )
    }
    /**
     * 国内酒店
     */
     _renderOrderHotel=()=>{
        const { orderHotel } = this.state;
        if (!orderHotel) return null;
        orderHotel.DepartureTime = Util.Date.toDate(orderHotel.CheckInDate);
        orderHotel.DestinationTime = Util.Date.toDate(orderHotel.CheckOutDate);
        return (
            <View>
                <View style={{ paddingHorizontal: 10 }}>
                    <CustomText text={orderHotel.Hotel.Name} />
                    <View style={{ marginLeft: 20 }}>
                        <CustomText text={orderHotel.DepartureTime.format('yyyy/MM/dd') + ' ' + orderHotel.DepartureTime.getWeek()} style={{ marginTop: 5 }} />
                        <CustomText text={orderHotel.RatePlan.RatePlanName} style={{ marginTop: 5 }} />
                    </View>
                </View>

            </View>
        )
    }
    /**
     *  c乘客信息
     */
    _passenerInfo = () => {
        const { travellerList } = this.state;
        if (!travellerList) return null;
        return (
            <View>
                {!Array.isArray(travellerList)?
                    <View style={{ paddingHorizontal: 10, paddingVertical: 10 }}>
                        <CustomText text={travellerList.Name + ' ' + travellerList.Mobile} style={{ marginTop: 5 }} />
                        <CustomText text={travellerList.Credentials ? (travellerList.Credentials.TypeDesc + ' ' + Util.Read.simpleReplace(travellerList.Credentials.SerialNumber)) : ''} style={{ marginTop: 5 }} />
                    </View>
                :
                    travellerList.map((item, index) => {
                        // let OrderPassenger = item.OrderPassenger;
                        return (
                            <View key={index} style={{ paddingHorizontal: 10, paddingVertical: 10 }}>
                                <CustomText text={item.Name + ' ' + item.Mobile} style={{ marginTop: 5 }} />
                                <CustomText text={item.Certificates ? (item.Certificates[0].TypeDesc + ' ' + Util.Read.simpleReplace(item.Certificates[0].SerialNumber)) : ''} style={{ marginTop: 5 }} />
                            </View>
                        )
                    })
                }
            </View>
        )
    }
  
    render() {
        const { visible, moadlHeight, title } = this.state;

        return (
            <Modal transparent visible={visible}>
                <Animated.View style={[styles.view]}>
                    <Animated.View style={[styles.AnimatedView, { height: moadlHeight }]}>
                        <View style={styles.headerView}>
                            <CustomText />
                            <CustomText text={title} style={{ fontSize: 18 }} />
                            <TouchableHighlight underlayColor='transparent' onPress={this._dismiss}>
                                <Ionicons name={'ios-close-circle-outline'} size={28} color={Theme.darkColor} />
                            </TouchableHighlight>
                        </View>
                        <ScrollView>
                            {/* 火车 */}
                            {title === '列车详情'?this._renderOrderAir():null}
                            {/* 飞机 */}
                            {title ==='航班详情'?this._renderOrderFlight():null}
                            {/* 国际飞机 */}
                            {title ==='国际航班详情'?this._renderOrderInfFlight():null}
                            {/* 港澳台及国际酒店 */}
                            {title ==='港澳台及国际酒店详情'?this._renderOrderInfHotel():null}
                            {/* 国内酒店 */}
                            {title ==='国内酒店详情'?this._renderOrderHotel():null}
                            {/* 人员信息 */}
                            {title === '乘客信息'?this._passenerInfo():null}

                        </ScrollView>

                    </Animated.View>
                </Animated.View>
            </Modal>
        )
    }
}
const styles = StyleSheet.create({
    view: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        flex: 1,
        justifyContent: 'flex-end',
    },
    AnimatedView: {
        backgroundColor: 'white'
    },
    headerView: {
        flexDirection: 'row',
        padding: 10,
        alignItems: 'center',
        justifyContent: "space-between"
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    }
})
