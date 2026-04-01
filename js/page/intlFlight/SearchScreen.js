import SuperView from "../../super/SuperView";
import React from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    ImageBackground,
    TouchableHighlight,
    DeviceEventEmitter,
    Image,
    Text,
    ScrollView
} from 'react-native';
import CustomText from '../../custom/CustomText';
import ViewUtil from "../../util/ViewUtil";
import CommonService from '../../service/CommonService';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Theme from "../../res/styles/Theme";
import StorageUtil from "../../util/StorageUtil";
import Key from "../../res/styles/Key";
import I18nUtil from "../../util/I18nUtil";
import { connect } from 'react-redux';
import Util from "../../util/Util";
import IntlFlightEnum from "../../enum/IntlFlightEnum";
import CustomActioSheet from "../../custom/CustomActionSheet";
import AdCodeEnum from "../../enum/AdCodeEnum";
import AdContentInfoView from "../common/AdContentInfoView";
import  LinearGradient from 'react-native-linear-gradient';
import ChoosePersonView from '../ComprehensiveOrder/commen/ChoosePersonView';
import UserInfoDao from '../../service/UserInfoDao';
import action from "../../redux/action";
import CommonEnum from "../../enum/CommonEnum";
import Pop from 'rn-global-modal'
import CheckBox from '../../custom/CheckBox';

class SearchScreen extends SuperView {

    constructor(props) {
        super(props);
        let options = IntlFlightEnum.cabins.map(item => item.name);
        this.params = props.navigation.state.params || {};
        this._navigationHeaderView = {
            title: '港澳台及国际机票',
            // rightButton: props.feeType === 1 ? ViewUtil.getRightButton('差旅标准', this._getTravelRule) : null
        } 
        let newDay = new Date().addDays(1);
        let beginT = Util.Date.toDate(this.params.BeginTime) 
        const commenArr = 
        this.params.cityList&&this.params.cityList.map(item => ({  
                        CityCode:item.IataCode,
                        CityEg:item.EnName,
                        CityEnName:item.EnName,
                        CityName:item.Name,
                        Cname:item.Name,
                        NationalCode:item.NationalCode,
                        NationalEg:item.EnNationalName,
                        NationalName:item.NationalName,
        }))

        let isSingle = false;//是否是单程
        const { apply } = this.props;
        const { selectApplyItem,customerInfo } = this.params;
        let _selectApplyItem;
        if(apply){
            if(apply.Destination&&apply.Destination.DepartureList&&apply.Destination.DepartureList.length>0){
                if(apply.Destination.JourneyType&&apply.Destination.JourneyType==2){
                    isSingle=false
                }
            }else if(apply.TravelApplyMode==1 && apply.JourneyList && apply.JourneyList.length>0){
                if(selectApplyItem){//行程模式下 选择过行程的情况
                    isSingle = selectApplyItem.JourneyType && selectApplyItem.JourneyType == 2 ? false : true
                }else if( apply.JourneyList[0]){//行程模式下 继续预订 未选行程
                    isSingle =apply.JourneyList[0].JourneyType && apply.JourneyList[0].JourneyType == 2 ? false : true
                }
                // 继续预订有apply.JourneyList但没有selectApplyItem
                if(!selectApplyItem){
                    apply.JourneyList.forEach((item,index)=>{
                         if(item?.BusinessCategory & 8){
                            _selectApplyItem = item
                            apply.selectApplyItem = _selectApplyItem
                         }
                    })
                }
            }
        }
        // let _canbin =
        //     customerInfo.Setting.FlightTravelApplyConfig.IsAllCategory?
        //         customerInfo?.Setting?.FlightTravelApplyConfig?.IsEnableCanbinLimit ?
        //             apply&&apply.selectApplyItem&&apply.selectApplyItem.ExtensionJson&&apply.selectApplyItem.ExtensionJson.AirExtensionJson&&apply.selectApplyItem.ExtensionJson.AirExtensionJson.CanbinLimit
        //         :null
        //     :null
        this.state = {
            /**
               * 查询往返 是否往返
               */
            queryRt: !isSingle,
            /**
            * 出发城市
            */
            departureCity: this.params.goCityDisplay?this.params.goCityDisplay:commenArr&&commenArr[0]||'',
            /**
           * 到达城市
           */
            destinationCity: this.params.arrivalCityDisplay?this.params.arrivalCityDisplay:commenArr&&commenArr[1]||'',

            /**
             * 出发时间
             */
            departureDate:this.params.BeginTime && beginT>newDay ? beginT:newDay,
            /**
             * 抵达城市
             */
            destinationDate:this.params.EndTime && beginT>newDay ? Util.Date.toDate(this.params.EndTime):new Date().addDays(2),
            /**
            * 舱位
            */
            cabin: { name: '', code: null },

            adList:[],

            applyNum:apply&&apply.SerialNumber,

            customerInfo:{},

            selectApplyItem:selectApplyItem || _selectApplyItem,
            isDirect:false,
            historRecordList:[],
            airline:[],//航司code
            airlineObj:{},
            selectCabin:'经济舱',
            canbinOption:options,
        }
    }

