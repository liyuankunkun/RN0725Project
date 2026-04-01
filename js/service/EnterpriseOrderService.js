import FetchHelper from '../common/FetchHelper';
import api from '../res/styles/Api';
export default class EnterpriseOrderService {
    /**
     * 企业飞机订单列表
    **/
    static Enterprise_load(model) {
        return FetchHelper.post(baseUrl + api.enterpriseOrder.flightOrders , model);
    } 
    /**
     * 企业国际飞机订单列表
    **/
    static Enterprise_intlFlighload(model) {
        return FetchHelper.post(baseUrl + api.enterpriseOrder.intlFlightOrders , model);
    } 
    /**
     * 企业酒店订单列表
    **/
   static Enterprise_hotelload(model) {
    return FetchHelper.post(baseUrl + api.enterpriseOrder.hotelOrders , model);
   }  
    /**
     * 企业港澳台及国际酒店订单列表
    **/
   static Enterprise_Intlhotelload(model) {
    return FetchHelper.post(baseUrl + api.enterpriseOrder.foreignHotelOrders , model);
   }  
   /**
     * 企业火车票订单列表
    **/
   static Enterprise_Trainload(model) {
    return FetchHelper.post(baseUrl + api.enterpriseOrder.trainOrders , model);
   } 
    /**
     * 企业用车订单列表
    **/
   static Enterprise_Carload(model) {
    return FetchHelper.post(baseUrl + api.enterpriseOrder.carOrders , model);
   } 
   /**
     * 企业会奖旅游订单列表
    **/
   static Enterprise_miceload(model) {
    return FetchHelper.post(baseUrl + api.enterpriseOrder.miceOrders , model);
   }
   /**
    * 企业专属对接人 
    **/ 
   static Enterprise_accountExecutive(){
       return FetchHelper.post(baseUrl + api.enterprisePerson.accountExecutive)
   } 
   /**
    * 企业管理员列表
    **/
   static Enterprice_ManagerList(model){
       return FetchHelper.post(baseUrl + api.enterprisePerson.customerManagerList, model)
   } 
   /**
    * 增删企业管理员 OperateType  //1增加 2删除 
    **/ 
   static Enterprice_addManager(model){
    return FetchHelper.post(baseUrl + api.enterprisePerson.customerManagerOperate, model)
   } 
   /**
    * 企业合同信息
    */
   static Enterprise_contractMessage(){
       return FetchHelper.post(baseUrl + api.enterprisePerson.customerContract)
   }
    /**
    * 部门构架列表 
    **/ 
   static Enterprice_customerStructure(model){
    return FetchHelper.post(baseUrl + api.enterpriseParment.customerStructure, model)
   } 
    /**
    * 新增/编辑部门 新增不用传Id 编辑需要传
    **/ 
   static Enterprice_deptSave(model){
    return FetchHelper.post(baseUrl + api.enterpriseParment.deptSave, model)
   } 
     /**
    * 添加部门，结算主体
    **/ 
   static Enterprice_SubjectQuery(model){
    return FetchHelper.post(baseUrl + api.enterpriseParment.settlementSubjectQuery, model)
   }
   /**
    * 编辑部门信息详情
    */
   static Enterprice_deptDetail(model){
    return FetchHelper.post(baseUrl + api.enterpriseParment.deptDetail, model)
   }
   /**
    * 编辑员工信息详情
    */
   static Enterprice_employDetailDetail(model){
    return FetchHelper.post(baseUrl + api.enterpriseParment.employeeDetail, model)
   }
   /**
    * 编辑员工信息详情公共查询  员工权限 员工状态 证件类型
    */
   static Enterprice_employDetailPublic(){
    return FetchHelper.post(baseUrl + api.enterpriseParment.commonQuery)
   }
   /**
    * 编辑员工选择所属部门
    */
   static Enterprice_customerDepartmentQuery(model){
    return FetchHelper.post(baseUrl + api.enterpriseParment.customerDepartmentQuery, model)
   }
   /**
    * 编辑员工选择职级页列表
    */
   static Enterprice_dutyQuery(model){
    return FetchHelper.post(baseUrl + api.enterpriseParment.dutyQuery, model)
   }
   /**
    * 编辑员工设置差旅规则页列表
    */
   static Enterprice_travelRulesQuery(model){
    return FetchHelper.post(baseUrl + api.enterpriseParment.travelRulesQuery, model)
   }
   /**
    * 编辑员工 航空公司查询
    */
   static Enterprice_airLineQuery(model){
       return FetchHelper.post(baseUrl + api.enterpriseParment.airLineQuery, model)
   }
   /**
    * 员工新增和保存/编辑
    */
   static Enterprice_employeeSave(model){
       return FetchHelper.post(baseUrl + api.enterpriseParment.employeeSave, model)
   }
    /**
    * 员工批量变更部门&&从其他部门移入员工
    */
   static Enterprice_employeeUpdateDept(model){
    return FetchHelper.post(baseUrl + api.enterpriseParment.employeeUpdateDept, model)
}


}