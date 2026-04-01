
import types from "./types";
export function applySet(value) {
    return { type: types.APPLY_SET_VALUE, value: value }
}