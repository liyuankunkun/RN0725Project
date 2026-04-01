import types from "../action/types";

const defaultState = {
    feeType: 1 //因公因私
}
export default function onAction(state = defaultState, action) {

    switch (action.type) {
        case types.FEETYPETRANSFORM:
            return {
                ...state,
                feeType: action.value
            }
    }
    return state;
}