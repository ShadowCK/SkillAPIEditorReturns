import fs from 'fs';
import archiver from 'archiver';
import * as glob from 'glob';
import { fileURLToPath } from 'url';
import { dirname, resolve, sep } from 'path';

// Get the current file and directory path
const __filename = fileURLToPath(new URL(import.meta.url));
const __dirname = dirname(__filename);

// Load package.json
// This can be achieved by code below. However, ESLint hasn't supported this yet
// import config from '../package.json' assert { type: "json" };
// More info: https://github.com/eslint/eslint/discussions/15305
const config = JSON.parse(fs.readFileSync(resolve(__dirname, '../package.json')));

// Create a write stream to 'release.zip'
const output = fs.createWriteStream(resolve(__dirname, `../dist/${config.name}-${config.version}.zip`));
const archive = archiver('zip', {
  zlib: { level: 9 }, // Set the compression level
});

// Listen for the 'close' event
output.on('close', () => {
  console.log(`${archive.pointer()} total bytes`);
  console.log('Archiver has been finalized and the output file descriptor has closed.');
});

// Listen for the 'error' event
archive.on('error', (err) => {
  throw err;
});

// Pipe the archive output to the file stream
archive.pipe(output);

// Function to add files to the archive, excluding a specified file
const addFilesExclude = (directory, exclude) => {
  const baseDirName = directory.split('/').pop();
  const dirPath = resolve(__dirname, directory);

  // Convert the exclude parameter to a RegExp if it's not already one
  const excludeRegex = typeof exclude === 'string' ? new RegExp(exclude) : exclude;

  const files = glob.sync(`${dirPath}/**/*`, { nodir: true }).filter((file) => {
    const filename = file.substring(file.lastIndexOf(sep) + 1);
    const relativePath = file.substring(file.indexOf(sep) + 1);
    return !excludeRegex.test(relativePath);
  });

  files.forEach((file) => {
    archive.file(file, { name: file });
  });
};

// Call the function to add all files from '../dist' excluding 'release(...).zip'
addFilesExclude('../dist', `^${config.name}.*\\.zip$`);

// Add other directories and files
archive.directory(resolve(__dirname, '../media'), 'media');
archive.file(resolve(__dirname, '../index.html'), { name: 'index.html' });

// Finalize the archive
archive.finalize();
