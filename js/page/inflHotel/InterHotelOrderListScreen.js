import React from 'react';
import {
    View,
    FlatList,
    Platform,
    DeviceEventEmitter
} from 'react-native';
import SuperView from '../../super/SuperView';
import SearchInput from '../../custom/SearchInput';
import ViewUtil from '../../util/ViewUtil';
import UserInfoDao from '../../service/UserInfoDao';
import InterOrderListItem from './InterOrderListItem';
import HotelService from '../../service/HotelService';
import NavigationUtils from '../../navigator/NavigationUtils';
import CustomText from '../../custom/CustomText';
import CustomeTextInput from '../../custom/CustomTextInput';
import Theme from '../../res/styles/Theme';
import BackPress from '../../common/BackPress';
import CustomActionSheet from '../../custom/CustomActionSheet';
import Key from '../../res/styles/Key';

export default class InterHotelOrderListScreen extends SuperView {
    constructor(props) {
        super(props);
        this.params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};
        this._navigationHeaderView = {
            title: '订单列表'

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
            comment: '',
            isStop:this.params.isStop,
            order:null,
            options: ['行程改变', '无法满足需求', '酒店价格太贵', '其他途径预订', '其它'],
        }
        this.backPress = new BackPress({ backPress: () => this._stopBackEvent() })
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

    _stopBackEvent = () => {
        if (!this.state.isStop) {
            this.pop();
        }else{
            DeviceEventEmitter.emit('deleteApply', {})
            NavigationUtils.popToTop(this.props.navigation);
        }
        return true;
    }

