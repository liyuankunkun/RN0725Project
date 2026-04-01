/**
 * 国内酒店 查询
 */
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableHighlight,
    Linking,
    DeviceEventEmitter,
    PermissionsAndroid,
    Image,
    ScrollView,
    Modal
} from 'react-native';
import Theme from '../../res/styles/Theme';
import ViewUtil from '../../util/ViewUtil';
import CustomText from '../../custom/CustomText';
import Util from '../../util/Util';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import NavigationUtils from '../../navigator/NavigationUtils';
import StorageUtil from '../../util/StorageUtil';
import Key from '../../res/styles/Key';
import PropTypes from 'prop-types';
import HotelService from '../../service/HotelService';
import Pop from 'rn-global-modal'
import CommonService from '../../service/CommonService';
import { connect } from 'react-redux';
import action  from '../../redux/action';
import MapService from '../../service/MapService';
import { TouchableOpacity } from 'react-native';
import I18nUtil from '../../util/I18nUtil';
import TestScreen from './TestScreen';
class SearchView extends React.Component {

    static propTypes = {
        otwThis: PropTypes.object.isRequired,
        feeType: PropTypes.number.isRequired,
        customerInfo: PropTypes.object,
        apllyDays: PropTypes.number
    }
    componentDidUpdate(prevProps,prevState) {
        if (JSON.stringify(prevProps.cityList) !== JSON.stringify(this.props.cityList)) {
            this.setState({ city: this.props.cityList });
        }
        if (JSON.stringify(prevProps.keyWord) !== JSON.stringify(this.props.keyWord)) {
            this.setState({ keyWord: this.props.keyWord });
        }
        if (JSON.stringify(prevProps.mapPoi) !== JSON.stringify(this.props.mapPoi)) {
            this.setState({ mapPoi: this.props.mapPoi });
        }
        if (JSON.stringify(prevProps.UseMap) !== JSON.stringify(this.props.UseMap)) {
            this.setState({ UseMap: this.props.UseMap });
        }
    }

    constructor(props) {
        super(props);
        let Btime = Util.Date.toDate(this.props.BeginTime)
        let employLength = this.props.comp_userInfo&&this.props.comp_userInfo.employees&&this.props.comp_userInfo.employees.length || 0
        let travelLength = this.props.comp_userInfo&&this.props.comp_userInfo.travellers&&this.props.comp_userInfo.travellers.length || 0
        let selectDate = Btime&&Btime > new Date() ? Btime : new Date();
        this.state = {
            city:this.props.cityList&&this.props.cityList,
            selectDate: selectDate,
            longDay: this.props.apllyDays?this.props.apllyDays:1,
            returDay:selectDate.addDays(this.props.apllyDays?this.props.apllyDays:1),
            currtentPosition: null,
            keyOff: false,
            applyNum:this.props.selectTap===4?this.props.apply&&this.props.apply.SerialNumber:null,
            applySerialNumber:this.props.applySerialNumber,
            roomCount: 1,
            everyPerNum:1,
            compSwitch:this.props.compSwitch,
            selectApplyItem:this.props.selectApplyItem,
            hotelHistorRecordList:[],
            keyWord:this.props.keyWord&&this.props.keyWord,
            locationId:this.props.locationId&&this.props.locationId,
            locationName:this.props.locationName&&this.props.locationName,
            isModalVisible:false,
            mapPoi:this.props.mapPoi,
            UseMap:this.props.UseMap,
        }
    }
    componentDidMount() {
        this.backFromShopListener = DeviceEventEmitter.addListener(
            'refreshaaa',  //监听器名
            () => {
                this.setState({
                    applyNum:null
                })
            },
        );
        StorageUtil.loadKeyId(Key.HotelSearchedCitysKey).then(response => {
            if (response && Array.isArray(response) && response.length > 0) {
                let obj = response[response.length - 1];
                this.setState({
                    // city: obj.historyCity,
                    // keyWord: obj.historyKey,
                    hotelHistorRecordList: response
                })
            }
        }).catch(error => {
            // this.toastMsg(error.message || '获取数据异常');
        })
    }
    shouldComponentUpdate(nextProps) {

        if ((nextProps.hotelDep && nextProps.hotelDep !== this.props.hotelDep)) {
            this.setState({
                selectDate: nextProps.hotelDep
            })
        }
        // if ((nextProps.hotelCity && nextProps.hotelCity != this.props.hotelCity)) {
        //     this.setState({
        //         city: nextProps.hotelCity
        //     })
        // }
        if ((nextProps.flightArrivalDate && nextProps.flightArrivalDate != this.props.flightArrivalDate)) {
            this.setState({
                selectDate: nextProps.flightArrivalDate
            })
        }
        return true;
    }
    /**
     * 选择城市
     */
    _gotoSelectCity = () => {
        NavigationUtils.push(this.props.navigation, 'HotelCity', {
            setBackCity: (city) => {
                this.setState({
                    city: city,
                    currtentPosition:null,
                    keyOff:true,
                    keyWord:null,
                    locationId:null,
                    locationName:null,
                })
            }
        })
    }

