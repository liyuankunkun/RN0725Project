
import FetchHelper from '../common/FetchHelper';
import api from '../res/styles/Api';
export default class ApplicationService {

  /**
    * 出差申请单列表
    */
  static travelApplyList = (model) => {
    return FetchHelper.post(baseUrl + api.application.travelApplyList, model);
  }
  static travelApplyDetail = (model) => {
    return FetchHelper.post(baseUrl + api.application.TravelApplyItem, model);
  }
  /**
 * 审批的申请单详情
 */
  static TravelApplyApprovalDetail = (model) => {
    return FetchHelper.post(baseUrl + api.application.TravelApplyApprovalDetail, model);
  }
  // 出差申请单取消接口
  static TravelApplyCancel = (model) => {
    return FetchHelper.post(baseUrl + api.application.TravelApplyCancel, model);
  }
  /**
   * 业务类目
   */
  static SubjectType = () => {
    return FetchHelper.post(baseUrl + api.application.SubjectType);
  }
  /**
   * 提交申请
   */
  static SubmitRequisition = (model) => {
    return FetchHelper.post(baseUrl + api.application.TravelApplyCreate, model);
  }
  /**
    * 差旅申请单审批列表
    */
  static TravelApplyApprovalList = (model) => {
    return FetchHelper.post(baseUrl + api.application.TravelApplyApprovalList, model);
  }
  /**
   * 差旅申请单审批
   */
  static TravelApplyApprove = (model)=>{
      return FetchHelper.post(baseUrl + api.application.TravelApplyApprove,model);
  }
  /**
   * 出差申请单撤回
   */
  static TravelApplyWithdrawnApproval = (model)=>{
    return FetchHelper.post(baseUrl + api.application.TravelApplyWithdrawnApproval,model);
  }
  /**
   * 取消申请
   */
  static TravelApplyCancel = (model)=>{
    return FetchHelper.post(baseUrl + api.application.TravelApplyCancel,model);
  }
  /**
   * 校验出差人和预订人行程模式是否相同
   */
  static TravelApplyCheckTravelApplyMode = (model)=>{
    return FetchHelper.post(baseUrl + api.application.TravelApplyCheckTravelApplyMode,model);
  }

}