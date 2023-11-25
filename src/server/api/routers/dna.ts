/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import type { Data } from "~/types";

export const dnaRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  shortData: publicProcedure.query(async ({ ctx }) => {
    const links = await ctx.db.link.findMany({
      select: {
        sourceId: true,
        targetId: true,
      },
    });

    const nodes = await ctx.db.node.findMany();
    return {
      nodes,
      links: links.map(({ sourceId, targetId }) => ({
        source: sourceId,
        target: targetId,
      })),
    } as Data;
  }),

  byName: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(
      async ({ ctx, input }) =>
        await ctx.db.dnaMatch.findMany({ where: { name: input.name } }),
    ),
  bySurname: publicProcedure
    .input(z.object({ surname: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.dnaMatch.findMany({
        where: { allAncestralSurnames: { contains: input.surname } },
      });
    }),
});
