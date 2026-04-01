import types from '../../action/types'

const defaultState = {};

export default function onAction(state = defaultState, action) {
    switch (action.type){
        case types.COMPSELECTTRAVELLERS:
            return{
                compEmployees: action.compEmployees,
                compTraveler:action.compTraveler,
                travellers:action.travellers
            }
        case types.ENTERPRISEORDER:
            return{
                    isLoading: true
            }        
          default:
              return state;  
    }
}

