// import type { NextApiRequest, NextApiResponse } from 'next'
// import bcrypt from 'bcrypt'
// import { prisma } from '@/lib/prisma'
// import { generateToken } from '@/lib/jwt'
// import { setAuthCookie } from '@/lib/auth'
// import { chairmanLoginSchema } from '@/lib/validation'
// import { rateLimit } from '@/lib/rate-limiter'

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' })
//   }

//   if (!rateLimit(req, res)) {
//     return
//   }

//   try {
//     const validation = chairmanLoginSchema.safeParse(req.body)
//     if (!validation.success) {
//       return res.status(400).json({ error: validation.error.errors[0].message })
//     }

//     const { username, password } = validation.data

//     const user = await prisma.user.findFirst({
//       where: {
//         membershipId: username,
//         role: 'chairman',
//         isDeleted: false,
//       },
//     })

//     if (!user) {
//       return res.status(401).json({ error: 'Invalid credentials' })
//     }

//     const isValidPassword = await bcrypt.compare(password, user.passwordHash)
//     if (!isValidPassword) {
//       return res.status(401).json({ error: 'Invalid credentials' })
//     }

//     const token = generateToken({
//       userId: user.id,
//       membershipId: user.membershipId,
//       role: user.role,
//     })

//     setAuthCookie(res, token)

//     return res.status(200).json({
//       user: {
//         id: user.id,
//         name: user.name,
//         membershipId: user.membershipId,
//         role: user.role,
//       },
//     })
//   } catch (error) {
//     console.error('Chairman login error:', error)
//     return res.status(500).json({ error: 'Internal server error' })
//   }
// }

import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/jwt";
import { setAuthCookie } from "@/lib/auth";
import { chairmanLoginSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limiter";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!rateLimit(req, res)) return;

  try {
    // Validate input
    const validation = chairmanLoginSchema.safeParse(req.body);
    if (!validation.success) {
      return res
        .status(400)
        .json({ error: validation.error.errors[0].message });
    }

    const { username, password } = validation.data;

    // Read chairman credentials from .env
    const chairmanUsername = process.env.CHAIRMAN_USERNAME;
    const chairmanPassword = process.env.CHAIRMAN_PASSWORD;

    // Normalize input for case-insensitive match
    const normalizedUsername = username.trim().toLowerCase();

    if (
      normalizedUsername !== chairmanUsername?.toLowerCase() ||
      password !== chairmanPassword
    ) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Fetch the chairman user from the database to get the actual user ID
    const chairmanUser = await prisma.user.findFirst({
      where: {
        role: "chairman",
        isDeleted: false,
      },
    });

    if (!chairmanUser) {
      return res.status(500).json({ error: "Chairman account not found in database" });
    }

    // Generate JWT token with the actual database user ID
    const token = generateToken({
      userId: chairmanUser.id,
      membershipId: chairmanUser.membershipId,
      role: "chairman",
    });

    // Set auth cookie
    setAuthCookie(res, token);

    return res.status(200).json({
      user: {
        id: chairmanUser.id,
        name: chairmanUser.name,
        membershipId: chairmanUser.membershipId,
        role: "chairman",
      },
    });
  } catch (error) {
    console.error("Chairman login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