    /**
     *  返回按钮
     */
    _backBtnClick = () => {
        this.pop();
    }

    _selectCabinList = (canbinLimit) => {
        if(!canbinLimit){return;}
        //'超值经济舱', '商务舱/公务舱'
        switch(canbinLimit){
            case "F":
                this.setState({
                    canbinOption:['经济舱','超值经济舱','商务舱/公务舱','头等舱']
                })
                break;
            case "CJ":
                this.setState({
                    canbinOption:['经济舱','超值经济舱','商务舱/公务舱']
                })
                break;
            case "C":
                this.setState({
                    canbinOption:['经济舱','超值经济舱','商务舱/公务舱']
                })
                break;
            case "J":
                this.setState({
                    canbinOption:['经济舱','超值经济舱','商务舱/公务舱']
                })
                break;
            case "P":
                this.setState({
                    canbinOption:['经济舱','超值经济舱']
                })
                break;
            case "Y":
                this.setState({
                    canbinOption:['不限','经济舱','超值经济舱']
                })
                break;
        }
        return;        
    }

     /**
     *  获取差旅标准
     */
     _getTravelRule = () => {
        const {ReferenceEmployee} = this.params;
        let modelStandar={
            OrderCategory:CommonEnum.orderIdentification.intlFlight,
        }
        this.showLoadingView();
        CommonService.GetTravelStandards(modelStandar).then(response => {
            this.hideLoadingView();
            if (response?.data?.RuleDesc?.length > 0) {
                Pop.show(
                    <View style={styles.alertStyle}>
                       <View style={{alignItems:'center',justifyContent:'center'}}>
                           <CustomText text={'温馨提示'} style={{margin:6,fontSize:18, fontWeight:'bold'}} />
                       </View>
                       <View style={{width:'80%'}}>
                           <CustomText text={response.data.OrderCategoryDesc} style={{padding:2,fontSize:14,fontWeight:'bold'}}/>
                           {  
                               ReferenceEmployee && JSON.stringify(ReferenceEmployee)!='{}' && ReferenceEmployee.RulesTravelDetails? 
                                (ReferenceEmployee.RulesTravelDetails&&ReferenceEmployee.RulesTravelDetails.map((obj)=>{
                                    if(obj.Category===1){
                                    return( 
                                        obj.Rules.map((item, index)=>{
                                            return(
                                            <View style={{flexDirection:'row',padding:2}} key={index}>
                                                <CustomText text={item.Key+': '+item.Value}/>
                                            </View>
                                            )
                                        })
                                    )  
                                    }
                                }))
                                   :
                               (response.data.RuleDesc.map((item, index)=>{
                                return(
                                  <View style={{flexDirection:'row',padding:2}} key={index}>
                                     <CustomText text={item.Name+': '+item.Desc}/>
                                  </View>
                                )
                            }))    
                           }
                       </View>
                       <TouchableHighlight underlayColor='transparent' 
                                 style={{height:40,alignItems:'center',justifyContent:'center',marginTop:10,borderTopWidth:1,borderColor:Theme.lineColor}}
                                 onPress={()=>{Pop.hide()}}>
                                 <CustomText  text='确定' style={{fontSize:19,color:Theme.theme}}/>
                        </TouchableHighlight>
                    </View>
                    ,{animationType: 'fade', maskClosable: false, onMaskClose: ()=>{}})
             
            } else {
                this.showAlertView('国际机票:不限');
            } 
        }).catch(error => {
            this.hideLoadingView();
            this.toastMsg(error.message || '获取数据异常');
        })
    }

    componentWillUnmount() {// 组件卸载时清除监听器
        if (this.backFromShopListener) {
            this.backFromShopListener.remove();
        }
    }
    