    componentDidMount() {
        this.backPress.componentDidMount();
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

        this.backFromShopListener = DeviceEventEmitter.addListener(
            'InterHotelOrderListScreenLoad',  //监听器名
            () => {
              this._loadList();
            },
        );
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.backPress.componentWillUnmount();
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
                KeyWord: keyword,
                EmployeeId: userInfo.Id,
                Domestic:false
            },
        }
        if (keyword.length > 0) {
            this.showLoadingView();
        }

        HotelService.orderList(model).then(response => {
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
                this.toastMsg(response.message || '获取订单列表失败');
                this._detailError();
            }

        }).catch(error => {
            this.hideLoadingView();
            this._detailError();
            this.toastMsg(error.message);
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
    /**
     *   付款
     */
    _pay = (obj) => {
        if(obj.Status==1){
            this.push('HotelGuarantee', { OrderId: obj.Id ,isIntl:true});
        }else{
            this.showLoadingView();
            HotelService.HotelOrderPayment({ OrderId: obj.Id }).then(response => {
                this.hideLoadingView();
                if (response && response.success) {
                    this.push('HotelPayment', { SerialNumber: response.data.SerialNumber,Id:obj.Id,from:'inthotel' });
                } else {
                    this.toastMsg(response.message || '获取支付信息失败');
                }
            }).catch(error => {
                this.hideLoadingView();
                this.toastMsg(error.message || '获取数据异常');
            })
        }
        
    }
    /**
     * 取消待支付单
     */
    _cancel = (obj) => {
    
        this.showAlertView(() => {
            return (<View style={{ padding: 5, justifyContent: 'center', alignItems: 'center' }}>
                <CustomText text='请输入取消原因' />
                <CustomTextInput onChangeText={text => this.setState({ comment: text })} multiline={true} style={{ height: 60, width: 250, marginTop: 10, borderWidth: 1, borderColor: Theme.lineColor }} />
            </View>)
        }, () => {
            return ViewUtil.getAlertButton('我再想想', () => {
                this.dismissAlertView();
            }, '确定取消', () => {
                this.dismissAlertView();
                let model = {
                    OrderId: obj.Id,
                    CancelCode: '其它',
                    Reason: this.state.comment,
                    Platform: Platform.OS
                }
                this.showLoadingView();
                HotelService.HotelOrderCancel(model).then(response => {
                    this.hideLoadingView();
                    if (response && response.success) {
                        this._searchOrder();
                    } else {
                        this.toastMsg(response.message || "取消订单失败");
                    }
                }).catch(error => {
                    this.hideLoadingView();
                    this.toastMsg(error.message || "取消订单异常");
                })
            })
        })

    }


    _renderItem = ({ item, index }) => {
        const {userInfo} = this.state;
        return <InterOrderListItem data={item} 
                                   pay={this._pay.bind(this, item)} 
                                   cancel={this._cancel.bind(this, item)}
                                   remindBtn = {this._remindBtn.bind(this, item)}
                                   refundBtn = {this._refundBtn.bind(this, item)} 
                                   userId={userInfo.Id}
                                   creditCVVBtn = {this._creditCVVBtn.bind(this, item)} 
                />
    }

    _creditCVVBtn = (item) => {
        this.push('CvvScreen', { OrderId: item.Id, from:'isIntl' });
    }

    _refundBtn = (item) => {
        let massage = "取消酒店订单将扣除全部或部分房费，最终以与酒店确认的金额为准。请留意关注您所预定酒店的取消条款。";
        this.setState({ order: item }, () => {
            this.showAlertView(massage, () => {
                return ViewUtil.getAlertButton('取消', () => {
                    this.dismissAlertView();
                }, '确定', () => {
                    this.dismissAlertView();
                    setTimeout(() => {
                        this.actionSheet && this.actionSheet.show && this.actionSheet.show();
                    }, 250);
                })
            })
        });
    }
    
        _handlePress = (index) => {
            let reason = this.state.options[index];
            if (reason === '其它') {
                this.showAlertView(() => {
                    return (<View style={{ padding: 5, justifyContent: 'center', alignItems: 'center' }}>
                        <CustomText text='请输入取消原因' />
                        <CustomeTextInput value={this.state.comment} onChangeText={text => this.setState({ comment: text })} multiline={true} style={{ height: 60, width: 250, marginTop: 10, borderWidth: 1, borderColor: Theme.lineColor }} />
                    </View>)
                }, () => {
                    return ViewUtil.getAlertButton('我再想想', () => {
                        this.dismissAlertView();
                    }, '确定取消', () => {
                        this.dismissAlertView();
                        this._submitCancel(reason);
                    })
                })
            } else {
                this._submitCancel(reason);
            }
        }
    
        _submitCancel = (reason) => {
            const { comment, order } = this.state;
            if (reason === '其它' && !comment) {
                this.toastMsg('请输入退订原因');
                return;
            }
            var model = {
                OrderId: order.Id,
                CancelCode: reason,
                Reason: comment,
                Platform: Platform.OS
            }
            let promise = HotelService.HotelOrderRefund2(model);
            this.showLoadingView();
            promise.then(response => {
                this.hideLoadingView();
                if (response && response.success) {
                    if(order.Status === 4){
                        if(response.code==201){
                            CommonService.PaymentInfo({ SerialNumber: response.data.SerialNumber,Id:this.params.OrderId }).then(response => {
                                this.hideLoadingView();
                                if (response && response.success) {
                                    this.setState({
                                        refundOrder: response.data,
                                    },()=>{
                                        this.payTypeView.show();
                                    })
                                } else {
                                    this.toastMsg(response.message || '获取支付信息失败');
                                }
                            }).catch(error => {
                                this.hideLoadingView();
                                this.toastMsg(error.message || '获取数据异常');
                            }) 
                        }else{
                            this.showAlertView(response.message||'已提交退订', () => {
                                return ViewUtil.getAlertButton('确定', () => {
                                    this.dismissAlertView();
                                    NavigationUtils.popToTop(this.props.navigation);
                                    DeviceEventEmitter.emit(Key.HotelOrderListChange, order);
                                })
                            })
                        }
                    }else{
                        this.showAlertView(response.message||'订单取消成功', () => {
                            return ViewUtil.getAlertButton('确定', () => {
                                this.dismissAlertView();
                                NavigationUtils.popToTop(this.props.navigation);
                                DeviceEventEmitter.emit(Key.HotelOrderListChange, order);
                            })
                        })
                    }
    
                } else {
                    this.toastMsg(response.message || '操作失败');
                }
            }).catch(error => {
                this.hideLoadingView();
                this.toastMsg(error.message || '操作失败');
            })
        }

    

     /**
     *  催审
     */
    _remindBtn = (item) => {
        let model = {
            OrderId: item.Id
        }
        this.showLoadingView();
        HotelService.orderRemind(model).then(response => {
            this.hideLoadingView();
            if (response && response.success) {
                this.toastMsg('催审订单成功');
            } else {
                this.toastMsg(response.message || '催审订单失败');
            }
        }).catch(error => {
            this.hideLoadingView();
            this.toastMsg(error.message || '催审订单异常');
        })
    }

    renderBody() {
        const { dataList, isLoading, isLoadingMore, isNoMoreData, keyword, options } = this.state;
        return (
            <View style={{ flex: 1 }}>
                <SearchInput placeholder='入住人姓名/酒店名称/订单号' onSubmitEditing={this._searchOrder} value={keyword} onChangeText={text => this.setState({ keyword: text })} />
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
                <CustomActionSheet ref={o => this.actionSheet = o} options={options} onPress={this._handlePress} />
            </View>
        )
    }
}
