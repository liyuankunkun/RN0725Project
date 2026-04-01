import types from '../../action/types'

const defaultState = {};

export default function onAction(state = defaultState, action) {
    switch (action.type){
        case types.HOTELSHAREARR:
            return{
                shareAllArr: action.shareAllArr,
            }       
          default:
              return state;  
    }
}