import React from 'react';
import {
    View,
    Modal,
    TouchableHighlight
} from 'react-native';
import CustomText from '../../custom/CustomText';
import DeviceUtil from '../../util/DeviceUtil';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Theme from '../../res/styles/Theme';
import Util from '../../util/Util';
import I18nUtil from '../../util/I18nUtil';
import Key from '../../res/styles/Key';
import StorageUtil from '../../util/StorageUtil';
export default class GoFlightDetailView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            visible: false,
    
        }
    }
    show(){
        this.setState({
            visible:true
        })
    }
    _hide = () => {
        this.setState({
            visible:false
        })
    }
    render() {
        const {goFlightData,moreTravel} = this.props;
        const { visible,  } = this.state;
        let departureDate = Util.Date.toDate(goFlightData && goFlightData.DepartureTime);
        let arrivalDate = Util.Date.toDate(goFlightData && goFlightData.ArrivalTime);
        let craftTypeList = [];
        StorageUtil.loadKey(Key.CraftTypeList).then(result => {
            craftTypeList = result || [];
        })
        let planType = Util.Read.planType(goFlightData && goFlightData.AirEquipType,craftTypeList);
        return (
            <Modal visible={visible} transparent>
                <TouchableHighlight style={{ flex: 1 }} underlayColor='transparent' onPress={() => this.setState({ visible: false })}>
                    <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }}></View>
                </TouchableHighlight>
                <View style={{ backgroundColor: 'white',padding:10 }}>
                    <View style={{ height: 40, justifyContent: "space-between", paddingHorizontal: 15, alignItems: "center", flexDirection: "row" }}>
                        <CustomText />
                        <CustomText text='去程航班详情' style={{ fontSize: 16 }} />
                        <CustomText />
                    </View>
                    {
                        goFlightData ?
                            <View style={{ margin: 10, flexDirection: 'row', alignItems: 'center' }}>
                                <CustomText text={moreTravel?'第一程':'去程'} style={{ color: Theme.theme,fontSize: 14,fontWeight:'bold' }} />
                                <CustomText style={{ marginLeft: 10,fontSize: 14,color: Theme.fontColor }} text={`${goFlightData.DepartureCityName}-${goFlightData.ArrivalCityName} ${departureDate.format('MM-dd')} ${departureDate.getWeek()}`} />
                            </View>
                            : null
                    }
                    {
                        goFlightData ?
                            <View style={{margin:10,flexDirection:'row'}}>
                                <View style={{justifyContent:"space-between",alignItems:'center'}}>
                                    <CustomText style={{fontSize:18}} text={departureDate.format('HH:mm')} />
                                    <CustomText style={{fontSize:14}} text={'|'} />
                                    <CustomText style={{fontSize:18}} text={arrivalDate.format('HH:mm')} />
                                </View>
                                <View style={{marginLeft:20}}>
                                  <CustomText style={{fontSize:14,color: Theme.commonFontColor}} text = {goFlightData.DepartureAirportDesc + ' ' + goFlightData.DepartureAirPortTerminal}/>
                                  <View style={{flexDirection:'row'}}>
                                  <CustomText style={{marginRight:3,color: Theme.assistFontColor,fontSize:12}} text = {goFlightData.AirCode +  goFlightData.FlightNumber}/>
                                  <CustomText style={{marginRight:3,color: Theme.assistFontColor,fontSize:12}} text = {' ｜ '+ I18nUtil.translate(planType) + ' ｜ ' + (goFlightData.fltInfo.mealDesc?goFlightData.fltInfo.mealDesc:'' )}/>
                                  </View>
                                  <CustomText style={{marginTop:10,fontSize:14,color: Theme.commonFontColor}} text = {goFlightData.ArrivalAirportDesc }/>
                                </View>
                            </View>
                            : null
                    }
                    <View style={{ height: DeviceUtil.is_iphonex() ? 34 : 0 }}></View>
                </View>
            </Modal>
        )
    }
}