
import Key from "../../res/styles/Key";

import Types from './types';

import ReimbursementService from "../../service/ReimbursementService";
const TIME_OUT = 30 * 1000;
const PAGE_SIZE = 10;
/**
 * 
 * 
 * @param  currentType 当前业务类型
 * @param  keyword 关键字
 * @param {*} userInfo 用户信息
 * @param {*} customerInfo  客户配置信息
 * @param {*} callBack 返回异常处理
 */
export function onRefreshConsume(store, callBack) {
    return dispatch => {
        /** 添加加载时避免重复加载数据 */
        //先把数据重置
        if (store[store.currentType]) {
            store[store.currentType].data = [];
            store[store.currentType].pageIndex = 1;
        } else {
            store[store.currentType] = {
                data: [],
                pageIndex: 1
            }
        }
        load(dispatch, store, callBack);
    }
}


export function consumeSeach(store, callBack) {
    return dispatch => {
        //先把数据重置
        if (store[store.currentType]) {
            store[store.currentType].data = [];
            store[store.currentType].pageIndex = 1;
        } else {
            store[store.currentType] = {
                data: [],
                pageIndex: 1
            }
        }
        load(dispatch, store, callBack);
    }
}

export function onLoadMoreConsume(store, callBack) {

    return dispatch => {
        if (store && store[store.currentType]) {
            store[store.currentType].pageIndex++;
        }
        dispatch({ type: Types.CONSUME_LOADMORE, current: store.currentType });
        getRequest(store, dispatch, callBack);
    }
}


export function consumeChangeCurrentType(type) {
    return { type: Types.CONSUME_CHANGRE_TYPE, value: type }
}

export function consumeClean(type) {
    return { type: Types.CONSUME_CLEAN }
}



/**
 * 
 * @param  dispatch 
 * @param  store  数据对象
 * @param  callBack 返回操作
 */
function load(dispatch, store, callBack) {
    let currentType = store.currentType;
    dispatch({ type: Types.CONSUME_REFRESH, current: currentType });
    if (store.userInfo && store.customerInfo) {
        getRequest(store, dispatch, callBack);
    } else {
        getRequest(store, dispatch, callBack);
    }
}

/**
 * 
 * @param  type 业务
 * @param  model 请求参数
 * @param   dispatch 将dispatch 传递
 * @param  userInfo 用户名字
 * @param {*} customerInfo 客户名
 * @param {*} callBack 
 */
function getRequest(store, dispatch, callBack) {
    let currentType = store.currentType;
    let currentStore = store[currentType] || {};
    let model = getQueryModel(currentType, currentStore.keyword, currentStore.pageIndex, store.userInfo);
    if (currentType === orderType.flight) {
        loadFlightList(model, store, dispatch, callBack);
    } else if (currentType === orderType.hotel) {
        loadHotelList(model, store, dispatch, callBack);
    } else if (currentType === orderType.intlFlight) {
        loadInflFlightList(model, store, dispatch, callBack);
    } else if (currentType === orderType.intlHotel) {
        loadIntlHotelList(model, store, dispatch, callBack);
    } else if (currentType === orderType.train) {
        loadTrainList(model, store, dispatch, callBack)
    }else if(currentType === orderType.car){
        loadCarList(model, store, dispatch, callBack)
    }
}
/**
 *   获取请求参数
 * @param 类型 type 
 * @param  关键字 keyword 
 * @param 所在页数 pageIndex 
 * @param 用户信息 userInfo 
 */
function getQueryModel(type, keyword, pageIndex, userInfo) {
    let model = {
        Pagination: {
            PageSize: PAGE_SIZE,
            PageIndex: pageIndex
        }
    }
    if (type === orderType.flight) {
        model.Query = {
            Type: 2,
            OrderCategory: 1
        }
    } else if (type === orderType.intlFlight) {
        model.Query = {
            Type: 2,
            OrderCategory: 7
        };
    } else if (type === orderType.train) {
        model.Query = {
            Type: 2,
            OrderCategory: 5
        }
    } else if (type === orderType.intlHotel) {
        model.Query = {
            Type: 2,
            OrderCategory: 6
        }
    } else if (type === orderType.hotel) {
        model.Query = {
            Type: 2,
            OrderCategory: 4
        }
    } else if (type === orderType.car) {
        model.Query = {
            Type: 2,
            OrderCategory: 9
        }
    }
    return model;
}

