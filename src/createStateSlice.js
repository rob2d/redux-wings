import { toUpperSnakeCase } from './utils/stringConversions';
import parseActionsFromArray from './utils/parseActionsFromArray';
import createAsyncAction from './createAsyncAction';
import createAutoReducer from './createAutoReducer';
import validateActionSource from './utils/validation/validateActionSource';
import composeReducers from './utils/composeReducers';

const createActionConst = (sliceNs, actionNs) => (
    `${sliceNs}/${toUpperSnakeCase(actionNs)}`
);

const actionSuffixes = ['Success', 'Error', 'Request'];
const suffixValueDict = {
    'Success': 'success',
    'Error': 'error',
    'Request': 'processing'
};

export default function createStateSlice({
    namespace: sliceNs,
    initialReducerState,
    createBaseReducer,
    actions,
    augmentedActions={},
    selectors,
}) {
    const output = {
        actions: { ...augmentedActions },
        source: {
            namespace: sliceNs,
            initialReducerState,
            createBaseReducer,
            actions,
            selectors
        }
    };

    /**
     * maps action types to array of tuples containing
     * action variable -> value to set
     *
     * @type Map<string, [[string, string]]>
     **/
    const actionStateKVMap = new Map();

    /**
     * maps reducer to each action
     */
    const actionReducerMap = new Map();

    // assert and convert actionOptions to standard object
    // type to allow for optional array format (which
    // in turn permits us to use strings for quick action namespaces)

    if(typeof actions != 'object') {
        throw new Error(
            'invalid actionsObject parameter supplied to createStateSlice;' +
            'must be an object or array'
        );
    }

    /**
     * normalized source options object for actions
     */
    const actionSources = ((!Array.isArray(actions)) ?
        actions : parseActionsFromArray(actions)
    );

    for(const [actionNs, actionDef] of Object.entries(actionSources)) {
        validateActionSource(actionDef); // TODO

        const {
            isAsync=(
                (typeof actionDef != 'function') &&
                (actionDef?.asyncRequest || actionDef?.asyncVarName || false)
            )
        } = actionDef;

        if(isAsync) {
            const {
                asyncStateMapper,
                asyncVarName,
                asyncRequest,
                actionReducers,
                asyncEffects
            } = actionDef;

            createAsyncAction({
                sliceNs,
                actionNs,
                asyncRequest,
                asyncEffects,
                actions: output.actions
            });

            let stateVarNs;

            if(typeof asyncVarName == 'string') {
                stateVarNs = asyncVarName;
            } else if(asyncStateMapper) {
                stateVarNs = `${actionNs}StateMap`;
            } else {
                stateVarNs = `${actionNs}State`;
            }

            if(actionReducers) {
                ['success', 'error', 'request']
                    .filter(typeSuffix => actionReducers[typeSuffix] )
                    .forEach(typeSuffix => {
                        const actionReducer = (state, action, actions) => (
                            actionReducers[typeSuffix](state, action, actions)
                        );

                        if(actionReducer && (typeof actionReducer == 'function')) {
                            const capitalizedSuffix = typeSuffix.replace(
                                0, typeSuffix.charAt(0).toUpperCase()
                            );

                            const actionConst = createActionConst(
                                sliceNs,
                                `${actionNs}_${capitalizedSuffix}`
                            );

                            const actionReducers = (
                                actionReducerMap.get(actionConst) || []
                            );

                            actionReducers.push(actionReducer);
                            actionReducerMap.set(actionConst, actionReducers);
                        }
                    });
            }

            for(const suffix of actionSuffixes) {
                const asyncActionNs = `${actionNs}${suffix}`;
                const asyncActionConst = createActionConst(sliceNs, asyncActionNs);

                // assign action constant to actions object

                output.actions[toUpperSnakeCase(asyncActionNs)] = asyncActionConst;

                // prepare quick map action type
                // lookup setters in reducer

                if(!actionStateKVMap.has(asyncActionConst)) {
                    actionStateKVMap.set(asyncActionConst, []);
                }

                // determine how to map a value whenever an
                // async event happens; if asyncStateMapper fn
                // is provided, we can infer from state, payload
                // the same way we do in redux later

                actionStateKVMap.get(asyncActionConst).push([
                    stateVarNs, {
                        asyncStateMapper,
                        defaultValue: asyncStateMapper ? new Map() : 'idle',
                        value: suffixValueDict[suffix]
                    }
                ]);
            }
        } else if(!isAsync) {
            // if we're working with a sync action definition,
            // simply create a constant and optional payload dispatcher

            const actionType = createActionConst(sliceNs, actionNs);
            output.actions[toUpperSnakeCase(actionNs)] = actionType;

            let actionReducer;
            let actionCreator;

            switch (typeof actionDef) {
                case 'function' : {
                    actionReducer = actionDef;
                    break;
                }
                case 'object' : {
                    actionReducer = actionDef.actionReducer;
                    actionCreator = actionDef.actionCreator;
                    break;
                }
                default : {
                    throw new Error('invalid action definition passed to redux-wings');
                }
            }

            if(actionReducer) {
                const actionReducers = actionReducerMap.get(actionType) || [];
                actionReducers.push(actionReducer);
                actionReducerMap.set(actionType, actionReducers);
            }

            if(actionCreator) {
                output.actions[actionNs] = (payload=undefined) => {
                    const result = actionCreator(payload);
                    if(typeof result == 'function') {
                        return (dispatch, getState) => (
                            result(dispatch, getState, output.actions, actionType)
                        );
                    } else {
                        return result;
                    }
                };
            } else {
                output.actions[actionNs] = (payload=undefined) => ({
                    type: actionType,
                    payload
                });
            }
        }
    }

    const autoReducer = createAutoReducer({
        actionStateKVMap,
        initialReducerState,
        actionReducerMap,
        actions: output.actions
    });

    if(createBaseReducer) {
        const baseReducer = createBaseReducer(output.actions);
        output.reducer = composeReducers(baseReducer, autoReducer);
    }
    else {
        output.reducer = autoReducer;
    }

    // until we create an actual selector
    // interface, simply echo through
    // an optional function so a user
    // doesn't have to split up code
    // in certain ways

    output.selectors = selectors;

    return output;
}
