import React from 'react';
import {
    View,
    Image,
    TouchableHighlight,
    ImageBackground,
    StyleSheet,
    ScrollView,
    AppRegistry,
    Animated,
    Dimensions,
    TouchableOpacity,
    FlatList,
    DeviceEventEmitter
} from 'react-native';
import SuperView from '../../super/SuperView';
import CommonService from '../../service/CommonService';
import HotelSearchView from './SearchView';
import { connect } from 'react-redux';
import UserInfoDao from '../../service/UserInfoDao';
import CustomText from '../../custom/CustomText';
import CustomTextInput from '../../custom/CustomTextInput';
import IntlHotelSearchView from '../inflHotel/IntlHotelSearchView';
import HotelService from '../../service/HotelService';
import Util from '../../util/Util';
import StorageUtil from '../../util/StorageUtil';
import Key from '../../res/styles/Key';
import AdCodeEnum from '../../enum/AdCodeEnum';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import Theme from '../../res/styles/Theme';
import AdContentInfoView from '../common/AdContentInfoView';
import ChoosePersonView from '../ComprehensiveOrder/commen/ChoosePersonView';
import SearchInput from '../../custom/SearchInput';
import NavigationUtils from '../../navigator/NavigationUtils';
import ApplicationService from '../../service/ApplicationService';
import action  from '../../redux/action';
import BackPress from '../../common/BackPress';
import ComprehensiveService from '../../service/ComprehensiveService';


const { width, height } = Dimensions.get("window");
class HotelIndexScreen extends SuperView {

    flightInfo = null;

