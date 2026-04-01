import FetchHelper from '../common/FetchHelper';
import api from '../res/styles/Api';
export default class ComprehensiveService {
    /**
     * 企业飞机订单列表
    **/
    static MassOrderQueryTravellers(model) {
        return FetchHelper.post(baseUrl + api.comprehensive.MassOrderQueryTravellers , model);
    } 
    /**
     * 检查出差人
     */
    static MassOrderCheckTravellers(model) {
        return FetchHelper.post(baseUrl + api.comprehensive.MassOrderCheckTravellers, model)
    }
    /**
     * 创建综合订单详情
     */
     static MassOrderCreate(model) {
        return FetchHelper.post(baseUrl + api.comprehensive.MassOrderCreate, model)
    }
    /**
     * 提交综合订单
     */
     static MassOrderSubmit(model) {
        return FetchHelper.post(baseUrl + api.comprehensive.MassOrderSubmit, model)
    }
    /**
     * 查询综合订单列表
     */
    static MassOrderList(model) {
        return FetchHelper.post(baseUrl + api.comprehensive.MassOrderList, model);
    }
    /**
     * 删除单元订单
     */
     static MassOrderDeleteOrderItem(model) {
        return FetchHelper.post(baseUrl + api.comprehensive.MassOrderDeleteOrderItem, model);
    }
    /**
     * 取消综合订单
     */
     static MassOrderCancel(model) {
        return FetchHelper.post(baseUrl + api.comprehensive.MassOrderCancel, model);
    }
    /**
     * 综合订单详情
     */
     static MassOrderDetail(model) {
        return FetchHelper.post(baseUrl + api.comprehensive.MassOrderDetail, model);
    }
    /**
     * 催审
     */
    static MassOrderApprovalRepush(model) {
        return FetchHelper.post(baseUrl + api.comprehensive.MassOrderApprovalRepush, model)
    }

    /**
     * 撤回审批
     */
    static MassOrderWithdrawnApproval(model) {
        return FetchHelper.post(baseUrl + api.comprehensive.MassOrderWithdrawnApproval, model)
    }

    /**
     * 综合订单审批驳回
     */
    static MassOrderApprove2(model) {
        return FetchHelper.post(baseUrl + api.comprehensive.MassOrderApprove2,model)
    }

    /**
     * 综合订单行程
     */
    static RecentNotTravelOrders(model) {
        return FetchHelper.post(baseUrl + api.comprehensive.RecentNotTravelOrders,model)
    }
    

    

}