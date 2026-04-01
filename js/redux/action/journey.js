import StorageUtil from "../../util/StorageUtil";
import FlightService from '../../service/FlightService';
import InflFlightService from '../../service/InflFlightService';
import HotelService from '../../service/HotelService';
import TrainService from '../../service/TrainService';
import IntlHotelService from '../../service/IntlHotelService';
import FlightEnum from '../../enum/FlightEnum';
import IntlFlightEnum from '../../enum/IntlFlightEnum';
import TrainEnum from '../../enum/TrainEnum';
import Key from "../../res/styles/Key";
import UserInfoDao from '../../service/UserInfoDao';
import Types from './types';
import Util from '../../util/Util';
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
export function onRefreshJoruney(store, callBack) {
    let currentType = store.currentType;
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
        StorageUtil.loadKeyId(getCurrentId(currentType)).then(response => {
            let time = new Date().getTime();
            // if (time > Number(response) + TIME_OUT) {
            
              
            // }
            load(dispatch, store, callBack);
        }).catch(() => {
            load(dispatch, store, callBack);
        })
    }
}

export function journeySeach(store, callBack) {
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


export function journeyChangeText(type, text) {
    return { type: Types.JOURNEY_CHANGRE_TEXT, current: type, text: text };
}


export function onLoadMoreJourney(store, callBack) {

    return dispatch => {
        if (store && store[store.currentType]) {
            store[store.currentType].pageIndex++;
        }
        dispatch({ type: Types.JOURNEY_LOADMORE, current: store.currentType });
        if (store.userInfo && store.customerInfo) {
            getRequest(store, dispatch, callBack);
        } else {
            UserInfoDao.getUserInfo().then(userInfoData => {
                store.userInfo = userInfoData;
                UserInfoDao.getCustomerInfo().then(customerInfoData => {
                    store.customerInfo = customerInfoData;
                    getRequest(store, dispatch, callBack);
                }).catch(error => {
                    dispatch({ type: Types.JOURNEY_REQUEST_FAIL, current: store.currentType });
                    callBack(error.message || '获取客户信息失败');
                })
            }).catch(error => {
                dispatch({ type: Types.JOURNEY_REQUEST_FAIL, current: store.currentType });
                callBack(error.message || '获取用户信息失败');
            })
        }
    }
}


export function journeyChangeCurrentType(type) {
    return { type: Types.JOURNEY_CHANGRE_TYPE, value: type }
}

/**
 * 
 * @param  dispatch 
 * @param  store  数据对象
 * @param  callBack 返回操作
 */
function load(dispatch, store, callBack) {
    let currentType = store.currentType;
    dispatch({ type: Types.JOURNEY_REFRESH, current: currentType });
    if (store.userInfo && store.customerInfo) {
        getRequest(store, dispatch, callBack);
    } else {
        UserInfoDao.getUserInfo().then(userInfoData => {
            store.userInfo = userInfoData;
            UserInfoDao.getCustomerInfo().then(customerInfoData => {
                store.customerInfo = customerInfoData;
                getRequest(store, dispatch, callBack);
                callBack();
            }).catch(error => {
                dispatch({ type: Types.JOURNEY_REQUEST_FAIL, current: currentType });
                callBack(error.message || '获取客户信息失败');
            })
        }).catch(error => {
            dispatch({ type: Types.JOURNEY_REQUEST_FAIL, current: currentType });
            callBack(error.message || '获取用户信息失败');
        })
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
        // loadIntlHotelList(model, store, dispatch, callBack);
        loadHotelList(model, store, dispatch, callBack);
    } else if (currentType === orderType.train) {
        loadTrainList(model, store, dispatch, callBack)
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
            KeyWord: keyword,
            StatusLabel: FlightEnum.OrderStatusLabel.UnTravel,
            EmployeeId: userInfo && userInfo.Id,
            CustomerId: userInfo && userInfo.Customer && userInfo.Customer.Id,
            IsAppUnTravel:true
        }
    } else if (type === orderType.intlFlight) {
        model.Query = {
            KeyWord: keyword,
            StatusLabel: IntlFlightEnum.statusLabel.WaitTrip,
            EmployeeId: userInfo && userInfo.Id,
            CustomerId: userInfo && userInfo.Customer && userInfo.Customer.Id,
            IsAppUnTravel:true
        };
    } else if (type === orderType.train) {
        model.Query = {
            KeyWord: keyword,
            StatusLabel: TrainEnum.OrderStatusLabel.UnTravel,
            EmployeeId: userInfo && userInfo.Id,
            CustomerId: userInfo && userInfo.Customer && userInfo.Customer.Id,
            IsAppUnTravel:true
        }
    } else if (type === orderType.intlHotel) {
        model.Query = {
            EmployeeId: userInfo && userInfo.Id,
            StatusLabel: 'UnTravel',
            KeyWord: keyword,
            Domestic: false,
            IsAppUnTravel:true
        }
    } else if (type === orderType.hotel) {
        model.Query = {
            EmployeeId: userInfo && userInfo.Id,
            StatusLabel: 'UnTravel',
            KeyWord: keyword,
            Domestic: true,
            IsAppUnTravel:true
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
    FlightService.orderList(model).then(response => {
        if (response && Array.isArray(response.ListData)) {
            StorageUtil.saveKeyId(getCurrentId(currentType), String(new Date().getTime()));
            if (!store[currentType].data) {
                store[currentType].data = [];
            }
            response.ListData.forEach(item => {
                store[currentType]['data'].push(item);
            })

            if (response.TotalRecorder <= store[currentType]['data'].length) {
                dispatch({ type: Types.JOURNEY_NOMORE, current: currentType, store: store });
                
            } else {
                dispatch({ type: Types.JOURNEY_REQUEST_SUCCESS, current: currentType, store: store });
            }
            callBack();
        } else {
            dispatch({ type: Types.JOURNEY_REQUEST_FAIL, current: currentType });
            callBack();
        }
    }).catch(error => {
        dispatch({ type: Types.JOURNEY_REQUEST_FAIL, current: currentType });
        callBack(error.message || '获取机票订单列表异常');
    })
}







function loadInflFlightList(model, store, dispatch, callBack) {
    let listArr = [];
    InflFlightService.orderList(model).then(response => {
        if (response && response.ListData) {
            StorageUtil.saveKeyId(getCurrentId(store.currentType), String(new Date().getTime()));
            response.ListData.forEach(item => {
                item.DepartureEname = item.Departure;
                item.DestinationEname = item.Destination;
                if (item.AirportCities && Array.isArray(item.AirportCities)) {
                    item.AirportCities.forEach(value => {
                        if (item.Departure === value.Name) {
                            item.DepartureEname = value.EnName;
                        }
                        if (item.Destination === value.Name) {
                            item.DestinationEname = value.EnName;
                        }
                    })
                }
                item.Amount += item.ServiceCharge;
                listArr.push(item);
            })
            if (store[store.currentType]) {
                if (store[store.currentType].data && store[store.currentType].data.length > 0) {
                    store[store.currentType].data = store[store.currentType].data.concat(listArr);
                } else {
                    store[store.currentType].data = listArr;
                }
            }
            if (response.TotalRecorder <= store[store.currentType].data.length) {
                dispatch({ type: Types.JOURNEY_NOMORE, current: store.currentType, store: store })
            } else {
                dispatch({ type: Types.JOURNEY_REQUEST_SUCCESS, current: store.currentType, store: store });
            }
            callBack();
        } else {
            dispatch({ type: Types.JOURNEY_REQUEST_FAIL, current: store.currentType });
            callBack();
        }
    }).catch(error => {
        dispatch({ type: Types.JOURNEY_REQUEST_FAIL, current: store.currentType });
        callBack(error.message || '获取机票订单列表异常');
    })
}

function loadHotelList(model, store, dispatch, callBack) {
    HotelService.orderList(model).then(response => {
        if (response && response.success) {
            StorageUtil.saveKeyId(getCurrentId(store.currentType), String(new Date().getTime()));
            if (response.data && response.data.ListData && response.data.ListData.length > 0) {
                store[store.currentType].data = store[store.currentType].data.concat(response.data.ListData);
            }
            if (response.data.TotalRecorder <= store[store.currentType].data.length) {
                dispatch({ type: Types.JOURNEY_NOMORE, current: store.currentType, store: store })
            } else {
                dispatch({ type: Types.JOURNEY_REQUEST_SUCCESS, current: store.currentType, store: store });
            }
            callBack();
        } else {
            dispatch({ type: Types.JOURNEY_REQUEST_FAIL, current: store.currentType });
            callBack(response.message || '获取酒店列表失败');
        }
    }).catch(error => {
        dispatch({ type: Types.JOURNEY_REQUEST_FAIL, current: store.currentType });
        callBack(error.message || '获取酒店列表异常');
    })
}
function loadIntlHotelList(model, store, dispatch, callBack) {
    HotelService.orderList(model).then(response => {
        if (response && response.success) {
            StorageUtil.saveKeyId(getCurrentId(store.currentType), String(new Date().getTime()));
            if (response.data && response.data.ListData && response.data.ListData.length > 0) {
                store[store.currentType].data = store[store.currentType].data.concat(response.data.ListData);
            }
            if (response.data.TotalRecorder <= store[store.currentType].data.length) {
                dispatch({ type: Types.JOURNEY_NOMORE, current: store.currentType, store: store })
            } else {
                dispatch({ type: Types.JOURNEY_REQUEST_SUCCESS, current: store.currentType, store: store });
            }
            callBack();
        } else {
            dispatch({ type: Types.JOURNEY_REQUEST_FAIL, current: store.currentType });
            callBack(response.message || '获取酒店列表失败');
        }
    }).catch(error => {
        dispatch({ type: Types.JOURNEY_REQUEST_FAIL, current: store.currentType });
        callBack(error.message || '获取酒店列表异常');
    })
}

function loadTrainList(model, store, dispatch, callBack) {
    let listArr = [];
    TrainService.orderList(model).then(response => {
        if (response && response.ListData) {
            StorageUtil.saveKeyId(getCurrentId(store.currentType), String(new Date().getTime()));
            listArr = listArr.concat(response.ListData);
            store[store.currentType].data = store[store.currentType].data.concat(listArr);
            if (response.TotalRecorder <= store[store.currentType].data.length) {
                dispatch({ type: Types.JOURNEY_NOMORE, current: store.currentType, store: store })
            } else {
                dispatch({ type: Types.JOURNEY_REQUEST_SUCCESS, current: store.currentType, store: store });
            }
            callBack();
        } else {
            dispatch({ type: Types.JOURNEY_REQUEST_FAIL, current: store.currentType });
        }
    }).catch(error => {
        dispatch({ type: Types.JOURNEY_REQUEST_FAIL, current: store.currentType });
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
    intlHotel: 'intlHotel'
}
