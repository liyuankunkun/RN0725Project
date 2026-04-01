import Types from '../action/types';
const defaultSate = {
    currentType: 'flight',
}

export default function onAction(state = defaultSate, action) {

    switch (action.type) {
        case Types.CONSUME_REFRESH:
            return {
                ...state,
                [action.current]: {
                    ...state[action.current],
                    isLoading: true,
                    pageIndex: 1
                }
            }
        case Types.CONSUME_REQUEST_SUCCESS:
            return {
                ...state,
                ...action.store,
                [action.current]: {
                    ...state[action.current],
                    ...action.store[action.current],
                    loadingMore: false,
                    isLoading: false,
                    isNoMoreData: false,
                }
            }
        case Types.counts:
            return {
                ...state,
                [action.current]: {
                    ...state[action.current],
                    keyword: action.text
                }
            }
        case Types.CONSUME_REQUEST_FAIL:
            return {
                ...state,
                [action.current]: {
                    ...state[action.current],
                    isLoading: false,
                    loadingMore: false
                }
            }
        case Types.CONSUME_LOADMORE:
            return {
                ...state,
                [action.current]: {
                    ...state[action.current],
                    loadingMore: true
                }
            }
        case Types.CONSUME_NOMORE:
            return {
                ...state,
                ...action.store,
                [action.current]: {
                    ...state[action.current],
                    ...action.store[action.current],
                    loadingMore: false,
                    isLoading: false,
                    isNoMoreData: true,
                }
            }
        case Types.CONSUME_CHANGRE_TYPE:
            return {
                ...state,
                currentType: action.value
            }
        case Types.CONSUME_CLEAN:
            return  {
                currentType: 'flight',
            };
    }
    return defaultSate;

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