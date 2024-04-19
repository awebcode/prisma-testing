"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes.ts
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers/controllers");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.post("/register", controllers_1.registerUser);
router.post("/login", controllers_1.loginUser);
router.get("/users", authMiddleware_1.authMiddleware, controllers_1.getAllUsers);
router.delete("/users", authMiddleware_1.authMiddleware, controllers_1.deleteUsers);
router.post("/posts", authMiddleware_1.authMiddleware, controllers_1.createPost);
router.get("/posts", controllers_1.getAllPosts);
router.get("/posts/:id", controllers_1.getPostById);
router.put("/posts/:id", controllers_1.updatePost);
router.delete("/posts/:id", controllers_1.deletePost);
router.get("/posts/get/aggregate", authMiddleware_1.authMiddleware, controllers_1.getAllPostsBygroup);
exports.default = router;
