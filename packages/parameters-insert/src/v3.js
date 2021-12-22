const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generator = require('@babel/generator').default;
const type = require('@babel/types');

const sourceCode = `
    console.log(1);

    function func() {
        console.info(2);
    }

    export default class Clazz {
        say() {
            console.debug(3);
        }
        render() {
            return <div>{console.error(4)}</div>
        }
    }
`;

const ast = parser.parse(sourceCode, {
  sourceType: 'unambiguous',
  plugins: ['jsx'],
});

const targetCalleeName = ['log', 'info', 'error', 'debug'].map(i => `console.${i}`);

traverse(ast, {
  CallExpression(path, state) {
    if (path.node.isNew) {
      return;
    }
    const calleeName = generator(path.node.callee).code;
    if (targetCalleeName.includes(calleeName)) {
      const { line, column } = path.node.loc.start;
      const newNode = template.expression(`console.log("filename: (${line}, ${column})")`)();
      newNode.isNew = true;

      if (path.findParent(p => p.isJSXElement())) {
        path.replaceWith(type.arrayExpression([newNode, path.node]));
        path.skip();
      } else {
        path.insertBefore(newNode);
      }
    }
  }
});

const { code, map } = generator(ast);

console.log('code:', code);
console.log('map:', map);