    componentDidMount() {
        const { apply } = this.props;
        let _canbin = apply&&apply.selectApplyItem&&apply.selectApplyItem.ExtensionJson&&apply.selectApplyItem.ExtensionJson.AirExtensionJson&&apply.selectApplyItem.ExtensionJson.AirExtensionJson.CanbinLimit
        this.backFromShopListener = DeviceEventEmitter.addListener(
            'refreshaaa',  //监听器名
            () => {
                this.setState({
                    applyNum:null
                })
            },
        );
        if (this.props.apply && this.props.apply.selectJourney) {
            this.setState({
                departureDate: Util.Date.toDate(this.props.apply.selectJourney.DepartureTime),
                destinationDate: Util.Date.toDate(this.props.apply.selectJourney.ReturnTime)
            })
        }

        UserInfoDao.getCustomerInfo().then(customerInfo => {
            this.setState({
                customerInfo
            },()=>{
                const flightConfig = customerInfo?.Setting?.FlightTravelApplyConfig;
                if (flightConfig?.IsAllCategory && flightConfig?.IsEnableCanbinLimit) {
                    this._selectCabinList(_canbin);
                    this.setState({
                        selectCabin: _canbin?'经济舱':this.state.selectCabin
                    })
                }
                const directFlightItem = customerInfo?.SettingItems?.find(item => item.Code == 'is_direct_for_intl_flight_search');
                if (directFlightItem) {
                    let isDirect = directFlightItem.Value?.toLowerCase() === 'true' ? true : false;
                    this.setState({
                        isDirect:isDirect
                    })
                }
            })
        }).catch(error => {
            this.toastMsg(error.message);
        })

        StorageUtil.loadKeyId(Key.IntFlightSearchCityRecord).then(response => {
            if (response && Array.isArray(response) && response.length > 0) {
                let obj = response[response.length - 1];
                this.setState({
                    // departureCity: obj.goCityData,
                    // destinationCity: obj.arrivalCityData,
                    historRecordList: response
                })
            }
        }).catch(error => {
            // this.toastMsg(error.message || '获取数据异常');
        })

        CommonService.GetAdStrategyContent(AdCodeEnum.intlFlight).then(response => {
            if (response && response.success) {
                this.setState({
                    adList: response.data
                })
            }
        }).catch(error => {
            this.toastMsg(error.message);
        })
    }
    /**
     *  左右边点击啊
     * index是 1左 2右
     */
    _imagePress = (index) => {
        const { applyNum,customerInfo } = this.state
        if(applyNum && customerInfo&& customerInfo.Setting.FlightTravelApplyConfig.IsAllCategory==true && customerInfo.Setting.FlightTravelApplyConfig.IsJourneyType){return};
        if (index === 1) {
            this.setState({
                queryRt: true
            })
        } else {
            this.setState({
                queryRt: false
            })
        }
    }

    //出发或者返回城市的点击事件根据num=1是出发num=2是到达
    _gotoSelectCity = (num) => {
        this.push('IntlFlightSelectCity', {
            selectCity: (data) => {
                if (num == 1) {
                    this.setState({ departureCity: data })
                } else {
                    this.setState({ destinationCity: data });
                }
            }
        })
    }

    //交互城市数据
    _exchangeCity = () => {
        let [goCity, arrivalCity] = [this.state.destinationCity, this.state.departureCity];
        this.setState({
            departureCity: goCity,
            destinationCity: arrivalCity
        })
    }
    /**
    *  选择日期
    */
    _gotoSelctDate = (num) => {
        this.push('Calendar', {
            num: num, date: this.state.departureDate,
            backDate: (date) => {
                if (num == 1) {
                    this.setState({
                        departureDate: date,
                        destinationDate: date.addDays(1)
                    })
                } else {
                    this.setState({
                        destinationDate: date
                    })
                }
            }
        })
    }

    _cabinBtn = () => {
        this.actionSheet.show();
    }

    _handlePress = (index) => {
        if(index==='cancel'){
            this.setState({
                cabin: { name: '不限', code: null }
            })
        }else{
            this.setState({
                cabin: IntlFlightEnum.cabins[index]
            })
        }
    }

    //去查询列表
    _goSerchList = () => {
        const { cabin, queryRt, departureCity, destinationCity, departureDate, destinationDate,historRecordList } = this.state;
        if (!departureCity) {
            this.toastMsg('请选择出发城市');
            return;
        }
        if (!destinationCity) {
            this.toastMsg('请选择到达城市');
            return;
        }
        if (departureCity.CityCode === destinationCity.CityCode) {
            this.toastMsg('出发城市与到达城市不能相同');
            return;
        }
        if (departureCity.NationalName === '中国' && departureCity.NationalName === destinationCity.NationalName) {
            this.toastMsg('国内行程请使用（国内机票）进行购票');
            return;
        }
        if (queryRt && destinationDate < departureDate) {
            this.toastMsg('返程日期不能小于出发日期');
            return;
        }
        this.props.setHightRiskData();
        this.props.setHightRiskData2();
        this._highRisk(departureCity, destinationCity, destinationCity, departureCity);//检查往返程目的地是否有高危城市
        if (historRecordList && Array.isArray(historRecordList)) {
            let index = historRecordList.findIndex(item => {
                return item.goCityData.CityCode === departureCity.CityCode && item.arrivalCityData.CityCode === destinationCity.CityCode;
            })
            if (index > -1) {
                [historRecordList[index], historRecordList[historRecordList.length - 1]] = [historRecordList[historRecordList.length - 1], historRecordList[index]];
            } else {
                historRecordList.push({
                    goCityData: departureCity,
                    arrivalCityData: destinationCity
                })
                if (historRecordList.length > 6) {
                    historRecordList.splice(0, 1);
                }
            }
            StorageUtil.saveKeyId(Key.IntFlightSearchCityRecord,historRecordList);
        }
        this.setState({});
        
    }

