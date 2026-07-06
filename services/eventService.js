// Where the business logic lies (CRUD functions)
import { readEvents, writeEvents } from '../utils/fileHelper.js';
import { validateEvent } from '../utils/validate.js';


export async function getAllEvents(){
    return await readEvents();
}

//Get all event by ID from data stored
export async function getEventById(id) {
    const events = await getAllEvents(); // fetch the entire array of events
    const foundEvent = events.find(event => event.id === Number(id)); // search the array for a matching id
    return foundEvent; //return the match (or undefined if not found)
}

// Validation Scope
export async function createEvent(data) {
    const errors = validateEvent(data);
    if (errors.length > 0){
        const validationError = new Error("Validation Failed");
        validationError.details = errors
        throw validationError;
    }

    const events = await getAllEvents(); //Fetch existing data
    // if Array is empty, start from 1, otherwise find the hightest ID and add 1
    const newId = events.length > 0 ? Math.max(...events.map(event => event.id)) + 1 : 1;

    //Data Structuring Scope
    const newEvent = {
        id: newId,
        title: data.title,
        date: data.date,
        time: data.time,
        description: data.description ? data.description.trim() : ""
    };

    //Persistence Scope
    events.push(newEvent);
    await writeEvents(events);

    return newEvent;
}

//fetch data and locate the even index
export async function updateEvent(id, data) {
    const events = await getAllEvents();
    const index = events.findIndex(event => event.id === Number(id));

    if (index === -1) {
        const notFoundError = new Error(`Event with ID ${id} not found.`);
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    //Merge existing event's field while keeping the original ID intact using spread operator
    const updatedEvent = {
        ...events[index], //starts with everything that currently exists.
        ...data, //override data with what client send
        id: events[index].id, // force id to stay the same, incase data contains a rogue id field
    };

    //Run validation on teh final merged object to make sure it's structurally valid
    const errors = validateEvent(updatedEvent);
    if (errors.length > 0) {
        const validationError = new Error("Validation Failed");
        validationError.details = errors;
        validationError.statusCode = 400;
        throw validationError;
    }

    // Sanitize text fields if they exist after the merge
    if (typeof updatedEvent.title === 'string') updatedEvent.title = updatedEvent.title.trim();
    if (typeof updatedEvent.description === 'string') updatedEvent.description = updatedEvent.description.trim();

    // Replace the old event object with the new one in the array
    events[index] = updatedEvent;

    await writeEvents(events); // save the array back to disk

    return updatedEvent; //New event structure is returned back to controller
}

//Delete and event from the database by it's ID
export async function deleteEvent(id) {
    const events = await getAllEvents();
    const index = events.findIndex(event => event.id === Number(id));

    //Handle missing event error using the same pattern as updateEvent
    if (index === -1) {
        const notFoundError = new Error(`Event with ID ${id} not found.`);
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    //Extract and save a reference tothe event before removing it
    const deletedEvent = events[index];
    events.splice(index, 1); //Remove exactly 1 element at the found index position
    
    await writeEvents(events); // save the updated array back to disk
    return deletedEvent; // Return the deleted event back to the route handler
}

// Deletes all events whose date/time is in the past
export async function deleteExpiredEvents(){
    //Fetch all evnets and grab the exact timestamp for "now"
    const events = await getAllEvents();
    const now = new Date();

    //Seperate expired events from upcoming ones in a clean, readable pass
    const expiredEvents = events.filter(event => {
        const eventDateTime = new Date(`${event.date}T${event.time}`);
        return eventDateTime < now;
    })

    const remainingEvents = events.filter(event => {
        const eventDateTime = new Date(`${event.date}T${event.time}`);
        return eventDateTime >= now;
    });

    //skip disk write if nothing changes
    if (expiredEvents.length === 0) {
        return []; // return empty array to indicate zero deletions
    }

    //Save the remaining events back to the database
    await writeEvents(remainingEvents);

    return expiredEvents; //Return list of removed items back to the route handler
}