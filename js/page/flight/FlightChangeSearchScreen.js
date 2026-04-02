import React from 'react';
import {
    View,
    StyleSheet,
    TouchableHighlight,
    Image
} from 'react-native';
import SuperView from '../../super/SuperView';
import Theme from '../../res/styles/Theme';
import CustomText from '../../custom/CustomText';
import ViewUtil from '../../util/ViewUtil';
import FlightService from '../../service/FlightService';
import I18nUtil from '../../util/I18nUtil';

export default class FlightChangeSearchScreen extends SuperView {

    constructor(props) {
        super(props);
        this._params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};
        this.params = this._params.order || {};
        this.params2 = this._params.oldOrderDetail || {};
        this._navigationHeaderView = {
            title: I18nUtil.translate('国内机票') +  I18nUtil.translate('（改签）'),
        }
        this.state = {
            date: (this.params?.DepartureTime || this.params?.OrderAir?.DepartureTime) || new Date()
        }
    }

    _gotoSearchList = () => {
        FlightService.orderDetail(this.params.Id).then(response => {
            if(response.success&&response.data&&response.data.OrderAir){
                var params = {
                    DepartureCityName: this.params?.Departure || this.params?.OrderAir?.Departure || '',
                    ArrivalCityName: this.params?.Destination || this.params?.OrderAir?.Destination || '',
                    DepartureAirport: this.params?.DepartureAirport || this.params?.OrderAir?.DepartureAirport || '',
                    ArrivalAirport: this.params?.DestinationAirport || this.params?.OrderAir?.DestinationAirport || '',
                    DepartureDateTime: this.state.date,
                    oldModel: this.params,
                    oldModelDetail: this.params2,
                    oldPolicySummary: response.data.OrderAir.PolicySummary
                }
                this.push('FLightChangeList', params);
            }
        })     
    }

    _goSelectDate = () => {
        this.push('Calendar', {
            backDate: (date) => {
                this.setState({
                    date
                })
            }
        })
    }

    renderBody() {
        const { date } = this.state;
        const { TravellerNames,Travellers } = this.params;
        let nameStr=''
        if(TravellerNames){
            nameStr=TravellerNames
        }else{
            let _travellers = []
        
            if(Travellers && Travellers.length>0){
                Travellers.map((_obj)=>{
                    _travellers.push(_obj.Name);
                })
            }
            nameStr = _travellers.toString()
        }
        return (
            <View>
                <View style={styles.view}>
                    <View style={{}}>
                    <View style={styles.personsStylel}>
                        <Image source={require('../../res/Uimage/travellers.png')} style={{width:20,height:20}}/>
                        <CustomText text={'出差人:'} style={{marginTop:10,margin:5,fontSize:14,}}/>
                        <CustomText text={nameStr} style={{fontSize:14}}/>
                    </View>
                    </View>
                    <View style={{backgroundColor:'#fff',paddingHorizontal:10,borderRadius:6,paddingBottom:10}}>
                        <View style={{flexDirection:'row',paddingHorizontal:10,paddingVertical:15}}>
                            <Image source={require('../../res/Uimage/flightFloder/BusinessTrip.png')} style={{width:20,height:20,marginRight:5}}/>
                            <CustomText text={'改签行程'} style={{fontSize:14}}></CustomText>
                        </View>
                        <View style={styles.row}>
                            <View style={[styles.center, {  }]}>
                                <CustomText style={{ color: Theme.commonFontColor, fontSize: 20 }} 
                                            text={this.params?.Departure || this.params?.OrderAir?.Departure || ''} />
                            </View>
                            <View style={[styles.center, { flex: 1 }]}>
                            <Image style={{height:28,width:28}} source={require('../../res/Uimage/flightFloder/flightSwich.png')}  ></Image>
                            </View>
                            <View style={[styles.center, { }]}>
                                <CustomText 
                                        style={{ color: Theme.commonFontColor, fontSize: 20 }}
                                        text={this.params?.Destination || this.params?.OrderAir?.Destination || ''}
                                />
                            </View>
                        </View>
                        <View style={styles.row}>
                            <TouchableHighlight style={{ flex: 1 }} underlayColor='transparent' onPress={this._goSelectDate}>
                                <View style={{ flex: 1, alignItems: 'center',flexDirection:'row' }}>
                                    <CustomText text={date ? date.format('yyyy-MM-dd') : null} style={{fontSize:18}} />
                                    <CustomText text={date ? ' ' + date.getWeek() : null} style={{fontSize:12,marginTop:2,color:Theme.commonFontColor}} />
                                </View>
                            </TouchableHighlight>
                        </View>
                        <View style={{height:30}}></View>
                        {
                           ViewUtil.getSubmitButton2('查询', this._gotoSearchList)
                        }
                    </View>
                </View>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    view: {
        height: 180,
        margin: 10
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: Theme.lineColor,
        height: 60,
        backgroundColor: 'white',
        paddingHorizontal:10
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    personsStylel:{
        marginVertical:10,
        padding:20,
        borderRadius:6,
        backgroundColor:'#fff',
        flexDirection:'row',
        flexWrap:'wrap',
        alignItems:'center',
    },
})