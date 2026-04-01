import Types from '../types';
/**
 * 是综合订单列表 创建综合订单 ，已经选好的出差人的 action
 * @param  
 */

export function getProfileCommonEnum(data) { 
    return dispatch => {
        dispatch({type: Types.PROFILECOMMONENUM, data});
        handleData(dispatch,data)
    }
}
function handleData(dispatch,data) {
    dispatch({
        type:Types.PROFILECOMMONENUM,
        data:data
    })
}