const WebSocket = require('ws');

// Function to initialize WebSocket
const initWebSocket = (ws, req) => {
    console.log('New WebSocket connection established');

    // Handle incoming messages
    ws.on('message', (message) => {
        console.log('Received message:', message);
        
        // Here, you can handle the message, e.g., broadcast to other clients
        // For demonstration, echo the message back to the sender
        ws.send(`Echo: ${message}`);
    });

    // Handle connection close
    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });

    // Optional: send a welcome message to the new connection
    ws.send('Welcome to the WebSocket server!');
};

module.exports = { initWebSocket };
