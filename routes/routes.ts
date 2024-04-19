// routes.ts
import express from "express";
import {
  registerUser,
  loginUser,
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  getAllUsers,
  deleteUsers,
  getAllPostsBygroup,
} from "../controllers/controllers";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/users", authMiddleware, getAllUsers);
router.delete("/users", authMiddleware, deleteUsers);
router.post("/posts", authMiddleware, createPost);
router.get("/posts", getAllPosts);
router.get("/posts/:id", getPostById);
router.put("/posts/:id", updatePost);
router.delete("/posts/:id", deletePost);
router.get("/posts/get/aggregate", authMiddleware, getAllPostsBygroup);
export default router;
