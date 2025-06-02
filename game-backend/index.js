import "dotenv/config";
import app from "./app.js";

const port = process.env.PORT ?? 3000;

app.listen(process.env.PORT ?? 3000, async () => {
  console.log(`Redis NodeJS server listening on port ${port}`);

});
