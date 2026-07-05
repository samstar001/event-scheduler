// For Logic Validation (title/date/time)

//Validates an event data before creating or updating an event
export function validateEvent(event){
    const errors = [];
    // This check Title exist, is a string and it is not just empty space
    if(!event.title || typeof event.title !== 'string' || event.title.trim() === ''){
        errors.push("Title is required and must be a non-empty text string.")
    }

    //The date validation using the (format YYYY-MM-DD)
    // Confirm if it matches the date format of 4 digit - 2 digit - 2 digit pattern
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!event.date || !dateRegex.test(event.date)) {
        errors.push("Date is required and must match the YYYY-MM-DD format.");
    }

    //The Time Validation to match the format (HH:MM in 24 hour clock)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    //Check if time exists and matches the 24 hours time stamp
    if(!event.time || !timeRegex.test(event.time)) {
        errors.push("Time is required and must be in the HH:MM 24 hour format.");
    }
    return errors // Return the array of errors, empty arry [] = data is valid

}