import AsyncStates, {
    PROCESSING,
    SUCCESS,
    ERROR
} from './AsyncStates'
import createAsyncAction    from './createAsyncAction';
import { toUpperSnakeCase } from './utils/nameConversions'

/**
 * Creates a set of actions and possibly 
 * pure functions to augment your reducers
 * for async state mapping
 * 
 */
function createActions(actions) {
    let reducerStateMap = new Map();
    let reducers = {};

    for(let [slice, params] of Object.entries(actions)) {
      
        params.forEach( actionEntry => {
            
            // if a requestHandler was specified, 
            // we know that we are working with
            // an asynchronous action
            
            if(typeof actionEntry == 'object' && actionEntry.requestHandler) {
                const { 
                    namespace, 
                    requestHandler, 
                    stateVariable 
                } = actionEntry;
                
                createAsyncAction({
                    actions,            
                    slice,
                    namespace, 
                    requestHandler 
                });

                // if asyncVariable also specified,
                // populate a reducer function
                
                if(stateVariable) {
                    if(!reducerStateMap.has(slice)) {
                        reducerStateMap.set(slice, []);
                    }

                    const actionNSPrefix = `${slice}/${toUpperSnakeCase(namespace)}`;

                    reducerStateMap.get(slice).push({
                        stateVariable,
                        namespace,
                        actionTypeDict : {
                            [`${actionNSPrefix}_REQUEST`]  : PROCESSING,
                            [`${actionNSPrefix}_SUCCESS`] : SUCCESS,
                            [`${actionNSPrefix}_ERROR`]   : ERROR
                        }
                    });
                }
            } 
            
            // otherwise, we are working with
            // a non async function and just
            // want to generate an action dispatcher
            // and namespace
            
            else if(typeof asyncEntry == 'string'){
                const namespace = (
                    (typeof actionEntry == 'object') ? 
                    actionEntry.namespace : actionEntry
                );

                const actionNSUC = toUpperSnakeCase(namespace);
                actions[actionNSUC] = `${slice}/${actionNSUC}}`;
                actions[namespace] = payload => ({ 
                    type : actions[actionNSUC], payload 
                });
            }
        });


        // create functions for each slice to represent 
        // a sub reducer as needed

        for(let [slice, mappings] of reducerStateMap) {
            reducers = reducers || {};
            reducers[slice] = (state, { type, payload }) => {

                let newState = state; // will be modified immutably

                mappings.forEach(({ stateVariable, namespace, actionTypeDict }) => {

                    // if a state is first being created by containing
                    // reducer, it should populate extra state variables
                    // as "IDLE"; note we do not process this as a changing
                    // state because it is simply populating the variable
                    // where it hadn't existed, hence no new ref as redux
                    // always triggers an initial render for first state

                    if(typeof state[stateVariable] == 'undefined') {
                        state[stateVariable] = AsyncStates.IDLE;
                    }

                    // now lets check if actionTypeDict contains matches 
                    // for setting a new state variable

                    if(actionTypeDict[type] && stateVariable != actionTypeDict[type]) {
                        newState = Object.assign({ ...state }, { 
                            [stateVariable] : actionTypeDict[type]
                        });
                    }
                });

                return newState;
            };
        }

    }
    
    return { actions, reducers };
}

export default createActions