import { toUpperSnakeCase } from './utils/stringConversions';

const actionVariants = ['REQUEST', 'SUCCESS', 'ERROR'];

/**
 * populates a set of redux actions with
 * action namespace XXX and provides constants
 *
 *
 * @param {Object} param0
 * @param {String} param0.namespace
 * @param {String} param0.sliceNamespace
 * @param {function} param0.requestHandler
 * @param {Object}
 */
function createAsyncAction({ actions, namespace, sliceNamespace, requestHandler }) {
    const actionNsUC = toUpperSnakeCase(namespace);

    // populate namespaces for each variant

    actionVariants.forEach( variant => {
        const constant = `${sliceNamespace}/${actionNsUC}_${variant}`;
        actions[`${actionNsUC}_${variant}`] = constant;
    });

    // populate request logic

    const requestMethodNs = `${namespace}Request`;

    actions[requestMethodNs] = (payload=undefined) => {
        return (dispatch, getState) => {

            // signal that request was made

            dispatch({ type : actions[`${actionNsUC}_REQUEST`], payload });

            // call async request caller

            let requestResult = requestHandler(payload);

            // if we have a function as request result,
            // we are interpreting a thunk
            if(typeof requestResult == 'function') {
                requestResult = requestResult(dispatch, getState);
            }

            return requestResult
                .then( response => {
                    return new Promise((resolve, reject)=> {
                        dispatch({
                            type : actions[`${actionNsUC}_SUCCESS`],
                            payload : response
                        });

                        resolve(response);
                    });
                })
                .catch( error => {
                    dispatch({
                        type    : actions[`${actionNsUC}_ERROR`],
                        payload : error
                    });
                });
        };
    };
}

export default createAsyncAction;
