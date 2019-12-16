# redux-wings
*"It gives your Redux wings!"*

A lightweight, dependency-free collection of utilities for streamlining Redux development by letting you quickly make synchronous or asynchronous actions. Designed to work great with the [Redux Ducks](https://github.com/erikras/ducks-modular-redux) pattern for modular and consistent Redux apps that scale on teams and projects that go beyond your typical CRUD systems.

- [Installation](#installation)
- [Library](#library)
- [Usage](#usage)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)


## Installation

```
npm i --save-dev redux-wings
```

## Library

### `createActions({ action, sliceNamespace })` ###

Creates actions in a declarative way that may or may not be asynchronous actions.

The `createActions` method accepts an object the following named parameters:


**`sliceNamespace`** `: String`

The redux namespace as *camelCase* that this slice belongs to. For example: `session`, `users`,  `userTransactions`, etc.

**`actions`** `: String | Object`

A list of actions either specified as a *camelCase* string representing the action namespace or an Object which determines Async action namespaces to create.

If specified as a `String`, will automatically generate namespace of action constant in *UPPER_SNAKE_CASE*, as well as a default *camelCase*'d function which will optionally just funnel a payload if available to the listening reducer when action dispatched.

If specified as an object, it will take an interface which would represent an object containing `namespace` (*camelCase*'d) and optionally if you would like to auto-generate asynchronous behavior as well as `XXX_SUCCESS`, `XXX_ERROR` and `XXX_REQUEST` boilerplate, `requestHandler` and `stateVariable`. These are used when we generate an `asyncReducer` (seen in final example in later section) which auto-augments functionality to toggle your `stateVariable` specified automatically.


### `AsyncStates` ###

An enum namespace for strings that represent for four different possible asynchronous states, those being:

**`IDLE`** : an action is idle when it has not been dispatched and the store has just initiated (and not yet a need to have checked it). It may also be reset to this state on success or error as specified by a user in reducer manually if they prefer to go with this paradigm (or after some time incrementally in an action dispatcher).

**`PROCESSING`** : an action that has been dispatched, and currently waiting on async action to result in `SUCCESS` or `ERROR`.

**`SUCCESS`** : an action which has successfully completed without errors after `PROCESSING`.

**`ERROR`** : an action which has contained some errors along the way (which may or may not have completed) after it was `PROCESSING`.


### `composeReducers(reducer1, reducer2(, ...otherReducers))` ###

Similar to `redux`'s `compose` function, but tailored for reducers to support unlimited function parameters (in this sense what we care about is `state` and `payload` params). This would allow us to compose one reducer slice from different functions and is a very streamline way to split up reducer functions in Redux.

Example:

```js
import { combineReducers } from 'redux'
import { composeReducers } from 'redux-wings'
import session from './modules/session'
import users from './modules/users'
import misc from './modules/misc'

// compose our session reducer to contain
// "loginState" as defined in sessionActions.js

const sessionReducer = composeReducers(session.actions.asyncReducer, session.reducer);

export default combineReducers({
    session  : sessionReducer,
    users    : users.reducer,
    feedback : feedback.reducer
});
```

**Important Note:** to properly process your existing state without declaring your async variable twice, the asyncReducer must be specified first
(`composeReducer` actually processes reducer arguments from right-to-left).

## Usage

Below is an example of generating actions painlessly for
logging in and logging out.

So lets say in our `actions.js` (part of our session ducks module at `[root]/modules/session/` folder),
we wish to generate actions that handle our login state as well as track how the request is going.

We could do that via the following:


**`modules/session/sessionActions.js`**
```js
import {
    createActions
} from 'redux-wings'
import api from 'my-app/api'
import appHistory from 'utils/appHistory'

// creates a new set of Redux actions
// for asynchronously logging in within
// "session" slice and then a standalone
// action type/action creator for logging out

// also, by providing "reducerVariable" to
// any async actions, we can get a handy
// reducer function that transforms our
// reducer state to contain the new variable
// at given state variable if necessary

const { actions, asyncReducer } = createActions({
    sliceNamespace : 'session',
    actions : [
        {
            namespace : 'login',
            requestHandler ({ username, password }) {
                return api.login({ username, password })
                    .then( result => new Promise((resolve, reject) => {

                        // re-route user to landing page
                        // before resolving login success

                        appHistory.goTo('/welcome');
                        resolve(result);

                        // "session/LOGIN_SUCCESS" is dispatched
                        //  automatically afterwards,
                        //  but if we get a failed action,
                        // "session/LOGIN_ERROR"

                    }));
            },

            // will cause reducers variable being output
            // to attach AsyncStates to `loginState` in
            // reducer for return object

            stateVariable : 'loginState'
        },

        // creates action dispatcher + "session/LOGOUT" type
        // which can optionally take a payload

        'logout'
    ]
});

// we now have access to all of the following!

const  {
    loginRequest,
    logout,
    LOGIN_REQUEST,
    LOGIN_SUCCESS,
    LOGIN_ERROR,
    LOGOUT,
    asyncReducer
} = actions;

// async reducer will now also be available
// to easily plug in our loginState variable
// functionality!
```

Continuing the above example, when combining our reducers using `combineReducers`, we can simply compose our reducer transformation functions using `composeReducers` to easily introduce our asynchronous variables without the boilerplate of repeating ourselves for every async action.

**`reducers.js`**
```js
import { combineReducers } from 'redux'
import { composeReducers } from 'redux-wings'
import session from './modules/session'
import users from './modules/users'
import misc from './modules/misc'

// compose our session reducer to contain "loginState"
// as defined in sessionActions.js

const sessionReducer = composeReducers(session.actions.asyncReducer, session.reducer);

export default combineReducers({
    session  : sessionReducer,
    users    : users.reducer,
    feedback : feedback.reducer
});
```

## Contributing

At the moment, this is actively used in some pretty large projects, but maintained by a very small team. If you have any issues, please feel free to submit as any feedback is appreciated! P.R.s and discussion for changes are always absolutely welcome and encouraged.

In terms of the philosophy behind this, while we would like to preserve backwards compatibility, the main goal is to make life easier without cutting corners or losing flexibility that Redux provides.

Thanks.

## License

- Open Source **[MIT license](./LICENSE.txt)**
- 2019 © <a href="http://robertconcepcion.com" target="_blank">Robert Concepción III</a>