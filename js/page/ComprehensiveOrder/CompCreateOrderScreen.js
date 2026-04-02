import React from 'react';
import {
    View,
    StyleSheet,
    TouchableHighlight,
    FlatList,
    TouchableOpacity,
    ScrollView,
    Switch
} from 'react-native';
import SuperView from '../../super/SuperView';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CommonService from '../../service/CommonService';
import Theme from '../../res/styles/Theme';
import AntDesign from 'react-native-vector-icons/AntDesign';
import CustomText from '../../custom/CustomText';
import UserInfoUtil from '../../util/UserInfoUtil';
import { connect } from 'react-redux';
import actions from '../../redux/action';
import AddpersonView from './View/AddObjectView';
import ComprehensiveService from '../../service/ComprehensiveService'
import Util from '../../util/Util'
import SonyList from '../../res/js/SonyList';

class CompCreateOrderScreen extends SuperView {

    constructor(props) {
        super(props);
        this.params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};
        this.customerInfo = this.params.customerInfo || {};
        this._navigationHeaderView = {
            title:'新建综合订单',
        }
        this._tabBarBottomView = {
            bottomInset: true,
            bottomColor: "white"
        }
        // this.backPress = new BackPress({ backPress: () => this._backBtnClick() })
        let businessCategory = null
        if(this.props.apply&&this.props.apply.selectApplyItem&&this.props.apply.selectApplyItem.BusinessCategory){
            businessCategory = this.props.apply.selectApplyItem.BusinessCategory
        }else if(this.props.apply&&this.props.apply.BusinessCategory){
            businessCategory = this.props.apply.BusinessCategory
        }
        let typelist = [
            {
                type: 1,
                name: '国内机票',
                typeId:1,
                hasAuth:Util.Encryption.clone(this.customerInfo&&this.customerInfo.Addition&&this.customerInfo.Addition.HasAirAuth)
            },
            {
                type: 7,
                name: '港澳台及国际机票',
                typeId:8,
                hasAuth:Util.Encryption.clone(this.customerInfo&&this.customerInfo.Addition&&this.customerInfo.Addition.HasInterAirAuth)
            },
            {
                type: 5,
                name: '火车票',
                typeId:2,
                hasAuth:Util.Encryption.clone(this.customerInfo&&this.customerInfo.Addition&&this.customerInfo.Addition.HasTrainAuth)
            },
            {
                type: 4,
                name: '国内酒店',
                typeId:4,
                hasAuth:Util.Encryption.clone(this.customerInfo&&this.customerInfo.Addition&&this.customerInfo.Addition.HasHotelAuth)
            },
            {
                type: 6,
                name: '港澳台及国际酒店',
                typeId:16,
                hasAuth:Util.Encryption.clone(this.customerInfo&&this.customerInfo.Addition&&this.customerInfo.Addition.HasInterHotelAuth)
            },
        ]

