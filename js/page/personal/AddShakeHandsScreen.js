import React from 'react';
import {
    TouchableHighlight,
    View,
    FlatList,
    StyleSheet,
    DeviceEventEmitter,
    TouchableOpacity,
} from 'react-native';
import SuperView from '../../super/SuperView';
import AntDesign from 'react-native-vector-icons/AntDesign';
import CustomText from '../../custom/CustomText';
import Theme from '../../res/styles/Theme';
import ViewUtil from '../../util/ViewUtil';
import InvoiceService from '../../service/InvoiceService';
import FlightService from '../../service/FlightService';
import CommonService from '../../service/CommonService';
import I18nUtil from '../../util/I18nUtil';

export default class AddShakeHandsScreen extends SuperView {
    constructor(props) {
        super(props);
        this.params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};
        this._navigationHeaderView = {
            title: '预订人授权'//预订人授权
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
        this.listener = DeviceEventEmitter.addListener('refre', (params) => {
            this.setState({
                dataList: [],
            }, () => {
                this._loadData();
            })
           
        })
    }
    _loadData = () => {
        let model = {
            Query:{
                Keyword:''
            },
            Pagination: {
                PageIndex: this.state.page,
                PageSize: 10
            }
        }
        this.showLoadingView();
        FlightService.MyBookerList(model).then(response => {
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
                    isNoMoreData: true
                })
            } else {
                this.toastMsg( '获取数据失败');
            }
        }).catch(error => {
            this.hideLoadingView();
            this.toastMsg(error.message||'获取数据失败');
        })
    }

    /**
     *  选择发票抬头
     */
    _toOrderFresh = (item) => {
        const { callBack } = this.params;
        callBack(item);
        this.pop();
    }

    /**
     *  删除 撤回 授权人
     */
    deleteBooker = (item) => {
        if(!item){return};
        let index = item.Status-1
        let arr = ['是否撤回该授权？','是否删除该授权人？','是否重新提交？']
        let arr2 = ['撤回成功','删除成功','提交成功']
        let content = I18nUtil.tranlateInsert(arr[index], I18nUtil.translate(arr[index]))
        this.showAlertView(content,()=>{
            return ViewUtil.getAlertButton('取消', () => {
                this.dismissAlertView();
            }, '确定', () => {
                this.dismissAlertView();
                let model = {
                    RequestId:item.RequestId
                }
                let model2 = {//重新提交
                    RequestId:item.RequestId,
                    Type:1//出行人列表，  1预订列表
                }
                let modeling = index==2 ? model2 : model
                this.showLoadingView();
                let arr = [FlightService.RequestForWithdraw , FlightService.RemoveMyBooker, FlightService.ResubmitHandShakeApprove]
                let HandersService = arr[index]
                HandersService(modeling).then(response=>{
                    this.hideLoadingView();
                    if(response && response.success){
                        this.toastMsg(arr2[index])
                        this.setState({
                            dataList: [],
                        }, () => {
                            this._loadData();
                        })
                    }else{
                        this.toastMsg('操作失败，请稍后重试');
                    }
                })
            })
        })
    }

    /** 
     * 添加发票
     */
    _addAuthorize = () => {
        this.push('SearchBookerScreen')
    }

    chooseClick = (item, isAgree) => {
         let content = isAgree ? '如接受该申请，预定人可为您进行差旅预定，访问您的个人信息。是否接受该申请？' : '是否拒绝该申请？'
        this.showAlertView(content,()=>{
            return ViewUtil.getAlertButton('取消',()=>{
                this.dismissAlertView();
            },'确定',()=>{
                this.dismissAlertView();
                this.chooseNext(item, isAgree);
            })
        })
    }

    chooseNext = (item, isAgree) => {
        let model = {
            RequestId:item.RequestId,
            Type:1, //1预订人列表，2.出行人列表
            IsAgree:isAgree  //true 同意， false 拒绝
        }
        this.showLoadingView();
        CommonService.HandShakeApprove(model).then(response => {
            this.hideLoadingView();
            if (response && response.success) {
                if(isAgree){
                    this.toastMsg( '已同意');
                    this.setState({
                        dataList: [],
                    }, () => {
                        this._loadData();
                    })
                }else{
                    this.toastMsg( '已拒绝');
                    this.setState({
                        dataList: [],
                    }, () => {
                        this._loadData();
                    })
                }
            } 
        }).catch(error => {
            this.toastMsg( '获取数据失败');
        })
    }

    _renderItem = ({ item, index }) => {
        let arr = ['撤回','删除','重新提交'];
        let arr2 = ['back','delete','reload1']
        return (
            <View style={styles.view} >
                 <View style={{flexDirection:'row', justifyContent:'space-between',borderBottomWidth:1,borderColor:Theme.lineColor,paddingVertical:12}}>
                    <CustomText text={item.Name} style={{fontSize:15, fontWeight:'bold'}} />
                    <CustomText text={item.StatusDesc} style={{color:Theme.theme, fontSize:13,justifyContent:'flex-end'}}/>
                 </View>
                <View style={styles.row}>
                        <View>
                            <View style={{flexDirection:'row'}}>
                                <CustomText text={item.Email} style={{color:Theme.commonFontColor, fontSize:13}}  />
                            </View>
                            <CustomText text={item.Customer} style={{color:Theme.commonFontColor, marginTop:5, fontSize:13}}  />
                        </View>
                </View>
                <View style={{marginVertical:12}}>
                    {
                        item.Status==1 && (item.CreatorId != this.params.userInfo.Id)
                        ?
                        <View style={styles.linViewS}>
                             <TouchableHighlight style={styles.btn} underlayColor={'transparent'} onPress={this.chooseClick.bind(this, item, true)} >
                                <CustomText style={{color: 'white'}} text='同意' />
                            </TouchableHighlight>
                            <TouchableHighlight style={styles.btn2} underlayColor={'transparent'} onPress={this.chooseClick.bind(this, item, false)}>
                                <CustomText style={{ color: Theme.theme }} text='拒绝' />
                            </TouchableHighlight>
                        </View>
                        :
                        (item.Status==3||item.Status==1||item.Status==2) && (item.CreatorId == this.params.userInfo.Id)? 
                        <View style={styles.linViewS}>
                             <TouchableHighlight style={styles.btn} underlayColor={'transparent'}onPress={this.deleteBooker.bind(this, item)} >
                                <CustomText style={{ color: 'white' }} text={arr[item.Status-1]} />
                            </TouchableHighlight>
                        </View>:null
                    }
                </View>
            </View>
        )
    }

    _renderError = () => {
        return (
            <View style={{ flex: 1 }}>
                {
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                        <CustomText style={{ color: 'gray' }} text={ '您还未添加授权人'} />
                    </View>
                }
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
                        keyExtractor={(item, index) => String(index)}
                        ListFooterComponent={ViewUtil.getRenderFooter(loadingMore, isNoMoreData)}
                    />
                }
                {
                    ViewUtil.getSubmitButton('添加',this._addAuthorize)
                }
            </View>
        )
    }

    componentWillUnmount(){
        this.listener.remove();
    }
}
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
    btnStyle:{
        flexDirection:'row', 
        justifyContent:'flex-end',
        borderWidth:1,
        borderColor:Theme.theme,
        borderRadius:3,
        padding:2,
        height:25
    },
    btn: {
        backgroundColor: Theme.theme,
        height: 22,
        marginLeft: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius:2,
        paddingHorizontal:15,       
    },
    btn2: {
        height: 22,
        marginLeft: 10,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal:15,
        borderWidth:1,
        borderColor:Theme.theme,
        borderRadius:2       
    },
    linViewS:{ 
        flexDirection: 'row-reverse', 
    }
})