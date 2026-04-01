import types from '../../action/types'

const defaultState = {};
/**
 * popular:{
 *     全部:{
 *        items:[],
 *        isLoading:false
 *     },
 *     已出票:{
 *        items:[],
 *        isLoading:false
 *     },
 *     已改签:{
 *        items:[],
 *        isLoading:false
 *     },
 * }
 * @param {*} state 
 * @param {*} action 
 */

export default function onAction(state = defaultState, action) {
    switch (action.type){
        case types.ENTERPRISEORDER_REFRESH_SUCCESS:
            return{
                    items: action.items,
                    isLoading: false
            }
        case types.ENTERPRISEORDER_REFRESH:
            return{
                    isLoading: true
            }
        case types.ENTERPRISEORDER_REFRESH_FAIL:
            return{
                    isLoading: false
            }             
          default:
              return state;  
    }
}

