import types from '../../action/types'

const defaultState = {};

export default function onAction(state = defaultState, action) {
    switch (action.type){
        case types.COMPMASSORDERID:
            return{
                massOrderId: action.massOrderId,
            }     
          default:
              return state;  
    }
}

