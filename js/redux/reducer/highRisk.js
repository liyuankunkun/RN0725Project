import types from "../action/types";

const defaultState = {
    highRisk: null
}
export default function onAction(state = defaultState, action) {

    switch (action.type) {
        case types.HIGHRISKTYPE:
            return {
                ...state,
                highRisk: action.value
            }
    }
    return state;
}