import api from '../res/styles/Api';
import FetchHelper from '../common/FetchHelper';
export default class InvoiceService {

    // 发票抬头数据查询
    static CurrentUserTravellerInvoiceList = (model) => {
        return FetchHelper.post(baseUrl + api.invoice.currentUserTravellerInvoiceList, model);
    }
    /**
     *  删除发票抬头
     */
    static DeleteCustomerEmployeeInvoice = (model) => {
        return FetchHelper.post(baseUrl + api.invoice.deleteCustomerEmployeeInvoice, model);
    }

    /**
     * 新增和编辑发票抬头
     */

    static CustomerEmployeeInvoiceSave = (model) => {
        return FetchHelper.post(baseUrl + api.invoice.customerEmployeeInvoiceSave, model);
    }

    /**
     *  查询客户员工常用地址
     */
    static CurrentUserTravellerAddressList = (model) => {
        return FetchHelper.post(baseUrl + api.invoice.currentUserTravellerAddressList, model);
    }
    /** 
   * 删除常用地址
   */
    static DeletEmployeeAddress = (model) => {
        return FetchHelper.post(baseUrl + api.invoice.deleteEmployeeAddress, model);
    }
    /** 
      * 新增和编辑员工常用地址
      */
    static EmployeeAddressSave = (model) => {
        return FetchHelper.post(baseUrl + api.invoice.employeeAddressSave, model);
    }
    // 获取发票邮寄单列表
    static OrderBatchInvoiceMailing = (model) => {
        return FetchHelper.post(baseUrl + api.invoice.GetOrderBatchInvoiceMailing, model);
    }
    // 获取发票邮寄单详情
    static OrderSingleOrderBatchInvoiceMailing = (model) => {
        return FetchHelper.post(baseUrl + api.invoice.GetSingleOrderBatchInvoiceMailing, model);
    }
    /**
    *  开票历史
    */
    static InvoicedOrderList = (model) => {
        return FetchHelper.post(baseUrl + api.invoice.InvoicedOrderList, model);
    }
    // 取消发票订单
    static CancelInvoiceOrder = (model) => {
        return FetchHelper.post(baseUrl + api.invoice.CancelInvoiceOrder, model);
    }
    // 获取发票支付订单信息

    static InvoiceOrderPaymenInfo = (model) => {
        return FetchHelper.post(baseUrl + api.invoice.InvoiceOrderPaymentInfo, model);
    }
    /**
   *  国内机票未开票分页数据
   */

    static InvoiceFlightOrderList = (model) => {
        return FetchHelper.post(baseUrl + api.invoice.InvoicingFlightOrderList, model);
    }
    //包含订单详情信息
    static InvoicedOrderDetail = (model) => {
        return FetchHelper.post(baseUrl + api.invoice.InvoicedOrderDetail, model);
    }
     // 检验订单金额，获取发票内容
   static  InvoiceContent = (model)=>{
        return FetchHelper.post(baseUrl + api.invoice.InvoiceContent,model);
    }
   /**
     * 创建发票的接口
     */
   static CreateInvoiceOrder = (model)=>{
        return FetchHelper.post(baseUrl + api.invoice.CreateInvoiceOrder,model);
    }   
}