import React from 'react';
import {
    TouchableHighlight,
    View,
    FlatList,
    StyleSheet,
    DeviceEventEmitter,
    TouchableOpacity,
    Image,
    Text 
} from 'react-native';
import SuperView from '../../super/SuperView';
import Theme from '../../res/styles/Theme';
import ViewUtil from '../../util/ViewUtil';
import CommonService from '../../service/CommonService';
import CustomText from '../../custom/CustomText';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { connect } from 'react-redux';
class TaverlerCreditCardScreen extends SuperView {
    constructor(props) {
        super(props);
        this.params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};
        this._navigationHeaderView = {
            title: '信用卡',
            // rightButton:this.params.hotel? null : this._rightHeaderView()
        }
        this.state = {
            ListData: [],
            showErrorMessage: '',
            listArray : [
                {
                    CardType:'VI',
                    img: require('../../res/image/visaicon.png'),                
                },
                {
                    CardType: 'MC',
                    img: require('../../res/image/mastericon.png'),
                },
                {
                    CardType: 'JC',
                    img: require('../../res/image/jcb-logo.png'),
                },
                {
                    CardType: 'AX',
                    img: require('../../res/image/amexicon.png'),
                },
                {
                    CardType: 'DC',
                    img: require('../../res/image/dinnersclubicon.png'),
                },
                {
                    CardType: 'UP',
                    img: require('../../res/image/chinaunionpay.png'),
                },
                {
                    CardType: 'DS',
                    img: require('../../res/image/discovericon.png'),
                }
            ]
        }
    }

    _rightHeaderView = () => {
        return (
          <TouchableHighlight underlayColor='transparent' onPress={this._toSettting}>
            <AntDesign name={'pluscircleo'} color={Theme.theme} size={26} style={{ paddingRight: 16 }} />
          </TouchableHighlight>
        )
    }

    _toSettting = () => {
        this.push('AddCreditCardScreen',{cardFrom:'handerCredit',Id:this.params.Id});
    }

    componentDidMount() {
        this.backFromShopListener = DeviceEventEmitter.addListener(
            'handerCardRefresh',  //监听器名
            () => {
                this._loadCardList(); 
            },
        );
        this._loadCardList();
    }

    _loadCardList = () => {
        let model = {
            EmployeeId: this.params.Id
        }
        CommonService.HandShakeGetCreditCardList(model).then(response => {
            if (response && response.success ) {
                    this.setState({
                        isLoading: false,
                        loadingMore: false,
                        ListData: response.data
                    })
                    if(!response.data){
                        this.setState({
                            showErrorMessage: '未找到维护的信用卡'
                        })
                    }
                } else {
                    this.toastMsg('未找到维护的信用卡');
                    this.setState({
                        showErrorMessage: response.message || '未找到维护的信用卡'
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

    _rowClick = (item) => {
        this.showAlertView('确定删除？', () => {
            return ViewUtil.getAlertButton('取消', () => {
                this.dismissAlertView();
            }, '确定', () => {
                this.dismissAlertView();
                this._deleteClick(item)
            })
        })
    }

    /**
     * 编辑信用卡
     * @param {信用卡} item 
     */
    _rowEditClick = (item)=>{
        this.push('AddCreditCardScreen',{
            editcredit:item,
            cardFrom:'handerCredit',
            Id:this.params.Id
        })
    }

    _deleteClick = (obj)=>{
        let model = {
            Id:obj.Id,
            EmployeeId:this.params.Id
        }
        this.showLoadingView();
        CommonService.HandShakeDeleteCreditCard(model).then(response => {
            this.hideLoadingView();
            if (response && response.success && response.data) {
                  this.toastMsg('删除成功');
                  this._loadCardList();
                } else {
                  this.toastMsg(response.message);
                }
        }).catch(error => {
            this.toastMsg(error.message || '获取数据异常');
        })
    }

    _renderError = () => {
        const { showErrorMessage } = this.state;
        return (
            <View style={{ flex: 1 }}>
                {
                    showErrorMessage === '网络超时，请检查您的网络' || showErrorMessage === 'Network request failed' ?
                        <NetworkFaildView refresh={this._refreshPage} /> :
                        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                            <CustomText style={{ color: 'gray' }} text={showErrorMessage || '未找到维护的信用卡'} />
                        </View>
                }
            </View>
        )
    }
   
    _renderItem = ({ item, index }) => {
        const { callBackCard } = this.params
        const { listArray } = this.state;
        return (
            <View underlayColor='transparent' >
                <TouchableOpacity style={styles.row} disabled={this.params.hotel?false:true} onPress={()=>{
                     callBackCard(item);
                     this.pop();
                }} >
                    {
                        listArray.map((itemP)=>{
                            if(itemP.CardType ==item.CardType){
                                return <Image style={{height:40, width:100, resizeMode:'contain'}} source={itemP.img} />
                            }
                        })
                    }
                    <View style={{ flex: 1, marginVertical:10}}>
                        <View style={styles.styleItem}>
                            <CustomText text={'信用卡号'} />
                            <CustomText text={': '+item.CardNo} />
                        </View>
                        <View style={styles.styleItem}>
                            <CustomText text={'信用卡类型'} />
                            <CustomText text={': '+item.CardType} />
                        </View>
                        <View style={styles.styleItem}>
                            <CustomText text={'有效期'} />
                            <CustomText text={': '+item.Expire} />
                        </View>
                        </View>
                    {this.params.hotel? null :
                    <AntDesign name={'edit'} size={20} onPress={this._rowEditClick.bind(this, item)} style={{color:Theme.theme,marginRight:10}}/>}

                    {this.params.hotel ? null :
                    <AntDesign name={'delete'} size={20} onPress={this._rowClick.bind(this, item)}  style={{color:Theme.theme}}/>}
                </TouchableOpacity>
            </View>
        )
    }

    renderBody() {
        const { ListData, isLoading, loadingMore, isNoMoreData, showErrorMessage } = this.state;
        let markStr="在个人信用卡中维护信用卡信息即认为您认知并同意如下事宜:"
        let markStr2="我们收集您的信用卡号、信用卡到期日等个人敏感信息仅用于实现您的酒店预定担保用途，维护在您的个人资料中的信用卡卡号、信用卡类型、信用卡到期日等数据按照支付卡行业数据安全标准（PCI-DSS）存储和传输。为了您的财产安全，请您妥善保管个人账号和密码，建议每三个月更换密码。如您对此有疑问，请联系我们。"
        return (
            <View style={{ flex: 1 }}>
                <View style={{ borderTopWidth:1, borderColor:Theme.lineColor,justifyContent:'center',alignItems:'center', padding:15,backgroundColor:Theme.yellowBg}}>
                    <Text>
                     <Text style={{flexDirection:'row',lineHeight:18}}>
                        <AntDesign name={'exclamationcircleo'} color={Theme.theme} backgroundColor={'yellow'} size={14}/> 
                        <CustomText text={' '} style={{fontSize:12, color:Theme.theme}}/>
                        <CustomText text={markStr} style={{fontSize:12, color:Theme.theme}}/>
                     </Text>
                     <CustomText text={markStr2} style={{fontSize:12, color:Theme.theme}}/>
                     </Text>
                </View>
               {!ListData && showErrorMessage?
                   this._renderError()
                :
                <FlatList 
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
                            this._loadCardList();
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
                                    this._loadCardList();
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
                {this.params.hotel?null :  ViewUtil.getThemeButton('添加信用卡',this._toSettting)}
            </View>
        )
    }
}
const getStateProps = state => ({
    // customerInfo_userInfo: state.customerInfo_userInfo
})
export default connect(getStateProps)(TaverlerCreditCardScreen);

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        flex: 1,
        borderBottomColor: Theme.lineColor,
        borderBottomWidth: 1,
        backgroundColor: 'white',
        alignItems: 'center',
        paddingHorizontal: 10,
        marginHorizontal:10,
        marginTop:10,
        borderRadius:6
    },
    styleItem: {
        flexDirection:'row', 
        marginLeft: 10, 
        marginRight: 10, 
        flex: 1,
        paddingVertical:5, 
    }
})