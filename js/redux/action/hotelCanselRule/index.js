import Types from '../types';
/**
 * 是否开启综合订单模式(秘书模式)action
 * @param  
 */

export function loadHotelCanselRule(value) { 
    return dispatch => {
        dispatch({type: Types.HOTELCANSELRULE, value:value});
        handleData(dispatch,value)
    }
}
function handleData(dispatch, value) {
    dispatch({
        type:Types.HOTELCANSELRULE,
        value:value
    })
}