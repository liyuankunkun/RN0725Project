import React from 'react';
import {
    View,
    StyleSheet,
    TouchableHighlight,
    FlatList,
    DeviceEventEmitter
} from 'react-native';
import SuperView from '../../super/SuperView';
import SearchInput from '../../custom/SearchInput';
import CustomText from '../../custom/CustomText';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ViewUtil from '../../util/ViewUtil';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Theme from '../../res/styles/Theme';
import ApplicationService from '../../service/ApplicationService';
import CustomActionSheet from '../../custom/CustomActionSheet';
import { connect } from 'react-redux';
import Action from '../../redux/action/index';
import UserInfoDao from '../../service/UserInfoDao';
import Util from '../../util/Util';
import MapService from '../../service/MapService';
import Key from '../../res/styles/Key';
import CryptoJS from "react-native-crypto-js";//加密、解密
class ApplicationListMoreScreen extends SuperView {
    constructor(props) {
        super(props);
        this._navigationHeaderView = {
            title: '更多行程',
            // rightButton: ViewUtil.getRightButton("新申请", this._toCreateApply)
        }
        this._tabBarBottomView = {
            bottomInset: true
        }
        this.params = props.navigation.state.params || {};
        this.state = {
            dataList: [],
            page: 1,
            keyWord: '',
            isLoading: true,
            isLoadingMore: false,
            isNoMoreData: false,
            selectApply: null,
            options: ['国内机票', '港澳台及国际机票', '火车票', '国内酒店', '港澳台及国际酒店', '用车']
        }
    }
   
    componentDidMount() {
        if (this.props.feeType === 2) {
            this.props.setFeeType(1);
        }
        this._loadList();
        this.pageEmit = DeviceEventEmitter.addListener('homeRefresh',(dic)=>{
            if (dic.homeRefresh) {
                this._loadList();//B页面的数据刷新函数
                return;
            }
         });
    
    }
    componentWillUnmount(){    
        this.pageEmit && this.pageEmit.remove();
    };


    _loadList = () => {
        let model = {
            Query: {
                Keyword: this.state.keyWord
            },
            Pagination: {
                PageIndex: this.state.page,
                PageSize: 20
            }
        }
        if (this.state.keyWord.length > 0) {
            this.showLoadingView();
        }
        ApplicationService.travelApplyList(model).then(response => {
            this.hideLoadingView();
            if (response && response.success) {
                if (response.data && response.data.ListData) {
                    this.state.dataList = this.state.dataList.concat(response.data.ListData);
                }
                if (response.data.TotalRecorder <= this.state.dataList.length) {
                    this.state.isNoMoreData = true;
                }
                this.setState({
                    isLoading: false,
                    isLoadingMore: false
                })
            } else {
                this._detailLoadFail();
                this.toastMsg(response.message || '获取申请单列表失败');
            }
        }).catch(error => {
            this.hideLoadingView();
            this._detailLoadFail();
            this.toastMsg(error.message || '获取数据异常');
        })
    }
      //错误处理
      _detailLoadFail = () => {
        if (this.state.isLoadingMore) {
            this.state.page--;
        }
        this.setState({
            isLoading: false,
            isLoadingMore: false
        })
    }


    //前往订单详情
    _toOrderDetail = (data) => {
        this.push('ApplicationOrderDetail', {
            Id: data.Id
        });
    }

    /**
     * 点击预订按钮
     */
    _orderSelect = (data) => {
        let CategoryIntroArr=data.CategoryNames.split('、');
        this.props.setApply(data);
        this.setState({
            selectApply: data,
            options: CategoryIntroArr,
        }, () => {
            this.actionSheet.show();
        })
    }
    _handlePress = (index) => {
        const { options } = this.state;
        const { apply } = this.props;
        if (!apply) {
            this.toastMsg('未选择申请单');
            return;
        }
        let item = options[index];
        if(item==='国内机票'){
            this.push('FlightSearchIndex');
        }else if (item==='国内酒店'){
            this.push('HotelSearchIndex', { isIntl: false });
        }else if (item==='港澳台及国际机票'){
            this.push('IntlFlightIndex');
        }else if (item==='港澳台及国际酒店'){
            this.push('HotelSearchIndex', { isIntl: true });
        }else if (item==='火车票'){
            this.push('TrainIndexScreen');
        }else if (item==='用车'){
            this.toastMsg('您的申请单类目不支持预订用车');
        }
       
    }
    _getOriginDomain = (url) => {
        const xgIndex = url&&url.indexOf('/');
        if (xgIndex !== -1) {
            url = url.substr(xgIndex + 2);
        }
        const mhIndex = url&&url.indexOf(':');
        if (mhIndex !== -1) {
            url = url.substr(0, mhIndex);
        }
        return url;
    }