    constructor(props) {
        super(props);
        this.params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};
        this.flightInfo = this.params.flight;
        this._navigationHeaderView = {
            title: '酒店',
        }
        this.backPress = new BackPress({ backPress: () => this._backBtnClick() })
        let day1 = Util.Date.toDate(this.params.BeginTime);
        let day2 = Util.Date.toDate(this.params.EndTime);
        this.state = {
            hotelDep: null,
            intlHotelDep: null,
            hotelCity: null,
            adList: [],
            isIntl: this.params.selectTap === 6 || this.params.isIntl ? true : false,
            customerInfo: {},
            intlHotelAdList: [],
            flightArrivalCityDisplay: '',
            flightArrivalDate:new Date(),
            securetyTipViewY: new Animated.Value(global.screenHeight),
            // testList:['随意','随便','随性','随心','随和','随机应变'],
            cantonList: [],//行政区
            hideCantonList: [],//收起后的行政区
            showCanton: false,//是否收起

            businessList: [],//商圈
            hideBusinessList: [],//收起商圈
            showBusiness: false,//是否收起商圈

            airStationList: [],//机场、车票
            hideAitStationList: [],//收起机场、车票
            showAitStation: false,//是否收起机场、车票

            hospitalList: [],//医院
            hideHospitalList: [],//收起医院
            showHospital: false,//是否收起医院

            schoolList: [],//大学
            hideSchool: [],//收起大学
            showSchool: false,//是否收起大学

            cityScenicList: [],//室内景点
            hideCityScenic: [],//收起室内景点
            showCityScenic: false,//是否收起室内景点

            scenicspotsList: [],//室外景点
            hideScenicspots: [],//收起景点
            showScenicspots: false,//是否收起景点

            schoolList: [],//大学
            hideSchool: [],//收起大学
            showSchool: false,//是否收起大学

            performList: [],//演出场馆
            hidePerform: [],//收起演出场馆
            showPerform: false,//是否收起演出场馆

            shopList: [],//购物中心
            hideShopList: [],//购物中心
            showShopList: [],//购物中心: [],//购物中心

            keyWord: null,
            dataList: [],
            hotelData: null,
            key_word: null,
            locationId:null,
            locationName:null,
            apllyDays: Util.Date.getDiffDay(day1,day2),
            locationAlertShow:false,
            intlLocationList:[],
            OftenAddressList:[],
            cityList:this.params.arrivalCityDisplay?this.params.arrivalCityDisplay:this.params.cityList&&this.params.cityList[1],
            PoiQueryList:[],
            mapPoi:{},
            UseMap:false
        }
    }
    // 重置手势滑动
    static navigationOptions = ({ navigation }) => {
        return {
            gesturesEnabled: false
        }
    }
     /**
     *  返回的操作
     */
     _backBtnClick = () => {
        if(this.flightInfo || this.params.backToTop){
            DeviceEventEmitter.emit('deleteApply', {});
            NavigationUtils.popToTop(this.props.navigation);
        }else{
            this.pop();
        } 
        return true;
    }

    componentDidMount() {
        this._listener =  DeviceEventEmitter.addListener('HotelSearchLs',(res)=>{
                this.params = res
                let day1 = Util.Date.toDate(this.params.BeginTime);
                let day2 = Util.Date.toDate(this.params.EndTime);
                this.setState({
                    isIntl: this.params.selectTap === 6 || this.params.isIntl ? true : false,
                    cityList:this.params.arrivalCityDisplay?this.params.arrivalCityDisplay:this.params.cityList&&this.params.cityList[1],
                    apllyDays: Util.Date.getDiffDay(day1,day2),
                })
        })
        this._getdata();
    }

    componentWillUnmount() {
        this._listener.remove();
    }

    _getdata=()=>{
        UserInfoDao.getCustomerInfo().then(response => {
            this.setState({
                customerInfo: response
            })
        }).catch(error => {

        })
        if (this.props.apply && this.props.apply.selectJourney) {
            let jouney = this.props.apply.selectJourney;
            this.setState({
                hotelDep: Util.Date.toDate(jouney.DepartureTime),
                intlHotelDep: Util.Date.toDate(jouney.DepartureTime)
            })
            StorageUtil.loadKeyId(Key.HotelCitysData).then(response => {
                if (response) {
                    this._analyData(response);
                } else {
                    this._loadCities();
                }
            }).catch(error => {
                this._loadCities();
            })
        } else if(this.flightInfo){
            this.setState({
                flightArrivalCityDisplay: this.flightInfo.Destination,
                flightArrivalDate: this.flightInfo.DestinationTime
            }, () => {
                StorageUtil.loadKeyId(Key.HotelCitysData).then(response => {
                    if (response) {
                        this._analyData(response);
                    } else {
                        this._loadCities();
                    }
                }).catch(error => {
                    this._loadCities();
                })
            })
        } else {
            StorageUtil.loadKeyId(Key.FlightSearchCityRecord).then(response => {
                if (response && Array.isArray(response) && response.length > 0) {
                    let obj = response[response.length - 1];
                    this.setState({
                        flightArrivalCityDisplay: obj.arrivalCityData.Name,
                    }, () => {
                        StorageUtil.loadKeyId(Key.HotelCitysData).then(response => {
                            if (response) {
                                this._analyData(response);
                            } else {
                                this._loadCities();
                            }
                        }).catch(error => {
                            this._loadCities();
                        })
                    })
                }
            }).catch(error => {

            })
        }
        if(this.state.isIntl){
            CommonService.GetAdStrategyContent(AdCodeEnum.intlHotel).then(response => {
                if (response && response.success) {
                    this.setState({
                        intlHotelAdList: response.data
                    })
                }
            }).catch(error => {
                this.toastMsg(error.message || '数据请求异常')
            })
        }else{
            CommonService.GetAdStrategyContent(AdCodeEnum.hotel).then(response => {
                if (response && response.success) {
                    this.setState({
                        adList: response.data
                    })
                }
            }).catch(error => {
                this.toastMsg(error.message || '数据请求异常')
            })
        }
    }

    _checkTravellers=(selectTap)=>{
        const {setCheckTravellers,apply,comp_travelers,comp_userInfo,compCreate_bool} = this.props;
        let chooseLists;
        if(compCreate_bool){//判断该综合订单是创建还是继续预订
            if(!comp_userInfo&&!comp_userInfo.userInfo&&!comp_userInfo.employees&&!comp_userInfo.travellers&&!comp_userInfo.ProjectId){
                return;
            }
            chooseLists = (comp_userInfo&&comp_userInfo.employees).concat(comp_userInfo&&comp_userInfo.travellers)
        }else{
            chooseLists=(comp_travelers&&comp_travelers.compEmployees).concat(comp_travelers&&comp_travelers.compTraveler)
        }
        let model={
          MassOrderId:null,
          Category:selectTap,//业务分类（1:国内机票,4:国内酒店,5:火车票,6:港澳台及国际酒店,7:国际机票），该字段必填
        //   ReferenceEmployeeId:referenceId,//差旅规则及审批规则的参照员工ID。如果没有综合订单ID，且有多个出差员工时这个字段必填！（出差员工+当前预订人中的任意一人）
          ReferenceEmployeeId:this.props.comp_userInfo&&this.props.comp_userInfo.ReferenceEmployeeId?this.props.comp_userInfo.ReferenceEmployeeId:0,
          ProjectId:comp_userInfo.ProjectId,
          Travellers:chooseLists
        }
        this.showLoadingView();
        ComprehensiveService.MassOrderCheckTravellers(model).then(response => {
        this.hideLoadingView();
            if (response && response.success&&response.data) {
                setCheckTravellers(response.data);
                // if(apply){
                //     this._checkTravelApply()//检查申请单
                // }else{
                //     this.setState({
                //         chooseApply:false
                //     },()=>{
                //         this._createSure()
                //     })
                // }
    
            }else{
                this.hideLoadingView();
                this.toastMsg(response.message);
            }
        }).catch(error => {
                this.hideLoadingView();
                this.toastMsg(error.message);
        }) 
    }

    _loadCities = () => {
        this.showLoadingView();
        HotelService.getHotelCityList().then(response => {
            this.hideLoadingView();
            if (response && response.success) {

                StorageUtil.saveKeyId(Key.HotelCitysData, response.data);
                this._analyData(response.data);
            } else {
                this.toastMsg(response.message || '获取城市信息失败');
            }
        }).catch(error => {
            this.hideLoadingView();
            this.toastMsg(error.message || '获取城市信息失败');
        })
    }

    _analyData = (data) => {
        const { flightArrivalCityDisplay } = this.state;
        let jouney = this.props.apply && this.props.apply.selectJourney;
        if (jouney) {
            for (const obj of data) {
                if (jouney.Destination === obj.Name) {
                    this.setState({
                        hotelCity: obj
                    })
                    break;
                }
            }
        } else {
            if (flightArrivalCityDisplay) {
                for (const obj of data) {
                    if (flightArrivalCityDisplay === obj.Name) {
                        this.setState({
                            hotelCity: obj
                        })
                        break;
                    }
                }
            }
        }

    }

    /**
     *  左右边点击啊
     * index是 1左 2右
     */
    _imagePress = (index) => {
        const { customerInfo } = this.state;
        let addition = customerInfo&&customerInfo.Addition&&customerInfo.Addition
        if(!addition){return}
        if(this.params.SerialNumber){return}
        
        if( ! (addition.HasHotelAuth && addition.HasInterHotelAuth) ){ //不是国际国内酒店都可以预定的时候，不可以切换
            if(!addition.HasHotelAuth){
                this.toastMsg('未开通国内酒店功能');
            }
            if(!addition.HasInterHotelAuth){
                this.toastMsg('未开通港澳台及国际酒店功能');
            }
            return
        }else{
            if (index === 1) {
                this._checkTravellers(4)
                this.params.selectTap===4?null:this.props.setApply();
                this.setState({
                    isIntl: false
                }, () => {
                    if (this.state.adList.length === 0) {
                        CommonService.GetAdStrategyContent(AdCodeEnum.hotel).then(response => {
                            if (response && response.success) {
                                this.setState({
                                    adList: response.data
                                })
                            }
                        }).catch(error => {
    
                        })
                    }
                })
            } else {
                this._checkTravellers(6)
                this.params.selectTap===6?null:this.props.setApply();
                this.setState({
                    isIntl: true
                }, () => {
                    if (this.state.intlHotelAdList.length === 0) {
                        CommonService.GetAdStrategyContent(AdCodeEnum.intlHotel).then(response => {
                            if (response && response.success) {
                                this.setState({
                                    intlHotelAdList: response.data
                                })
                            }
                        }).catch(error => {
    
                        })
                    }
                })
            }
        }
    }
    _toAdDetail = (item) => {
        if (item.AdContentInfo) {
            if (item.AdContentInfo.AdLink) {
                this.push("Web", {
                    title: item.ContentName,
                    url: item.AdContentInfo &&item.AdContentInfo.AdLink
                })
            } else {
                let items = {
                    content: item.AdContentInfo.Content,
                    title: item.AdContentInfo.Name,
                    LinkUrl: null
                }
                this.push('NoticeDetail', { item: items });
            }
        }
    }
    /**
     *  左右行程按钮
     */
    _renderHeader = () => {
        const { isIntl,customerInfo } = this.state;
        let addition = customerInfo&&customerInfo.Addition&&customerInfo.Addition
        if(!addition){return}
        return (
            <View style={{ backgroundColor:'#fff'}}>
                 <View style={{flexDirection:'row',paddingVertical:15,backgroundColor:'#fff',borderTopLeftRadius:6,borderTopRightRadius:6}}>
                        <Image source={require('../../res/Uimage/flightFloder/BusinessTrip.png')} style={{width:20,height:20,marginRight:5}}/>
                        <CustomText text={'出差行程'} style={{fontSize:14}}></CustomText>
                </View>
                <View style={{ flexDirection: 'row', height: 40, backgroundColor:Theme.normalBg, borderRadius:6 }}>
                    <TouchableOpacity underlayColor='transparent' style={{ margin:4, backgroundColor:!isIntl && addition.HasHotelAuth?'#fff':Theme.normalBg,justifyContent:'center',flex:1,borderRadius:3,alignItems:'center' }} onPress={this._imagePress.bind(this, 1)}>
                        {
                            // !isIntl && addition.HasHotelAuth?
                                // <ImageBackground resizeMode='stretch' style={styles.image} source={require('../../res/image/b_g_r.png')}>
                                //     <CustomText text='国内酒店' style={{ color: Theme.theme, fontSize: 16, fontWeight: 'bold' }} />
                                // </ImageBackground> :
                                // <View style={styles.image}>
                                    <CustomText text='国内酒店' style={{ fontSize:14 }} />
                                // </View>
                        }
                    </TouchableOpacity>
                    <TouchableOpacity style={{ margin:4, backgroundColor:!isIntl && addition.HasHotelAuth?Theme.normalBg:'#fff',justifyContent:'center',flex:1,borderRadius:3,alignItems:'center' }} underlayColor='transparent' onPress={this._imagePress.bind(this, 2)}>
                        {
                            // !isIntl && addition.HasHotelAuth?
                                // <View style={styles.image}>
                                    <CustomText text='港澳台及国际酒店' style={{ fontSize:14 }} />
                                // </View> 
                                // :
                                // <ImageBackground style={styles.image} resizeMode='stretch' source={require('../../res/image/b_g_l.png')}>
                                //     <CustomText text='港澳台及国际酒店' style={{ color: Theme.theme, fontSize: 16, fontWeight: 'bold' }} />
                                // </ImageBackground>
                        }
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
    /**
     * @returns drawerClick
     */
    drawerClick = (city) => {
        const { keyWord } = this.state;
        this._showTipView()
        keyWord ?
            this.getFilterClick(city) :
            this._getKeyword(city)
    }

    drawerClick2 = (city) => {
        const { keyWord } = this.state;
        this._showTipView()
        keyWord ?
            this.getFilterClick(city) :
            this._getKeyword2(city)
    }

    _getKeyword2 = (city) => {
        const filtersPromise = HotelService.HotelCityFilters({ CityCode: city.Code });
        const brandPromise = HotelService.HotelBrand();
        Promise.all([filtersPromise, brandPromise]).then((result) => {
            this.hideLoadingView();
            if(result){
                let response = result[0];
                if (response && response.success && response.data) {
                    if (response.data.Locations) {
                        let locations = [];
                        response.data.Locations.forEach(obj => {
                            let atIndex = locations.findIndex(item => item.title === obj.Category);
                            if (atIndex > -1) {
                                let location = locations[atIndex];
                                location.data.push(obj);
                            } else {
                                locations.push({ title: obj.Category, data: [obj] });
                            }
                        })
                        this.setState({
                            intlLocationList:locations
                        })
                    }else{
                        this.setState({
                            intlLocationList:[]
                        })
                    }
                    if(response.data.OftenAddress){
                        response.data.OftenAddress.map((item)=>{
                            item.Name = item.Address
                        })
                        this.setState({
                            OftenAddressList:response.data.OftenAddress
                        })
                    }else{
                        this.setState({
                            OftenAddressList:[]
                        })
                    }
                }
            }
        })
    }

    /**
     * 获取地标、商圈、酒店名数据
     */
    _getKeyword = (city) => {
        // const {cantonList} = this.state;
        let array = [];
        let businessArr = [];
        let airStationArr = [];
        let hospitalArr = [];
        let schoolArr = [];
        let cityScenicArr = [];
        let scenicspotsArr = [];
        let performArr = [];
        let shopListArr = [];
        this.showLoadingView();
        const filtersPromise = HotelService.HotelCityFilters({ CityCode: city.Code });
        const brandPromise = HotelService.HotelBrand();
        Promise.all([filtersPromise, brandPromise]).then((result) => {
            this.hideLoadingView();
            if (result) {
                let response = result[0];
                if (response && response.success) {
                    if (response.data) {
                        if (response.data.Locations) {
                            let locations = [];
                            response.data.Locations.forEach(obj => {
                                let atIndex = locations.findIndex(item => item.title === obj.Category);
                                if (atIndex > -1) {
                                    let location = locations[atIndex];
                                    location.data.push(obj);
                                } else {
                                    locations.push({ title: obj.Category, data: [obj] });
                                }
                            })
                            response.data.otwLocations = locations;
                        }

                        response.data.Districts.map((item) => {
                            array.push(item)
                        })
                        if (response.data.otwLocations) {
                            //商圈
                            if (response.data.otwLocations[0] && response.data.otwLocations[0].data) {
                                response.data.otwLocations[0].data.map((item) => {
                                    businessArr.push(item)
                                })
                            }
                            //机场/车站
                            if (response.data.otwLocations[1] && response.data.otwLocations[1].data) {
                                response.data.otwLocations[1].data.map((item) => {
                                    airStationArr.push(item)
                                })
                            }
                            //医院
                            // if (response.data.otwLocations[2] && response.data.otwLocations[2].data) {
                            //     response.data.otwLocations[2].data.map((item) => {
                            //         hospitalArr.push(item)
                            //     })
                            // }
                            //大学
                            // if (response.data.otwLocations[3] && response.data.otwLocations[3].data) {
                            //     response.data.otwLocations[3].data.map((item) => {
                            //         schoolArr.push(item)
                            //     })
                            // }
                            //购物中心
                            if (response.data.otwLocations[2] && response.data.otwLocations[2].data) {
                                response.data.otwLocations[2].data.map((item) => {
                                    shopListArr.push(item)
                                })
                            }
                            //城市景点
                            if (response.data.otwLocations[3] && response.data.otwLocations[3].data) {
                                response.data.otwLocations[3].data.map((item) => {
                                    cityScenicArr.push(item)
                                })
                            }
                            //室外景点
                            // if (response.data.otwLocations[5] && response.data.otwLocations[5].data) {
                            //     response.data.otwLocations[5].data.map((item) => {
                            //         scenicspotsArr.push(item)
                            //     })
                            // }
                            // 演出场馆
                            // if (response.data.otwLocations[6] && response.data.otwLocations[6].data) {
                            //     response.data.otwLocations[6].data.map((item) => {
                            //         performArr.push(item)
                            //     })
                            // }
                        }

                        this.setState({
                            cantonList: array,
                            businessList: businessArr,
                            airStationList: airStationArr,
                            hospitalList: hospitalArr,
                            schoolList: schoolArr,
                            cityScenicList: cityScenicArr,
                            scenicspotsList: scenicspotsArr,
                            performList: performArr,
                            shopList: shopListArr,

                            hideCantonList: array.slice(0, 9),
                            hideBusinessList: businessArr.slice(0, 9),
                            hideAitStationList: airStationArr.slice(0, 9),
                            hideHospitalList: hospitalArr.slice(0, 9),
                            hideSchool: schoolArr.slice(0, 9),
                            hideCityScenic: cityScenicArr.slice(0, 9),
                            hideScenicspots: scenicspotsArr.slice(0, 9),
                            hidePerform: performArr.slice(0, 9),
                            hideShopList: shopListArr.slice(0, 9),

                            // hideCantonList:cantonList.slice(0,9)

                        })

                    }
                } else {
                    this.toastMsg(response.message || "获取行政区失败");
                }
                if (result.length > 1) {
                    let brand = result[1];
                    if (brand && brand.success) {
                        this.setState({
                            brandData: brand.data
                        })
                    } else {
                        this.toastMsg(brand.message);
                    }
                }
            }
        }).catch((err) => {
            this.hideLoadingView();
        })
    }
    //获取筛选数据
    getFilterClick = (city) => {
        const { keyWord } = this.state;
        let model = {
            CityCode: city.Code,
            Keyword: keyWord,
        }
        this.showLoadingView();
        HotelService.HotelKeywordQuery(model).then(response => {
            this.hideLoadingView();
            if (response && response.success && response.data) {
                this.setState({
                    dataList: response.data
                })
            }
        }).catch(error => {
            this.hideLoadingView();
            this.toastMsg(error.message || '很抱歉，没有符合条件的酒店');
        })
    }
    //展示View
    _showTipView = () => {
        Animated.timing(
            this.state.securetyTipViewY,
            {
                toValue: -45,
                duration: 300,   //动画时长300毫秒
            }
        ).start();
    }
    //隐藏view
    _hiddenTipView = () => {
        Animated.timing(
            this.state.securetyTipViewY,
            {
                toValue: global.screenHeight,
                duration: 300,   //动画时长300毫秒
            }).start();
    }
    //可选关键字UI
    _listView = (list)=>{
        return(
            <View style={{ backgroundColor: '#fff',width:global.screenWidth,flexDirection:'row',flexWrap:'wrap',paddingHorizontal:10 }}>
                {
                    list.map((item,index)=>{
                        return(
                            (index-1)%3 === 0?
                            <TouchableOpacity style={styles.boxStyle} 
                                              onPress={()=>{
                                                  this.setState({
                                                      keyWord:item.Name,
                                                      locationId:item.Code,
                                                      locationName:item.Name
                                                  })
                                                  this._hiddenTipView()
                                              }}
                            >
                                    <View style={{
                                        borderWidth:0.5,
                                        borderColor:Theme.theme,
                                        borderRadius:5,
                                        alignItems:'center',
                                        justifyContent:'center',
                                        padding:6
                                    }}>
                                        <CustomText text={item.Name}></CustomText>
                                    </View>
                            </TouchableOpacity>
                            :
                            <TouchableOpacity style={{
                                borderWidth:0.5,
                                borderColor:Theme.theme,
                                borderRadius:5,
                                alignItems:'center',
                                justifyContent:'center',
                                backgroundColor:'#fff',
                                padding:6,
                                margin:5
                            }}
                                              onPress={()=>{
                                                 this.setState({
                                                    keyWord:item.Name,
                                                    locationId:item.Code,
                                                    locationName:item.Name
                                                 })
                                                 this._hiddenTipView()
                                              }}
                            >
                                <CustomText text={item.Name}></CustomText>
                            </TouchableOpacity>
                        )
                    })
                }
            </View>
        )
    }

    renderBody() {
        const { adList, isIntl, intlHotelAdList, keyWord, key_word,locationId,locationName,customerInfo,locationAlertShow,cityList,mapPoi,UseMap } = this.state;
        const { comp_userInfo, comp_travelers, compCreate_bool, compSwitch } = this.props;
        let addition = customerInfo&&customerInfo.Addition&&customerInfo.Addition
        if(!addition){return}
        return (
            <View style={styles.container}>
            <View 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollViewContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps='always'
                scrollEventThrottle={16}
            >
            <View style={{}}>
                {locationAlertShow ? this._showLocationAlert() : null}
                <AdContentInfoView adList={isIntl ? intlHotelAdList : adList} />
                <View style={styles.contain} keyboardShouldPersistTaps='handled'>
                {
                    // compSwitch ?
                        <ChoosePersonView comp_userInfo={comp_userInfo} comp_travelers={comp_travelers} compCreate_bool={compCreate_bool} />
                        // : null
                    }
                    <View style={{backgroundColor:'#fff',paddingHorizontal:20,borderRadius:6,marginHorizontal:10}}>
                        {this._renderHeader()}
                        {
                            !this.state.isIntl && addition.HasHotelAuth?
                                <HotelSearchView 
                                      {...this.state} 
                                      {...this.params}
                                      applySerialNumber={this.params.applySerialNumber}//判断是否是预订完飞机后预订酒店
                                      comp_userInfo={comp_userInfo}
                                      compSwitch={compSwitch} 
                                      otwThis={this} 
                                      feeType={this.props.feeType} 
                                      cityList={cityList}
                                      customerInfo={this.state.customerInfo || {}} 
                                      keyWord={keyWord} 
                                      locationId={locationId} 
                                      locationName={locationName}
                                      mapPoi={mapPoi}
                                      UseMap={UseMap}
                                      callBack={(beforeState) => {
                                        this.setState({
                                            keyWord: beforeState.keyOff ? null : keyWord,
                                            hotelData: beforeState,
                                        })
                                        beforeState.city ? this.drawerClick(beforeState.city) : null
                                      }}
                                      callBacklocationAlert={(locationAlertShow)=>{
                                          this.setState({
                                            locationAlertShow:locationAlertShow
                                          })
                                      }}
                                />
                                :
                                <IntlHotelSearchView 
                                      {...this.state}
                                      {...this.params} 
                                      otwThis={this} 
                                      feeType={this.props.feeType} 
                                      customerInfo={this.state.customerInfo || {}}
                                      keyWord={keyWord} 
                                      cityList={cityList} 
                                      callBack={(beforeState) => {
                                        this.setState({
                                            keyWord: beforeState.keyOff ? null : keyWord,
                                            hotelData: beforeState,
                                        })
                                        beforeState.city ? this.drawerClick2(beforeState.city) : null
                                      }}
                                />
                        }
                    </View>
                    <Animated.View style={{ position: "absolute", top: this.state.securetyTipViewY, backgroundColor:'rgba(1,1,1,0.1)', height: global.screenHeight, width: global.screenWidth }}>
                            <View style={{ marginTop: 10, backgroundColor: '#fff', flex: 1 }}>
                                <View style={{ flexDirection: 'row',marginTop: 10,justifyContent:'center',alignItems:'center' }}>
                                    <TouchableOpacity style={{ backgroundColor: '#fff', height: 50, width: 50, alignItems: 'center', justifyContent: 'center' }} onPress={this._hiddenTipView}>
                                        <AntDesign name={'close'} size={22} style={{ color: 'gray' }}></AntDesign>
                                    </TouchableOpacity>
                                    <View style={{ flex: 1, borderRadius: 6 , borderColor: Theme.lineColor,borderWidth:1,marginRight:15, backgroundColor: '#fff'}}>
                                        <SearchInput placeholder='(选填) 酒店名/地标/商圈'
                                            value={keyWord}
                                            onChangeText={keyWord =>
                                                this.setState({
                                                    keyWord: keyWord,
                                                    key_word: false
                                                }, () => {
                                                   !this.state.isIntl? this._loadPoiQueryList() : null
                                                })
                                            }
                                            onSubmitEditing={this._searchOrder}
                                        />
                                    </View>
                                </View>
                                <ScrollView 
                                    keyboardShouldPersistTaps='always'
                                    keyboardDismissMode='on-drag'
                                    showsVerticalScrollIndicator={false}
                                >
                                {Util.Parse.isChinese() && !this.state.isIntl ? this.PoiQueryList() : null}
                                {!key_word ? this._keyWordPage() :
                                    keyWord ? this._chooseHotel() : this._keyWordPage()
                                }
                                </ScrollView>
                            </View>
                        </Animated.View>
                        <View style={{height:80}}></View>
                </View>
            </View>
            </View>
        </View>

        )
    }

    PoiQueryList() {
        const { PoiQueryList } = this.state;
        return(
            <FlatList
                keyboardShouldPersistTaps='always'
                keyboardDismissMode='on-drag'      // 拖拽时收起键盘
                data={PoiQueryList}
                style={{paddingHorizontal:60}}
                renderItem={this._renderPoiItem}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item, index) => String(index)}
            />
        )
    }
    _renderPoiItem = ({ item, index }) => {
        return <TouchableOpacity underlayColor='transparent' 
                onPress={() => {
                    this._choosePoi(item);
                }} 
                style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    paddingVertical: 10,
                }}>
            <CustomText text={item.Name} style={{fontSize:14,color:Theme.theme}}></CustomText>
        </TouchableOpacity>
    }
    _choosePoi = (item) => {
        this.setState({
            mapPoi: item.location,
            UseMap: true,
            keyWord:item.Name,
        })
        this._hiddenTipView()
        
    }
    _loadPoiQueryList = () => {
            const { hotelData, keyWord } = this.state;
            let model = {
              Query: this.state.keyWord,
              Region: hotelData.city.Name,
              Domestic: true,
            }
            HotelService.HotelOrderPoiQuery(model).then(response => {
                if (response && response.success && response.data) {
                    this.setState({
                        PoiQueryList: response.data
                    })
                } 
            }).catch(error => {
                this.hideLoadingView();
            })
    }
    
    _showLocationAlert=()=>{
        return(
          <View  style={{ height:54, width:global.screenWidth, backgroundColor:'#ccc',justifyContent:'center', alignItems:'center', marginRight:50}}>
            <CustomText text={'请开启定位用于展示附近酒店'} style={{fontSize:18,fontWeight:'bold'}}></CustomText>
            <CustomText text={'当您打开定位权限时将获取您的位置信息'}></CustomText>
          </View>
        )
    }
    _renderItem = ({ item, index }) => {
        const { keyWord, hotelData } = this.state;
        let hotel = item;
        hotel.CityCode = hotelData.city.Code
        hotel.HotelCode = item.HotelId
        hotel.HotelName = item.Name
        hotel.Longitude = item.Lng;
        hotel.Latitude = item.Lat;
        return (
            <TouchableOpacity style={styles.listItemstyle}
                onPress={() => {
                    // if(item.HotelId){//酒店时跳转酒店详情 舍弃
                    //     this.push('HotelRoomList', { selectDate: hotelData.selectDate, longDay: hotelData.longDay, hotel: hotel, city: hotelData.city })
                    // } else 
                    // if(item.Lat > 0 && item.Lng>0){ 跳转酒店列表 舍弃
                    //     // NavigationUtils.push(this.props.navigation, 'HotelList', { ...this.state,keyWord,feeType,customerInfo,ReferenceEmployee,locationId });
                    //     this.push('HotelList',{
                    //         ...hotelData,
                    //         currtentPosition:{
                    //             longitude:item.Lng,
                    //             latitude:item.Lat
                    //         },
                    //         feeType:this.props.feeType,
                    //         customerInfo:this.state.customerInfo || {},
                    //         // locationId:this.state.locationId
                    //     })
                    // } else
                    {
                        this.setState({
                            keyWord: item.Name,
                            locationId:'',//关键字搜索清除之前的locationId
                            locationName:'',
                        })
                    }                       
                    this._hiddenTipView()
                }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <FontAwesome5 name={'building'} size={16} color={'red'} />
                    <View style={{ marginLeft: 10 }}>
                        {
                            item.Name.substring(0, keyWord.length) == keyWord ?
                                <View style={{ flexDirection: 'row' }}>
                                    <CustomText text={item.Name.substring(0, keyWord.length)} style={{ color: Theme.theme }} />
                                    <CustomText text={item.Name.slice(keyWord.length)} />
                                </View> :
                                <CustomText text={item.Name} />
                        }

                        <CustomText text={item.MallName} style={{ marginTop: 5, color: Theme.darkColor }} />
                    </View>
                </View>
                <CustomText text={item.TypeDesc} style={{ marginRight: 10 }} />
            </TouchableOpacity>
        )
    }
    _chooseHotel = () => {
        const { dataList } = this.state;
        return (
            <View>
                <FlatList
                    data={dataList}
                    renderItem={this._renderItem}
                    showsVerticalScrollIndicator={false}
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
                    // keyExtractor={(item, index) => String(index)}
                    // onEndReachedThreshold={0.1}
                    // ListFooterComponent={ViewUtil.getRenderFooter(isLoadingMore, isNoMoreData)}
                    // onEndReached={() => {
                    //     setTimeout(() => {
                    //         if (this.canLoad && !isNoMoreData && !isLoadingMore && !isLoading) {
                    //             this.state.page++;
                    //             this.setState({
                    //                 isLoadingMore: true
                    //             }, () => {
                    //                 this._loadList();
                    //                 this.canLoad = false;
                    //             })
                    //         }
                    //     }, 100)
                    // }}如家
                    onMomentumScrollBegin={() => {
                        this.canLoad = true
                    }}
                />
            </View>
        )

    }
    _searchOrder = () => {
        this._hiddenTipView()
        // this.setState({
        //     page: 1,
        //     dataList: [],
        //     isLoading: true,
        //     isLoadingMore: false,
        //     isNoMoreData: false,
        //     key_word: true,
        // }, () => {
        //     this.getFilterClick(hotelData.city);
        // })
    }
    _keyWordPage = () => {
        const { showCanton, hideCantonList, cantonList,
            businessList, hideBusinessList, showBusiness,
            airStationList, hideAitStationList, showAitStation,
            hospitalList, hideHospitalList, showHospital,
            cityScenicList, hideCityScenic, showCityScenic,
            scenicspotsList, hideScenicspots, showScenicspots,
            schoolList, hideSchool, showSchool,
            performList, hidePerform, showPerform,
            shopList, hideShopList, showShopList,isIntl,
            intlLocationList,OftenAddressList

        } = this.state
        return (
            isIntl
            ?
            <View>
                {
                   intlLocationList.map((item)=>{
                       return(
                           <View>
                               <View style={{ flexDirection: 'row', justifyContent: 'space-between', height: 50, alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 10 }}>
                                    <CustomText text={item.title}></CustomText>
                                </View>
                                {this._listView(item.data)}
                            </View>
                        )
                   }) 
                }
                {
                   OftenAddressList&&OftenAddressList.length>0 ?
                    <View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', height: 50, alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 10 }}>
                                <CustomText text={'常用地址'}></CustomText>
                        </View>
                        {this._listView(OftenAddressList)}
                    </View> : null                   
                }
            </View>
            :
            <ScrollView  keyboardShouldPersistTaps='handled' nestedScrollEnabled={true}>
                {/* 行政区 */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', height: 50, alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 10 }}>
                    <CustomText text={'行政区'}></CustomText>
                    <CustomText text={showCanton ? '收起' : '展开'} style={{ fontSize: 12, color: 'green' }}
                        onPress={() => {
                            this.setState({
                                showCanton: !showCanton,
                                hideCantonList: cantonList.slice(0, 9)
                            })
                        }}
                    />
                </View>
                {
                    showCanton == true ?
                        this._listView(cantonList)
                        : this._listView(hideCantonList)
                }
                {/* 商圈 */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', height: 50, alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 10 }}>
                    <CustomText text={'商圈'}></CustomText>
                    <CustomText text={showBusiness ? '收起' : '展开'} style={{ fontSize: 12, color: 'green' }}
                        onPress={() => {
                            this.setState({
                                showBusiness: !showBusiness,
                                hideBusinessList: businessList.slice(0, 9)
                            })
                        }}
                    />
                </View>
                {
                    showBusiness == true ?
                        this._listView(businessList)
                        :
                        this._listView(hideBusinessList)
                }
                {/* 机场车站 */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', height: 50, alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 10 }}>
                    <CustomText text={'机场/车站'}></CustomText>
                    <CustomText text={showAitStation ? '收起' : '展开'} style={{ fontSize: 12, color: 'green' }}
                        onPress={() => {
                            this.setState({
                                showAitStation: !showAitStation,
                                hideAitStationList: airStationList.slice(0, 9)
                            })
                        }}
                    />
                </View>
                {
                    showAitStation == true ?
                        this._listView(airStationList)
                        :
                        this._listView(hideAitStationList)
                }
                {/* 医院 */}
                {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', height: 50, alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 10 }}>
                    <CustomText text={'医院'}></CustomText>
                    <CustomText text={showHospital ? '收起' : '展开'} style={{ fontSize: 12, color: 'green' }}
                        onPress={() => {
                            this.setState({
                                showHospital: !showHospital,
                                hideHospitalList: hospitalList.slice(0, 9)
                            })
                        }}
                    />
                </View>
                {
                    showHospital == true ?
                        this._listView(hospitalList)
                        :
                        this._listView(hideHospitalList)
                } */}
                {/* 市内景点 */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', height: 50, alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 10 }}>
                    <CustomText text={'城市景点'}></CustomText>
                    <CustomText text={showCityScenic ? '收起' : '展开'} style={{ fontSize: 12, color: 'green' }}
                        onPress={() => {
                            this.setState({
                                showCityScenic: !showCityScenic,
                                hideCityScenic: cityScenicList.slice(0, 9)
                            })
                        }}
                    />
                </View>
                {
                    showCityScenic == true ?
                        this._listView(cityScenicList)
                        :
                        this._listView(hideCityScenic)
                }
                {/* 演出场馆 */}
                {
                    performList && performList.length > 0?
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', height: 50, alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 10 }}>
                        <CustomText text={'演出场馆'}></CustomText>
                        <CustomText text={showPerform ? '收起' : '展开'} style={{ fontSize: 12, color: 'green' }}
                            onPress={() => {
                                this.setState({
                                    showPerform: !showPerform,
                                    hidePerform: performList.slice(0, 9)
                                })
                            }}
                        />
                    </View>
                    :
                    null
                }
                
                {
                    showPerform == true ?
                        this._listView(performList)
                        :
                        this._listView(hidePerform)
                }
                {/* 购物中心 */}
                {
                    shopList && shopList.length > 0 ?
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', height: 50, alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 10 }}>
                        <CustomText text={'购物中心'}></CustomText>
                        <CustomText text={showShopList ? '收起' : '展开'} style={{ fontSize: 12, color: 'green' }}
                            onPress={() => {
                                this.setState({
                                    showShopList: !showShopList,
                                    hideShopList: shopList.slice(0, 9)
                                })
                            }}
                        />
                    </View>
                    :
                    null 
                }
                {
                    showShopList == true ?
                        this._listView(shopList)
                        :
                        this._listView(hideShopList)
                }
                <View style={{ height: 100 }} />
            </ScrollView>
        )
    }

}
const getPropsState = state => ({
    feeType: state.feeType.feeType,
    apply: state.apply.apply,
    comp_userInfo: state.comp_userInfo,
    comp_travelers: state.comp_travelers,
    compCreate_bool: state.compCreate_bool.bool,
    compSwitch: state.compSwitch.bool
})
const getAction = dispatch => ({
    setApply: (value) => dispatch(action.applySet(value)), 
    setCheckTravellers:(travellers)=>dispatch(action.setCheckTravellers(travellers)),   
})
export default connect(getPropsState,getAction)(HotelIndexScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    ad: {
        backgroundColor: "white",
        height: 40,
        marginHorizontal: 10,
        marginTop: 5,
        alignItems: 'center',
        flexDirection: "row",
        paddingHorizontal: 10
    },
    image: {
        height: 54,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white'
    },
    contain: {
        backgroundColor: Theme.normalBg,
        borderRadius: 6,
    },
    boxStyle:{
        flexDirection:'row',
        alignItems:'center',
        backgroundColor:'#fff',
        margin:5,
        borderRadius:5,
    },
    titleStyle: {
        height: 30,
        width: 1,
        backgroundColor: 'gray'
    },
    itemStyle: {
        borderTopWidth: 1,
        borderColor: Theme.lineColor,
        width: global.screenWidth / 3 - 22,
        alignItems: 'center',
        height: 50,
        justifyContent: 'center'
    },
    item_Style: {
        borderTopWidth: 1,
        borderColor: Theme.lineColor,
        width: global.screenWidth / 3,
        alignItems: 'center',
        height: 50,
        justifyContent: 'center',
        backgroundColor: '#fff'
    },
    rowView: {
        borderWidth: 1,
        borderColor: Theme.lineColor,
        borderRadius: 6,
        height: 50,
        alignItems: 'center',
        marginHorizontal: 10
    },
    listItemstyle: {
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderColor: Theme.lineColor,
        padding: 10,
        justifyContent: 'space-between'
    },
    histortText: {
        height: 26,
        color: Theme.darkColor,
        fontSize: 13,
        lineHeight: 26,
        textAlign: 'center',
        borderRadius:15,
        // paddingHorizontal:3
    },
    historView:{ 
        flexDirection: 'row', 
        flexWrap: 'wrap',
        paddingTop:10,
        // paddingHorizontal:15,
    }
})