    _highRisk(goCityDisplay, arrivalCityDisplay, goCityDisplay2, arrivalCityDisplay2){
            const { queryRt } = this.state;
            let model = {
                DepartureCode:goCityDisplay.CityCode,
                ArrivalCode:arrivalCityDisplay.CityCode,
                BusinessCategory:8
            }
            CommonService.HighRiskPC2(model,this)
            .then(res=>{
                if( res && res.success && res.data ){
                    let highRisk = res.data.find(obj=>obj.Type == 2);
                    this.props.setHightRiskData(highRisk);
                    if(queryRt){
                        this._highRisk2(goCityDisplay2, arrivalCityDisplay2, res.data);
                    }else{
                        if(highRisk){
                            if(highRisk.Level == 3 || highRisk.Level == 2){
                                this.showAlertView(highRisk.Message, () => {
                                    return ViewUtil.getAlertButton('确定', () => {
                                        this.dismissAlertView();
                                        if(highRisk.Level == 3){
                                            //3级高危不可查 不可订
                                        }else{
                                            this.OrderTravelApply()
                                        }
                                    })
                                })
                            }else{
                                this.OrderTravelApply()
                            }
                        }
                    }
                }else{
                    this.OrderTravelApply()
                }
            })
            .catch(error=>{
                this.OrderTravelApply()
            });
        }

    _highRisk2(goCityDisplay2, arrivalCityDisplay2,resData1){
            CommonService.HighRiskPC2({
                DepartureCode:goCityDisplay2.CityCode,
                ArrivalCode:arrivalCityDisplay2.CityCode,
                BusinessCategory:8},this)
            .then(res=>{
                if(res){
                    let highRisk = resData1.find(obj=>obj.Type == 2);
                    let highRisk2 = res.data.find(obj=>obj.Type == 2);
                    let hightRiskData ;
                    if( highRisk && highRisk2 ){
                        if(highRisk2.Level >= highRisk.Level){
                            hightRiskData = highRisk2;
                        }else{
                            hightRiskData = highRisk;
                        }
                    }else if( highRisk ){
                        hightRiskData = highRisk2
                    }else if( highRisk2 ){
                        hightRiskData = highRisk
                    }
                    this.props.setHightRiskData2(highRisk2);
                    if(hightRiskData.Level == 3 || hightRiskData.Level == 2){
                        this.showAlertView(hightRiskData.Message, () => {
                            return ViewUtil.getAlertButton('确定', () => {
                                this.dismissAlertView();
                                if(hightRiskData.Level == 3){
                                    //3级高危不可查 不可订
                                }else{
                                    this.OrderTravelApply()
                                }
                            })
                        })
                    }else{
                        this.OrderTravelApply()
                    }
                }else{
                    this.OrderTravelApply()
                }
            })
            .catch(error=>{
                this.OrderTravelApply()
            });
        }

    OrderTravelApply(){
        const {apply,compSwitch,comp_travelers,compCreate_bool,comp_userInfo} = this.props;
        const { cabin, queryRt, departureCity, destinationCity, departureDate, destinationDate,selectApplyItem,isDirect,airline,canbinOption } = this.state;
        let chooseLists;
        // if(compSwitch){
            if(compCreate_bool){//判断该综合订单是创建还是继续预订
                if(!comp_userInfo&&!comp_userInfo.userInfo&&!comp_userInfo.employees&&!comp_userInfo.travellers&&!comp_userInfo.ProjectId){
                    return;
                }
                chooseLists = comp_userInfo&&comp_userInfo.employees
            }else{
                chooseLists=(comp_travelers&&comp_travelers.compEmployees).concat(comp_travelers&&comp_travelers.compTraveler)
            }
        // }
       
        let queryModel = {
            OriCode: departureCity.CityCode,
            DepartureNationalCode: departureCity.NationalCode,
            DepartureNationalName: departureCity.NationalName,
            DepCityName: departureCity.Cname,
            DesCode: destinationCity.CityCode,
            DestinationNationalCode: destinationCity.NationalCode,
            DestinationNationalName: destinationCity.NationalName,
            ArrCityName: destinationCity.Cname,
            DepartureCity: departureCity,
            DestinationCity: destinationCity,
            DepDate: departureDate.format('yyyy-MM-dd', true),
            RetDate: destinationDate.format('yyyy-MM-dd', true),
            JourneyType: queryRt ? 'RT' : 'OW',
            PhysicalCabin: cabin.code,
            CabinModel: cabin,
            isDirect:isDirect,
        }
        let params = { 
            isRt: queryRt, 
            queryModel: queryModel, 
            fromCategory: 7,//订单类型 1.国内机票，7国际机票，4国内酒店，6国际酒店，5火车票
        }   
        if(apply){
            // let journeyType = 1;
            let journeyid = 0;
            if(apply.TravelApplyMode==1 && apply.JourneyList && apply.JourneyList.length>0){
                //行程模式
                // journeyType = selectApplyItem&&selectApplyItem.JourneyType;
                journeyid = selectApplyItem&&selectApplyItem.Id
            }else{
                //目的地模式
                // journeyType = apply.Destination.JourneyType;
            }
            let model ={
                ApplyId:apply.Id, //申请单对象
                JourneyId:journeyid,//申请单行程Id
                Category: 8,//订单类型 1.国内机票，8国际机票，4国内酒店，16国际酒店，2火车票
                Departure: departureCity.Cname,//出发城市（查询出发城市）
                Destination: destinationCity.Cname,//到达城市（查询到达城市）
                BeginTime:departureDate.format('yyyy-MM-dd HH:mm'), //出发时间(填查询时间)
                JourneyType:queryRt ? 2 : 1,//行程类型  单程或往返 1.单程，2.往返
                EndTime:destinationDate.format('yyyy-MM-dd HH:mm'), //到达时间(填查询时间)
                Travellers:chooseLists,
                ReferenceEmployeeId:this.props.comp_userInfo&&this.props.comp_userInfo.ReferenceEmployeeId?this.props.comp_userInfo.ReferenceEmployeeId:0,
                ReferencePassengerId:this.props.comp_userInfo&&this.props.comp_userInfo.referencPassengerId,
              };
              params.JourneyId = journeyid
            CommonService.OrderValidateTravelApply(model).then(response => {
                if (response && response.success) {
                    this.push('IntlFlightLowPriceList', {
                        isRt: queryRt,
                        queryModel: queryModel,
                        JourneyId:journeyid,
                        airline:airline,
                        canbinOption:canbinOption,
                        
                    })
                } else {
                    this.toastMsg(response.message || '操作失败');
                }
            }).catch(error => {
                this.toastMsg(error.message || '操作失败');
            })
        }else{
            this.push('IntlFlightLowPriceList', {
                isRt: queryRt,
                queryModel: queryModel,
                airline:airline,
            })          
        }
    }

