import { z } from "zod";

export const studentSchema = z.object({
  id: z.string().optional(),
  fullName: z.string().min(2, "Full Name must be at least 2 characters"),
  rollNo: z.string().min(1, "Roll Number is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  guardianName: z.string().min(2, "Guardian Name is required"),
  guardianPhone: z.string().min(6, "Valid guardian phone number is required"),
  address: z.string().optional(),
  batchId: z.string().min(1, "Please select a batch"),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]),
  photoUrl: z.string().optional(),
});

export type StudentFormValues = z.infer<typeof studentSchema>;
