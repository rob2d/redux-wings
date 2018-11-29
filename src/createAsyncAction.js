import { 
    toUpperSnakeCase 
} from './utils/nameConversions'

let actionVariants = [
    'REQUEST',
    'SUCCESS',
    'ERROR'
];

/**
 * populates a set of redux actions with
 * action namespace XXX and provides constants for
 * 
 * 
 * @param {Object} param0
 * @param {String} param0.namespace
 * @param {String} param0.sliceNamespace
 * @param {function} param0.requestHandler 
 */
function createAsyncAction ({ 
    actions, namespace, 
    sliceNamespace, requestHandler
 }) {
    let actionNsUC = toUpperSnakeCase(namespace);

    // populate namespaces for each variant

    actionVariants.forEach( variant => {
        let actionType = `${sliceNamespace}/${
            actionNsUC}_${variant}`;
        
        actions[`${actionNsUC}_${variant}`] = actionType;
    });

    // populate request logic

    let requestMethodNs = `${namespace}Request`;

    actions[requestMethodNs] = function(payload=undefined) {
        return (dispatch, getState) => {

            // signal that request was made

            dispatch({ 
                type : actions[`${actionNsUC}_REQUEST`], 
                payload 
            });

            // call async request caller
            
            return requestHandler(payload, getState)
                .then( response => {
                    return new Promise((resolve, reject)=> {
                        dispatch({ 
                            type    : actions[`${actionNsUC}_SUCCESS`],
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
    }
}

export default createAsyncAction