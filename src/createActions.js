import { IDLE, PROCESSING, SUCCESS, ERROR } from './AsyncStates'
import createAsyncAction    from './createAsyncAction';
import { toUpperSnakeCase } from './utils/stringConversions'

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
    const newActions = {};
    let stateUpdateMap = new Map();

    actions.forEach((action={}) => {
        const { namespace, requestHandler, stateVariable } = action;

        // if "requestHandler" or "stateVariable"
        // existed, we know that we are working
        // with an asynchronous action

        if((typeof action == 'object') && (requestHandler || stateVariable)) {
            createAsyncAction({
                actions : newActions,
                sliceNamespace,
                namespace,
                requestHandler
            });

            // if stateVariable also specified,
            // populate stateUpdateMap with actions
            // which correspond to an AsyncState

            const hasStateVariable = (
                (typeof stateVariable == 'string') &&
                stateVariable
            );

            if(hasStateVariable) {
                const actionNSPrefix = `${sliceNamespace}/${toUpperSnakeCase(namespace)}`;

                if(!stateUpdateMap.has(stateVariable)) {
                    stateUpdateMap.set(stateVariable, {});
                }

                const updateMapEntry = stateUpdateMap.get(stateVariable);

                stateUpdateMap.set(stateVariable, {
                    ...stateUpdateMap.get(stateVariable),
                    [`${actionNSPrefix}_REQUEST`] : PROCESSING,
                    [`${actionNSPrefix}_SUCCESS`] : SUCCESS,
                    [`${actionNSPrefix}_ERROR`] : ERROR
                });
            }
        }

        // otherwise, we are working with
        // a non async function and just
        // want to generate an action dispatcher
        // and namespace

        else if(typeof action == 'string'){
            const namespace = action; // alias

            const actionNSUC = toUpperSnakeCase(namespace);
            newActions[actionNSUC] = `${sliceNamespace}/${actionNSUC}`;
            newActions[namespace] = payload => ({
                type : newActions[actionNSUC], payload
            });
        }
    });


    // create function to represent reducer
    // that can handle all state variables
    // specified to transform based on action
    // passed

    function asyncReducer(state, params={}) {
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
                state[stateVariable] = IDLE;
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
        actions : newActions,
        asyncReducer
    };
}

export default createActions;