    _toOtwCar = (model,apply) => {
        const originDomain = this._getOriginDomain(global.baseH5Url);
        this.showLoadingView();
        UserInfoDao.getToken().then(response => {
            this.hideLoadingView();
            let bytes  = CryptoJS.AES.decrypt(response, Key.TOKEN);
            let decoded_response = bytes.toString(CryptoJS.enc.Utf8);
            let expiration = new Date().addDays(7);
            RctBridage.setCookie({
                name: 'tmc-token',
                value: decoded_response,
                domain: originDomain,
                origin: originDomain,
                expiration: Util.Date.toDate(expiration).format('yyyy-MM-dd HH:mm'),
                path: '/',
            })
            this.push('Web', {
                title: '用车',
                url: global.baseH5Url + `/car?isShowHeader=false&feeType=${this.props.feeType}&&location=${model ? JSON.stringify(model) : ''}&&apply=${apply.Id}`
            });
        })
    }
   
    renderBody() {
        const { dataList, isLoading, isLoadingMore, isNoMoreData, options, keyWord } = this.state;
        return (
            <View style={{ flex: 1 }}>
                <FlatList
                    data={this.params.JourneyList}
                    renderItem={this._renderItem}
                    // refreshControl={ViewUtil.getRefreshControl(isLoading, () => {
                    //     this.setState({
                    //         page: 1,
                    //         isLoading: true,
                    //         isNoMoreData: false,
                    //         isLoadingMore: false,
                    //         dataList: []
                    //     }, () => {
                    //         this._loadList();
                    //     })
                    // })}
                    keyExtractor={(item, index) => String(index)}
                    showsVerticalScrollIndicator={false}
                    onEndReachedThreshold={0.1}
                    ListFooterComponent={ViewUtil.getRenderFooter(isLoadingMore, isNoMoreData)}
                    onEndReached={() => {
                            if (this.canLoad && !isNoMoreData && !isLoadingMore && !isLoading) {
                                this.state.page++;
                                this.setState({
                                    isLoadingMore: true
                                }, () => {
                                    this._loadList();
                                    this.canLoad = false;
                                })
                            }
                        
                    }}
                    onMomentumScrollBegin={() => {
                        this.canLoad = true
                    }}
                    
                />
                <CustomActionSheet ref={o => this.actionSheet = o} options={options} onPress={this._handlePress} />
            </View>
        )
    }
    _renderItem = ({ item: data, index }) => {
        return (
            <TouchableHighlight underlayColor='transparent' onPress={this._toOrderDetail.bind(this, this.params)}>
                <View style={{ backgroundColor: 'white', marginTop: 10 }}>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ margin: 15 }}>
                            <FontAwesome name={'shopping-bag'} size={22} color={Theme.theme} />
                        </View>
                        <View style={{ margin: 10, marginLeft: 0, flex: 1 }}>
                            <View style={{ flexDirection: "row", }}>
                                <CustomText numberOfLines={1} text={data.JourneyIntro} style={{ flex: 1, marginRight: 5, fontSize: 14 }} />
                                <CustomText style={{ color: 'gray' }} text={this.params.StatusDesc} />
                            </View>
                            <View style={{ flexDirection: "row", marginTop: 10 }}>
                                <CustomText text={this.params.TravellerIntro} style={{ color: 'gray', flex: 1, marginRight: 5, }} />
                                {
                                    this.params.Status === 1 ? <TouchableHighlight underlayColor='transparent' onPress={this._orderSelect.bind(this, data)}>
                                        <View style={{ paddingHorizontal: 8, paddingVertical: 5, backgroundColor: Theme.theme, borderRadius: 3 }}>
                                            <CustomText text='预订' style={{ color: 'white' }} />
                                        </View>
                                    </TouchableHighlight> : null
                                }
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableHighlight>
        )
    }
}

const getProps = (state) => ({
    apply: state.apply.apply,
    feeType: state.feeType.feeType
});
const getActions = dispatch => ({
    setApply: (value) => dispatch(Action.applySet(value)),
    setFeeType: (value) => dispatch(Action.feeTypeTransform(value))
})
export default connect(getProps, getActions)(ApplicationListMoreScreen)

const styles = StyleSheet.create({
    headerView: {
        borderStyle: 'dashed',
        borderColor: "white",
        borderWidth: 1,
        borderRadius: 5,
        height: 60,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    }
})