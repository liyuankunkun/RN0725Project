import React from 'react';
import {
    Modal,
    View,
    Image,
    TouchableHighlight,
    ScrollView,
    Alert
} from 'react-native';
import Theme from '../../res/styles/Theme';
import DeviceUtil from '../../util/DeviceUtil';
import CustomText from '../../custom/CustomText';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Util from '../../util/Util';
import CropImage from '../../custom/CropImage';
import I18nUtil from '../../util/I18nUtil';
import Key from '../../res/styles/Key';
import StorageUtil from '../../util/StorageUtil';
export default class ListBottomView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            data: null,
            selectItem: null,
            craftTypeList: []
        }
    }

     componentDidMount() {
        StorageUtil.loadKey(Key.CraftTypeList).then(result => {
            this.setState({
                craftTypeList: result || []
            })
        })
    }

    showView(obj) {
        if (!obj) return;
        this.setState({
            visible: true,
            data: obj
        })
    }

    _orderLowPriceOperation = () => {
        const { selectItem } = this.state;
        const { otwThis, callBack } = this.props;
        if (!selectItem) {
            Util.Parse.isChinese()? 
            Alert.alert('温馨提示', '请选择最低价航班',
                [
                    {text: '确定', onPress: () => console.log('确定')}
                ]
            )
            : 
            Alert.alert('Notice', 'Please select the cheapest flight',
                [
                    {text: 'OK', onPress: () => console.log('OK')}
                ]
            );          
            return;   
        }       
        this.setState({
            selectItem: null,
            visible: false
        }, () => {
            callBack(selectItem);
        })
    }
    _continuteOrder = () => {
        const { otwThis,compSwitch,jump } = this.props;
        const { data } = this.state
        this.setState({
            visible: false
        }, () => {
            if (this.props.isSingle) { 
                if(jump){
                    compSwitch ?
                    otwThis.push('Flight_compCreatOrderScreen', data)
                    :
                    otwThis.push('FlightOrderScreeb', data);
                }else{
                    otwThis.push('FlightRuleScreen', data);
                }
            } else { 
                if(jump){
                    otwThis.push('FlightRtList', data);
                }else{
                    otwThis.push('FlightRuleScreen',data);
                }
            }
        })
    }
    _selectJourney = (item) => {
        if (this.state.selectItem && this.state.selectItem === item) {
            this.setState({
                selectItem: null
            })
        } else {
            this.setState({
                selectItem: item,
            })
        }
    }
    _renderList = () => {
        const { data, selectItem, craftTypeList } = this.state;
        if (!data || !data.MatchTravelRules || !data.MatchTravelRules.unmatchlist || !data.MatchTravelRules.unmatchlist[0] || !data.MatchTravelRules.unmatchlist[0].LowPriceFights) return;
        return (
            <ScrollView style={{height:data.MatchTravelRules.unmatchlist[0].LowPriceFights.length > 4 ? 500 : null}} keyboardShouldPersistTaps='handled'>
                {
                    data.MatchTravelRules.unmatchlist.map((list, index) => {
                       if(list.LowPriceFights){
                        return list.LowPriceFights.map(obj=>{
                            let item = obj;
                            if (!item) return null;
                            let goDepart = Util.Date.toDate(item.DepartureTime).format('HH:mm');
                            let arrivalDepart = Util.Date.toDate(item.ArrivalTime).format('HH:mm');
    
                            let DepartureAirportDesc = item.DepartureAirportDesc;
                            let ArrivalAirportDesc = item.ArrivalAirportDesc;
                            let planType = Util.Read.planType(item.AirEquipType, craftTypeList);
                            if ((DepartureAirportDesc&&DepartureAirportDesc.includes('航站楼')) || (ArrivalAirportDesc&&ArrivalAirportDesc.includes('航站楼'))) {
                                DepartureAirportDesc = DepartureAirportDesc.replace('航站楼', '');
                                ArrivalAirportDesc = ArrivalAirportDesc.replace('航站楼', '');
                            }
                            return (
                                <TouchableHighlight key={index} underlayColor='transparent' onPress={this._selectJourney.bind(this, item)}>
                                    <View style={{ flexDirection: 'row', marginHorizontal: 10, alignItems: 'center',backgroundColor:'#fff',marginTop:10,paddingHorizontal:12,paddingVertical:12, borderRadius:6 }}>
                                        <MaterialIcons
                                            name={selectItem === item ? 'check-box' : 'check-box-outline-blank'}
                                            size={18}
                                            color={selectItem === item ? Theme.theme :Theme.darkColor}
                                        />
                                        <View style={{ flex: 1 }}>
                                            <View style={{ flexDirection: 'row', justifyContent: "space-around" }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
                                                    <View style={{ justifyContent: 'flex-start',width:80}}>
                                                        <CustomText text={goDepart} style={{ fontSize: 20,fontWeight:'bold' }} />
                                                        <CustomText text={Util.Parse.isChinese() ? (item.DepartureAirportDesc) : item.DepartureAirport} style={{ fontSize: 12, color: 'gray', marginTop: 5 }} />
                                                    </View>
                                                    <View style={{ alignItems: "center", justifyContent: 'center' }}>
                                                    {
                                                        item.fltInfo && item.fltInfo.Stop > 0 
                                                        ?
                                                        <Image source={Util.Parse.isChinese() ? require('../../res/Uimage/flightFloder/_zstop.png') : require('../../res/Uimage/flightFloder/_estop.png')} style={{ width: 60, height: 10 }}></Image>
                                                        :
                                                        <Image source={require('../../res/Uimage/arrow.png')} style={{ width: 60, height: 3 }}></Image>
                                                    }
                                                    </View>
                                                    <View style={{ justifyContent: 'flex-end',width:80 }}>
                                                        <CustomText text={arrivalDepart} style={{ fontSize: 20,textAlign:'right',fontWeight:'bold' }} />
                                                        <CustomText text={Util.Parse.isChinese() ? item.ArrivalAirportDesc : item.ArrivalAirport} style={{ fontSize: 12, color: 'gray', marginTop: 5,textAlign:'right' }} />
                                                    </View>
                                                </View>
                                                <CustomText text={'¥' + item.Price} style={{ fontSize: 20, color: Theme.theme, marginLeft: 5 }} />
                                            </View>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 5,marginTop:7 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <CropImage code={item.AirCode} />
                                                    <CustomText style={{ marginLeft: 5, height: 15, fontSize: 12, color: 'gray', textAlign: 'center' }} text={(Util.Parse.isChinese() ? item.AirCodeDesc : '') + ' | ' + item.AirCode + ' | ' + item.FlightNumber + ' | '+ I18nUtil.translate(planType)} />
                                                    {
                                                        item.IsCompanyFarePrice ?
                                                           <CustomText text={'协议'} style={{ backgroundColor: Theme.orangelableColor, borderRadius: 2, color: '#fff', paddingHorizontal: 3, fontSize: 11 ,marginLeft:5}}></CustomText>
                                                        : null
                                                    }
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableHighlight>
                            )
                          })
                       }
                        
                    })
                }
            </ScrollView >
        )
    }

    render() {
        const { visible } = this.state;
        return (
            <Modal visible={visible} transparent>
                <TouchableHighlight style={{ flex: 1 }} underlayColor='transparent' onPress={() => this.setState({ visible: false, data: null })}>
                    <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }}></View>
                </TouchableHighlight>
                <View style={{ backgroundColor: Theme.normalBg }}>
                    <View style={{ padding: 10, borderBottomColor: Theme.lineColor, borderBottomWidth: 1, alignItems: 'center' }}>
                        <CustomText text='根据公司差旅政策，推荐您预订低价航班' style={{ fontSize: 16 }} />
                    </View>
                    {this._renderList()}
                    <View style={{marginTop:10}}></View>
                    <View style={{  borderColor: Theme.lineColor, borderWidth: 1, flexDirection: 'row',backgroundColor:'#fff',padding:6}}>
                        <TouchableHighlight underlayColor='transparent' style={{ flex: 1, alignItems: 'center', justifyContent: 'center',borderRadius:4,borderWidth:1,marginRight:2,borderColor:Theme.theme,height: 44,}} onPress={this._orderLowPriceOperation}>
                            <CustomText text='预订最低价' style={{ color: Theme.theme }} />
                        </TouchableHighlight>
                        <TouchableHighlight underlayColor='transparent' style={{ flex: 1, backgroundColor: Theme.theme, alignItems: 'center', justifyContent: 'center',borderRadius:4,marginLeft:2,height: 44,}} onPress={this._continuteOrder}>
                            <CustomText text='继续预订原航班' style={{ color: 'white' }} />
                        </TouchableHighlight>
                    </View>
                    <View style={{ height: DeviceUtil.is_iphonex() ? 34 : 0 }}></View>
                </View>
            </Modal>
        )
    }
}