import Types from '../types';
/**
 * 是否开启综合订单模式(秘书模式)action
 * @param  
 */

export function loadComprehensiveSwitch(bool) {    
    return dispatch => {
        dispatch({type: Types.COMPREHENSIVESWITCH, bool:bool});
        handleData(dispatch,bool)
    }
}
function handleData(dispatch, bool) {
    dispatch({
        type:Types.COMPREHENSIVESWITCH,
        bool:bool
    })
}