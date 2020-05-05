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
    'Success' : 'success',
    'Error' : 'error',
    'Request' : 'processing'
};

export default function createStateSlice({
    namespace: sliceNs,
    initialReducerState,
    createBaseReducer,
    actions,
    selectors,
}) {
    const output = { actions : {} };

    /**
     * maps action types to array of tuples containing
     * action variable -> value to set
     *
     * @type Map<string, [[string, string]]>
     **/
    const actionStateKVMap = new Map();

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

    for(const [actionNs, params] of Object.entries(actionSources)) {
        validateActionSource(params); // TODO

        const {
            isAsync=(params?.asyncRequest || params.asyncVarName || false)
        } = params;

        if(isAsync) {
            const {
                asyncVarName,
                asyncRequest,
                actionReducers, // TODO : check success, error and request
                asyncEffects
            } = params;

            createAsyncAction({
                sliceNs,
                actionNs,
                asyncRequest,
                asyncEffects,
                actions : output.actions
            });

            const stateVarNs = ((typeof asyncVarName == 'string') ?
                asyncVarName : `${actionNs}State`
            );

            if(actionReducers) {
                ['success', 'error', 'request']
                    .filter( typeSuffix => actionReducers[typeSuffix] )
                    .forEach( typeSuffix => {
                        const updater = (state, action, actions) => (
                            actionReducers[typeSuffix](state, action, actions)
                        );

                        if(updater && (typeof updater == 'function')) {
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

                            actionReducers.push(updater);
                            actionReducerMap.set(actionConst, actionReducers);
                        }
                    });
            }

            for(const suffix of actionSuffixes) {
                const asyncActionNs = `${actionNs}${suffix}`;
                const asyncActionConst = createActionConst(sliceNs, asyncActionNs);

                // assign action constant to actions object
                output.actions[toUpperSnakeCase(asyncActionNs)] = asyncActionConst;

                // prepare quick map action type lookup setters in reducer

                if(!actionStateKVMap.has(asyncActionConst)) {
                    actionStateKVMap.set(asyncActionConst, []);
                }

                const value = suffixValueDict[suffix];

                actionStateKVMap.get(asyncActionConst).push([
                    stateVarNs, { defaultValue : 'idle', value }
                ]);
            }
        }
        else if(!isAsync) {

            // if we're working with a sync action definition,
            // simply create a constant and optional payload dispatcher

            const actionConst = createActionConst(sliceNs, actionNs);
            output.actions[toUpperSnakeCase(actionNs)] = actionConst;

            const { actionReducer, actionCreator } = params;


            if(actionReducer) {
                const actionReducers = actionReducerMap.get(actionConst) || [];
                actionReducers.push(actionReducer);
                actionReducerMap.set(actionConst, actionReducers);
            }

            if(actionCreator) {
                output.actions[actionNs] = (payload=undefined) => {
                    const result = actionCreator(payload);
                    if(typeof result == 'function') {
                        return (dispatch, getState) => (
                            result(dispatch, getState, output.actions)
                        );
                    }
                    else {
                        return result;
                    }
                };
            }
            else {
                output.actions[actionNs] = (payload=undefined) => ({
                    type : actionConst,
                    payload
                });
            }
        }
    }

    const autoReducer = createAutoReducer({
        actionStateKVMap,
        initialReducerState,
        actionReducerMap,
        actions : output.actions
    });

    if(createBaseReducer) {
        const baseReducer = createBaseReducer(output.actions);
        output.reducer = composeReducers(baseReducer, autoReducer);
    }
    else {
        output.reducer = autoReducer;
    }

    // just temporarily
    output.selectors = selectors;

    return output;
}
