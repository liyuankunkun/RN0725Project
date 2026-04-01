import FetchHelper from '../common/FetchHelper';
import api from '../res/styles/Api';
export default class CarService {
  /**
    * 获取机场的接口
    */
  static getCommonAirport = () => {
    return FetchHelper.get(baseUrl + api.car.airport_coordinate);
  }
  /**
 * 获取车型及价格
 */
  static getCarTypeAndPrice = (model) => {
    return FetchHelper.post(baseUrl + api.car.CarPrice, model);
  }
  /**
     * 获取预订须知的
     */
  static getOrderNotice = () => {
    return FetchHelper.get(baseUrl + api.car.car_policy);
  }
  /**
   * 下订单
   */
  static createOrder = (model) => {
    return FetchHelper.post(baseUrl + api.car.CreateCarOrder, model);
  }
  /**
  * 获取订单列表
  */
  static getCarOrderList = (model) => {
    return FetchHelper.post(baseUrl + api.car.CarOrderList, model);
  }
  /**
    * 获取订单详情
    */
  static getOrderDetail = (model) => {
    return FetchHelper.post(baseUrl + api.car.CarDetail, model);
  }
  /**
    * 获取企业订单详情
    */
   static EnterPrise_getOrderDetail = (model) => {
    return FetchHelper.post(baseUrl + api.enterpriseOrderDetail.carOrderDetail, model);
  }
  /**
   * 预取消订单
   */
  static willCancelOrder = (model) => {
    return FetchHelper.post(baseUrl + api.car.CarCancel, model);
  }
  /**
   * 确定取消
   */
  static sureCancelOrder = (model) => {
    return FetchHelper.post(baseUrl + api.car.CarCancelConfirm, model);
  }
  // 查询附近车辆
  static CarSzzcNearbyCarInfo = (model) => {
    return FetchHelper.post(baseUrl + api.car.CarSzzcNearbyCarInfo, model);
  }
  // 费用预估
  static CarSzzcEstimationPrice = (model) => {
    return FetchHelper.post(baseUrl + api.car.CarSzzcEstimationPrice, model);
  }
  // 验证当前城市是否支持叫车
  static CarSzzcCityService = (model) => {
    return FetchHelper.post(baseUrl + api.car.CarSzzcCityService, model);
  }
  // 创建订单
  static CarSzzcCreateOrder = (model) => {
    return FetchHelper.post(baseUrl + api.car.CarSzzcCreateOrder, model);
  }
  // 实时获取订单信息
  static CarSzzcOrderRealTime = (model) => {
    return FetchHelper.post(baseUrl + api.car.CarSzzcOrderRealTime, model);
  }
  // 取消原因
  static CarSzzcCancelReason = (model) => {
    return FetchHelper.post(baseUrl + api.car.CarSzzcCancelReason, model);
  }
  // 取消订单
  static CarSzzcCancelOrder = (model) => {
    return FetchHelper.post(baseUrl + api.car.CarSzzcCancelOrder, model);
  }
  // 取消原因
  static CarOrderCancelReason = (model) => {
    return FetchHelper.post(baseUrl + api.car.CarOrderCancelReason, model);
  }
}