/**
 *   加载国内机票订单列表 ，
 * @param  model 
 * @param {*} store 
 * @param {*} dispatch 
 * @param {*} callBack 
 */

function loadFlightList(model, store, dispatch, callBack) {
    let currentType = store.currentType;
    if (!store[currentType]) {
        store[currentType] = {};
    }

    ReimbursementService.ReimbursementBindList(model).then(response => {
        if (response && response.success) {
            if (!store[currentType].data) {
                store[currentType].data = [];
            }
            if (response.data && response.data.ListData && response.data.ListData.length > 0) {
                response.data.ListData.forEach(item => {
                    store[currentType]['data'].push(item);
                })
            }
            if (response.data && response.data.TotalRecorder <= store[currentType]['data'].length) {
                dispatch({ type: Types.CONSUME_NOMORE, current: currentType, store: store });
            } else {
                dispatch({ type: Types.CONSUME_REQUEST_SUCCESS, current: currentType, store: store });
            }
        } else {
            dispatch({ type: Types.CONSUME_REQUEST_FAIL, current: currentType });
            // callBack();
        }
    }).catch(error => {
        dispatch({ type: Types.CONSUME_REQUEST_FAIL, current: currentType });
        callBack(error.message || '获取机票订单列表异常');
    })
}







function loadInflFlightList(model, store, dispatch, callBack) {
    let listArr = [];

    ReimbursementService.ReimbursementBindList(model).then(response => {
        if (response && response.success) {
            if (!store[store.currentType].data) {
                store[store.currentType].data = [];
            }
            if (response.data && response.data.ListData && response.data.ListData.length > 0) {
                response.data.ListData.forEach(item => {
                    store[store.currentType]['data'].push(item);
                })
            }
            if (response.data && response.data.TotalRecorder <= store[store.currentType]['data'].length) {
                dispatch({ type: Types.CONSUME_NOMORE, current: store.currentType, store: store });
            } else {
                dispatch({ type: Types.CONSUME_REQUEST_SUCCESS, current: store.currentType, store: store });
            }
        } else {
            dispatch({ type: Types.CONSUME_REQUEST_FAIL, current: store.currentType });
            // callBack();
        }
    }).catch(error => {
        dispatch({ type: Types.CONSUME_REQUEST_FAIL, current: store.currentType });
        callBack(error.message || '获取机票订单列表异常');
    })
}

function loadHotelList(model, store, dispatch, callBack) {
    let currentType = store.currentType;
    ReimbursementService.ReimbursementBindList(model).then(response => {
        if (response && response.success) {
            if (!store[currentType].data) {
                store[currentType].data = [];
            }
            if (response.data && response.data.ListData && response.data.ListData.length > 0) {
                response.data.ListData.forEach(item => {
                    store[currentType]['data'].push(item);
                })
            }
            if (response.data && response.data.TotalRecorder <= store[currentType]['data'].length) {
                dispatch({ type: Types.CONSUME_NOMORE, current: currentType, store: store });
            } else {
                dispatch({ type: Types.CONSUME_REQUEST_SUCCESS, current: currentType, store: store });
            }
        } else {
            dispatch({ type: Types.CONSUME_REQUEST_FAIL, current: currentType });
            // callBack();
        }
    }).catch(error => {
        dispatch({ type: Types.CONSUME_REQUEST_FAIL, current: store.currentType });
        callBack(error.message || '获取酒店列表异常');
    })
}
function loadIntlHotelList(model, store, dispatch, callBack) {
    let currentType = store.currentType;
    ReimbursementService.ReimbursementBindList(model).then(response => {
        if (response && response.success) {
            if (!store[currentType].data) {
                store[currentType].data = [];
            }
            if (response.data && response.data.ListData && response.data.ListData.length > 0) {
                response.data.ListData.forEach(item => {
                    store[currentType]['data'].push(item);
                })
            }
            if (response.data && response.data.TotalRecorder <= store[currentType]['data'].length) {
                dispatch({ type: Types.CONSUME_NOMORE, current: currentType, store: store });
            } else {
                dispatch({ type: Types.CONSUME_REQUEST_SUCCESS, current: currentType, store: store });
            }
        } else {
            dispatch({ type: Types.CONSUME_REQUEST_FAIL, current: currentType });
            // callBack();
        }
    }).catch(error => {
        dispatch({ type: Types.CONSUME_REQUEST_FAIL, current: store.currentType });
        callBack(error.message || '获取酒店列表异常');
    })
}

