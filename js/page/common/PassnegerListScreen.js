import React from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    TouchableHighlight,
    Keyboard,
} from 'react-native';
import SuperView from '../../super/SuperView';
import SearchPeopleInput from '../../custom/SearchPeopleInput';
import ViewUtil from '../../util/ViewUtil';
import CustomText from '../../custom/CustomText';
import Theme from '../../res/styles/Theme';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { connect } from 'react-redux';
import I18nUtil from '../../util/I18nUtil';
import action from '../../redux/action';
import Util from '../../util/Util';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
class PassengerListScreen extends SuperView {
    constructor(props) {
        super(props);
        this.params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};
        this.passengers = Util.Encryption.clone(this.params.passengers);
        this._navigationHeaderView = {
            title: '选择出行人',//选择常用旅客 选择常用员工
            // rightButton:  <TouchableHighlight underlayColor='transparent' onPress={this._finishBtnClick}>
            //        <CustomText text={"完成"} style={{ fontSize:Util.Parse.isChinese()?16:14, color: Theme.fontColor, paddingRight:Util.Parse.isChinese()?16:5}} />
            // </TouchableHighlight>
            // ViewUtil.getRightButton("完成", this._finishBtnClick)
        }
        this._tabBarBottomView = {
            bottomInset: true,
            bottomColor: 'white'
        }
    }
    /**
     *  完成
     */
    _finishBtnClick = () => {
        const { callBack } = this.params;
        callBack(this.passengers);
        this.pop();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        let { passengerReset } = this.props;
        passengerReset()
    }

    componentDidMount = () => {
        this.clickSerch()
    }

    _changeText = (text) => {
        const { passenger, passengerLoad } = this.props;
        const {fromComp} = this.params;
        passenger.keyWord = text;
        if(this.params.from=='enterpriseManager'){
            passenger.IsNotManager = true;
        }
        this.setState({});
        if (text.length < 2) return;
        // passengerLoad(
        //     Util.Encryption.clone(passenger), 
        //     (this.params.title === PassengerType.employee ||this.params.from==='enterpriseManager') ? 1 : 2,
        //      (message) => {this.toastMsg(message);},fromComp
        //     );
    }
    clickSerch = () => {
        const { passenger, passengerLoad } = this.props;
        const {fromComp,fromccd} = this.params;
        Keyboard.dismiss();
        passengerLoad(
            Util.Encryption.clone(passenger), 
            (this.params.title === PassengerType.employee ||this.params.from==='enterpriseManager') ? 1 : 2,
             (message) => {this.toastMsg(message);},fromComp,this,fromccd
        );
    }
    _refresh = () => {
        const { passenger, passengerLoad } = this.props;
        const {fromComp} = this.params;
        if (passenger.keyWord.length < 2) return;
        passengerLoad(Util.Encryption.clone(passenger), (this.params.title === PassengerType.employee ||this.params.from==='enterpriseManager') ? 1 : 2, (message) => {
            this.toastMsg(message);
        },fromComp,this
        );
    }

    /**
     *  添加常旅客
     */
    _addTraveller = () => {
        let customerInfo = this.props.customerInfo_userInfo.customerInfo;
        let ToIdnex = '';
        if (this.params.from === 'flight' || this.params.from === 'apply') {
            ToIdnex = 'FlightEditPassenger';
        }
        else if (this.params.from === 'train') {
            ToIdnex = 'TrainEditPassenger';
        } 
        else if (this.params.from === 'hotel') {
            // ToIdnex = 'HotelAddPassenger';
            // ToIdnex = 'HotelEditPassengerScreen';
            this.push('HotelEditPassengerScreen', {
                from: 'presonal',
                title:'新增入住人',
                customerInfo,
                callBack: (obj) => {
                this.passengers.push(obj);
                this.params.callBack(this.passengers);
                this.pop();
              }
            });
            return;
        }else if (this.params.from === 'comp_traveller' || this.params.from === 'intlFlight') {//综合订单新增常旅客
            console.log('新增常旅客======');
            this.push('IntlFlightEditPassenger', {
                from: 'presonal',
                title:'新增乘客',
                customerInfo,
                callBack: (obj) => {
                this.passengers.push(obj);
                this.params.callBack(this.passengers);
                this.pop();
              }
            });
            return;
        }

        if (!ToIdnex) {
            this.toastMsg('未识别的新增乘客入口');
            return;
        }
        this.push(ToIdnex, {
            customerInfo,
            title:'新增乘客',
            index: 2, callBack: (obj) => {
                this.passengers.push(obj);
                this.params.callBack(this.passengers);
                this.pop();
            }
        })
    }
    _rowClick = (item) => {
        const getPassengerId = (passenger) => {
        if (!passenger || !passenger.PassengerOrigin) return null;
        return passenger.IsEmployee ? passenger.PassengerOrigin.EmployeeId : passenger.PassengerOrigin.TravellerId;};
        const isPassengerMatch = (obj, item) => {
            const objId = getPassengerId(obj);
            const itemId = getPassengerId(item);
            return objId !== null && objId === itemId;
        };
        let index = this.passengers.findIndex(passenger => isPassengerMatch(passenger, item));//判断是否选中
        if (index > -1) {
            this.passengers.splice(index, 1);
        } else {
            this.passengers.push(item);
        }
        this.setState({});
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
        const getPassengerId = (passenger) => {
            if (!passenger || !passenger.PassengerOrigin) return null;
            return passenger.IsEmployee ? passenger.PassengerOrigin.EmployeeId : passenger.PassengerOrigin.TravellerId;
          };
          
          const isPassengerMatch = (obj, item) => {
            const objId = getPassengerId(obj);
            const itemId = getPassengerId(item);
            return objId !== null && objId === itemId;
          };
          const isShow = this.passengers.findIndex(passenger => isPassengerMatch(passenger, item)) > -1;//判断是否选中
        return (
            <TouchableHighlight underlayColor='transparent' onPress={this._rowClick.bind(this, item)}>
                <View style={styles.row} >
                    <View style={{  justifyContent: "center", flex: 1 }}>
                        <View style={{flexDirection:'row'}}>
                            <View style={{
                                    paddingHorizontal:5,
                                    paddingVertical:2,
                                    backgroundColor:item.PassengerOrigin.Type==1?Theme.greenBg:Theme.orangeBg,
                                    borderWidth:1,
                                    borderColor:item.PassengerOrigin.Type==1?Theme.theme:Theme.orangeColor,
                                    // width:38,
                                    justifyContent:'center',
                                    alignItems:'center',
                                    borderRadius:2}}>
                                <CustomText text={item.PassengerOrigin.Type==1?'员工':'临客'} style={{fontSize:11,color:item.PassengerOrigin.Type==1?Theme.theme:Theme.orangeColor}}/> 
                            </View>
                            <CustomText text={item.Name + (item.WorkingName?item.WorkingName:'')} style={{fontSize:16, marginLeft:8}} /> 
                        </View>
                        <CustomText text={item.Email}  style={{color:Theme.assistFontColor, marginTop:8}}  /> 
                    </View>
                    <MaterialIcons
                        name={isShow ? 'check-box' : 'check-box-outline-blank'}
                        size={20}
                        color={isShow ? Theme.theme : Theme.assistFontColor}
                    />
                </View>
            </TouchableHighlight>
        )
    }
    _renderFooter = () => {
        const { passenger } = this.props;

        if (passenger.loadingMore) {
            return (
                <View style={{ alignItems: 'center' }}>
                    <ActivityIndicator style={{ color: Theme.theme, margin: 10 }} />
                    <CustomText text={I18nUtil.translate('正在加载更多') + '...'} />
                </View>
            )
        }
        if (passenger.isNoMoreData) {
            return (
                <View style={{ alignItems: 'center' }}>
                    <CustomText text={I18nUtil.translate('没有更多数据了') + '...'} />
                </View>
            )
        }
        return null;
    }
    renderBody() {
        const { title,fromccd } = this.params;
        const { passenger } = this.props;
        return (
            <View style={{ }}>
                <View style={{ height:global.screenHeight-180 }}>
                    <SearchPeopleInput placeholder='请输入至少2个连续字进行搜索' value={passenger.keyWord} 
                                onChangeText={this._changeText} 
                                onChangeBtn={()=>{this.clickSerch()}}
                    />
                    <FlatList
                        style={{ marginTop:5 }}
                        data={passenger.data}
                        renderItem={this._renderItem}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={(item, index) => String(index)}
                        refreshControl={ViewUtil.getRefreshControl(passenger.isLoading, () => {
                            this._refresh()
                        })}
                        onEndReachedThreshold={0.5}
                        onEndReached={() => {
                            setTimeout(() => {
                                if (this.canLoadMore && !passenger.isNoMoreData) {
                                    this.canLoadMore = false;
                                }
                            }, 100);
                        }}
                        ListFooterComponent={this._renderFooter}
                        onMomentumScrollBegin={() => {
                            this.canLoadMore = true;
                        }}
                    />
                    {
                        // title === PassengerType.traverller ?
                            // <TouchableHighlight underlayColor='transparent' onPress={this._addTraveller}>
                            //     <View style={{ height: 40, backgroundColor: 'white', justifyContent: "center", alignItems: 'center', flexDirection: 'row' }}>
                            //         <AntDesign name={'adduser'} size={26} color={Theme.theme} />
                            //         <CustomText text={
                            //             this.params.from === 'hotel'? 
                            //                  '新增入住人' 
                            //                  : this.params.from === 'comp_traveller'?'新增常旅客':
                            //                  '新增乘客'
                            //             } style={{ color: Theme.theme, marginLeft: 5 }} />
                            //     </View>
                            // </TouchableHighlight>
                            // : null
                            // <View style={{height:80,width:global.screenWidth,backgroundColor:'#fff',flexDirection:'row',alignItems:'center',justifyContent:'center',paddingBottom:10}}>
                            //     <View style={{height:44, width:168, borderWidth:1, borderColor:Theme.theme, borderRadius:4,alignItems:'center',justifyContent:'center'}}>
                            //         <CustomText text={'新增临客'} style={{fontSize:16, color:Theme.theme}}></CustomText>
                            //     </View>
                            //     <View style={{height:44, width:168,backgroundColor:Theme.theme,marginLeft:9, borderRadius:4,alignItems:'center',justifyContent:'center'}}>
                            //         <CustomText text={'确定'} style={{fontSize:16, color:'#fff'}}></CustomText>
                            //     </View>
                            // </View>
                            
                    }
                </View>
                {
                    fromccd || !(this.props.customerInfo_userInfo.userInfo.Permission & 2)>0?
                    ViewUtil.getThemeButton('确定',this._finishBtnClick):
                    ViewUtil.getTwoBottomBtn('新增临客',this._addTraveller,'确定',this._finishBtnClick)
                }
            </View>
        )
    }
}
const getStateProps = state => ({
    passenger: state.passenger,
    customerInfo_userInfo: state.customerInfo_userInfo
})
const getActionProps = dispatch => ({
    passengerLoad: (passenger, index, callBack, fromComp, that,fromccd) => dispatch(action.passengerLoad(passenger, index, callBack, fromComp, that,fromccd)),
    passengerReset: () => dispatch(action.passengerReset())
})
export default connect(getStateProps, getActionProps)(PassengerListScreen);

const PassengerType = {
    traverller: '选择常用旅客',
    employee: '选择其他员工'
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        flex: 1,
        // borderBottomColor: Theme.lineColor,
        // borderBottomWidth: 1,
        backgroundColor: 'white',
        alignItems: 'center',
        padding: 20,
        marginHorizontal:10,
        marginBottom:10,
    }
})
