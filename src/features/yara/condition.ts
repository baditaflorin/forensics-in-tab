export function evaluateBooleanExpression(condition: string, matchedIds: Set<string>): boolean {
  const tokens = condition.match(/\$[A-Za-z_][A-Za-z0-9_]*|and|or|not|\(|\)/gi) ?? [];
  const values: boolean[] = [];
  const ops: string[] = [];

  const precedence = (operator: string) => (operator === 'not' ? 3 : operator === 'and' ? 2 : 1);
  const apply = () => {
    const operator = ops.pop();
    if (!operator) {
      return;
    }
    if (operator === 'not') {
      values.push(!(values.pop() ?? false));
      return;
    }
    const right = values.pop() ?? false;
    const left = values.pop() ?? false;
    values.push(operator === 'and' ? left && right : left || right);
  };

  for (const raw of tokens) {
    const token = raw.toLowerCase();
    if (token.startsWith('$')) {
      values.push(matchedIds.has(raw.slice(1)));
    } else if (token === '(') {
      ops.push(token);
    } else if (token === ')') {
      while (ops.length && ops[ops.length - 1] !== '(') {
        apply();
      }
      ops.pop();
    } else {
      while (
        ops.length &&
        ops[ops.length - 1] !== '(' &&
        precedence(ops[ops.length - 1]) >= precedence(token)
      ) {
        apply();
      }
      ops.push(token);
    }
  }

  while (ops.length) {
    apply();
  }

  return values.pop() ?? false;
}
