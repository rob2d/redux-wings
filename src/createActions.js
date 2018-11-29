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
 * @param param0
 * @param param0.sliceNamespace {String}
 * 
 */
function createActions({ sliceNamespace, actions }) {
    const actionsCreated = {};
    let stateUpdateMap = new Map();

    actions.forEach( actionEntry => {
        
        // if a requestHandler was specified, 
        // we know that we are working with
        // an asynchronous action
        
        if((typeof actionEntry == 'object') && actionEntry.requestHandler) {
            const { 
                namespace, 
                requestHandler, 
                stateVariable 
            } = actionEntry;
            
            createAsyncAction({   
                actions : actionsCreated,      
                sliceNamespace,
                namespace, 
                requestHandler 
            });

            // if stateVariable also specified,
            // populate a reducer function
            
            if(stateVariable) {
                const actionNSPrefix = `${sliceNamespace}/${toUpperSnakeCase(namespace)}`;

                stateUpdateMap.set(stateVariable, {
                    [`${actionNSPrefix}_REQUEST`] : PROCESSING,
                    [`${actionNSPrefix}_SUCCESS`] : SUCCESS,
                    [`${actionNSPrefix}_ERROR`]   : ERROR
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
            params[actionNSUC] = `${sliceNamespace}/${actionNSUC}}`;
            params[namespace] = payload => ({ 
                type : params[actionNSUC], payload 
            });
        }
    });

    
    // create function to represent reducer
    // that can handle all state variables
    // specified to transform based on action
    // passed
        
    function asyncReducer(state, params = { 
        payload : {}, type : undefined 
    }) {    
        const { payload, type } = params;

        let newState = state; // will be modified immutably

        // iterate through each state variable

        for(let [stateVariable, actionTypeDict] of stateUpdateMap) {
            
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
        }

        return newState;
    };

    return { 
        actions : actionsCreated, 
        asyncReducer 
    };
}

export default createActions