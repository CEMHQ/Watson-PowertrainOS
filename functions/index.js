/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// If you switch between multiple Firebase projects, you may want to
// use firebase use --add to change the active project, but no need to
// run firebase init again.

// Deploy Firebase Functions: Once you've
// written your functions, you can deploy them using Firebase CLI.
// To deploy only functions, use:firebase deploy --only functions

// To deploy all Firebase services (Functions, Firestore, Hosting, etc.),
// you can just run: firebase deploy

// Using Environment Configuration with Firebase Functions: If you're planning
// to use environment variables in Firebase Functions, Firebase provides a way
// to securely store those via the functions.config() method.

// To set environment variables, run the following command:
// firebase functions:config:set someservice.apikey="YOUR_API_KEY"

// You can access them in your functions like this:
// const functions = require('firebase-functions');
// const apiKey = functions.config().someservice.apikey;


/**
 * Import necessary modules for Firebase Functions and Firebase Admin SDK.
 */
const functions = require("firebase-functions");
const admin = require("firebase-admin");

/**
 * Initialize Firebase Admin SDK
 */
admin.initializeApp();

/**
 * This function fetches the API key and secret stored
 * in Firebase Functions config * and sends them back
 * in the response.
 *
 * @param {Object} req - The request object from the client.
 * @param {Object} res - The response object to send back
 *                       the API key and secret.
 */
exports.getApiKey = functions.https.onRequest(async (req, res) => {
  try {
    // Access the API key and secret stored in Firebase Functions config
    const apiKey = functions.config().watsonfleetfusion.apikey;
    const secret = functions.config().watsonfleetfusion.secret;

    // Send the API key and secret back as a response (for demonstration)
    console.log("API Key:", apiKey);
    console.log("Secret:", secret);

    // Send back the API Key and Secret to the client
    res.status(200).send(`API Key: ${apiKey}, Secret: ${secret}`);
  } catch (error) {
    console.error("Error retrieving API key or secret:", error);
    res.status(500).send("Error retrieving API key or secret");
  }
});
