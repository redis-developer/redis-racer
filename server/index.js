import "dotenv/config";
import app from "./app.js";

const port = process.env.PORT ?? 3000;

console.log(process.env);

app.listen(process.env.PORT ?? 3000, async () => {
  console.log(`game-backend server listening on port ${port}`);

});
