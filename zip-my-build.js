const fs = require('fs');
const archiver = require('archiver');
const path = require('path');

// Path to the built HTML file
const htmlFilePath = 'build/index.html';

// Path to the static folder
const staticFolderPath = 'build/static';

// Path to the output zip file with a custom name and path
const zipFilePath = '/Users/kirupalakshmi/Desktop/chatbot.zip';

// Function to remove files with specific extensions from a directory
function removeFilesWithExtensions(directory, extensions) {
    const files = fs.readdirSync(directory);

    files.forEach((file) => {
        const filePath = path.join(directory, file);

        if (fs.statSync(filePath).isDirectory()) {
            // Recursively remove files in subdirectories
            removeFilesWithExtensions(filePath, extensions);
        } else {
            // Remove the file if it has one of the specified extensions
            if (extensions.some((ext) => file.endsWith(ext))) {
                fs.unlinkSync(filePath);
                console.log(`Removed: ${filePath}`);
            }
        }
    });
}

// Read the HTML file
let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');

// Make modifications to the HTML content (replace /static/ with static/)
htmlContent = htmlContent.replace(/\/static\//g, 'static/');

// Write the modified HTML back to the file
fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');

// Remove .map and .txt files from static/js and static/css
removeFilesWithExtensions(path.join(staticFolderPath, 'js'), ['.map', '.txt']);
removeFilesWithExtensions(path.join(staticFolderPath, 'css'), ['.map', '.txt']);

// Create a zip file with index.html and static folder
const output = fs.createWriteStream(zipFilePath);
const archive = archiver('zip', { zlib: { level: 9 } });

archive.pipe(output);
archive.file(htmlFilePath, { name: 'index.html' }); // Add index.html to the zip
archive.directory(staticFolderPath, 'static'); // Add the static folder to the zip
archive.finalize();
console.log("Completed")
