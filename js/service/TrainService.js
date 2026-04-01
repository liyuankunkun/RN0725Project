import api from '../res/styles/Api';
import FetchHelper from '../common/FetchHelper';
export default class TrainService {
    /**
    * 火车票查询
    */
    static query(queryModel) {
        return new Promise((resolve, reject) => {
            FetchHelper.post(baseUrl + api.train.trainQuery, queryModel).then(response => {
                if (response.success) {
                    const data = response.data;
                    if (data && data.Data) {
                        resolve(data.Data);
                    } else {
                        reject({ message: '获取列表失败' });
                    }
                } else {
                    reject(response);
                }
            }).catch(err => {
                reject(err);
            });
        });
    }

  // 火车票城市
static  CommonTrainStation2(){
      return FetchHelper.post(baseUrl + api.train.CommonTrainStation2);
  }
    /**
        * 订单列表
        */
    static orderList(queryModel) {
        return new Promise((resolve, reject) => {
            FetchHelper.post(baseUrl + api.train.orderList, queryModel).then(response => {
                if (response.success) {
                    if (response.data && response.data.ListData && Array.isArray(response.data.ListData)) {
                        resolve(response.data);
                    } else {
                        reject({
                            message: '解析订单列表异常'
                        });
                    }
                } else {
                    reject(response);
                }
            }).catch(err => {
                reject(err || { message: '获取订单列表异常' });
            });
        });
    }
    /**
      * 获取火车票待支付订单
      */
    static TrainPaymentList(model) {
        return new Promise((resolve, reject) => {
            FetchHelper.post(baseUrl + api.train.TrainPaymentList, model).then(response => {
                if (response.success) {
                    if (response.data && response.data.ListData && Array.isArray(response.data.ListData)) {
                        resolve(response.data);
                    } else {
                        reject({
                            message: '解析订单列表异常'
                        });
                    }
                } else {
                    reject(response);
                }
            }).catch(err => {
                reject(err || { message: '获取订单列表异常' });
            });
        });
    }
    /** 
    * 经停查询
    */
    static TrainStopStations(model) {
        return FetchHelper.post(baseUrl + api.train.trainStopStations2, model);
    }

    /**
    * 生成订单
    */
    static createOrder(order) {
        return FetchHelper.post(baseUrl + api.train.trainOrderCreate, order);
    }
    /**
    * 催审订单
    */
    static orderRemind(orderId) {
        let remindModel = { OrderId: orderId };
        return FetchHelper.post(baseUrl + api.train.TrainOrderApproveNotify2, remindModel);
    }
    /**
    * 取消订单
    */
    static orderCancel(orderId) {
        let cancelModel = { OrderId: orderId };
        return FetchHelper.post(baseUrl + api.train.TrainOrderCancel2, cancelModel);
    }
    /**
     * 订单详情
     */
    static orderDetail(orderId) {
        let model = {
            OrderId: orderId
        };
        return FetchHelper.post(baseUrl + api.train.TrainOrderDetail2, model);
    }
    /**
     * 企业管理火车票订单详情
     */
    static Enterprise_orderDetail(orderId) {
        let model = {
            OrderId: orderId
        };
        return FetchHelper.post(baseUrl + api.enterpriseOrderDetail.trainOrderDetail, model);
    }
    /**
    * 提交退票
    */
    static orderRefund(refundModel) {
        return FetchHelper.post(baseUrl + api.train.TrainOrderRefund2, refundModel);
    }
    /**
   * 提交改签
   */
    static orderReissue(reissueModel) {
        return FetchHelper.post(baseUrl + api.train.TrainOrderReissue2, reissueModel);
    }
     /**
     * 审批列表
     */
    static approvalList(queryModel) {
        return new Promise((resolve, reject) => {
            FetchHelper.post(baseUrl + api.train.TrainOrderMyApproveList, queryModel).then(response => {
                if (response && response.success) {
                    if (response.data && response.data.DataSource && Array.isArray(response.data.DataSource.ListData)) {
                        resolve(response.data.DataSource);
                    } else {
                        reject({
                            message: '解析审批列表异常'
                        });
                    }
                } else {
                    reject(response);
                }
            }).catch(error => {
                reject(error || {
                    message: '获取数据异常'
                });
            });
        });
    }
     
      /**
     * 批准
     */
    static approve(approveModel) {
    
        return FetchHelper.post(baseUrl + api.train.TrainOrderApprove2, approveModel);
    }
    /**
     * 驳回
     */
    static reject(rejectModel) {

        return FetchHelper.post(baseUrl + api.train.TrainOrderApprove2, rejectModel);
    }
    /**
     * 12306账号登录
     * @param {*} Train12306ApplyModel 
     */
    static Train12306ApplyLogin(Train12306ApplyModel) {

        return FetchHelper.post(baseUrl + api.train.Train12306ApplyLogin2, Train12306ApplyModel);
    }
    /**
     * //12306获取校验接口
     * @param {12306账号密码model} trainSmsVerifyModel 
     */
    static Train12306SmsVerify(trainSmsVerifyModel){
        return FetchHelper.post(baseUrl + api.train.Train12306SmsVerify2, trainSmsVerifyModel);
    }
    /**
     * //退出关联12306
     * @param {12306账号参数} TrainCancelModel 
     */
    static TrainAccountCancelApp(TrainCancelModel){
        return FetchHelper.post(baseUrl + api.train.TrainAccountCancelApp, TrainCancelModel);
    }
    /**
     * 火车票订单 抢票单 取消抢票
     */
    static TrainOrderGrabCancel(model){
        return FetchHelper.post(baseUrl + api.train.TrainOrderGrabCancel, model);
    }
    /**
     * 12306进入火车票创建订单页，进行去2306免密登录
     * @param {*} model 
     */
    static Train12306AutoLogin(model) {
        return FetchHelper.post(baseUrl + api.train.Train12306AutoLogin, model);
    }

    static Train12306LoginCode2(model) {
        return FetchHelper.post(baseUrl + api.train.Train12306LoginCode2, model);
    }

    static Train12306LoginCode2(model) {
        return FetchHelper.post(baseUrl + api.train.Train12306LoginCode2, model);
    }

    static Train12306FaceLogin(model){
        return FetchHelper.post(baseUrl + api.train.Train12306FaceLogin,model)

    }
    static GetRecommendedTrainQuery(model){
        return FetchHelper.post(baseUrl + api.train.GetRecommendedTrainQuery,model)
    }

}