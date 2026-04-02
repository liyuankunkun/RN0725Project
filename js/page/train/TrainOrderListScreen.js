import React from 'react';
import {
    View,
    FlatList,
    DeviceEventEmitter
} from 'react-native';
import SuperView from '../../super/SuperView';
import SearchInput from '../../custom/SearchInput';
import ViewUtil from '../../util/ViewUtil';
import UserInfoDao from '../../service/UserInfoDao';
import TitleSwitchView from '../common/TitleSwitchView';
import OrderListItem from './OrderListItem';
import Key from '../../res/styles/Key';
// import PayOrderListItem from './PayOrderListItem';
import TrainService from '../../service/TrainService';
import CommonService from '../../service/CommonService';
import NavigationUtils from '../../navigator/NavigationUtils';
import { connect } from 'react-redux';
import StorageUtil from '../../util/StorageUtil';

class TrainOrderListScreen extends SuperView {
    constructor(props) {
        super(props);
        this.params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};
        this._navigationHeaderView = {
            // titleView: <TitleSwitchView callBack={this._switchBtnClick} leftTitle={'全部订单'} rightTitle={'待付款单'} />,
            title:'订单列表',
        }
        this._tabBarBottomView = {
            bottomInset: true,
        }
        this.state = {
            page: 1,
            isLoading: true,
            dataList: [],
            isLoadingMore: false,
            isNoMoreData: false,
            userInfo: null,
            customerInfo: null,
            keyword: "",
            titleStatus: 1,
            TrainIsOutage: false,//是否停运
            IsShowServiceFee:false,
            cityList:[]
        }
    }

    // 重置手势滑动
    static navigationOptions = ({ navigation }) => {
        return {
            gesturesEnabled: false
        }
    }

    _backBtnClick = () => {
        !this.params.backtoMy?
        (
            DeviceEventEmitter.emit('deleteApply', {}),
            NavigationUtils.popToTop(this.props.navigation)
        )
        :
        NavigationUtils.pop(this.props.navigation);
    }

    componentDidMount() {
        this.listener = DeviceEventEmitter.addListener(Key.TrainOrderListChange, (params) => {
            this.setState({
                page: 1,
                isLoadingMore: false,
                isNoMoreData: false,
                isLoading: true,
                dataList: [],
            }, () => {
                this._loadList();
            })
        })
        UserInfoDao.getUserInfo().then(userInfo => {
            UserInfoDao.getCustomerInfo().then(customerInfo => {
                this.setState({
                    userInfo,
                    customerInfo
                }, () => {
                    //服务费
                    let referencEmployeeId
                    if(this.props.comp_userInfo&&this.props.comp_userInfo.employees&&this.props.comp_userInfo.employees.length>0){
                        let num = this.props.comp_userInfo&&this.props.comp_userInfo.employees.length-1
                        referencEmployeeId = this.props.comp_userInfo.employees[num]&&this.props.comp_userInfo.employees[num].PassengerOrigin&&this.props.comp_userInfo.employees[num].PassengerOrigin.EmployeeId
                    }else{
                        referencEmployeeId = userInfo.Id
                    }
                    let model = {
                        OrderCategory: 5,
                        MatchModel: {
                            IsGrabTicket:false
                        },
                        ReferenceEmployeeId:this.props.comp_userInfo&&this.props.comp_userInfo.ReferenceEmployeeId?this.props.comp_userInfo.ReferenceEmployeeId:0,
                        ReferencePassengerId:referencEmployeeId,
                    }
                    CommonService.CurrentCustomerServiceFees(model).then(response => {
                        if (response && response.success) {
                            this.setState({
                                IsShowServiceFee: response.data.IsShowServiceFee
                            },()=>{
                                this._loadList();
                            })
                        }
                    }).catch(error => {

                    })
                  
                })
            }).catch(error => {
                this.toastMsg(error.message || '获取数据异常');
            })
        }).catch(error => {
            this.toastMsg(error.message || '获取数据异常');
        })
        
        this._getCity();
    }

    _getCity = () =>{
        StorageUtil.loadKeyId(Key.TrainCitysData).then(response => {//城市列表
            this.setState({
                cityList:response
            })
        })
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.listener && this.listener.remove();
    }

    _loadList = () => {
        const { keyword, page, userInfo, titleStatus } = this.state;
        if (!userInfo) return;
        const model = {
            Pagination: {
                PageIndex: page,
                PageSize: 20
            },
            Query: {
                KeyWord: keyword.toUpperCase(),
                EmployeeId: userInfo.Id,
                CustomerId: userInfo.Customer && userInfo.Customer.Id,
            }
        }
        if (keyword.length > 0) {
            this.showLoadingView();
        }
        let servicePromise = null;
        if (titleStatus === 1) {
            servicePromise = TrainService.orderList(model);
        } else {
            servicePromise = TrainService.TrainPaymentList(model);
        }

        servicePromise.then(response => {
            this.hideLoadingView();
            if (response) {
                this.state.dataList = this.state.dataList.concat(response.ListData);
            }
            if (response.TotalRecorder <= this.state.dataList.length) {
                this.state.isNoMoreData = true;
            }
            this.setState({
                isLoading: false,
                isLoadingMore: false
            })
        }).catch(error => {
            this.hideLoadingView();
            this._detailError();
            this.toastMsg(error.message);
        })
    }
    /**
     *  切换请求数据
     */
    _switchBtnClick = (index) => {
        if (index === this.state.titleStatus) return;
        this.setState({
            titleStatus: index,
            page: 1,
            isLoading: true,
            dataList: [],
            isNoMoreData: false,
            isLoadingMore: false
        }, () => {
            this._loadList();
        })
    }

    /**
     *  请求错误处理
     */
    _detailError = () => {
        if (this.state.isLoadingMore) {
            this.state.page--;
        }
        this.setState({
            isLoading: false,
            isNoMoreData: false
        })
    }
    /**
     *  取消订单
     */
    _paymentCancel = (item, index) => {
        this.showAlertView('确定要取消订单吗？', () => {
            return ViewUtil.getAlertButton('我再想想', () => {
                this.dismissAlertView();
            }, '确定', () => {
                this.dismissAlertView();
                this.showLoadingView();
                let model = {
                    SerialNumber: item
                }
                CommonService.PaymentCancel(model).then(response => {
                    this.hideLoadingView();
                    if (response && response.success) {
                        this.state.dataList.splice(index, 1);
                        this.setState({});
                        this.toastMsg('取消订单成功');
                    } else {
                        this.toastMsg(response.message || '取消订单失败');
                    }
                }).catch(error => {
                    this.hideLoadingView();
                    this.toastMsg(error.message || '取消订单异常');
                })
            })
        })
    }
    /**
     * 检索订单
     */
    _searchOrder = () => {
        this.setState({
            page: 1,
            dataList: [],
            isLoading: true,
            isLoadingMore: false,
            isNoMoreData: false,
            dataList: []
        }, () => {
            this._loadList();
        })
    }


    _renderItem = ({ item, index }) => {
        const { titleStatus, cityList } = this.state;
            return <OrderListItem order={item} 
                                  otwThis={this} 
                                  userInfoId={this.state.userInfo&&this.state.userInfo.Id} 
                                  IsShowServiceCharge={this.state.IsShowServiceFee} 
                                  cityList={cityList}
                                  cancelAction={(item) => this._paymentCancel(item, index)} 
                    />
    }
    renderBody() {
        const { dataList, isLoading, isLoadingMore, isNoMoreData } = this.state;
        return (
            <View style={{ flex: 1 }}>
                <SearchInput placeholder='乘客姓名/车次/订单号' value={this.state.keyword} onChangeText={text => this.setState({ keyword: text })} onSubmitEditing={this._searchOrder} />
                <FlatList
                    data={dataList}
                    renderItem={this._renderItem}
                    showsVerticalScrollIndicator={false}
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
                    onEndReachedThreshold={0.1}
                    ListFooterComponent={ViewUtil.getRenderFooter(isLoadingMore, isNoMoreData)}
                    onEndReached={() => {
                        setTimeout(() => {
                            if (this.canLoad && !isNoMoreData && !isLoadingMore && !isLoading) {
                                this.state.page++;
                                this.setState({
                                    isLoadingMore: true
                                }, () => {
                                    this._loadList();
                                    this.canLoad = false;
                                })
                            }
                        }, 100)
                    }}
                    onMomentumScrollBegin={() => {
                        this.canLoad = true
                    }}
                />
            </View>
        )
    }
}
const getStatusProps = state => ({
    comp_userInfo: state.comp_userInfo,
    compSwitch: state.compSwitch.bool,
})
export default connect(getStatusProps)(TrainOrderListScreen);
