import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    TouchableHighlight,
    Text
} from 'react-native';
import SuperView from '../../super/SuperView';
import I18nUtil from '../../util/I18nUtil';
import CustomText from '../../custom/CustomText';
import { FlatList } from 'react-native-gesture-handler';
import Theme from '../../res/styles/Theme';
import { connect } from 'react-redux';
import TrainService from '../../service/TrainService';
import AntDesign from 'react-native-vector-icons/AntDesign';
import LisItemView from './ListItemView';
import Util from '../../util/Util';
import NetworkFaildView from '../../custom/NetWorkFaildView';
const dcCodes = ['D', 'G', 'GD', 'C', 'XGZ'];
class TrainChangeListScreen extends SuperView {

    constructor(props) {
        super(props);
        this.params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};
        let queryModel = this.params.queryModel || {};
        this._navigationHeaderView = {
            title: `${I18nUtil.translate(queryModel.fromCityName)} - ${I18nUtil.translate(queryModel.toCityName)}（改签）`
        }
        this._tabBarBottomView = {
            bottomInset: true,
            bottomColor: 'white'
        }
        this.state = {
            bottomIndex: 0,
            dataList: [],
            recordList: [],
            isFilter: false,
            filterOptions: {
                FromStations: '不限',
                ToStations: '不限',
                TrainNewType:'不限',
                TrainGroup:'不限',
                FromTime:'不限',
                ToTime:'不限',
                TrainTicketType:'不限',
            },
            showErrorMessage: ''
        }
    }

    componentDidMount() {
        this._loadList();
    }

    _loadList = () => {
        const { fromCityCode, toCityCode, departureDate } = this.params.queryModel;
        let model = {
            DepartureCode: fromCityCode,
            DestinationCode: toCityCode,
            DepartureDate: departureDate.format('yyyy-MM-dd', true),
            FeeType: this.props.feeType,
            IsReissueQuery: 1,
            OrderId:this.params.reissueOrder&&this.params.reissueOrder.Id,
        }
        this.showLoadingView();
        TrainService.query(model).then(response => {
            this.hideLoadingView();
            if (response && Array.isArray(response)) {
                if (response.length === 0) {
                    this.setState({
                        showErrorMessage: '没有符合条件的车次啦~'
                    })
                    return;
                }
                this.setState({
                    dataList: response
                }, () => {
                    if (this.state.bottomIndex !== 0) {
                        this._renderBottomFilter(this.state.bottomIndex);
                    }
                })
            } else {
                this.setState({
                    showErrorMessage: response.message || '获取火车票列表失败'
                })
                this.toastMsg(response.message || '获取火车票列表失败');
            }
        }).catch(error => {
            this.hideLoadingView();
            this.setState({
                showErrorMessage: error.message || '获取火车票列表异常'
            })
            this.toastMsg(error.message || '获取火车票列表异常');
        })
    }

    /**
     *  选择日期
     */
    _selectDate = () => {
        const { queryModel } = this.params;
        this.push('Calendar', {
            date: queryModel.departureDate,
            backDate: (date) => {
                queryModel.departureDate = date;
                this.setState({
                    dataList: [],
                }, () => {
                    this._loadList();
                })
            }
        })
    }
    /**
     *  选择前一天
     */
    _theDayBefore = () => {
        const { queryModel } = this.params;
        if (queryModel.departureDate.format('yyyy-MM-dd') === new Date().format('yyyy-MM-dd')) {
            this.toastMsg('不能再往前了');
        } else {
            queryModel.departureDate = queryModel.departureDate.addDays(-1);
            this.setState({
                dataList: [],
            }, () => {
                this._loadList();
            })
        }
    }
    /**
     *  选择后一天
     */
    _theDayAfter = () => {
        const { queryModel } = this.params;
        queryModel.departureDate = queryModel.departureDate.addDays(1);
        this.setState({
            dataList: [],
        }, () => {
            this._loadList();
        })
    }
    /**
     *  执行下一步操作
     */
    _nextStation = (item) => {
        const { fromCityName, fromCityCode, toCityName, toCityCode, departureDate } = this.params.queryModel
        item.SearchFromCity = {
            fromCityName,
            fromCityCode,
        }
        item.SearchToCity = {
            toCityName,
            toCityCode
        }
        let hasSeat = item.ticketTypes.some(ticket => ticket.seatCount > 0);
        if (hasSeat && item.can_buy_now === 'Y') {
            this.push('TrainChangeTicket', {
                ticket: item,
                reissueOrder: this.params.reissueOrder,
                departureDate: departureDate,
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

    _refreshPage = () => {
        this.setState({
            dataList: [],
            showErrorMessage: "",
            recordList: []
        }, () => {
            this._loadList();
        })
    }

    _renderHeader = () => {

        const { departureDate } = this.params.queryModel;
        return (
            <View style={styles.header}>
                <View style={[{ flex: 1 }, styles.center]}>
                    <TouchableOpacity onPress={this._theDayBefore}>
                        <CustomText style={{ color: 'white' }} text='前一天' />
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 2, flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'white', borderRadius: 2, alignItems: 'center', paddingVertical: 5 }}>
                    <View style={{ alignItems: 'center', marginLeft: 10 }}>
                        <CustomText style={{ color: Theme.theme }} text={departureDate && (departureDate.format('MM-dd') + ' ' + departureDate.getWeek())} />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                        <CustomText style={{ color: Theme.theme }} text='|' />
                        <TouchableOpacity onPress={this._selectDate}>
                            <AntDesign name={'calendar'} size={18} color={Theme.theme} style={{ marginHorizontal: 10 }} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={[{ flex: 1 }, styles.center]}>
                    <TouchableOpacity onPress={this._theDayAfter}>
                        <CustomText style={{ color: 'white' }} text='后一天' />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
    /**
     *  筛选
     */
    _renderBottomFilter = (index) => {
        const { departureDate } = this.params.queryModel;
        switch (index) {
            case 0:
                this.state.dataList.sort((a, b) => {
                    let aDep = Util.Date.toDate(`${departureDate.format('yyyy-MM-dd', true)} ${a.start_time}`);
                    let bDep = Util.Date.toDate(`${departureDate.format('yyyy-MM-dd', true)} ${b.start_time}`);
                    return aDep - bDep;
                })
                break;

            case 1:
                this.state.dataList.sort((a, b) => {
                    let aDiff = departureDate.addDays(+a.arrive_days);
                    let bDiff = departureDate.addDays(+b.arrive_days);
                    let aDep = Util.Date.toDate(`${aDiff.format('yyyy-MM-dd', true)} ${a.arrive_time}`);
                    let bDep = Util.Date.toDate(`${bDiff.format('yyyy-MM-dd', true)} ${b.arrive_time}`);
                    return aDep - bDep;
                })
                break;
            case 2:
                this.state.dataList.sort((a, b) => {
                    return parseInt(a.run_time_minute) - parseInt(b.run_time_minute);
                })
                break;
            case 3:
                this.push('TrainFilterScreen', {
                    callBack: (isFilter, filterOptions) => {
                        this.setState({
                            isFilter: isFilter,
                            filterOptions: filterOptions
                        })
                    },
                    list: this.state.dataList,
                    filterOptions: this.state.filterOptions
                });
                return;
        }

        this.setState({
            bottomIndex: index
        })
    }
    _renderBottom = () => {
        let array = ['出发', '到达', '耗时', '筛选'];
        const { bottomIndex, isFilter } = this.state;
        return (
            <View style={{ backgroundColor: "white", height: 50, flexDirection: 'row' }}>
                {
                    array.map((item, index) => {
                        return (
                            <TouchableOpacity key={index}  onPress={this._renderBottomFilter.bind(this, index)} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' ,flexDirection:'row'}}>
                                <CustomText text={item} style={{ color: bottomIndex === index || (isFilter && index === array.length - 1) ? Theme.theme : Theme.darkColor }} />
                                <Text style={{ color: bottomIndex === index || (isFilter && index === array.length - 1) ? Theme.theme : Theme.darkColor }}>{index ===3?'':'↓'}</Text>
                            </TouchableOpacity>
                        )
                    })
                }
            </View>
        )
    }
    /**
     * 行内容
     */
    _renderItem = ({ item }) => {
        return (
            <LisItemView item={item} callBack={this._nextStation} filterOptions={this.state.filterOptions} />
        )
    }
    _renderError = () => {
        const { showErrorMessage } = this.state;
        return (
            <View style={{ flex: 1 }}>
                {
                    showErrorMessage === '网络超时，请检查您的网络' || showErrorMessage === 'Network request failed' ?
                        <NetworkFaildView refresh={this._refreshPage} /> :
                        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                            <CustomText style={{ color: 'gray' }} text={showErrorMessage || '没有符合条件的车次啦~'} />
                        </View>
                }
            </View>
        )
    }
    renderBody() {
        const { dataList, showErrorMessage } = this.state;
        return (
            <View style={{ flex: 1 }}>
                {this._renderHeader()}
                {
                    dataList.length === 0 && (showErrorMessage || this.state.isFilter) ?
                        this._renderError()
                        :
                        <FlatList
                            data={dataList}
                            showsVerticalScrollIndicator={false}
                            renderItem={this._renderItem}
                            keyExtractor={(item, index) => String(index)}
                        />
                }
                {this._renderBottom()}
            </View>
        )
    }
}
const getStateProps = state => ({
    feeType: state.feeType.feeType
})
export default connect(getStateProps)(TrainChangeListScreen);

const styles = StyleSheet.create({
    header: {
        height: 50,
        backgroundColor: Theme.theme,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center'
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center'
    }
})