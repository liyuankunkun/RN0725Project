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
import FlightService from '../../service/FlightService';
import OrderListItem from '../flight/OrderListItem';
import Key from '../../res/styles/Key';
import CommonService from '../../service/CommonService';
import FlightEnum from '../../enum/FlightEnum';
export default class UnUserOrderScreen extends SuperView {
    constructor(props) {
        super(props);

        this._navigationHeaderView = {
            title: '未使用机票'

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
    }

    // 重置手势滑动
    static navigationOptions = ({ navigation }) => {
        return {
            gesturesEnabled: false
        }
    }

    componentDidMount() {
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
            UserInfoDao.getCustomerInfo().then(customerInfo => {
                this.setState({
                    userInfo,
                    customerInfo
                }, () => {
                    this._loadList();
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
    }

    _loadList = () => {
        const { keyword, page, userInfo, titleStatus } = this.state;
        if (!userInfo) return;
        const model = {
            Query: {
                KeyWord: keyword,
            },
            Pagination: {
                PageIndex: page,
                PageSize: 10
            },
        }
        FlightService.FlightTicketUnUsedList(model).then(response => {
            if (response && response.success && response.data) {
                this.state.dataList = this.state.dataList.concat(response.data.ListData);
            }
            if (response.data.TotalRecorder <= this.state.dataList.length) {
                this.state.isNoMoreData = true;
            }
            this.setState({
                isLoading: false,
                isLoadingMore: false
            })
        }).catch(error => {
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
        return <OrderListItem order={item} otwThis={this} showServiceCharge={true} />
    }
    renderBody() {
        const { dataList, isLoading, isLoadingMore, isNoMoreData, keyword } = this.state;
        return (
            <View style={{ flex: 1 }}>
                <SearchInput placeholder='乘客姓名/航班号' onSubmitEditing={this._searchOrder} value={keyword} onChangeText={text => this.setState({ keyword: text })} />
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
