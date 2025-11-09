import { z } from 'zod'

export const chairmanLoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const memberLoginSchema = z.object({
  membershipId: z.string().min(1, 'Membership ID is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const memberRegisterSchema = z.object({
  membershipId: z.string().min(1, 'Membership ID is required'),
  name: z.string().min(1, 'Name is required'),
  fatherName: z.string().min(1, "Father's name is required"),
  mobile: z.string().regex(/^01[3-9]\d{8}$/, 'Invalid mobile number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const createMemberSchema = z.object({
  membershipId: z.string().min(1, 'Membership ID is required'),
  name: z.string().min(1, 'Name is required'),
  fatherName: z.string().min(1, "Father's name is required"),
  mobile: z.string().min(1, 'Mobile is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  shareType: z.enum(['fullShare', 'newMember']),
})

export const updateMemberSchema = z.object({
  name: z.string().min(1).optional(),
  fatherName: z.string().min(1).optional(),
  mobile: z.string().min(1).optional(),
  password: z.string().min(6).optional(),
})

export const createPaymentSchema = z.object({
  membershipId: z.string().min(1, 'Membership ID is required'),
  amount: z.number().min(0, 'Amount must be positive'),
  date: z.string(),
  paymentFrom: z.enum(['bKash', 'Nagad', 'Bank']),
  transactionNumber: z.string().optional(),
})

export const updatePaymentSchema = z.object({
  amount: z.number().min(0).optional(),
  date: z.string().optional(),
  paymentFrom: z.enum(['bKash', 'Nagad', 'Bank']).optional(),
  transactionNumber: z.string().optional(),
})

export const createInvestmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  amount: z.number().min(0, 'Amount must be positive'),
  date: z.string(),
  purpose: z.string().min(1, 'Purpose is required'),
})

export const updateInvestmentSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  amount: z.number().min(0).optional(),
  date: z.string().optional(),
  purpose: z.string().min(1).optional(),
})

export const forgotPasswordSchema = z.object({
  username: z.string().min(1, 'Username is required'),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})
