import React from 'react';

import {
    View,
    Image,
    StyleSheet,
    TouchableOpacity,
    Text
} from 'react-native';
import PropTypes from 'prop-types';
import I18nUtil from '../../util/I18nUtil';
import Util from '../../util/Util';
import CustomText from '../../custom/CustomText';
import Theme from '../../res/styles/Theme';
import CropImage from '../../custom/CropImage';
import FlightService from '../../service/FlightService';
import Foundation from 'react-native-vector-icons/Foundation';

export default class LowPriceView extends React.PureComponent {

    static propTypes = {
        lowThis: PropTypes.object.isRequired,
        section: PropTypes.object.isRequired,
        oldModel: PropTypes.object.isRequired,
        currentLowPrice: PropTypes.number.isRequired
    }

    _getFlightStopInfo = (data) => {
        const { lowThis } = this.props;
        if (data.FlightStopInfo) {
            let stopInfo = data.FlightStopInfo;
            lowThis.showAlertView(`${I18nUtil.translate('经停')} ${I18nUtil.translate(stopInfo.CityName)}， ${I18nUtil.translate('到达')} ${stopInfo.ArrivalTime}，${stopInfo.DepartureTime}${I18nUtil.translate('出发')}，${I18nUtil.translate('停留')}${stopInfo.Duration}`);
            return;
        }
        lowThis.showLoadingView();
        let model = {
            FlightNo: data.fltInfo.codeShareLine ? (data.fltInfo.codeShareLine + data.fltInfo.codeShareFltNo) : (data.fltInfo.airline + data.fltInfo.fltNo),
            DepartureTime: data.DepartureTime,
            DepartureAirport: data.DepartureAirport,
            DestinationAirport: data.ArrivalAirport
        }
        FlightService.GetFlightStopInfo(model).then(response => {
            lowThis.hideLoadingView();
            if (response && response.success) {
                let stopInfo = response.data;
                stopInfo.Duration = stopInfo.Duration.replace('小时', 'h');
                stopInfo.Duration = stopInfo.Duration.replace('分钟', 'm');//
                data.FlightStopInfo = stopInfo;
                lowThis.showAlertView(`${I18nUtil.translate('经停')}${I18nUtil.translate(stopInfo.CityName)}，${stopInfo.ArrivalTime}${I18nUtil.translate('到达')}，${stopInfo.DepartureTime}${I18nUtil.translate('出发')}，${I18nUtil.translate('停留')}${stopInfo.Duration}`);
            } else {
                lowThis.toastMsg(response.message || '获取数据异常');
            }
        }).catch(error => {
            lowThis.hideLoadingView();
            lowThis.toastMsg(error.message || '获取数据异常');
        })
    }
    _shareAlert = (data) => {
        const { lowThis } = this.props;
        if (data.fltInfo) {
            if (data.fltInfo.codeShareLine) {
                let shareStr = I18nUtil.translate('实际承运') + '   ' + (Util.Parse.isChinese() ? data.fltInfo.codeShareFltLineName : Util.Read.domesticAirlines(data.fltInfo.codeShareLine)) + data.fltInfo.codeShareLine + data.fltInfo.codeShareFltNo;
                lowThis.toastMsg(shareStr);
            }
        }
    }
    _showCanbinDes = (data) => {
        const { lowThis } = this.props;
        lowThis.toastMsg(Util.Parse.isChinese()? data.CabinTagDesc:data.CabinEnTagDesc);
    }

