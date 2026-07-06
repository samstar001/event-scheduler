// File to read/write "data/event.json"
import fs from 'fs/promises';
import path from 'path';
import {fileURLToPath} from 'url';

// Recreate __filename and __dirname constants, by default it's available on ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//creating the path to data/events.json
const dataPath = path.join(__dirname, '..', 'data', 'events.json');

//This aspect reads the file, parses JSON and returns the array (readEvents)
export async function readEvents() {
    try{
        const data = await fs.readFile(dataPath, 'utf-8');// read the file at dataPath as a text string
        return JSON.parse(data);//parse the string into a JavaScript and return array
    } catch (error){
        if (error.code === 'ENOENT'){
            return[]; //returns an empty string if file doesn't exist
        }
        console.error("Error reading events file:", error);
        throw error;
    }
}

// This aspect takes an array and write it back to the file (writeEvents)
export async function writeEvents(events) {
    try {
        const stringifiedData = JSON.stringify(events, null, 2) // the "null, 2" formatting makes the array human-readable json STRING
        await fs.writeFile(dataPath, stringifiedData, 'utf-8'); //write the string directly to the events.json file
    } catch (error) {
        console.error("Error writing to events file:", error); // this log the error for local debugging
        throw error; // throw error to inform service layer about failed save operation
    }
}