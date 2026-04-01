import Types from '../action/types';

const defaultState = {
    page: 1,
    data: [],
    keyWord: "",
    isLoading: false,
    loadingMore: false,
    isNoMoreData: false
}

export default function onAction(state = defaultState, action) {
    switch (action.type) {
        case Types.PASSENGER_REFRESH:
            return {
                ...state,
                isLoading: true,
                ...action.param,
            }
            break;
        case Types.PASSENGER_REQUEST_SUCCESS:
            return {
                ...state,
                isLoading: false,
                ...action.param,
                loadingMore: false,
            }
        case Types.PASSENGER_REQUEST_FAIL:
            return {
                ...state,
                isLoading: false,
                loadingMore: false,
            }
        case Types.PASSENGER_NOMORE:
            return {
                ...state,
                ...action.param,
                loadingMore: false,
                isLoading: false,
                isNoMoreData: true
            }
        case Types.PASSENGER_RESET:
            return {
                ...defaultState,
                keyWord:''
            }
        default:
            break;

    }
    return state;
}