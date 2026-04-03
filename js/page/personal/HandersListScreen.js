import React from 'react';
import {
    TouchableHighlight,
    View,
    FlatList,
    Text,
    StyleSheet,
    DeviceEventEmitter,
    Image,
    TouchableOpacity
} from 'react-native';
import SuperView from '../../super/SuperView';
import Theme from '../../res/styles/Theme';
import ViewUtil from '../../util/ViewUtil';
import CommonService from '../../service/CommonService';
import CustomText from '../../custom/CustomText';
import Util from '../../util/Util';
import I18nUtil from '../../util/I18nUtil';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { connect } from 'react-redux';
import action from '../../redux/action';

class HandersListScreen extends SuperView {
    constructor(props) {
        super(props);
        this._navigationHeaderView = {
            title: '出行人信息列表'
        }
        this._tabBarBottomView = {
            bottomInset: true,
            bottomColor: 'white'
        }
        this.state = {
            dataList: [],
            isLoading: true,
            isNoMoreData: false,
            loadingMore: false,
            page: 1
        }
    }
    componentDidMount() {
        this._loadData();
        this.listener = DeviceEventEmitter.addListener('refTravelerInfo', (params) => {
            this.setState({
                dataList: [],
            }, () => {
                this._loadData();
            })
        })
    }
    _loadData = () => {
        const { page } = this.state;
        let model = {
            Query: {
                KeyWord: '',
            },
            Pagination: {
                PageIndex: page,
                PageSize: 10
            }
        }
        CommonService.TravelerManagerList(model).then(response => {
            if (response && response.success) {
                if (response.data && response.data.ListData) {
                    this.state.dataList = this.state.dataList.concat(response.data.ListData);
                    if (response.data.TotalRecorder <= this.state.dataList.length) {
                        this.state.isNoMoreData = true;
                    }
                }
                this.setState({
                    isLoading: false,
                    loadingMore: false
                })
            }
        }).catch(error => {
            this._detailError();
            this.toastMsg(error.message || '获取数据异常');
        })
    }
    /**
     *  错误处理
     */
    _detailError = () => {
        if (this.state.loadingMore) {
            this.state.page--;
        }
        this.setState({
            loadingMore: false,
            isLoading: false
        })
    }
    _rowClick = (index) => {
        let obj = this.state.dataList[index];
        let customerInfo = this.props.customerInfo_userInfo.customerInfo;
        this.push('EditHandPassengerScreen', {
            passenger: obj,
            from: 'presonal',
            isDelet: true,
            customerInfo,
            callBack: (data) => {
                this.state.dataList[index] = data;
                this.setState({});
            },
            deletBack: () => {
                this.state.dataList.splice(index, 1);
                this.setState({});
            }
        });
    }
    _addTraveller = () => {
        let customerInfo = this.props.customerInfo_userInfo.customerInfo;
        this.push('IntlFlightEditPassenger', {
            from: 'presonal',
            title:'新增乘客',
            customerInfo,
            callBack: (data) => {
                this.setState({
                    isNoMoreData: false,
                    page: 1,
                    dataList: [],
                    isLoading: true
                }, () => {
                    this._loadData();
                })
            }
        });
    }
    _renderItem = ({ item, index }) => {
        if (item.Certificate) {
            let obj = typeof item.Certificate === 'string' ? JSON.parse(item.Certificate)[0] : null;
            if (obj) {
                item.CertificateType = obj.TypeDesc;
                item.CertificateId = obj.Type;
                item.CertificateNumber = obj.SerialNumber;
            }
        }
        return (
                <View style={styles.view} >
                    <View style={{flexDirection:'row', justifyContent:'space-between',borderBottomWidth:1,borderColor:Theme.lineColor,paddingVertical:12}}>
                        <CustomText text={item.Name + (item.DepartmentName ? ('-' + item.DepartmentName) : '')} style={{fontSize:15, fontWeight:'bold'}} />
                        <TouchableOpacity onPress={this._rowClick.bind(this, index)} style={{paddingLeft:20}}>
                            <Image source={require('../../res/Uimage/_edit.png')} style={{width:24,height:24}}/>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.row}>
                            <View>
                                <View style={{flexDirection:'row'}}>
                                    <CustomText text={item.Email} style={{color:Theme.commonFontColor, fontSize:13}}  />
                                </View>
                                <CustomText text={item?.Customer?.Name ?? ' '} style={{color:Theme.commonFontColor, marginTop:5, fontSize:13}}  />
                            </View>
                            <TouchableOpacity onPress={()=>{ this.push('TaverlerCreditCardScreen',{Id:item.Id}) }} style={{paddingLeft:20}}>
                                <Image source={require('../../res/Uimage/cer_card.png')} style={{width:24,height:24}}/>
                            </TouchableOpacity>
                    </View>
                </View>
        )
    }
    renderBody() {
        const { dataList, isLoading, loadingMore, isNoMoreData } = this.state;
        return (
            <View style={{ flex: 1 }}>
                {
                    !dataList ||dataList.length==0 ?
                        this._renderError()
                    :
                    <FlatList style={{ flex: 1 }}
                        data={dataList}
                        renderItem={this._renderItem}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={(item, index) => String(index)}
                        refreshControl={ViewUtil.getRefreshControl(isLoading, () => {
                            this.setState({
                                isNoMoreData: false,
                                page: 1,
                                dataList: [],
                                isLoading: true
                            }, () => {
                                this._loadData();
                            })
                        })}
                        onEndReachedThreshold={0.1}
                        onEndReached={() => {
                            setTimeout(() => {
                                if (this.canLoad && !this.state.isNoMoreData && !this.state.loadingMore) {
                                    this.state.page++;
                                    this.setState({
                                        loadingMore: true
                                    }, () => {

                                        this._loadData();
                                        this.canLoad = false;
                                    })
                                }
                            }, 100)
                        }}
                        onMomentumScrollBegin={() => {
                            this.canLoad = true;
                        }}
                        ListFooterComponent={ViewUtil.getRenderFooter(loadingMore, isNoMoreData)}
                    />
                }
                <View style={{ height: 20, backgroundColor: 'white', justifyContent: "center", alignItems: 'center', flexDirection: 'row' }}/>
                  
            </View>
        )
    }
    
    _renderError = () => {
        return (
            <View style={{ flex: 1 }}>
                {
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                        <CustomText style={{ color: 'gray' }} text={ '没有查询到数据'} />
                    </View>
                }
            </View>
        )
    }
}
const getStateProps = state => ({
    customerInfo_userInfo: state.customerInfo_userInfo
})
export default connect(getStateProps)(HandersListScreen);

const styles = StyleSheet.create({
    view: {
        backgroundColor: 'white',
        marginHorizontal:10,
        marginTop:10,
        borderRadius:6,
        paddingHorizontal:20,
    },
    row: {
        // backgroundColor: 'white',
        borderBottomColor: Theme.lineColor,
        flexDirection: 'row',
        justifyContent:'space-between',
        borderRadius:6,
        borderBottomWidth:1,
        paddingVertical:15
    },
})