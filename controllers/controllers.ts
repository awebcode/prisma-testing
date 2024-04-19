// controllers.ts
import { PrismaClient, Prisma } from "@prisma/client";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
const prisma = new PrismaClient();
import bcrypt from "bcrypt";
import mongoose from "mongoose";
export async function registerUser(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password } = req.body;
    const userExists = await prisma.author.findUnique({
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
    const hashedPassword = await bcrypt.hash(password.toString(), 10); // Use bcrypt to hash password
    // Additional validation logic for email format, password strength, etc.
    const user = await prisma.author.create({
      data: {
        name,
        email,
        password: hashedPassword, // Save hashed password to database
      },
    });
    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "1d",
    });
    // Set token as cookie
    res.cookie("prismaAuthToken", token, { httpOnly: true });
    res.status(201).send({ message: "User registered successfully.", user });
  } catch (e) {
    const error = e as Error;
    res.status(400).send({ error, message: error.message });
  }
}

export async function loginUser(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    // Perform login logic
    const user = await prisma.author.findUnique({
      where: {
        email,
      },
    });
    if (!user || !(await bcrypt.compare(password.toString(), user.password))) {
      // Compare hashed password
      throw new Error("Invalid email or password.");
    }
    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "1d",
    });
    // Set token as cookie
    res.cookie("prismaAuthToken", token, { httpOnly: true });
    res.status(200).send({ message: "Login successful.", user });
  } catch (e) {
    const error = e as Error;

    res.status(400).send({ error, message: error.message });
  }
}
//users

export async function getAllUsers(req: Request, res: Response): Promise<void> {
  try {
    const authorId = req.userId;
    if (!authorId) {
      throw new Error("You are not authenticated.");
    }
    const users = await prisma.author.findMany({});

    const usersCount = (await prisma.author.findMany({})).length;
    res.status(200).json({ users, usersCount });
  } catch (e) {
    const error = e as Error;
    res.status(400).send({ error, message: error.message });
  }
}
//delete all users

export async function deleteUsers(req: Request, res: Response): Promise<void> {
  try {
    const deletedPosts = prisma.post.deleteMany();
    const deletedUsers = prisma.author.deleteMany();
    await prisma.$transaction([deletedPosts, deletedUsers]);
    res
      .status(200)
      .send({ message: "Users deleted successfully.", deletedUsers, deletedPosts });
  } catch (e) {
    const error = e as Error;
    res.status(400).send({ error, message: error.message });
  }
}
export async function createPost(req: Request, res: Response): Promise<void> {
  try {
    const authorId = req.userId;
    const { title, content } = req.body;
    if (!title || !content || !authorId) {
      throw new Error("Title, content, and authorId are required.");
    }

    // Additional validation logic for title length, content format, etc.
    const post = await prisma.post.create({
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
  } catch (e) {
    const error = e as Error;
    res.status(400).send({ error, message: error.message });
  }
}

export async function getAllPosts(req: Request, res: Response): Promise<void> {
  try {
    const posts = await prisma.post.findMany();
    res.status(200).json(posts);
  } catch (e) {
    const error = e as Error;
    res.status(400).send({ error, message: error.message });
  }
}

export async function getPostById(req: Request, res: Response): Promise<void> {
  try {
    const postId = req.params.id;
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });
    res.status(200).json(post);
  } catch (e) {
    const error = e as Error;
    res.status(400).send({ error, message: error.message });
  }
}

export async function updatePost(req: Request, res: Response): Promise<void> {
  try {
    const postId = req.params.id;
    const { title, content } = req.body;
    const updatedPost = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        title,
        content,
      },
    });
    res.status(201).send({ message: "Post updated successfully.", updatedPost });
  } catch (e) {
    const error = e as Error;
    res.status(400).send({ error, message: error.message });
  }
}

export async function deletePost(req: Request, res: Response): Promise<void> {
  try {
    const postId = req.params.id;
    const deletedPost = await prisma.post.delete({
      where: {
        id: postId,
      },
    });
    res.status(200).send({ message: "Post deleted successfully.", deletedPost });
  } catch (e) {
    const error = e as Error;
    res.status(400).send({ error, message: error.message });
  }
}
//group by

export async function getAllPostsBygroup(req: Request, res: Response): Promise<void> {
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
    let posts = await prisma.post.groupBy({
      by: ["authorId"],
      _count: true,
    });
   

    const postPromises = posts.map(async (d) => {
      const author = await prisma.author.findUnique({ where: { id: d.authorId } });
      return { ...d, author };
    });
    // Wait for all promises to resolve
    const resolvedPosts = await Promise.all(postPromises);

    res.status(200).json({ post: resolvedPosts });
  } catch (e) {
    const error = e as Error;
    res.status(400).send({ error, message: error.message });
  }
}
