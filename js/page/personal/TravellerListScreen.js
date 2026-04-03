import React from 'react';
import {
    TouchableHighlight,
    View,
    FlatList,
    Text,
    StyleSheet
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
class TravellerListScreen extends SuperView {
    constructor(props) {
        super(props);
        this._navigationHeaderView = {
            title: '常用旅客'
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
        const { page } = this.state;
        let model = {
            query: {
                KeyWord: '',
            },
            pagination: {
                PageIndex: page,
                PageSize: 15
            }
        }
        CommonService.travellerList(model).then(response => {
            if (response && response.success) {
                if (response.data && response.data.ListData) {
                    this.state.dataList = this.state.dataList.concat(response.data.ListData);
                }
                if (response.data.TotalRecorder <= this.state.dataList.length) {
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
    _rowClick = (index) => {
        let obj = this.state.dataList[index];
        let customerInfo = this.props.customerInfo_userInfo.customerInfo;
        this.push('IntlFlightEditPassenger', {
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
            <TouchableHighlight underlayColor='transparent' onPress={this._rowClick.bind(this, index)}>
                <View style={styles.row} >
                    <View style={{  justifyContent: "center", flex: 1 }}>
                        <CustomText text={item.Name + (item.DepartmentName ? ('-' + item.DepartmentName) : '')}  style={{fontSize:14}}/>
                        <Text allowFontScaling={false} style={{ marginTop: 5 ,color:'gray'}}>{(item.CertificateType ? I18nUtil.translate(item.CertificateType) : I18nUtil.translate('身份证')) + ': ' + Util.Read.simpleReplace(item.CertificateNumber)}</Text>
                    </View>
                    <AntDesign name={'edit'} size={24}  style={{color:Theme.theme}}/>
                </View>
            </TouchableHighlight>
        )
    }
    renderBody() {
        const { dataList, isLoading, loadingMore, isNoMoreData } = this.state;
        return (
            <View style={{ flex: 1 }}>
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
                {
                    ViewUtil.getSubmitButton('新增乘客',this._addTraveller)
                }
            </View>
        )
    }
}
const getStateProps = state => ({
    customerInfo_userInfo: state.customerInfo_userInfo
})
export default connect(getStateProps)(TravellerListScreen);

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        flex: 1,
        borderBottomColor: Theme.lineColor,
        borderBottomWidth: 1,
        backgroundColor: 'white',
        alignItems: 'center',
        padding: 20,
        marginHorizontal:10,
        marginTop:10,
        borderRadius:6
    }
})