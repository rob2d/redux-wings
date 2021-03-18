# redux-wings
*"It gives your Redux wings!"*

A lightweight, dependency-free collection of utilities for streamlining Redux development by letting you quickly make synchronous or asynchronous actions. Designed to work great with the [Redux Ducks](https://github.com/erikras/ducks-modular-redux) pattern for modular and consistent Redux apps that scale on teams and projects that go beyond your typical CRUD systems.

- [Installation](#installation)
- [Library](#library)
    - [createStateSlice](#createstateslice)
    - [AsyncStates](#asyncstates--idle--error--processing--success)
    - [composeReducers](#composereducersreducer1-reducer2-otherreducers)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)


## Installation

```
npm i --save-dev redux-wings
```

## Library

### `createStateSlice` ###

Creates `{ actions, reducers }` in order to augment and generate a specific redux app state slice --
this is the bread and butter here.

Example @
`${rootSrc}/modules/tasks/tasksSlice.js`
```js
import { createStateSlice } from 'redux-wings';
import getTasks from 'api'; // async function

const initialReducerState = {

    tasks: [],

    // auto-generated/managed by creating the
    // async action of "tasks", but listed for
    // clarity's sake

    getTasksState: 'idle'
};

const { actions, reducer } = createStateSlice({
    namespace: 'tasks',
    initialReducerState,
    actions: {

        // auto-generates the constants:

        // 'tasks/GET_TASKS_REQUEST'
        // 'tasks/GET_TASKS_SUCCESS',
        // 'tasks/GET_TASKS_ERROR'

        // as well as the actions
        // getTasksRequest,

        // and appends these to output actions

        asyncRequest: getTasks,
        asyncReducers: {

            // note that we do not need to do anything
            // to update getTasksState, this will auto
            // set itself to 'success' here

            success: (state, { type, payload }) => {
                return {
                    ...state,
                    todos: payload
                }
            },

            // getTasksState also auto-updates itself to
            // "error" here, and same for "request"

            error: (state, { type, payload }) => {
                return {
                    ...state,
                    todos: []
                }
            },

            // getTasksState also auto-updates itself to
            // "error" here, and same for "request"

            request: (state, { type, payload }) => {
                return {
                    ...state,
                    todos: []
                }
            }
        }
    }
});
```




**`sliceNamespace`** `: String`

The redux namespace as *camelCase* that this slice belongs to. For example: `session`, `users`,  `userTransactions`, etc.

**`actions`** `: String | Object`

A list of actions either specified as a *camelCase* string representing the action namespace or an Object which determines Async action namespaces to create.

If specified as a `String`, will automatically generate namespace of action constant in *UPPER_SNAKE_CASE*, as well as a default *camelCase*'d function which will optionally just funnel a payload if available to the listening reducer when action dispatched.

If specified as an object, it will take an interface which would represent an object containing `namespace` (*camelCase*'d) and optionally if you would like to auto-generate asynchronous behavior as well as `XXX_SUCCESS`, `XXX_ERROR` and `XXX_REQUEST` boilerplate, `requestHandler` and `stateVariable`. These are used when we generate an `asyncReducer` (seen in final example in later section) which auto-augments functionality to toggle your `stateVariable` specified automatically.

### `AsyncStates : IDLE | ERROR | PROCESSING | SUCCESS` ###

A string enum that represent for four different possible asynchronous states, those being:

**`IDLE`** : an action is idle when it has not been dispatched and the store has just initiated (and not yet a need to have checked it). It may also be reset to this state on success or error as specified by a user in reducer manually if they prefer to go with this paradigm (or after some time incrementally in an action dispatcher).

**`PROCESSING`** : an action that has been dispatched, and currently waiting on async action to result in `SUCCESS` or `ERROR`.

**`SUCCESS`** : an action which has successfully completed without errors after `PROCESSING`.

**`ERROR`** : an action which has contained some errors along the way (which may or may not have completed) after it was `PROCESSING`.

Example usage:

Can be imported either

1. with enums directly from package module

```js
    import {
        IDLE,
        SUCCESS,
        ERROR,
        PROCESSING
    } from 'redux-wings';
```
or

2. as a namespace
```js
import { AsyncStates } from 'redux-wings';
```

Note that these are simply strings of `idle`, `processing`, `success` or `error`. The constants are provided to help centralize or prevent errors.

**Important Note:** to properly process your existing state without declaring your async variable twice, the asyncReducer must be specified first
(`composeReducer` actually processes reducer arguments from right-to-left).

## Usage

TODO: document new version usage

## Contributing

If you have any issues, please feel free to submit as any feedback and iteration is always appreciated! P.R.s and discussion for changes are always absolutely welcome and encouraged.

In terms of the philosophy behind this, while we would like to preserve backwards compatibility, the main goal is to make life easier without cutting corners or losing flexibility that Redux provides.

## License

Open Source **[MIT](./LICENSE.txt)**