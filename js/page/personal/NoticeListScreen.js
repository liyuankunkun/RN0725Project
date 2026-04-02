import React from 'react';
import {
    TouchableOpacity,
    View,
    FlatList,
    StyleSheet,
    Image
} from 'react-native';
import SuperView from '../../super/SuperView';
import Theme from '../../res/styles/Theme';
import ViewUtil from '../../util/ViewUtil';
import CommonService from '../../service/CommonService';
import HTMLView from 'react-native-htmlview';
import CustomText from '../../custom/CustomText';
import Util from '../../util/Util';
import AntDesign from 'react-native-vector-icons/AntDesign';

export default class InvoiceRiseListScreen extends SuperView {
    constructor(props) {
        super(props);
        this.params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};
        this._navigationHeaderView = {
            title: '公告列表'
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
    }
    _loadData = () => {
        let model = {
            Pagination: {
                PageIndex: this.state.page,
                PageSize: 15
            }
        }
        CommonService.noticeList(model).then(response => {
            if (response) {
                if (response.ListData) {
                    this.state.dataList = this.state.dataList.concat(response.ListData);
                }
                if (response.TotalRecorder <= this.state.dataList.length) {
                    this.state.isNoMoreData = true;
                }
                this.setState({
                    isLoading: false,
                    isNoMoreData: true
                })
            } else {
                this.toastMsg(response.message || '获取数据失败');
                this._detailError();
            }
        }).catch(error => {
            this.toastMsg(error.message || '获取数据失败');
            this._detailError();
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
    _toOrder = (obj) => {
        let items ={
            value :obj.CategoryDesc+': '+obj.Title,
            content: obj.Content,
            title: obj.Title,
            LinkUrl:obj.LinkUrl
        }
        this.push('NoticeDetail', { item: items });
    }

    _renderItem = ({ item, index }) => {
        let IssueTime = Util.Date.toDate(item.IssueTime);
        return (
            <View underlayColor='transparent' style={styles.view}>
                <View style={{paddingTop:10,marginHorizontal:20,flexDirection:'row'}}>
                    <Image source={require('../../res/Uimage/notice.png')} style={{width:20,height:20}}/>
                    <CustomText text={item.Title} numberOfLines={1} style={{ fontWeight: 'bold',fontSize:16, color:Theme.fontColor,marginLeft:8,width:260}}/>
                </View>
                <View style={{marginHorizontal:20,paddingTop:10,paddingBottom:10, borderBottomWidth: 1, borderColor: Theme.normalBg}} >
                    <CustomText text={item.NoTagContent} numberOfLines={3} style={{lineHeight:25, color:Theme.commonFontColor}}/>                        
                </View>                
                {/* <HTMLView value={item.Content} style={{padding:15}}/>               */}
                <TouchableOpacity  onPress={this._toOrder.bind(this, item)}
                    style={{flexDirection:'row',justifyContent:'space-between',paddingHorizontal:20, paddingVertical:15}}>
                    <CustomText text={IssueTime.format('yyyy-MM-dd HH:mm')} style={{color:Theme.assistFontColor}}/>
                    <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
                    <CustomText text={IssueTime.format('查看详情')} style={{color:Theme.assistFontColor}}/>
                    <AntDesign name={'right'} size={14} color={Theme.assistFontColor} />  
                    </View>
                </TouchableOpacity>
            </View>
        )
    }
    renderBody() {
        const { dataList, isLoading, loadingMore, isNoMoreData } = this.state;
        return (
            <View style={{ flex: 1,  backgroundColor:Theme.normalBg}}>
                <FlatList
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
            </View>
        )
    }
}
const styles = StyleSheet.create({
    view: {
        backgroundColor: '#fff',
        marginHorizontal:10,
        marginTop:10,
        borderRadius:8
    }
})