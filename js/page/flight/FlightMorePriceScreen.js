import React from 'react';
import {
    View,
    Image,
    Platform,
    FlatList,
    StyleSheet,
    TouchableHighlight,
    TouchableOpacity,
    Text
} from 'react-native';
import PropTypes from 'prop-types';
import I18nUtil from '../../util/I18nUtil';
import Util from '../../util/Util';
import CustomText from '../../custom/CustomText';
import Theme from '../../res/styles/Theme';
import CropImage from '../../custom/CropImage';
import FlightEnum from '../../enum/FlightEnum';
import SuperView from '../../super/SuperView';
import FlightService from '../../service/FlightService';
import MorePriceView from './MorePirceView';
import RuleView from './RuleView';
import RuleView2 from './RuleView2';
import ListBottomView from './ListBottomView';
import ListLowPriceView from './ListLowPriceView';
import ViewUtil from '../../util/ViewUtil';
import { connect } from 'react-redux';
import HTMLView from 'react-native-htmlview';
import { ScrollView } from 'react-native';
import Key from '../../res/styles/Key';
import StorageUtil from '../../util/StorageUtil';

class FlightMorePriceScreen extends SuperView {
    constructor(props) {
        super(props);
        this.params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};
        this._navigationHeaderView = {
            title: this.params.isChange ? (I18nUtil.translate(this.params.DepartureCityName) + '-' + I18nUtil.translate(this.params.ArrivalCityName)) : I18nUtil.translate(this.params.goCityData.Name) + '-' + I18nUtil.translate(this.params.arrivalCityData.Name)
        }
        this.state = {
            dataList: [],
            lowPrices: [],
            showMore: false,
            jump:false,//最低价弹窗是跳过还是取消
            isOnlyApply:false,
            alertShow:false,
            itemData:null,
            ViolationRules:[],
            craftTypeList: []
        }
    }
    componentDidMount() {
        const { customerInfo, userInfo } = this.params;
        const {apply} = this.props;
            if (
                customerInfo?.Setting?.FlightTravelApplyConfig?.IsOnlyApply &&
                !userInfo?.NoNeedApply &&
                !apply
            ) {
                this.setState({ isOnlyApply: true });
            }
        if (this.params.isChange) {
            if (this.params.moreData) {
                this.params.moreData.forEach(model => {
                    model.DepartureCityEname = this.params.isChange ? this.params.DepartureCityEname : goCityData.EnName;
                    model.ArrivalCityEname = this.params.isChange ? this.params.ArrivalCityEname : arrivalCityData.EnName;
                    this.state.dataList.push(model);
                })
                let lowOtwPrice = null;
                let bookPrice = null;
                let airPirce = null;
                this.state.dataList.forEach(obj => {
                    if (obj.SupplierType === FlightEnum.SupplierType.ibePlus) {
                        if (!lowOtwPrice) {
                            lowOtwPrice = obj;
                        } else {
                            if (lowOtwPrice.Price > obj.Price) {
                                lowOtwPrice = obj;
                            }
                        }
                    }
                    if (obj.SupplierType === FlightEnum.SupplierType.gw51Book) {
                        if (!bookPrice) {
                            bookPrice = obj;
                        } else {
                            if (bookPrice.Price > obj.Price) {
                                bookPrice = obj;
                            }
                        }
                    }
                    if (obj.SupplierType === FlightEnum.SupplierType.flightSteWard) {
                        if (!airPirce) {
                            airPirce = obj;
                        } else {
                            if (airPirce.Price > obj.Price) {
                                airPirce = obj;
                            }
                        }
                    }
                })
                this.state.lowPrices = [lowOtwPrice, bookPrice, airPirce];
                this.setState({});
            }
        } else {
            this._loadList();
        }
        
        StorageUtil.loadKey(Key.CraftTypeList).then(result => {
           this.setState({
               craftTypeList: result || []
           })
        })

    }

    _loadList = () => {
        const { request, section, isChange, goCityData, arrivalCityData } = this.params;
        const { apply } = this.props;
        let journeyid = 0;
        if(apply){
            if(apply.TravelApplyMode==1 && apply.JourneyList && apply.JourneyList.length>0){
                //行程模式
                if(apply.selectApplyItem){
                    journeyid = apply.selectApplyItem&&apply.selectApplyItem.Id
                }else{
                    apply.JourneyList.forEach((item,index)=>{
                        if(item?.BusinessCategory & 1){
                           journeyid = item.Id
                        }
                    })
                }
            }else{
                //目的地模式
                journeyid = apply.Id
            }
        }
        request.JourneyId = journeyid
        request.ApplyId = apply?apply.Id:0
        this.showLoadingView();
        FlightService.GetFlightMorePrice(request).then(response => {
            this.hideLoadingView(); 
            if (response && response.success) {
                if (!response.data || response.data.length === 0) return;
                // if (section.lowPrice.length > 1) {
                //     section.lowPrice.forEach(model => {
                //         // let model = section.lowPrice[0];
                //         model.DepartureCityEname = isChange ? this.params.DepartureCityEname : goCityData.EnName;
                //         model.ArrivalCityEname = isChange ? this.params.ArrivalCityEname : arrivalCityData.EnName;
                //         this.state.dataList.push(model);
                //     })
                // }
                response.data.forEach(item => {
                    let model = item.flightDisPlayInfo[0];
                    model.DepartureCityEname = isChange ? this.params.DepartureCityEname : goCityData.EnName;
                    model.ArrivalCityEname = isChange ? this.params.ArrivalCityEname : arrivalCityData.EnName;
                    let index = this.state.dataList.findIndex(obj => obj.PriceId === model.PriceId);
                    if (index === -1) {
                        this.state.dataList.push(model);
                    }
                })
                let lowOtwPrice = null;
                let lowFarePrice = null;//最低协议价
                let _lowPrice = null;//最低价
                let bookPrice = null;
                let airPirce = null;
                this.state.dataList.forEach(obj => {
                    // if (obj.SupplierType === FlightEnum.SupplierType.ibePlus) {
                    //     if (!lowOtwPrice) {
                    //         lowOtwPrice = obj;
                    //     } else {
                    //         if (lowOtwPrice.Price > obj.Price) {
                    //             lowOtwPrice = obj;
                    //         }
                    //     }
                    // }
                    // if (obj.SupplierType === FlightEnum.SupplierType.gw51Book) {
                    //     if (!bookPrice) {
                    //         bookPrice = obj;
                    //     } else {
                    //         if (bookPrice.Price > obj.Price) {
                    //             bookPrice = obj;
                    //         }
                    //     }
                    // }
                    // if (obj.SupplierType === FlightEnum.SupplierType.flightSteWard) {
                    //     if (!airPirce) {
                    //         airPirce = obj;
                    //     } else {
                    //         if (airPirce.Price > obj.Price) {
                    //             airPirce = obj;
                    //         }
                    //     }
                    // }

                    let flightstate = obj.SupplierType === 2 ? obj.SupplierType : (obj.IsCompanyFarePrice ? obj.IsCompanyFarePrice : 0);
                    if (flightstate==1) {
                        if (!lowFarePrice) {
                            lowFarePrice = obj;
                        } else {
                            if (lowFarePrice.Price > obj.Price) {
                                lowFarePrice = obj;
                            }
                        }
                    }
                    if (!_lowPrice) {
                        _lowPrice = obj;
                    } else {
                        if (_lowPrice.Price > obj.Price) {
                            _lowPrice = obj;
                        }
                    }
                })
                if( lowFarePrice && (_lowPrice.Price < lowFarePrice.Price) ){
                    this.state.lowPrices = [_lowPrice,lowFarePrice];
                }else{
                    this.state.lowPrices = [_lowPrice];
                }
                // 找到dataList里和lowPrices里的priceid相同的值删掉
                this.state.dataList.forEach(obj => {
                    this.state.lowPrices.forEach(item => {
                        if (obj.PriceId === item.PriceId) {
                            let index = this.state.dataList.findIndex(obj => obj.PriceId === item.PriceId);
                            if (index !== -1) {
                                this.state.dataList.splice(index, 1);
                            }
                        }
                    })
                })
                this.state.dataList = this.state.lowPrices.concat(this.state.dataList);
                this.setState({});
            } else {
                this.toastMsg(response.message || '没有可用舱位，请选择其他舱位');
            }
        }).catch(error => {
            this.hideLoadingView();
            this.toastMsg(error.message || '没有可用舱位，请选择其他舱位');
        })
    }


    _getFlightStopInfo = (data) => {
        if (data.FlightStopInfo) {
            let stopInfo = data.FlightStopInfo;
            this.showAlertView(`${I18nUtil.translate('经停')} ${I18nUtil.translate(stopInfo.CityName)}， ${I18nUtil.translate('到达')} ${stopInfo.ArrivalTime}，${stopInfo.DepartureTime}${I18nUtil.translate('出发')}，${I18nUtil.translate('停留')}${stopInfo.Duration}`);
            return;
        }
        this.showLoadingView();
        let model = {
            FlightNo: data.fltInfo.codeShareLine ? (data.fltInfo.codeShareLine + data.fltInfo.codeShareFltNo) : (data.fltInfo.airline + data.fltInfo.fltNo),
            DepartureTime: data.DepartureTime,
            DepartureAirport: data.DepartureAirport,
            DestinationAirport: data.ArrivalAirport
        }
        FlightService.GetFlightStopInfo(model).then(response => {
            this.hideLoadingView();
            if (response && response.success) {
                let stopInfo = response.data;
                stopInfo.Duration = stopInfo.Duration.replace('小时', 'h');
                stopInfo.Duration = stopInfo.Duration.replace('分钟', 'm');//
                data.FlightStopInfo = stopInfo;
                this.showAlertView(`${I18nUtil.translate('经停')}${I18nUtil.translate(stopInfo.CityName)}，${stopInfo.ArrivalTime}${I18nUtil.translate('到达')}，${stopInfo.DepartureTime}${I18nUtil.translate('出发')}，${I18nUtil.translate('停留')}${stopInfo.Duration}`);
            } else {
                this.toastMsg(response.message || '获取数据异常');
            }
        }).catch(error => {
            this.hideLoadingView();
            this.toastMsg(error.message || '获取数据异常');
        })
    }
    _shareAlert = (data) => {
        if (data.fltInfo) {
            if (data.fltInfo.codeShareLine) {
                let shareStr = I18nUtil.translate('实际承运') + '   ' + (Util.Parse.isChinese() ? data.fltInfo.codeShareFltLineName : Util.Read.domesticAirlines(data.fltInfo.codeShareLine)) + data.fltInfo.codeShareLine + data.fltInfo.codeShareFltNo;
                this.toastMsg(shareStr);
            }
        }
    }
    _showCanbinDes = (data) => {

        this.toastMsg( Util.Parse.isChinese()? data.CabinTagDesc:data.CabinEnTagDesc);
    }

    _showMore = () => {
        this.setState({
            showMore: true
        })
    }

    /**
   *  点击预订按钮的操作
   */
    _orderBtnClick = (data) => { 
        this.setState({
            ViolationRules:data.ViolationRules
        })
        if(data && data.SupplierType==2){
            this._chTravellerRules(data);
        }
        //高危城市
        if (this.props.highRisk && this.props.highRisk.Level ==1) {
            this.setState({
                alertShow:true,
                itemData:data,
            })
            return;
        } 
        if(this.props.highRisk && this.props.highRisk.Level == 2){
            this.toastMsg('高危区域，不能预订');
            return;
        }
         
        if (!data.EnableBook && this.props.feeType === 1) {
            this.toastMsg(data.BlockBookingReason||'不符合您的差标规则，禁止预订');
            return;
        }
        if (data && data.DepartureAirport === 'PKX') {
            this.showAlertView('大兴机场距离市区46公里，搭乘地铁到市区（草桥站）需约30分钟', () => {
                return ViewUtil.getAlertButton('确定', () => {
                    this.dismissAlertView();
                    this._getTravelRule(data);
                })
            })
        } else {
            this._getTravelRule(data);
        }
    }

    _orderBtnClick2 = (data) => {
            if (!data.EnableBook && this.props.feeType === 1) {
                this.toastMsg('不符合您的差标规则，禁止预订');
                return;
            }
            this.setState({
                ViolationRules:data.ViolationRules
            },()=>{
                this._getTravelRule(data,'lowPrice');
            })

    }
    /**
    *  差旅规则鉴定
    */

    _getTravelRule = (data,lowPrice) => {
        const { isChange, isSingle, arrivalCityData, goCityData, arrivalDate,RulesTravelId,userInfo,moreTravel,arrivalCityData2, goCityData2} = this.params;
        const { compSwitch, compReferenceEmployee } = this.props;
        const { ViolationRules,jump } = this.state
        // let compReferenceEmployeeId = compReferenceEmployee&&compReferenceEmployee.PassengerOrigin&&compReferenceEmployee.PassengerOrigin.EmployeeId
        /** 
         * 改签
         */
        if (isChange) {
            this.push('FlightChangeDetail', Object.assign(this.params, { oldData: this.params.oldModel, newData: data }));
            return;
        }
        /**
         *  因私预订
         */

        let params = Util.Encryption.clone(this.params);
        if (!isSingle && !moreTravel) {
            params = {
                goCityData: arrivalCityData,
                arrivalCityData: goCityData,
                goCityData2: arrivalCityData2,
                arrivalCityData2: goCityData2,
                moreTravel:moreTravel,
                goDate: arrivalDate,
                arrivalDate: arrivalDate,
                isSingle: isSingle,
                ResBookDesig: this.params.ResBookDesig,
                filterArr:this.params.filterArr,
                isFilter:this.params.isFilter,
                canbinOption:this.params.canbinOption,
                isShare:this.params.request.IsShare,
                isDirect:this.params.request.IsDirect,
            }
        }
        params.goFlightData = data;
        if (this.props.feeType === 2) {
            if (!isSingle) {
                this.push('FlightRtList', params);
            } else {
                this.push('FlightOrderScreeb', params);
            }
            return;
        }
        let referencEmployeeId
        if(this.props.comp_userInfo&&this.props.comp_userInfo.employees&&this.props.comp_userInfo.employees.length>0){
            let num = this.props.comp_userInfo&&this.props.comp_userInfo.employees.length-1
            referencEmployeeId = this.props.comp_userInfo.employees[num]&&this.props.comp_userInfo.employees[num].PassengerOrigin&&this.props.comp_userInfo.employees[num].PassengerOrigin.EmployeeId
        }else{
            referencEmployeeId = userInfo.Id
        }
        params.ViolationRules = data.ViolationRules
        let model = {
            DepartureCityName: data.DepartureCityName,
            DepartureCode: goCityData.Code,
            DestinationCityName: data.ArrivalCityName,
            DestinationCode: arrivalCityData.Code,
            DepAirport:data.DepartureAirport,
            ArrAirport: data.ArrivalAirport,
            DepartureTime: data.DepartureTime,
            ArriTime:data.ArrivalTime,
            Price: data.Price,
            Airline: data.AirCode,
            AirlineNumber: data.FlightNumber,
            AirPlace: data.ResBookDesigCode,
            Discount: data.DiscountRate,
            DataId: data.DataId,
            AirServiceCabin: data.AirServiceCabin,
            RulesTravelId: RulesTravelId,
            PriceId:data.PriceId,
            ServicePrice:data.ServicePrice,
            // ShowLowerPrice:data.MorePriceTag?true:false,
            ShowLowerPrice:true,
            ReferenceEmployeeId:this.props.comp_userInfo&&this.props.comp_userInfo.ReferenceEmployeeId?this.props.comp_userInfo.ReferenceEmployeeId:0,
            ReferencePassengerId:referencEmployeeId,
            IsRecommendFlight:lowPrice ? true : false,
        }
        this.showLoadingView('差旅规则检查');
        let _rule = false
        FlightService.MatchTravelRules(model).then(response => {
            this.hideLoadingView();
            if (response && response.success) {
                if (response.data.unmatchlist && Array.isArray(response.data.unmatchlist) && response.data.unmatchlist.length > 0  ) {
                    for (const obj of response.data.unmatchlist) {
                        if (obj.IsEnable && obj.RuleType === 1 && obj.LowPriceFights.length > 0 && !lowPrice) {
                            params.MatchTravelRules = response.data;
                            _rule = true
                            if(data.ViolationRules && data.ViolationRules.length>0){
                                this.setState({
                                    jump:false,
                                },()=>{
                                      this.refs.lowPriceBottomView.showView(params);
                                })
                            }else{
                                this.setState({
                                    jump:true,
                                },()=>{
                                      this.refs.lowPriceBottomView.showView(params);
                                })
                            }
                            return;
                        }
                    }
                    for (const obj of response.data.unmatchlist) {
                        if (obj.IsEnable && obj.Advanceday && obj.RuleType === 2) {
                            params.MatchTravelRules = response.data;
                            _rule = true
                            this.push('FlightRuleScreen', params);
                            break;
                        }
                        if (obj.IsEnable && obj.Discount && obj.RuleType === 7) {
                            params.MatchTravelRules = response.data;
                            _rule = true
                            this.push('FlightRuleScreen', params);
                            break;
                        }
                        if (obj.IsEnable && obj.RuleType === 3) {
                            params.MatchTravelRules = response.data;
                            _rule = true
                            this.push('FlightRuleScreen', params);
                            break;
                        }
                    }
                    if(!_rule){
                        if (!isSingle) {
                            this.push('FlightRtList', params);
                        } else {
                            compSwitch ?
                                this.push('Flight_compCreatOrderScreen', params)
                                :
                                this.push('FlightOrderScreeb', params);
                        }
                    }
                } else {
                    if (!isSingle) {
                        this.push('FlightRtList', params);
                    } else {
                        compSwitch ?
                            this.push('Flight_compCreatOrderScreen', params)
                            :
                            this.push('FlightOrderScreeb', params);
                    }
                }
            } else {
                if(response.data && response.data.length>0){
                    params.bookLowestPrice = response.data;
                    if (response.code === "NoBooking4LowestPrice") {
                          this.setState({
                            jump:true,
                        })
                    }else{
                        this.setState({jump:false})
                    }
                    this.refs.lowPriceView.showView(params);
                }else {
                        this.toastMsg(response.message || '差旅规则检测失败');
                }
            }
        }).catch(error => {
            this.hideLoadingView();
            this.toastMsg(error.message || '差旅规则检测失败')
        })
    }

    renderBody() {
        const {jump} = this.state;
        const { compSwitch } = this.props;
        const {isSingle} = this.params;
        return (
            <View style={{flex: 1}}>
                {this._renderHeader()}
                <View  style={{ flex: 1 }}>
                <FlatList
                    style={{ flex: 1 }}
                    data={this.state.showMore ? this.state.dataList : this.state.lowPrices}
                    renderItem={this._renderItem}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item, index) => String(index)}
                    ListFooterComponent={this._renderFooter}
                />
                </View>
                {this._testAlert()}
                <RuleView ref={o => this.ruleView = o} />
                <RuleView2 ref={o => this.ruleView2 = o} />
                <ListBottomView ref='lowPriceBottomView' otwThis={this} isSingle={isSingle} callBack={this._orderBtnClick2} jump={jump} compSwitch={compSwitch} />
                <ListLowPriceView ref='lowPriceView' otwThis={this} isSingle={isSingle} callBack={this._orderBtnClick} jump={jump} compSwitch={compSwitch} />
            </View>
        )
    }
    _testAlert = () => {
        const {alertShow} = this.state;
        if (!this.props.highRisk || !this.props.highRisk.Level ==1 || !alertShow){return}
        return(
          <View  style={{position:'absolute',top:-94, height:global.screenHeight, width:global.screenWidth}}>
            <View style={styles.container2}>
            {//图片宽250 高300， 头部高35，底部高40
                <View style={{ marginHorizontal:8,backgroundColor:'#fff',width:300, borderRadius:8}}>
                  <View style={{height:40,alignItems:'center',justifyContent:'center',marginTop:5}}>
                      <CustomText  text='温馨提示' style={{fontSize:16}}/>
                  </View>
                  <ScrollView style={{width:'100%'}} keyboardShouldPersistTaps='handled'>
                         <HTMLView value={this.props.highRisk.Message} style={{ padding:12}} /> 
                  </ScrollView>
                  <TouchableOpacity 
                        style={{height:40,alignItems:'center',justifyContent:'center',marginTop:10,borderTopWidth:1,borderColor:Theme.lineColor}}
                        onPress={()=>{
                           this._hightRist()
                        }}>
                        <CustomText  text='确定' style={{fontSize:18,color:Theme.theme}}/>
                  </TouchableOpacity>
                </View>
              }
              </View>
          </View>
        )
    }

    _hightRist = () => {
        const { itemData } = this.state;
        if (this.props.highRisk.Level == 1) {
            if (!itemData.EnableBook && this.props.feeType === 1) {
                this.toastMsg('不符合您的差标规则，禁止预订');
                return;
            }
            if (itemData && itemData.DepartureAirport === 'PKX') {
                this.showAlertView('大兴机场距离市区46公里，搭乘地铁到市区（草桥站）需约30分钟', () => {
                    return ViewUtil.getAlertButton('确定', () => {
                        this.dismissAlertView();
                        this._getTravelRule(itemData);
                    })
                })
            } else {
                this._getTravelRule(itemData);
            }
        }
        this.setState({alertShow:false});
    }

    _renderFooter = () => {
        if (this.state.showMore) {
            return <View style={{height:10}}></View>;
        }
        return (
            <TouchableHighlight underlayColor='transparent' onPress={this._showMore}>
                <View style={{ height: 50, margin: 10, borderRadius:6, alignItems: 'center', justifyContent: "center", backgroundColor: "white" }}>
                    <CustomText text='更多舱位' style={{ color: Theme.theme }} />
                </View>
            </TouchableHighlight>
        )
    }

    _chTravellerRules(priceObjItem) {
        let model51 = {
            segId: priceObjItem.Id,
            cabin: priceObjItem.ResBookDesigCode,
            dataId: priceObjItem.DataId,
            supplierType: priceObjItem.SupplierType,
            DepartureTime:priceObjItem.DepartureTime,
        }
        FlightService.ChTravellerRules(model51).then(response => {
            if (response && response.success&& response.data) {
                    priceObjItem.PolicySummary = response.data                
            }else{
                this.toastMsg(response.message || '获取数据异常'); 
            } 
        }).catch(error => {
            this.toastMsg(error.message || '获取数据异常');
        })
    }

    _renderItem = (item) => {
        const { comp_checkTravellers,apply } = this.props;
        const {isOnlyApply} = this.state;
        const {customerInfo} = this.params;
        let _canbin = customerInfo?.Setting?.FlightTravelApplyConfig?.IsEnableCanbinLimit ?
             apply&&apply.selectApplyItem&&apply.selectApplyItem.ExtensionJson&&apply.selectApplyItem.ExtensionJson.AirExtensionJson&&apply.selectApplyItem.ExtensionJson.AirExtensionJson.CanbinLimit
             :null
        let travellerNum = comp_checkTravellers && comp_checkTravellers.travellers && comp_checkTravellers.travellers.Travellers.length
        return <MorePriceView priceObj={item.item} 
                              travellerNum={travellerNum} 
                              highRiskLevel={this.props.highRisk?this.props.highRisk.Level:0} 
                              {...this.params} 
                              moreThis={this} 
                              orderBtnClick={this._orderBtnClick.bind(this, item.item)}
                              isOnlyApply = {isOnlyApply} 
                              applyCanbinLimit = {_canbin}                            
                 />
    }
    _renderHeader = () => {
        const { section, currentLowPrice } = this.params;
        const {craftTypeList} = this.state
        if (!section || !section.lowPrice || section.lowPrice.length === 0) return;
        let data = section.lowPrice[0];
        if (!data) return;
        //是否显示经停
        let stop = data.fltInfo && data.fltInfo.Stop > 0 ? '经停' : '';
        //是否显示共享
        let share = data.fltInfo && data.fltInfo.codeShareLine ? '共享' : '';
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
        // let FlightDuration;
        // FlightDuration = data.FlightDuration.replace('小时', 'h');
        // FlightDuration = FlightDuration.replace('分', 'm');
        let FlightDuration = data.FlightDuration.replace(':', "h");
        FlightDuration = FlightDuration + 'm';
        let shareStr;
        if (data.fltInfo) {
            if (data.fltInfo.codeShareLine) {
                shareStr = (Util.Parse.isChinese() ? data.fltInfo.codeShareFltLineName : Util.Read.domesticAirlines(data.fltInfo.codeShareLine)) + data.fltInfo.codeShareLine + data.fltInfo.codeShareFltNo;
            }
        }

        return (
            <View style={styles.viewStyle}>
                <View style={{alignItems:'center',paddingLeft:20,backgroundColor:Theme.greenBg,height: 32,flexDirection:'row'}}>
                   <CustomText text={this.params.isSingle ? '单程':this.params.moreTravel?'第一程' : '去程'} style={{ color: Theme.theme,marginHorizontal: 10 }} />
                   <CustomText text={'（'} style={{ color: Theme.theme }} />
                   <CustomText text={DepartureDate.format('yyyy-MM-dd')} style={{ color: Theme.theme }} />
                   {
                     Util.Parse.isChinese()?<CustomText text={Util.Date.getWeekDesc(DepartureDate)} style={{ color: Theme.theme }} />:null
                   }
                   <CustomText text={'）'} style={{ color: Theme.theme }} />
                </View>
                <View style={styles.sectionView}>
                        {
                            currentLowPrice === data.Price ?
                                <CustomText text={'当日最低'} style={{ color: Theme.orangeColor, backgroundColor: Theme.orangeBg, width: 94,textAlign:'center' }} />
                                : null
                        }

                        <View style={{ flexDirection: 'row', alignItems: 'center',justifyContent: 'space-between',paddingHorizontal:20,marginTop:20}}>
                            <View style={{justifyContent: 'flex-start',width:120}}>
                                <CustomText style={{fontSize:26}} text={DepartureDate && DepartureDate.format('HH:mm')} />
                                <CustomText style={{fontSize: 12, marginTop: 2,textAlign:'left'}} text={Util.Parse.isChinese() ? (DepartureAirportDesc + (data.DepartureAirPortTerminal ? data.DepartureAirPortTerminal : '')) : (data.DepartureAirport + ' ' + (data.DepartureAirPortTerminal ? data.DepartureAirPortTerminal : ''))} />
                            </View>
                            <View style={{ alignItems: "center",justifyContent: 'center'}}>
                                <CustomText text={FlightDuration} style={{ fontSize: 11, color: Theme.aidFontColor }} />
                                {
                                    data.fltInfo && data.fltInfo.Stop > 0 
                                     ?
                                    <TouchableOpacity onPress={this._getFlightStopInfo.bind(this, data)}>
                                        <Image source={Util.Parse.isChinese() ? require('../../res/Uimage/flightFloder/_zstop.png') : require('../../res/Uimage/flightFloder/_estop.png')} style={{ width: 60, height: 10 }}></Image>
                                    </TouchableOpacity> 
                                     :
                                    <Image source={require('../../res/Uimage/arrow.png')} style={{ width: 60, height: 3 }}></Image>
                                }
                                <CustomText text={''} style={{ marginTop: 5, fontSize: 12, color: Theme.aidFontColor }} />
                            </View>
                            <View style={{justifyContent: 'flex-start',width:120}}>
                                <CustomText style={{fontSize:26,textAlign:'right'}} text={ArrivalDate && ArrivalDate.format('HH:mm')} />
                                {
                                    diffDay > 0 ?
                                        <CustomText style={{  }} text={'+' + diffDay} />
                                        : null
                                }
                                <CustomText style={{fontSize: 12, marginTop: 2,textAlign:'right'}} text={Util.Parse.isChinese() ? (ArrivalAirportDesc + (data.ArrivalAirPortTerminal ? data.ArrivalAirPortTerminal : '')) : (data.ArrivalAirport + ' ' + (data.ArrivalAirPortTerminal ? data.ArrivalAirPortTerminal : ''))} />
                            </View>
                        </View>
                        <View style={{justifyContent: 'space-between',alignItems:'center',flexDirection:'row',paddingHorizontal:20,paddingTop:20}}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: "wrap" }}>
                                <CropImage code={data.AirCode} />
                                <CustomText style={{ marginLeft: 5,fontSize: 12, color: Theme.assistFontColor }}
                                    text={ data.AirCode + data.FlightNumber + ' |'} />
                                <CustomText text={planType} style={{ marginLeft: 5,  fontSize: 12, color: Theme.assistFontColor }} />
                                {planType?<CustomText style={{ marginLeft: 5,fontSize: 12, color: Theme.assistFontColor }}
                                    text={'|'} />:null}
                                <CustomText text={data.fltInfo.mealDesc ? data.fltInfo.mealDesc : null} style={{ marginLeft: 5, fontSize: 12, color: Theme.assistFontColor }} />
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: "flex-end", marginTop: 2 }}>
                                        <Image source={require('../../res/Uimage/flightFloder/ontime.png')} style={{ width: 16, height: 14 }}></Image>
                                        <CustomText text={data.TodayTimeRate ? data.TodayTimeRate : data.OntimeRate}
                                            style={{ textAlign: 'right', marginLeft: 2, fontSize: 12, color: Theme.assistFontColor }}></CustomText>
                            </View>
                        </View>
                        <View style={{ paddingHorizontal:20,paddingTop:10,paddingBottom:20}}>
                            {
                                share ?
                                    <View style={{ flexDirection: 'row', alignItems: 'center', }}>
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
            </View>)
    }
}
const getPropsState = state => ({
    feeType: state.feeType.feeType,
    compSwitch: state.compSwitch.bool,
    highRisk: state.highRisk.highRisk,
    comp_checkTravellers: state.comp_checkTravellers,
    compReferenceEmployee: state.compReferenceEmployee.ReferenceEmployee,//综合订单出差人选定参考出差人信息
    apply: state.apply.apply,
    comp_userInfo: state.comp_userInfo,
})

