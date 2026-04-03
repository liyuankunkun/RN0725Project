import React from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Text,
    Image
} from 'react-native';
import SuperView from '../../super/SuperView';
import I18nUtil from '../../util/I18nUtil';
import CustomText from '../../custom/CustomText';
import Theme from '../../res/styles/Theme';
import { connect } from 'react-redux';
import Util from '../../util/Util';
import TrainService from '../../service/TrainService';
import LisItemView from '../train/ListItemView';
import AntDesign from 'react-native-vector-icons/AntDesign';
import TrainlistView from '../train/TrainlistView';

const dcCodes = ['D', 'G', 'GD', 'C', 'XGZ'];
class FlightTrainListScreen extends SuperView {
    constructor(props) {
        super(props);
        this.params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};
        this._navigationHeaderView = {
            title: this.params.isChange ? (I18nUtil.translate(this.params.DepartureCityName) + '-' + I18nUtil.translate(this.params.ArrivalCityName)) : I18nUtil.translate(this.params.goCityData.Name) + '-' + I18nUtil.translate(this.params.arrivalCityData.Name),
        },
            this._tabBarBottomView = {
                bottomInset: true,
                bottomColor: 'white'
            }
        this.state = {
            sectionLists: [],
            recordSection: [],
            isFilter: false,
            trainLowTrip: null,
            trainList: [],
            trainBottomIndex: 0,
            trainRecordList: [],
            isTrainFilter: false,
            trainFilterOptions: {
                FromStations: '不限',
                ToStations: '不限',
                TrainNewType:'不限',
                TrainGroup:'不限',
                FromTime:'不限',
                ToTime:'不限',
                TrainTicketType:'不限',
            },
            showTrain:true,
        }
    }

    componentDidMount() {
        this._loadTrainLowPriceList();
    }

    // 处理火车票业务
    _loadTrainLowPriceList() {        
        const { isChange, arrivalCityData, goCityData, goDate, isSingle, oldModel } = this.params;
        if (isChange) return;
        let model = {
            DepartureCode: goCityData.Name,
            DestinationCode: arrivalCityData.Name,
            DepartureDate: goDate.format('yyyy-MM-dd', true),
            FeeType: this.props.feeType,
            IsReissueQuery: 0,
            OrderId:oldModel && oldModel.Id
        }
        this.showLoadingView();
        TrainService.query(model).then(response => {
            this.hideLoadingView();
            if (response && Array.isArray(response)) {
                response.forEach(item => {
                    if (dcCodes.includes(item.train_type)) {
                        this.geTainMinPrice(item);
                        if (item.seatLowest) {
                            if (this.state.trainLowTrip) {
                                if (this.state.trainLowTrip.seatLowest.price > item.seatLowest.price) {
                                    this.state.trainLowTrip = item;
                                }
                            } else {
                                this.state.trainLowTrip = item;
                            }
                        }
                    }
                })
                this.setState({
                    trainList: response
                })
            } else {
            }
        }).catch(error => {
            this.hideLoadingView();
        })
    }

    geTainMinPrice(item) {
        let lowPrices = [];
        let check = item.IsCheckSeat == 1 && item.TrainSerat;
        if (dcCodes.includes(item.train_type)) {
            item.trainType = '高铁动车';
        } else {
            item.trainType = '普通列车';
        }
        const FlastTrain = ['G', 'GD', 'C', 'XGZ'];
        if (FlastTrain.includes(item.train_type)) {
            if (+item.dw_price > 0) {
                lowPrices.push({
                    seat: '动卧',
                    seatCount: !isNaN(item.dw_num) || item.dw_num ? (+item.dw_num) : 0,
                    price: +item.dwx_price,
                    checkSeat: check ? check.is_checkdw_num : 1
                })
            }
            if (+item.gjrw_price > 0) {
                lowPrices.push({
                    seat: '高级软卧',
                    seatCount: !isNaN(item.gjrw_num) || item.gjrw_num ? (+item.gjrw_num) : 0,
                    price: +item.gjrw_price,
                    checkSeat: check ? check.is_checkgjrw_num : 1
                });
            }
            if (+item.edz_price > 0) {
                lowPrices.push({
                    seat: '二等座',
                    seatCount: !isNaN(item.edz_num) || item.edz_num ? (+item.edz_num) : 0,
                    price: +item.edz_price,
                    checkSeat: check ? check.is_checkedz_num : 1
                });
            }
            if (+item.ydz_price > 0) {
                lowPrices.push({
                    seat: '一等座',
                    seatCount: !isNaN(item.ydz_num) || item.ydz_num ? (+item.ydz_num) : 0,
                    price: +item.ydz_price,
                    checkSeat: check ? check.is_checkydz_num : 1
                });
            }
            if (+item.edw_price > 0) {
                lowPrices.push({
                    seat: '二等卧',
                    seatCount: !isNaN(item.edw_num) || item.edw_num ? (+item.edw_num) : 0,
                    price: +item.edwx_price,
                    checkSeat: check ? check.is_checkedw_num : 1
                });
            }

            if (+item.ydw_price > 0) {
                lowPrices.push({
                    seat: '一等卧',
                    seatCount: !isNaN(item.ydw_num) || item.ydw_num ? (+item.ydw_num) : 0,
                    price: +item.ydwx_price,
                    checkSeat: check ? check.is_checkydw_num : 1
                });
            }
            if (+item.swz_price > 0) {
                lowPrices.push({
                    seat: '商务座',
                    seatCount: !isNaN(item.swz_num) || item.swz_num ? (+item.swz_num) : 0,
                    price: +item.swz_price,
                    checkSeat: check ? check.is_checkswz_num : 1
                });
            }
            if (+item.tdz_price > 0) {
                lowPrices.push({
                    seat: '特等座',
                    seatCount: !isNaN(item.tdz_num) || item.tdz_num ? (+item.tdz_num) : 0,
                    price: +item.tdz_price,
                    checkSeat: check ? check.is_checktdz_num : 1
                });
            }
            if (+item.yxydz_price > 0) {
                lowPrices.push({
                    seat: '优选一等座',
                    seatCount: !isNaN(item.yxydz_num) || item.yxydz_num ? (+item.yxydz_num) : 0,
                    price: +item.yxydz_price,
                    checkSeat: check ? check.is_checktdz_num : 1
                });
            }
        }
        if (lowPrices.length > 0) {
            let lowPrice = lowPrices[0];
            lowPrices.forEach(obj => {
                if (obj.price < lowPrice.price && obj.seatCount > 0) {
                    lowPrice = obj;
                }
            })
            item.seatLowest = {
                ...lowPrice
            }
        }
    }
    /**
     *  修改日期 index=1是减 =2加
     */
    _changeDate = (index) => {
        if (index === 1) {
            let today = new Date();
            if (this.params.isChange) {
                if (today.format('yyyy-MM-dd') === this.params.DepartureDateTime.format('yyyy-MM-dd')) {
                    this.toastMsg('所选时间不能小于当前时间');
                    return;
                }
                this.params.DepartureDateTime = this.params.DepartureDateTime.addDays(-1);
            } else {
                if (today.format('yyyy-MM-dd') === this.params.goDate.format('yyyy-MM-dd')) {
                    this.toastMsg('所选时间不能小于当前时间');
                    return;
                }
                this.params.goDate = this.params.goDate.addDays(-1);
            }
        } else {
            if (this.params.isChange) {
                this.params.DepartureDateTime = this.params.DepartureDateTime.addDays(1);
            } else {
                this.params.goDate = this.params.goDate.addDays(1);
            }
        }
        this.setState({  trainList: []}, () => {
            this._loadTrainLowPriceList();
        });
    }

    _renderHeaderDateSelect = () => {
        const { goDate, DepartureDateTime, isChange } = this.params;
        return (
            <View style={styles.headerView}>
                <View style={{flexDirection:'row',alignItems:'center'}}>
                    <AntDesign name={'left'} size={14} color={Theme.assistFontColor} />
                    <CustomText style={{fontSize:14, marginLeft:5}} onPress={this._changeDate.bind(this, 1)}
                        text='前一天'
                    />
                </View>
                <View style={styles.headerCenter}>
                    <CustomText style={{ color: Theme.theme}}
                        text={isChange ? DepartureDateTime.format('MM-dd') + ' ' + DepartureDateTime.getWeek() : goDate.format('MM-dd') + ' ' + goDate.getWeek()}
                    />
                </View>
                <View style={{flexDirection:'row',alignItems:'center'}}>
                    <CustomText style={{fontSize:14, marginRight:5}} onPress={this._changeDate.bind(this, 2)}
                        text='后一天'
                    />
                    <AntDesign name={'right'} size={14} color={Theme.assistFontColor} />
                </View>
            </View>
        )
    }

    renderBody() {
        const { trainList } = this.state;
        return (
            <View style={{ flex: 1 }}>
                {this._renderHeaderDateSelect()}
                {
                    <View style={{ flex: 1 }}>
                        <FlatList
                            style={{ flex: 1 }}
                            data={trainList}
                            showsVerticalScrollIndicator={false}
                            renderItem={this._renderTrainItem}
                            keyExtractor={(item, index) => String(index)}
                        />
                        {this._renderTrainBottom()}
                    </View>
                }
                <TrainlistView ref={o => this.priceView = o} />
            </View>
        )
    }
    /**
   * 行内容
   */
    _renderTrainItem = ({ item }) => {
        return (
            <LisItemView item={item} callBack={this._trainNextStation} trainlistCallBack={this._showDetail} filterOptions={this.state.trainFilterOptions} />
        )
    }
    _showDetail = (data,index) => {
        let departureDate =  this.params.goDate
        data.departureDate = departureDate.format('yyyy-MM-dd', true);
        this.priceView.show(data);
    }
    _renderTrainBottom = () => {
        // let array = ['出发', '到达', '耗时', '筛选'];
        // const { trainBottomIndex, isTrainFilter } = this.state;
        // return (
        //     <View style={{ backgroundColor: "white", height: 50, flexDirection: 'row' }}>
        //         {
        //             array.map((item, index) => {
        //                 return (
        //                     <TouchableOpacity key={index} onPress={this._renderTrainBottomFilter.bind(this, index)} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
        //                         <CustomText text={item} style={{ color: trainBottomIndex === index || (isTrainFilter && index === array.length - 1) ? Theme.theme : Theme.darkColor }} />
        //                         <Text style={{ color: trainBottomIndex === index || (isTrainFilter && index === array.length - 1) ? Theme.theme : Theme.darkColor }}>{index === 3 ? '' : '↓'}</Text>
        //                     </TouchableOpacity>
        //                 )
        //             })
        //         }
        //     </View>
        // )
        let array = ['出发', '耗时', '筛选'];
        let imaArr = [require('../../res/Uimage/IntFlightFloder/_timeb.png'),require('../../res/Uimage/flightFloder/time_circle2.png'),require('../../res/Uimage/flightFloder/filter.png')]
        const { trainBottomIndex, isTrainFilter } = this.state;
        return (
                <View style={{ backgroundColor: "#fff", height: 50, flexDirection: 'row',borderTopWidth:2,borderColor:Theme.greenBg }}>
                    {
                        array.map((item, index) => {
                            return (
                                <TouchableOpacity key={index} underlayColor='transparent' onPress={this._renderTrainBottomFilter.bind(this, index)} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                    <Image source={imaArr[index]} style={{ width: 22, height: 22, tintColor: trainBottomIndex === index || (isTrainFilter && index === array.length - 1) ? Theme.theme : Theme.darkColor, }}></Image>
                                    <CustomText text={item} style={{ color: trainBottomIndex === index || (isTrainFilter && index === array.length - 1) ? Theme.theme : Theme.darkColor,fontSize:11,marginTop:2 }} />
                                </TouchableOpacity>
                            )
                        })
                    }
                </View>
        )
    }
    /**
    *  筛选
    */
    _renderTrainBottomFilter = (index) => {
        let departureDate = this.params.goDate;
        switch (index) {
            case 0:
                this.state.trainList.sort((a, b) => {
                    let aDep = Util.Date.toDate(`${departureDate.format('yyyy-MM-dd', true)} ${a.start_time}`);
                    let bDep = Util.Date.toDate(`${departureDate.format('yyyy-MM-dd', true)} ${b.start_time}`);
                    return aDep - bDep;
                })
                break;

            // case 1:
            //     this.state.trainList.sort((a, b) => {
            //         let aDiff = departureDate.addDays(+a.arrive_days);
            //         let bDiff = departureDate.addDays(+b.arrive_days);
            //         let aDep = Util.Date.toDate(`${aDiff.format('yyyy-MM-dd', true)} ${a.arrive_time}`);
            //         let bDep = Util.Date.toDate(`${bDiff.format('yyyy-MM-dd', true)} ${b.arrive_time}`);
            //         return aDep - bDep;
            //     })
            //     break;
            case 1:
                this.state.trainList.sort((a, b) => {
                    return parseInt(a.run_time_minute) - parseInt(b.run_time_minute);
                })
                break;
            case 2:
                this.push('TrainFilterScreen', {
                    callBack: (isFilter, filterOptions) => {
                        this.setState({
                            isTrainFilter: isFilter,
                            trainFilterOptions: filterOptions
                        })
                    },
                    list: this.state.trainList,
                    filterOptions: this.state.trainFilterOptions
                });
                return;
        }

        this.setState({
            trainBottomIndex: index
        })
    }

    /**
     *  
     */
    _trainNextStation = (item) => {
        const { goCityData, arrivalCityData, goDate } = this.params
        item.SearchFromCity = {
            fromCityName: goCityData.Name,
            fromCityCode: goCityData.Name,
        }
        item.SearchToCity = {
            toCityName: arrivalCityData.Name,
            toCityCode: arrivalCityData.Name
        }
        let hasSeat = item.ticketTypes&&item.ticketTypes.some(ticket => ticket.seatCount > 0);
        if (hasSeat && item.can_buy_now === 'Y') {
            this.push('TrainTicketScreen', {
                ticket: item,
                reissueOrder: this.params.reissueOrder,
                departureDate: goDate,
                feeType: this.props.feeType
            })
        } else {
            if(item.can_buy_now==='N'){
                this.toastMsg('该车次车票未开售');
            }else{
                this.toastMsg('该车次车票已售完');
            }
        }
    }
}

const getPropsState = state => ({
    feeType: state.feeType.feeType,
    compSwitch: state.compSwitch.bool,
    ReferenceEmployee: state.compReferenceEmployee.ReferenceEmployee,//综合订单出差人选定参考出差人信息
    highRisk:state.highRisk.highRisk,
    comp_userInfo: state.comp_userInfo,
})

export default connect(getPropsState)(FlightTrainListScreen);

const styles = StyleSheet.create({
    headerView: {
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        justifyContent:'space-between',
        paddingHorizontal:10
    },
    headerText: {
        flex: 3,
        color: Theme.fontColor,
        textAlign: 'center'
    },
    headerCenter: {
        height: 20,
        backgroundColor: Theme.greenBg,
        // flex: 4,
        borderRadius: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal:18
    },
    bottomView: {
        height: 50,
        backgroundColor: 'white',
        flexDirection: 'row'
    },
    bottom_touch: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    alertStyle:{
        width: '80%', 
        backgroundColor:'#fff',
        borderRadius:8,
        padding:10,
        // height:125
        // marginTop:-250
    },
})