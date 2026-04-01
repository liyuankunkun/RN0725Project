import React from 'react';
import {
    View,
    FlatList,
    DeviceEventEmitter,
    StyleSheet
} from 'react-native';
import SuperView from '../../super/SuperView';
import TitleSwitchView from '../common/TitleSwitchView';
import SearchInput from '../../custom/SearchInput';
import ViewUtil from '../../util/ViewUtil';
import FlightService from '../../service/FlightService';
import UserInfoDao from '../../service/UserInfoDao';
import FlightApprovalItem from './FlightApprovalItem';
import CustomText from '../../custom/CustomText';
import CustomeTextInput from '../../custom/CustomTextInput';
import Theme from '../../res/styles/Theme';
import Key from '../../res/styles/Key';
import TrainService from '../../service/TrainService';
import TrainApprovalItem from './TrainApprovalItem';
import TrainEnum from '../../enum/TrainEnum';
import InflFlightService from '../../service/InflFlightService';
import IntlFlightEnum from '../../enum/IntlFlightEnum';
import IntlFlightApprovalItem from './IntlFlightApprovalItem';
import CompApprovalItem from './CompApprovalItem';//综合订单审批列表
import HotelService from '../../service/HotelService';
import HotelApprovalItem from './HotelApprovalItem';
import ApplicationApprovalItem from './ApplicationApprovalItem';
import ApplicationService from '../../service/ApplicationService';
import ReimbursementService from '../../service/ReimbursementService';
import ComprehensiveService from '../../service/ComprehensiveService';
import ReimbusementItem from './ReimbusementItem';
import HighLight from '../../custom/HighLight';
import CommonService from '../../service/CommonService';

export default class ApprovalListScreen extends SuperView {

