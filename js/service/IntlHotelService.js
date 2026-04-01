import FetchHelper from "../common/FetchHelper";
import api from '../res/styles/Api';

export default class IntlHotelService {
    /**
        * 获取港澳台及国际酒店城市
        */
    static cityList = (model) => {
        return FetchHelper.post(baseUrl + api.intlHotel.ForeignHotelCityList, model);
    }
    /**
      * 获取国际酒店查询列表
      */
    static hotelList = (model) => {
        return FetchHelper.post(baseUrl + api.intlHotel.ForeignHotelList, model);
    }
    /**
    * 获取酒店订单列表
    */
    static orderList = (model) => {
        return FetchHelper.post(baseUrl + api.intlHotel.orderList, model);
    }
      /**
     * 获取酒店详情信息
     */
   static hotelDetail = (model)=>{
        return FetchHelper.post(baseUrl + api.intlHotel.ForeignHotelDetail,model);
    }
     /**
     * 生成订单的接口
     */
     static OrderCreate = (model)=>{
        return FetchHelper.post(baseUrl + api.intlHotel.ForeignHotelOrderCreate,model);
    }
     /**
     * 获取酒店订单列表
     */
    static orderList = (model)=>{
        return FetchHelper.post(baseUrl + api.intlHotel.ForeignHotelorderList,model);
    }
     /**
     * 订单的详情信息
     */
    static OrderDetail = (model)=>{
        return FetchHelper.post(baseUrl + api.intlHotel.ForeignHotelOrderDetail,model);
    }
    /**
     * 订单的详情信息
     */
    static Enterprise_OrderDetail = (model)=>{
        return FetchHelper.post(baseUrl + api.enterpriseOrderDetail.foreignHotelOrderDetail,model);
    }
     /**
     * 取消订单的操作
     */
    static CancelOrder = (model)=>{
        return FetchHelper.post(baseUrl + api.intlHotel.ForeignHotelCancelOrder,model);
    }
}