function loadTrainList(model, store, dispatch, callBack) {
    let listArr = [];
    let currentType = store.currentType;
    ReimbursementService.ReimbursementBindList(model).then(response => {
        if (response && response.success) {
            if (!store[currentType].data) {
                store[currentType].data = [];
            }
            if (response.data && response.data.ListData && response.data.ListData.length > 0) {
                response.data.ListData.forEach(item => {
                    store[currentType]['data'].push(item);
                })
            }
            if (response.data && response.data.TotalRecorder <= store[currentType]['data'].length) {
                dispatch({ type: Types.CONSUME_NOMORE, current: currentType, store: store });
            } else {
                dispatch({ type: Types.CONSUME_REQUEST_SUCCESS, current: currentType, store: store });
            }
        } else {
            dispatch({ type: Types.CONSUME_REQUEST_FAIL, current: currentType });
            // callBack();
        }
    }).catch(error => {
        dispatch({ type: Types.CONSUME_REQUEST_FAIL, current: store.currentType });
        callBack(error.message || '获取订单列表失败');
    })

}
function loadCarList(model, store, dispatch, callBack) {
    let listArr = [];
    let currentType = store.currentType;
    ReimbursementService.ReimbursementBindList(model).then(response => {
        if (response && response.success) {
            if (!store[currentType].data) {
                store[currentType].data = [];
            }
            if (response.data && response.data.ListData && response.data.ListData.length > 0) {
                response.data.ListData.forEach(item => {
                    store[currentType]['data'].push(item);
                })
            }
            if (response.data && response.data.TotalRecorder <= store[currentType]['data'].length) {
                dispatch({ type: Types.CONSUME_NOMORE, current: currentType, store: store });
            } else {
                dispatch({ type: Types.CONSUME_REQUEST_SUCCESS, current: currentType, store: store });
            }
        } else {
            dispatch({ type: Types.CONSUME_REQUEST_FAIL, current: currentType });
            // callBack();
        }
    }).catch(error => {
        dispatch({ type: Types.CONSUME_REQUEST_FAIL, current: store.currentType });
        callBack(error.message || '获取订单列表失败');
    })

}

function getCurrentId(type) {

    let id = null;
    if (type === orderType.flight) {
        id = Key.JourneyFlightTime;
    } else if (type === orderType.intlFlight) {
        id = Key.JourneyIntlFlightTime;
    } else if (type === orderType.train) {
        id = Key.JourneyTrainTime;
    } else if (type === orderType.hotel) {
        id = Key.JourneyHotleTime;
    } else if (type === orderType.intlHotel) {
        id = Key.JourneyIntlHotleTime;
    }
    return id;
}

const orderType = {
    /**
     * 国内机票
     */
    flight: 'flight',
    /**
     * 国际机票
     */
    intlFlight: 'intlFlight',
    /**
     * 火车票
     */
    train: 'train',
    /**
     * 国内酒店
     */
    hotel: 'hotel',
    /**
     * 港澳台及国际酒店
     */
    intlHotel: 'intlHotel',
    /**
     * 租车
     */
    car: 'car'
}
