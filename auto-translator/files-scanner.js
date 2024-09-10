import { promises as fs } from 'fs';
import path from 'path';

export async function getFiles(directory) {
  try {
    const files = await fs.readdir(directory);

    return files.filter(file => path.extname(file) === '.json');
  } catch (error) {
    console.error('Error reading files:', error);
    return [];
  }
}

export async function read(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    throw error;
  }
}

// Function to replace text in the given content
export async function replace(content, searchText, replaceText) {
  // Create a regular expression for global replacement
  const regex = new RegExp(searchText, 'g');

  // Count the occurrences of the search text
  const matchArray = content.match(regex);
  const occurrences = matchArray ? matchArray.length : 0;

  // Perform the replacement
  const updatedContent = content.replace(regex, replaceText);

  // Return the updated content and the number of occurrences replaced
  return {
    content: updatedContent,
    occurrences
  };
}

// Function to write the modified content back to a file
export async function write(filePath, content) {
  try {
    await fs.writeFile(filePath, content, 'utf-8');
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
    throw error;
  }
}


