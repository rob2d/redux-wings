/**
 * creates reducer which listens in on
 * ations
 * @param {*} param0
 * @param {Map<String, Array>} param0.actionStateKVMap
 */
export default function createAutoReducer({
    actionStateKVMap,
    initialReducerState={},
    actionReducerMap,
    actions
}) {
    const initialState = { ...initialReducerState };

    // populate the initial state for action type namespaces detected
    // which contain defaultValue (if not already overriden
    // by a user-defined value @ initialState[key])

    for(const [actionType, stateKVs] of actionStateKVMap) {
        stateKVs.forEach(([key, { defaultValue }]) => {
            const hadInitValue = (initialState[key] !== undefined);
            if((defaultValue !== undefined) && !hadInitValue) {
                initialState[key] = defaultValue;
            }
        });
    }

    return (state={ ...initialState }, { type, payload }) => {
        let nextState = state;

        if(actionStateKVMap.has(type)) {
            nextState = { ...state };

            const kvPairs = actionStateKVMap.get(type);

            kvPairs.forEach(([key, { asyncStateMapper, value }]) => {
                if(asyncStateMapper) {

                    // map is altered by user; but we make this immutable
                    // by default so that the map can be set in-place

                    const stateMap = new Map(state[key]);
                    asyncStateMapper({
                        stateMap,
                        payload,
                        asyncState : value,
                        state
                    });
                    nextState[key] = stateMap;
                }
                else {
                    nextState[key] = value;
                }
            });
        }

        if(actionReducerMap.has(type)) {
            const actionReducers = actionReducerMap.get(type) || [];

            for(const r of actionReducers) {
                nextState = r(nextState, { type, payload }, actions);
            }
        }

        return nextState;
    };
}
