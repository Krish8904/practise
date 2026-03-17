// dynamicRouter.js
const fetch = require("node-fetch");

const userMessage = event.payload.text.toLowerCase();
let apiUrl = "";
let reply = "Sorry, I don't understand that.";

// Map keywords to your backend routes
if (userMessage.includes("bookings")) {
  apiUrl = "http://localhost:5000/api/bookings";
} else if (userMessage.includes("careers") || userMessage.includes("jobs")) {
  apiUrl = "http://localhost:5000/api/career";
} else if (userMessage.includes("companies") || userMessage.includes("shops")) {
  apiUrl = "http://localhost:5000/api/companies";
} else if (userMessage.includes("expenses")) {
  apiUrl = "http://localhost:5000/api/expenses";
} else if (userMessage.includes("legal entity")) {
  apiUrl = "http://localhost:5000/api/legal-entities";
} else if (userMessage.includes("chat")) {
  apiUrl = "http://localhost:5000/api/chat";
}

if (apiUrl) {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    // Format reply depending on which API
    if (apiUrl.includes("/bookings")) {
      reply = `You have ${data.length} bookings.`;
    } else if (apiUrl.includes("/career")) {
      reply = `Available jobs: ${data.map(j => j.title).join(", ")}`;
    } else if (apiUrl.includes("/companies")) {
      reply = `Companies: ${data.map(c => c.name).join(", ")}`;
    } else if (apiUrl.includes("/expenses")) {
      reply = `There are ${data.length} expense records.`;
    } else if (apiUrl.includes("/legal-entities")) {
      reply = `Legal entities: ${data.map(l => l.name).join(", ")}`;
    } else if (apiUrl.includes("/chat")) {
      reply = data.reply || "Chat response received.";
    }

  } catch (err) {
    console.error(err);
    reply = "Oops! Something went wrong while fetching data.";
  }
}

// Send reply back to the user
bp.events.replyToEvent(event, [
  { type: "text", text: reply }
]);