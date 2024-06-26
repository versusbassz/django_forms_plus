export function isString(str: any): str is string {
  return (typeof str) === 'string';
}

export function sprintf(str: string, ...args: any[]) {
  return str.replace(/{(\d+)}/g, function(match, number) {
    return (typeof args[number]) != 'undefined' ? args[number] : match;
  });
}
