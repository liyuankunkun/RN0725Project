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
        case types.COMPCHECKTREVALLER_REFRESH_SUCCESS:
            return{
                    userInfo: action.model,
                    employees:action.employees,
                    travellers:action.travellers,
                    ProjectId:action.ProjectId,
                    ReferenceEmployeeId:action.ReferenceEmployeeId,
                    IdModel:action.IdModel,
                    referencPassengerId:action.referencPassengerId,
                    ProjectItem:action.ProjectItem
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

