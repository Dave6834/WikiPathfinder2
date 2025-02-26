import { pgTable, text, serial, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const searches = pgTable("searches", {
  id: serial("id").primaryKey(),
  startWord: text("start_word").notNull(),
  endWord: text("end_word").notNull(),
  path: jsonb("path").notNull().$type<string[]>(),
  story: text("story").notNull(),
  searchedAt: timestamp("searched_at").defaultNow()
});

export const insertSearchSchema = createInsertSchema(searches).omit({
  id: true,
  searchedAt: true
});

export type InsertSearch = z.infer<typeof insertSearchSchema>;
export type Search = typeof searches.$inferSelect;
