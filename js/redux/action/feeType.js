import types from "./types";

export function feeTypeTransform(type) {
    return { type: types.FEETYPETRANSFORM, value: type }
}