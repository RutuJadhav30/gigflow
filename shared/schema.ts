import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  // For simplicity and "average student" work, we won't strictly enforce roles in DB 
  // since the prompt says "Roles are fluid". 
  createdAt: timestamp("created_at").defaultNow(),
});

export const gigs = pgTable("gigs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  budget: integer("budget").notNull(), // Assuming whole numbers for simplicity
  ownerId: integer("owner_id").notNull(), // References users.id
  status: text("status").notNull().default("open"), // 'open' or 'assigned'
  createdAt: timestamp("created_at").defaultNow(),
});

export const bids = pgTable("bids", {
  id: serial("id").primaryKey(),
  gigId: integer("gig_id").notNull(), // References gigs.id
  freelancerId: integer("freelancer_id").notNull(), // References users.id
  price: integer("price").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("pending"), // 'pending', 'hired', 'rejected'
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===

export const usersRelations = relations(users, ({ many }) => ({
  gigs: many(gigs, { relationName: "ownerGigs" }),
  bids: many(bids, { relationName: "freelancerBids" }),
}));

export const gigsRelations = relations(gigs, ({ one, many }) => ({
  owner: one(users, {
    fields: [gigs.ownerId],
    references: [users.id],
    relationName: "ownerGigs",
  }),
  bids: many(bids),
}));

export const bidsRelations = relations(bids, ({ one }) => ({
  gig: one(gigs, {
    fields: [bids.gigId],
    references: [gigs.id],
  }),
  freelancer: one(users, {
    fields: [bids.freelancerId],
    references: [users.id],
    relationName: "freelancerBids",
  }),
}));

// === BASE SCHEMAS ===

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertGigSchema = createInsertSchema(gigs).omit({ id: true, createdAt: true, status: true });
export const insertBidSchema = createInsertSchema(bids).omit({ id: true, createdAt: true, status: true });

// === EXPLICIT API CONTRACT TYPES ===

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Gig = typeof gigs.$inferSelect;
export type InsertGig = z.infer<typeof insertGigSchema>;

export type Bid = typeof bids.$inferSelect;
export type InsertBid = z.infer<typeof insertBidSchema>;

// Request types
export type LoginRequest = { email: string; password: string }; // Custom login shape
export type CreateGigRequest = InsertGig;
export type CreateBidRequest = InsertBid;

// Response types
export type AuthResponse = User;
export type GigResponse = Gig & { owner?: User; bidCount?: number }; // Enriched gig
export type BidResponse = Bid & { freelancer?: User }; // Enriched bid

// Query Params
export interface GigQueryParams {
  search?: string;
}
