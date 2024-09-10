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