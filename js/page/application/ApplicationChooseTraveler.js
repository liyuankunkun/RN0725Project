
import React from 'react';
import {
    View,
    StyleSheet,
    TouchableHighlight,
    TouchableOpacity,
    FlatList
} from 'react-native';
import SuperView from '../../super/SuperView';
import CustomText from '../../custom/CustomText';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Theme from '../../res/styles/Theme';
import Util from '../../util/Util';
import CommonService from '../../service/CommonService';
import AddpersonView from '../ComprehensiveOrder/View/AddpersonView';
import ComprehensiveService from '../../service/ComprehensiveService';
// import ApplicationService from '../../service/ApplicationService';
import UserInfoUtil from '../../util/UserInfoUtil';
import DepartView from '../common/DepartView';
import CustomTextInput from '../../custom/CustomTextInput';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ViewUtil from '../../util/ViewUtil';

export default class ApplicationChooseTraveler extends SuperView {
    constructor(props) {
        super(props);
        this.params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};
        this._navigationHeaderView = {
            title: '选择出差人'
        }
        this._tabBarBottomView = {
            bottomInset: true,
        }
        this.state = {
             // 员工
             employees: [],
             //常旅客
             travellers: [],
             // 用户信息
             userInfo: {},
             // 客户配置信息
             customerInfo: {},
             ReferenceEmployeeId:null,//选择的参考员工的Id
             ReferenceEmployeeName:'',
             ReferenceEmployee:{},
             // 费用归属
            ApproveOrigin: {},
            //费用预算
            costBudget: '',
        }
    }
    componentDidMount() {
        const {  ApproveOrigin } = this.state;
        this.showLoadingView();
        CommonService.getUserInfo().then(userInfoRes => {
            this.hideLoadingView();
            if (userInfoRes && userInfoRes.success && userInfoRes.data) {
                CommonService.customerInfo().then(response => {
                    if (response && response.success) {
                        let customerInfo = response.data;
                        Object.assign(ApproveOrigin, UserInfoUtil.ApproveOrigin(userInfoRes.data));
                        this.setState({
                            userInfo:userInfoRes.data,
                            customerInfo:customerInfo
                        }) 
                    } else {
                        this.hideLoadingView();
                        this.toastMsg(response.message);
                    }
                }).catch(error => {
                    this.hideLoadingView();
                    this.toastMsg(error.message);
                })
            } else {
                this.hideLoadingView();
            }
        }).catch(error => {
            this.toastMsg(error.message);
            this.hideLoadingView();
        })
    }
    _loadList = () => {
       
    }

    _selectTravelItem = (data) => {
        this.setState({
            selectApplication: data
        })
    }

    getApprover() {
        // const {ReferenceEmployeeId,applyEmployees} = this.params;
        const { employees, userInfo, ReferenceEmployeeId, ReferenceEmployee, ApproveOrigin, costBudget} = this.state;
        let PassengerId = employees&&employees.length>0 ? employees[employees.length-1].PassengerOrigin.EmployeeId : null
            let approverInfo = {
                PassengerList: employees,
                ApproveOrigin: ApproveOrigin,
                BusinessType: 15,
                ReferenceEmployeeId:ReferenceEmployeeId,
                ReferencePassengerId:PassengerId,
                CostBudget:costBudget
            }
            this.showLoadingView();
            CommonService.ApproveInfo(approverInfo).then(response => {
                this.hideLoadingView();
                if (response && response.success) {
                    // this.setState({
                    //     ApproverInfo: response.data ? response.data[0] : null
                    // })
                    this.push('ApplicationCreateOrder',{
                        applyEmployees:employees,
                        ReferenceEmployeeId:ReferenceEmployeeId,
                        ReferenceEmployee:ReferenceEmployee,
                        ApproverInfo:response.data ? response.data[0] : null,
                        CostBudget:costBudget
                    });
                } else {
                    this.toastMsg(response.message || '获取审批人信息失败');
                }
            }).catch(error => {
                this.hideLoadingView();
                this.toastMsg(error.message || '获取审批人信息异常');
            })
    }


    renderBody() {
        const { employees, ReferenceEmployeeName, customerInfo, ApproveOrigin, costBudget,ReferenceEmployeeId,ReferenceEmployee} = this.state;
        return (
            <View style={{ flex: 1 }}>
                <View style={{ position: 'relative', flex: 1,justifyContent:'space-between',marginHorizontal:10}}>
                <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
                <TouchableHighlight underlayColor='transparent' onPress={this._addPassenger.bind(this)}>
                            <View style={styles.section}>
                                <CustomText style={{ fontWeight: 'bold',fontSize:14 }} text={'选择出差员工'} />
                                <AntDesign name={'adduser'} size={22} color={Theme.theme} />
                            </View>
                    </TouchableHighlight>
                    <View style={{backgroundColor:'#fff',borderRadius:4}}>
                    {
                        <FlatList 
                            style={{marginHorizontal:10}}
                            data={employees}
                            showsVerticalScrollIndicator={false}
                            renderItem={this._emRenderRow}
                        />
                    }
                    </View>
                
                    { 
                        employees.length ? 
                            <TouchableHighlight underlayColor='transparent' onPress={this._approveClick.bind(this)}>
                                    <View style={styles.section}>                        
                                        <CustomText style={{ fontWeight: 'bold',fontSize:14,flex:3,marginLeft:5 }} text={'参考差标及审批流'} />
                                        <CustomText style={{ fontSize:14,flex:4,marginLeft:4 }} text={ReferenceEmployeeName} />
                                        <AntDesign name={'right'} size={18} color={Theme.theme} />
                                    </View>
                                </TouchableHighlight>
                        :null
                    }
                    {
                        customerInfo && customerInfo.Setting && customerInfo.Setting.IsShowCostBudget?
                            <View style={{ marginTop: 10, flexDirection: 'row', height: 44, alignItems: 'center', backgroundColor: 'white', paddingHorizontal: 10, borderRadius:4 }}>
                                <CustomText style={{ flex: 3 }} text='费用预算' />
                                <CustomTextInput  style={{ flex: 7 }} keyboardType='number-pad' placeholder='请填写费用预算' value={costBudget} onChangeText={(text) => this.setState({ costBudget: text })} />
                            </View>
                        : null
                    }
                    {
                        !ReferenceEmployeeId?null:
                        <DepartView
                            ApproveOrigin={ApproveOrigin}
                            customerInfo={customerInfo}
                            CustomerId={ReferenceEmployee&&ReferenceEmployee.CustomerId}
                            fromCreateApply={true}
                            approveOriginCallBack={()=>{
                                // this.getApprover()
                            }}
                        />
                    }
                    </KeyboardAwareScrollView>
                </View>
                {this._button()}
            </View>
        )
    }

    /**
     * 参考差标及审批流
     */
    _approveClick = () =>{
        const { employees, userInfo } = this.state;
        this.push('EmployeesScreen',{
            employees,
            userInfo,
            callBack:(obj)=>{
                this.setState({
                    ReferenceEmployeeId:obj.PassengerOrigin?obj.PassengerOrigin.EmployeeId:obj.Id,
                    ReferenceEmployeeName:obj.Name,
                    ReferenceEmployee:obj
                },()=>{
                    this._getApprove();
                })
            }
        });
    }

    _getApprove=()=>{
        const { employees,ReferenceEmployeeId } = this.state;
        let PassengerId = employees&&employees.length>0 ? employees[employees.length-1].PassengerOrigin.EmployeeId: null
        let model = {
            ReferenceEmployeeId:ReferenceEmployeeId,
            ReferencePassengerId:PassengerId,
        }
        CommonService.customerInfo(model).then(response => {
            if(response&&response.success&&response.data){
                 this.setState({
                    customerInfo:response.data
                 })
            }else{
                this.toastMsg('获取数据异常');
            }
            }).catch(error => {
                this.toastMsg(error.message);
            }) 

        this.setState({});
    }

    _emRenderRow=({item,index})=>{//员工
        return(
            <AddpersonView employeesItem={item} callBack={this._deleteChoose} editCallBack={()=>this._editPerson(index,1)}/>
        )
    }

    _editPerson= (index,type)=>{
        const { employees,travellers,customerInfo,ReferenceEmployeeId } = this.state;
        let data = null;
        if (type === 1) {
            data = employees[index];
        } else {
            data = travellers[index];
        }
    //    let customerInfo = this.props.customerInfo_userInfo.customerInfo;
        let model={
            ReferenceEmployeeId:ReferenceEmployeeId,
            ReferencePassengerId:data&&data.PassengerOrigin&&data.PassengerOrigin.EmployeeId,
        }
        CommonService.customerInfo(model).then(response => {
            if(response&&response.success&&response.data){
                this.push( 'IntlCompEditPassengerScreen', {
                        passenger: data, 
                        customerInfo:response.data,
                        index: type, 
                        from: 'em_presonal',
                        callBack: (obj) => {
                            if (data.cusInsurances) {
                                obj.cusInsurances = data.cusInsurances;
                            }
                            if (type === 1) {
                                employees[index] = obj;
                                if(obj.Mobile && obj.CertificateNumber && (obj.SexDesc || obj.Sex)){
                                    obj.highLight=false
                                }
                            } else {
                                travellers[index] = obj;
                            }
                            this.setState({});
                            }
                });
            }else{
                this.toastMsg('获取数据异常');
            }
            }).catch(error => {
                this.toastMsg(error.message);
            }) 
    }  

     //删除已选出差人
     _deleteChoose =(item)=>{
        const {employees, travellers} = this.state;
        if(item.item&&item.item.PassengerOrigin&&item.item.PassengerOrigin.Type==1){
            this.setState({
             ReferenceEmployeeId:null,
             ReferenceEmployeeName:null,
             ReferenceEmployee:null
            },()=>{
                this._getApprove()
            })
        }
        let employeesArr = JSON.parse(JSON.stringify(employees))//序列化反序列化法拷贝
        let employeesArr2 = employeesArr.filter(isMinNum);
        let travellersArr = JSON.parse(JSON.stringify(travellers))//序列化反序列化法拷贝
        let travellersArr2 = travellersArr.filter(isMinNum);
        function isMinNum(data_item) {
           return (JSON.stringify(data_item)  != JSON.stringify(item.item));
        }
         this.setState({
             employees:employeesArr2,
             travellers:travellersArr2
         })
     }

    _button(){
        return(
            <View>
                {
                    ViewUtil.getThemeButton(Util.Parse.isChinese()?'确定':'Start Booking',this._checkTravelApplyMode)
                }
                {/* <View style={{justifyContent:'center',alignItems:'center',paddingTop:8,}}>
                </View>
                <View style={Util.Parse.isChinese()?styles.endBtnStyle :styles.endBtnStyle2}>
                    <TouchableOpacity style={Util.Parse.isChinese()?styles._btnStyle2:styles._btnStyleEn2} onPress={()=>{
                        this._addClick(1);
                    }}>
                      <CustomText text='常用员工' style={{color:Theme.theme}}/>
                    </TouchableOpacity>
                 
                    <TouchableOpacity style={Util.Parse.isChinese()?styles.btnStyle:styles.btnStyleEn}
                        onPress={()=>{
                            this._checkTravelApplyMode()
                        }}
                    >
                      <CustomText text={Util.Parse.isChinese()?'确定':'Start Booking'} style={{color:'#fff'}}/>
                    </TouchableOpacity>
                </View> */}
            </View>
        )
    }

    _checkTravelApplyMode=()=>{
        const { employees } = this.state
        if(!(employees&&employees.length>0)){
            this.toastMsg('请选择出差人');
            return;
        }
        let model={
            travellerCustomerId: employees?.[0]?.CustomerId || null
        }
        CommonService.TravelApplyCheckTravelApplyMode(model).then(response => {
           if(response&&response.success){
              this._sureClick()
           }else{
              this.toastMsg('预定人所属公司订单模式与所选出差人的公司订单模式不一致，请联系差旅顾问协助，谢谢。')
           }
        }).catch(error => {
            this.toastMsg(error.message);
        })
    }

    _sureClick=()=>{
        const { employees,userInfo,ReferenceEmployeeId,ReferenceEmployee,costBudget, customerInfo,ApproveOrigin } = this.state;
        let customerInfoSet = customerInfo && customerInfo.Setting
        if(!costBudget && customerInfoSet.IsShowCostBudget){
            this.toastMsg('请填写费用预算');
            return;
        }
        
        if( !customerInfoSet.IsApplyHiddenProject && customerInfoSet.IsApplyHiddenDepartment){
           if(!parseInt(ApproveOrigin.ProjectId)){
            this.toastMsg('请选择项目出差');
            return
           }
        }
        
        let referenceId = ReferenceEmployeeId
        let PassengerId = employees&&employees.length>0 ? employees[employees.length-1].PassengerOrigin.EmployeeId : null
        if(employees&&employees.length===1 &&employees[0].PassengerOrigin&& employees[0].PassengerOrigin.EmployeeId == userInfo.Id ){
            referenceId = employees[0].PassengerOrigin&& employees[0].PassengerOrigin.EmployeeId
            PassengerId = employees[0].PassengerOrigin&& employees[0].PassengerOrigin.EmployeeId
        }

        let model={
            MassOrderId:null,
            Category:16,//业务分类（1:国内机票,4:国内酒店,5:火车票,6:港澳台及国际酒店,7:国际机票,16:申请单），该字段必填
            ReferenceEmployeeId:referenceId,//差旅规则及审批规则的参照员工ID。如果没有综合订单ID，且有多个出差员工时这个字段必填！（出差员工+当前预订人中的任意一人）
            ReferencePassengerId:PassengerId,
            ProjectId:ApproveOrigin.ProjectId,
            Travellers:employees,
            costBudget:costBudget
         }
         this.showLoadingView();
         ComprehensiveService.MassOrderCheckTravellers(model).then(response => {
          this.hideLoadingView();
              if (response && response.success&&response.data) {
                this.getApprover()
                // this.push('ApplicationCreateOrder',{applyEmployees:employees,ReferenceEmployeeId:ReferenceEmployeeId,ReferenceEmployee:ReferenceEmployee});
              }else{
                  this.hideLoadingView();
                  this.toastMsg(response.message);
              }
          }).catch(error => {
                  this.hideLoadingView();
                  this.toastMsg(error.message);
          }) 
    }

    _addClick=()=>{
        const { employees, travellers } = this.state;
        this.push('CompAddpersonsScreen',{
            index:1,
            title:'选择常用员工',
            passengers: [],
            callBack: (passengers) =>{
              passengers.forEach(item => {
                    // let obj = item.Certificates[0];
                    let obj = Array.isArray(item.Certificates) && item.Certificates.length > 0 ? item.Certificates[0] : null;
                    if (obj) {
                        item.NationalName = obj.NationalName,
                        item.NationalCode = obj.NationalCode,
                        item.CertificateType = obj.TypeDesc,
                        item.CertificateNumber = obj.SerialNumber,
                        item.CertificateExpire = obj.Expire,
                        item.IssueNationCode = obj.IssueNationCode,
                        item.IssueNationName = obj.IssueNationName,
                        item.SexDesc = obj.Sex === 1?'男':'女'
                    }
                        employees.push(item);                   
                })
                this.setState({});
              } 
            }
        );  
    }

    _addPassenger = () => {
        const { userInfo, employees } = this.state;
        if(typeof(userInfo.Permission)=="undefined"){this.toastMsg('获取用户信息中，请稍等'); return}
        if(userInfo.BookingMode===0){
            let CertifiList = JSON.parse(userInfo.Certificate)
            let user = {
                IsEmployee:true,
                SerialNumber:userInfo.SerialNumber,
                DepartmentId:userInfo.DepartmentId,
                DepartmentName:userInfo.Department&&userInfo.Department.Name,
                RulesTravelId:userInfo.RulesTravelId,
                RulesTravelName:userInfo.RulesTravel&&userInfo.RulesTravel.Name,
                RulesTravelDetails:userInfo.RulesTravel&&userInfo.RulesTravel.RuleTravelDetails,
                CardTravellerList:userInfo.CardTravellerList,
                Id:userInfo.Id,
                CustomerId: userInfo.Customer&&userInfo.Customer&&userInfo.Customer.Id,
                Name:userInfo.Name,
                Gender:userInfo.Sex,
                Mobile:userInfo.Mobile,
                Certificates:CertifiList,
                Birthday:userInfo.Birthday,
                Email:userInfo.Email,
                Surname:userInfo.LastName,
                GivenName:userInfo.FirstName,
                IsVip:userInfo.IsVip,
                PassengerType:1,
                PassengerOrigin:{Type:1,EmployeeId:userInfo.Id,TravellerId:null}, 
                Addition:userInfo.Addition,
                CostCenter:null,//
                SeqNo:0,//
                ApprovalData:{},//
                CostCenterRequired:false,//
                EmailRequired:false,//
                OrderId:0,//  
                NationalName:CertifiList&&CertifiList[0]&&CertifiList[0].NationalName,
                Nationality:CertifiList&&CertifiList[0]&&CertifiList[0].Nationality,
                NationalCode:CertifiList&&CertifiList[0]&&CertifiList[0].NationalCode,
                CertificateType:CertifiList&&CertifiList[0]&&CertifiList[0].TypeDesc,
                CertificateNumber:CertifiList&&CertifiList[0]&&CertifiList[0].SerialNumber,
                CertificateExpire:CertifiList&&CertifiList[0]&&CertifiList[0].Expire,
                IssueNationCode:CertifiList&&CertifiList[0]&&CertifiList[0].IssueNationCode,
                IssueNationName:CertifiList&&CertifiList[0]&&CertifiList[0].IssueNationName,
                SexDesc:userInfo.Sex === 1?'男':'女',

            }
            if(employees.length>0){
                this.toastMsg('已添加本人');
            }else{
                employees.push(user);
                this.setState({
                    ReferenceEmployeeId:employees[0].PassengerOrigin.EmployeeId,
                    ReferenceEmployeeName:employees[0].Name,
                    ReferenceEmployee:employees[0]
                });
            }
            
        }else{
            this._addPerson()
        }
        // this._addPerson(index)
        
    } 
    /**
     * 添加员工或常旅客方法
     */
     _addPerson=()=>{
        const { employees, travellers, ReferenceEmployeeId, userInfo } = this.state;
        this.push('PassengerViewScreen', {
            title: '选择其他员工',
            fromccd:true,
            // fromComp:1,
            passengers: [],
            callBack: (passengers) => {
                passengers.map((passengerItem)=>{
                    if(passengerItem.CertificateType){
                        let  Certificate = {
                            Expire: passengerItem.CertificateExpire,
                            ImageUrl: null,
                            IssueNationCode:  passengerItem.IssueNationCode,
                            IssueNationName: passengerItem.IssueNationName,
                            NationalCode: passengerItem.NationalCode,
                            NationalName: passengerItem.NationalName,
                            SerialNumber: passengerItem.CertificateNumber,
                            Type: Util.Read.certificateType(passengerItem.CertificateType),
                            TypeDesc: passengerItem.CertificateType,
                        }
                        passengerItem.Certificates = [Certificate]
                    }
                })
                passengers.map((passengerItem)=>{
                    // let obj = passengerItem.Certificates[0];
                    let obj = Array.isArray(passengerItem.Certificates) && passengerItem.Certificates.length > 0 ? passengerItem.Certificates[0] : null;
                    if (obj) {
                        passengerItem.CertificateType = obj.TypeDesc;
                        passengerItem.CertificateId = obj.Type;
                        passengerItem.CertificateNumber = obj.SerialNumber;
                        passengerItem.CertificateExpire = obj.Expire;
                        passengerItem.NationalName = obj.NationalName;
                        passengerItem.NationalCode = obj.NationalCode;
                        passengerItem.IssueNationName = obj.IssueNationName; 
                        passengerItem.IssueNationCode = obj.IssueNationCode; 
                    }
                })
                passengers.forEach(item => {
                        employees.push(item);
                })
                if(employees.length==1 && employees[0].PassengerOrigin.EmployeeId === userInfo.Id){
                    this.setState({
                        ReferenceEmployeeId:employees[0].PassengerOrigin.EmployeeId,
                        ReferenceEmployeeName:employees[0].Name,
                        ReferenceEmployee:employees[0]
                    })
                }else{
                    this.setState({
                        ReferenceEmployeeId:null,
                        ReferenceEmployeeName:null,
                        ReferenceEmployee:null
                    })
                }
                // let PassengerId = employees&&employees.length>0 ? employees[employees.length-1].PassengerOrigin.EmployeeId: null
                // let model = {
                //     ReferenceEmployeeId:ReferenceEmployeeId,
                //     ReferencePassengerId:PassengerId,
                // }
                // CommonService.customerInfo(model).then(response => {
                //     if(response&&response.success&&response.data){
                //          this.setState({
                //             customerInfo:response.data
                //          })
                //     }else{
                //         this.toastMsg('获取数据异常');
                //     }
                //     }).catch(error => {
                //         this.toastMsg(error.message);
                //     }) 

                this.setState({});
            }
        })
    }

}

