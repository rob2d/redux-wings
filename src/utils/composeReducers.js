const identity = x => x;

export default function composeReducers(...reducers) {
    if(!reducers.length) {
        return identity;
    }

    if(reducers.length === 1) {
        return reducers[0];
    }

    return reducers.reduce((a, b) =>
        (value, ...rest) => a(b(value, ...rest), ...rest)
    );
}
