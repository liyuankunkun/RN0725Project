import Types from '../types';
/**
 * 是综合订单列表 继续预订 ，已经选好的出差人的 action
 * @param  
 */

export function setHotelShareArr(shareAllArr) { 
    return dispatch => {
        dispatch({type: Types.HOTELSHAREARR, shareAllArr});
        handleData(dispatch,shareAllArr)
    }
}
function handleData(dispatch, shareAllArr) {
    dispatch({
        type:Types.HOTELSHAREARR,
        shareAllArr: shareAllArr,
    })
}