        this.state = {
            // 员工
            employees: [],
            //常旅客
            travellers: [],
            // 用户信息
            userInfo: {},
            customerInfo: this.params.customerInfo || {},
            /**
             * 业务选择
             */
            typeList:typelist,
            selectTap:this.params.selectTap,//选择的业务
            ProjectId:null,
            ProjectName:null,
            objectValue:false,
            ReferenceEmployeeId:null,//选择的参考员工的Id
            ReferenceEmployeeName:'',
            ReferenceEmployee:{},
            ProjectItem:null,
            applyNum:this.props.apply&&this.props.apply.SerialNumber,//出差单号
            businessCategory:businessCategory,
            category:this.params.categoryId,
            arrivalCityDisplay:this.params.cityList&&this.params.cityList[1],
            goCityDisplay:this.params.cityList&&this.params.cityList[0],
            selectApplyItem:this.props.apply&&this.props.apply.selectApplyItem,
            chooseApply:true,//创建时是否选择了申请单
            // 费用归属
            ApproveOrigin: {},
            
            //费用预算
            costBudget: '',
        }
    }
    
    // 重置手势滑动
    static navigationOptions = ({ navigation }) => {
        return {
            gesturesEnabled: false
        }
    }

    /**
       *  获取差旅标准
       */
    _getTravelRule = () => {
        
    }

    componentDidMount() {
        const {apply} = this.props;
        const { ApproveOrigin } = this.state;
        this.showLoadingView();
        CommonService.getUserInfo().then(userInfoRes => {
            this.hideLoadingView();
            if (userInfoRes && userInfoRes.success && userInfoRes.data) {
                 Object.assign(ApproveOrigin, UserInfoUtil.ApproveOrigin(userInfoRes.data));
                 this.setState({
                    userInfo:userInfoRes.data,
                 }) 
            } else {
                this.hideLoadingView();
            }
        }).catch(error => {
            this.toastMsg(error.message);
            this.hideLoadingView();
        })
        if(apply){
            this._queryTravellers(apply.Id);  
        }
    }

    _addPassenger = (index) => {
        const { userInfo, employees } = this.state;
        if(typeof(userInfo.Permission)=="undefined"){this.toastMsg('获取用户信息中，请稍等'); return}
        if(userInfo.BookingMode===0 && index===1){
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
                PassengerOrigin:{Type:1,EmployeeId:userInfo.Id,TravellerId:0}, 
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
                this.setState({});
            }
            
        }else{
            this._addPerson(index)
        }
        
    } 
    /**
     * 添加员工或常旅客方法
     */
     _addPerson=(index)=>{
        const { employees, travellers,ReferenceEmployeeId,userInfo } = this.state;
        this.push('PassengerViewScreen', {
            title: index === 1 ? '选择其他员工' : '选择常用旅客',
            // from:index === 1 ?1:0,
            from:'comp_traveller',
            fromComp:1,
            passengers: [],
            callBack: (passengers) => {
                if(passengers[0]&&passengers[0].CertificateType){
                    let  Certificate = {
                        Expire: passengers[0].CertificateExpire,
                        ImageUrl: null,
                        IssueNationCode:  passengers[0].IssueNationCode,
                        IssueNationName: passengers[0].IssueNationName,
                        NationalCode: passengers[0].NationalCode,
                        NationalName: passengers[0].NationalName,
                        SerialNumber: passengers[0].CertificateNumber,
                        Type: Util.Read.certificateType(passengers[0].CertificateType),
                        TypeDesc: passengers[0].CertificateType,
                    }
                    passengers[0].Certificates = [Certificate]
                }
                passengers&&passengers.map((item)=>{
                    // let Certificate = item.Certificates?item.Certificates[0]:item.CertificateList?item.CertificateList[0]:null
                    // let Certificatelist = item.Certificates?item.Certificates:item.CertificateList?item.CertificateList:null
                    let Certificate = Array.isArray(item.Certificates) && item.Certificates.length > 0
                        ? item.Certificates[0]
                        : Array.isArray(item.CertificateList) && item.CertificateList.length > 0
                            ? item.CertificateList[0]
                            : null;

                    let Certificatelist = Array.isArray(item.Certificates) && item.Certificates.length > 0
                        ? item.Certificates
                        : Array.isArray(item.CertificateList) && item.CertificateList.length > 0
                            ? item.CertificateList
                            : null;
                    if(Certificate){
                        item.CertificateType = Certificate.TypeDesc;
                        item.CertificateId = Certificate.Type;
                        item.CertificateNumber = Certificate.SerialNumber;
                        item.CertificateExpire = Certificate.Expire;
                        item.NationalName = Certificate.NationalName;
                        item.NationalCode = Certificate.NationalCode;
                        item.IssueNationName = Certificate.IssueNationName; 
                        item.IssueNationCode = Certificate.IssueNationCode;
                        item.Gender =  Certificate.Sex;
                        item.Certificate =  JSON.stringify(Certificatelist);
                    }
                    if(index===1){
                        employees.push(item);
                    }else{
                        travellers.push(item)
                    }
                })
                this.setState({
                    employees:employees
                });
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
                        // this.customerInfo = response.data
                    }else{
                        this.toastMsg('获取数据异常');
                    }
                    }).catch(error => {
                        this.toastMsg(error.message);
                    }) 
                this.setState({});
            }
        })
    }
    /**
     * 项目出差
     */
     _objectClick = () =>{
        const { ReferenceEmployee } = this.state
        this.push('ProjectScreen', {
            title: '选择项目',
            CustomerId: ReferenceEmployee&&ReferenceEmployee.CustomerId,
            callBack: (obj) => {
                this.setState({
                    ProjectId:obj.Id,
                    ProjectName:obj.Name,
                    ProjectItem:obj
                })
            }
        });
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
                    ReferenceEmployee:obj,
                    //重选参考人清空项目
                    ProjectId:null,
                    ProjectName:null,
                    ProjectItem:null
                })
            }
        });
    }

    _editPerson= (index,type)=>{
        const { employees,travellers,ReferenceEmployeeId } = this.state;
        let data = null;
        if (type === 1) {
            data = employees[index];
            let model={
                ReferenceEmployeeId:ReferenceEmployeeId,
                ReferencePassengerId:data&&data.PassengerOrigin&&data.PassengerOrigin.EmployeeId,
            }
            CommonService.customerInfo(model).then(response => {
                if(response&&response.success&&response.data){
                    this.push( 'CompEditPassengerScreen', {
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
                }
            }).catch(error => {
                this.toastMsg(error.message);
            })     
        } else {
            data = travellers[index];
            let customerInfo = this.props.customerInfo_userInfo.customerInfo;
            this.push( 'CompEditPassengerScreen', {
                passenger: data, 
                customerInfo:customerInfo,
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
        }
    }
      
    _emRenderRow=({item,index})=>{//员工
        return(
            <AddpersonView employeesItem={item} callBack={this._deleteChoose} editCallBack={()=>this._editPerson(index,1)}/>
        )
    }
    _trRenderRow=({item,index})=>{//常旅客
        return(
            <AddpersonView employeesItem={item} callBack={this._deleteChoose} editCallBack={()=>this._editPerson(index,2)}/>
        )
    }

    /**
     * 选择出差申请单
     */
    _chooseApplybtn = () => {
        const {typeList} = this.state;
        this.push('ApplicationSelect',{
            from:'creatComp',
            callBack:(obj,arrivalCityDisplay,goCityDisplay,BeginTime,EndTime,selectApplyItem)=>{
                selectApplyItem&&selectApplyItem.BusinessCategory
                let CategoryList = []
                let CategoryList2 = []
                typeList.map((item, index)=>{
                    if(selectApplyItem&&selectApplyItem.BusinessCategory&item.typeId){
                        CategoryList.push(item.type);
                        CategoryList2.push(item.typeId);
                    }
                }) 
                this._queryTravellers(obj.Id);             
                this.setState({
                    applyNum:obj.SerialNumber,
                    selectTap:CategoryList[0],
                    category:CategoryList2[0],
                    businessCategory:selectApplyItem&&selectApplyItem.BusinessCategory?selectApplyItem.BusinessCategory:obj.BusinessCategory,
                    arrivalCityDisplay:arrivalCityDisplay,
                    goCityDisplay:goCityDisplay,
                    selectApplyItem:selectApplyItem,
                })
            }
        });
    }

    _chooseApply=()=>{
        const { applyNum } = this.state;
        return(
            <View style={{margin:10,backgroundColor:'#fff', paddingHorizontal: 10,flexDirection: "row",alignItems: "center",borderRadius:6}}>
                    <CustomText text={'出差单 '} style={{padding:10,fontWeight: 'bold',fontSize:15}}></CustomText>
                    <TouchableOpacity style={{
                                        borderWidth:1,
                                        width:global.screenWidth-170,
                                        height:40,
                                        margin:10,
                                        borderRadius:4,
                                        borderColor:Theme.theme,
                                        alignItems:'center',
                                        justifyContent:'center',
                                    }} onPress={()=>{
                        this._chooseApplybtn()
                    }}>
                       <CustomText style={{color:applyNum?"":Theme.darkColor}} text={applyNum?applyNum:'请选择申请单'}></CustomText>
                    </TouchableOpacity>
            </View>
        )
    }

    renderBody() {
        const { userInfo, travellers, employees,typeList,selectTap ,ProjectName,ReferenceEmployeeName,businessCategory,ApproveOrigin,customerInfo,ReferenceEmployeeId} = this.state;
        const { apply } = this.props;
        let employeeId = employees && employees[0] && employees[0].PassengerOrigin && employees[0].PassengerOrigin.EmployeeId
        let HasTravelApplyAuth =  customerInfo&&customerInfo.Addition.HasTravelApplyAuth
        return (
            <View style={{ position: 'relative',marginTop:5,flex:1}}>
                {HasTravelApplyAuth?this._chooseApply():null}
                <ScrollView>
                    <TouchableHighlight underlayColor='transparent' onPress={this._addPassenger.bind(this, 1)}>
                            <View style={styles.section}>
                                <CustomText style={{ fontWeight: 'bold',fontSize:15 }} text={userInfo.BookingMode===0?'为本人预订':'为员工预订'} /> 
                                <AntDesign name={'adduser'} size={26} color={Theme.theme} />
                            </View>
                    </TouchableHighlight>
                    {
                        <FlatList 
                            style={{marginHorizontal:10}}
                            data={employees}
                            keyExtractor = {(item, index) => index }
                            showsVerticalScrollIndicator={false}
                            renderItem={this._emRenderRow}
                        />
                    }
                    <TouchableHighlight underlayColor='transparent' onPress={this._addPassenger.bind(this, 2)}>
                            <View style={styles.section}>
                                <CustomText style={{ fontWeight: 'bold',fontSize:15 }} text={'为常旅客预订(非员工)'} />
                                <AntDesign name={'adduser'} size={26} color={Theme.theme} />
                            </View>
                    </TouchableHighlight>
                    {
                        <FlatList 
                            style={{marginHorizontal:10}}
                            data={travellers}
                            keyExtractor = {(item, index) => index }
                            showsVerticalScrollIndicator={false}
                            renderItem={this._trRenderRow}
                        />
                    }
            
                    {
                        employees.length?  
                            <TouchableHighlight underlayColor='transparent' onPress={this._approveClick.bind(this)}>
                                <View style={styles.section}>                        
                                    <CustomText style={{ fontWeight: 'bold',fontSize:15,flex:3,marginLeft:5 }} text={'参考差标及审批流'} />
                                    <CustomText style={{ fontSize:14,flex:4,marginLeft:4 }} text={ReferenceEmployeeName} />
                                    <AntDesign name={'right'} size={22} color={Theme.theme} />
                                </View>
                            </TouchableHighlight>
                        :null
                    }
                    { !ReferenceEmployeeId?null:
                      employees&&employees.length>0 && customerInfo.Setting&&customerInfo.Setting.MassOrderConfig&&customerInfo.Setting.MassOrderConfig.ShowProject?
                        <TouchableHighlight underlayColor='transparent' onPress={this._objectClick.bind(this)}>
                            <View style={styles.section}>
                                <Switch value={ProjectName?true:false} trackColor={Theme.theme} 
                                        onValueChange = {(value)=>{    
                                            if(ProjectName){
                                            this.setState({
                                                objectValue:false,
                                                ProjectName:null
                                            }) 
                                            }else{
                                                this._objectClick() 
                                            }
                                        }}
                                >
                                </Switch>
                                <CustomText style={{ fontWeight: 'bold',fontSize:15,flex:1,marginLeft:5 }} text={'项目出差'} />
                                <CustomText style={{ fontSize:14,flex:2,marginLeft:5 }} text={ProjectName} />
                                <AntDesign name={'right'} size={22} color={Theme.theme} />
                            </View>
                    </TouchableHighlight>:null
                    }
                        <View style={styles.viewStyle}>
                            <CustomText style={styles.textStyle} text={'预订业务'} />
                            <View style={{flexDirection:'row',flexWrap:'wrap'}}>
                                {
                                    typeList.map((item, index)=>{
                                        return(
                                            <View>
                                                {
                                                    (!apply&&item.hasAuth) || (apply&&businessCategory&item.typeId)?//没有申请单按Setting配置显示，有申请单按申请单业务显示
                                                    <TouchableOpacity key={index} onPress={()=>{
                                                        this.setState({
                                                            selectTap:item.type
                                                        })
                                                    }}>
                                                        <View style={{}}>
                                                            <View style={styles.tapStyle}>
                                                                <MaterialIcons
                                                                    name={selectTap==item.type?'radio-button-checked': 'radio-button-unchecked'}
                                                                    size={20}
                                                                    color={Theme.themed1}
                                                                />
                                                                <CustomText style={{fontSize:13,marginLeft:5 }} color={Theme.darkColor} text={item.name} />
                                                            </View>
                                                        </View>
                                                    </TouchableOpacity>:null
                                               }
                                            </View>
                                        )
                                    })
                                }
                            </View>
                        </View>
                </ScrollView>
                {this._button()}
            </View>
        )
    }
    _button(){
        return(
            <View>
                <View style={{justifyContent:'center',alignItems:'center',paddingTop:8,}}>
                </View>
                <View style={Util.Parse.isChinese()?styles.endBtnStyle :styles.endBtnStyle2}>
                    <TouchableOpacity style={Util.Parse.isChinese()?styles._btnStyle2:styles._btnStyleEn2} onPress={()=>{
                        this._addClick(1);
                    }}>
                      <CustomText text='常用员工' style={{color:Theme.theme}}/>
                    </TouchableOpacity>
                    <TouchableOpacity style={Util.Parse.isChinese()?styles._btnStyle2:styles._btnStyleEn2}
                                    onPress={()=>{this._addClick(2);}}
                    >                
                      <CustomText text='常用旅客' style={{color:Theme.theme}}/>
                    </TouchableOpacity>
                    <TouchableOpacity style={Util.Parse.isChinese()?styles.btnStyle:styles.btnStyleEn}
                        onPress={()=>{this._sureClick()}}
                    >
                      <CustomText text={Util.Parse.isChinese()?'确定':'Start Booking'} style={{color:'#fff'}}/>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
    //删除已选出差人
    _deleteChoose =(item)=>{
       const {employees, travellers, ReferenceEmployeeId} = this.state;
       if(item.item&&item.item.PassengerOrigin&&item.item.PassengerOrigin.Type==1){
           this.setState({
            ReferenceEmployeeId:null,
            ReferenceEmployeeName:null,
            ReferenceEmployee:null
           })
       }
       let employeesArr = JSON.parse(JSON.stringify(employees))//序列化反序列化法拷贝
       let employeesArr2 = employeesArr.filter(isMinNum);
    //    let travellersArr = JSON.parse(JSON.stringify(travellers))//序列化反序列化法拷贝
    //    let travellersArr2 = travellersArr.filter(isMinNum);
       function isMinNum(data_item) {
          return (JSON.stringify(data_item)  != JSON.stringify(item.item));
       }
        this.setState({
            employees:employeesArr2,
            travellers:travellersArr2
        })
    }
    _addClick=(index)=>{
        const { employees, travellers } = this.state;
        this.push('CompAddpersonsScreen',{
            index:index,
            title:index === 1 ? '选择常用员工' : '选择常用旅客',
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
                    if(index===1){
                        employees.push(item);
                    }else{
                        travellers.push(item)
                    }
                })
                this.setState({});
              } 
            }
        );  
    }
    _checkTravellers=()=>{
       const {employees, travellers,ProjectId, userInfo,selectTap,ReferenceEmployeeId} = this.state;
       const {setCheckTravellers,apply} = this.props;
    //    let IsJourneyType = this.customerInfo&&this.customerInfo.Setting.FlightTravelApplyConfig.IsJourneyType
       let referenceId = ReferenceEmployeeId
       if(employees&&employees.length===1 &&employees[0].PassengerOrigin&& employees[0].PassengerOrigin.EmployeeId == userInfo.Id ){
           referenceId = employees[0].PassengerOrigin&& employees[0].PassengerOrigin.EmployeeId
       }
       let model={
          MassOrderId:null,
          Category:selectTap,//业务分类（1:国内机票,4:国内酒店,5:火车票,6:港澳台及国际酒店,7:国际机票），该字段必填
          ReferenceEmployeeId:referenceId,//差旅规则及审批规则的参照员工ID。如果没有综合订单ID，且有多个出差员工时这个字段必填！（出差员工+当前预订人中的任意一人）
          ProjectId:ProjectId,
          Travellers:employees.concat(travellers)
       }
       this.showLoadingView();
       ComprehensiveService.MassOrderCheckTravellers(model).then(response => {
        this.hideLoadingView();
            if (response && response.success&&response.data) {
                setCheckTravellers(response.data);
                if(apply){
                    this._checkTravelApply()
                }else{
                    this.setState({
                        chooseApply:false
                    },()=>{
                        this._createSure()
                    })
                }

            }else{
                this.hideLoadingView();
                this.toastMsg(response.message);
            }
        }).catch(error => {
                this.hideLoadingView();
                this.toastMsg(error.message);
        }) 
        this._loadcomprehensiveData()
    }

    _loadcomprehensiveData=()=>{
        const {onLoadcomprehensiveData} = this.props;
        const {employees, travellers,ProjectId, userInfo,ProjectItem,ReferenceEmployeeId} = this.state;

        let referenceId = ReferenceEmployeeId
        if(employees&&employees.length===1 &&employees[0].PassengerOrigin&& employees[0].PassengerOrigin.EmployeeId == userInfo.Id ){
            referenceId = employees[0].PassengerOrigin&& employees[0].PassengerOrigin.EmployeeId
        }

        let referencPassengerId
        if(employees&&employees.length>0){
                let num = employees.length-1
                referencPassengerId = employees[num]&&employees[num].PassengerOrigin&&employees[num].PassengerOrigin.EmployeeId
        }else{
            referencPassengerId = userInfo&&userInfo.Id
            referenceId = userInfo&&userInfo.Id
        }
        let IdModel = {
            ReferenceEmployeeId:referenceId,
            ReferencePassengerId:referencPassengerId,
        }
        employees&&employees.map((item)=>{
            item.shareRoomSelect = false
        })
        travellers&&travellers.map((item)=>{
            item.shareRoomSelect = false
        })
        onLoadcomprehensiveData(userInfo,employees,travellers,ProjectId,referenceId,IdModel,referencPassengerId,ProjectItem)
    }

    _queryTravellers=(applyId)=>{
        let model = {
            Query: {
                ApplyId:applyId
                },
                Pagination: {
                PageIndex: 1,
                PageSize: 20
            }          
        }
        ComprehensiveService.MassOrderQueryTravellers(model).then(response => {
            this.hideLoadingView()
            if (response && response.success) {
                if (response.data&&response.data.ListData) {
                    response.data.ListData.map((item)=>{
                        if(item.Certificates){
                            // let obj = item.Certificates[0];
                            let obj = Array.isArray(item.Certificates) && item.Certificates.length > 0 ? item.Certificates[0] : null;
                            if (obj) {
                                item.CertificateType = obj.TypeDesc;
                                item.CertificateId = obj.Type;
                                item.CertificateNumber = obj.SerialNumber;
                                item.CertificateExpire = obj.Expire;
                                item.NationalName = obj.NationalName;
                                item.NationalCode = obj.NationalCode;
                                item.IssueNationName = obj.IssueNationName; 
                                item.IssueNationCode = obj.IssueNationCode;
                                item.Gender =  obj.Sex 
                            }
                        }
                    })
                    this.setState({
                        employees:response.data.ListData
                    })
                }
            }
        }).catch(error => {
            this.hideLoadingView();
            this.toastMsg(error.message || '加载数据失败请重试');
        })
    }

    _createSure=()=>{
        const { selectTap,ReferenceEmployee,chooseApply,customerInfo } = this.state;
        let IsJourneyType =chooseApply? customerInfo&&customerInfo.Setting.FlightTravelApplyConfig.IsJourneyType :false
        Bussiness.map((item)=>{
            if(item.num==selectTap){
               this.push(item.Cheekpage,{
                ReferenceEmployee:ReferenceEmployee,
                selectTap,
                IsJourneyType:IsJourneyType,
                chooseApply,
                isIntl:item.type=='intlHotel'?true:false
            })
            }
         })
    }

    _checkTravelApply=()=>{
        const {travellers,employees,category,arrivalCityDisplay,goCityDisplay,selectTap,ReferenceEmployee,selectApplyItem,chooseApply,customerInfo} = this.state;
        let IsJourneyType = chooseApply? customerInfo&&customerInfo.Setting.FlightTravelApplyConfig.IsJourneyType : false
        const {apply} = this.props;
        let model ={
            ApplyId:apply&&apply.Id, //申请单对象
            JourneyId:null,//申请单行程Id
            Category: category,//订单类型 1.国内机票，8国际机票，4国内酒店，16国际酒店，2火车票
            // Departure: goCityDisplay&&goCityDisplay.Name,//出发城市（查询出发城市）
            // Destination: arrivalCityDisplay&&arrivalCityDisplay.Name,//到达城市（查询到达城市）
            Departure: null,//出发城市（查询出发城市）
            Destination: null,//到达城市（查询到达城市）
            BeginTime:null, //出发时间(填查询时间)
            JourneyType:null,//行程类型  单程或往返 1.单程，2.往返
            EndTime:null, //到达时间(填查询时间)
            Travellers:employees.concat(travellers), //综合订单自己选的人
        };
        let goCity = null
        let arrivalCity = null
        if(selectTap==1){
            if(goCityDisplay){
                goCity ={
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
        }else if(selectTap==7){
            if(goCityDisplay){
                goCity = {
                    CityCode:goCityDisplay.IataCode,
                    CityEg:goCityDisplay.EnName,
                    CityEnName:goCityDisplay.EnName,
                    CityName:goCityDisplay.Name,
                    Cname:goCityDisplay.Name,
                    NationalCode:goCityDisplay.NationalCode,
                    NationalEg:goCityDisplay.EnNationalName,
                    NationalName:goCityDisplay.NationalName,
                }
            }
            if(arrivalCityDisplay){
                arrivalCity = {
                    CityCode:arrivalCityDisplay.IataCode,
                    CityEg:arrivalCityDisplay.EnName,
                    CityEnName:arrivalCityDisplay.EnName,
                    CityName:arrivalCityDisplay.Name,
                    Cname:arrivalCityDisplay.Name,
                    NationalCode:arrivalCityDisplay.NationalCode,
                    NationalEg:arrivalCityDisplay.EnNationalName,
                    NationalName:arrivalCityDisplay.NationalName,
                }
            }
        }else if(selectTap==4 ||selectTap==5 || selectTap==6){
            goCity = goCityDisplay
            arrivalCity = arrivalCityDisplay
        }
        let DestinationBeginTime;//当前页面选择申请单 目的地模式情况的 出发时间
        let JourneyBeginTime;// 当前页面选择申请单 行程模式情况的 出发时间
        let DestinationEndTime;//当前页面选择申请单 目的地模式情况的 出发时间
        let JourneyEndTime;// 当前页面选择申请单 行程模式情况的 出发时间
        if(apply.Destination){
            DestinationBeginTime = apply.Destination.BeginTime
            DestinationEndTime = apply.Destination.EndTime
        }
        if(selectApplyItem){
            JourneyBeginTime = selectApplyItem.BeginTime
            JourneyEndTime = selectApplyItem.EndTime
        }
        let begintime = this.params.BeginTime ? this.params.BeginTime : JourneyBeginTime ? JourneyBeginTime : DestinationBeginTime
        let endtime = this.params.EndTime ? this.params.EndTime : JourneyEndTime ? JourneyEndTime : DestinationEndTime
        CommonService.OrderValidateTravelApply(model).then(response => {
            if (response && response.success) {
                 //跳转
                Bussiness.map((item)=>{
                   if(item.num==selectTap){
                      this.push(item.Cheekpage,{
                            ReferenceEmployee:ReferenceEmployee,
                            selectTap,
                            IsJourneyType:IsJourneyType,
                            SerialNumber:apply.SerialNumber,
                            arrivalCityDisplay:arrivalCity,
                            goCityDisplay:goCity,
                            selectApplyItem:selectApplyItem,
                            BeginTime:begintime,
                            EndTime:endtime,
                            chooseApply,
                      })
                   }
                })
            } else {
                this.toastMsg(response.message || '操作失败');
            }
        }).catch(error => {
            this.toastMsg(error.message || '操作失败');
        })
    }

    /**
     * 确定事件
     **/
    _sureClick=()=>{
       const {employees, travellers, selectTap, ReferenceEmployeeId,ReferenceEmployee,userInfo,customerInfo} = this.state; 
       const {onClickSure,setComp_Id,setReferenceEmployee,apply} = this.props;
       onClickSure(true);//标记是创建不是继续预定
       setComp_Id(null);//不是继续预订清空当前综合订单Id

       let sony = false //判断是Sony公司的ID时只能选一人
       SonyList.map((item)=>{
            if(customerInfo?.Customer?.Id==item){
                if(employees.length + travellers.length > 1){
                    sony = true
                }
            } 
        })
        if(sony){
            this.toastMsg('该客户只能选一人')
            return
        };

       if (employees.length + travellers.length === 0) {
            this.toastMsg('用户不能为空');
            return;
       }
       if (employees.length + travellers.length > 9) {
            this.toastMsg('最多购买人数为9人,请手动删除多余人员');
            return;
        }
        travellers&&travellers.map((item)=>{
            item.PassengerOrigin={
                Type:2,
                TravellerId: item.Id
            }
        })
        if(!selectTap){
            this.toastMsg('请选择预订业务');
            return;
        } 
        if(!ReferenceEmployeeId && employees.length>1){
            this.toastMsg('您选择了多位出差人，请选择一位员工作为差旅规则及审批规则的参照人');
            return;
        }
        let obj={} ;
        if(employees&&employees.length===1 && employees[0].PassengerOrigin&& employees[0].PassengerOrigin.EmployeeId == userInfo.Id ){
           obj = employees[0]
        }
       setReferenceEmployee(JSON.stringify(ReferenceEmployee)==='{}'?obj:ReferenceEmployee);//存入出差人中参考出差人的信息
       this.props.setHotelShareArr(null); //清空酒店合住人
       this._checkTravellers();//检查出差人      
    }
}

const mapStateToProps = state => ({
    compCheckTravellers:state.compCheckTravellers,
    customerInfo_userInfo: state.customerInfo_userInfo,
    apply: state.apply.apply,
})
const mapDispatchToProps = dispatch =>({
    onLoadcomprehensiveData:(userInfo,employees,travellers,ProjectId,ReferenceEmployeeId,IdModel,referencPassengerId,ProjectItem)=>dispatch(actions.onLoadcomprehensiveData(userInfo,employees,travellers,ProjectId,ReferenceEmployeeId,IdModel,referencPassengerId,ProjectItem)),
    onClickSure:(compCreateBool)=>dispatch(actions.onClickSure(compCreateBool)),
    setCheckTravellers:(travellers)=>dispatch(actions.setCheckTravellers(travellers)),
    setComp_Id: (value) => dispatch(actions.setComp_Id(value)), 
    setReferenceEmployee: (value) => dispatch(actions.setReferenceEmployee(value)),  
    setHotelShareArr:(shareAllArr)=>dispatch(actions.setHotelShareArr(shareAllArr)),
    setApply: (value) => dispatch(actions.applySet(value)),  
})
export default connect(mapStateToProps,mapDispatchToProps)(CompCreateOrderScreen);

const styles = StyleSheet.create({
    view: {
        marginTop: 0,
        backgroundColor: 'white',
    },
    section: {
        // height: 44,
        padding: 10,
        flexDirection: "row",
        justifyContent: 'space-between',
        alignItems: "center",
        borderColor:'lightgray',
        backgroundColor:'#fff',
        marginTop:5,
        marginHorizontal:10,
        borderBottomWidth:0.5,
        borderRadius:8,
        marginBottom:5,
        borderBottomWidth:0.4,
        // borderColor:Theme.themed3,
        elevation:1.5, shadowColor:'#999999', shadowOffset:{width:1,height:1}, shadowOpacity: 0.1, shadowRadius: 1.5
    },
    textStyle:{ fontWeight: 'bold',fontSize:15,marginLeft:5,padding:10,marginTop:10 },
    viewStyle:{backgroundColor:'#fff',
                marginTop:5, 
                marginHorizontal:10,
                borderRadius:6,
                elevation:1.5, shadowColor:'#999999', shadowOffset:{width:1,height:1}, shadowOpacity: 0.1, shadowRadius: 1.5
    },
    tapStyle:{
        height:30,flexDirection:'row',alignItems:'center',margin:6,
        justifyContent:'center',borderRadius:15,borderColor:Theme.theme,borderWidth:0.5,
        paddingHorizontal:5
    },
    _buttonStyle:{
        height:40,
          position: 'absolute',
          bottom:5,
          right:10,
          left:10,
          flexDirection:'row',
          justifyContent:'space-around',
          marginBottom:10,
      },
      btStyle3:{
        // backgroundColor:Theme.theme,
        width:180,
        justifyContent:'center',
        alignItems:'center',
        
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
    endBtnStyle:{
        flexDirection:'row',
        justifyContent:'space-around',
        marginBottom:10
    },
    endBtnStyle2:{
        alignItems:'center',
        justifyContent:'center',
    },
    rowRight: {
        flex: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    row: {
        flexDirection: 'row',
        // flex: 1,
        height: 44,
        padding: 10,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: Theme.lineColor
    },
})

const Bussiness = [
    {
        type: 'flight',
        name: '国内机票',
        Cheekpage: 'FlightSearchIndex',
        num:1,
    },
    {
        type: 'intlFlight',
        name: '港澳台及国际机票',
        Cheekpage: 'IntlFlightIndex',
        num:7,
    }, {
        type: 'train',
        name: '火车票',
        Cheekpage: 'TrainIndexScreen',
        num:5,
    }, {
        type: 'hotel',
        name: '国内酒店',
        Cheekpage: 'HotelSearchIndex',
        num:4,
    }, {
        type: 'intlHotel',
        name: '港澳台及国际酒店',
        Cheekpage: 'HotelSearchIndex',
        num:6,
    }   
    
]