    _toSearch = () => {
        const { customerInfo, feeType,otwThis,compSwitch } = this.props;
        const { roomCount, city,hotelHistorRecordList,keyWord,everyPerNum,mapPoi,UseMap } = this.state;
        const {employees,travellers} = this.props.comp_userInfo
        if ((!customerInfo || !customerInfo.Addition.HasHotelAuth) && feeType === 1) {
            otwThis.toastMsg('未开通国内酒店功能');
            return;
        }
        if(!city){
            otwThis.toastMsg('请选择城市');
            return;
        }
        const total = (employees?.length || 0) + (travellers?.length || 0);
        if(total > roomCount * everyPerNum){
            otwThis.toastMsg('每间房最多可入住 2 位客人，您当前选择的总人数与房间数量不匹配，请重新选择需预订的房间数量。');
            return;
        }
        
        let isTravelPolicy = customerInfo.SettingItems.filter(m=>m.Code =='domestic_hotel_chummage_mix_travel_policy' && m.Value=='True').length>0; 
            if(compSwitch && isTravelPolicy && (roomCount != 1 && (employees.length + travellers.length != roomCount))){
                    otwThis.showAlertView('酒店合住差标不适用', () => {
                        return ViewUtil.getAlertButton('取消', () => {
                            otwThis.dismissAlertView();
                        }, '继续预订', () => {
                            otwThis.dismissAlertView();
                            CommonService.HighRiskPC({
                                DepartureCode:this.state.city.Code,
                                ArrivalCode:this.state.city.Code,
                                BusinessCategory:"4"
                            },otwThis).then(res=>{
                                this.props.setHightRiskData(res);
                                this.OrderTravelApply();
                            })
                        })
                    })
            }else{
                CommonService.HighRiskPC({
                    DepartureCode:this.state.city.Code,
                    ArrivalCode:this.state.city.Code,
                    BusinessCategory:"4"
                },otwThis).then(res=>{
                    this.props.setHightRiskData(res);
                    this.OrderTravelApply();
                })
            }
            if (hotelHistorRecordList && Array.isArray(hotelHistorRecordList)) {
                let index = hotelHistorRecordList.findIndex(item => {
                    return item.historyCity.Code === city.Code && item.historyKey === keyWord;
                })
                if (index > -1) {
                    [hotelHistorRecordList[index], hotelHistorRecordList[hotelHistorRecordList.length - 1]] = [hotelHistorRecordList[hotelHistorRecordList.length - 1], hotelHistorRecordList[index]];
                } else 
                {
                    hotelHistorRecordList.push({
                        historyCity:city,
                        historyKey:keyWord,
                    })
                    if (hotelHistorRecordList.length > 6) {
                        hotelHistorRecordList.splice(0, 1);
                    }
                }
                StorageUtil.saveKeyId(Key.HotelSearchedCitysKey,hotelHistorRecordList);
            } 
            if(!keyWord){
                this.setState({
                    mapPoi:null,
                    UseMap:false
                })  
            }else{
                this.setState({})
            }                            
    }

