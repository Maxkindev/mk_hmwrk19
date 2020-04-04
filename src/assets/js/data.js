const regExpPatterns = {
  id: /^[1-9][0-9]{0,11}$/, // first digit must be > 0, + max 11 more digits, no letters
  taskName: /^[a-zA-Z0-9_-][a-zA-Z0-9_-\s]{1,49}$/, // from 1 to 50 symbols, and first symbol can't be space
};

const correctExamples = {
  id: '[12 digits]',
  taskName: '[1-50 symbols]'
}