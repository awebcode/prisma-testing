// middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
// Extend the express types to include userId property
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const token = req.cookies.prismaAuthToken;
    if (!token) {
      throw new Error("No token provided.");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    // Attach userId to request for further processing
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).send("Invalid or expired token.");
  }
}
