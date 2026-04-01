import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  DeviceEventEmitter
} from 'react-native';
import SuperView from '../../super/SuperView';
import CustomText from '../../custom/CustomText';
import Theme from '../../res/styles/Theme';
import CommonService from '../../service/CommonService';
import ViewUtil from '../../util/ViewUtil';
import Util from '../../util/Util';
import Icon from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import NavigationUtils from '../../navigator/NavigationUtils';


export default class NewNoticeCenterScreen extends SuperView {
  constructor(props) {
    super(props);
    this.params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};
    let messageAll = Object.values(this.params.messageSummary).reduce((acc, curr) => acc + curr, 0);
    this._navigationHeaderView = {
      title: '消息中心',
      rightButton: <TouchableOpacity style={{ padding: 15 }} onPress={() => { this._toAllRead() }}>
        <CustomText text={'全部已读'} style={{ color: messageAll > 0 ? 'black' : 'gray' }}></CustomText>
      </TouchableOpacity>,
      leftButton: <TouchableOpacity style={{ padding: 15 }} onPress={() => { this._backBtnClick2() }}>
        <AntDesign name="arrowleft" size={18} color={'black'} />
      </TouchableOpacity>
    }
    this.state = {
      messageSummary: this.params.messageSummary,
      messageAll: messageAll,
      dataList: [],
      isLoading: true,
      isNoMoreData: false,
      isLoadingMore: false,
      page: 1,
      selectedIndex: 0,
      massegeNum: null,
    }
  }
  _backBtnClick = (index) => {
    DeviceEventEmitter.emit('refreshMassege', {})
  }
  _backBtnClick2 = (index) => {
    this.pop();
    DeviceEventEmitter.emit('refreshMassege', {})
  }
  componentDidMount() {
    this.letRefreshMassege = DeviceEventEmitter.addListener('refreshMassege', () => {
      this.setState({
        page: 1,
        isLoading: true,
        isNoMoreData: false,
        isLoadingMore: false,
        dataList: []
      }, () => {
        this._loadList();
        this.getMassegeNum();
      })
      return;

    })
    this.getMassegeNum();
    this._loadList();
  }
  componentWillUnmount() {
    this.letRefreshMassege && this.letRefreshMassege.remove();
  }
  _toAllRead = () => {
    // const { item } = this.props.navigation.state.params || {};
    const { messageAll } = this.state;
    if (messageAll > 0) {
      let model = {
        ReadAll: true,
        MessageIdList: null,
      }
      CommonService.CurrentUserMessageRead(model).then(response => {
        if (response && response.success) {
          this.toastMsg('标记成功');
          this.setState({
            page: 1,
            isLoading: true,
            isNoMoreData: false,
            isLoadingMore: false,
            messageAll: 0,
            dataList: []
          }, () => {
            this._loadList();
            this.getMassegeNum();
            DeviceEventEmitter.emit('refreshMassege', {})
            this._navigationHeaderView = {
              title: '消息中心',
              rightButton: <TouchableOpacity style={{ padding: 15 }} onPress={() => { this._toAllRead() }}>
                <CustomText text={'全部已读'} style={{ color: 'gray' }}></CustomText>
              </TouchableOpacity>,
              leftButton: <TouchableOpacity style={{ padding: 15 }} onPress={() => { this._backBtnClick2() }}>
                <AntDesign name="arrowleft" size={18} color={'black'} />
              </TouchableOpacity>
            }
          })
        } else {
          this.toastMsg(response.message || '获取数据失败');
        }
      }).catch(error => {
        this.toastMsg(error.message || '获取数据异常');
      })
    } else {
      this.toastMsg('没有未读消息');
    }

  }
  _loadList = () => {
    const { massegeNum, messageSummary } = this.state;
    const obj = messageSummary;
    const value = obj[massegeNum];
    let model = {
      Query: {
        Category: massegeNum === 0 ? null : massegeNum,
        ReadStatus: !massegeNum ? null : value > 0 ? 1 : null,
      },
      Pagination: {
        PageSize: 10,
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

  getMassegeNum = () => {
    CommonService.CurrentUserMessageSummary({ ReadStatus: 1 }).then(response => {
      if (response && response.success) {
        const sum = Object.values(response.data).reduce((acc, curr) => acc + curr, 0);
        this.setState({
          messageSummary: response.data,
          messageAll: sum
        }, () => {
          this._navigationHeaderView = {
            title: '消息中心',
            rightButton: <TouchableOpacity style={{ padding: 15 }} onPress={() => { this._toAllRead() }}>
              <CustomText text={'全部已读'} style={{ color: sum > 0 ? 'black' : 'gray' }}></CustomText>
            </TouchableOpacity>,
            leftButton: <TouchableOpacity style={{ padding: 15 }} onPress={() => { this._backBtnClick2() }}>
              <AntDesign name="arrowleft" size={18} color={'black'} />
            </TouchableOpacity>
          }
        })
      }
    }).catch(error => {
      console.log(error);
    })
  }
  /**
   *  前往订单页
   */
  _toDetail = (item) => {
    let Category = 0;
    switch (item.key) {
      case 'apply':
        Category = 1;
        break;
      case 'order':
        Category = 2;
        break;
      case 'trip':
        Category = 3;
        break;
      case 'notice':
        Category = 4;
        break;
    }
    this.push('NoticeCenterDetail', { Category, name: item.name });
  }

  _click = (item, index) => {
    item.cleck = !item.cleck;
    this.setState({
      selectedIndex: index,
      massegeNum: item.num,
      dataList: [],
      page: 1,
      isLoading: true,
      isNoMoreData: false,
      isLoadingMore: false,
    }, () => {
      this._loadList();
    });
  }

  renderBody() {
    const { isLoading, isNoMoreData, isLoadingMore, selectedIndex, messageSummary, messageAll } = this.state;
    return (
      <View style={{ backgroundColor: '#fff' }}>
        <ScrollView horizontal={true} style={{}} showsHorizontalScrollIndicator={false}>
          {
            pannelArr.map((item, index) => {
              return (
                <TouchableOpacity
                  key={index}
                  underlayColor="#fff"
                  onPress={() => {
                    this._click(item, index)
                  }}
                  style={{ flexDirection: 'row', height: 32 }} // 根据selectedIndex状态设置背景颜色
                >
                  <View style={[styles.row, { backgroundColor: selectedIndex === index ? Theme.theme : '#eee' }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Icon name={item.img} size={18} color={selectedIndex === index ? '#fff' : "gray"} />
                      <CustomText style={{ marginLeft: 3, fontSize: 14, color: selectedIndex === index ? '#fff' : "gray" }} text={Util.Parse.isChinese() ? item.name : item.Ename}></CustomText>
                    </View>
                    {
                      (messageSummary[item.num] && messageSummary[item.num] !== 0) && (
                        <View style={{ minHeight:16,minWidth:16, backgroundColor: 'red', borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: -10 }}>
                          <CustomText style={{ fontSize: 9, color: '#fff' }} text={messageSummary[item.num]>=99?"99+":messageSummary[item.num]}></CustomText>
                        </View>
                      )
                    }
                    {
                      index === 0 && messageAll > 0 && (
                        <View style={{ minHeight:16,minWidth:16, backgroundColor: 'red', borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: -10 }}>
                          <CustomText style={{ fontSize: 9, color: '#fff' }} text={messageAll>=99?"99+":messageAll}></CustomText>
                        </View>
                      )
                    }

                  </View>
                </TouchableOpacity>
              )
            })
          }
        </ScrollView>
        <FlatList
          data={this.state.dataList}
          height={global.screenHeight - 150}
          style={{ backgroundColor: Theme.normalBg }}
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
              if (!isNoMoreData && !isLoadingMore && !isLoading) {
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
          initialNumToRender={10} // 初始渲染的项目数量
          maxToRenderPerBatch={10} // 每批渲染的项目数量
          windowSize={21} // 渲染窗口的大小
          removeClippedSubviews={true} // 移除屏幕外的子视图
        />
      </View>
    )
  }

  _toOrderDetail = (item) => {
    let approveBool = item.Category === 1 ? true : false;

    if (item.BusinessType === 10) {
      this.push('FlightOrderDetail', { Id: item.BusinessId, isApprove: approveBool, approveShow: approveBool })
    } else if (item.BusinessType === 20) {
      this.push('TrainOrderDetailScreen', { Id: item.BusinessId, isApprove: approveBool, approveShow: approveBool })
    } else if (item.BusinessType === 30) {
      this.push('HotelOrderDetailScreen', { OrderId: item.BusinessId, isApprove: approveBool })
    } else if (item.BusinessType === 40) {
      this.push('InterHotelOrderDetail', { orderId: item.BusinessId, isApprove: approveBool, approveShow: approveBool })
    } else if (item.BusinessType === 50) {
      this.push('IntlFlightOrderDetail', { order: item.BusinessId, isApprove: approveBool, approveShow: approveBool });
    } else if (item.BusinessType === 120) {
      this.push('ApplicationOrderDetail', { isApprove: approveBool, Id: item.BusinessId, approveShow: approveBool });
    } else if (item.BusinessType === 280) {
      this.push('CompDetailScreen', { orderId: item.BusinessId, approve: approveBool, approveShow: approveBool });
    } else {
      this._toApprovelDetail(item)
    }

  }

  _waitforPayAction = (data) => {
    let model = {
      SerialNumber: data.Extra.TradeNumber
    }
    this.showLoadingView();
    CommonService.PaymentInfo(model).then(response => {
      this.hideLoadingView();
      if (response && response.success && response.data) {
        this._toPayDetail(response.data)
      } else {
        this.toastMsg(response.message || '获取支付信息失败');
      }
    }).catch(error => {
      this.hideLoadingView();
      this.toastMsg(error.message || '获取数据异常');
    })
  }

  _toPayDetail = (data) => {
    if (data.Category === 17) {
      this.push('CompPaymentScreen', { TradeNumber: data.SerialNumber, fromId: 'newNoticeCenter' })
      return;
    } else if (data.Category === 1 || data.Category === 11 || data.Category === 12) {
      this.push('FlightPayment', { SerialNumber: data.SerialNumber, fromId: 'newNoticeCenter' });
    } else if (data.Category === 6 || data.Category === 14) {
      this.push('IntlFlightPayment', { SerialNumber: data.SerialNumber, fromId: 'newNoticeCenter' });
    } else if (data.Category === 5 || data.Category === 7 || data.Category === 12) {
      this.push("TrainPayment", { SerialNumber: data.SerialNumber, fromId: 'newNoticeCenter' })
    } else if (data.Category === 3 || data.Category === 4 || data.Category === 18) {
      this.push('HotelPayment', { SerialNumber: data.SerialNumber, Id: data.BusinessId, from: 'hotel', fromId: 'newNoticeCenter' });
    }
  }

  _renderItem = ({ item, index }) => {
    const { massegeNum, messageSummary } = this.state;
    let CreateTime = Util.Date.toDate(item.PublishTime);
    let previousItem = this.state.dataList[index - 1];
    let previousCreateTime = previousItem ? Util.Date.toDate(previousItem.PublishTime) : null;
    function extractText(htmlString) {
      // 去除HTML标签
      const text = htmlString.replace(/<\/?[^>]+(>|$)/g, "");
      return text;
    }
    const formatDate = (dateString) => {
      if (!dateString) return '-';
      const date = Util.Date.toDate(dateString);
      return date ? date.format('yyyy-MM-dd HH:mm') : '-';
    };
    let TitleText = item.Title && item.Title.length > 17 ? item.Title.substring(0, 17) + '...' : item.Title
    const obj = messageSummary;
    const value = obj[massegeNum];
    return (
      (value > 0 && item.ReadStatus === 2) ? null :
        <TouchableOpacity style={{}} onPress={this._toCategoryDetail.bind(this, item)}>
          <View style={{ marginBottom: 10 }}>
            {(!previousCreateTime || CreateTime.format('yyyy年MM月dd日') !== previousCreateTime.format('yyyy年MM月dd日')) && (
              <View style={{
                backgroundColor: 'lightgray',
                paddingTop: 4,
                paddingLeft: 10,
                paddingRight: 10,
                height: 30,
                marginHorizontal: 10,
                borderRadius: 2,
                marginTop: 10
              }}>
                <CustomText style={{ color: 'white' }} text={CreateTime.format('yyyy年MM月dd日')} />
              </View>
            )}
          </View>
          <View style={{ backgroundColor: 'white', marginLeft: 10, marginRight: 10, borderRadius: 10, padding: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <CustomText text={TitleText} style={{ fontSize: 15, fontWeight: 'bold', color: item.ReadStatus === 2 ? 'lightgray' : Theme.fontColor }} numberOfLines={1} />
              <View style={{ backgroundColor: item.ReadStatus === 1 ? Theme.pinkBg : 'lightgray', paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}>
                <CustomText text={item.ReadStatusDesc} style={{ fontSize: 11, color: item.ReadStatus === 1 ? Theme.redColor : 'gray' }} />
              </View>
            </View>
            <View style={{ paddingBottom: 10 }}>
              <CustomText text={extractText(item.Content)} style={{ fontSize: 13, color: item.ReadStatus === 2 ? 'lightgray' : Theme.commonFontColor }} numberOfLines={2} />
            </View>
            {
              item.Category === 4 && item.Extra && item.Extra.TradeNumber ?
                <CustomText text='>>>立即支付' onPress={() => {this._toCategoryDetail(item)}} style={{ color: Theme.theme, fontSize: 12, padding: 5 }} />
                : <CustomText text='>>>查看详情' onPress={() => {this._toCategoryDetail(item)}} style={{ color: Theme.theme, fontSize: 12 }} />
            }

            <View style={{ flexDirection: 'row', marginTop: 5 }}>
              {
                pannelArr.map((item2, index) => {
                  if (item2.num === item.Category) {
                    return (
                      <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                        <Icon name={item2.img} size={12} color={item.ReadStatus === 2 ? 'lightgray' : "gray"} />
                        <Text style={{ marginLeft: 3, fontSize: 12, color: item.ReadStatus === 2 ? 'lightgray' : "gray" }}>{Util.Parse.isChinese() ? item2.name : item2.Ename}</Text>
                      </View>
                    )
                  }
                })
              }
              <CustomText text={formatDate(item.PublishTime)} style={{ fontSize: 12, color: item.ReadStatus === 2 ? 'lightgray' : "gray" }} />
            </View>
          </View>
        </TouchableOpacity>
    )
  }

  // 审批详情
  _toApprovelDetail = (item) => {
    this.push('MessageNoticeDetail', {
      item: item,
      title: '消息详情'
    })

  }

  /**
   * 点击详情
   * @param {*} item 
   */
  _toCategoryDetail(item) {
    //标记已读
    this._toRead(item.MessageId,()=>{
      DeviceEventEmitter.emit('refreshMassege', {})
      switch (item.Category) {
        case 1:
        case 2:
          this._toOrderDetail(item);
          break;
        case 4:
          this._waitforPayAction(item);
          break;
        default:
          this._toApprovelDetail(item);
          break;
      }
    });
    
  }

  /**
   * 编辑已读
   * @param {*} index 
   */
  _toRead = (messageId,func) => {
    let model = {
      Status: 2,
      MessageIdList: [messageId],
    }
    CommonService.CurrentUserMessageChangeStatus(model).then(response => {
      if (response && response.success) {
        func();
      } else {
        this.toastMsg(response.message || '获取数据失败');
      }
    }).catch(error => {
      this.toastMsg(error.message || '获取数据异常');
    })
  }
}


const pannelArr = [
  {
    name: '全部',
    Ename: 'All',
    img: "bell",
    cleck: false,
    num: 0,
  }, {
    name: '订单通知',
    Ename: 'Orders',
    img: "file-text",
    cleck: false,
    num: 2,
  }, {
    name: '提醒通知',
    Ename: 'Reminders',
    img: "clock",
    cleck: false,
    num: 3,
  },
  {
    name: '待付款通知',
    Ename: 'PendingPayments',
    img: "credit-card",
    cleck: false,
    num: 4,
  },
  {
    name: '审批通知',
    Ename: 'Approvals',
    img: "check-circle",
    cleck: false,
    num: 1,
  },
  {
    name: '系统通知',
    Ename: 'System',
    img: "volume-2",
    cleck: false,
    num: 9,
  },
  {
    name: '重要通知',
    Ename: 'Important',
    img: "alert-octagon",
    cleck: false,
    num: 10,
  },
]


const styles = StyleSheet.create({
  row: {
    height: 30,
    // width:100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
    borderRadius: 17,
    paddingHorizontal: 10,
  }
})