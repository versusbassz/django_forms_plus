export function isString(str) {
  return typeof str === 'string';
}

export function sprintf(str, ...args) {
  return str.replace(/{(\d+)}/g, function(match, number) {
    return typeof args[number] != 'undefined' ? args[number] : match;
  });
}
