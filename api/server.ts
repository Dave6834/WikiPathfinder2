import express from "express";
import { registerRoutes } from "../server/routes.js";
import dotenv from "dotenv";

dotenv.config();

// Create express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register routes
const server = await registerRoutes(app);

export { server }; 