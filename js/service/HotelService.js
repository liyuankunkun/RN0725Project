
import FetchHelper from '../common/FetchHelper';
import api from '../res/styles/Api';
export default class HotelService {

    /**
    * 获取酒店城市列表
    */
    static getHotelCityList = () => {
        return FetchHelper.post(baseUrl + api.hotel.city);
    }

    // 酒店列表数据
    static cityList = () => {
        return FetchHelper.post(baseUrl + api.hotel.citylist);
    }
    /**
     *  获取城市筛选
     */
    static HotelCityFilters = (model) => {
        return FetchHelper.post(baseUrl + api.hotel.HotelCityFilters,model);
    }
    /**
     * 
     * @returns 酒店关键字
     */
    static HotelKeywordQuery = (model) => {
        return FetchHelper.post(baseUrl + api.hotel.HotelKeywordQuery,model);
    }
    /**
     * 获取酒店列表的筛选条件
     */
    static HotelOrderPoiQuery = (model) => {
        return FetchHelper.post(baseUrl + api.hotel.HotelOrderPoiQuery, model);
    }
    /**
     *  获取品牌
     */
    static HotelBrand = ()=>{
      return FetchHelper.post(baseUrl + api.hotel.HotelBrand);
    }

    /**
     * 获取酒店订单列表
     */
    static orderList = (model) => {
        return FetchHelper.post(baseUrl + api.hotel.orderList, model);
    }
    /**
        * 获取酒店列表
        */
    static getHotelList = (model) => {
        return FetchHelper.post(baseUrl + api.hotel.HotelListQueryV2, model);
    }
    /**
    * 获取行政区和商圈
    */
    static GetHotelCondition = (model) => {
        return FetchHelper.post(baseUrl + api.hotel.GetHotelCondition, model);
    }
    /**
   * 获取房间详情信息
   */
    static getHotelDetail = (model) => {
        return FetchHelper.post(baseUrl + api.hotel.HotelDetailV2, model);
    }
    /**
   * 获取酒店的差旅规则
   */
    static HotelMatchTravelRulesV2 = (model) => {
        return FetchHelper.post(baseUrl + api.hotel.HotelMatchTravelRulesV2, model);
    }
    /**
    * 生成订单的接口
    */
    static getHotelOrderCreate = (model) => {
        return FetchHelper.post(baseUrl + api.hotel.HotelOrderCreateV2, model);
    }
    /**
   * 验证信用卡号
   */
    static getCreditCardValidate = (model) => {
        return FetchHelper.post(baseUrl + api.hotel.CreditCardValidate2, model);
    }
    /**
    * 信用卡担保
    */
    static hotelOrderGuarantee = (model) => {
        return FetchHelper.post(baseUrl + api.hotel.HotelOrderGuaranteeV2, model);
    }
    /**
     * 重新申请短信验证码
     * Api/HotelResPaymentCode
     */

    static hotelResPaymentCode = (model)=>{
        return FetchHelper.post(baseUrl + api.hotel.HotelResPaymentCode,model);
    }

    /**
     * HotelPaymentConfitm
     * 担保支付确认接口
     */
     static HotelPaymentConfitm = (model)=>{
        return FetchHelper.post(baseUrl + api.hotel.HotelPaymentConfitm,model);
    }
    /**
     * 审批详情的信息
     */
    static ApprovelOrderDetail = (model) => {
        return FetchHelper.post(baseUrl + api.hotel.HotelOrderApproveDetail, model);
    }
    /**
    * 酒店详情信息
    */
    static OrderDetail = (model) => {
        return FetchHelper.post(baseUrl + api.hotel.HotelOrderDetail2, model);
    }
    /**
   * 退订酒店
   */
    static HotelOrderRefund2 = (model) => {
        return FetchHelper.post(baseUrl + api.hotel.HotelOrderRefund2, model);
    }
    /**
     * 取消订单的操作
     */
    static HotelOrderCancel = (model) => {
        return FetchHelper.post(baseUrl + api.hotel.HotelOrderCancel2, model);
    }
    /**
    * 获取国内机票的审批信息
     */
    static OrderApproveList = (model) => {
        return FetchHelper.post(baseUrl + api.hotel.HotelOrderApproveList, model);
    }
    /**
    * 点击进行审批的操作
    */
    static Approvel = (model) => {
        return FetchHelper.post(baseUrl + api.hotel.HotelOrderApprove, model);
    }
    /**
     * 获取待支付单信息
     */
    static HotelOrderPayment = (model) => {
        return FetchHelper.post(baseUrl + api.hotel.HotelOrderPayment, model);
    }
    /**
     * 获取付退订费支付单信息
     */
    static HotelOrderRefundPayInfo = (model) => {
        return FetchHelper.post(baseUrl + api.hotel.HotelOrderRefundPayInfo, model);
    }
    /**
     * 获取退订时将产生的费用提示信息
     */
    static HotelOrderComputeRefundFee = (model) => {
        return FetchHelper.post(baseUrl + api.hotel.HotelOrderComputeRefundFee, model);
    }
    /**
     * 企业酒店详情
     */
    static EnterPrise_HotelOrder = (model) =>{
        return FetchHelper.post(baseUrl + api.enterpriseOrderDetail.hotelOrderDetail, model);
    }
    /**
     * 企业酒店详情
     */
    static EnterPrise_IntlHotelOrder = (model) =>{
        return FetchHelper.post(baseUrl + api.enterpriseOrderDetail.foreignHotelOrderDetail, model);
    }
    /**
     * 国内酒店详情距离接口
     */
    static CityLocationQuery = (model)=>{
        return FetchHelper.post(baseUrl + api.hotel.CityLocationQuery, model)
    }
     /**
     * 国内酒店超标自付送审2选1
     */
    static HotelSalfChooseApprovalOrSelfPay = (model)=>{
        return FetchHelper.post(baseUrl + api.hotel.HotelSalfChooseApprovalOrSelfPay, model)
    }

    static HotelApplyTravelRule = (model)=>{
        return FetchHelper.post(baseUrl + api.hotel.HotelApplyTravelRule, model)
    }
    /**
     * 国内酒店详情 预订接口校验
     */
    static HotelOrderRatePlanPriceCheck = (model)=>{
        return FetchHelper.post(baseUrl + api.hotel.HotelOrderRatePlanPriceCheck, model)
    }

    /**
     * 提交订单催审
     */
    static orderRemind(remindModel) {
        return FetchHelper.post(baseUrl + api.hotel.HotelOrderApproveNotify, remindModel);
    }

    /**
     * 提交提交CVV接口
     */
    static HotelCreditCVVSubmit(model) {
        return FetchHelper.post(baseUrl + api.hotel.HotelCreditCVVSubmit, model);
    }

}