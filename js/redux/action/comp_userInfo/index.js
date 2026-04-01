import Types from '../types';
/**
 * 将综合订单模式选择的用户信息全局储存action
 * @param  
 */

export function onLoadcomprehensiveData(model,employees,travellers,ProjectId,ReferenceEmployeeId,IdModel,referencPassengerId,ProjectItem) { 
    return dispatch => {
        dispatch({type: Types.COMPCHECKTREVALLER_REFRESH, model:model});
        handleData(dispatch,model,employees,travellers,ProjectId,ReferenceEmployeeId,IdModel,referencPassengerId,ProjectItem)
    }
}
function handleData(dispatch, model,employees,travellers,ProjectId,ReferenceEmployeeId,IdModel,referencPassengerId,ProjectItem) {
    dispatch({
        type:Types.COMPCHECKTREVALLER_REFRESH_SUCCESS,
        //items:data.ListData,
        model:model,//userInfo
        employees:employees,
        travellers:travellers,
        ProjectId:ProjectId,//项目Id
        ReferenceEmployeeId:ReferenceEmployeeId,
        IdModel:IdModel,
        referencPassengerId:referencPassengerId,
        ProjectItem:ProjectItem
    })

}