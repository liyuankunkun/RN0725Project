import React from 'react';
import {
    TouchableHighlight,
    View,
    FlatList,
    Text,
    StyleSheet,
    Platform,   
} from 'react-native';
import SuperView from '../../super/SuperView';
import Theme from '../../res/styles/Theme';
import ViewUtil from '../../util/ViewUtil';
import Util from '../../util/Util';
import CommonService from '../../service/CommonService';
import CustomText from '../../custom/CustomText';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { connect } from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';
import SearchInput from '../../custom/SearchInput';

class DownInvoiceListScreen extends SuperView {
    constructor(props) {
        super(props);
        this._navigationHeaderView = {
            title: 'Invoice'
        }
        this._tabBarBottomView = {
            bottomInset: true,
            bottomColor: 'white'
        }
        this.state = {
            ListData: [],
            isLoading: true,
            isNoMoreData: false,
            loadingMore: false,
            page: 1,
            customerInfo:{},
            userInfo: {},
            keyWord:'',//搜索
        }
    }

    componentDidMount() {
        this._loadInvoiceList();
    }

    _loadInvoiceList = () => {
        let model = {
            query:{
                InvoiceDateBegin:null,
                InvoiceDateEnd:null,
                CreateDateBegin:null,
                CreateDateEnd:null,
                OrderStatus:null,
                OrgOrderNos:null,
                Name:"",
                Category:0,
                SerialNumber:this.state.keyWord,
                EmployeeSerialNumber:null,
                Email:null,
                OrderId:0
            },
            pagination:{
                PageSize:20,
                PageIndex:this.state.page,
                OrderBy:null,
                OrderByAsc:false,
                TotalItem:1
            }
        }
        CommonService.OrderHubInvoiceList(model).then(response => {
            if (response && response.success && response.data) {
                    this.state.ListData = this.state.ListData.concat(response.data.ListData);
                    if (response.data.TotalRecorder <= this.state.ListData.length) {
                        this.state.isNoMoreData = true;
                    }
                    this.setState({
                        isLoading: false,
                        loadingMore: false
                    })
                } else {
                    this._detailError();
                    this.toastMsg(response.message || '获取数据失败');
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

    _rowClick = (item) => {
        let model = {
            OrderType:13,
            OrderId:item.OrderId,
            Language:Util.Parse.isChinese()?"zh-cn":"en-us",
            IsHotelRefund:false
        }
        this.showLoadingView();
        CommonService.OrderHubDownloadInvoice(model).then(response => {
            this.hideLoadingView();
            if (response && response.success && response.data) {
                    this.showAlertView('是否下载文件？', () => {
                        return ViewUtil.getAlertButton('取消', () => {
                            this.dismissAlertView();
                        }, '确定', () => {
                            this.dismissAlertView();
                            this._downLoad(response.data,item.InvoiceNumber)
                        })
                    })
                } else {
                    this.toastMsg(response.message || '获取数据失败');
                }
        }).catch(error => {
            this.toastMsg(error.message || '获取数据异常');
        })
       
    }

    _downLoad = (obj,number)=>{
        let data = new Date().getTime().toString();
        let DitPath = Platform.OS==='android'? RNFetchBlob.fs.dirs.DownloadDir: RNFetchBlob.fs.dirs.DocumentDir
        const path = DitPath+ "/"+number+'_'+data+'.pdf'
        RNFetchBlob.config({
          fileCache : true,
          path: path,
        }).fetch('GET', obj, {
          //some headers ..
        }).then((res) => {
            // the temp file path
            console.log('The file saved to ', res.path())
            this.showAlertView('下载成功,保存路径'+res.path(), () => {
            return ViewUtil.getAlertButton('确定', () => {
                this.dismissAlertView();
            })
          })
        })
    }
   
    _renderItem = ({ item, index }) => {
        return (
            <View underlayColor='transparent' >
                <View style={styles.row} >
                    <View style={{ flex: 1, marginVertical:10}}>
                        <View style={styles.styleItem}>
                            <CustomText text={'发票号'} />
                            <CustomText text={':'+item.InvoiceNumber} />
                        </View>
                        <View style={styles.styleItem}>
                            <CustomText text={'出行人'} />
                            <CustomText text={':'+item.PassengerName} />
                        </View>
                        <View style={styles.styleItem}>
                            <CustomText text={'出行日期'} />
                            <CustomText text={':'+Util.Date.toDate(item.DepDate).format('yyyy-MM-dd HH:mm')} />
                        </View>
                        </View>
                    <AntDesign name={'download'} size={24} onPress={this._rowClick.bind(this, item)}  style={{color:Theme.theme}}/>
                </View>
            </View>
        )
    }
    
    _submitEditing = () => {
        this.setState({
            isNoMoreData: false,
            page: 1,
            ListData: [],
            isLoading: true
        }, () => {
            this._loadInvoiceList();
        })
    }

    renderBody() {
        const { ListData, isLoading, loadingMore, isNoMoreData, keyWord } = this.state;
        let placeholder = '订单编号';
        return (
            <View style={{ flex: 1 }}>
                <SearchInput placeholder={placeholder} value={keyWord} onChangeText={(text) => this.setState({ keyWord: text })} onSubmitEditing={this._submitEditing} />
                <FlatList style={{ flex: 1 }}
                    data={ListData}
                    renderItem={this._renderItem}
                    showsVerticalScrollIndicator={false}
                    refreshControl={ViewUtil.getRefreshControl(isLoading, () => {
                        this.setState({
                            isNoMoreData: false,
                            page: 1,
                            dataList: [],
                            isLoading: true
                        }, () => {
                            this._loadInvoiceList();
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
                                    this._loadInvoiceList();
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
            </View>
        )
    }
}
const getStateProps = state => ({
    customerInfo_userInfo: state.customerInfo_userInfo
})
export default connect(getStateProps)(DownInvoiceListScreen);

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        flex: 1,
        borderBottomColor: Theme.lineColor,
        borderBottomWidth: 1,
        backgroundColor: 'white',
        alignItems: 'center',
        paddingHorizontal: 10
    },
    styleItem: {
        flexDirection:'row', 
        marginLeft: 10, 
        marginRight: 10, 
        flex: 1,
        paddingVertical:5, 
    }
})