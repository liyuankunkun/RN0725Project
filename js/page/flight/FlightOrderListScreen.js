import React from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    DeviceEventEmitter
} from 'react-native';
import SuperView from '../../super/SuperView';
import SearchInput from '../../custom/SearchInput';
import ViewUtil from '../../util/ViewUtil';
import UserInfoDao from '../../service/UserInfoDao';
import FlightEnum from '../../enum/FlightEnum';
import FlightService from '../../service/FlightService';
import TitleSwitchView from '../common/TitleSwitchView';
import OrderListItem from './OrderListItem';
import Key from '../../res/styles/Key';
import PayOrderListItem from './PayOrderListItem';
import CommonService from '../../service/CommonService';
import NavigationUtils from '../../navigator/NavigationUtils';
import BackPress from '../../common/BackPress';
import { connect } from 'react-redux';
const MemoizedOrderListItem = React.memo(OrderListItem);
const MemoizedPayOrderListItem = React.memo(PayOrderListItem);
class FlightOrderListScreen extends SuperView {
    constructor(props) {
        super(props);
        this._paymentCancel = this._paymentCancel.bind(this);
        this.params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};
        this._navigationHeaderView = {
            title:'订单列表'
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
            titleStatus: 1
        }
        this.backPress = new BackPress({ backPress: () => this._backBtnClick() })
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
        return true;
    }

    componentDidMount() {
        this.backPress.componentDidMount();
        this.addPageFouces = this.props.navigation.addListener('willFocus', () => {
            if (this.state.titleStatus === 2) {
                this.setState({
                    page: 1,
                    isLoadingMore: false,
                    isNoMoreData: false,
                    isLoading: true,
                    dataList: []
                }, () => {
                    this._loadList();
                })
            }
        });

        this.listener = DeviceEventEmitter.addListener(Key.FlightOrderListChange, (params) => {
            this.setState({
                page: 1,
                isLoadingMore: false,
                isNoMoreData: false,
                isLoading: true,
                dataList: []
            }, () => {
                this._loadList();
            })
        })
        UserInfoDao.getUserInfo().then(userInfo => {
            UserInfoDao.getCustomerInfo(this.props.comp_userInfo&&this.props.comp_userInfo.IdModel).then(customerInfo => {
                this.setState({
                    userInfo,
                    customerInfo
                }, () => {
                    //服务费
                    let model = {
                        OrderCategory: 1,
                        MatchModel: null,
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
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.listener && this.listener.remove();
        // this.addPageFouces && this.addPageFouces.remove();
        this.backPress.componentWillUnmount();
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
                StatusLabel: FlightEnum.OrderStatusLabel.All,
                KeyWord: keyword,
                EmployeeId: userInfo.Id,
                CustomerId: userInfo.Customer && userInfo.Customer.Id,
            }
        }
        if (keyword.length > 0) {
            this.showLoadingView();
        }
        let servicePromise = null;
        if (titleStatus === 1) {
            servicePromise = FlightService.orderList(model);
        } else {
            servicePromise = FlightService.PaymnetBatchList(model);
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
        });
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
                    SerialNumber: item.SerialNumber
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
        const { titleStatus,userInfo,IsShowServiceFee } = this.state;
        // if (titleStatus === 1 && !item.Summary) {
            return (
              <MemoizedOrderListItem
                order={item}
                otwThis={this}
                userInfoId={userInfo && userInfo.Id}
                showServiceCharge={IsShowServiceFee}
              />
            );
        //   } 
        //   else if (titleStatus === 2 && item.Summary) {
        //     return (
        //       <MemoizedPayOrderListItem
        //         order={item}
        //         cancelAction={() => this._paymentCancel(item, index)}
        //       />
        //     );
        //   }
        //   return null; // 返回 null 如果不满足任何条件
    }
    renderBody() {
        const { dataList, isLoading, isLoadingMore, isNoMoreData, keyword } = this.state;
        return (
            <View style={{ flex: 1 }}>
                {/* <TitleSwitchView callBack={this._switchBtnClick} leftTitle={'全部订单'} rightTitle={'待付款单'} /> */}
                <SearchInput placeholder='乘客姓名/航班号/订单号' onSubmitEditing={this._searchOrder} value={keyword} onChangeText={text => this.setState({ keyword: text })} />
                <FlatList
                    data={dataList}
                    renderItem={this._renderItem}
                    showsVerticalScrollIndicator={false}
                    refreshControl={ViewUtil.getRefreshControl(isLoading, this._handleRefresh)}
                    keyExtractor={(item, index) => `${item.id || item.key || index}`}
                    onEndReachedThreshold={0.2}
                    ListFooterComponent={ViewUtil.getRenderFooter(isLoadingMore, isNoMoreData)}
                    onEndReached={this._handleLoadMore}
                    onMomentumScrollBegin={() => {
                        this.canLoad = true
                    }}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    updateCellsBatchingPeriod={50}
                    windowSize={21}
                />
            </View>
        )
    }
    _handleRefresh = () => {
        this.setState({
            page: 1,
            isLoading: true,
            isNoMoreData: false,
            isLoadingMore: false,
            dataList: []
        }, this._loadList);
    }
    
    _handleLoadMore = () => {
        if (this.canLoad && !this.state.isNoMoreData && !this.state.isLoadingMore && !this.state.isLoading) {
            this.setState(prevState => ({
                page: prevState.page + 1,
                isLoadingMore: true
            }), () => {
                this._loadList();
                this.canLoad = false;
            });
        }
    }
}
const getStatePorps = state => ({
    comp_userInfo: state.comp_userInfo,
    compSwitch: state.compSwitch.bool,
})
export default connect(getStatePorps)(FlightOrderListScreen);
