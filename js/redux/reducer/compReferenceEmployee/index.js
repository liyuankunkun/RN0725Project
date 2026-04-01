import types from '../../action/types'

const defaultState = {};

export default function onAction(state = defaultState, action) {
    switch (action.type){
        case types.REFERENCEEMPLOYEE:
            return{
                ReferenceEmployee: action.ReferenceEmployee,
            }     
          default:
              return state;  
    }
}

