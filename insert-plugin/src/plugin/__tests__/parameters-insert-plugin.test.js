const { default: pluginTester } = require('babel-plugin-tester')

pluginTester({
  plugin: require('../parameters-insert-plugin'),
  babelOptions: {
    parserOpts: {
      sourceType: 'unambiguous',
      plugins: ['jsx']
    }
  },
  tests: {
    'console.Xxx前插入了CallExpression的AST': {
      code: `
        console.log(1);

        function func() {
          console.info(2)
        }
        
        export default class clazz {
          say() {
            console.debug(3)
          }
          render() {
            return (
              <div>{console.error(4)}</div>
            )
          }
        }
      `,
      snapshot: true,
    }
  }
})