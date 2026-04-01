import Types from '../types';
/**
 * 是综合订单列表 继续预订 ，存储当前综合订单Id action
 * @param  
 */

export function setComp_Id(massOrderId) { 

    return dispatch => {
        dispatch({type: Types.COMPMASSORDERID, massOrderId:massOrderId});
        handleData(dispatch,massOrderId)
    }
}
function handleData(dispatch, massOrderId) {
    dispatch({
        type:Types.COMPMASSORDERID_SUCCESS,
        massOrderId: massOrderId,
    })

}