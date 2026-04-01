import types from "./types";

export function highRiskSetData(data) {
    return { type: types.HIGHRISKTYPE, value: data }
}