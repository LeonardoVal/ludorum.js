/** TODO
*/
export function unimplemented(cls, method) {
  throw new Error(`${cls}.${method} not implemented! Please override.`);
}

/** TODO
*/
export function raise(...message) {
  throw new Error(message.join(''));
}

/** TODO
*/
export function raiseIf(condition, ...message) {
  if (condition) {
    raise(...message);
  }
}
