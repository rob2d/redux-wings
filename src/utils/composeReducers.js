function composeReducers( ...reducers ) {
  if (reducers.length === 0) {
    return x => x;
  }

  if (reducers.length === 1) {
    return reducers[0];
  }

  return reducers.reduce((a, b) => 
    (value, ...rest) => 
        a(b(value, ...rest), ...rest)
    );
}

export default composeReducers