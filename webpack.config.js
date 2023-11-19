import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
// Note: Cannot use __dirname and __filename in Node.js's ES module, 
// because it's meant to be compatible with both Node.js and browser.
// The following code is a workaround for this issue, only works in Node.js.
// It's fine since we won't use this config file in browser.
const __filename = fileURLToPath(new URL(import.meta.url));
const __dirname = dirname(__filename);

export default {
  entry: './src/main.js',
  mode: 'development',
  watchOptions: {
    aggregateTimeout: 200,
  },
  output: {
    path: resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
};