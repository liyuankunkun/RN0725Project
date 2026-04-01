import ComprehensiveService from '../../service/ComprehensiveService'
import Types from './types';
// fromccd  是否是出差单选人
export function passengerLoad(params, index, callBack,fromComp, that,fromccd) {
    return dispatch => {
        dispatch({ type: Types.PASSENGER_REFRESH, param: { keyWord: params.keyWord, IsNotManager:params.IsNotManager} })
        params.page = 1;
        params.data = [];
        setTimeout(() => {
                loadEmployee(params, dispatch, callBack,fromComp,that,fromccd); //选择出差人 接口
        }, 100)
    }
}

export function passengerLoadMore(params) {
    return dispatch => {

    }
}

export function passengerReset() {
    return { type: Types.PASSENGER_RESET }
}


function loadEmployee(param, dispatch, callBack,fromComp,that,fromccd) {
    let model = {
        Query: {
            Keyword: param.keyWord,//指定关键字查询，为空则查询最近出差人
            OriginType:fromccd?1: 0,//出差人所属类型，1：员工，其他值为常旅客
        },
        Pagination: {
            PageIndex: 1,//当前页码
            PageSize: 10//数量限制
        }   
    }
    let service = ComprehensiveService.MassOrderQueryTravellers
    that.showLoadingView();
    service(model).then(response => {
        that.hideLoadingView();
        if (response && response.success) {
            if (response.data && response.data.ListData) {
                response.data.ListData.forEach(item => {
                    if(fromComp===1){item.fromComp=1}
                    param.data.push(item);
                })
            }
            if (response.data.TotalRecorder <= param.data.length) {
                dispatch({ type: Types.PASSENGER_NOMORE, param: { page: param.page, data: param.data } })
            } else {
                dispatch({ type: Types.PASSENGER_REQUEST_SUCCESS, param: { page: param.page, data: param.data } })
            }
        } else {
            dispatch({ type: Types.PASSENGER_REQUEST_FAIL });
            callBack(response.message || '获取员工列表失败');
        }
    }).catch(error => {
        dispatch({ type: Types.PASSENGER_REQUEST_FAIL });
        callBack(error.message || '获取员工列表异常');
    })

}