import React from 'react';
import {
    View,
    StyleSheet,
    TouchableHighlight,
    TouchableOpacity,
    FlatList,
    DeviceEventEmitter,
    Platform,
    ActivityIndicator,
    Image
} from 'react-native';
import SearchInput from '../../custom/SearchInput';
import CustomText from '../../custom/CustomText';
import ViewUtil from '../../util/ViewUtil';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Octicons from 'react-native-vector-icons/Octicons'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Theme from '../../res/styles/Theme';
import ComprehensiveService from '../../service/ComprehensiveService';
import CustomActionSheet from '../../custom/CustomActionSheet';
import { connect } from 'react-redux';
import Action from '../../redux/action/index';
import UserInfoDao from '../../service/UserInfoDao';
import Util from '../../util/Util';
import  LinearGradient from 'react-native-linear-gradient';
// import { withNavigation } from 'react-navigation';
import { useNavigation } from '@react-navigation/native';
import NavigationUtils from '../../navigator/NavigationUtils';
import NoticeView from '../../page/home/view/NoticeView';
import Key from '../../res/styles/Key';
import CryptoJS from "react-native-crypto-js";//加密、解密
import UserInfoUtil from '../../util/UserInfoUtil';
import SuperView from '../../super/SuperView';
import AntDesign from 'react-native-vector-icons/AntDesign';
import ApplicationService from '../../service/ApplicationService';
import CommonService from '../../service/CommonService';
import LoadingView from '../../custom/LoadingView';
import ToastView from '../../custom/ToastView';
import Pop from 'rn-global-modal';
import I18nUtil from '../../util/I18nUtil';
import CompListItem from './CompListItem'

class ComprehensiveListScreen extends SuperView {
    constructor(props) {
        super(props);
        this.params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};
        this._navigationHeaderView = {
            title: '综合订单列表',
        }
        
        let category = [
            {
                Key:1,
                Value:'国内机票',
                image: require('../../res/Uimage/_flight.png'),
                hasAuth:Util.Encryption.clone(this.params.customerInfo.Addition.HasAirAuth)
            },
            {
                Key:2,
                Value:'火车票',
                image: require('../../res/Uimage/m_train.png'),
                hasAuth:Util.Encryption.clone(this.params.customerInfo.Addition.HasTrainAuth)
            },
            {
                Key:4,
                Value:'国内酒店',
                image: require('../../res/Uimage/m_hotel.png'),
                hasAuth:Util.Encryption.clone(this.params.customerInfo.Addition.HasHotelAuth)
            },
            {
                Key:8,
                Value:'港澳台及国际机票',
                image: require('../../res/Uimage/m_intFlight.png'),
                hasAuth:Util.Encryption.clone(this.params.customerInfo.Addition.HasInterAirAuth)
            },
            {
                Key:16,
                Value:'港澳台及国际酒店',
                image: require('../../res/Uimage/m_intHotel.png'),
                hasAuth:Util.Encryption.clone(this.params.customerInfo.Addition.HasInterHotelAuth)
            },
            // {
            //     Key:32,
            //     Value:'用车',
            //     hasAuth:Util.Encryption.clone(this.params.customerInfo.Addition.HasRentCarAuth)
            // },
        ]
        let listArray=[
            {
                Category: '1',
                name: '国内飞机',
                img: require('../../res/Uimage/plane.png'),
            },
            {
                Category: '4',
                name: '国内酒店',
                img: require('../../res/Uimage/hotel.png'),
            },
            {
                Category: '5',
                name: '火车',
                img: require('../../res/Uimage/train.png'),
            },
            {
                Category: '7',
                name: '国际飞机',
                img: require('../../res/Uimage/intPlane.png'),
            },
            {
                Category: '6',
                name: '国际酒店',
                img: require('../../res/Uimage/intHotel.png'),
            },
            {
                Category: '14',
                name: '其他',
                img: require('../../res/Uimage/other.png'),
            },
        ]
        let option=[];
        let optionList=[]
        category.map((item)=>{
            if(item.hasAuth){
                option.push(item.Value);
                optionList.push(item);
            }
        })

