// GET routes (all + by id)

import express from 'express';
import { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent } from '../services/eventService.js';

const router = express.Router();

//Get /events (fetch all events from database)
router.get('/', async (req, res) => {
    try {
        const events = await getAllEvents();
        res.status(200).json(events); // 200 - OK: Send all list of events
    }catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ message: "Server Error: Could not retrieve events from the server."});
    }
});

// GET /events/:id (Fetches a single event by its ID)
router.get('/:id', async (req, res) => {
    try {
        const event = await getEventById (req.params.id);
        if (!event) {
            return res.status(404).json({ message: `Event with ID ${req.params.id} not found`}); //if event is undefined, send 404 with a message
        }
        res.status(200).json(event);// otherwise return the event
    } catch (error) {
        console.error(`Error fetching event ${req.params.id}:`, error)
        res.status(500).json({ message: "Server Error: Could not retrieve event from the server."})
    }
});

// POST Events (Creates a new event)
// 201 Created: Send back the newly created event object
router.post('/', async (req, res) => {
    try {
        const newEvent = await createEvent(req.body);
        res.status(201).json(newEvent);
    } catch (error) {
        // if our service layer threw a validation error, pass along the details
        if (error.details) {
            return res.status(400).json({ message: error.message, details: error.details});
        }
        console.error("Error creating event", error);
        res.status(500).json({ message: "Server Error: Could not create event."})
    }
});
// PUT /events/:id (Updates an existing event partially or completely.)
router.put('/:id', async (req, res) => {
    try {
        const updated = await updateEvent (req.params.id, req.body);
        res.status(200).json(updated);
    } catch (error) {
        // Check if our service attached a custome statusCode (404 or 400)
        if (error.statusCode) {
            return res.status(error.statusCode).json({message: error.message, ...(error.details && {details: error.details})
        });
        }
        console.error(`Error updating event ${req.params.id}:`, error);
        res.status(500).json({message: "Server Error: Could not update event."})
    } 
})

export default router;