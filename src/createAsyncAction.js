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
        request : createActionConst(sliceNs, `${actionNs}Request`),
        success : createActionConst(sliceNs, `${actionNs}Success`),
        error : createActionConst(sliceNs, `${actionNs}Error`)
    };

    actions[`${actionNs}Request`] = (payload=undefined) => (dispatch, getState) => {
        let requestResult = asyncRequest(payload);

        // if we have a function as request result,
        // we are interpreting a thunk

        if(typeof requestResult == 'function') {
            requestResult = requestResult(dispatch, getState, actions);
        }

        if(asyncEffects?.request) {
            asyncEffects.request(payload)(dispatch, getState, actions);
        }
        else {
            dispatch({ type : actionTypes.request, payload });
        }

        const onSuccess = asyncEffects?.success ?
            payload => asyncEffects.success(payload)(dispatch, getState, actions) :
            payload => dispatch({ type : actionTypes.success, payload });

        const onError = asyncEffects?.error ?
            error => asyncEffects.error(error)(dispatch, getState, actions) :
            error => dispatch({
                type : actionTypes.error,
                payload : {
                    ...payload,
                    error
                } });

        if(requestResult.then) {
            return requestResult.then(onSuccess).catch(onError);
        }
        else {
            return onSuccess(requestResult).catch(onError);
        }
    };

    if(asyncEffects?.success) {
        actions[`${actionNs}Success`] = (payload=undefined) => (dispatch, getState) =>
            payload => asyncEffects.success(payload)(dispatch, getState, actions);
    }

    if(asyncEffects?.error) {
        actions[`${actionNs}Error`] = (payload=undefined) => (dispatch, getState) =>
            payload => asyncEffects.error(payload)(dispatch, getState, actions);
    }
}