    render() {
        const { section, loadMorePrice, currentLowPrice, oldModel, oldPolicySummary, isChange,craftTypeList } = this.props;
        if (!section || !section.lowPrice || section.lowPrice.length === 0) return;
        let data = section.lowPrice[0];
        if (!data) return;

        //改期价格显示规则 显示差价
        let dataPtice;
        if (isChange) {
            dataPtice = section.PriceCha
        } else {
            dataPtice = data.Price
        }
        //协议 已减金额（暂时不展示）
        let reduce = '';
        if (data.IsCompanyFarePrice && data.PubPrice > data.Price) {
            reduce = I18nUtil.translate('已减') + (data.PubPrice - data.Price);
        }
        //是否显示共享
        let share = data.fltInfo && data.fltInfo.codeShareLine ? '共享' : null;
        let planType = Util.Read.planType(data.AirEquipType,craftTypeList);
        let DepartureDate = Util.Date.toDate(data.DepartureTime);
        let ArrivalDate = Util.Date.toDate(data.ArrivalTime);
        let diffDay = Util.Date.getDiffDay(DepartureDate, ArrivalDate);
        let DepartureAirportDesc = data.DepartureAirportDesc;
        let ArrivalAirportDesc = data.ArrivalAirportDesc;
        if ((DepartureAirportDesc && DepartureAirportDesc.includes('航站楼')) || (ArrivalAirportDesc && ArrivalAirportDesc.includes('航站楼'))) {
            DepartureAirportDesc = DepartureAirportDesc.replace('航站楼', '');
            ArrivalAirportDesc = ArrivalAirportDesc.replace('航站楼', '');
        }

        let FlightDuration = data.FlightDuration.replace(':', "h");
        // FlightDuration = FlightDuration.replace('分', 'm');
        FlightDuration = FlightDuration + 'm';
        let shareStr;
        if (data.fltInfo) {
            if (data.fltInfo.codeShareLine) {
                shareStr = (Util.Parse.isChinese() ? data.fltInfo.codeShareFltLineName : Util.Read.domesticAirlines(data.fltInfo.codeShareLine)) + data.fltInfo.codeShareLine + data.fltInfo.codeShareFltNo;
            }
        }
        if(planType){
            planType=  planType 
        }
        return (
            <TouchableOpacity onPress={loadMorePrice}>
                <View style={styles.contain}>
                    <View style={{ flexDirection: 'row' }}>
                        {
                            currentLowPrice === data.Price ?
                                <View style={styles.lowPrice}>
                                    <CustomText text={'当日最低'} style={{ color: Theme.orangeColor, fontSize: 11 }} />
                                </View>
                            : null
                        }
                        {
                            data.HasCompanyCode ?
                                <View style={styles.lowPrice2}>
                                    <CustomText text={'协议'} style={{ backgroundColor: Theme.orangelableColor, borderRadius: 2, color: '#fff', fontSize: 11,paddingHorizontal:6 }}></CustomText>
                                </View>
                            : null
                        }
                    </View>
                    <View style={{ paddingHorizontal: 20, paddingVertical: 15, paddingTop: currentLowPrice === data.Price ? 0 : 20 }}>
                        <View style={styles.flightTimeView}>
                            <View style={styles.fleghtLittleView}>
                                <View style={{justifyContent: 'flex-start',width:90,marginRight:-10}}>
                                    <CustomText text={DepartureDate && DepartureDate.format('HH:mm')} style={{ fontSize: 20, fontWeight: 'bold' }}></CustomText>
                                    <CustomText style={{ fontSize: 12, marginTop: 2,textAlign:'left' }} text={Util.Parse.isChinese() ? (DepartureAirportDesc + (data.DepartureAirPortTerminal ? data.DepartureAirPortTerminal : '')) : (data.DepartureAirport + ' ' + (data.DepartureAirPortTerminal ? data.DepartureAirPortTerminal : ''))} ></CustomText>
                                </View>
                                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                    <CustomText text={FlightDuration} style={{ fontSize: 11, color: Theme.aidFontColor }} />
                                    {
                                        data.fltInfo && data.fltInfo.Stop > 0 ?
                                            <TouchableOpacity onPress={this._getFlightStopInfo.bind(this, data)}>
                                                <Image source={Util.Parse.isChinese() ? require('../../res/Uimage/flightFloder/_zstop.png') : require('../../res/Uimage/flightFloder/_estop.png')} style={{ width: 60, height: 10 }}></Image>
                                            </TouchableOpacity> :
                                            <Image source={require('../../res/Uimage/arrow.png')} style={{ width: 60, height: 3 }}></Image>
                                    }
                                    <CustomText text={''} style={{ marginTop: 5, fontSize: 11, color: Theme.aidFontColor }} />
                                </View>
                                <View style={{justifyContent: 'flex-end',width:90,marginLeft:-10}}>
                                    <View style={{ flexDirection: 'row',justifyContent: 'flex-end' }}>
                                        <CustomText text={ArrivalDate && ArrivalDate.format('HH:mm')} style={{ fontSize: 20, fontWeight: 'bold',textAlign:'right' }}></CustomText>
                                        {
                                            diffDay > 0 ?
                                                <CustomText style={{ marginRight: -11, fontSize: 12, marginLeft: 3 }} text={'+' + diffDay + (Util.Parse.isChinese() ? '天' : 'day')} />
                                                : null
                                        }
                                    </View>
                                    <CustomText style={{ fontSize: 12, marginTop: 2,textAlign:'right' }} text={Util.Parse.isChinese() ? (ArrivalAirportDesc + (data.ArrivalAirPortTerminal ? data.ArrivalAirPortTerminal : '')) : (data.ArrivalAirport + ' ' + (data.ArrivalAirPortTerminal ? data.ArrivalAirPortTerminal : ''))} ></CustomText>
                                </View>
                            </View>
                            <View style={{ backgroundColor: '#fff', flex: 1, marginLeft: 10 }}>
                                <View style={{ justifyContent: "flex-end" }}>
                                    <View style={{ flexDirection: 'row', justifyContent: "flex-end" }}>
                                    { isChange ? <CustomText text={'+'} style={{ fontSize: 16, marginTop: 4, color: Theme.theme }}></CustomText> : null }
                                        <Text>
                                        <CustomText text={'¥'} style={{ fontSize: 14, marginTop: 4, color: Theme.theme,fontWeight:'bold' }}></CustomText>
                                        <CustomText text={dataPtice?dataPtice:0} style={{ fontSize: 18, color: Theme.theme }}></CustomText>
                                        </Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', justifyContent: "flex-end", marginTop: 2 }}>
                                        <Image source={require('../../res/Uimage/flightFloder/ontime.png')} style={{ width: 16, height: 14 }}></Image>
                                        <CustomText text={data.TodayTimeRate ? data.TodayTimeRate : data.OntimeRate}
                                            style={{ textAlign: 'right', marginLeft: 2, fontSize: 12, color: Theme.assistFontColor }}></CustomText>
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View style={styles.flightInfo}>
                            <View style={{ flexDirection: 'row', alignItems: 'center',justifyContent:'space-between' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center',flexWrap:'wrap' }}>
                                <CropImage code={data.AirCode} />
                                {data.AirCodeDesc&& <CustomText style={styles.flightIn2} text={' '+(Util.Parse.isChinese() ? data.AirCodeDesc : data.AirCodeEnDesc) } />}
                                <CustomText style={styles.flightIn2} text={' | '+data.AirCode + data.FlightNumber  } />
                                {planType?<CustomText style={styles.flightIn2} text={' | '+ planType} />:null}
                                {
                                    data.fltInfo.mealDesc?
                                    <CustomText style={styles.flightIn2} text={' | '+( Util.Parse.isChinese() ? data.fltInfo.mealDesc : I18nUtil.translate(data.fltInfo.mealDesc))} />
                                    :
                                    <CustomText style={styles.flightIn2} text={''} />
                                }
                                </View>
                                {
                                    this.props.highRisk && this.props.highRisk.Level>0 &&
                                    <Foundation name={'info'} style={{ marginRight: 5 }} size={20} color={this.props.highRisk.Level == 1 ? Theme.theme : this.props.highRisk.Level == 2 ? Theme.redColor : null} />
                                }
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center',marginLeft:20,marginTop:5 }}>
                                {/* {
                                        data.CabinTag ?
                                            <CustomText text={Util.Parse.isChinese()? data.CabinTag: data.CabinEnTag} onPress={this._showCanbinDes.bind(this, data)}
                                                style={{ fontSize: 11, borderRadius: 2, color: '#fff',backgroundColor: Theme.theme,paddingHorizontal:6, }} />
                                            : null
                                } */}
                                {/* {
                                    data.IsCompanyFarePrice ?
                                        <CustomText text={'协议'} style={{ backgroundColor: Theme.orangelableColor, borderRadius: 2, color: '#fff', paddingHorizontal: 6, fontSize: 11 }}></CustomText>
                                        : null
                                } */}
                            </View>
                        </View>
                        <View style={{ marginTop: 8 }}>
                            {
                                share ?
                                    <View style={{ flexDirection: 'row', alignItems: 'center',flexWrap:'wrap' }}>
                                        <CustomText style={{ fontSize: 12, color: Theme.theme }} text={share} />
                                        {shareStr && <CustomText style={{ fontSize: 12, color: Theme.commonFontColor }} text={' | '} />}
                                        {shareStr &&
                                            <Text style={{ fontSize: 12, flexWrap: 'wrap', color: Theme.commonFontColor }}>
                                                {I18nUtil.tranlateInsert('需前往{{noun}}办理值机', shareStr)}
                                            </Text>
                                        }
                                    </View>
                                    : null
                             }
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }
}

const styles = StyleSheet.create({
    contain: {
        backgroundColor: '#fff',
        marginHorizontal: 10,
        marginTop: 10,
        borderRadius: 6
    },
    lowPrice: {
        backgroundColor: Theme.orangeBg,
        paddingHorizontal: 6,
        height: 20,
        borderTopLeftRadius: 6,
        borderBottomRightRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight:5
    },
    
    lowPrice2: {
        backgroundColor: Theme.orangeBg,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderTopLeftRadius: 6,
        borderBottomRightRadius: 6,
        alignItems: 'center',
        justifyContent: 'center'
    },
    flightTimeView: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        flex: 1
    },
    flightInfo: {
        // flexDirection: 'row',
        // justifyContent: "space-between",
        marginTop: 12,
    },
    fleghtLittleView: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flex: 3
    },
    flightIn: {
        marginLeft: 5,
        height: 15,
        fontSize: 12,
        color: Theme.commonFontColor,
        textAlign: 'center',
    },
    flightIn2: {  
        height: 15,
        fontSize: 12,
        color: Theme.commonFontColor,
    }
})