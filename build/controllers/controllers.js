"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllPostsBygroup = exports.deletePost = exports.updatePost = exports.getPostById = exports.getAllPosts = exports.createPost = exports.deleteUsers = exports.getAllUsers = exports.loginUser = exports.registerUser = void 0;
// controllers.ts
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const bcrypt_1 = __importDefault(require("bcrypt"));
function registerUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { name, email, password } = req.body;
            const userExists = yield prisma.author.findUnique({
                where: {
                    email,
                },
            });
            if (userExists) {
                throw new Error("User already exists!");
            }
            if (!name || !email || !password) {
                throw new Error("Name, email, and password are required.");
            }
            // Additional validation logic for email format, password strength, etc.
            // Hash password
            const hashedPassword = yield bcrypt_1.default.hash(password.toString(), 10); // Use bcrypt to hash password
            // Additional validation logic for email format, password strength, etc.
            const user = yield prisma.author.create({
                data: {
                    name,
                    email,
                    password: hashedPassword, // Save hashed password to database
                },
            });
            // Generate JWT token
            const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, {
                expiresIn: "1d",
            });
            // Set token as cookie
            res.cookie("prismaAuthToken", token, { httpOnly: true });
            res.status(201).send({ message: "User registered successfully.", user });
        }
        catch (e) {
            const error = e;
            res.status(400).send({ error, message: error.message });
        }
    });
}
exports.registerUser = registerUser;
function loginUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { email, password } = req.body;
            // Perform login logic
            const user = yield prisma.author.findUnique({
                where: {
                    email,
                },
            });
            if (!user || !(yield bcrypt_1.default.compare(password.toString(), user.password))) {
                // Compare hashed password
                throw new Error("Invalid email or password.");
            }
            // Generate JWT token
            const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, {
                expiresIn: "1d",
            });
            // Set token as cookie
            res.cookie("prismaAuthToken", token, { httpOnly: true });
            res.status(200).send({ message: "Login successful.", user });
        }
        catch (e) {
            const error = e;
            res.status(400).send({ error, message: error.message });
        }
    });
}
exports.loginUser = loginUser;
//users
function getAllUsers(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const authorId = req.userId;
            if (!authorId) {
                throw new Error("You are not authenticated.");
            }
            const users = yield prisma.author.findMany({});
            const usersCount = (yield prisma.author.findMany({})).length;
            res.status(200).json({ users, usersCount });
        }
        catch (e) {
            const error = e;
            res.status(400).send({ error, message: error.message });
        }
    });
}
exports.getAllUsers = getAllUsers;
//delete all users
function deleteUsers(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const deletedPosts = prisma.post.deleteMany();
            const deletedUsers = prisma.author.deleteMany();
            yield prisma.$transaction([deletedPosts, deletedUsers]);
            res
                .status(200)
                .send({ message: "Users deleted successfully.", deletedUsers, deletedPosts });
        }
        catch (e) {
            const error = e;
            res.status(400).send({ error, message: error.message });
        }
    });
}
exports.deleteUsers = deleteUsers;
function createPost(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const authorId = req.userId;
            const { title, content } = req.body;
            if (!title || !content || !authorId) {
                throw new Error("Title, content, and authorId are required.");
            }
            // Additional validation logic for title length, content format, etc.
            const post = yield prisma.post.create({
                data: {
                    title: title.trim(),
                    content,
                    authorId,
                },
                include: {
                    author: true,
                },
            });
            res.status(201).send({ message: "Post created successfully.", post });
        }
        catch (e) {
            const error = e;
            res.status(400).send({ error, message: error.message });
        }
    });
}
exports.createPost = createPost;
function getAllPosts(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const posts = yield prisma.post.findMany();
            res.status(200).json(posts);
        }
        catch (e) {
            const error = e;
            res.status(400).send({ error, message: error.message });
        }
    });
}
exports.getAllPosts = getAllPosts;
function getPostById(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const postId = req.params.id;
            const post = yield prisma.post.findUnique({
                where: {
                    id: postId,
                },
            });
            res.status(200).json(post);
        }
        catch (e) {
            const error = e;
            res.status(400).send({ error, message: error.message });
        }
    });
}
exports.getPostById = getPostById;
function updatePost(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const postId = req.params.id;
            const { title, content } = req.body;
            const updatedPost = yield prisma.post.update({
                where: {
                    id: postId,
                },
                data: {
                    title,
                    content,
                },
            });
            res.status(201).send({ message: "Post updated successfully.", updatedPost });
        }
        catch (e) {
            const error = e;
            res.status(400).send({ error, message: error.message });
        }
    });
}
exports.updatePost = updatePost;
function deletePost(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const postId = req.params.id;
            const deletedPost = yield prisma.post.delete({
                where: {
                    id: postId,
                },
            });
            res.status(200).send({ message: "Post deleted successfully.", deletedPost });
        }
        catch (e) {
            const error = e;
            res.status(400).send({ error, message: error.message });
        }
    });
}
exports.deletePost = deletePost;
//group by
function getAllPostsBygroup(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // const posts = await prisma.post.aggregateRaw({
            //   pipeline: [
            //     {
            //       $lookup: {
            //         from: "Author",
            //         localField: "authorId",
            //         foreignField: "_id",
            //         as: "authorDetails",
            //       },
            //     },
            //     // { $match: { authorId: { $eq: req.userId } } },
            //     { $unwind: "$authorDetails" }, // Flatten the authorDetails array
            //     {
            //       $facet: {
            //         count: [{ $count: "totalPosts" }],
            //         posts: [
            //           {
            //             $group: {
            //               _id: "$authorDetails.email",
            //               count: { $sum: 1 },
            //               posts: {
            //                 $push: "$$ROOT",
            //               },
            //             },
            //           }, // Group by email and push all original documents into an array
            //           { $unwind: "$posts" }, // Unwind the posts array
            //           {
            //             $replaceRoot: {
            //               // Replace the root with the original document
            //               newRoot: {
            //                 postId: "$posts.id",
            //                 authorDetails: "$posts.authorDetails",
            //                 title: "$posts.title",
            //                 content: "$posts.content",
            //                 createdAt: "$posts.createdAt",
            //                 email: "$_id",
            //               },
            //             },
            //           },
            //           // { $count: "totalPosts" }, // Count the total number of posts
            //           { $skip: 0 },
            //           { $limit: 2 },
            //         ],
            //       },
            //     },
            //   ],
            // });
            let posts = yield prisma.post.groupBy({
                by: ["authorId"],
                _count: true,
            });
            const postPromises = posts.map((d) => __awaiter(this, void 0, void 0, function* () {
                const author = yield prisma.author.findUnique({ where: { id: d.authorId } });
                return Object.assign(Object.assign({}, d), { author });
            }));
            // Wait for all promises to resolve
            const resolvedPosts = yield Promise.all(postPromises);
            res.status(200).json({ post: resolvedPosts });
        }
        catch (e) {
            const error = e;
            res.status(400).send({ error, message: error.message });
        }
    });
}
exports.getAllPostsBygroup = getAllPostsBygroup;
