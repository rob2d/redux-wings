import createAsyncAction from './createAsyncAction';
import createStateSlice from './createStateSlice';
import * as AsyncStates from './AsyncStates';
import composeReducers from './utils/composeReducers';

const { IDLE, PROCESSING, SUCCESS, ERROR } = AsyncStates;

export {
    createAsyncAction,
    createStateSlice,
    composeReducers,
    AsyncStates,
    IDLE,
    PROCESSING,
    SUCCESS,
    ERROR
};

export default {
    createAsyncAction,
    createStateSlice,
    composeReducers,
    AsyncStates,
    IDLE,
    PROCESSING,
    SUCCESS,
    ERROR
};
