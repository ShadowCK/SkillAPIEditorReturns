import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import webpack from 'webpack'; // eslint-disable-line import/no-extraneous-dependencies

// Note: Cannot use __dirname and __filename in Node.js's ES module,
// because it's meant to be compatible with both Node.js and browser.
// The following code is a workaround for this issue, only works in Node.js.
// It's fine since we won't use this config file in browser.
const __filename = fileURLToPath(new URL(import.meta.url));
const __dirname = dirname(__filename);

// npm run webpack -- --mode development or npm run webpack -- --mode production
// This equals npx webpack --mode development or npx webpack --mode production
// "webpack" in `npm run webpack` is the script name, it can be anything else.
// By using -- --mode, we can pass --mode to webpack instead of npm.
export default (env, argv) => {
  const mode = argv.mode || 'development';
  return {
    entry: './src/main.js',
    mode,
    watchOptions: {
      aggregateTimeout: 200,
    },
    output: {
      path: resolve(__dirname, 'dist'),
      filename: 'bundle.js',
    },
    // These works like C++ macros. Webpack will replace the keys in the code with the values.
    // They are still interpreted as code. That's why we need '"some string content"' for a
    // string instead of 'some string content'.
    plugins: [
      new webpack.DefinePlugin({
        WEBPACK_MODE: JSON.stringify(mode === 'production' ? 'production' : 'development'),
      }),
    ],
  };
};
