import types from '../../action/types'

const defaultState = {};

export default function onAction(state = defaultState, action) {
    switch (action.type){
        case types.HOTELCANSELRULE:
            return{
                    value: action.value,
            }      
          default:
              return state;  
    }
}

