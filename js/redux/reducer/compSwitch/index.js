import types from '../../action/types'

const defaultState = {};

export default function onAction(state = defaultState, action) {
    switch (action.type){
        case types.COMPREHENSIVESWITCH:
            return{
                    bool: action.bool,
            }      
          default:
              return state;  
    }
}

