import Types from '../types';
import EnterpriseOrderService from '../../../service/EnterpriseOrderService'
/**
 * 获取企业订单数据的异步action
 * @param  
 */

export function loadFlightData(model) {    
    return dispatch => {
        dispatch({type: Types.ENTERPRISEORDER_REFRESH, model:model});
        EnterpriseOrderService.Enterprise_load(model)
        .then(response => {
            if(response&&response.success){
            handleData(dispatch,model,response.data)
            }else{
            
            }
        })
        .catch(error => {
            dispatch({
                type: Types.ENTERPRISEORDER_REFRESH_FAIL,
                storeName,
                error
            })
        })
    }
}
function handleData(dispatch, model, data) {
    dispatch({
        type:Types.ENTERPRISEORDER_REFRESH_SUCCESS,
        items:data.ListData,
        model
    })

}