    constructor(props) {
        super(props);
        // this.params = (props.route ? props.route.params : {});
        this.params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};
        this._navigationHeaderView = {
            // titleView: <TitleSwitchView leftTitle='待我审批' rightTitle='审批完成' callBack={this._switchBtnCLick} />
            title: '审批列表',
        }
        this._tabBarBottomView = {
            bottomInset: true
        }
        this.state = {
            dataList: [],
            isLoading: true,
            isNoMoreData: false,
            isLoadingMore: false,
            page: 1,
            keyword: '',
            status: 1,
            customerInfo: null,
            comment: '',
            ServiceFeesShow:false
        }
    }
    componentDidMount() {
        this.addListener = DeviceEventEmitter.addListener(Key.ApprovalChange, (order) => {
            let index = this.state.dataList.findIndex(item => item.Id === order.Id);
            if (index > -1) {
                this.state.dataList.splice(index, 1);
                this.setState({});
            }
        });
        UserInfoDao.getCustomerInfo().then(customerInfo => {
            this.setState({
                customerInfo
            }, () => {
                this._loadList();
            })

        }).catch(error => {
            this._loadList();
        })

    }
    componentWillUnmount() {
        super.componentWillUnmount();
        DeviceEventEmitter.emit('BackApprovalRefresh', {});
        this.addListener && this.addListener.remove();
    }
    /**
     *  加载数据
     */
    _loadList = () => {
        const { type } = this.params;
        let model = this._getQueryModel();
        let model2 = this._getQueryModel2();
        if (type === 'flight') {
            this._flightApprovalList(model);
        } else if (type === 'train') {
            this._trainApprovalList(model);
        } else if (type === 'intlFlight') {
            this._intlFlightApprovalList(model);
        } else if (type === 'hotel') {
            this._hotelApprovalList(model,4);
        } else if (type === 'intlHotel') {
            this._hotelApprovalList(model2,6);
        } else if (type === 'apply') {
            this._applicationApprovalList(model);
        } else if(type === 'reimbuse'){
            this._reimuseApprovalList(model);
        } else if(type === 'comprehensive'){
            this._compApprovalList();
        }
    }

    /**
     *  获取查询model
     */
    _getQueryModel = () => {
        const { type } = this.params;
        const { page, keyword, status } = this.state;
        let queryModel = {
            Pagination: {
                PageSize: 10,
                PageIndex: page,
            },
            Query: {
                Keyword: keyword,
                Status: status,
                Domestic:true
            }
        }
        return queryModel;
    }
    _getQueryModel2 = () => {//添加国际酒店的
        const { type } = this.params;
        const { page, keyword, status } = this.state;
        let queryModel = {
            Pagination: {
                PageSize: 10,
                PageIndex: page
            },
            Query: {
                Keyword: keyword,
                Status: status,
                Domestic:false
            }
        }
        return queryModel;
    }

    async _getShowServiceFees(OrderCategory){
            //服务费
            let MatchModel = null
            if(OrderCategory===7){
                MatchModel = {"NationalCodes":"[]"}
            }
            let model={
                OrderCategory:OrderCategory,
                MatchModel:MatchModel,
            }
           await CommonService.CurrentCustomerServiceFees(model).then(response => {
                if (response && response.success&&response.data) {
                    this.setState({
                        ServiceFeesShow:response.data.IsShowServiceFee,
                    })
                }
            }).catch(error => {
                console.log('error---',error);
            })
    }

    /**
     *  国内机票审批列表
     */
    _flightApprovalList = (model) => {
        FlightService.approvalList(model).then(response => {
            if (response) {
                this.state.dataList = this.state.dataList.concat(response.ListData);
                if (response.TotalRecorder <= this.state.dataList.length) {
                    this.state.isNoMoreData = true;
                }
                this.setState({
                    isLoading: false,
                    isLoadingMore: false
                },()=>{
                    this._getShowServiceFees(1);
                })
            } else {
                this._detailError();
                this.toastMsg('获取审批列表失败');
            }
        }).catch(error => {
            this._detailError();
            this.toastMsg(error.message || '获取数据异常');
        })

    }
    /**
     *  火车票审批列表
     */
    _trainApprovalList = (model) => {

        TrainService.approvalList(model).then(response => {
            if (response) {
                this.state.dataList = this.state.dataList.concat(response.ListData);
                if (response.TotalRecorder <= this.state.dataList.length) {
                    this.state.isNoMoreData = true;
                }
                this.setState({
                    isLoading: false,
                    isLoadingMore: false
                },()=>{
                    this._getShowServiceFees(5);
                })
            } else {
                this._detailError();
                this.toastMsg('获取审批列表失败');
            }
        }).catch(error => {
            this._detailError();
            this.toastMsg(error.message || '获取数据异常');
        })
    }
    /**
   *  国际机票审批列表
   */
    _intlFlightApprovalList = (model) => {
        InflFlightService.approvalList(model).then(response => {
            if (response) {
                this.state.dataList = this.state.dataList.concat(response.ListData);
                if (response.TotalRecorder <= this.state.dataList.length) {
                    this.state.isNoMoreData = true;
                }
                this.setState({
                    isLoading: false,
                    isLoadingMore: false
                },()=>{
                    this._getShowServiceFees(7);
                })
            } else {
                this._detailError();
                this.toastMsg('获取审批列表失败');
            }
        }).catch(error => {
            this._detailError();
            this.toastMsg(error.message || '获取数据异常');
        })
    }

    /**
     *  国内酒店审批列表
     */
    _hotelApprovalList = (model,OrderCategory) => {
        HotelService.OrderApproveList(model).then(response => {
            if (response && response.success) {
                if (response.data && response.data.DataSource) {
                    this.state.dataList = this.state.dataList.concat(response.data.DataSource.ListData);
                    if (response.data.DataSource.TotalRecorder <= this.state.dataList.length) {
                        this.state.isNoMoreData = true;
                    }
                }
                this.setState({
                    isLoading: false,
                    isLoadingMore: false
                },()=>{
                    this._getShowServiceFees(OrderCategory);
                })
            } else {
                this._detailError();
                this.toastMsg('获取审批列表失败');
            }
        }).catch(error => {
            this._detailError();
            this.toastMsg(error.message || '获取数据异常');
        })

    }

    _applicationApprovalList = (model) => {
        ApplicationService.TravelApplyApprovalList(model).then(response => {
            if (response && response.success) {
                if (response.data && response.data.ListData) {
                    this.state.dataList = this.state.dataList.concat(response.data.ListData);
                    if (response.data.TotalRecorder <= this.state.dataList.length) {
                        this.state.isNoMoreData = true;
                    }
                }
                this.setState({
                    isLoading: false,
                    isLoadingMore: false
                })
            } else {
                this._detailError();
                this.toastMsg('获取审批列表失败');
            }
        }).catch(error => {
            this._detailError();
            this.toastMsg(error.message || '获取数据异常');
        })
    }
    // 报销单列表
    _reimuseApprovalList = (model)=>{
        ReimbursementService.ReimbursementApprovalList(model).then(response => {
            if (response && response.success) {
                if (response.data && response.data.ListData) {
                    this.state.dataList = this.state.dataList.concat(response.data.ListData);
                    if (response.data.TotalRecorder <= this.state.dataList.length) {
                        this.state.isNoMoreData = true;
                    }
                }
                this.setState({
                    isLoading: false,
                    isLoadingMore: false
                },()=>{
                    this._getShowServiceFees();
                })
            } else {
                this._detailError();
                this.toastMsg('获取审批列表失败');
            }
        }).catch(error => {
            this._detailError();
            this.toastMsg(error.message || '获取数据异常');
        })
    }
    /**
     *  综合订单列表
     */
     _compApprovalList = () => {
        const { page, keyword, status } = this.state;
        let model = {
            Query:{
                QueryLabel:'PendingApproval',//"Planing:查询计划中的综合订单，PendingApproval：查询待审批的综合订单，为空则是查询所有的"
                ApprovalStatus:status,//int? 类型，需要指定审批状态时传值【0：全部，1：未审批，2：已审批，3：审批同意，4：审批驳回】
                OrderStatus:null,//int? 类型，需要指定订单状态时传值
                Keyword: keyword,
            },
            Pagination:{
                PageIndex:1,
                PageSize:15
            }
        }
        this.showLoadingView();
        ComprehensiveService.MassOrderList(model).then(response => {
            this.hideLoadingView();
            if (response && response.success) {
                if (response.data && response.data.ListData) {
                    this.state.dataList = this.state.dataList.concat(response.data.ListData);
                    if (response.data.TotalRecorder <= this.state.dataList.length) {
                        this.state.isNoMoreData = true;
                    }
                }
                this.setState({
                    isLoading: false,
                    isLoadingMore: false
                })
            } else {
                this._detailError();
                this.toastMsg('获取审批列表失败');
            }
        }).catch(error => {
            this.hideLoadingView();
            this.toastMsg(error.message || '获取数据异常');
        })
    }

    _detailError = () => {
        if (this.state.isLoadingMore) {
            this.state.page--;
        }
        this.setState({
            isLoading: false,
            isLoadingMore: false
        })
    }


    /**
     *  切换按钮
     */
    _switchBtnCLick = (index) => {
        if (this.state.status === index) return;
        this.setState({
            page: 1,
            isLoading: true,
            isLoadingMore: false,
            isNoMoreData: false,
            dataList: [],
            status: index
        }, () => {
            this._loadList();
        })
    }
    /**
     *  同意的提示
     */
    _agreeConfim = (order) => {
        this.showAlertView(() => {
            return (<View style={{ padding: 5, justifyContent: 'center', alignItems: 'center' }}>
                <CustomText text='请输入同意原因' />
                <CustomeTextInput onChangeText={text => this.setState({ comment: text })} multiline={true} style={{ height: 60, width: 250, marginTop: 10, borderWidth: 1, borderColor: Theme.lineColor }} />
            </View>)
        }, () => {
            return ViewUtil.getAlertButton('我再想想', () => {
                this.dismissAlertView();
            }, '确定同意', () => {
                this.dismissAlertView();
                this._approve(order)
            })
        })
    }
    /**
     *  拒绝的提示
     */
    _rejectConfim = (order) => {
        this.showAlertView(() => {
            return (<View style={{ padding: 5, justifyContent: 'center', alignItems: 'center' }}>
                <HighLight name={'请输入驳回原因'} />
                <CustomeTextInput onChangeText={text => this.setState({ comment: text })} multiline={true} style={{ height: 60, width: 250, marginTop: 10, borderWidth: 1, borderColor: Theme.lineColor }} />
            </View>)
        }, () => {
            return ViewUtil.getAlertButton('我再想想', () => {
                this.dismissAlertView();
            }, '确定驳回', () => {
                this.dismissAlertView();
                this._reject(order);
            })
        })
    }

    _approve = (order) => {
        const { type } = this.params;
        const { comment } = this.state
        let model = (type === 'apply' || type === 'reimbuse') ? { Status: 1, BusinessId: order.Id,Comment:comment } : { OrderId: order.Id, Status: 1,Comment:comment };
        let model2 = (type === 'apply' || type === 'reimbuse') ? { Status: 1, BusinessId: order.Id ,Domestic: false,Comment:comment} : { OrderId: order.Id, Status: 1,Domestic: false,Comment:comment };
        let compModel = {
                OrderId:order.Id,//综合订单id
                Status: 1,
                Comment:comment
        }
        let promise = null;
        if (type === 'flight') {
            promise = FlightService.approve(model);
        } else if (type === 'train') {
            promise = TrainService.approve(model);
        } else if (type === 'intlFlight') {
            model.OrderId = order.OrderId;
            promise = InflFlightService.approve(model);
        } else if (type === 'hotel') {
            promise = HotelService.Approvel(model);
        } else if (type === 'intlHotel') {
            promise = HotelService.Approvel(model2);
        } 
        else if (type === 'apply') {
            promise = ApplicationService.TravelApplyApprove(model);
        } else if(type === 'reimbuse'){
            promise = ReimbursementService.ReimbursementApprove(model);
        } else if(type ==='comprehensive'){
            promise =  ComprehensiveService.MassOrderApprove2(compModel);
        }
        
        this.showLoadingView();
        promise.then(response => {
            this.hideLoadingView();
            if (response && response.success) {
                this.showAlertView('审批成功', () => {
                    return ViewUtil.getAlertButton('确定', () => {
                        this.dismissAlertView();
                        DeviceEventEmitter.emit('BackApprovalRefresh', {});
                        let index = this.state.dataList.findIndex(item => item.Id === order.Id);
                        if (index > -1) {
                            this.state.dataList.splice(index, 1);
                            this.setState({});
                        }
                        this._loadList();
                    })
                })
            } else {
                this.toastMsg(response.message || '审批失败,请联系客服');
            }
        }).catch(error => {
            this.hideLoadingView();
            this.toastMsg(error.message || '获取数据异常');
        })

    }

    _reject = (order) => {
        const { comment } = this.state;
        const { type } = this.params;
        if (!comment) {
            this.toastMsg('驳回原因不能为空');
            return;
        }
        let model = (type === 'apply' || type === 'reimbuse') ? {
            BusinessId: order.Id,
            Comment: comment,
            Status: 2
        } : {
                OrderId: order.Id,
                Comment: comment,
                Status: 2
        };
        let model2 = (type === 'apply' || type === 'reimbuse') ? {
            BusinessId: order.Id,
            Comment: comment,
            Status: 2,
            Domestic:false
        } : {
                OrderId: order.Id,
                Comment: comment,
                Status: 2,
                Domestic:false
        };    
        let compModel = {
            OrderId: order.Id,
            Comment: comment,
            Status: 2
        }
        let promise = null;
        if (type === 'flight') {
            promise = FlightService.approve(model);
        } else if (type === 'train') {
            promise = TrainService.reject(model);
        } else if (type === 'intlFlight') {
            model.OrderId = order.OrderId;
            promise = InflFlightService.approve(model);
        } else if (type === 'hotel') {
            promise = HotelService.Approvel(model);
        } else if (type === 'intlHotel') {
            promise = HotelService.Approvel(model2);
        } 
        else if (type === 'apply') {
            promise = ApplicationService.TravelApplyApprove(model);
        } else if(type === 'reimbuse'){
            promise = ReimbursementService.ReimbursementApprove(model);
        } else if(type ==='comprehensive'){
            promise =  ComprehensiveService.MassOrderApprove2(compModel);
        }
    
        this.showLoadingView();
        promise.then(response => {
            this.hideLoadingView();
            if (response && response.success) {
                this.showAlertView('驳回成功', () => {
                    return ViewUtil.getAlertButton('确定', () => {
                        this.dismissAlertView();
                        let index = this.state.dataList.findIndex(item => item.Id === order.Id);
                        if (index > -1) {
                            this.state.dataList.splice(index, 1);
                            this.setState({});
                        }
                    })
                })
            } else {
                this.toastMsg(response.message || '驳回失败,请联系客服');
            }
        }).catch(error => {
            this.hideLoadingView();
            this.toastMsg(error.message || '获取数据异常');
        })
    }

    _renderItem = ({ item, index }) => {
        const { type } = this.params;
        const { ServiceFeesShow } = this.state
        if (!item) return;
        switch (type) {
            case 'flight':
                // if (this.state.status === 2 && item.Status === 1) return;
                return <FlightApprovalItem navigation={this.props.navigation} order={item} agree={this._agreeConfim.bind(this, item)} reject={this._rejectConfim.bind(this, item)} customerInfo={this.state.customerInfo || {}}  ServiceFeesShow={ServiceFeesShow}/>;
            case 'train':
                // if (this.state.status === 2 && item.Status === TrainEnum.OrderStatus.CheckPending) return;
                return <TrainApprovalItem navigation={this.props.navigation} order={item} agree={this._agreeConfim.bind(this, item)} reject={this._rejectConfim.bind(this, item)} customerInfo={this.state.customerInfo || {}} ServiceFeesShow={ServiceFeesShow}/>;
            case 'intlFlight':
                // if (this.state.status === 2 && item.Status === IntlFlightEnum.orderStatus.CheckPending) return;
                return <IntlFlightApprovalItem navigation={this.props.navigation} order={item} onApprove={this._agreeConfim.bind(this, item)} onReject={this._rejectConfim.bind(this, item)} customerInfo={this.state.customerInfo || {}} ServiceFeesShow={ServiceFeesShow}/>
            case 'hotel':
                // if (this.state.status === 2 && item.Status === 17) return;
                return <HotelApprovalItem navigation={this.props.navigation} data={item} onApprove={this._agreeConfim.bind(this, item)} onReject={this._rejectConfim.bind(this, item)} from={'hotel'} ServiceFeesShow={ServiceFeesShow}/>
            case 'intlHotel':
                // if (this.state.status === 2 && item.Status === 17) return;
                return <HotelApprovalItem navigation={this.props.navigation} data={item} onApprove={this._agreeConfim.bind(this, item)} onReject={this._rejectConfim.bind(this, item)} ServiceFeesShow={ServiceFeesShow}/>
            case 'apply':
                // if (this.state.status === 2 && item.Status === 6) return;
                return <ApplicationApprovalItem navigation={this.props.navigation} order={item} approve={this._agreeConfim.bind(this, item)} reject={this._rejectConfim.bind(this, item)} />
            case 'reimbuse':
                // if (this.state.status === 2 && item.Status === 6) return;
                return <ReimbusementItem navigation={this.props.navigation} order={item} approve={this._agreeConfim.bind(this, item)} reject={this._rejectConfim.bind(this, item)} />
            case 'comprehensive':
                // if (this.state.status === 2 && item.Status === 6) return;
                return <CompApprovalItem navigation={this.props.navigation} item={item} status={this.state.status} approve={this._agreeConfim.bind(this, item)} reject={this._rejectConfim.bind(this, item)} ServiceFeesShow={ServiceFeesShow}/>
        }
    }
    _searchOrder = () => {
        this.setState({
            page: 1,
            isLoading: true,
            isLoadingMore: false,
            isNoMoreData: false,
            dataList: []
        }, () => {
            this._loadList();
        })
    }
    renderBody() {
        const { dataList, isLoading, isLoadingMore, isNoMoreData, keyword } = this.state;
        return (
            <View style={{ flex: 1 }}>
                <TitleSwitchView leftTitle='待我审批' rightTitle='审批完成' callBack={this._switchBtnCLick} />
                <SearchInput placeholder='乘客姓名/订单号' onSubmitEditing={this._searchOrder} value={keyword} onChangeText={text => this.setState({ keyword: text })} />
                <FlatList
                    data={dataList}
                    refreshControl={ViewUtil.getRefreshControl(isLoading, () => {
                        this.setState({
                            page: 1,
                            isLoading: true,
                            isNoMoreData: false,
                            isLoadingMore: false,
                            dataList: []
                        }, () => {
                            this._loadList();
                        })
                    })}
                    keyExtractor={(item, index) => String(index)}
                    renderItem={this._renderItem}
                    ListFooterComponent={ViewUtil.getRenderFooter(isLoadingMore, isNoMoreData)}
                    onEndReached={() => {
                        setTimeout(() => {
                            // if (!isNoMoreData && !isLoading && !isLoadingMore) {
                            if (this.canLoad && !isNoMoreData && !isLoading && !isLoadingMore) {
                                this.state.page++;
                                this.setState({
                                    isLoadingMore: true
                                }, () => {
                                    this._loadList();
                                    this.canLoad = false;
                                })
                            }
                        }, 100);
                    }}
                    onEndReachedThreshold={0.1}
                    onMomentumScrollBegin={() => {
                        this.canLoad = true;
                    }}
                />
            </View>
        )
    }
}
