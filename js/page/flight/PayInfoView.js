import React from 'react';
import {
    Modal,
    View,
    Animated,
    StyleSheet,
    ScrollView,
    TouchableHighlight,
    Image
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomText from '../../custom/CustomText';
import Theme from '../../res/styles/Theme';
import Util from '../../util/Util';
import PropTypes from 'prop-types';
import I18nUtil from '../../util/I18nUtil';
import {TitleView,TitleView2} from '../../custom/HighLight';
export default class PayInfoView extends React.Component {

    static propTypes = {
        customerInfo: PropTypes.object.isRequired
    }


    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            moadlHeight: new Animated.Value(0),
            orderAir: null,
            title: "",
            travellerList: null,
            priceInfo: null
        }
    }
    /**
     * 
     * @param 标题 title 
     * @param  数据 data 
     */
    show(title, data) {
        if (title === '航班详情') {
            this.state.orderAir = data;
        } else if (title === '乘客信息') {
            this.state.travellerList = data;
        } else if (title === '价格信息') {
            this.state.priceInfo = data;
        }
        this.setState({
            title,
            visible: true
        }, () => {
            Animated.parallel([
                Animated.timing(this.state.moadlHeight, {
                    toValue: screenHeight * 0.65,
                    duration: 200
                }),
            ]).start();
        })
    }
    _dismiss = () => {
        Animated.timing(this.state.moadlHeight, {
            toValue: 0,
            duration: 200
        }).start(() => {
            this.setState({
                visible: false,
                orderAir: null,
                title: '',
                travellerList: null,
                priceInfo: null
            })
        });
    }
    /**
     *  航班信息
     */
    _renderOrderAir = () => {
        const { orderAir } = this.state;
        if (!orderAir) return null;
        orderAir.DepartureTime = Util.Date.toDate(orderAir.DepartureTime);
        orderAir.DestinationTime = Util.Date.toDate(orderAir.DestinationTime);
        let isChinese = Util.Parse.isChinese();
        let refundRule = '';
        if (orderAir.RefundRules && orderAir.RefundRules.length > 0) {
            orderAir.RefundRules.forEach(item => {
                refundRule += item.rule_description;
            })
        }
        if (!refundRule) {
            refundRule = I18nUtil.translate('请联系客服') + I18nUtil.translate('电话') + '021-22111889';
        }
        let changeRule = '';
        if (orderAir.ReissueRules && orderAir.ReissueRules.length > 0) {
            orderAir.ReissueRules.forEach(item => {
                changeRule += item.rule_description;
            })
        }
        if (!changeRule) {
            changeRule = I18nUtil.translate('请联系客服') + I18nUtil.translate('电话') + '021-22111889';
        }
        return (
            <View>
                <View style={{marginHorizontal:15,marginTop:10 }}>
                    <View style={{flexDirection:'row', justifyContent:'space-between',alignItems: 'center',}}>
                    <TitleView2 title={orderAir.Departure + '-' + orderAir.Destination}></TitleView2>
                    <CustomText text={orderAir.DepartureTime.format('yyyy/MM/dd') + ' ' + orderAir.DepartureTime.getWeek()} style={{ marginTop: 5 }} />
                    </View>
                    <View style={{ flexDirection: 'row', padding: 20, justifyContent:'space-between',backgroundColor:Theme.lineColor2,borderRadius:4,marginTop:10 }}>
                        <View>
                            <View style={{ alignItems: 'center' }}>
                                <CustomText style={{ fontSize: 26, fontWeight:'bold'}} text={orderAir.DepartureTime && orderAir.DepartureTime.format('HH:mm')} />
                            </View>
                            <View style={{ alignItems: 'flex-start',marginTop:5 }}>
                                <CustomText style={{ fontSize: 12, color:Theme.commonFontColor}} text={(Util.Parse.isChinese() ? orderAir.DepartureAirportName : orderAir.DepartureAirport) + ' ' + (orderAir.DepartureAirportTerminal ? orderAir.DepartureAirportTerminal : '')} />
                            </View>
                        </View>
                        <View style={{alignItems: 'center',justifyContent: 'center'}}>
                            {/* <CustomText text={hour+minute} style={{fontSize:11,paddingTop:3,color:Theme.assistFontColor}}/> */}
                            <Image source={require('../../res/Uimage/compDetailIcon/arrowIcon.png')} style={{width:60,height:3}}></Image>
                        </View>
                        <View style={{alignItems: 'flex-end' }}>
                            <View style={{ justifyContent: 'center', flexDirection: 'row' }}>
                                <CustomText style={{ fontSize: 26, fontWeight:'bold'}} text={orderAir.DestinationTime && orderAir.DestinationTime.format('HH:mm')} />
                                {/* {iDays > 0 ? <CustomText style={{}} text={'+' + iDays} /> : null} */}
                            </View>
                            <View style={{ alignItems: 'center',marginTop:5  }}>
                                <CustomText style={{ fontSize: 12, color:Theme.commonFontColor}} text={(Util.Parse.isChinese() ? orderAir.DestinationAirportName : orderAir.DestinationAirport) + ' ' + (orderAir.DestinationAirportTerminal ? orderAir.DestinationAirportTerminal : '')} />
                            </View>
                        </View>
                      </View>
                   </View>
                <View style={{ paddingHorizontal: 15, paddingVertical: 10 }}>
                    <TitleView2 title='退改规则'></TitleView2>
                    <View style={{ marginLeft: 15 }}>
                        <CustomText text ={'退票规则'}  style={{ marginTop: 5 }}/>
                        <CustomText text={refundRule} style={{ marginTop: 5,color:Theme.assistFontColor }} />
                        <CustomText text ={'改签规则'}  style={{ marginTop: 5 }}/>
                        <CustomText text={changeRule} style={{ marginTop: 5 ,color:Theme.assistFontColor}} />
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
                {
                    travellerList.map((item, index) => {
                        return (
                            <View key={index} style={{ padding: 20, paddingVertical: 10,marginHorizontal:10,backgroundColor:Theme.lineColor2,marginTop:10,borderRadius:6 }}>
                                <CustomText text={item.Name + ' ' + item.Mobile} style={{ marginTop: 5 }} />
                                <CustomText text={item.Certificate ? (item.Certificate.TypeDesc + ' ' + Util.Read.simpleReplace(item.Certificate.SerialNumber)) : ''} style={{ marginTop: 5,color:Theme.assistFontColor }} />
                            </View>
                        )
                    })
                }
            </View>
        )
    }
    /**
     *  价格信息
     */
    _priceInfo = () => {
        const { customerInfo } = this.props;
        const { priceInfo } = this.state;
        if (!priceInfo) return null;
        let serviceCharge = 0;
        let price = 0;
        let tax = 0;

        let ReissueAmount = 0;
        let postFree = 0;
        let Reissueprice = 0;
        let Reissuetax = 0;
        let InsurancePrice = 0;


        //计算服务费用
        if(priceInfo.Addition && priceInfo.Addition.Status === 12){
            Reissueprice += priceInfo.Addition.ReissueInfo.PriceDiff;
            Reissuetax = priceInfo.Addition.ReissueInfo.TaxDiff;
            ReissueAmount = priceInfo.Addition.ReissueInfo.ReissueAmount;
                serviceCharge += priceInfo.Addition.ServiceCharge;
        }else{
            if (priceInfo.Addition && priceInfo.Addition.OrderList) {
                priceInfo.Addition.OrderList.forEach(item => {
                        serviceCharge += item.ServiceCharge;
                    if (item.ReissueInfo) {
                        Reissueprice += item.ReissueInfo.PriceDiff;
                        Reissuetax = item.ReissueInfo.TaxDiff;
                        ReissueAmount = item.ReissueInfo.ReissueAmount;
                    } else {
                        const { Price = 0, Tax = 0 } = item || {};
                        price += Price;
                        tax += Tax;
                    }
                })
            }
        }
     
        if (priceInfo.Addition && priceInfo.Addition.MailingMethod === 2 && priceInfo.Addition.MailingInfo) {
            postFree = priceInfo.Addition.MailingInfo.PostFee;
        }

        if (priceInfo.Addition && priceInfo.Addition.TravellerList) {
            priceInfo.Addition.TravellerList.forEach(item => {
                if (item.Insurances) {
                    item.Insurances.forEach(obj => {
                        InsurancePrice += obj.Amount;
                    })
                }
            })
        }


        return (
            <View style={{ paddingHorizontal: 20, paddingVertical: 10,marginHorizontal:10,marginTop:10,backgroundColor:Theme.lineColor2,borderRadius:6 }}>
                {
                    Reissueprice > 0 ?

                        <View style={styles.row}>
                            <CustomText text='票面差' style={{ marginTop: 5 }} />
                            <CustomText text={'¥' + Reissueprice} style={{ marginTop: 5, color: Theme.theme }} />
                        </View>
                        : null
                }
                {
                    Reissuetax > 0 ?
                        <View style={styles.row}>
                            <CustomText text='税差' style={{ marginTop: 5 }} />
                            <CustomText text={'¥' + Reissuetax} style={{ marginTop: 5, color: Theme.theme }} />
                        </View>
                        : null
                }
                {
                    ReissueAmount > 0 ?
                        <View style={styles.row}>
                            <CustomText text='改签费' style={{ marginTop: 5 }} />
                            <CustomText text={'¥' + ReissueAmount} style={{ marginTop: 5, color: Theme.theme }} />
                        </View>
                        : null
                }
                {
                    price > 0 ?
                        <View style={styles.row}>
                            <CustomText text='票面' style={{ marginTop: 5 }} />
                            <CustomText text={'¥' + price.toFixed(2)} style={{ marginTop: 5, color: Theme.theme }} />
                        </View>
                        : null
                }
                  {
                    InsurancePrice > 0 ?
                        <View style={styles.row}>
                            <CustomText text='保险' style={{ marginTop: 5 }} />
                            <CustomText text={'¥' + InsurancePrice} style={{ marginTop: 5, color: Theme.theme }} />
                        </View>
                        : null
                }
                {
                    tax > 0 ?
                        <View style={styles.row}>
                            <CustomText text='税' style={{ marginTop: 5 }} />
                            <CustomText text={'¥' + tax} style={{ marginTop: 5, color: Theme.theme }} />
                        </View>
                        : null
                }
                {
                    serviceCharge > 0 && priceInfo.IsShowServiceFee ?
                        <View style={styles.row}>
                            <CustomText text='服务费' style={{ marginTop: 5 }} />
                            <CustomText text={'¥' + serviceCharge.toFixed(2)} style={{ marginTop: 5, color: Theme.theme }} />
                        </View>
                        : null
                }
                {
                    postFree > 0 ?
                        <View style={styles.row}>
                            <CustomText text='邮寄费' style={{ marginTop: 5 }} />
                            <CustomText text={'¥' + postFree} style={{ marginTop: 5, color: Theme.theme }} />
                        </View>
                        : null
                }
    
                {
                    priceInfo.Addition && priceInfo.Addition.TravellerList ?
                        <View style={styles.row}>
                            <CustomText text='人数' style={{ marginTop: 5 }} />
                            <CustomText text={priceInfo.Addition.TravellerList.length} style={{ marginTop: 5, color: Theme.theme}} />
                        </View>
                        : null
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
                            <CustomText text={title} style={{ fontSize: 16 }} />
                            <TouchableHighlight underlayColor='transparent' onPress={this._dismiss}>
                                <Ionicons name={'ios-close-circle-outline'} size={24} color={Theme.darkColor} />
                            </TouchableHighlight>
                        </View>
                        <ScrollView keyboardShouldPersistTaps='handled'>
                            {this._renderOrderAir()}
                            {this._passenerInfo()}
                            {this._priceInfo()}
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
        justifyContent: "space-between",
        borderBottomWidth:1,
        borderColor:Theme.lineColor,
        paddingHorizontal:20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    }
})