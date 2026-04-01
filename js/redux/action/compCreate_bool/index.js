import Types from '../types';
/**
 * 是综合订单  判断是创建综合订单还是继续预订 action
 * @param  
 */

export function onClickSure(bool) { 
    return dispatch => {
        dispatch({type: Types.COMPCREATEBOOL, bool:bool});
        handleData(dispatch,bool)
    }
}
function handleData(dispatch, bool) {
    dispatch({
        type:Types.COMPCREATEBOOL_SUCCESS,
        bool: bool,
    })

}