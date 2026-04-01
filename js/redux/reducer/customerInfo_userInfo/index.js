import types from '../../action/types'
/**
 * 新建综合订单确定 检查出差人存储
 */
const defaultState = {};

export default function onAction(state = defaultState, action) {
    switch (action.type){
        case types.CUSTORMERINFO_USERINFO:
            return{
                userInfo: action.userInfo,
                customerInfo: action.customerInfo
            }     
          default:
              return state;  
    }
}

