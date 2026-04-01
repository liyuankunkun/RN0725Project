import types from "../action/types";

const defaultState = {
    apply: null
}
export default function onAction(state = defaultState, action) {

    switch (action.type) {
        case types.APPLY_SET_VALUE:
            return {
                ...state,
                apply: action.value
            }
    }
    return state;
}