import FetchHelper from '../common/FetchHelper';
import api from '../res/styles/Api';
export default class AccountService {
    // 记账单列表
    static CustomerEmployeeLedgerList(model) {
        return FetchHelper.post(baseUrl + api.account.CustomerEmployeeLedgerList, model);
    }
    // 删除单笔业务
    static CustomerEmployeeLedgerCancel(model) {
        return FetchHelper.post(baseUrl + api.account.CustomerEmployeeLedgerCancel, model);
    }
    // 记账单类型获取
    static LedgerCategoryList(model) {
        return FetchHelper.post(baseUrl + api.account.LedgerCategoryList, model);
    }
    // 新增记账
    static CustomerEmployeeLedgerAdd(model) {
        return FetchHelper.upload(baseUrl + api.account.CustomerEmployeeLedgerAdd, model);
    }
    // 新增类目
    static LedgerCategoryAdd(model) {
        return FetchHelper.upload(baseUrl + api.account.LedgerCategoryAdd, model);
    }
    // 记账单统计
    static CustomerEmployeeLedgerStatistics(model) {
        return FetchHelper.post(baseUrl + api.account.CustomerEmployeeLedgerStatistics, model);
    }
}