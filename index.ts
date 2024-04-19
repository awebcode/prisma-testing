import express, { json } from "express";
import routes from "./routes/routes";
import cookieParser from "cookie-parser";
console.log({env:process.env.NODE})
const app = express();
app.use(json());
app.use(cookieParser())
app.use("/api/v1", routes);
const PORT = process.env.PORT 
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
