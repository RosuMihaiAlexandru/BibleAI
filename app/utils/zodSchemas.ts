import { conformZodMessage } from "@conform-to/zod";
import { z } from "zod";

// Custom validation to check if a string is valid JSON
const jsonStringValidator = z.string().refine((data) => {
  try {
    JSON.parse(data);
    return true;
  } catch (e) {
    return false;
  }
}, {
  message: "Invalid JSON format"
});


export const JournalSchema = z.object({
  title: z.string().min(1).max(100),
  body: z.string().min(1),
});

