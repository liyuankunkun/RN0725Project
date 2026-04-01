import api from '../res/styles/Api';
import FetchHelper from '../common/FetchHelper';
export default class ReimbursementService {
    //创建订单
    static ReimbursementList(model) {
        return FetchHelper.post(baseUrl + api.reimbursement.ReimbursementList, model);
    }
    // 绑定业务数据
    static ReimbursementBindList(model) {
        return FetchHelper.post(baseUrl + api.reimbursement.ReimbursementBindList, model);
    }
      // 绑定业务数据
      static GetEmployeeCollectionList() {
        return FetchHelper.post(baseUrl + api.reimbursement.GetEmployeeCollectionList, null);
    }
    static ReimbursementDetail(model){
        return FetchHelper.post(baseUrl + api.reimbursement.ReimbursementDetail, model); 
    }
    static ReimbursementApprovalList(model){
        return FetchHelper.post(baseUrl + api.reimbursement.ReimbursementApprovalList,model);
    }
    static ReimbursementApprove(model){
        return FetchHelper.post(baseUrl + api.reimbursement.ReimbursementApprove,model);
    }
   static  ReimbursementCreate(model){
    return FetchHelper.post(baseUrl + api.reimbursement.ReimbursementCreate,model);
   }
   static ReimbursementRevoke(model){
       return FetchHelper.post(baseUrl + api.reimbursement.ReimbursementRevoke,model);
   }
}