        this.state = {
            dataList: [],
            page: 1,
            keyWord: '',
            isLoading: true,
            isLoadingMore: false,
            isNoMoreData: false,
            options:option,
            optionList:optionList,
            startCity:'',
            arrivalCity:'',
            selectCompOrder:null,
            noApply:false,
            apply:null,
            goCityDisplay:null,
            arrivalCityDisplay:null,
            BeginTime:null,
            EndTime:null,
            goCityDisplay2:null,
            arrivalCityDisplay2:null,
            BeginTime2:null,
            EndTime2:null,
            listArray:listArray,
            
        }
    }
   
    componentDidMount() {
        this._loadList();
        this.backFromShopListener = DeviceEventEmitter.addListener(
            'BackRefreshList',  //监听器名
            () => {
              this.setState({
                page: 1,
                isLoadingMore: false,
                isNoMoreData: false,
                isLoading: true,
                dataList: [] 
              },()=>{
                this._loadList();
              })
            },
          );
    }
    componentWillUnmount(){    
        this.backFromShopListener && this.backFromShopListener.remove();
    };

    _loadList = () => {
        const {keyWord, dataList, isNoMoreData} = this.state;
        let model = {
            Query:{
                Keyword:keyWord,//"Planing:查询计划中的综合订单，为空则是查询所有的"
                QueryLabel:null
            },
            Pagination:{
                PageIndex:this.state.page,
                PageSize:5
            }
        }
        if (this.state.keyWord.length > 0 && this.state.page === 1) {
            this.showLoadingView();
        }
        ComprehensiveService.MassOrderList(model).then(response => {  
            this.hideLoadingView();
            if (response && response.success && response.data) {
                if ( response.data.ListData) {
                    this.setState({
                        dataList: dataList.concat(response.data.ListData),
                    },()=>{
                        if(this.state.page<2){
                            this.setState({
                                page: 2,
                                isLoadingMore: false,
                                isNoMoreData: false,
                                isLoading: true,
                            }, () => {
                                this._loadList();
                            })
                        }
                    })
                }

                if (response.data.TotalRecorder <= dataList.length) {
                    this.setState({
                        isNoMoreData: true,
                    })
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

    /**
     * 点击预订按钮
     */
    _orderSelect = (item) => {
        this.push('CompDetailScreen',{orderId:item.Id,fromList:true,optionList:this.state.optionList,options:this.state.options});
    }
    _orderContinu=(item)=>{
        let model = {
            OrderId:item.Id
        }
        this.showLoadingView()
        ComprehensiveService.MassOrderDetail(model).then(response => { 
        this.hideLoadingView()  
            if (response && response.success && response.data) {
                this.props.setApply();
                if(response.data.ApplyId==0){
                    this.setState({
                        noApply:true,
                    },()=>{
                        this.actionSheet.show();
                    })
                }else{
                    this._travelApplyDetail(response.data.ApplyId);
                }
                this.setState({
                    selectCompOrder:response.data,
                })
            }
        }).catch(error => {
            this.hideLoadingView()  
            this.toastMsg(error.message || '加载数据失败请重试');
        })
    }

    _travelApplyDetail=(item)=>{
        let model = {
            Id: item
        }
        ApplicationService.travelApplyDetail(model).then(response => {
            if (response && response.success) {
                this.props.setApply(response.data);
                let option = (response.data.CategoryIntro || '').split('、')
                let optionlist = []
                this.state.optionList.map((item)=>{
                    if(option.includes(item.Value)){
                        optionlist.push(item);
                    }
                })
                this.setState({
                    options:option,
                    optionList:optionlist,
                },()=>{
                    this.actionSheet.show();
                })
                if(response.data.Destination&&response.data.Destination.DepartureList&&response.data.Destination.DepartureList.length>0){
                        this.setState({
                            BeginTime:response.data.Destination.BeginTime,
                            EndTime:response.data.Destination.EndTime,
                            noApply:false,
                            apply:response.data
                        },()=>{
                            this._commonCity1(response.data.Destination.DepartureList[0].Name);
                            this._commonCity2(response.data.Destination.DestinationList[0].Name);
                        })
                    }else if(response.data.JourneyList){
                        let GuojiList = []
                        let GuoNeiList = []
                        response.data.JourneyList.map((item)=>{
                            if((item.BusinessCategory&16 != 0) || (item.BusinessCategory&8 != 0)){
                                GuoNeiList.push(item);
                            }else{
                                GuojiList.push(item);
                            }
                        })
                        this.setState({
                            BeginTime:GuoNeiList[0] && GuoNeiList[0].BeginTime,
                            EndTime:GuoNeiList[0] && GuoNeiList[0].EndTime,
                            BeginTime2:GuojiList[0] && GuojiList[0].BeginTime,
                            EndTime2:GuojiList[0] && GuojiList[0].EndTime,
                            noApply:false,
                            apply:response.data
                        },()=>{
                            // let jList = response.data.JourneyList&&response.data.JourneyList[0]&&response.data.JourneyList[0]
                            let JList =GuojiList&&GuojiList[0]
                            let NList =GuoNeiList&&GuoNeiList[0] 
                            this._commonCity1(JList&&JList.Departure,1);
                            this._commonCity2(JList&&JList.Destination,1);
                            this._commonCity1(NList&&NList.Departure,0);
                            this._commonCity2(NList&&NList.Destination,0);
                        })
                    }
            } else {
                this.toastMsg(response.message || '获取数据失败');
            }
        }).catch(error => {
            this.toastMsg(error.message || '获取数据异常');
        })
    }

    //分开写 写两个 _commonCity
    _commonCity1 = (item,index) =>{
        let model = {
            Keyword: item,
            Domestic:''
        }
        CommonService.CommonCity(model).then(response => {
            if (response && response.success) {
                if (response.data && response.data) {
                    response.data.map((obj)=>{
                        if(obj.Name == item.replace('市','') ){
                           if(index==0){
                              this.setState({
                                goCityDisplay:obj
                               })
                           }else{
                                this.setState({
                                goCityDisplay2:obj
                               })
                           } 
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
    _commonCity2 = (item,index) =>{
        let model = {
            Keyword: item,
            Domestic:''
        }
        CommonService.CommonCity(model).then(response => {
            if (response && response.success) {
                if (response.data && response.data) {
                    response.data.map((obj)=>{
                        if(obj.Name == item.replace('市','') ){
                            if(index==0){
                                this.setState({
                                    arrivalCityDisplay:obj
                                })
                             }else{
                                  this.setState({
                                    arrivalCityDisplay2:obj
                                })
                             } 
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
    _handleCityQuery = (cityName, type, index) => {
        const model = {
            Keyword: cityName.replace('市', ''),
            Domestic: ''
        };
    
        CommonService.CommonCity(model)
            .then(response => {
                if (response?.success) {
                    const targetCity = response.data.find(obj => obj.Name === cityName.replace('市', ''));
                    if (targetCity) {
                        this.setState({
                            [`${type}CityDisplay${index > 0 ? index + 1 : ''}`]: targetCity
                        });
                    }
                } else {
                    this.toastMsg(response?.message || '获取数据失败');
                }
            })
            .catch(error => {
                this.hideLoadingView();
                this.toastMsg(error.message || '获取数据异常');
            });
    }

    _findTravellersInOrder = (item)=>{
        const {selectCompOrder} = this.state;
          if(selectCompOrder.OrderItems){
              let orderItem =  selectCompOrder.OrderItems.find(obj=>obj.CategoryDesc == item);
                if(orderItem && orderItem.InternalOrder && orderItem.InternalOrder.Travellers){
                    orderItem.InternalOrder.Travellers.forEach(obj=>{
                     let traveller =  selectCompOrder.Travellers.find(traveller=>{
                         return (obj.PassengerOrigin.Type==1 && (obj.PassengerOrigin.EmployeeId=== traveller.PassengerOrigin.EmployeeId)) || (obj.PassengerOrigin.Type==2 && (obj.PassengerOrigin.TravellerId=== traveller.PassengerOrigin.TravellerId))
                     });
                        if(traveller){
                            if((!traveller.Certificates || traveller.Certificates == 0) && obj.Certificate){
                                traveller.Certificates =  [obj.Certificate];
                            }
                        }
                })
          }
        }
            //点击继续预订时，先把当前综合订单的人Travellers存入redux
            const { setComp_travellers ,setComp_Id, onClickSure} = this.props;
            let compEmployees = []
            let compTraveler = []
            if(selectCompOrder.Travellers){
                selectCompOrder.Travellers.map((item)=>{
                    let user = UserInfoUtil.getCompUser(item);
                    if(item.PassengerOrigin.Type===1){
                        compEmployees.push(user);
                    }else{
                        compTraveler.push(user);
                }
             })
            }
            setComp_travellers(compEmployees,compTraveler,selectCompOrder);
    
            setComp_Id(selectCompOrder.Id)
    
            onClickSure(false)//点击继续预订时将判断是否是创建订单的值改为否

    }
 

    _handlePress = (index) => {
        const { options ,selectCompOrder,noApply,apply,goCityDisplay,arrivalCityDisplay,BeginTime,EndTime,goCityDisplay2,arrivalCityDisplay2} = this.state;
        let item = options[index];
        this._findTravellersInOrder(item);
        const {comp_userInfo,onLoadcomprehensiveData} = this.props;
        let employeesList = [];
        let travelersList = [];
        selectCompOrder.Travellers.map((item)=>{
           if(item.PassengerOrigin.Type == 1){
               employeesList.push(item);
           }else{
               travelersList.push(item);
           }
        })
        let IdModel = {
            ReferenceEmployeeId:selectCompOrder.ReferenceEmployeeId,
            ReferencePassengerId:selectCompOrder.ReferencePassengerId,
        }
        employeesList&&employeesList.map((item)=>{
            item.shareRoomSelect = false
        })
        travelersList&&travelersList.map((item)=>{
            item.shareRoomSelect = false
        })
        onLoadcomprehensiveData(comp_userInfo.userInfo,employeesList,travelersList,selectCompOrder.ProjectId,selectCompOrder.ReferenceEmployeeId,IdModel,selectCompOrder.ReferencePassengerId)
        let goCity=goCityDisplay;
        let arrivalCity=arrivalCityDisplay ;
        let bCategory;
        let beginTime = BeginTime;
        let endTime = EndTime;
        let cityList = [goCityDisplay,arrivalCityDisplay];
        let cityList2 = [goCityDisplay2,arrivalCityDisplay2];
        if(item==='国内机票'){
            if(goCityDisplay){
                goCity={
                    Code:goCityDisplay.IataCode,
                    Name:goCityDisplay.Name,
                    EnName:goCityDisplay.EnName,
                    Province:goCityDisplay.ProvinceName,
                    Letters:goCityDisplay.Letters,
                    Hot:goCityDisplay.Hot
                }
            }
            if(arrivalCityDisplay){
                arrivalCity = {
                    Code:arrivalCityDisplay.IataCode,
                    Name:arrivalCityDisplay.Name,
                    EnName:arrivalCityDisplay.EnName,
                    Province:arrivalCityDisplay.ProvinceName,
                    Letters:arrivalCityDisplay.Letters,
                    Hot:arrivalCityDisplay.Hot
                }
            }
            if(!(apply&&apply.BusinessCategory&1)){
                cityList = null;
                goCity=null;
                arrivalCity=null ;
                beginTime = null;
                endTime = null;
                bCategory=true
                this.props.setApply();
            }
            this.push('FlightSearchIndex',{selectItem:selectCompOrder,noApply,SerialNumber:apply&&apply.SerialNumber,goCityDisplay:goCity,arrivalCityDisplay:arrivalCity,bCategory,BeginTime:beginTime,EndTime:endTime});
        }else if (item==='国内酒店'){
            if(!(apply&&apply.BusinessCategory&4)){
                cityList = null;
                goCity=null;
                arrivalCity=null ;
                beginTime = null;
                endTime = null;
                bCategory=true
                this.props.setApply();
            }
            this.push('HotelSearchIndex', { isIntl: false,noApply ,SerialNumber:apply&&apply.SerialNumber,cityList:cityList,goCityDisplay:goCity,arrivalCityDisplay:arrivalCity,bCategory,BeginTime:beginTime,EndTime:endTime});
        }else if (item==='港澳台及国际机票'){
            if(goCityDisplay2){
                goCity = {
                    CityCode:goCityDisplay2.IataCode,
                    CityEg:goCityDisplay2.EnName,
                    CityEnName:goCityDisplay2.EnName,
                    CityName:goCityDisplay2.Name,
                    Cname:goCityDisplay2.Name,
                    NationalCode:goCityDisplay2.NationalCode,
                    NationalEg:goCityDisplay2.EnNationalName,
                    NationalName:goCityDisplay2.NationalName,
                }
            }
            if(arrivalCityDisplay2){
                arrivalCity = {
                    CityCode:arrivalCityDisplay2.IataCode,
                    CityEg:arrivalCityDisplay2.EnName,
                    CityEnName:arrivalCityDisplay2.EnName,
                    CityName:arrivalCityDisplay2.Name,
                    Cname:arrivalCityDisplay2.Name,
                    NationalCode:arrivalCityDisplay2.NationalCode,
                    NationalEg:arrivalCityDisplay2.EnNationalName,
                    NationalName:arrivalCityDisplay2.NationalName,
                }
            }
            if(!(apply&&apply.BusinessCategory&8)){
                cityList = null;
                goCity=null;
                arrivalCity=null ;
                beginTime = null;
                endTime = null;
                bCategory=true
                this.props.setApply();
            }
            this.push('IntlFlightIndex',{noApply:noApply,SerialNumber:apply&&apply.SerialNumber,goCityDisplay:goCity,arrivalCityDisplay:arrivalCity,bCategory:bCategory,BeginTime:beginTime,EndTime:endTime});
        }else if (item==='港澳台及国际酒店'){
            if(!(apply&&apply.BusinessCategory&16)){
                cityList2 = null;
                goCity=null;
                arrivalCity=null ;
                beginTime = null;
                endTime = null;
                bCategory=true
                this.props.setApply();
            }
            this.push('HotelSearchIndex', { isIntl: true ,selectTap:6,noApply,SerialNumber:apply&&apply.SerialNumber,cityList:cityList2,bCategory,BeginTime:beginTime,EndTime:endTime});
        }else if (item==='火车票'){
            if(!(apply&&apply.BusinessCategory&2)){
                cityList = null;
                goCity=null;
                arrivalCity=null ;
                beginTime = null;
                endTime = null;
                bCategory=true
                this.props.setApply();
            }
                beginTime = null;
            this.push('TrainIndexScreen',{noApply,SerialNumber:apply&&apply.SerialNumber,goCityDisplay:goCity,arrivalCityDisplay:arrivalCity,bCategory,BeginTime:beginTime,EndTime:endTime});
        }else if (item==='用车'){
            this.toastMsg('您的申请单类目不支持预订用车');
        }
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
    _addClick = () =>{
           const {setComp_Id,setApply} = this.props;
           setComp_Id(null);
           setApply();
           this.push('CompCreateOrderScreen',{customerInfo:this.params.customerInfo});
    }
    clickLeft= () =>{
        this.pop();
    }
    renderBody() {
        const { dataList, isLoading, isLoadingMore, isNoMoreData, options, keyWord } = this.state;
        // if(!(dataList && dataList.length>0)){
        //     ViewUtil.PlaceholderList()
        // }
        let platform = Platform.OS === 'ios' &&!Platform.isPad &&!Platform.isTVOS && [812, 896].includes(global.screenHeight)
        const iosTop = platform ? 50 : 20
        const iosBottom = platform ? 34 : 0
        const isLessKitKat = Platform.OS === 'android' && Platform.Version < 19
        const androidTop = isLessKitKat ? 0 : 24
        return (
            <View style={{backgroundColor:Theme.normalBg,flex:1,overflow:'hidden'}}>
                <SearchInput placeholder='乘客姓名/订单号' onSubmitEditing={this._searchOrder} value={keyWord} 
                             onChangeText={text => this.setState({ keyWord: text })} 
                />
                {
                <FlatList
                    data={dataList}
                    style={{flex:1}}
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
                    ListFooterComponent={
                       isLoadingMore?
                         this._renderFooter(isNoMoreData)
                        :null
                    }
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
                        }, 0)
                    }}
                    onMomentumScrollBegin={() => {
                        this.canLoad = true
                    }}
                    removeClippedSubviews={true}
                />
                }
                <LoadingView ref='loadingView' />
                <ToastView ref='toastView' position={'center'} />
                <CustomActionSheet ref={o => this.actionSheet = o} options={options} onPress={this._handlePress} />
                {
                    ViewUtil.getThemeButton('新建',()=>{
                        if (this.props.apply) {
                            this.props.setApply(null);
                         }
                        DeviceEventEmitter.emit('creactNew', {creactNew:true});
                        NavigationUtils.popToTop(this.props.navigation);
                    })
                }                   
            </View>
        )
    }

    _renderFooter = (isNoMoreData) => {
        if (isNoMoreData) {
            return (
                <View style={{ alignItems: 'center', padding: 5 }}>
                    <CustomText style={{color:'rgba(81,81,81,1)'}} text={I18nUtil.translate('没有更多数据了') + '...'} />
                </View>
            )
        }else{
            return (
                <View style={{ alignItems: 'center' }}>
                    <ActivityIndicator color={Theme.theme} style={{ margin: 2 }} />
                    <CustomText text={I18nUtil.translate('正在加载更多') + '...'} />
                </View>
            )
        }        
    }

    _cuishenClick=(item)=>{
       let model ={
            OrderId:item.Id,//综合订单id
        } 
        this.showLoadingView();
        ComprehensiveService.MassOrderApprovalRepush(model).then(response => {
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

    _withdrawApproval=(item)=>{
        let model ={
            massOrderId:item.Id,//综合订单id
        } 
        this.showLoadingView();
        ComprehensiveService.MassOrderWithdrawnApproval(model).then(response => {
            this.hideLoadingView();
            if (response && response.success) {  
                this._toSelfInfoMessage();
            } else {
                this.toastMsg(response.message);
            }
        }).catch(error => {
            this.hideLoadingView();
            this.toastMsg(error.message);
        })
    }

    _toSelfInfoMessage=()=>{
        return(
          Pop.show(
            <View style={styles.alertStyle}>
               <View style={{width:'100%',justifyContent:'center',alignItems:'center'}}>
                   <CustomText text={'订单已成功撤回审批。'} style={{padding:6,fontSize:17,fontWeight:'bold'}}/>
               </View>
               <TouchableOpacity 
                         style={{height:40,alignItems:'center',justifyContent:'center',marginTop:10,borderTopWidth:1,borderColor:Theme.lineColor}}
                         onPress={()=>{this._yesClick()}}>
                         <CustomText  text='确定' style={{fontSize:18,color:Theme.theme}}/>
                </TouchableOpacity>
            </View>
          ,{animationType: 'fade', maskClosable: false, onMaskClose: ()=>{}} ) 
        )
    }

    _yesClick = () => {
        Pop.hide()
        this.setState({
            page: 1,
            isLoadingMore: false,
            isNoMoreData: false,
            isLoading: true,
            dataList: [] 
        },()=>{
            this._loadList();
        })
    }

    /**
     * 取消综合订单
     */
    _cancelClick =(item)=>{
        this.showAlertView('您确定要取消此订单吗？此操作不可撤销。', () => {
            return ViewUtil.getAlertButton('取消', () => {
                this.dismissAlertView();
            }, '确定', () => {
                this.dismissAlertView();
                let model = {
                    OrderId:item.Id,//综合订单id
                }
                this.showLoadingView()
                ComprehensiveService.MassOrderCancel(model).then(response => {
                this.hideLoadingView() 
                    if (response && response.success) {
                        DeviceEventEmitter.emit('BackRefreshList', {});
                    }else{
                        this.toastMsg(response.message);
                    }
                }).catch(error => {
                    this.hideLoadingView()  
                    this.toastMsg(error.message || '加载数据失败请重试');
                })
            })
        }) 
    }
    
    _renderItem = ({ item }) => { 
        let CreatorName = I18nUtil.tranlateInsert('预订人员：{{noun}}',item.Creator.Name);
        const { listArray } = this.state;
        const {userInfo} = this.params;
        let showBtn = true;
        userInfo.Id==item.Creator.Id?showBtn=true:showBtn=false;
        let TradeNumber;
        item.PaymentInfos&&item.PaymentInfos.map((obj)=>{
            if(obj.TradeNumber){
                TradeNumber = obj.TradeNumber
            }
        })
        return(
            <View style={{marginHorizontal:10, marginVertical:5,backgroundColor:'#fff',borderRadius:6,padding:10}}>
                <TouchableOpacity onPress={()=>{this._orderSelect(item)}}>
                    <View style={{backgroundColor:'#fff',padding:10}}>
                        <View style={{borderBottomWidth:1,flexDirection:'row',justifyContent:'space-between',paddingVertical:10,borderColor:Theme.normalBg}}>
                            <View>
                                <CustomText text={CreatorName} style={{color:Theme.commonFontColor, padding:2, fontSize:12}}></CustomText>
                                <CustomText text={Util.Date.toDate(item.CreateTime).format('yyyy-MM-dd HH:mm')} style={{color:Theme.commonFontColor, padding:2, fontSize:12}}></CustomText>
                            </View>
                            <View style={{alignItems:'flex-end'}}>
                                <CustomText text={item.StatusDesc} style={{color:Theme.theme}}></CustomText>
                                <CustomText text={Util.multipleOrderStatusDesc(item.Status)} style={{color:Theme.theme,fontSize:10}}></CustomText>
                                <CustomText text={item.SerialNumber} style={{color:Theme.commonFontColor, padding:2, fontSize:12}}></CustomText>
                            </View>
                        </View>
                    </View>
                    {
                        item.OrderItems.map((littleitem)=>{
                            return(
                                <CompListItem listArray={listArray} item={littleitem} />
                            )
                        })
                    }
                </TouchableOpacity>
                <View style={{ flexDirection: 'row',justifyContent:'flex-end', marginTop: 10 ,flexDirection:'row',alignItems:'center',backgroundColor:'#fff',marginRight:10}}>
                {
                    item.Status===10?null:
                    item.Status === 2 && showBtn?//待审核 催审
                    <View style={{flexDirection:'row'}}>
                            <TouchableHighlight underlayColor='transparent' onPress={this._cuishenClick.bind(this,item)} style={{marginLeft:10}}>
                                <View style={{ paddingHorizontal: 7, paddingVertical: 4, borderColor: Theme.theme,borderWidth:1, borderRadius: 2 }}>
                                    <CustomText text='催审' style={{ color: Theme.theme }} />
                                </View>
                            </TouchableHighlight>
                            {
                                item.CanWithdrawnApproval?
                                <TouchableHighlight underlayColor='transparent' 
                                                    onPress={this._withdrawApproval.bind(this,item)} 
                                                    style={{marginLeft:10}}>
                                    <View style={{ paddingHorizontal: 8, paddingVertical: 5, backgroundColor: Theme.theme, borderRadius: 2 }}>
                                        <CustomText text='撤回审批' style={{ color: 'white' }} />
                                    </View>
                                </TouchableHighlight>
                                :null 
                            } 
                    </View>
                    :
                    item.Status ===0 && showBtn?//计划中 继续预订
                        <View style={{flexDirection:'row'}}>
                            <TouchableHighlight underlayColor='transparent' onPress={this._cancelClick.bind(this,item)} style={{marginLeft:10}}>
                                <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 2,borderWidth:1,borderColor:Theme.theme }}>
                                    <CustomText text='取消' style={{ color: Theme.theme}} />
                                </View>
                            </TouchableHighlight>
                            <TouchableHighlight underlayColor='transparent' onPress={this._orderContinu.bind(this,item)} style={{marginLeft:10}}>
                                <View style={{ paddingHorizontal: 8, paddingVertical: 5, backgroundColor: Theme.theme, borderRadius: 2 }}>
                                    <CustomText text='继续预订' style={{ color: '#fff'}} />
                                </View>
                            </TouchableHighlight>
                        </View>
                    :
                    item.Status ===6?//代付款
                    <View style={{flexDirection:'row'}}>
                        <TouchableHighlight underlayColor='transparent' onPress={this._cancelClick.bind(this,item)} style={{marginLeft:10}}>
                            <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 2,borderWidth:1,borderColor:Theme.theme }}>
                                <CustomText text='取消' style={{ color: Theme.theme}} />
                            </View>
                        </TouchableHighlight>
                        <TouchableHighlight underlayColor='transparent' onPress={()=>{
                            if(!TradeNumber){
                                this.toastMsg('获取支付单号失败');
                                return;
                            }
                            this.push('CompPaymentScreen',{TradeNumber:TradeNumber,OrderItems:item.OrderItems,Travellers:item.Travellers})
                        }} style={{marginLeft:10}}>
                            <View style={{ paddingHorizontal: 8, paddingVertical: 5, backgroundColor: Theme.theme, borderRadius: 2 }}>
                                <CustomText text='付款' style={{ color: '#fff'}} />
                            </View>
                        </TouchableHighlight>
                    </View>
                    :
                    item.Status ===5?//被驳回
                        null
                    :null 
                }
                </View>
            </View>
        )
    }
}

const getProps = (state) => ({
    feeType: state.feeType.feeType,
    comp_userInfo: state.comp_userInfo,
    apply: state.apply.apply,
});
const getActions = dispatch => ({
    setApply: (value) => dispatch(Action.applySet(value)),
    setFeeType: (value) => dispatch(Action.feeTypeTransform(value)),
    setComp_travellers: (compEmployees,compTraveler,travellers) => dispatch(Action.setComp_travellers(compEmployees,compTraveler,travellers)),
    setComp_Id: (value) => dispatch(Action.setComp_Id(value)),
    onClickSure:(compCreateBool)=>dispatch(Action.onClickSure(compCreateBool)),
    onLoadcomprehensiveData:(userInfo,employees,travellers,ProjectId,ReferenceEmployeeId,IdModel,referencPassengerId)=>dispatch(Action.onLoadcomprehensiveData(userInfo,employees,travellers,ProjectId,ReferenceEmployeeId,IdModel,referencPassengerId)),
})
function ComprehensiveListScreenWrapper(props) {
    const navigation = useNavigation();
    return <ComprehensiveListScreen {...props} navigation={navigation} />;
}

export default connect(getProps, getActions)(ComprehensiveListScreenWrapper)



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
    btnTouch: {
        position:'relative',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        height: 45,
        borderRadius: 25,
        marginHorizontal: 10,
        backgroundColor: Theme.theme,
        marginBottom:10,
        borderWidth:0.5,
        borderColor:Theme.theme
    },
    alertStyle:{
        width: '80%', 
        backgroundColor:'#fff',
        borderRadius:8,
        padding:10,
      },
})