    /**
     *  左右行程按钮
     */
    _renderHeader = () => {
        const { queryRt,applyNum,customerInfo } = this.state;
        // let travButs = ['单程','往返','多程'];
        let travButs = [
            {_title:'单程',_choose:queryRt?false:true},
            {_title:'往返',_choose:queryRt?true:false}
        ];
        return (
            <View style={{ flexDirection: 'row', height: 44, marginHorizontal:20, backgroundColor:Theme.normalBg, borderRadius:6 }}>
               {
                 travButs.map((item,index)=>{
                    return(
                        <TouchableOpacity onPress={this._imagePress.bind(this, index)}
                                          style={{margin:4, backgroundColor:item._choose?'#fff':Theme.normalBg,justifyContent:'center',flex:1,borderRadius:3,alignItems:'center'}}>
                            <CustomText text={item._title} style={{fontSize:14}}></CustomText>
                        </TouchableOpacity>
                    )
                 })
               }
            </View>
        )
    }

    _renderCity = () => {
        const { departureCity, destinationCity } = this.state;
        return (
            <View style={{ flexDirection: 'row', height: 60, alignItems: 'center',paddingHorizontal:20,justifyContent:'space-between' }}>
                <TouchableHighlight underlayColor='transparent' style={{ }} onPress={this._gotoSelectCity.bind(this, 1)}>
                    <CustomText style={[styles.text, { color: departureCity ? 'black' : 'gray' }]} text={departureCity ? (Util.Parse.isChinese() ? departureCity.Cname : (departureCity.CityEg ? departureCity.CityEg : departureCity.CityCode)) : '出发城市'} />
                </TouchableHighlight>
                <TouchableOpacity underlayColor='transparent' onPress={this._exchangeCity}>
                    <Image style={{height:28,width:28}} source={require('../../res/Uimage/flightFloder/flightSwich.png')}  ></Image>
                </TouchableOpacity>
                <TouchableHighlight underlayColor='transparent' style={{ }} onPress={this._gotoSelectCity.bind(this, 2)}>
                    <CustomText style={[styles.text, { color: destinationCity ? 'black' : 'gray' }]} text={destinationCity ? (Util.Parse.isChinese() ? destinationCity.Cname : (destinationCity.CityEg ? destinationCity.CityEg : destinationCity.CityCode)) : '到达城市'} />
                </TouchableHighlight>
            </View>
        )
    }

