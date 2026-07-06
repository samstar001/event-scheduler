import express from 'express';
import eventsRouter from './routes/events.js'; // proper way of importing using ES Modules


const app = express() // create the app

app.use(express.json()) // enables Express (serves as middleware) to parse clients POST/events with a JSON body into an object
app.use('/events', eventsRouter)// this part register the event to routes from the files event.js, and send a response

const PORT = 3000; // Determine the local host port
app.listen(PORT, () => {
    console.log(`The server is running on http://localhost:${PORT}`)
}); // takes in the PORT and the callback function that runs once while the app.listen() runs infinite loop