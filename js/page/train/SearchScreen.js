import React from 'react';
import {
    View,
    TouchableHighlight,
    StyleSheet,
    TouchableOpacity,
    DeviceEventEmitter,
    Image
} from 'react-native';
import SuperView from '../../super/SuperView';
import CommonEnum from '../../enum/CommonEnum';
import CommonService from '../../service/CommonService';
import CustomText from '../../custom/CustomText';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Theme from '../../res/styles/Theme';
import ViewUtil from '../../util/ViewUtil';
import StorageUtil from '../../util/StorageUtil';
import Key from '../../res/styles/Key';
import Util from '../../util/Util';
import I18nUtil from '../../util/I18nUtil';
import { connect } from 'react-redux';
import AdCodeEnum from '../../enum/AdCodeEnum';
import TrainService from '../../service/TrainService';
import AdContentInfoView from '../common/AdContentInfoView';
import Pop from 'rn-global-modal';
import LinearGradient from 'react-native-linear-gradient';
import ChoosePersonView from '../ComprehensiveOrder/commen/ChoosePersonView'
import action from '../../redux/action';

class SearchScreen extends SuperView {

    constructor(props) {
        super(props);
        this.params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};
        this._navigationHeaderView = {
            title: I18nUtil.translate('火车票') + (this.params.order ? I18nUtil.translate('（改签）') : ''),
            // rightButton: props.feeType === 1 ? ViewUtil.getRightButton('差旅标准', this._getTravelRule) : null
        }
        let trainInfo = {};
        if (this.params.order && this.params.order.TrainInfo) {
            this.reissueOrder = this.params.order;
            trainInfo = this.params.order.TrainInfo;
        }
        let newDay = new Date();
        let beginT = Util.Date.toDate(this.params.BeginTime) 
        this.state = {
            fromCityName:this.params.goCityDisplay&&this.params.goCityDisplay.Name?this.params.goCityDisplay.Name: trainInfo.FromStationName || '出发城市',
            fromCityCode:this.params.goCityDisplay&&this.params.goCityDisplay.TrainStationCode?this.params.goCityDisplay.TrainStationCode:trainInfo.FromStationCode || '',
            toCityName:this.params.arrivalCityDisplay&&this.params.arrivalCityDisplay.Name?this.params.arrivalCityDisplay.Name:trainInfo.ToStationName || '到达城市',
            toCityCode: this.params.arrivalCityDisplay&&this.params.arrivalCityDisplay.TrainStationCode?this.params.arrivalCityDisplay.TrainStationCode:trainInfo.ToStationCode || '',
            departureDate: beginT>newDay ? beginT : new Date(),
            isReissue: this.params.order && this.params.order.TrainInfo,
            historRecordList: [],
            adList: [],
            showDays: 14,
            applyNum:this.props.apply&&this.props.apply.SerialNumber,
            customerInfo:{},
            selectApplyItem:this.params.selectApplyItem,
        }
    }
    // 重置手势滑动
    // static navigationOptions = ({ navigation }) => {
    //     return {
    //         gesturesEnabled: false
    //     }
    //  }
    /**
     *  返回按钮
     */
    _backBtnClick = () => {
        this.pop();
    }
    componentWillUnmount() {
        this.backFromShopListener && this.backFromShopListener.remove();
    }
    componentDidMount() {
        const { cityList } = this.params;
        this.backFromShopListener = DeviceEventEmitter.addListener(
            'refreshaaa',  //监听器名
            () => {
                this.setState({
                    applyNum:null
                })
            },
        );
        CommonService.GetAdStrategyContent(AdCodeEnum.train).then(response => {
            if (response && response.success) {
                this.setState({
                    adList: response.data
                })
            }
        }).catch(error => {

        })

        CommonService.customerInfo().then(response => {
            if (response && response.success && response.data) {
                this.setState({
                    customerInfo:response.data
                })
                if (response.data.SettingItems) {
                    response.data.SettingItems.map((item) => {
                        if (item.Code == 'train_presale_period') {
                            this.setState({
                                showDays: item.Value
                            })
                        }
                    })
                }
            } else {
                // reject({ message: response.message || '获取客户信息失败' });
            }
        })
        // if (this.props.apply && this.props.apply.selectJourney) {
            StorageUtil.loadKeyId(Key.TrainCitysData).then(response => {
                if (response) {
                    this._analyseData(response);
                } else {
                    this._loadCitys();
                }
            }).catch(error => {
                this._loadCitys();
            })
        //     return;
        // }
        if (!this.params.order && !this.params.cityList && !this.props.apply) {
            StorageUtil.loadKeyId(Key.TrainSearchCityRecord).then(response => {
                if (response && Array.isArray(response) && response.length > 0) {
                    let obj = response[response.length - 1];
                    this.setState({
                        fromCityName: obj.fromCityName,
                        fromCityCode: obj.fromCityCode,
                        toCityCode: obj.toCityCode,
                        toCityName: obj.toCityName,
                        historRecordList: response
                    })
                }
            }).catch(error => {

            })
        }
        if (this.params.cityList) {
            this.setState({
                fromCityName: cityList[0].Name,
                fromCityCode: cityList[0].TrainStationCode,
                toCityCode: cityList[1].TrainStationCode,
                toCityName: cityList[1].Name,
            })
        }
    }

    _loadCitys = () => {
        this.showLoadingView();
        TrainService.CommonTrainStation2().then(response => {
            this.hideLoadingView();
            if (response && response.success) {
                if (response.data) {
                    StorageUtil.saveKeyId(Key.TrainCitysData, response.data);
                    this._analyseData(response.data);
                }
            }
        }).catch(error => {
            this.hideLoadingView();
        })
    }

    _analyseData = (data) => {
        let fromCity = null;
        let toCity = null;
        let journey = this.props.apply.selectJourney;
        for (let i = 0; i < data.length; i++) {
            let obj = data[i];
            if (obj.Name === journey.Departure) {
                fromCity = obj;
            }
            if (obj.Name === journey.Destination) {
                toCity = obj;
            }
            if (fromCity && toCity) {
                break;
            }
        }
        if (fromCity && toCity) {
            this.setState({
                fromCityName: fromCity.Name,
                fromCityCode: fromCity.Code,
                toCityName: toCity.Name,
                toCityCode: toCity.Code,
                departureDate: Util.Date.toDate(journey.DepartureTime)
            })
        }
    }



    /**
      *  获取差旅标准
      */
    _getTravelRule = () => {
        this.showLoadingView();
        const { ReferenceEmployee } = this.params;
        let modelStandar={
            OrderCategory:CommonEnum.orderIdentification.train,
        }
        CommonService.GetTravelStandards(modelStandar).then(response => {
            this.hideLoadingView();
            if (response?.data?.RuleDesc?.length > 0) {
                Pop.show(
                    <View style={styles.alertStyle}>
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <CustomText text={'温馨提示'} style={{ margin: 6, fontSize: 18, fontWeight: 'bold' }} />
                        </View>
                        <View style={{ width: '80%' }}>
                            <CustomText text={response.data.OrderCategoryDesc} style={{ padding: 2, fontSize: 14, fontWeight: 'bold' }} />
                            {
                                ReferenceEmployee && JSON.stringify(ReferenceEmployee) != '{}' && ReferenceEmployee.RulesTravelDetails ?
                                    ReferenceEmployee.RulesTravelDetails && ReferenceEmployee.RulesTravelDetails.map((obj) => {
                                        if (obj.Category === 5) {
                                            return (
                                                obj.Rules.map((item, index) => {
                                                    return (
                                                        <View style={{ flexDirection: 'row', padding: 2 }} key={index}>
                                                            <CustomText text={item.Key + ': ' + item.Value} />
                                                        </View>
                                                    )
                                                })
                                            )
                                        }
                                    })
                                    :
                                    response.data.RuleDesc.map((item) => {
                                        return (
                                            <View style={{ flexDirection: 'row', padding: 2 }}>
                                                <CustomText text={item.Name + ': ' + item.Desc} />
                                            </View>
                                        )
                                    })
                            }
                        </View>
                        <TouchableHighlight underlayColor='transparent'
                            style={{ height: 40, alignItems: 'center', justifyContent: 'center', marginTop: 10, borderTopWidth: 1, borderColor: Theme.lineColor }}
                            onPress={() => { Pop.hide() }}>
                            <CustomText text='确定' style={{ fontSize: 19, color: Theme.theme }} />
                        </TouchableHighlight>
                    </View>
                    , { animationType: 'fade', maskClosable: false, onMaskClose: () => { } })

            } else {
                this.showAlertView('国内火车票:不限');
            }
        }).catch(error => {
            this.hideLoadingView();
            this.toastMsg(error.message || '获取数据异常');
        })
    }
    /**
       *  选择日期
       */
    _gotoSelctDate = () => {
        const { showDays } = this.state;
        this.push('Calendar', {
            from: 'train',
            date: this.state.departureDate,
            showDays: showDays,
            backDate: (date) => {
                this.setState({
                    departureDate: date
                })
            }
        })
    }
    /**
     *  选择城市
     * index 1是去程 2是目的地
     */
    _gotoSelectCity = (index) => {

        this.push('TrainCityScreen', {
            callBack: (data) => {
                if (index === 1) {
                    this.setState({
                        fromCityCode: data.Code,
                        fromCityName: data.Name
                    })
                } else {
                    this.setState({
                        toCityName: data.Name,
                        toCityCode: data.Code
                    })
                }
            }
        });
    }
    /**
     * 去查询
     */
    _toSearchBtn = () => {
        const { fromCityName, fromCityCode, toCityName, toCityCode, departureDate, historRecordList } = this.state;
        if (!fromCityCode) {
            this.toastMsg('请选择出发城市')
            return;
        }
        if (!toCityCode) {
            this.toastMsg('请选择到达城市');
            return;
        }
        if (fromCityCode === toCityCode) {
            this.toastMsg('出发城市与到达城市不能相同');
            return;
        }
        if (!departureDate) {
            this.toastMsg('请选择出发日期');
            return;
        }

        // //判断改签情况下是否能提交  删除
        // if (this.reissueOrder) {
        //     let date = new Date(+ new Date() + 30 * 60 * 1000);
        //     let oldDate = this.reissueOrder.TrainInfo.DepartureTime;
        //     if (date > Util.Date.toDate(oldDate)) {
        //         this.toastMsg('距离发车时间30分钟之内不允许提交改签');
        //         return;
        //     }
        // }

        CommonService.HighRiskPC({
            DepartureCode:fromCityCode,
            ArrivalCode:toCityCode,
            BusinessCategory:2
        },this).then(res => {
            this.props.setHightRiskData(res);
            this.OrderTravelApply();
        })
        let index = historRecordList.findIndex(obj => {
            return (obj.fromCityCode === fromCityCode && obj.toCityCode === toCityCode)
        })
        if (index > -1) {
            [historRecordList[index], historRecordList[historRecordList.length - 1]] = [historRecordList[historRecordList.length - 1], historRecordList[index]];
        } else {
            historRecordList.push({
                fromCityCode,
                toCityCode,
                fromCityName,
                toCityName
            })
            if (historRecordList.length > 6) {
                historRecordList.splice(0, 1);
            }
        }
        this.setState({}, () => {
            StorageUtil.saveKeyId(Key.TrainSearchCityRecord, historRecordList);
        })
    }
    OrderTravelApply(){
        const {apply,compSwitch,comp_userInfo, comp_travelers,compCreate_bool} = this.props;
        const {selectApplyItem} = this.state;
        let chooseLists;
        // if(compSwitch){
            if(compCreate_bool){//判断该综合订单是创建还是继续预订
                if(!comp_userInfo&&!comp_userInfo.userInfo&&!comp_userInfo.employees&&!comp_userInfo.ProjectId){
                    return;
                }
                chooseLists = comp_userInfo&&comp_userInfo.employees
            }else{
                chooseLists=comp_travelers&&comp_travelers.compEmployees
            }
        // }
            
        let params = {
            queryModel: this.state,
            reissueOrder: this.reissueOrder,
            fromCategory: 5,//订单类型 1.国内机票，7国际机票，4国内酒店，6国际酒店，5火车票
        }
        if(apply){
            let journeyType = 1;
            let journeyid = 0;
            if(apply.TravelApplyMode==1 && apply.JourneyList && apply.JourneyList.length>0){
                //行程模式
                journeyType = selectApplyItem&&selectApplyItem.JourneyType;
                journeyid = selectApplyItem&&selectApplyItem.Id
            }else{
                //目的地模式
                journeyType = apply?.Destination?.JourneyType || journeyType;
            }
            params.JourneyId = journeyid
            const { fromCityName, toCityName, departureDate, historRecordList } = this.state;
            let model ={
                ApplyId:apply.Id, //申请单对象
                JourneyId:journeyid,//申请单行程Id
                Category: 2,//订单类型 1.国内机票，8国际机票，4国内酒店，16国际酒店，2火车票
                Departure: fromCityName,//出发城市（查询出发城市）
                Destination: toCityName,//到达城市（查询到达城市）
                BeginTime:departureDate.format('yyyy-MM-dd HH:mm'), //出发时间(填查询时间)
                JourneyType:1,//行程类型  单程或往返 1.单程，2.往返
                EndTime:'', //到达时间(填查询时间)
                Travellers:chooseLists,
                ReferenceEmployeeId:this.props.comp_userInfo&&this.props.comp_userInfo.ReferenceEmployeeId?this.props.comp_userInfo.ReferenceEmployeeId:0,
                ReferencePassengerId:this.props.comp_userInfo&&this.props.comp_userInfo.referencPassengerId,
              };
            CommonService.OrderValidateTravelApply(model).then(response => {
                if (response && response.success) {
                    // compSwitch?
                    this.push('TrainListScreen', {
                        queryModel: this.state,
                        reissueOrder: this.reissueOrder,
                        JourneyId: journeyid,
                    })
                    // :
                    // this.push('TravelBookScreen',params);
                } else {
                    this.toastMsg(response.message || '操作失败');
                }
            }).catch(error => {
                this.toastMsg(error.message || '操作失败');
            })
        }else{
            // compSwitch?
            this.push('TrainListScreen', {
                queryModel: this.state,
                reissueOrder: this.reissueOrder,
            })
            // : 
            // this.push('TravelBookScreen',params);
        }
    }
    /**
     *  转换城市
     */
    _exchangeCity = () => {
        [this.state.fromCityName, this.state.toCityName] = [this.state.toCityName, this.state.fromCityName];
        [this.state.fromCityCode, this.state.toCityCode] = [this.state.toCityCode, this.state.fromCityCode];
        this.setState({});
    }
    /**
     *  删除历史记录
     */
    _clearHistory = () => {
        this.setState({
            historRecordList: []
        }, () => {
            StorageUtil.removeKeyId(Key.TrainSearchCityRecord);
        })
    }
    _historySearchCityTouch = (item) => {
        this.setState({
            fromCityName: item.fromCityName,
            fromCityCode: item.fromCityCode,
            toCityName: item.toCityName,
            toCityCode: item.toCityCode
        })
    }

    _renderCity = () => {
        const { fromCityName, toCityName, isReissue } = this.state;
        return (
            <View style={{ flexDirection: 'row', height: 69, alignItems: 'center',paddingHorizontal:20,justifyContent:'space-between'}}>
                <TouchableHighlight disabled={isReissue} underlayColor='transparent' style={{ }} onPress={this._gotoSelectCity.bind(this, 1)}>
                    <CustomText style={[styles.text, { color: !isReissue ? 'black' : 'gray' }]} text={fromCityName} />
                </TouchableHighlight>
                <TouchableOpacity underlayColor='transparent' onPress={this._exchangeCity}>
                    <Image style={{height:28,width:28}} source={require('../../res/Uimage/trainFloder/changeTrain.png')}  ></Image>
                </TouchableOpacity>
                <TouchableHighlight underlayColor='transparent' style={{ }} onPress={this._gotoSelectCity.bind(this, 2)}>
                    <CustomText style={[styles.text]} text={toCityName} />
                </TouchableHighlight>
            </View>
        )
    }
    _renderCalendar = () => {
        const { departureDate } = this.state;
        return (
            <View style={{flexDirection: 'row',justifyContent:'space-between'}}>
            <TouchableHighlight underlayColor='transparent' onPress={this._gotoSelctDate}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <View style={styles.dateStyle}>
                        <CustomText style={[{ color: departureDate ? 'black' : 'gray' }]} text={departureDate ? (departureDate.format('MM-dd')) : '出发时间'} />
                        <CustomText style={[{ color: Theme.theme }]} text={departureDate && Util.Parse.isChinese() ? (' ' + I18nUtil.translate(Util.Date.getWeekDesc(departureDate))) : ''} />
                    </View>
                </View>
            </TouchableHighlight>
            </View>
        )
    }
    _historySearchCity = () => {
        const { historRecordList } = this.state;
        if (!historRecordList || historRecordList.length === 0) return;
        return (
            <View style={{}}>
                <View style={{ flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginHorizontal:20}}>
                    <CustomText text={'近期查询'} style={{fontSize:13 }} />
                    <CustomText onPress={this._clearHistory} style={{ color: Theme.theme }} text='清除' />
                </View>
                <View style={ styles.historView}>
                        {
                            historRecordList.map((item, index) => {
                                return (
                                    <View key={ index } style={{alignItems:'center', justifyContent:'center',margin:5, borderWidth:1,borderRadius:2,borderColor:Theme.promptFontColor }}>
                                        <CustomText key={index} style={styles.histortText} onPress={this._historySearchCityTouch.bind(this, item)} text={I18nUtil.translate(item.fromCityName) + '-' + I18nUtil.translate(item.toCityName)} />
                                    </View>
                                )
                            })
                        }
                </View>
            </View>

        )
    }

    renderBody() {
        const { comp_userInfo, comp_travelers, compCreate_bool, compSwitch } = this.props;
        const{customerInfo} = this.state;
        return (
            <View>
                <AdContentInfoView adList={this.state.adList} />
                {/* {compSwitch ? */}
                    <View style={{ paddingHorizontal:12 }}>
                        <ChoosePersonView comp_userInfo={comp_userInfo} comp_travelers={comp_travelers} compCreate_bool={compCreate_bool} />
                    </View>
                    {/* : null} */}
                <View style={styles.contain}>
                    <View style={{flexDirection:'row',paddingHorizontal:20,paddingVertical:15}}>
                        <Image source={require('../../res/Uimage/flightFloder/BusinessTrip.png')} style={{width:20,height:20,marginRight:5}}/>
                        <CustomText text={'出差行程'} style={{fontSize:14}}></CustomText>
                    </View>
                    {this._renderCity()}
                    <View style={{ height: 1, backgroundColor: Theme.themeLine, marginHorizontal:20 }}></View>
                    {this._renderCalendar()}
                    <View style={{ height: 1, backgroundColor: Theme.themeLine, marginHorizontal:20 }}></View>
                    {
                        // customerInfo&&customerInfo.Setting&&customerInfo.Setting.TrainTravelApplyConfig.IsOnlyApply?
                        // this._chooseApply():
                        // null
                        customerInfo&&customerInfo.Addition&&customerInfo.Addition.HasTravelApplyAuth?
                        this._chooseApply()
                        :null
                    }
                    {
                        ViewUtil.getSubmitButton2('查询', this._toSearchBtn)
                    }
                    {
                        this._historySearchCity()
                    }
                </View>
            </View>
        )
    }

    _chooseApply = () => {
        const { applyNum } = this.state;
        const { compSwitch } = this.props;
        return(
            <View style={{ flexDirection: 'row', height: 60, alignItems: 'center'}}>
                <TouchableOpacity 
                        //   disabled={(this.params.noApply||this.params.bCategory)?true:false} 
                          disabled={compSwitch?(this.params.SerialNumber?false:true):true}  
                          underlayColor='transparent' style={{flex: 1, paddingHorizontal:20, justifyContent:'space-between'}} 
                          onPress={this._chooseApplybtn.bind(this)}>
                        <View style={{
                                    alignItems: 'center', 
                                    flexDirection:'row',
                                    justifyContent:'space-between'
                            }}>
                            <CustomText  text={applyNum?applyNum:'请选择申请单'} style={{color:(!applyNum||this.params.bCategory)?Theme.promptFontColor:Theme.fontColor,fontSize:applyNum?18:16}} /> 
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
                             <AntDesign name={'right'} size={16} color={Theme.promptFontColor} />
                        </View>     
                </TouchableOpacity>
            </View>
        )
    }
    _chooseApplybtn = () => {
        this.push('ApplicationSelect',{
            from:'train',
            SerialNumber:this.params.SerialNumber,
            callBack:(obj,arrivalCityDisplay,goCityDisplay,BeginTime,EndTime,selectApplyItem)=>{
                let newDay = new Date();
                let beginT = Util.Date.toDate(BeginTime) 
                this.setState({
                    applyNum:obj.SerialNumber,
                    fromCityName: goCityDisplay.Name,
                    fromCityCode: goCityDisplay.TrainStationCode,
                    toCityCode: arrivalCityDisplay.TrainStationCode,
                    toCityName: arrivalCityDisplay.Name,
                    departureDate: beginT>newDay ? beginT : new Date(),
                    selectApplyItem:selectApplyItem,
                })
            }}
        );
    }

}
const getState = state => ({
    apply: state.apply.apply,
    feeType: state.feeType.feeType,
    comp_userInfo: state.comp_userInfo,
    compSwitch: state.compSwitch.bool,
    comp_travelers: state.comp_travelers,
    compCreate_bool: state.compCreate_bool.bool,
    
})
const getAction = dispatch => ({
    setHightRiskData: (value) => dispatch(action.highRiskSetData(value)),
    setApply: (value) => dispatch(action.applySet(value)),
})
export default connect(getState,getAction)(SearchScreen);


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
        paddingBottom:30,
        borderRadius:6,
        backgroundColor: '#fff',
        // elevation:0.3, shadowColor:'#ccc', shadowOffset:{width:1,height:1}, shadowOpacity: 0.1, shadowRadius: 1.5
    },
    image: {
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white'
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
        height: 26,
        color: Theme.darkColor,
        fontSize: 13,
        lineHeight: 26,
        textAlign: 'center',
        borderRadius:15,
        paddingHorizontal:3
    },
    alertStyle: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 10,
        // height:125
        // marginTop:-250
    },
    dateStyle: {
        justifyContent: 'center', 
        alignItems: 'center', 
        height:66,
        backgroundColor:'#fff',
        flexDirection:'row',
        marginHorizontal:20,
    },
    historView: {
        flexDirection: 'row', 
        flexWrap: 'wrap',
        paddingTop:10,
        paddingHorizontal:15,
    },
})