const styles = StyleSheet.create({
    bottomView: {
        height: 40,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-around',
        
    },
    section: {
        // height: 44,
        padding: 10,
        flexDirection: "row",
        justifyContent: 'space-between',
        alignItems: "center",
        borderColor:'lightgray',
        backgroundColor:'#fff',
        marginTop:10,
        borderRadius:4,
    },
    clickstyle: { 
        margin: 10,
        borderRadius:6, 
        backgroundColor:'#fff',
        padding:6,  
        elevation:1.5, shadowColor:'#999999', shadowOffset:{width:5,height:5}, shadowOpacity: 0.2, shadowRadius: 1.5
    },
    endBtnStyle:{
        flexDirection:'row',
        justifyContent:'space-around',
        marginBottom:10
    },
    endBtnStyle2:{
        alignItems:'center',
        justifyContent:'center',
    },
    _btnStyle2:{
        height:36,
        width:110,
        borderColor:Theme.theme,borderWidth:1,
        borderRadius:18,
        alignItems:'center',
        justifyContent:'center',
      },
      btnStyle: {
            height:36,width:110,
            backgroundColor:Theme.theme,
            borderRadius:18,
            alignItems:'center',
            justifyContent:'center',
      },
      _btnStyleEn2:{
        height:36,
        width:300,
        borderColor:Theme.theme,borderWidth:1,
        borderRadius:18,
        alignItems:'center',
        justifyContent:'center',
        marginTop:6
      },
      btnStyleEn: {
            height:36,width:300,
            backgroundColor:Theme.theme,
            borderRadius:18,
            alignItems:'center',
            justifyContent:'center',
            marginTop:6
      },
})