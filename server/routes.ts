import type { Express } from "express";
import type { Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seedDatabase() {
  const existingUsers = await storage.getUserByUsername("client@example.com");
  if (!existingUsers) {
    const password = await hashPassword("password123");
    
    // Create Client
    const client = await storage.createUser({
      name: "Alice Client",
      email: "client@example.com",
      password: password,
    });

    // Create Freelancer
    const freelancer = await storage.createUser({
      name: "Bob Freelancer",
      email: "freelancer@example.com",
      password: password,
    });

    // Create Gigs
    const gig1 = await storage.createGig({
      title: "Build a React Website",
      description: "I need a portfolio website built with React and Tailwind.",
      budget: 500,
      ownerId: client.id,
    });

    const gig2 = await storage.createGig({
      title: "Logo Design for Startup",
      description: "Need a modern logo for my tech startup.",
      budget: 200,
      ownerId: client.id,
    });

    // Create Bid
    await storage.createBid({
      gigId: gig1.id,
      freelancerId: freelancer.id,
      price: 450,
      message: "I can build this for you in 3 days. Check my portfolio!",
    });
    
    console.log("Database seeded successfully!");
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth first
  setupAuth(app);

  // Seed Data
  seedDatabase().catch(err => console.error("Error seeding database:", err));

  // GIGS
  app.get(api.gigs.list.path, async (req, res) => {
    const search = req.query.search as string | undefined;
    const gigs = await storage.getGigs(search);
    res.json(gigs);
  });

  app.post(api.gigs.create.path, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const input = api.gigs.create.input.parse(req.body);
      const gig = await storage.createGig({
        ...input,
        ownerId: req.user!.id,
      });
      res.status(201).json(gig);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.gigs.get.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    
    const gig = await storage.getGig(id);
    if (!gig) {
      return res.status(404).json({ message: "Gig not found" });
    }
    res.json(gig);
  });

  // BIDS
  app.post(api.bids.create.path, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const input = api.bids.create.input.parse(req.body);
      const bid = await storage.createBid({
        ...input,
        freelancerId: req.user!.id,
      });
      res.status(201).json(bid);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.bids.listByGig.path, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const gigId = parseInt(req.params.gigId);
    if (isNaN(gigId)) return res.status(400).json({ message: "Invalid ID" });

    const gig = await storage.getGig(gigId);

    if (!gig) {
      return res.status(404).json({ message: "Gig not found" });
    }

    // Only owner can see bids
    if (gig.ownerId !== req.user!.id) {
      return res.status(403).json({ message: "Only the owner can view bids" });
    }

    const bids = await storage.getBidsByGig(gigId);
    res.json(bids);
  });

  app.patch(api.bids.hire.path, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const bidId = parseInt(req.params.bidId);
    if (isNaN(bidId)) return res.status(400).json({ message: "Invalid ID" });

    const bid = await storage.getBid(bidId);

    if (!bid) {
      return res.status(404).json({ message: "Bid not found" });
    }

    const gig = await storage.getGig(bid.gigId);
    if (!gig) {
      return res.status(404).json({ message: "Gig not found" });
    }

    // Only owner can hire
    if (gig.ownerId !== req.user!.id) {
      return res.status(403).json({ message: "Only the owner can hire" });
    }

    // Atomic update logic
    await storage.updateGigStatus(gig.id, "assigned");
    const updatedBid = await storage.updateBidStatus(bid.id, "hired");
    await storage.rejectOtherBids(gig.id, bid.id);

    res.json(updatedBid);
  });

  return httpServer;
}