    _renderCalendar = () => {
        const { departureDate, destinationDate, queryRt } = this.state;
        return (
            <View style={{ flexDirection: 'row',justifyContent:'space-between'  }}>
                <TouchableOpacity underlayColor='transparent' style={{ flexDirection: 'row' }} onPress={this._gotoSelctDate.bind(this, 1)}>
                        <View style={styles.dateStyle}>
                            <CustomText style={{ color: departureDate ? 'black' : 'gray',fontSize:18 }} text={departureDate ? (departureDate.format('MM-dd')) : '出发时间'} />
                            <CustomText style={{ color: Theme.commonFontColor ,fontSize:12 }} text={departureDate &&Util.Parse.isChinese()? (' ' + I18nUtil.translate(Util.Date.getWeekDesc(departureDate))) : ''} />
                        </View>
                </TouchableOpacity>
                <View style={{ height: 1, backgroundColor: Theme.themeLine, marginHorizontal:20 }}></View>
                {
                queryRt ? 
                <TouchableOpacity underlayColor='transparent' style={{ flexDirection: 'row'  }} onPress={this._gotoSelctDate.bind(this, 2)}>
                      <View style={styles.dateStyle}>
                        <CustomText style={{ color: destinationDate ? 'black' : 'gray',fontSize:18 }} text={destinationDate ? (destinationDate.format('MM-dd')) : '到达时间'} />
                        <CustomText style={{ color: Theme.commonFontColor ,fontSize:12 }} text={destinationDate&&Util.Parse.isChinese() ?(' ' + I18nUtil.translate(Util.Date.getWeekDesc(destinationDate))) : ''} />
                      </View>
                </TouchableOpacity> : null
                }
            </View>
        )
    }

    renderBody() {
        const { canbinOption, cabin ,customerInfo,isDirect,queryRt} = this.state;
        const {comp_userInfo, comp_travelers,compCreate_bool,compSwitch} = this.props;
        return (
            <ScrollView >
               <AdContentInfoView adList={this.state.adList}/>
                {/* {compSwitch?
                <View style={{padding:10}}>
                 <ChoosePersonView comp_userInfo={comp_userInfo} comp_travelers={comp_travelers} compCreate_bool={compCreate_bool}/>
                </View>
                :null} */}
                 <View style={{paddingHorizontal:10}}>
                 <ChoosePersonView comp_userInfo={comp_userInfo} comp_travelers={comp_travelers} compCreate_bool={compCreate_bool}/>
                </View>
                <View style={styles.contain}>
                    <View style={{flexDirection:'row',paddingHorizontal:20,paddingVertical:15}}>
                        <Image source={require('../../res/Uimage/flightFloder/BusinessTrip.png')} style={{width:20,height:20,marginRight:5}}/>
                        <CustomText text={'出差行程'} style={{fontSize:14}}></CustomText>
                    </View>
                    {this._renderHeader()}
                    {this._renderCity()}
                    <View style={{ height: 1, backgroundColor: Theme.themeLine, marginHorizontal:20 }}></View>
                    {this._renderCalendar()}
                    <View style={{ height: 1, backgroundColor: Theme.themeLine, marginHorizontal:20 }}></View>
                    <TouchableHighlight underlayColor='transparent' onPress={this._cabinBtn}>
                         <View style={{flexDirection:'row',justifyContent:'space-between', height: 60, alignItems: 'center',paddingHorizontal:20}}>
                            <CustomText text={cabin.name?cabin.name:'请选择舱位'}  style={{fontSize:16,color:Theme.assistFontColor}} />
                            <AntDesign name={'right'} size={16} color={Theme.assistFontColor} />
                         </View>
                    </TouchableHighlight>
                    <View style={{ height: 1, backgroundColor: Theme.themeLine, marginHorizontal:20 }}></View>
                    {
                        customerInfo&&customerInfo.Addition&&customerInfo.Addition.HasTravelApplyAuth?
                        this._chooseApply()
                        :null
                    }
                    <View style={{ height: 1, backgroundColor: Theme.themeLine, marginHorizontal:20 }}></View>
                    {
                        this._chooseAirline()
                    }
                    <View style={{ height: 1, backgroundColor: Theme.themeLine, marginHorizontal:20 }}></View>
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center',height:44,paddingHorizontal:20 }} onPress={() => this.setState({ isDirect: !isDirect })}>
                        <CheckBox
                            tintColor= {Theme.promptFontColor} 
                            isChecked={isDirect}
                            onClick={() => this.setState({ isDirect: !isDirect })}
                        />
                        <CustomText style={{ marginRight: 5 }} text='仅查看直飞' />
                    </TouchableOpacity>
                    {
                      queryRt?null:
                        <View style={{flexDirection:'row', marginHorizontal:22,alignItems:'center'}}>
                            <AntDesign name={'infocirlceo'} size={14} color={Theme.assistFontColor} />
                            <CustomText style={{ color:Theme.redColor,marginLeft:5 }} text='往返程一起订价格更优惠!' />
                        </View>
                    }
                    {
                       ViewUtil.getSubmitButton2('查询', this._goSerchList)
                    }
                    {
                        this.params.SerialNumber?null:this._historySearchCity()
                    }
                    
                </View>
                <CustomActioSheet ref={o => this.actionSheet = o} options={canbinOption} onPress={this._handlePress} />
            </ScrollView>
        )
    }

