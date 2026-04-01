import Types from '../types';
/**
 * 是综合订单列表 创建综合订单 ，已经选好的出差人的 action
 * @param  
 */

export function setCheckTravellers(travellers) { 
    return dispatch => {
        dispatch({type: Types.COMPCHECKTREVALLERS, travellers});
        handleData(dispatch,travellers)
    }
}
function handleData(dispatch,travellers) {
    dispatch({
        type:Types.COMPCHECKTREVALLERS,
        travellers:travellers
    })
}