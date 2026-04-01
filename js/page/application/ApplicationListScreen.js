import React from 'react';
import {
    View,
    StyleSheet,
    TouchableHighlight,
    FlatList,
    DeviceEventEmitter,
    Image
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
import CommonService from '../../service/CommonService';
import Key from '../../res/styles/Key';
import CryptoJS from "react-native-crypto-js";//加密、解密
import TitleSwitchView from '../common/TitleSwitchView';


class ApplicationListScreen extends SuperView {
    constructor(props) {
        super(props);
        this._navigationHeaderView = {
            title: '申请单列表',
            // rightButton: ViewUtil.getRightButton("新申请", this._toCreateApply)
        }
        this._tabBarBottomView = {
            bottomInset: true
        }
        this.state = {
            dataList: [],
            page: 1,
            keyWord: '',
            isLoading: true,
            isLoadingMore: false,
            isNoMoreData: false,
            selectApply: null,
            options: ['国内机票', '港澳台及国际机票', '火车票', '国内酒店', '港澳台及国际酒店', '用车'],
            startCity:'',
            arrivalCity:'',
            EnableCreateTravelApply:true,
            Departure1:null,
            Destination1:null,
            J_index:0,
            customerInfo:null,
            basicSearchStatus:1,
        }
    }
   
    componentDidMount() {
        if (this.props.feeType === 2) {
            this.props.setFeeType(1);
        }
        this._loadList();
        this.pageEmit = DeviceEventEmitter.addListener('homeRefresh',(dic)=>{
            if (dic.homeRefresh) {
                this.setState({
                    page: 1,
                    isLoadingMore: false,
                    isNoMoreData: false,
                    isLoading: true,
                    dataList: []
                }, () => {
                    this._loadList();
                })
                return;
            }
         });
        UserInfoDao.getCustomerInfo().then(customerInfo => {
            if(customerInfo){
               this.setState({ customerInfo:customerInfo,})
            }
            if(!customerInfo|| !customerInfo.Setting || !customerInfo.Setting.EnableCreateTravelApply){
            this.setState({
                EnableCreateTravelApply:false,
            })
          }
        }) 
    }

    componentWillUnmount(){    
        this.pageEmit && this.pageEmit.remove();
    };

    _loadList = () => {
        let model = {
            Query: {
                Keyword: this.state.keyWord,
                BasicSearchStatus:this.state.basicSearchStatus,//1有效 0无效 -1 all
                IsOnlyCreate:false,
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
        data.TravellerList.map((item)=>{
            item.CertificateExpire = item.Certificate.Expire
            item.CertificateId = item.Certificate.Type
            item.CertificateType = item.Certificate.TypeDesc
            item.CertificateNumber = item.Certificate.SerialNumber
            item.IssueNationName = item.Certificate.IssueNationName
            item.IssueNationCode = item.Certificate.IssueNationCode
            item.NationalName = item.Certificate.NationalName
            item.NationalCode = item.Certificate.NationalCode
        })
        if(data&&data.Status===10){
            this.push('ApplicationChangeOrderScreen', {
                applyData: data,
                applyEmployees: data.TravellerList,
                ReferenceEmployeeId: data.ReferenceEmployee.Id
            }); 
        }else{
            this.push('ApplicationOrderDetail', {
                Id: data.Id
            });
        }      
    }

    //前往订单创建页
    _toCreateApply = () => {
        const {EnableCreateTravelApply } = this.state;
        EnableCreateTravelApply?
        this.push('ApplicationChooseTraveler'):
        this.toastMsg('不允许创建申请单');
        // this.props.navigation.navigate('ApplicationCreateOrder',{
        //     refresh:()=>{
        //      this._loadList();
        //     },
        // })
    }
    //分开写 写两个 _commonCity
    _commonCity1 = (item) =>{
        let model = {
            Keyword: item,
            Domestic:''
        }
        CommonService.CommonCity(model).then(response => {
            this.hideLoadingView();
            if (response && response.success) {
                if (response.data && response.data) {
                    response.data.map((obj)=>{
                        if(obj.Name == item.replace('市','') ){
                           this.setState({
                            Departure1:obj
                           })
                        }
                    })
                }
            } else {
                this.toastMsg(response.message || '获取数据失败');
            }
        }).catch(error => {
            this.hideLoadingView();
            this.toastMsg(error.message || '获取数据异常');
        })
    }
    _commonCity2 = (item) =>{
        let model = {
            Keyword: item,
            Domestic:''
        }
        CommonService.CommonCity(model).then(response => {
            this.hideLoadingView();
            if (response && response.success) {
                if (response.data && response.data) {
                    response.data.map((obj)=>{
                        if(obj.Name == item.replace('市','') ){
                            this.setState({
                                Destination1:obj
                            })
                        }
                    })
                }
            } else {
                this.toastMsg(response.message || '获取数据失败');
            }
        }).catch(error => {
            this.hideLoadingView();
            this.toastMsg(error.message || '获取数据异常');
        })
    }
    /**
     * 催审
     * @param {*} item 
     */
    _cuishenClick=(item)=>{
        let model ={
            ApplyId:item.Id,//综合订单id
         } 
         this.showLoadingView();
         CommonService.TravelApplyUrgeApproval(model).then(response => {
             this.hideLoadingView();
             if (response && response.success) {
                 this.toastMsg('催审成功');
             } else {
                 this.toastMsg(response.message);
             }
         }).catch(error => {
             this.hideLoadingView();
             this.toastMsg(error.message);
         })
     }
    /**
     * 撤回审批
     */
    _callBackApproval = (item) => {
        let model ={
            applyId:item.Id,//综合订单id
        } 
        this.showLoadingView();
        ApplicationService.TravelApplyWithdrawnApproval(model).then(response => {
            this.hideLoadingView();
            if (response && response.success) { 
                this.showAlertView('申请单已成功撤回。', () => {
                    return ViewUtil.getAlertButton('确定', () => {
                        this.dismissAlertView();
                        this.setState({
                            page: 1,
                            isLoadingMore: false,
                            isNoMoreData: false,
                            isLoading: true,
                            dataList: []
                        }, () => {
                            this._loadList();
                        })
                    })
                }); 
            } else {
                this.toastMsg(response.message);
            }
        }).catch(error => {
            this.hideLoadingView();
            this.toastMsg(error.message);
        })
    }
    /**
     * 点击预订按钮
     */
    _orderSelect = (data,index) => {
        if(!data){return}
        let model = {
           Id:data.Id,
           IsBook:true
        }
        if (this.state.keyWord.length > 0) {
            this.showLoadingView();
        }
        ApplicationService.travelApplyDetail(model).then(response => {
            this.hideLoadingView();
            if (response && response.success) {
                this.props.setApply(response.data);
            } else {
                this.props.setApply(data);
            }
        }).catch(error => {
            this.hideLoadingView();
            this.props.setApply(data);
        })
        
        let CategoryIntroArr=data.CategoryIntroCn.split('、');
        this.setState({
            selectApply: data,
            J_index:0,
            options: CategoryIntroArr,
        }, () => {
            this.actionSheet.show();
            if(data.JourneyList){
                let jList = data.JourneyList&&data.JourneyList[0]&&data.JourneyList[0]
                this._commonCity1(jList&&jList.Departure);
                this._commonCity2(jList&&jList.Destination);
            }else if(data.Destination){
                this._commonCity1(data.Destination.DepartureList[0].Name);
                this._commonCity2( data.Destination.DestinationList[0].Name);
            }
        })  
    }

    _orderSelect2 = (data,index,order) => {
        order.selectApplyItem = data
        order.TravellerList&&order.TravellerList.map((item)=>{
            let Certificate = item.Certificate
            item.CertificateType = Certificate.TypeDesc;
            item.CertificateId = Certificate.Type;
            item.CertificateNumber = Certificate.SerialNumber;
            item.CertificateExpire = Certificate.Expire;
            item.NationalName = Certificate.NationalName;
            item.NationalCode = Certificate.NationalCode;
            item.IssueNationName = Certificate.IssueNationName; 
            item.IssueNationCode = Certificate.IssueNationCode;
            item.Gender =  Certificate.Sex
        })
        if(!data){return}
        let CategoryIntroArr=data.CategoryIntroCn.split('、');
         data.TravellerList = order.TravellerList;
        this.props.setApply(order);
        this.setState({
            selectApply: order,
            J_index:index,
            options: CategoryIntroArr,
        }, () => {
            this.actionSheet.show();
            this._commonCity1(data.Departure);
            this._commonCity2(data.Destination);
        })  
    }

    _handlePress = (index) => {
        const { options,Departure1,Destination1,selectApply,J_index,customerInfo} = this.state;
        const { apply, compSwitch} = this.props;
        if (!apply) {
            this.toastMsg('未选择申请单');
            return;
        }
        let cityList = [Departure1,Destination1];
        let item = options[index];
        let BeginTime;
        let EndTime;
        if(selectApply.JourneyList){
            let jList = selectApply.JourneyList&&selectApply.JourneyList[J_index]&&selectApply.JourneyList[J_index]
            BeginTime = jList.BeginTime
            EndTime = jList.EndTime
        }else if(selectApply.Destination){
            let dList = selectApply.Destination
            BeginTime = dList.BeginTime
            EndTime = dList.EndTime
        }
        let IsJourneyType = customerInfo&&customerInfo.Setting.FlightTravelApplyConfig.IsJourneyType

        // 修正拼写错误并定义配置映射
            const eventConfigMap = {
                '国内机票': { selectTap: 1, categoryId: 1, hasJourneyType: true },
                'Domestic Air Ticket': { selectTap: 1, categoryId: 1, hasJourneyType: true },
                '国内酒店': { selectTap: 4, categoryId: 4, isIntl: false },
                'Domestic Hotel': { selectTap: 4, categoryId: 4, isIntl: false },
                '港澳台及国际机票': { selectTap: 7, categoryId: 8, hasJourneyType: true },
                'International Air Ticket': { selectTap: 7, categoryId: 8, hasJourneyType: true },
                '港澳台及国际酒店': { selectTap: 6, categoryId: 16, isIntl: true },
                'Overseas Hotel': { selectTap: 6, categoryId: 16, isIntl: true },
                '火车票': { selectTap: 5, categoryId: 2 },
                'Train Ticket': { selectTap: 5, categoryId: 2 },
            };
            
            const handleItemSelection = (item) => {
                const config = eventConfigMap[item];
                
                if (config) {
                // 构造事件参数
                const eventParams = {
                    cityList,
                    BeginTime,
                    EndTime,
                    ...(config.hasJourneyType && { IsJourneyType }), // 动态添加行程类型
                    ...(config.isIntl !== undefined && { isIntl: config.isIntl }), // 处理国际化标识
                    selectTap: config.selectTap,
                    categoryId: config.categoryId,
                    customerInfo,
                    apply
                };
            
                // 触发事件并跳转页面
                DeviceEventEmitter.emit('refreshHomeCreate', eventParams);
                NavigationUtils.popToTop(this.props.navigation);
                } else if (item === '用车' || item === 'Car Booking') {
                // 特殊处理用车类型
                this.toastMsg('您的申请单类目不支持预订用车');
                }
            };
            
            // 使用示例
            handleItemSelection(item);
        
        // if(item==='国内机票' || item==='Domestic Air Ticket'){
        //     DeviceEventEmitter.emit('refreshHomeCreate', {cityList:cityList,BeginTime:BeginTime,EndTime:EndTime,IsJourneyType:IsJourneyType,selectTap:1,categoryId:1,customerInfo,apply});
        //     this.push('Home',{})
        // }else if (item==='国内酒店'|| item==='Domestic Hotel'){
        //     DeviceEventEmitter.emit('refreshHomeCreate', {isIntl: false, cityList:cityList,BeginTime:BeginTime,EndTime:EndTime,selectTap:4,categoryId:4,customerInfo,apply})
        //     this.push('Home',{})
        // }else if (item==='港澳台及国际机票'|| item==='International Air Tikect'){
        //     DeviceEventEmitter.emit('refreshHomeCreate', {cityList:cityList,BeginTime:BeginTime,EndTime:EndTime,IsJourneyType:IsJourneyType,selectTap:7,categoryId:8,customerInfo,apply})
        //     this.push('Home',{})
        // }else if (item==='港澳台及国际酒店'|| item==='Overseas Hotel'){
        //     DeviceEventEmitter.emit('refreshHomeCreate', {isIntl: true, cityList:cityList,BeginTime:BeginTime,EndTime:EndTime,selectTap:6,categoryId:16,customerInfo,apply})
        //     this.push('Home',{})
        // }else if (item==='火车票'|| item==='Train Ticket'){
        //     DeviceEventEmitter.emit('refreshHomeCreate', {cityList:cityList,BeginTime:BeginTime,EndTime:EndTime,selectTap:5,categoryId:2,customerInfo,apply})
        //     this.push('Home',{})
        // }else if (item==='用车'|| item==='Car Booking'){
        //     this.toastMsg('您的申请单类目不支持预订用车');
        // }
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
    _searchOrder = () => {
        this.setState({
            page: 1,
            isLoadingMore: false,
            isNoMoreData: false,
            isLoading: true,
            dataList: []
        }, () => {
            this._loadList();
        })
    }
    /**
     *  切换按钮
     */
    _switchBtnCLick = (index) => {
        if (this.state.basicSearchStatus === index) return;
        this.setState({
            page: 1,
            isLoadingMore: false,
            isNoMoreData: false,
            isLoading: true,
            dataList: [],
            basicSearchStatus: index===2?0:1,  
        }, () => {
            this._loadList();
        })
    }

    renderBody() {
        const { dataList, isLoading, isLoadingMore, isNoMoreData, options, keyWord } = this.state;
        return (
            <View style={{ flex: 1 }}>
                <TitleSwitchView leftTitle='有效申请单' rightTitle='无效申请单' callBack={this._switchBtnCLick} />
                <View style={{ flex: 1 }}>
                    <SearchInput placeholder='乘客姓名/入住人姓名/订单号' onSubmitEditing={this._searchOrder} value={keyWord} onChangeText={text => this.setState({ keyWord: text })} />
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
                    {ViewUtil.getThemeButton("新申请", this._toCreateApply)}
                </View>
            </View>
        )
    }
    _orderCancel = (data) => {
        let model = {
            Id:data.Id,
        }
        this.showLoadingView();
        ApplicationService.TravelApplyCancel(model).then(response => {
            this.hideLoadingView();
            if (response && response.success) {
                this.toastMsg('取消成功');
            } else {
                this.toastMsg(response.message || '取消失败');
            }
        }).catch(error => {
            this.hideLoadingView();
        })
    }
    _renderItem = ({ item: data, index }) => {
        const {customerInfo_userInfo} = this.props;
        let isBook;
        if(data.CustomerEmployee.Id ===customerInfo_userInfo.userInfo.Id){
            isBook=true
        }
        return (
            <TouchableHighlight underlayColor='transparent' onPress={this._toOrderDetail.bind(this, data)}>
                <View style={{ backgroundColor: 'white', marginTop: 10 ,marginHorizontal:10, borderRadius:6}}>
                    <View style={{ paddingHorizontal:20, paddingVertical:10}}>
                       
                        {
                            data.TravelApplyMode==1?
                                <View style={{  marginLeft: 0, flex: 1 }}>
                                    { !(data.JourneyList&&data.JourneyList.length>1)?                                        
                                        <View>
                                            {/* <View style={{ flexDirection: "row", }}>
                                                <CustomText numberOfLines={1} text={Util.Parse.isChinese()? data.JourneyIntro : data.JourneyList&&data.JourneyIntroEn} style={{ flex: 1, marginRight: 20, fontSize: 14 }} />
                                                <CustomText style={{ color: 'gray' }} text={data.StatusDesc} />
                                            </View> */}
                                             <View style={{flexDirection:'row',justifyContent: "space-between",borderBottomWidth:1,borderColor:Theme.lineColor,paddingVertical:10}}>
                                                    <View>
                                                        <View style={{flexDirection:'row'}}>
                                                            <Image source={ require('../../res/Uimage/bag.png')} style={{ width: 18, height: 18 }}></Image>
                                                            <CustomText style={{ color: Theme.commonFontColor,marginLeft:8 }} text={data.SerialNumber} />
                                                        </View>
                                                        {data.ExternalCode&&<View style={{flexDirection:'row',marginTop:5}}>
                                                            <CustomText style={{ color: Theme.commonFontColor}} text={"外部出差单号："} />
                                                            <CustomText style={{ color: Theme.fontColor}} text={data.ExternalCode} />
                                                        </View>}
                                                    </View>
                                                    <CustomText style={{ color: Theme.theme }} text={data.StatusDesc} />
                                            </View>
                                            <View style={{ flexDirection: "row",marginTop:10,flexWrap:'wrap',width:global.screenWidth-60 }}>
                                                <CustomText numberOfLines={1} text={data.JourneyList&&data.JourneyList[0].Departure} style={{ fontSize:15, fontWeight:'bold' }} />
                                                <CustomText numberOfLines={1} text={'-'} style={{fontSize:15, fontWeight:'bold' }} />
                                                <CustomText numberOfLines={1} text={data.JourneyList&&data.JourneyList[0].Destination} style={{fontSize:15, fontWeight:'bold' }} />
                                            </View>
                                            <View style={{ flexDirection: "row", marginTop: 6 }}>
                                                <CustomText 
                                                    numberOfLines={1} 
                                                    text={formatDate(data.JourneyList?.[0]?.BeginTime)} 
                                                    style={{color: Theme.commonFontColor}} 
                                                />
                                                <CustomText 
                                                    numberOfLines={1} 
                                                    text={' 至 '} 
                                                    style={{color: Theme.commonFontColor}} 
                                                />
                                                <CustomText 
                                                    numberOfLines={1} 
                                                    text={formatDate(data.JourneyList?.[0]?.EndTime)} 
                                                    style={{color: Theme.commonFontColor}} 
                                                />
                                            </View>
                                            <View style={{ flexDirection: "row-reverse", marginTop: 10,borderTopWidth:1,borderColor:Theme.lineColor,alignItems:'center',paddingTop:10 }}>
                                                {/* <CustomText text={data.TravellerIntro} style={{ color: 'gray', flex: 1, marginRight: 5, }} /> */}
                                                {
                                                 (data.Status === 1 && isBook) ? 
                                                    <View style={{flexDirection:'row'}}>
                                                        <TouchableHighlight underlayColor='transparent' onPress={this._orderCancel.bind(this, data)}>
                                                            <View style={styles.btn2}>
                                                                <CustomText text='取消' style={{ color: Theme.theme }} />
                                                            </View>
                                                        </TouchableHighlight>
                                                        <TouchableHighlight underlayColor='transparent' onPress={this._orderSelect.bind(this, data)}>
                                                            <View style={styles.btn}>
                                                                <CustomText text='预订' style={{ color: 'white' }} />
                                                            </View>
                                                        </TouchableHighlight>
                                                    </View>  
                                                  : null
                                                }
                                                
                                                {
                                                     data.Status === 7 ? 
                                                     <View style={{flexDirection:'row'}}>
                                                     <TouchableHighlight underlayColor='transparent' onPress={this._cuishenClick.bind(this,data)} style={{marginLeft:10}}>
                                                          <View style={styles.btn2}>
                                                              <CustomText text='催审' style={{ color:Theme.theme }} />
                                                          </View>
                                                      </TouchableHighlight> 
                                                     <TouchableHighlight underlayColor='transparent' onPress={this._callBackApproval.bind(this, data)}>
                                                        <View style={styles.btn}>
                                                            <CustomText text='撤回审批' style={{ color: 'white' }} />
                                                        </View>
                                                    </TouchableHighlight> 
                                                    </View>
                                                    : null
                                                }
                                            </View>
                                        </View>
                                        :
                                        <View>
                                            <View style={{flexDirection:'row',justifyContent: "space-between",borderBottomWidth:1,borderColor:Theme.lineColor,paddingVertical:10}}>
                                                    <View>
                                                        <View style={{flexDirection:'row'}}>
                                                            <Image source={ require('../../res/Uimage/bag.png')} style={{ width: 18, height: 18 }}></Image>
                                                            <CustomText style={{ color: Theme.commonFontColor,marginLeft:8 }} text={data.SerialNumber} />
                                                        </View>
                                                        {data.ExternalCode&&<View style={{flexDirection:'row',marginTop:5}}>
                                                            <CustomText style={{ color: Theme.commonFontColor}} text={"外部出差单号："} />
                                                            <CustomText style={{ color: Theme.fontColor}} text={data.ExternalCode} />
                                                        </View>}
                                                    </View>
                                                    {
                                                        <View style={{flexDirection:'row'}}>
                                                            <CustomText style={{ color: Theme.theme }} text={data.StatusDesc} />
                                                            { 
                                                                (data.Status === 1 && isBook) ? 
                                                                <TouchableHighlight underlayColor='transparent' onPress={this._orderCancel.bind(this, data)}>
                                                                    <View style={[styles.btn2,{marginLeft:10}]}>
                                                                        <CustomText text='取消' style={{ color: Theme.theme }} />
                                                                    </View>
                                                                </TouchableHighlight>:null
                                                            }
                                                            
                                                        </View>
                                                    }
                                            </View>
                                            {data.JourneyList.map((item,index)=>{
                                                return (
                                                    <TouchableHighlight key={index} underlayColor='transparent' style={{borderBottomWidth:1,borderBottomColor:Theme.lineColor}} onPress={this._toOrderDetail.bind(this, data)}>
                                                        <View style={{ backgroundColor: '#fff', }}>
                                                            <View style={{ flexDirection: 'row' }}>
                                                                <View style={{  marginLeft: 0, flex: 1 ,marginTop:5}}>
                                                                    <View style={{  }}>
                                                                        {/* <CustomText numberOfLines={1} text={item.JourneyIntro} style={{ flex: 1, marginRight: 5, fontSize: 14 }} />
                                                                        <CustomText style={{ color: 'gray' }} text={data.StatusDesc} /> */}
                                                                         <View style={{ flexDirection: "row",marginTop: 10 }}>
                                                                            <CustomText numberOfLines={1} text={item.Departure} style={{ fontSize:15, fontWeight:'bold' }} />
                                                                            <CustomText numberOfLines={1} text={'-'} style={{ fontSize:15, fontWeight:'bold' }} />
                                                                            <CustomText numberOfLines={1} text={item.Destination} style={{fontSize:15, fontWeight:'bold'  }} />
                                                                            </View>
                                                                            <View style={{ flexDirection: "row",marginTop: 6 }}>
                                                                                <CustomText numberOfLines={1} text={item.BeginTime ? Util.Date.toDate(item.BeginTime).format('yyyy-MM-dd') : '-'} style={{color: Theme.commonFontColor}} />
                                                                                { item.EndTime ? <CustomText numberOfLines={1} text={' 至 '} style={{color: Theme.commonFontColor}} /> : null }
                                                                                <CustomText numberOfLines={1} text={item.EndTime ? Util.Date.toDate(item.EndTime).format('yyyy-MM-dd') : ' '} style={{color: Theme.commonFontColor}} />
                                                                            </View>
                                                                    </View>
                                                                    <CustomText text={data.TravellerIntro} style={{ color: Theme.assistFontColor, flex: 1, marginTop: 6, }} />
                                                                    <View style={{ flexDirection: "row-reverse", marginTop: 10,borderTopWidth:1,borderColor:Theme.lineColor,alignItems:'center',paddingTop:10 }}>
                                                                        {
                                                                            (data.Status === 1 && isBook) ? 
                                                                                <View style={{flexDirection:'row'}}>
                                                                                <TouchableHighlight underlayColor='transparent' onPress={this._orderSelect2.bind(this, item,index,data)}>
                                                                                    <View style={styles.btn3}>
                                                                                        <CustomText text='预订' style={{ color: 'white' }} />
                                                                                    </View>
                                                                                </TouchableHighlight>
                                                                                </View> 
                                                                            : null
                                                                        }
                                                                    </View>
                                                                </View>
                                                            </View>
                                                        </View>
                                                    </TouchableHighlight>
                                                )
                                            })}
                                            <View style={{ flexDirection: 'row-reverse' }}>
                                            {
                                                data.Status === 7 ?
                                                <View style={{flexDirection:'row'}}>
                                                    <TouchableHighlight underlayColor='transparent' onPress={this._cuishenClick.bind(this,data)} style={{marginLeft:10}}>
                                                        <View style={styles.btn}>
                                                            <CustomText text='催审' style={{ color: 'white' }} />
                                                        </View>
                                                    </TouchableHighlight> 
                                                    <TouchableHighlight underlayColor='transparent' onPress={this._callBackApproval.bind(this, data)}>
                                                        <View style={styles.btn2}>
                                                            <CustomText text='撤回审批' style={{ color: Theme.theme }} />
                                                        </View>
                                                    </TouchableHighlight> 
                                                </View>
                                                : null
                                            }
                                            </View>
                                        </View>
                                    }
                                    
                               </View>
                            :
                            <View style={{ marginLeft: 0, flex: 1 }}>
                                    <View style={{flexDirection:'row',justifyContent: "space-between",borderBottomWidth:1,borderColor:Theme.lineColor,paddingVertical:10}}>
                                                    <View>
                                                        <View style={{flexDirection:'row'}}>
                                                            <Image source={ require('../../res/Uimage/bag.png')} style={{ width: 18, height: 18 }}></Image>
                                                            <CustomText style={{ color: Theme.commonFontColor,marginLeft:8 }} text={data.SerialNumber} />
                                                        </View>
                                                        {data.ExternalCode&&<View style={{flexDirection:'row',marginTop:5}}>
                                                            <CustomText style={{ color: Theme.commonFontColor}} text={"外部出差单号："} />
                                                            <CustomText style={{ color: Theme.fontColor}} text={data.ExternalCode} />
                                                        </View>}
                                                    </View>
                                                    <CustomText style={{ color: Theme.theme }} text={data.StatusDesc} />
                                            </View>
                                    <View style={{ }}>
                                        {/* <CustomText numberOfLines={1} text={data.JourneyIntro&&data.JourneyIntro} style={{ flex: 1, marginRight: 20, fontSize: 14 }} /> */}
                                        <View style={{ flexDirection: "row",marginTop:10,flexWrap:'wrap',width:global.screenWidth-60 }}>
                                        <CustomText numberOfLines={1} text={data.Destination&&data.Destination.Departure} style={{ fontSize:15, fontWeight:'bold' }} />
                                        <CustomText numberOfLines={1} text={'-'} style={{fontSize:15, fontWeight:'bold' }} />
                                        <CustomText numberOfLines={1} text={data.Destination&&data.Destination.Destination} style={{fontSize:15, fontWeight:'bold' }} />
                                        </View>
                                        <View style={{ flexDirection: "row", marginTop: 6 }}>
                                            <CustomText 
                                                numberOfLines={1} 
                                                text={formatDate(data.Destination?.BeginTime)} 
                                                style={{color: Theme.commonFontColor}} 
                                            />
                                            <CustomText 
                                                numberOfLines={1} 
                                                text={' 至 '} 
                                                style={{color: Theme.commonFontColor}} 
                                            />
                                            <CustomText 
                                                numberOfLines={1} 
                                                text={formatDate(data.Destination?.EndTime)} 
                                                style={{color: Theme.commonFontColor}} 
                                            />
                                        </View>
                                    </View>
                                    <CustomText text={data.TravellerIntro} style={{ color: Theme.assistFontColor, flex: 1, marginTop:6, }} />
                                    <View style={{ flexDirection: "row-reverse", marginTop: 10,borderTopWidth:1,borderColor:Theme.lineColor,alignItems:'center',paddingTop:10}}>
                                        
                                        { !isBook?null:
                                            data.JourneyList&&data.JourneyList.length>1?
                                                <TouchableHighlight underlayColor='transparent' onPress={()=>{this.push('ApplicationListMore',data)}}>
                                                    <View style={styles.btn2}>
                                                        <CustomText text='更多行程' style={{ color: Theme.theme }} />
                                                    </View>
                                                </TouchableHighlight>  
                                            : data.Status === 1 ? 
                                                <View style={{flexDirection:'row'}}>
                                                    <TouchableHighlight underlayColor='transparent' onPress={this._orderCancel.bind(this, data)}>
                                                        <View style={styles.btn2}>
                                                            <CustomText text='取消' style={{ color: Theme.theme }} />
                                                        </View>
                                                    </TouchableHighlight>
                                                    <TouchableHighlight underlayColor='transparent' onPress={this._orderSelect.bind(this, data)}>
                                                        <View style={styles.btn}>
                                                            <CustomText text='预订' style={{ color: 'white' }} />
                                                        </View>
                                                    </TouchableHighlight> 
                                                </View>
                                            : null
                                        }
                                        {
                                            data.Status === 7 ?
                                            <View style={{flexDirection:'row'}}>
                                                <TouchableHighlight underlayColor='transparent' onPress={this._cuishenClick.bind(this,data)} style={{marginLeft:10}}>
                                                     <View style={styles.btn2}>
                                                         <CustomText text='催审' style={{ color: Theme.theme }} />
                                                     </View>
                                                 </TouchableHighlight> 
                                                <TouchableHighlight underlayColor='transparent' onPress={this._callBackApproval.bind(this, data)}>
                                                    <View style={styles.btn}>
                                                        <CustomText text='撤回审批' style={{ color: 'white' }} />
                                                    </View>
                                                </TouchableHighlight>
                                            </View> 
                                            : null
                                        }
                                    </View>
                               </View>
                        }
                        
                    </View>
                    {/* {data.ExternalCode&&<CustomText style={{ marginLeft:15,marginBottom:8 }} text={'('+data.ExternalCode+')'} />} */}
                </View>
            </TouchableHighlight>
        )
    }
}
const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = Util.Date.toDate(dateString);
    return date ? date.format('yyyy-MM-dd') : '-';
};

const getProps = (state) => ({
    apply: state.apply.apply,
    feeType: state.feeType.feeType,
    compSwitch:state.compSwitch.bool,
    customerInfo_userInfo: state.customerInfo_userInfo,
});
const getActions = dispatch => ({
    setApply: (value) => dispatch(Action.applySet(value)),
    setFeeType: (value) => dispatch(Action.feeTypeTransform(value))
})
export default connect(getProps, getActions)(ApplicationListScreen)

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
    btn3: {
        backgroundColor: Theme.theme,
        height: 22,
        marginLeft: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius:2,
        paddingHorizontal:15, 
        marginBottom:10      
    },
})