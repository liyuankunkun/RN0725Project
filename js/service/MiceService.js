import api from '../res/styles/Api';
import FetchHelper from '../common/FetchHelper';
export default class MiceService {
    //创建订单
    static createMice(model) {
        return FetchHelper.post(baseUrl + api.mice.MiceDemandCreateOrder, model);
    }
    //取消订单
    static cancleMice(model) {
        return FetchHelper.post(baseUrl + api.mice.MiceDemandChangeStatus, model);
    }

    //订单详情
    static miceDetail(model) {
        return FetchHelper.post(baseUrl + api.mice.MiceDemandDetail, model);
    }
    //企业订单详情
    static Enterprise_miceDetail(model) {
        return FetchHelper.post(baseUrl + api.enterpriseOrderDetail.miceDetail, model);
    }
    //订单列表
    static miceOrderList(model) {
        return FetchHelper.post(baseUrl + api.mice.MiceDemandList, model);
    }
   static miceDemandNotify(model) {
        return FetchHelper.post(baseUrl + api.mice.MiceDemandNotify, model);
    }
}