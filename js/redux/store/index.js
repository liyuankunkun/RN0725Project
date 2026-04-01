
import { createStore, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';
import reducer from '../reducer';
const logger = store => next => action => {
    if (typeof action === 'function') {
    } else {
    }
    const result = next(action);
    return result;
};

const middlewares = [
    logger,
    thunk,
];
export default createStore(reducer, applyMiddleware(...middlewares));