    OrderTravelApply(){
        const { customerInfo, feeType,apply,ReferenceEmployee,otwThis,compSwitch,comp_userInfo, comp_travelers,compCreate_bool} = this.props;
        const {roomCount,selectApplyItem,keyWord,locationId,locationName,mapPoi,UseMap} = this.state
        let chooseLists;
        // if(compSwitch){
            if(compCreate_bool){//判断该综合订单是创建还是继续预订
                if(!comp_userInfo&&!comp_userInfo.userInfo&&!comp_userInfo.employees&&!comp_userInfo.travellers&&!comp_userInfo.ProjectId){
                    return;
                }
                chooseLists = (comp_userInfo&&comp_userInfo.employees).concat(comp_userInfo&&comp_userInfo.travellers)
            }else{
                chooseLists=(comp_travelers&&comp_travelers.compEmployees).concat(comp_travelers&&comp_travelers.compTraveler)
            }
        // }
        let params = {...this.state,keyWord,feeType,customerInfo,ReferenceEmployee,locationId,locationName,roomCount,
            fromCategory: 4,//订单类型 1.国内机票，7国际机票，4国内酒店，6国际酒店，5火车票
            JourneyId:0
        } 
        if(apply){
            let journeyType = 1;
            let journeyid = 0;
            if(apply .TravelApplyMode==1 && apply.JourneyList && apply.JourneyList. length>0){
                //行程模式
                journeyType = selectApplyItem&&selectApplyItem.JourneyType;
                journeyid = selectApplyItem&&selectApplyItem.Id
            }else{
                //目的地模式
                journeyType = apply?.Destination?.JourneyType || journeyType;
            }
            let model ={
                ApplyId:apply.Id, //申请单对象
                JourneyId:journeyid,//申请单行程Id
                Category: 4,//订单类型 1.国内机票，8国际机票，4国内酒店，16国际酒店，2火车票
                Departure: '',//出发城市（查询出发城市）
                Destination: this.state.city.Name,//到达城市（查询到达城市）
                BeginTime:this.state.selectDate.format('yyyy-MM-dd HH:mm'), //出发时间(填查询时间)
                JourneyType:journeyType,//行程类型  单程或往返 1.单程，2.往返
                EndTime:'', //到达时间(填查询时间)
                Travellers:chooseLists, //综合订单自己选的人
                ReferenceEmployeeId:this.props.comp_userInfo&&this.props.comp_userInfo.ReferenceEmployeeId?this.props.comp_userInfo.ReferenceEmployeeId:0,
                ReferencePassengerId:this.props.comp_userInfo&&this.props.comp_userInfo.referencPassengerId,
              };
              params.JourneyId = journeyid
            CommonService.OrderValidateTravelApply(model).then(response => {
                if (response && response.success) {
                    // compSwitch?
                    NavigationUtils.push(this.props.navigation, 'HotelList', { ...this.state,keyWord,feeType,customerInfo,ReferenceEmployee,locationId,locationName,JourneyId:journeyid,mapPoi:mapPoi,UseMap:UseMap }) 
                    // :
                    // NavigationUtils.push(this.props.navigation, 'TravelBookHotelScreen', {...params,JourneyId:journeyid}); 
                } else {
                    otwThis.toastMsg(response.message || '操作失败');
                }
            }).catch(error => {
                otwThis.toastMsg(error.message || '操作失败');
            })
        }else{
            // compSwitch?
            NavigationUtils.push(this.props.navigation, 'HotelList', { ...this.state,keyWord,feeType,customerInfo,ReferenceEmployee,locationId,locationName,mapPoi:mapPoi,UseMap:UseMap })
            // :
            // NavigationUtils.push(this.props.navigation, 'TravelBookHotelScreen', {...params}); 
        }
    }
    /**
     * 获取定位
     */
    async _getLocation(){
        const { callBacklocationAlert } = this.props;
    //    alert('是否允许FCM Mobile使用位置信息，以便为您推荐酒店？')
        if (Platform.OS === "android") {
            callBacklocationAlert(true);
            const result = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
            ]);
            if(result){
                callBacklocationAlert(false);
                MapService.getCurrentPosition().then(response => {
                    this._getCitys(response);
                    }).catch(error => {
                 })
            }
        }else{
             MapService.getCurrentPosition().then(response => {
                this._getCitys(response);
                }).catch(error => {
             })
        }
    }

    _getCitys = (currentPostion) => {
        StorageUtil.loadKeyId(Key.HotelCitysData).then(response => {           
            if (response) {
                this._analyData(response, currentPostion);
            }else{
                this._loadCitys(currentPostion);
            }
        }).catch(error => {
            this._loadCitys(currentPostion);
        })
    }

    _loadCitys = (currentPostion) => {
        const { otwThis } = this.props;
        HotelService.getHotelCityList().then(response => {
            otwThis.hideLoadingView();
            if (response && response.success) {
              
                StorageUtil.saveKeyId(Key.HotelCitysData, response.data);
                this._analyData(response.data, currentPostion);
            } else {
                otwThis.toastMsg(response.message || '获取城市信息失败');
            }
        }).catch(error => {
            otwThis.hideLoadingView();
            otwThis.toastMsg(error.message || '获取城市信息失败');
        })
    }

    _analyData = (data, currentPostion) => {
        const { otwThis } = this.props;
        otwThis.hideLoadingView();
        if (!data || !currentPostion || !currentPostion.city) return;
        //if (!data || !currentPostion ) return;
        let obj = data.find(item => (item.Name.includes(currentPostion.city) || currentPostion.city.includes(item.Name)));
        if (!obj) {
            otwThis.toastMsg('未获取所在城市');
            return;
        }
        this.setState({
            city: obj,
            currtentPosition: currentPostion
        })
    }

    _changeLiveDay = (index) => {
        const { otwThis,customerInfo } = this.props;
        if (index === 1) {
            if (this.state.longDay <= 1) {
                otwThis.toastMsg('最少入住天数为1天');
                this.setState({
                    longDay: 1
                })
                return;
            } else {
                this.state.longDay--;
                this.setState({
                })
            }
        } else {
            if(this.state.longDay<30){
                this.state.longDay++;
            }else{
                Pop.show(
                    <View style={styles.alertStyle}>
                      <View style={{flexDirection:'row'}}>
                          <View style={{width:'100%',alignItems:'center'}}>
                             <CustomText text={'温馨提示'} style={{margin:6,fontSize:18, fontWeight:'bold'}} />
                             <View style={{flexDirection:'row',flexWrap:'wrap',alignItems:'center',justifyContent:'center'}}>
                                <CustomText text={'预订30天以上需要人工处理，请致电：'} 
                                            style={{fontSize:15,paddingTop:6}} />
                                <CustomText style={{ fontSize: 15, color: 'rgba(0, 122, 204, 1)',paddingTop:6,textDecorationLine:'underline' }} 
                                            onPress={this._btnContactTel}
                                            text={customerInfo&& customerInfo.Setting && customerInfo.Setting.ServiceTelExtras && customerInfo.Setting.ServiceTelExtras.Origin? customerInfo.Setting.ServiceTelExtras.Origin:'13121508893'} />
                                <CustomText text={'，我们会竭诚为您服务'} 
                                         style={{fontSize:15,paddingTop:6}} />
                             </View>
                             <View style={{height:1,width:'100%',backgroundColor:'lightgray',marginTop:10}}/>
                             <TouchableHighlight underlayColor='transparent' style={{height:40,width:250,alignItems:'center',justifyContent:'center'}}
                                 onPress={()=>{Pop.hide()}}
                             >
                                 <CustomText  text='确定' style={{fontSize:19,color:Theme.theme}}/>
                             </TouchableHighlight>
                          </View>
                      </View>
                    </View>
                    ,{animationType: 'fade', maskClosable: true, onMaskClose: ()=>{}})
            }
            this.setState({});
        }
    }

    /**
     * 联系客服
     */
    _btnContactTel = () => {
        var url = 'tel:13121508893';
        const {customerInfo} = this.props;
        if(customerInfo&& customerInfo.Setting && customerInfo.Setting.ServiceTelExtras && customerInfo.Setting.ServiceTelExtras.Tel){
            url = `tel:${customerInfo.Setting.ServiceTelExtras.Tel}`
        }
        Linking.canOpenURL(url).then(supported => {
            if (supported) {
            return Linking.openURL(url);
            } else {
            console.log('Can\'t handle url: ' + url);
            }
        }).catch(err => {
            console.log(err);
        });
    }

    _select=()=>{
        const {callBack, otwThis} = this.props;
        const {city} = this.state;
        if(!city){
            otwThis.toastMsg('请选择城市');
        }
        this.setState({
            keyOff:false
        })
        callBack(this.state);
    }
    toggleModal = () => {
        this.setState({
            isModalVisible: !this.state.isModalVisible,
        });
    }
    render() {
        const { city, selectDate, longDay, keyOff, roomCount, everyPerNum,returDay,keyWord,isModalVisible } = this.state;
        const {customerInfo,cityList} = this.props;
        return (
            <ScrollView>
                <View style={{backgroundColor:'#fff'}}>
                    <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',borderBottomWidth:1,borderColor:Theme.lineColor}}>
                        <TouchableOpacity underlayColor='transparent' onPress={this._gotoSelectCity}>
                            <View style={{height:66,alignItems:'center',justifyContent:'center',}}>
                                <CustomText style={{ fontSize: 18, color:(city||cityList)?'black':Theme.promptFontColor }} text={(city? Util.Parse.isChinese() ? city.Name : city.EnName:'请选择城市')} /> 
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity underlayColor='transparent' style={{}} onPress={()=>{this._getLocation()}}>
                            <Image source={require('../../res/Uimage/hotelFloder/location.png')} style={{width:24,height:24,marginRight:5}}/>
                        </TouchableOpacity>
                    </View>
                    <View style={{flexDirection:'row',justifyContent:'space-between',paddingVertical:10,borderBottomWidth:1,borderColor:Theme.lineColor,height:66,justifyContent:'space-between',alignItems:'center'}}>
                        <TouchableOpacity underlayColor='transparent' onPress={()=>{this.toggleModal()}} style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                            <CustomText style={{ fontSize: 16 }} text={selectDate.format('yyyy-MM-dd')} /> 
                            <CustomText style={{ fontSize: 12,marginLeft:3 }} text={Util.Parse.isChinese() ?Util.Date.getWeekDesc(selectDate):''} /> 
                        </TouchableOpacity>
                        <CustomText style={{color:Theme.theme}} text={longDay+'晚'} />
                        <TouchableOpacity underlayColor='transparent' onPress={()=>{this.toggleModal()}} style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                            <CustomText style={{ fontSize: 16 }} text={returDay.format('yyyy-MM-dd')} /> 
                            <CustomText style={{ fontSize: 12 ,marginLeft:3}} text={Util.Parse.isChinese() ?Util.Date.getWeekDesc(returDay):''} /> 
                        </TouchableOpacity>
                    </View>
                    <View style={{flexDirection:'row',justifyContent: 'space-between',height:66,alignItems:'center',borderBottomWidth:1,borderColor:Theme.lineColor}}>
                        <CustomText text='间数'style={{fontSize:14}} />
                        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginRight:-10}}>
                            <TouchableHighlight onPress={this._changeRoomCount.bind(this, 1)} underlayColor='transparent'>
                                <View style={styles.addStyle}>
                                    <AntDesign name={'minuscircleo'} size={18} color={Theme.theme} />
                                </View>
                            </TouchableHighlight>
                            <CustomText style={{ color: Theme.theme, fontSize:14 }} text={roomCount} />
                            <TouchableHighlight onPress={this._changeRoomCount.bind(this, 2)} underlayColor='transparent'>
                                <View style={styles.addStyle}> 
                                    <AntDesign name={'pluscircleo'} size={18} color={Theme.theme} />
                                </View>  
                            </TouchableHighlight>
                        </View>
                    </View>
                    <View style={{flexDirection:'row',justifyContent: 'space-between',height:66,alignItems:'center',borderBottomWidth:1,borderColor:Theme.lineColor}}>
                       <CustomText text='每间人数'style={{fontSize:14}} />
                       <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginRight:-10}}>
                            <TouchableHighlight onPress={this._changePersonCount.bind(this, 1)}  underlayColor='transparent'>
                                <View style={styles.addStyle}>
                                    <AntDesign name={'minuscircleo'} size={18} color={Theme.theme} />
                                </View>
                            </TouchableHighlight>
                            <CustomText style={{ color: Theme.theme, fontSize:14 }} text={ everyPerNum } />
                            <TouchableHighlight onPress={this._changePersonCount.bind(this, 2)} underlayColor='transparent'>
                                <View style={styles.addStyle}> 
                                    <AntDesign name={'pluscircleo'} size={18} color={Theme.theme} />
                                </View>  
                            </TouchableHighlight>
                       </View>
                    </View>
                    <View style={styles.rowView}>
                            <CustomText returnKeyType='done' ref='hotelLandMarkTextInput' 
                                             text = {
                                                keyOff?'(选填) 酒店名/地标/商圈':
                                                keyWord?keyWord:'(选填) 酒店名/地标/商圈'
                                             }
                                             style={{ flex: 1, fontSize: 14,color:!keyWord?Theme.promptFontColor:Theme.fontColor }} 
                                             onPress={this._select}
                            />
                    </View>
                    { 
                        customerInfo&&customerInfo.Addition&&customerInfo.Addition.HasTravelApplyAuth?
                        this._chooseApply()
                        :null
                    }
                    <View style={{marginHorizontal:-20,}}>
                    <View style={{marginHorizontal:10}}>
                    {   
                        ViewUtil.getSubmitButton2('查询', this._toSearch)
                    }
                    {
                        everyPerNum>1?
                        <CustomText style={{color:Theme.redColor,fontSize:13,marginHorizontal:10,marginTop:-10,marginBottom:10}} text='每间房如 2 人入住，需在订单提交页完善每间房 2 位入住人的信息。'/>
                        :null
                    }
                    </View>
                    {
                      this.props.SerialNumber ? null : this._historySearchCity()
                    }
                    </View>
                    <Modal
                        visible={isModalVisible}
                        transparent={true}
                        animationType="slide"
                        onRequestClose={()=>{this.toggleModal()}}
                    >
                        <View style={styles.modalOverlay}>
                            <TouchableOpacity style={styles.modalOverlay} onPress={()=>{this.toggleModal()}} />
                            <View style={{
                                        backgroundColor: 'white',
                                        paddingHorizontal: 10,
                                        alignItems: 'center',
                                        height: global.screenHeight * 0.7,
                                    }}>
                                <View style={{height:40,width:global.screenWidth,backgroundColor:Theme.greenBg,justifyContent:'center'}}>
                                    <CustomText style={{color:Theme.theme,fontSize:13,textAlign:'center'}} text='所选日期为酒店当地日期'/>
                                </View>
                                <TestScreen
                                    startDate={selectDate}
                                    endDate={returDay}
                                    touchEvent={(dateSt) => {
                                        this.toggleModal()
                                        let day1 = Util.Date.toDate(dateSt[0]);
                                        let day2 = Util.Date.toDate(dateSt[1]);
                                        let _longDay = Util.Date.getDiffDay(day1,day2)
                                        this.setState({
                                            selectDate:dateSt[0],
                                            returDay:dateSt[1],
                                            longDay:_longDay
                                        })
                                    }}
                                />
                            </View>
                        </View>
                    </Modal>
                </View>
            </ScrollView >
        )
    }

    _historySearchCity = () => {
        const { hotelHistorRecordList } = this.state;
        if (!hotelHistorRecordList || hotelHistorRecordList.length === 0) return; 
            let obj = {};
            let historyArr = hotelHistorRecordList.filter(function (item, index, arr) {
                return obj.hasOwnProperty(typeof item + JSON.stringify(item)) ? false : (obj[typeof item + JSON.stringify(item)] = true);
            });
        return (
            <View style={{}}>
                <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginHorizontal:20}}>
                    <Text style={{fontSize:13 }}>{I18nUtil.translate('近期查询')}</Text>
                    <CustomText 
                    onPress={this._clearHistory} 
                    style={{ color: Theme.theme }} text='清除' />
                </View>
                <View style={ styles.historView}>
                    {
                        historyArr.map((item, index) => {
                            return (
                                <View style={{alignItems:'center', justifyContent:'center',margin:5, borderWidth:1,borderRadius:2,borderColor:Theme.promptFontColor}} >
                                  <CustomText key={index} style={styles.histortText} 
                                              onPress={this._historySearchCityTouch.bind(this, item)} 
                                              text={(Util.Parse.isChinese() ? item.historyCity.Name : item.historyCity.EnName)+(item.historyKey?('-' +  item.historyKey):'')
                                              } />
                                </View>
                            )
                        })
                    }
                </View>
            </View>
        )
    }

    /**
     *  点击历史给城市赋值
     */
    _historySearchCityTouch = (item) => {
        this.setState({
            city: {...item.historyCity},
            keyWord:item.historyKey
        })
    }
    /**
     *  清除历史记录
     */
    _clearHistory = () => {
        this.setState({
            hotelHistorRecordList: []
        }, () => {
            StorageUtil.removeKeyId(Key.HotelSearchedCitysKey);
        })
    }

    _changeRoomCount = (index) => {
        const { otwThis } = this.props;
        if (index === 1) {
            if (this.state.roomCount <= 1) {
                otwThis.toastMsg('最少预订为1间');
                this.setState({
                    roomCount: 1
                })
                return;
            } else {
                this.state.roomCount--;
                this.setState({
                })
            }
        } else {
            const {employees,travellers} = this.props.comp_userInfo
            if(employees.length + travellers.length <= this.state.roomCount){
                    otwThis.toastMsg('房间数不能大于出差人数！');
                    return
            }
            else{
                if(this.state.roomCount<5){
                    this.state.roomCount++;
                    this.setState({});
                }else{
                    otwThis.toastMsg('房间数不能大于5间');
                } 
            }
        }
    }

    _changePersonCount = (index) => {
     const { otwThis } = this.props;
     if (index === 1) {
            if (this.state.everyPerNum <= 1) {
                this.setState({
                    everyPerNum: 1
                })
                return;
            } else {
                this.state.everyPerNum--;
                this.setState({
                })
            }
        }else if (index === 2) {
            if(this.state.everyPerNum <= 1){
                this.state.everyPerNum++;
                this.setState({});
            }else{
                otwThis.toastMsg('一间房最多住两人');
            }
        }
    }

    _chooseApply = () => {
        const { applyNum } = this.state;
        const { noApply,bCategory,compSwitch,backToTop } = this.props;
        return(
            <View style={{ flexDirection: 'row', height: 66, alignItems: 'center',backgroundColor:'#fff',  borderBottomWidth:1,borderColor:Theme.lineColor  }}>
                <TouchableOpacity 
                // disabled={(noApply||bCategory)?true:false}
                disabled={compSwitch?(this.props.selectTap===4&&this.props.SerialNumber?false:true):true}
                // disabled={this.props.selectTap===4&&this.props.SerialNumber?true:false}   
                underlayColor='transparent' style={{flex: 1, justifyContent:'space-between'}} onPress={this._chooseApplybtn.bind(this)}>
                        <View style={{
                                    alignItems: 'center', 
                                    flexDirection:'row',
                                    justifyContent:'space-between'
                            }}>
                            <CustomText  text={applyNum?applyNum:'请选择申请单'} style={{color:!applyNum?Theme.promptFontColor:Theme.fontColor,fontSize:14}} /> 
                            <TouchableOpacity style={{height:36,width:36,alignItems:'center',justifyContent:'center'}}
                                onPress={()=>{
                                        this.props.setApply();
                                        this.setState({
                                            applyNum:null
                                        })
                                }}
                            >
                                {((applyNum&&!this.props.SerialNumber)||(applyNum&&backToTop&&this.props.SerialNumber))?<AntDesign name="close" size={18} style={{color:Theme.promptFontColor}}></AntDesign>:null}
                            </TouchableOpacity> 
                             <AntDesign name={'right'} size={16} color={Theme.promptFontColor} />
                        </View>     
                </TouchableOpacity>
            </View>
        )
    }

    _chooseApplybtn = () => {
        const {SerialNumber,flightInfo} = this.props;
        const { applyNum,applySerialNumber } = this.state;
        NavigationUtils.push(this.props.navigation, 'ApplicationSelect2', { 
            from: 'hotel',
            SerialNumber:SerialNumber?SerialNumber:applySerialNumber?applySerialNumber:applyNum,
            callBack:(obj,arrivalCityDisplay,goCityDisplay,BeginTime,EndTime,selectApplyItem)=>{
                let passengerCount = 1;
                let applyRoomCount=1
                if(selectApplyItem&&selectApplyItem.ExtensionJson && selectApplyItem.ExtensionJson.HotelExtensionJson && selectApplyItem.ExtensionJson.HotelExtensionJson.RoomNumber){
                    applyRoomCount = selectApplyItem.ExtensionJson.HotelExtensionJson.RoomNumber
                }
                // if(selectApplyItem&&selectApplyItem.ExtensionJson&&selectApplyItem.ExtensionJson.HotelExtensionJson.ChummageRoomConfigs&&selectApplyItem.ExtensionJson.HotelExtensionJson.ChummageRoomConfigs.length>0){
                //     selectApplyItem.ExtensionJson.HotelExtensionJson.ChummageRoomConfigs.map((item)=>{
                //         if(item.ChummagePassengers&&item.ChummagePassengers.length>0 && item.ChummagePassengers.length>passengerCount ){
                //             passengerCount = item.ChummagePassengers.length;
                //         }
                //     })
                // }
                if (
                    selectApplyItem?.ExtensionJson?.HotelExtensionJson?.ChummageRoomConfigs?.length > 0
                ) {
                    selectApplyItem.ExtensionJson.HotelExtensionJson.ChummageRoomConfigs.forEach(item => {
                        if (Array.isArray(item.ChummagePassengers) && item.ChummagePassengers.length > passengerCount) {
                            passengerCount = item.ChummagePassengers.length;
                        }
                    });
                }
                let Btime = Util.Date.toDate(BeginTime)
                let day1 = Util.Date.toDate(BeginTime);
                let day2 = Util.Date.toDate(EndTime);
                let longDay = Util.Date.getDiffDay(day1,day2)
                let num = obj.TravellerList&&obj.TravellerList.length
                this.setState({
                   applyNum:obj.SerialNumber,
                   city: arrivalCityDisplay||{Code:"C110100", Name: "北京", EnName: "Beijing", Letters: null, Hot: 6},
                   selectDate: Btime&&Btime > new Date() ? Btime : new Date(),
                   longDay: longDay?longDay:1,
                   selectApplyItem:selectApplyItem,
                   everyPerNum:passengerCount,
                   roomCount: applyRoomCount,
                })
            }
        }); 
    }
}

