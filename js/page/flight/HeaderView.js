import React from 'react'
import {
    View,
    StyleSheet,
    TouchableHighlight,
    Text,
    Image,
    TouchableOpacity
} from 'react-native'
import Utils from '../../util/Util'
import CustomText from '../../custom/CustomText';
import FlightEnum from '../../enum/FlightEnum';
import I18nUtil from '../../util/I18nUtil';
import Util from '../../util/Util';
import CropImage from '../../custom/CropImage';
import Theme from '../../res/styles/Theme';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FlightService from '../../service/FlightService';
import ViewUtil from '../../util/ViewUtil';
import Pop from 'rn-global-modal'
import airPortEn from '../../res/js/airport_En'
export default class HeaderView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
           
        }
    }
    /** 
     * 超标原因
     */
    _standerReason = () => {
        const { ruleModel, otwThis } = this.props;
        if (!ruleModel) return;
        let reason = '';
        if (ruleModel.lowPriceReason) {
            // reason += I18nUtil.translate(ruleModel.lowPriceReason.RuleTypeDesc)  + ":" + I18nUtil.translate(ruleModel.lowPriceReason.Reason ) + '\n';
            reason += ruleModel.lowPriceReason.RuleTypeDesc + ":" + (Util.Parse.isChinese() ? ruleModel.lowPriceReason.Reason : ruleModel.lowPriceReason.ReasonEn) + '\n';
        }
        if (ruleModel.beforeDayReason) {
            // reason += I18nUtil.translate(ruleModel.beforeDayReason.RuleTypeDesc) + ':' + I18nUtil.translate(ruleModel.beforeDayReason.Reason) + '\n';
            reason += ruleModel.beforeDayReason.RuleTypeDesc + ":" + (Util.Parse.isChinese() ? ruleModel.beforeDayReason.Reason : ruleModel.beforeDayReason.ReasonEn) + '\n';
        }
        if (ruleModel.cabinDiscountReason) {
            // reason += I18nUtil.translate(ruleModel.cabinDiscountReason.RuleTypeDesc) + ":" + I18nUtil.translate(ruleModel.cabinDiscountReason.Reason);
            reason += ruleModel.cabinDiscountReason.RuleTypeDesc + ":" + (Util.Parse.isChinese() ? ruleModel.cabinDiscountReason.Reason : ruleModel.cabinDiscountReason.ReasonEn) + '\n';
        }
        if (ruleModel.canbinDataReason) {
            // reason += I18nUtil.translate(ruleModel.cabinDiscountReason.RuleTypeDesc) + ":" + I18nUtil.translate(ruleModel.cabinDiscountReason.Reason);
            reason += ruleModel.canbinDataReason.RuleTypeDesc + ":" + (Util.Parse.isChinese() ? ruleModel.canbinDataReason.Reason : ruleModel.canbinDataReason.ReasonEn) + '\n';
        }
        if (!reason) {
            otwThis.toastMsg('该订单无超标');
        } else {
            otwThis.showAlertView(reason, () => {
                return ViewUtil.getAlertButton('确定', () => {
                    otwThis.dismissAlertView();
                })
            });
        }

    }
    /** 
     * 查看退改规则
     */
    _showRule = () => {//1退改规则,2行李说明
        const { model, otwThis } = this.props;
        otwThis.ruleView && otwThis.ruleView.show(model);
    }
    _showRule2 = () => {//1退改规则,2行李说明
        const { model, otwThis } = this.props;
        otwThis.ruleView2 && otwThis.ruleView2.show(model); 
    }
    /**
     *  查看行李限额
     */
    _showCHBaddge = () => {
        const { model, otwThis } = this.props;
        otwThis.showAlertView(model.CHTravellerRules&&model.CHTravellerRules.BagDesc);
    }
    /** 
     * 查看经停数据
     */
    _showFlightstop = (data) => {
        const { otwThis } = this.props;
        if (data.FlightStopInfo) {
            let stopInfo = data.FlightStopInfo;
            otwThis.showAlertView(`${I18nUtil.translate('经停')}${I18nUtil.translate(stopInfo.CityName)}，${stopInfo.ArrivalTime}${I18nUtil.translate('到达')}，${stopInfo.DepartureTime}${I18nUtil.translate('出发')}，${I18nUtil.translate('停留')}${stopInfo.Duration}`);
            return;
        }
        otwThis.showLoadingView();
        let model = {
            FlightNo: data.fltInfo.codeShareLine ? (data.fltInfo.codeShareLine + data.fltInfo.codeShareFltNo) : (data.fltInfo.airline + data.fltInfo.fltNo),
            DepartureTime: data.DepartureTime,
            DepartureAirport: data.DepartureAirport,
            DestinationAirport: data.ArrivalAirport
        }
        FlightService.GetFlightStopInfo(model).then(response => {
            otwThis.hideLoadingView();
            if (response && response.success) {
                let stopInfo = response.data;
                stopInfo.Duration = stopInfo.Duration.replace('小时', 'h');
                stopInfo.Duration = stopInfo.Duration.replace('分钟', 'm');//
                data.FlightStopInfo = stopInfo;
                otwThis.showAlertView(`${I18nUtil.translate('经停')}${I18nUtil.translate(stopInfo.CityName)}，${stopInfo.ArrivalTime}${I18nUtil.translate('到达')}，${stopInfo.DepartureTime}${I18nUtil.translate('出发')}，${I18nUtil.translate('停留')}${stopInfo.Duration}`);
            } else {
                otwThis.toastMsg(response.message || '获取数据异常');
            }
        }).catch(error => {
            otwThis.hideLoadingView();
            otwThis.toastMsg(error.message || '获取数据异常');
        })
    }
    _alert = (obj) => {
        Pop.show(
            <View style={{
                width: '80%',
                backgroundColor: '#fff',
                borderRadius: 8,
                padding: 20,
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <CustomText text={obj} />
            </View>,
            { animationType: 'fade', maskClosable: true, onMaskClose: () => { } }
        )
    }
    render() {
        const { headerTextTile, model, feeType, ruleModel,otwThis } = this.props;
        if (!model) return null;
        let goDate = Utils.Date.toDate(model.DepartureTime);
        let arrivalDate = Utils.Date.toDate(model.ArrivalTime);
        if (headerTextTile == '原') {
            arrivalDate = Utils.Date.toDate(model.DestinationTime);
        }
        let shareStr1 = null;
        let shareStr2 = null;
        if (model.fltInfo) {
            if (model.fltInfo.codeShareLine) {
                // shareStr = I18nUtil.translate('实际承运') + '  ' + (Utils.Parse.isChinese() ? model.fltInfo.codeShareFltLineName : Util.Read.domesticAirlines(model.fltInfo.codeShareLine)) + model.fltInfo.codeShareLine + model.fltInfo.codeShareFltNo;
                // shareStr = I18nUtil.translate('共享航班：') + '需前往' + (Utils.Parse.isChinese() ? model.fltInfo.codeShareFltLineName : Util.Read.domesticAirlines(model.fltInfo.codeShareLine)) + model.fltInfo.codeShareLine + model.fltInfo.codeShareFltNo+'办理值机';
                shareStr1 = I18nUtil.translate('共享航班')
                shareStr2 = '需前往{{noun}}办理值机'
            }
        }
        let diffDay = Util.Date.getDiffDay(goDate, arrivalDate);
        let DiscountRateDesc = (model.SupplierType === FlightEnum.SupplierType.gw51Book) ? '' : I18nUtil.translate(model.DiscountRateDesc);
        if (!Utils.Parse.isChinese()) {
            if (Utils.Parse.isNumber(model.DiscountRate) && model.DiscountRate < 1 && model.DiscountRate > 0) {
                DiscountRateDesc = (parseInt((1 - model.DiscountRate) * 100)) + '% off';
            }
            if (Utils.Parse.isNumber(model.Discount) && model.Discount < 1 && model.Discount > 0) {
                DiscountRateDesc = (parseInt((1 - model.Discount) * 100)) + '% off';
            }
        }
        let productCabins = model.ProductCabins;
        //判断英文翻译中是否包含该机场
        let mark1 = JSON.stringify(airPortEn).replace("\{", "").replace("\}", "").split(',').indexOf((item) => { item.split(':')[0].replace("\"", "").replace("\"", "") == model.DepartureAirportDesc || model.DepartureAirportName })
        let mark2 = JSON.stringify(airPortEn).replace("\{", "").replace("\}", "").split(',').indexOf((item) => { item.split(':')[0].replace("\"", "").replace("\"", "") == model.ArrivalAirportDesc || model.DestinationAirportName })

        let BookDesinDesc = Utils.Parse.isChinese() ? (model.ResBookDesinCodeDesc ? model.ResBookDesinCodeDesc : '') : (model.EnResBookDesinCodeDesc ? model.EnResBookDesinCodeDesc : '')
        return (
            <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 6 , borderColor:Theme.greenBg,marginTop:headerTextTile == '返'?1:0}}>
                <View style={styles.headerRowView}>
                    <View style={{flexDirection:'row'}}>
                        {
                                    headerTextTile ?
                                        <View style={styles.lostyle} >
                                            <CustomText text={headerTextTile} style={{ color: 'white',fontSize:12 }} />
                                        </View> : null
                        }
                        <CustomText style={{ fontSize: 14 }} text={' ('} />
                        <CustomText style={{ fontSize:14 }} text={goDate.format('yyyy-MM-dd') + goDate.getWeek('normal')} />
                        <CustomText text={')'} />
                    </View>
                    <View style={{flexDirection:'row'}}>
                        <CustomText style={{ color: Theme.theme, fontSize: 12 ,textDecorationLine: 'underline',textDecorationStyle:'solid'}} onPress={this._showRule} text='退改规则' />
                        <CustomText style={{ color: Theme.theme, fontSize: 12,marginLeft:5, textDecorationLine: 'underline',textDecorationStyle:'solid' }} onPress={this._showRule2} text='行李说明' />
                    </View>
                </View>
                <View style={{ backgroundColor: 'white', borderBottomColor: Theme.lineColor, borderBottomWidth: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between',marginVertical:10, }}>
                        <View style={{justifyContent: 'flex-start',width:120 }}>
                            {
                                !Util.Parse.isChinese() ?
                                    <CustomText text={model.DepartureCityEname} style={{ fontSize: 20 }} /> : null
                            }
                            <CustomText style={{ fontSize: 24 }} text={goDate.format('HH:mm')} />
                            {
                                mark1 === -1 ?
                                    <CustomText style={{ fontSize: 12, color: 'gray' }} text={(Utils.Parse.isChinese() ? (model.DepartureAirportDesc ? model.DepartureAirportDesc : model.DepartureAirportName) : (model.DepartureAirport ? model.DepartureAirport + ' ' : model.DepartureAirport + " ")) + (model.DepartureAirPortTerminal ? model.DepartureAirPortTerminal : (model.DepartureAirportTerminal ? model.DepartureAirportTerminal : ''))} />
                                    : null
                            }
                            {
                                !Util.Parse.isChinese() ?
                                    JSON.stringify(airPortEn).replace("\{", "").replace("\}", "").split(',').map((item) => {//拿到机场信息去掉各种符号 整理成数组
                                        let str = item.split(':')[0].replace("\"", "").replace("\"", "")
                                        if (str === model.DepartureAirportDesc) {
                                            return <CustomText style={{ fontSize: 12, color: 'gray' }} text={model.DepartureAirportDesc} />
                                        } else if (str === model.DepartureAirportName) {
                                            return <CustomText style={{ fontSize: 12, color: 'gray' }} text={model.DepartureAirportName} />
                                        } else {

                                        }
                                    }) : null
                            }
                        </View>
                        <View style={{ alignItems: "center",justifyContent: 'center' }}>
                            {/* <Image source={require('../../res/Uimage/arrow.png')} style={{ width: 60, height: 3 }}></Image>
                            {
                                model.fltInfo && model.fltInfo.Stop > 0 ?
                                    <CustomText text='经停' style={{ marginTop: 10, color: Theme.theme, marginLeft: 10 }} onPress={this._showFlightstop.bind(this, model)} />
                                    : null
                            } */}
                            <CustomText text={model.FlightDuration} style={{ fontSize: 12,color:Theme.assistFontColor}} />
                            {
                                model.fltInfo && model.fltInfo.Stop > 0 ?
                                    <TouchableOpacity onPress={()=>(this._showFlightstop.bind(this, model))}>
                                        <Image source={Util.Parse.isChinese() ? require('../../res/Uimage/flightFloder/_zstop.png') : require('../../res/Uimage/flightFloder/_estop.png')} style={{ width: 60, height: 10 }}></Image>
                                    </TouchableOpacity> :
                                    <Image source={require('../../res/Uimage/arrow.png')} style={{ width: 60, height: 3 }}></Image>
                            }
                            <CustomText text={''} style={{ fontSize: 12, color: Theme.aidFontColor }} />
                        </View>
                        <View style={{ justifyContent: 'flex-start',width:120}}>
                            {
                                !Util.Parse.isChinese() ?
                                    <CustomText text={model.ArrivalCityEname} style={{ fontSize: 20,textAlign:'right' }} /> : null
                            }
                            <View style={{ flexDirection: 'row',justifyContent: 'flex-end' }}>
                            
                            <CustomText style={{ fontSize: 24,textAlign:'right' }} text={arrivalDate.format('HH:mm')} />
                            {
                                diffDay > 0 ?
                                    <CustomText text={'+' + diffDay} />
                                    : null
                            }
                            </View>
                            {
                                mark2 === -1 ?
                                    <CustomText style={{ fontSize: 12, color: 'gray',textAlign:'right' }} text={(Utils.Parse.isChinese() ? (model.ArrivalAirportDesc ? model.ArrivalAirportDesc : model.DestinationAirportName) : (model.ArrivalAirport ? model.ArrivalAirport + ' ' : model.DestinationAirport + ' ')) + (model.ArrivalAirPortTerminal ? model.ArrivalAirPortTerminal : (model.DestinationAirportTerminal ? model.DestinationAirportTerminal : ''))} />
                                    : null
                            }
                            {/* {
                                !Util.Parse.isChinese() ?  JSON.stringify(airPortEn).replace("\{", "").replace("\}", "").split(',').map((item) => {//拿到机场信息去掉各种符号 整理成数组
                                    let str = item.split(':')[0].replace("\"", "").replace("\"", "")
                                    if (str === model.ArrivalAirportDesc) {
                                        return <CustomText style={{ fontSize: 12, color: 'gray' }} text={model.ArrivalAirportDesc} />
                                    } else if (str === model.DestinationAirportName) {
                                        return <CustomText style={{ fontSize: 12, color: 'gray' }} text={model.DestinationAirportName} />
                                    } else {

                                    }
                                }):null
                            } */}

                        </View>
                    </View>
                    <View style={{ marginTop: 10, flexDirection: "row",marginVertical:10  }}>
                        <CropImage code={model.AirCode ? model.AirCode : model.Airline} />
                        <CustomText style={{ fontSize: 12, color: 'gray', marginLeft: 5 }} text={(Utils.Parse.isChinese() ? (model.AirCodeDesc ? model.AirCodeDesc : model.AirlineName) : '') + " " + (model.AirCode ? model.AirCode : model.Airline) + (model.FlightNumber ? model.FlightNumber : model.AirNumber)} />
                        <CustomText style={{ fontSize: 12, color: 'gray', marginLeft: 5 }} text={BookDesinDesc+' '+(model.ResBookDesigCode?('('+model.ResBookDesigCode+')'):'')+' | '+ (DiscountRateDesc ? DiscountRateDesc : '') + ' | ' + (model.AirEquipType ? model.AirEquipType : model.EquipType)} />
                    </View>
                    {
                        model.fltInfo && model.fltInfo.codeShareLine ?
                            <View style={[styles.headerRowView]}>
                                <View>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Text style={{ color: Theme.redColor,fontSize:12 }}>{shareStr1}</Text>
                                        <Text style={{ color: Theme.redColor,fontSize:12 }}>{(shareStr2, (Utils.Parse.isChinese() ? model.fltInfo.codeShareFltLineName : Util.Read.domesticAirlines(model.fltInfo.codeShareLine)) + model.fltInfo.codeShareLine + model.fltInfo.codeShareFltNo)}</Text>
                                    </View>
                                    {
                                        model.fltInfo.codeShareFltLineName && model.fltInfo.codeShareLine == "KN" ?
                                            <CustomText style={{ color: Theme.redColor,fontSize:12 }} text={'中联航共享航班不累计里程分！'} />
                                            : null
                                    }

                                </View>
                            </View>
                            : null
                    }
                </View>
                <View>
                    <View style={[styles.headerRowView, { justifyContent: 'space-between', flex: 1, height: 30 }]}>
                        <View style={{ flexDirection: 'row' }}>
                            <CustomText style={{ color: 'gray', fontSize: 12 }} text='机票价' />
                            <CustomText style={{ color: 'gray', fontSize: 12 }} text={': ¥' + model.Price} />
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <CustomText style={{ color: 'gray', fontSize: 12 }} text='民航基金+燃油' />
                            <CustomText style={{ color: 'gray', fontSize: 12, marginRight: 10 }} text={': ¥' + model.Tax} />
                        </View>
                        {
                            model.SupplierType === 3 ?
                                <View style={{ flexDirection: 'row' }}>
                                    <CustomText style={{ color: 'gray', fontSize: 12 }} 
                                                text={model.CHBindProduct && model.CHBindProduct.subProdPrice ? 
                                                     (model.CHBindProduct.subProdName + '¥' + model.CHBindProduct.subProdPrice) 
                                                     : 
                                                     (model.BindProductInfo && model.BindProductInfo.subProdPrice ? (model.BindProductInfo.subProdName + '¥' + model.BindProductInfo.subProdPrice) 
                                                     : '')} />
                                </View>
                            : null
                        }
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'white' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            {
                                feeType === 1 && ruleModel ?
                                    <CustomText style={{ color: Theme.theme, fontSize: 12, fontWeight: 'bold',marginRight:5 }} onPress={this._standerReason} text='超标原因' />: null
                            }
                            {
                                model.SupplierType === 3 ?
                                    <CustomText style={{ color: Theme.theme, fontSize: 12,marginRight:5 }} onPress={this._showCHBaddge} text={model.ServiceCabin == 0 ? '行李限额' : '舱位专享'} />
                                : null
                            }
                            {
                                productCabins&&productCabins.map((item)=>{
                                    return( <CustomText style={styles.xyStyle3} 
                                                text={Util.Parse.isChinese()? item.ProductTag: item.ProductEnTag} 
                                                onPress={()=>{
                                                    otwThis.showAlertView(Util.Parse.isChinese()? item.ProductDesc: item.ProductEnDesc,()=>{
                                                        return ViewUtil.getAlertButton("确定",()=>{
                                                            otwThis.dismissAlertView();
                                                        })
                                                    })
                                                }}
                                    />)
                                })
                            }
                            {
                                    model.CabinTag ?
                                       
                                        Util.Parse.isChinese()?
                                        <CustomText text={ model.CabinTag} onPress={this._showCanbinDes.bind(this, model)} style={styles.xyStyle2} />
                                        :
                                        <CustomText text={model.CabinEnTag} onPress={this._showCanbinDes.bind(this, model)} style={styles.xyStyle2} />
                                       
                                    : null
                            }
                        </View>
                    </View>
                </View>
            </View>
        )
    }
    _showCanbinDes = (obj) => {
        const { otwThis } = this.props;
        otwThis.toastMsg(Util.Parse.isChinese()? obj.CabinTagDesc:obj.CabinEnTagDesc);
    }


}
var styles = StyleSheet.create({
    iconView: {
        marginLeft: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Theme.theme
    },
    headerRowView: {
        flexDirection: 'row',
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        paddingVertical: 5,
        justifyContent:'space-between'
    },
    tipSupperly: {
        backgroundColor: Theme.theme,
        color: 'white',
        fontSize: 1,
        marginLeft: 5,
        paddingHorizontal: 2,
        textAlign: 'center',
        borderRadius:2
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
    lostyle:{ 
        backgroundColor: Theme.orangeColor, 
        marginRight: 5,
        // width:16,
        height:16,
        alignItems:'center',
        justifyContent: 'center',
        borderRadius:2,
        paddingHorizontal:1
    },
    xyStyle2:{
        backgroundColor: Theme.pinkBg, 
        borderRadius: 2, 
        color: Theme.redColor, 
        paddingHorizontal: 3, 
        fontSize: 11,
        marginRight:4,
        paddingVertical:1
    },
})