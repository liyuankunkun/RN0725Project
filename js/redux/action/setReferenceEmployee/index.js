import Types from '../types';
/**
 * 是综合订单列表 继续预订 ，存储当前综合订单Id action
 * @param  
 */

export function setReferenceEmployee(ReferenceEmployee) { 
    return dispatch => {
        dispatch({type: Types.REFERENCEEMPLOYEE, ReferenceEmployee:ReferenceEmployee});
        handleData(dispatch,ReferenceEmployee)
    }
}
function handleData(dispatch, ReferenceEmployee) {
    dispatch({
        type:Types.REFERENCEEMPLOYEE,
        ReferenceEmployee: ReferenceEmployee,
    })

}