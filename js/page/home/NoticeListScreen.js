import React from 'react';
import {
    View,
    FlatList
} from 'react-native';
import SuperView from '../../super/SuperView';
import ViewUtil from '../../util/ViewUtil';
import CommonService from '../../service/CommonService';
import CustomText from '../../custom/CustomText';
import Theme from '../../res/styles/Theme';
import Util from '../../util/Util';
import CommonEnum from '../../enum/CommonEnum';
export default class NoticeListScreen extends SuperView {
    constructor(props) {
        super(props);
        this.params = props.navigation.state.params || {};
        this._navigationHeaderView = {
            title: this.params.name,
        }
        this._tabBarBottomView = {
            bottomInset: true,
        }
        this.state = {
            dataList: [],
            isLoading: true,
            isNoMoreData: false,
            isLoadingMore: false,
            page: 1
        }
    }
    componentDidMount() {
        this._loadList();
    }

    componentWillUnmount() {
        const { dataList } = this.state;
        let arr = [];
        dataList.forEach(obj => {
            if (obj.SendStatus === 1) {
                arr.push(obj.MessageId);
            }
        })
        if (arr.length > 0) {
            let model = {
                MessageIdList: arr
            }
            CommonService.CurrentUserMessageBatchRead(model).then(response => {
              if(response &&response.success){

              }
            }).catch(error =>{
             console.log(error);
            })
        }
        super.componentWillUnmount();
    }


    _loadList = () => {
        let model = {
            Query: {
                Category: this.params.Category
            },
            Pagination: {
                PageSize: 6,
                PageIndex: this.state.page
            }
        }
        CommonService.CurrentUserMessageList(model).then(response => {
            if (response && response.success) {
                this.state.dataList = this.state.dataList.concat(response.data.ListData);
                if (response.data.TotalRecorder <= this.state.dataList.length) {
                    this.state.isNoMoreData = true;
                }
                this.setState({
                    isLoading: false,
                    isLoadingMore: false
                })
            } else {
                this.toastMsg(response.message || '获取数据失败');
                this._detailError();
            }
        }).catch(error => {
            this._detailError();
            this.toastMsg(error.message || '获取数据异常');
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
            isNoMoreData: false,
            isLoadingMore: false
        })
    }

    // 审批详情
    _toApprovelDetail = (item) => {
        //orderIdentification
        let OrderCategory = item.DataInfo.BusinessType;
        let Id = item.DataInfo.BusinessId;
        if (OrderCategory == 10) {
                this.push('FlightOrderDetail', { Id: Id, isApprove: item.Category === 1 });
           
        } else if (OrderCategory == 30) {
            this.push('HotelOrderDetailScreen', {
                OrderId: Id,
                isApprove: item.Category === 1
            });
        } else if (OrderCategory == 20) {
            this.push('TrainOrderDetailScreen', { Id: Id, isApprove: item.Category === 1 })
        } else if (OrderCategory == 50) {
            this.push('IntlFlightOrderDetail', { order: { Id }, isApprove: item.Category === 1 })
        } else if (OrderCategory == 120) {
            this.push('ApplicationOrderDetail', { isApprove: item.Category === 1, Id: Id })
        }else{
            this.push( 'IntlHotelOrderDetail', { orderId:Id })
        }

    }

    renderBody() {
        const { isLoading, isNoMoreData, isLoadingMore } = this.state;
        return (
            <View style={{ flex: 1 }}>
                <FlatList
                    data={this.state.dataList}
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
                >

                </FlatList>
            </View>
        )
    }

    _renderItem = ({ item, index }) => {
        let CreateTime = Util.Date.toDate(item.CreateTime);
        return (
            <View style={{ margin: 10, }}>
                <View style={{ alignItems: 'center' }}>
                    <View style={{ 
                                    backgroundColor: 'rgba(193, 193, 193, 1)', 
                                    paddingTop:4,
                                    paddingLeft: 10, 
                                    paddingRight:10,
                                    height: 26, 
                                    borderRadius: 13 
                                }}>
                        <CustomText style={{ color: 'white' }} text={CreateTime.format('yyyy年MM月dd日 HH:mm')} />
                    </View>
                </View>
                <View style={{ backgroundColor: 'white', marginLeft:5,marginRight:5,marginTop: 10, borderRadius:10}}>
                    <View style={{  padding: 10,paddingBottom:20, borderBottomColor: Theme.lineColor, borderBottomWidth: 1 }}>
                        <CustomText text={item.Content} style={{ fontSize: 16, color: 'gray' }} />
                    </View>
                    <View style={{ justifyContent: 'space-between', flexDirection: 'row', padding: 10 }}>
                        <CustomText text={''} style={{ color: Theme.specialColor2 }} />
                        <CustomText text='订单详情' style={{ color: Theme.theme }} onPress={this._toApprovelDetail.bind(this, item)} />
                    </View>
                </View>
            </View>
        )
    }
}