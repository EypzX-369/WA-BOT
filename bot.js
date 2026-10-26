const client = require("./lib/client");
const connect = async () => {
  try {
    await client.initialize();
  } catch (error) {
    console.error("Bot failed to start:", error);
  }
};
connect();