    _historySearchCity = () => {
        const { historRecordList } = this.state;
        if (!historRecordList || historRecordList.length === 0) return; 
            let obj = {};
            let historyArr = historRecordList.filter(function (item, index, arr) {
                return obj.hasOwnProperty(typeof item + JSON.stringify(item)) ? false : (obj[typeof item + JSON.stringify(item)] = true);
            });
        return (
            <View style={{}}>
                <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginHorizontal:20}}>
                    <Text style={{fontSize:13 }}>{I18nUtil.translate('近期查询')}</Text>
                    <CustomText onPress={this._clearHistory} style={{ color: Theme.theme }} text='清除' />
                </View>
                <View style={ styles.historView}>
                    {
                        historyArr.map((item, index) => {
                            return (
                                <View style={{alignItems:'center', justifyContent:'center',margin:5, borderWidth:1,borderRadius:2,borderColor:Theme.promptFontColor}} >
                                  <CustomText key={index} style={styles.histortText} 
                                              onPress={this._historySearchCityTouch.bind(this, item)} 
                                              text={I18nUtil.translate(item.goCityData.Cname) + '-' + I18nUtil.translate(item.arrivalCityData.Cname)} />
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
            departureCity: item.goCityData,
            destinationCity: item.arrivalCityData
        })
    }
    /**
     *  清除历史记录
     */
    _clearHistory = () => {
        this.setState({
            historRecordList: []
        }, () => {
            StorageUtil.removeKeyId(Key.IntFlightSearchCityRecord);
        })
    }

    _chooseApply = () => {
        const { applyNum } = this.state;
        const {compSwitch} = this.props;
        return(
            <View style={{ flexDirection: 'row', height: 60, alignItems: 'center' }}>
                <TouchableOpacity 
                    // disabled={(this.params.noApply||this.params.bCategory)?true:false}
                    disabled={compSwitch?(this.params.SerialNumber?false:true):true}  
                    style={{ flex: 1, paddingHorizontal:20, justifyContent:'space-between'}}  
                    onPress={this._chooseApplybtn.bind(this)}>
                        <View style={{ 
                                alignItems: 'center', 
                                flexDirection:'row',
                                justifyContent:'space-between'}}>
                            <CustomText  text={applyNum?applyNum:'请选择申请单'} style={{color:!applyNum?Theme.assistFontColor:Theme.fontColor,fontSize:applyNum?18:16}}/>
                            {
                                this.params.SerialNumber?null:
                                    <TouchableOpacity style={{height:36,width:36,alignItems:'center',justifyContent:'center'}}
                                        onPress={()=>{
                                                this.props.setApply();
                                                this.setState({
                                                    applyNum:null
                                                })
                                        }}
                                    >
                                 {applyNum&&<AntDesign name="close" size={18} style={{color:Theme.promptFontColor}}></AntDesign>}
                                 </TouchableOpacity>
                            }
                                 
                            <AntDesign name={'right'} size={16} color={Theme.assistFontColor} />    
                        </View> 
                </TouchableOpacity>
            </View>
        )
    }

    _chooseAirline = () => {
        const {airlineObj} = this.state;
        return(
            <View style={{ flexDirection: 'row', height: 60, alignItems: 'center' }}>
                <TouchableOpacity style={{ flex: 1, paddingHorizontal:20, justifyContent:'space-between'}} 
                    onPress={()=>{
                        this.push('AirlineSelectScreen',{
                            callBack:(obj)=>{
                                let airlineArr = [];
                                console.log('选择航空公司',obj)
                                airlineArr.push(obj.Code);
                                this.setState({
                                    airline:airlineArr,
                                    airlineObj:obj
                                })
                            }
                        })
                    }}
                >
                    <View style={{ 
                            alignItems: 'center', 
                            flexDirection:'row',
                            justifyContent:'space-between'}}>
                        {airlineObj?.Code? 
                            <CustomText  text={Util.Parse.isChinese()?airlineObj.FullName:airlineObj.EnName} style={{color:Theme.assistFontColor,fontSize:16}}/>:
                            <CustomText  text={'航空公司'} style={{color:Theme.assistFontColor,fontSize:16}}/>
                        }                               
                        <AntDesign name={'right'} size={16} color={Theme.assistFontColor} />    
                    </View> 
                </TouchableOpacity>
            </View>
        )
    }

    _chooseApplybtn = () => {
        const {chooseApply} = this.params;
        const { customerInfo } = this.state;
        this.push('ApplicationSelect',{
            from:'intlFlight',
            SerialNumber:this.params.SerialNumber,
            callBack:(obj,arrivalCityDisplay,goCityDisplay,BeginTime,EndTime,selectApplyItem)=>{
                let newDay = new Date().addDays(1);
                let beginT = Util.Date.toDate(BeginTime)
                let goCity = {
                    CityCode:goCityDisplay.IataCode,
                    CityEg:goCityDisplay.EnName,
                    CityEnName:goCityDisplay.EnName,
                    CityName:goCityDisplay.Name,
                    Cname:goCityDisplay.Name,
                    NationalCode:goCityDisplay.NationalCode,
                    NationalEg:goCityDisplay.EnNationalName,
                    NationalName:goCityDisplay.NationalName,
                }
                let arrivalCity = {
                    CityCode:arrivalCityDisplay.IataCode,
                    CityEg:arrivalCityDisplay.EnName,
                    CityEnName:arrivalCityDisplay.EnName,
                    CityName:arrivalCityDisplay.Name,
                    Cname:arrivalCityDisplay.Name,
                    NationalCode:arrivalCityDisplay.NationalCode,
                    NationalEg:arrivalCityDisplay.EnNationalName,
                    NationalName:arrivalCityDisplay.NationalName,
                }
                if(obj.Destination&&obj.Destination.DepartureList&&obj.Destination.DepartureList.length>0){
                    this.setState({
                        queryRt:obj.Destination.JourneyType&&obj.Destination.JourneyType==1?false:true,
                        destinationCity:arrivalCity,
                        departureCity:goCity,
                        departureDate:BeginTime && beginT>newDay ? beginT : newDay,
                        destinationDate:EndTime && beginT>newDay?Util.Date.toDate(EndTime):new Date().addDays(2),
                    })
                }else if(obj.JourneyList){
                    this.setState({
                        queryRt:selectApplyItem&&selectApplyItem.JourneyType&&selectApplyItem.JourneyType==1?false:true,
                        destinationCity:arrivalCity,
                        departureCity:goCity,
                        departureDate:BeginTime && beginT>newDay ? beginT : newDay,
                        destinationDate:EndTime && beginT>newDay?Util.Date.toDate(EndTime):new Date().addDays(2),
                        selectApplyItem: selectApplyItem,
                    })
                }
                let _canbin = selectApplyItem&&selectApplyItem.ExtensionJson&&apply.selectApplyItem.ExtensionJson.AirExtensionJson&&apply.selectApplyItem.ExtensionJson.AirExtensionJson.CanbinLimit
                if(customerInfo.Setting.FlightTravelApplyConfig.IsAllCategory){
                    customerInfo?.Setting?.FlightTravelApplyConfig?.IsEnableCanbinLimit?
                      this._selectCabinList(_canbin)
                    :null
                }
                this.setState({
                    applyNum:obj.SerialNumber,
                    selectCabin:_canbin?'经济舱':this.state.selectCabin,//默认经济舱
                })
            }}
        );
    }
}

const getProps = state => ({
    apply: state.apply.apply,
    comp_userInfo: state.comp_userInfo,
    compSwitch: state.compSwitch.bool,
    comp_travelers: state.comp_travelers,
    compCreate_bool:state.compCreate_bool.bool,
    feeType: state.feeType.feeType,
})

const getAction = dispatch => ({
    setHightRiskData: (value) => dispatch(action.highRiskSetData(value)),
    setHightRiskData2: (value) => dispatch(action.highRiskSetData2(value)),
    setApply: (value) => dispatch(action.applySet(value)),
})

export default connect(getProps,getAction)(SearchScreen);

const $height = 60;
const styles = StyleSheet.create({
    ad: {
        backgroundColor: "white",
        height: 40,
        marginHorizontal: 10,
        marginTop: 5,
        alignItems: 'center',
        flexDirection: "row",
        paddingHorizontal: 10
    },
    contain: {
        marginHorizontal: 10,
        paddingBottom:20,
        borderRadius:6,
        backgroundColor: '#fff',
    },
    image: {
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
    },
    city: {
        flexDirection: 'row',
        flex: 1,
    },
    view: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    text: {
        height: $height,
        flex: 1,
        textAlign: 'center',
        lineHeight: $height,
        fontSize:20
    },
    circle: {
        width: 35,
        height: 35,
        borderRadius: 17.5,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Theme.theme
    },
    histortText: {
        height: 30,
        color: Theme.darkColor,
        fontSize: 15,
        lineHeight: 30,
        textAlign: 'center'
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
        // elevation:1.5, shadowColor:'#999999', shadowOffset:{width:5,height:5}, shadowOpacity: 0.2, shadowRadius: 1.2
    },
    alertStyle:{
        width: '80%', 
        backgroundColor:'#fff',
        borderRadius:8,
        padding:10,
    }, 
    dateStyle:{ 
        justifyContent: 'center', 
        alignItems: 'center', 
        height:66,
        backgroundColor:'#fff',
        flexDirection:'row',
        marginHorizontal:20,
    },
    historView:{ 
        flexDirection: 'row', 
        flexWrap: 'wrap',
        paddingTop:10,
        paddingHorizontal:15,
    },
    histortText: {
        height: 26,
        color: Theme.darkColor,
        fontSize: 13,
        lineHeight: 26,
        textAlign: 'center',
        borderRadius:15,
        paddingHorizontal:3
    }
})