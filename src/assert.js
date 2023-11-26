const notNull = (value) => value !== null && value !== undefined;

const assertNotNull = (...values) => {
  values.forEach((value) => {
    if (value === null || value === undefined) {
      throw new Error('Assertion failed');
    }
  });
  return true;
};
const assertMatches = (predicate, onFail, ...values) => {
  if (!predicate || typeof predicate !== 'function') {
    throw new Error('predicate must be defined');
  }

  if (!onFail || typeof onFail !== 'function') {
    throw new Error('onFail must be defined');
  }

  if (values.find((value) => !predicate(value))) {
    onFail();
  }
};

export { notNull, assertNotNull, assertMatches };
