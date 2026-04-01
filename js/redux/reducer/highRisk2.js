import types from "../action/types";

const defaultState = {
    highRisk2: null
}
export default function onAction(state = defaultState, action) {

    switch (action.type) {
        case types.HIGHRISKTYPE2:
            return {
                ...state,
                highRisk2: action.value
            }
    }
    return state;
}