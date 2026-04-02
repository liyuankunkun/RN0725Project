import React from 'react';
import {
    View,
    Image,
    TouchableHighlight,
    StyleSheet,
    TouchableOpacity
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
class TrainChangeSearchScreen extends SuperView {

    constructor(props) {
        super(props);
        this.params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};
        this._navigationHeaderView = {
            title: I18nUtil.translate('火车票') +  I18nUtil.translate('（改签）'),
            // rightButton: props.feeType === 1 ? ViewUtil.getRightButton('差旅标准', this._getTravelRule) : null
        }
        let trainInfo = {};
        if (this.params.order && this.params.order.TrainInfo) {
            this.reissueOrder = this.params.order;
            trainInfo = this.params.order.TrainInfo;
        }
        this.state = {
            fromCityName: trainInfo.DepartureCity || '出发城市',
            fromCityCode: trainInfo.FromStationCode || '',
            toCityName: trainInfo.ArrivalCity || '到达城市',
            toCityCode: trainInfo.ToStationCode || '',
            departureDate: new Date(),
            isReissue: this.params.order && this.params.order.TrainInfo,
            historRecordList: [],
            adList: [],
            ApplyId:null,
        }
    }
    componentDidMount() {

        CommonService.GetAdStrategyContent(AdCodeEnum.train).then(response => {
            if (response && response.success) {
                this.setState({
                    adList: response.data
                })
            }
        }).catch(error => {

        })


        if (this.props.apply && this.props.apply.selectJourney) {
            StorageUtil.loadKeyId(Key.TrainCitysData).then(response => {
                 if(response){
                  this._analyseData(response);
                 }else{
                     this._loadCitys();
                 }
            }).catch(error => {
                this._loadCitys();
            })
            return;
        }


        if (!this.params.order) {
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

        if(this.reissueOrder){
            TrainService.orderDetail(this.reissueOrder.Id).then(orderDetail => {
                this.hideLoadingView();
                if (orderDetail && orderDetail.success) {
                    this.setState({
                        ApplyId:orderDetail.data.ApplyId
                    })
                } else {
                    this.toastMsg(orderDetail.message || '获取订单详情失败');
                }
            }).catch(error => {
                this.hideLoadingView();
                this.toastMsg(error.message || '获取订单详情失败');
            })
        }
    }

    _loadCitys = ()=>{
        this.showLoadingView();
        TrainService.CommonTrainStation2().then(response=>{
           this.hideLoadingView();
           if(response && response.success){
               if(response.data){
                StorageUtil.saveKeyId(Key.TrainCitysData,response.data);
                this._analyseData(response.data);
               }
           }
        }).catch(error=>{
            this.hideLoadingView();
        })
    }

   _analyseData = (data)=>{
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
        let modelStandar={
            OrderCategory:CommonEnum.orderIdentification.train,
        }
        CommonService.GetTravelStandards(modelStandar).then(reponse => {
            this.hideLoadingView();
            if (reponse && reponse.data && Array.isArray(reponse.data) && reponse.data.length > 0) {
                this.showAlertView(reponse.data[0]['Desc'] ? reponse.data[0]['Desc'] : '暂无设置差旅标准');
            } else {
                this.showAlertView('火车票:不限');
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
        this.push('Calendar', {
            from: 'train',
            date: this.state.departureDate,
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
        const { fromCityName, fromCityCode, toCityName, toCityCode, departureDate, historRecordList,ApplyId } = this.state;
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

        // //判断改签情况下是否能提交 删除
        // if (this.reissueOrder) {
        //     let date = new Date(+ new Date() + 30 * 60 * 1000);
        //     let oldDate = this.reissueOrder.TrainInfo.DepartureTime;
        //     if (date > Util.Date.toDate(oldDate)) {
        //         this.toastMsg('距离发车时间30分钟之内不允许提交改签');
        //         return;
        //     }
        // }

        let model ={
            ApplyId:ApplyId, //申请单对象
            JourneyId:0,//申请单行程Id
            Category: 2,//订单类型 1.国内机票，8国际机票，4国内酒店，16国际酒店，2火车票
            Departure: fromCityName,//出发城市（查询出发城市）
            Destination: toCityName,//到达城市（查询到达城市）
            BeginTime:departureDate, //出发时间(填查询时间)
            JourneyType:0,//行程类型  单程或往返 1.单程，2.往返
            EndTime:'', //到达时间(填查询时间)
            OrderId:this.params.order.Id
          };
        CommonService.OrderValidateTravelApply(model).then(response => {
            if (response && response.success) {
               this.push('TrainChangeList', {
                    queryModel: this.state,
                    reissueOrder: this.reissueOrder,
                });
            } else {
                this.toastMsg(response.message || '操作失败');
            }
        }).catch(error => {
            this.toastMsg(error.message || '操作失败');
        })

        let index = historRecordList.findIndex(obj => {
            return (obj.fromCityCode === fromCityCode && obj.toCityCode === toCityCode)
        })
        if (index === -1) {
            if (historRecordList.length >= 6) {
                historRecordList[historRecordList.length - 1] = {
                    fromCityCode,
                    toCityCode
                }
            } else {
                historRecordList.push({
                    fromCityCode,
                    toCityCode,
                    fromCityName,
                    toCityName
                })
            }
            this.setState({}, () => {
                StorageUtil.saveKeyId(Key.TrainSearchCityRecord, historRecordList);
            })
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
            <View style={{ flexDirection: 'row', height: 60, alignItems: 'center',paddingHorizontal:10 }}>
                <TouchableHighlight disabled={isReissue} underlayColor='transparent' style={{ flex: 1 }} onPress={this._gotoSelectCity.bind(this, 1)}>
                    <CustomText style={[styles.text, { color: !isReissue ? Theme.fontColor : Theme.promptFontColor }]} text={fromCityName} />
                </TouchableHighlight>
                <TouchableOpacity underlayColor='transparent' 
                                //   onPress={this._exchangeCity}
                >
                    <View style={styles.circle}>
                        {/* <AntDesign name={'swap'} size={30} color={'white'} /> */}
                        <Image source={require('../../res/Uimage/trainFloder/changeTrain.png')} style={{width:30,height:30,marginRight:5}}/>
                    </View>
                </TouchableOpacity>
                <TouchableHighlight underlayColor='transparent' style={{ flex: 1 }} onPress={this._gotoSelectCity.bind(this, 2)}>
                    <CustomText style={[styles.text2]} text={toCityName} />
                </TouchableHighlight>
            </View>
        )
    }
    _renderCalendar = () => {
        const { departureDate } = this.state;
        return (
            <View style={{ flexDirection: 'row', height: 60, alignItems: 'center',paddingHorizontal:10 }}>
                <TouchableOpacity style={{ flex: 1,flexDirection:"row" }} onPress={this._gotoSelctDate}>
                    <CustomText style={[styles.text3, { color: departureDate ? Theme.fontColor : Theme.promptFontColor }]} text={departureDate ? (departureDate.format('yyyy-MM-dd')) : '出发时间'} />
                    <CustomText style={[styles.text3, { color: departureDate ? Theme.commonFontColor : Theme.promptFontColor,fontSize:12,marginTop:2 }]} text={departureDate ? (' ' + I18nUtil.translate(Util.Date.getWeekDesc(departureDate))) : ''} />
                </TouchableOpacity>
            </View>
        )
    }
    _historySearchCity = () => {
        const { historRecordList } = this.state;
        if (!historRecordList || historRecordList.length === 0) return;

        return (
            <View>
                <View style={{ marginTop: 20, flexDirection: 'row', flexWrap: 'wrap' }}>

                    {
                        historRecordList.map((item, index) => {
                            return (
                                <CustomText key={index} style={[styles.histortText, { width: screenWidth / 3 }]} onPress={this._historySearchCityTouch.bind(this, item)} text={I18nUtil.translate(item.fromCityName) + '-' + I18nUtil.translate(item.toCityName)} />
                            )
                        })
                    }
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                    <View style={{ backgroundColor: '#DCDCDC', height: 30, width: 85, borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <CustomText onPress={this._clearHistory} style={{ fontSize: 12, color: Theme.darkColor }} text='清除历史' />
                    </View>
                </View>
            </View>

        )
    }

    renderBody() {
        const {PassengerName ,OrderTravellerDesc } = this.params.order;
        let nameStr=''
        if(PassengerName){
            nameStr= PassengerName
        }else{
            nameStr= OrderTravellerDesc
        }
        return (
            <View>
                <View style={{  margin: 10 }}>
                    <View style={styles.personsStylel}>
                        <Image source={require('../../res/Uimage/travellers.png')} style={{width:20,height:20}}/>
                        <CustomText text={'出差人:'} style={{marginTop:10,margin:5,fontSize:14,}}/>
                        <CustomText text={nameStr} style={{fontSize:14}}/>
                    </View>
                    <View style={{backgroundColor:'#fff',paddingHorizontal:10,borderRadius:6,paddingBottom:10}}>
                    <View style={{flexDirection:'row',paddingHorizontal:10,paddingVertical:15}}>
                            <Image source={require('../../res/Uimage/flightFloder/BusinessTrip.png')} style={{width:20,height:20,marginRight:5}}/>
                            <CustomText text={'改签行程'} style={{fontSize:14}}></CustomText>
                       </View>
                    {this._renderCity()}
                    <View style={{ height: 1, backgroundColor: Theme.lineColor,marginHorizontal:10 }}></View>
                    {this._renderCalendar()}
                    <View style={{ height: 1, backgroundColor: Theme.lineColor,marginHorizontal:10 }}></View>
                    <View style={{height:30}}></View>
                    {
                        ViewUtil.getSubmitButton2('查询', this._toSearchBtn)
                    }
                    </View>
                </View>
                {/* {
                    this._historySearchCity()
                } */}
            </View>
        )
    }
}
const getState = state => ({
    apply: state.apply.apply,
    feeType: state.feeType.feeType
})
export default connect(getState)(TrainChangeSearchScreen);


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
        marginTop: 10,
        // flex:1,
        backgroundColor: 'white'
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
        // flex: 1,
        // textAlign: 'center',
        lineHeight: $height,
        fontSize:20
    },
    text2: {
        height: $height,
        // flex: 1,
        textAlign: 'right',
        lineHeight: $height,
        fontSize:20
    },
    text3: {
        height: $height,
        // flex: 1,
        // textAlign: 'right',
        lineHeight: $height,
        fontSize:18
    },
    circle: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    histortText: {
        height: 30,
        color: Theme.darkColor,
        fontSize: 15,
        lineHeight: 30,
        textAlign: 'center'
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