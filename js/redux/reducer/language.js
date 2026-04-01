import Types from '../action/types';
const defaultState = {
    // language: { name: '简体中文', value: 'zh' }
}
export default function onAction(state = defaultState, action) {
    switch (action.type) {
        case Types.LANGUAGE_LOAD:
            return {
                ...state,
                language: action.language
            }
        case Types.LANGUAGE_CHANGE:
            return {
                ...state,
                language: action.language
            }
        
    }
    return state;
}