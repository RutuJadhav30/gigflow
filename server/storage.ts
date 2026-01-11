import { 
  users, gigs, bids,
  type User, type InsertUser, 
  type Gig, type InsertGig, 
  type Bid, type InsertBid 
} from "@shared/schema";
import { db } from "./db";
import { eq, like, and, not } from "drizzle-orm";

export interface IStorage {
  // User Ops
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(email: string): Promise<User | undefined>; // using email as username
  createUser(user: InsertUser): Promise<User>;

  // Gig Ops
  getGigs(search?: string): Promise<(Gig & { owner: User })[]>;
  getGig(id: number): Promise<(Gig & { owner: User }) | undefined>;
  createGig(gig: InsertGig & { ownerId: number }): Promise<Gig>;
  updateGigStatus(id: number, status: string): Promise<Gig>;

  // Bid Ops
  createBid(bid: InsertBid & { freelancerId: number }): Promise<Bid>;
  getBidsByGig(gigId: number): Promise<(Bid & { freelancer: User })[]>;
  getBid(id: number): Promise<Bid | undefined>;
  updateBidStatus(id: number, status: string): Promise<Bid>;
  rejectOtherBids(gigId: number, acceptedBidId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User Ops
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Gig Ops
  async getGigs(search?: string): Promise<(Gig & { owner: User })[]> {
    let query = db.select({
      id: gigs.id,
      title: gigs.title,
      description: gigs.description,
      budget: gigs.budget,
      ownerId: gigs.ownerId,
      status: gigs.status,
      createdAt: gigs.createdAt,
      owner: users
    })
    .from(gigs)
    .innerJoin(users, eq(gigs.ownerId, users.id))
    .where(eq(gigs.status, "open"));

    if (search) {
      // @ts-ignore - simple search
      query.where(and(eq(gigs.status, "open"), like(gigs.title, `%${search}%`))); 
    }
    
    // Manual mapping because Drizzle join result structure needs to be flattened/organized
    const result = await query;
    return result.map(row => ({
      ...row, // properties from gig
      owner: row.owner
    }));
  }

  async getGig(id: number): Promise<(Gig & { owner: User }) | undefined> {
    const [result] = await db.select({
      id: gigs.id,
      title: gigs.title,
      description: gigs.description,
      budget: gigs.budget,
      ownerId: gigs.ownerId,
      status: gigs.status,
      createdAt: gigs.createdAt,
      owner: users
    })
    .from(gigs)
    .innerJoin(users, eq(gigs.ownerId, users.id))
    .where(eq(gigs.id, id));

    if (!result) return undefined;
    
    return {
      ...result,
      owner: result.owner
    };
  }

  async createGig(gig: InsertGig & { ownerId: number }): Promise<Gig> {
    const [newGig] = await db.insert(gigs).values(gig).returning();
    return newGig;
  }

  async updateGigStatus(id: number, status: string): Promise<Gig> {
    const [updatedGig] = await db.update(gigs)
      .set({ status })
      .where(eq(gigs.id, id))
      .returning();
    return updatedGig;
  }

  // Bid Ops
  async createBid(bid: InsertBid & { freelancerId: number }): Promise<Bid> {
    const [newBid] = await db.insert(bids).values(bid).returning();
    return newBid;
  }

  async getBidsByGig(gigId: number): Promise<(Bid & { freelancer: User })[]> {
    const result = await db.select({
      id: bids.id,
      gigId: bids.gigId,
      freelancerId: bids.freelancerId,
      price: bids.price,
      message: bids.message,
      status: bids.status,
      createdAt: bids.createdAt,
      freelancer: users
    })
    .from(bids)
    .innerJoin(users, eq(bids.freelancerId, users.id))
    .where(eq(bids.gigId, gigId));

    return result.map(row => ({
      ...row,
      freelancer: row.freelancer
    }));
  }

  async getBid(id: number): Promise<Bid | undefined> {
    const [bid] = await db.select().from(bids).where(eq(bids.id, id));
    return bid;
  }

  async updateBidStatus(id: number, status: string): Promise<Bid> {
    const [updatedBid] = await db.update(bids)
      .set({ status })
      .where(eq(bids.id, id))
      .returning();
    return updatedBid;
  }

  async rejectOtherBids(gigId: number, acceptedBidId: number): Promise<void> {
    await db.update(bids)
      .set({ status: 'rejected' })
      .where(and(
        eq(bids.gigId, gigId),
        not(eq(bids.id, acceptedBidId))
      ));
  }
}

export const storage = new DatabaseStorage();