export default connect(getPropsState)(FlightMorePriceScreen);
const styles = StyleSheet.create({
    sectionView: {
        // height: 120,
        backgroundColor: '#fff',
        // flex: 1
    },
    timeText: {
        width: 95,
        height: 20,
        textAlign: 'center',
        fontSize: 18,
        marginTop: 10,
        marginLeft: 10
    },
    share: {
        marginTop: 10,
        fontSize: 10,
        borderColor: Theme.theme,
        color: Theme.theme,
        borderWidth: 0.5,
        padding: 2
    },
    image: {
        width: 60,
        height: 5,
        alignItems: "center"
    },
    arrivalDate: {
        justifyContent: 'flex-end'
    },
    cityText: {
        width: 100,
        height: 25,
        textAlign: 'center',
        fontSize: 12,
        color: 'gray'
    },
    hangsiZhixiao: {
        backgroundColor: Theme.specialColor,
        color: Theme.theme,
        fontSize: 12,
        marginLeft: 5,
        padding: 2,
        textAlign: 'center',
        marginTop: 5
    },
    viewStyle: { 
        //  backgroundColor: "white", 
        //  paddingBottom: 10, 
        //  elevation: 1.5, shadowColor: '#999999', shadowOffset: { width: 5, height: 5 }, shadowOpacity: 0.2, shadowRadius: 1.5, 
    },
    container2:{
        flex:1,
        backgroundColor:'rgba(0, 0, 0, 0.4)',
        justifyContent:'center',
        alignItems:'center'
    },
    
})