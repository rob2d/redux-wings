import createActionConst from './utils/createActionConst';

/**
 *
 * @param {Object} param0
 * @param {String} param0.namespace
 * @param {String} param0.sliceNamespace
 * @param {function} param0.asyncRequestHandler
 * @param {Object}
 */
export default function createAsyncAction({
    actionNs, sliceNs, asyncRequest, asyncEffects, actions
}) {
    const actionTypes = {
        request: createActionConst(sliceNs, `${actionNs}Request`),
        success: createActionConst(sliceNs, `${actionNs}Success`),
        error: createActionConst(sliceNs, `${actionNs}Error`)
    };

    actions[`${actionNs}Request`] = (payload=undefined) => (dispatch, getState) => {
        let requestResult = asyncRequest(payload);

        // if we have a function as request result,
        // we are interpreting a thunk,
        // which means we should assume user has control
        // over dispatching async request action payload as well

        let isAsyncRequestThunk = false;

        if(typeof requestResult == 'function') {
            requestResult = requestResult(
                dispatch,
                getState,
                actions,
                actionTypes.request
            );
            isAsyncRequestThunk = true;
        }

        if(asyncEffects?.request) {
            asyncEffects.request(payload)(
                dispatch,
                getState,
                actions,
                actionTypes.request
            );
        } else if(!isAsyncRequestThunk) {
            dispatch({ type: actionTypes.request, payload });
        }

        const onSuccess = asyncEffects?.success ?
            payload => asyncEffects.success(payload)(dispatch, getState, actions, actionTypes.success) :
            payload => dispatch({ type: actionTypes.success, payload });

        const onError = asyncEffects?.error ?
            error => asyncEffects.error(error)(dispatch, getState, actions, actionTypes.error) :
            error => {
                console.error(error);
                dispatch({
                    type: actionTypes.error,
                    payload: { ...payload, ...error }
                });
            };

        if(requestResult?.then) {
            return requestResult.then(onSuccess).catch(onError);
        } else if((isAsyncRequestThunk && requestResult) || !isAsyncRequestThunk) {
            return onSuccess(requestResult).catch(onError);
        }
    };
}