const getProps = (state) => ({
    apply: state.apply.apply,
    compSwitch: state.compSwitch.bool,
    comp_userInfo: state.comp_userInfo,
    comp_travelers: state.comp_travelers,
    compCreate_bool:state.compCreate_bool.bool
})

const getAction = dispatch => ({
    setHightRiskData: (value) => dispatch(action.highRiskSetData(value)),
    setApply: (value) => dispatch(action.applySet(value)),    
})

function SearchViewWrapper(props) {
    const navigation = useNavigation();
    return <SearchView {...props} navigation={navigation} />;
}

export default connect(getProps,getAction)(SearchViewWrapper);

const styles = StyleSheet.create({
    rowView: {
        borderBottomWidth: 1,
        borderBottomColor: Theme.lineColor,
        height: 66,
        flexDirection: 'row',
        backgroundColor: 'white',
        alignItems: 'center',
    },
    alertStyle:{
        width: '80%', 
        backgroundColor:'#fff',
        borderRadius:8,
        padding:10,
    },
    addStyle:{
        height:40,
        width:50,
        // borderRadius:5,
        alignItems:'center',
        justifyContent:'center',
       
        // elevation:1.5, shadowColor:'#444444', shadowOffset:{width:2,height:2}, shadowOpacity: 0.7, shadowRadius: 1.6
    },
    histortText: {
        height: 26,
        color: Theme.darkColor,
        fontSize: 13,
        lineHeight: 26,
        textAlign: 'center',
        borderRadius:15,
        paddingHorizontal:3
    },
    historView:{ 
        flexDirection: 'row', 
        flexWrap: 'wrap',
        paddingTop:10,
        paddingHorizontal:15,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    modalText: {
        fontSize: 18,
        marginBottom: 10,
    },
    closeButton: {
        fontSize: 16,
        color: Theme.theme,
    },
})
