import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableHighlight,
    DeviceEventEmitter,
    Linking,
    TouchableOpacity,
    Modal
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import CustomText from '../../custom/CustomText';
import Theme from '../../res/styles/Theme';
import ViewUtil from '../../util/ViewUtil';
import PropTypes from 'prop-types';
// import { withNavigation } from 'react-navigation';
import { useNavigation } from '@react-navigation/native';
import NavigationUtils from '../../navigator/NavigationUtils';
import Util from '../../util/Util';
import CustomTextInput from '../../custom/CustomTextInput';
import {connect} from 'react-redux'
import CommonService from '../../service/CommonService';
import action  from '../../redux/action';
import Pop from 'rn-global-modal';
import StorageUtil from '../../util/StorageUtil';
import Key from '../../res/styles/Key';
import I18nUtil from '../../util/I18nUtil';
import TestScreen from '../hotel/TestScreen';

class IntlHotelSearchView extends React.Component {
    static propTypes = {
        otwThis: PropTypes.object.isRequired,
        feeType: PropTypes.number.isRequired,
        customerInfo: PropTypes.object.isRequired
    }
    componentDidUpdate(prevProps,prevState) {
        if (JSON.stringify(prevProps.cityList) !== JSON.stringify(this.props.cityList)) {
            this.setState({ city: this.props.cityList });
        }
        if (JSON.stringify(prevProps.keyWord) !== JSON.stringify(this.props.keyWord)) {
            this.setState({ keyWord: this.props.keyWord });
        }
    }
    constructor(props) {
        super(props);
        let Btime = Util.Date.toDate(this.props.BeginTime)
        let employLength = this.props.comp_userInfo&&this.props.comp_userInfo.employees&&this.props.comp_userInfo.employees.length || 0
        // let travelLength = this.props.comp_userInfo&&this.props.comp_userInfo.travellers&&this.props.comp_userInfo.travellers.length || 0
        let selectDate = Btime&&Btime > new Date() ? Btime : new Date();
        this.state = {
            city:this.props.cityList,
            selectDate: Btime&&Btime > new Date() ? Btime : new Date(),
            longDay: this.props.apllyDays?this.props.apllyDays:1,
            roomCount: 1,
            applyNum:this.props.selectTap===6?this.props.apply&&this.props.apply.SerialNumber:null,
            everyPerNum:1,
            selectApplyItem:this.props.selectApplyItem,
            keyOff: false,
            returDay:selectDate.addDays(this.props.apllyDays?this.props.apllyDays:1),
            intHotelHistorRecordList:[],
            keyWord:this.props.keyWord&&this.props.keyWord,
            isModalVisible:false,
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
        StorageUtil.loadKeyId(Key.IntHotelSearchedCitysKey).then(response => {
            if (response && Array.isArray(response) && response.length > 0) {
                let obj = response[response.length - 1];
                this.setState({
                    // city: obj.historyCity,
                    // keyWord: obj.historyKey,
                    intHotelHistorRecordList: response
                })
            }
        }).catch(error => {
            // this.toastMsg(error.message || '获取数据异常');
        })
    }

    /**
     *  选择日期
     */
    _gotoSelectDate = (index) => {
        NavigationUtils.push(this.props.navigation, 'Calendar', {
            backDate: (date) => {
                const calculateDayDifference = (start, end) => 
                    Math.ceil((end - start) / (1000 * 60 * 60 * 24));//计算两个日期之间的天数
                
                this.setState((prevState) => {
                    const newState = {};
                    if (index === 1) {
                        {
                            newState.selectDate = date;
                            if(date>=prevState.returDay){
                                newState.returDay = date.addDays(1);
                                newState.longDay = calculateDayDifference(date, newState.returDay);
                            }else{
                                newState.longDay = calculateDayDifference(date, prevState.returDay);
                            } 
                        }
                    } else {
                        newState.returDay = date;
                        newState.longDay = calculateDayDifference(prevState.selectDate, date);
                    }
                    return newState;
                });
            }
        });
    }

    _gotoSelectCity = () => {
        NavigationUtils.push(this.props.navigation, 'IntlHotelCity', {
            setBackCity: (city) => {
                this.setState({
                    city: city,
                    keyOff:true
                })
            }
        })
    }

    _changeLiveDay = (index) => {
        const { otwThis, customerInfo } = this.props;
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
            }else{
                if(this.state.roomCount<5){
                    this.state.roomCount++;
                    this.setState({});
                }else{
                    otwThis.toastMsg('房间数不能大于5间');
                } 
            }
        }
    }

    _changeAvreage = (index) => {
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

    _toSearch = () => {
        const { otwThis, customerInfo,compSwitch } = this.props;
        const {roomCount,intHotelHistorRecordList,city,keyWord,everyPerNum} = this.state
        const {employees,travellers} = this.props.comp_userInfo
        if (!customerInfo || !customerInfo.Addition || !customerInfo.Addition.HasInterHotelAuth) {
            otwThis.toastMsg('未开通港澳台及国际酒店功能');
            return;
        }
        if (!this.state.city) {
            otwThis.toastMsg('请选择城市');
            return;
        }
        const total = (employees?.length || 0) + (travellers?.length || 0);
        if(total > roomCount * everyPerNum){
            otwThis.toastMsg('每间房最多可入住 2 位客人，您当前选择的总人数与房间数量不匹配，请重新选择需预订的房间数量。');
            return;
        }
        
        
            let isTravelPolicy = customerInfo.SettingItems.filter(m=>m.Code =='domestic_hotel_chummage_mix_travel_policy' && m.Value=='True').length>0; 
            if(compSwitch &&  employees.length != this.state.roomCount && roomCount != 1 && isTravelPolicy){
                otwThis.showAlertView('酒店合住差标不适用', () => {
                    return ViewUtil.getAlertButton('取消', () => {
                        otwThis.dismissAlertView();
                    }, '继续预订', () => {
                        otwThis.dismissAlertView();
                        CommonService.HighRiskPC({
                            DepartureCode:this.state.city.Code,
                            ArrivalCode:this.state.city.Code,
                            BusinessCategory:"16"
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
                    BusinessCategory:"16"
                },otwThis).then(res=>{
                    this.props.setHightRiskData(res);
                    this.OrderTravelApply();
                })  
            }
            if (intHotelHistorRecordList && Array.isArray(intHotelHistorRecordList)) {
                let index = intHotelHistorRecordList.findIndex(item => {
                    return item.historyCity.Code === city.Code && item.historyKey === keyWord;
                })
                if (index > -1) {
                    [intHotelHistorRecordList[index], intHotelHistorRecordList[intHotelHistorRecordList.length - 1]] = [intHotelHistorRecordList[intHotelHistorRecordList.length - 1], intHotelHistorRecordList[index]];
                } else 
                {
                    intHotelHistorRecordList.push({
                        historyCity:city,
                        historyKey:keyWord,
                    })
                    if (intHotelHistorRecordList.length > 6) {
                        intHotelHistorRecordList.splice(0, 1);
                    }
                }
                this.setState({
                    intHotelHistorRecordList: intHotelHistorRecordList
                })
                StorageUtil.saveKeyId(Key.IntHotelSearchedCitysKey,intHotelHistorRecordList);
            }
    }

    OrderTravelApply(){
        const { customerInfo, feeType,apply,otwThis,compSwitch,comp_userInfo,compCreate_bool,comp_travelers } = this.props;
        const {selectApplyItem,keyWord} = this.state;
        let chooseLists;
        // if(compSwitch){
            if(compCreate_bool){//判断该综合订单是创建还是继续预订
                if(!comp_userInfo&&!comp_userInfo.userInfo&&!comp_userInfo.employees&&!comp_userInfo.ProjectId){
                    return;
                }
                chooseLists = comp_userInfo&&comp_userInfo.employees
            }else{
                chooseLists= comp_travelers&&comp_travelers.compEmployees
            }
        // }
        let params = { ...this.state,
                       keyWord,feeType,customerInfo,
                       fromCategory: 6,//订单类型 1.国内机票，7国际机票，4国内酒店，6国际酒店，5火车票
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
                Category: 16,//订单类型 1.国内机票，8国际机票，4国内酒店，16国际酒店，2火车票
                Departure: '',//出发城市（查询出发城市）
                Destination: this.state.city.Name,//到达城市（查询到达城市）
                BeginTime:this.state.selectDate.format('yyyy-MM-dd HH:mm'), //出发时间(填查询时间)
                JourneyType:journeyType,//行程类型  单程或往返 1.单程，2.往返
                EndTime:'', //到达时间(填查询时间)
                Travellers:chooseLists, //综合订单自己选的人
                ReferenceEmployeeId:this.props.comp_userInfo&&this.props.comp_userInfo.ReferenceEmployeeId?this.props.comp_userInfo.ReferenceEmployeeId:0,
                ReferencePassengerId:this.props.comp_userInfo&&this.props.comp_userInfo.referencPassengerId,
              };
            CommonService.OrderValidateTravelApply(model).then(response => {
                if (response && response.success) {
                    // compSwitch?
                    NavigationUtils.push(this.props.navigation, 'IntlHotelList', { ...this.state,keyWord,feeType,customerInfo,JourneyId:journeyid},)
                    // :
                    // NavigationUtils.push(this.props.navigation, 'TravelBookScreen', {...params,...this.state,JourneyId:journeyid}); 
                } else {
                    otwThis.toastMsg(response.message || '操作失败');
                }
            }).catch(error => {
                otwThis.toastMsg(error.message || '操作失败');
            })
        }else{
            // compSwitch?
            NavigationUtils.push(this.props.navigation, 'IntlHotelList', { ...this.state,keyWord,feeType,customerInfo},)
            // :
            // NavigationUtils.push(this.props.navigation, 'TravelBookScreen', {...params,...this.state});
        }
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
        const { city, selectDate, longDay, roomCount ,keyOff,everyPerNum,returDay,keyWord,isModalVisible} = this.state;
        const { customerInfo } = this.props;
        return (
            <View >
                <View style={{backgroundColor:'#fff'}}>
                    <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',borderBottomWidth:1,borderColor:Theme.lineColor}}>
                        <TouchableHighlight underlayColor='transparent' onPress={this._gotoSelectCity}>
                            <View style={{height:66,alignItems:'center',justifyContent:'center',}}>
                                <CustomText style={{ fontSize: 18 ,
                                                     color:city ?(Util.Parse.isChinese()?Theme.fontColor:Theme.promptFontColor):Theme.promptFontColor,
                                                  }}
                                text={city ? (Util.Parse.isChinese() ? city.Name : city.EnName) : '请选择城市'} />
                            </View>
                        </TouchableHighlight>
                    </View>
                    <View style={{flexDirection:'row',justifyContent:'space-between',paddingVertical:10,borderBottomWidth:1,borderColor:Theme.lineColor,height:66,justifyContent:'space-between',alignItems:'center'}}>
                        <TouchableHighlight underlayColor='transparent' onPress={()=>{this.toggleModal()}}>
                            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                                <CustomText style={{ fontSize: 16 }} text={selectDate.format('yyyy-MM-dd')} /> 
                                <CustomText style={{ fontSize: 12,marginLeft:3 }} text={Util.Parse.isChinese() ?Util.Date.getWeekDesc(selectDate):''} /> 
                            </View>
                        </TouchableHighlight>
                        <CustomText style={{color:Theme.theme}} text={longDay+'晚'} />
                        <TouchableHighlight underlayColor='transparent' onPress={()=>{this.toggleModal()}}>
                            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                                <CustomText style={{ fontSize: 16 }} text={returDay.format('yyyy-MM-dd')} /> 
                                <CustomText style={{ fontSize: 12,marginLeft:3 }} text={Util.Parse.isChinese() ?Util.Date.getWeekDesc(returDay):''} /> 
                            </View>
                        </TouchableHighlight>
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
                            <TouchableHighlight onPress={this._changeAvreage.bind(this, 1)}  underlayColor='transparent'>
                                <View style={styles.addStyle}>
                                    <AntDesign name={'minuscircleo'} size={18} color={Theme.theme} />
                                </View>
                            </TouchableHighlight>
                            <CustomText style={{ color: Theme.theme, fontSize:14 }} text={everyPerNum} />
                            <TouchableHighlight onPress={this._changeAvreage.bind(this, 2)} underlayColor='transparent'>
                                <View style={styles.addStyle}> 
                                    <AntDesign name={'pluscircleo'} size={18} color={Theme.theme} />
                                </View>  
                            </TouchableHighlight>
                       </View>
                    </View>
                    {/* <View style={styles.rowView2}>
                        <CustomTextInput returnKeyType='done' ref='hotelLandMarkTextInput' onChangeText={text => this.setState({ keyWord: text })} placeholder='(选填) 地标/商圈' style={{ flex: 1, fontSize: 15, textAlign: 'center' }} />
                    </View> */}
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
                        // customerInfo&&customerInfo.Setting&&customerInfo.Setting.HotelTravelApplyConfig.IsOnlyApply?
                        // this._chooseApply():
                        // null
                        customerInfo&&customerInfo.Addition&&customerInfo.Addition.HasTravelApplyAuth?
                        this._chooseApply()
                        :null
                    }
                </View>
                <View style={{marginHorizontal:-20,paddingBottom:10}}>
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
                <View style={{marginHorizontal:10}}>
                {
                    ViewUtil.getSubmitButton2('查询', this._toSearch)
                }
                {
                    everyPerNum>1?
                    <CustomText style={{color:Theme.redColor,fontSize:13,marginHorizontal:10,marginTop:-10,marginBottom:10}} text='每间房如 2 人入住，需在订单提交页完善每间房 2 位入住人的信息。'/>
                    :null
                }
                {
                    this.props.SerialNumber ? null : this._historySearchCity()
                }
                </View>
                </View>
            </View >
        )
    }

    _historySearchCity = () => {
        const { intHotelHistorRecordList } = this.state;
        if (!intHotelHistorRecordList || intHotelHistorRecordList.length === 0) return; 
            let obj = {};
            let historyArr = intHotelHistorRecordList.filter(function (item, index, arr) {
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
            intHotelHistorRecordList: []
        }, () => {
            StorageUtil.removeKeyId(Key.IntHotelSearchedCitysKey);
        })
    }
    
    _chooseApply = () => {
        const { applyNum } = this.state;
        const { noApply,bCategory,compSwitch,backToTop } = this.props;
        return(
            <View style={{ flexDirection: 'row', height: 66, alignItems: 'center',backgroundColor:'#fff',  borderBottomWidth:1,borderColor:Theme.lineColor  }}>
                <TouchableHighlight 
                    //  disabled={(noApply||bCategory)?true:false}
                     disabled={compSwitch?(this.props.selectTap===6&&this.props.SerialNumber?false:true):true} 
                     underlayColor='transparent' style={{ flex: 1}} onPress={this._chooseApplybtn.bind(this)}>
                    <View style={{ flexDirection: 'row', height: 60, alignItems: 'center'}}>
                        <View style={{ 
                                alignItems: 'center', 
                                flexDirection:'row',
                                justifyContent:'space-between' 
                                }}>
                            <CustomText  text={applyNum?applyNum:'请选择申请单'} style={{color:!applyNum?Theme.promptFontColor:Theme.fontColor,fontSize:14}}/> 
                            <TouchableOpacity style={{height:36,width:36,alignItems:'center',justifyContent:'center'}}
                                onPress={()=>{
                                        this.props.setApply();
                                        this.setState({
                                            applyNum:null
                                        })
                                }}
                            >
                                {((applyNum&&!this.props.SerialNumber)||(applyNum&&backToTop&&this.props.SerialNumber)) ? <AntDesign name="close" size={18} style={{color:Theme.promptFontColor}}></AntDesign>:null}
                            </TouchableOpacity> 
                        </View>     
                    </View>
                </TouchableHighlight>
            </View>
        )
    }

    _chooseApplybtn = () => {
        const {SerialNumber} = this.props;
        NavigationUtils.push(this.props.navigation, 'ApplicationSelect2', { 
            from: 'intlHotel',
            SerialNumber:SerialNumber,
            callBack:(obj,arrivalCityDisplay,goCityDisplay,BeginTime,EndTime,selectApplyItem)=>{
                let passengerCount = 1;
                let applyRoomCount=1
                if(selectApplyItem && selectApplyItem.ExtensionJson && selectApplyItem.ExtensionJson.HotelExtensionJson && selectApplyItem.ExtensionJson.HotelExtensionJson.RoomNumber){
                    applyRoomCount = selectApplyItem.ExtensionJson.HotelExtensionJson.RoomNumber
                }
                // if(selectApplyItem && selectApplyItem.ExtensionJson&&selectApplyItem.ExtensionJson.HotelExtensionJson.ChummageRoomConfigs&&selectApplyItem.ExtensionJson.HotelExtensionJson.ChummageRoomConfigs.length>0){
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
                this.setState({
                   applyNum:obj.SerialNumber,
                   city:arrivalCityDisplay,
                   selectDate: Btime&&Btime > new Date() ? Btime : new Date(),
                   longDay: longDay?longDay:1,
                   selectApplyItem:selectApplyItem,
                   everyPerNum:passengerCount,
                   roomCount:applyRoomCount
                })
            }
        }); 
    }
}

const getPropsState = state => ({
    compCreate_bool:state.compCreate_bool.bool,
    compSwitch:state.compSwitch.bool,
    comp_travelers: state.comp_travelers,
    apply: state.apply.apply,
    comp_userInfo: state.comp_userInfo,
})

const getAction = dispatch => ({
    setHightRiskData: (value) => dispatch(action.highRiskSetData(value)),
    setApply: (value) => dispatch(action.applySet(value)),
})

function IntlHotelSearchViewWrapper(props) {
    const navigation = useNavigation();
    return <IntlHotelSearchView {...props} navigation={navigation} />;
}

export default connect(getPropsState,getAction)(IntlHotelSearchViewWrapper)

const styles = StyleSheet.create({
    rowView: {
        borderBottomWidth: 1,
        borderBottomColor: Theme.lineColor,
        height: 66,
        flexDirection: 'row',
        backgroundColor: 'white',
        alignItems: 'center',
    },
    rowView2: {
        borderBottomWidth: 1,
        borderBottomColor: Theme.lineColor,
        height: 60,
        flexDirection: 'row',
        backgroundColor: 'white',
        alignItems: 'center',
        paddingHorizontal: 10,
        borderBottomLeftRadius:8,
        borderBottomRightRadius:8,
    },
    addStyle:{
        height:40,
        width:50,
        // borderRadius:5,
        alignItems:'center',
        justifyContent:'center',
        // elevation:1.5, shadowColor:'#444444', shadowOffset:{width:2,height:2}, shadowOpacity: 0.7, shadowRadius: 1.6
    },
    dateStyle:{ 
        justifyContent: 'center', 
        alignItems: 'center', 
        height:30,
        width:160,
        backgroundColor:'#fff',
        padding:5,
        borderRadius:15,
        flexDirection:'row',
        borderColor:Theme.themed5,
        borderWidth:0.5,  
        flexDirection:'row'
    },
    alertStyle:{
        width: '80%', 
        backgroundColor:'#fff',
        borderRadius:8,
        padding:10,
        // height:125
        // marginTop:-250
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
