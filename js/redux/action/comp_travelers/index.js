import Types from '../types';
/**
 * 是综合订单列表 继续预订 ，已经选好的出差人的 action
 * @param  
 */

export function setComp_travellers(compEmployees,compTraveler,travellers) { 
    return dispatch => {
        dispatch({type: Types.COMPSELECTTRAVELLERS, compEmployees,compTraveler,travellers});
        handleData(dispatch,compEmployees,compTraveler,travellers)
    }
}
function handleData(dispatch, compEmployees,compTraveler,travellers) {
    dispatch({
        type:Types.COMPSELECTTRAVELLERS_SUCCESS,
        compEmployees: compEmployees,
        compTraveler: compTraveler,
        travellers: travellers
    })
}