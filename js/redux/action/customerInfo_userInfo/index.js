import Types from '../types';
/**
 * 是综合订单列表 继续预订 ，已经选好的出差人的 action
 * @param  
 */

export function setCustomer_userInfo(customerInfo,userInfo) { 
    return dispatch => {
        dispatch({type: Types.CUSTORMERINFO_USERINFO, customerInfo,userInfo});
        handleData(dispatch,customerInfo,userInfo)
    }
}
function handleData(dispatch,customerInfo,userInfo) {
    dispatch({
        type:Types.CUSTORMERINFO_USERINFO,
        customerInfo: customerInfo,
        userInfo: userInfo,
    })
}