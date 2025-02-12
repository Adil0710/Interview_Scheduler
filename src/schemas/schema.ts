import * as z from 'zod';
import { isBefore, startOfToday } from 'date-fns';

export const interviewFormSchema = z.object({
  candidateName: z.string().min(2, 'Candidate name must be at least 2 characters'),
  candidateEmail: z.string().email('Please enter a valid email address'),
  interviewerName: z.string().min(2, 'Please select an interviewer'),
  date: z.date()
    .refine((date) => !isBefore(date, startOfToday()), {
      message: "Cannot schedule interviews in the past"
    }),
  time: z.string()
    .refine((time) => {
      const [hours] = time.split(':').map(Number);
      return hours >= 9 && hours <= 21;
    }, {
      message: "Interview must be scheduled between 9 AM and 9 PM"
    }),
  type: z.enum(['Technical', 'HR', 'Behavioural'], {
    required_error: "Please select an interview type"
  }),
  notes: z.string().optional(),
});