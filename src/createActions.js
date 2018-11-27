import createAsyncAction    from './createAsyncAction';
import { toUpperSnakeCase } from './utils/nameConversions'

function createActions(actions = {}) {
    for(let [slice, params] of Object.entries(actions)) {
        params.forEach( actionEntry => {
            
            // if a requestHandler was specified, 
            // we know that we are working with
            // an asynchronous action
            
            if(typeof actionEntry == 'object' && actionEntry.requestHandler) {
                const { namespace, requestHandler } = actionEntry;
                
                createAsyncAction({
                    actions,            
                    slice,
                    namespace, 
                    requestHandler 
                });

            } 
            
            // otherwise, we are working with
            // a non async function and just
            // want to generate an action dispatcher
            // and namespace
            
            else {
                const namespace = (
                    typeof actionEntry == 'object' ? 
                    actionEntry.namespace : actionEntry
                );

                const actionNSUC = toUpperSnakeCase(namespace);
                actions[actionNSUC] = `${slice}/${actionNSUC}}`;
                actions[namespace] = payload => ({ 
                    type : actions[actionNSUC], payload 
                });
            }
        });
    }

    return actions;
}

export default createActions