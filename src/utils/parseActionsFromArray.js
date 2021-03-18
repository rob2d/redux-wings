export default function parseActionsFromArray(actions) {
    const sources = {};
    actions.forEach((a, i) => {
        if(typeof a == 'string') {
            sources[a] = { isAsync : false };
        }
        else {
            const { namespace, ...action } = a;
            if(!namespace) {
                throw new Error(
                    `actions specified via array need to each` +
                    `each have a 'namespace' property defined`
                );
            }
            sources[namespace] = action;
        }
    });

    return sources;
}
