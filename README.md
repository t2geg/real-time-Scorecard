Real-Time Cricket Scorecard Simulator
This web application simulates a short, 3-over cricket match in real-time. It features a modern, decoupled architecture where the match logic is handled by a serverless backend, and the score is updated live on the frontend without needing to refresh the page.

Live Demo: [Link to your deployed Netlify site]

🌟 Features
Live Score Updates: The scorecard automatically updates as the match progresses on the backend, powered by real-time database listeners.

Backend-Driven Simulation: The entire match logic runs on a serverless function, ensuring the simulation continues even if the user closes the browser.

Component-Based UI: The user interface is built with React and TypeScript, with a clean separation of concerns.

Serverless Architecture: The project uses a modern Jamstack approach with Netlify Functions for backend logic and Google Firebase for the database, ensuring scalability and a generous free tier.

🏗️ Architecture Overview
This project uses a hybrid cloud architecture, leveraging the strengths of two different platforms:

Frontend (React + Vite): The user interface is a modern React application built with TypeScript and Vite for a fast development experience. It is hosted on Netlify.

Backend Logic (Serverless Function): The match simulation is a long-running background function written in TypeScript and hosted on Netlify Functions.

Database (Firestore): The single source of truth for the match state is a Google Firebase Firestore document.

The flow is as follows:

The user clicks the "Start Match" button in the React UI.

The React app sends a request to the Netlify Background Function.

The Netlify function runs the ~36 second simulation, updating the Firestore document after each ball.

The React app has a live listener attached to the Firestore document, and the UI re-renders automatically with every change.

🛠️ Technologies Used
Frontend:

React

TypeScript

Vite

CSS

Backend:

Netlify Functions (Background Functions)

Node.js

Database:

Google Firebase Firestore

Deployment & Hosting:

Netlify

Git & GitHub

🚀 Setup and Installation
To run this project locally, you will need to have Node.js and npm installed.

1. Clone the Repository
git clone [your-repository-url]
cd [your-repository-folder]

2. Install Dependencies
Install the necessary packages for both the frontend and the backend function.

npm install

3. Set Up Firebase
Create a project on the Firebase Console.

Create a Firestore Database in your project. Start in test mode for development.

Create a matches collection and add a single document with a randomly generated ID. Populate the fields (batsmen, bowlers, score, live, status) according to the structure defined in src/types/index.ts.

Generate a Service Account Key:

In your Firebase project, go to Project Settings > Service accounts.

Click "Generate new private key". A JSON file will be downloaded.

4. Configure Environment Variables
In the root of the project, create a file named .env.

Add the following variables, replacing the placeholder values with your own keys:

# For the frontend (Vite)
VITE_API_KEY="YOUR_FIREBASE_API_KEY"
VITE_AUTH_DOMAIN="YOUR_FIREBASE_AUTH_DOMAIN"
VITE_PROJECT_ID="YOUR_FIREBASE_PROJECT_ID"
VITE_STORAGE_BUCKET="YOUR_FIREBASE_STORAGE_BUCKET"
VITE_MESSAGING_SENDER_ID="YOUR_FIREBASE_MESSAGING_SENDER_ID"
VITE_APP_ID="YOUR_FIREBASE_APP_ID"
VITE_MATCH_ID="YOUR_FIRESTORE_DOCUMENT_ID"

# For the backend (Netlify Function)
# Paste the entire content of your downloaded service account JSON file inside the quotes.
FIREBASE_SERVICE_ACCOUNT_KEY="{...}"

💻 Running Locally
This project uses the Netlify CLI to simulate the cloud environment locally.

Install the Netlify CLI:

npm install netlify-cli --save-dev

Run the development server:

npx netlify dev

This command will start the Vite server for the frontend and a local server for your startMatch-background.ts function.