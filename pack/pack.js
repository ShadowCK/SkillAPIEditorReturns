import fs from 'fs';
import archiver from 'archiver';
import * as glob from 'glob';
import { fileURLToPath } from 'url';
import { dirname, resolve, sep } from 'path';

// Get the current file and directory path
const __filename = fileURLToPath(new URL(import.meta.url));
const __dirname = dirname(__filename);

// Create a write stream to 'release.zip'
const output = fs.createWriteStream(resolve(__dirname, '../dist/release.zip'));
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
  // Extract the base directory name from the relative path, e.g., '../dist' to 'dist'
  const baseDirName = directory.split('/').pop();

  const dirPath = resolve(__dirname, directory);

  const files = glob.sync(`${dirPath}/**/*`, { nodir: true }).filter((file) => {
    // Extract the filename using the correct path separator
    const filename = file.substring(file.lastIndexOf(sep) + 1);
    const relativePath = file.substring(file.indexOf(sep) + 1);
    console.log('--------------------------------------------------');
    console.log('__dirname                       :', __dirname);
    console.log('directory                       :', directory);
    console.log('exclude                         :', exclude);
    console.log('baseDirName                     :', baseDirName);
    console.log('dirPath                         :', dirPath);
    console.log('file                            :', file);
    console.log('filename                        :', filename);
    console.log('relativePath                    :', relativePath);
    console.log('resolve(dirPath, relativePath)  :', resolve(dirPath, relativePath));
    console.log('relativePath !== exclude        :', relativePath !== exclude);
    console.log(`relativePath -> ${relativePath} | ${exclude} <- exclude`);
    console.log('--------------------------------------------------');
    return relativePath !== exclude;
  });

  files.forEach((file) => {
    archive.file(file, { name: file });
  });
};

// Call the function to add all files from '../dist' excluding 'release.zip'
addFilesExclude('../dist', 'release.zip');

// Add other directories and files
archive.directory(resolve(__dirname, '../media'), 'media');
archive.file(resolve(__dirname, '../index.html'), { name: 'index.html' });

// Finalize the archive
archive.finalize();
