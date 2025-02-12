import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useInterviewStore } from "@/store/store";
import { Interview, InterviewType } from "@/types/types";
import { interviewFormSchema } from "@/schemas/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  format,
  parseISO,
  setHours,
  setMinutes,
  startOfToday,
  isToday,
  isBefore,
} from "date-fns";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  BriefcaseBusiness,
  CalendarDays,
  CalendarIcon,
  Clock,
  Loader2,
  Mail,
  NotebookPen,
  User,
  UserCog,
} from "lucide-react";
import * as z from "zod";
import { sendInterviewEmail } from "@/helpers/email";
import { useState } from "react";
import { Textarea } from "./ui/textarea";

const interviewTypes: InterviewType[] = ["Technical", "HR", "Behavioural"];

interface InterviewFormProps {
  interview?: Interview;
}

export function InterviewForm({ interview }: InterviewFormProps) {
  const { addInterview, updateInterview, interviews, interviewers } =
    useInterviewStore();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof interviewFormSchema>>({
    resolver: zodResolver(interviewFormSchema),
    defaultValues: interview
      ? {
          candidateName: interview.candidateName,
          candidateEmail: interview.candidateEmail,
          interviewerName: interview.interviewerName,
          date: parseISO(interview.dateTime),
          time: format(parseISO(interview.dateTime), "HH:mm"),
          type: interview.type,
          notes: interview.notes,
        }
      : {
          candidateName: "",
          candidateEmail: "",
          interviewerName: "",
          date: undefined,
          time: "",
          type: undefined,
          notes: "",
        },
  });

  const checkOverlap = (
    date: Date,
    time: string,
    interviewerId: string,
    excludeId?: string
  ) => {
    const newInterviewStart = setHours(date, parseInt(time.split(":")[0]));
    const newInterviewEnd = setHours(
      newInterviewStart,
      newInterviewStart.getHours() + 1
    );

    return interviews.some((existingInterview) => {
      if (excludeId && existingInterview.id === excludeId) return false;
      if (existingInterview.interviewerName !== interviewerId) return false;

      const existingStart = parseISO(existingInterview.dateTime);
      const existingEnd = setHours(existingStart, existingStart.getHours() + 1);

      return (
        (newInterviewStart >= existingStart &&
          newInterviewStart < existingEnd) ||
        (newInterviewEnd > existingStart && newInterviewEnd <= existingEnd) ||
        (newInterviewStart <= existingStart && newInterviewEnd >= existingEnd)
      );
    });
  };

  const getAvailableTimeSlots = (date: Date, interviewerName: string) => {
    const now = new Date();
    const isSelectedDateToday = isToday(date);
    const currentHour = now.getHours();

    const slots = Array.from({ length: 13 }, (_, i) => {
      const hour = i + 9; // 9 AM to 9 PM
      return format(setHours(setMinutes(new Date(), 0), hour), "HH:mm");
    });

    const availableSlots = slots.filter((slot) => {
      const [hours] = slot.split(":").map(Number);

      if (isSelectedDateToday && hours <= currentHour) {
        return false;
      }

      // Check for overlapping interviews
      return !checkOverlap(date, slot, interviewerName, interview?.id);
    });

    if (isSelectedDateToday && availableSlots.length === 0) {
      toast({
        title: "No Available Time Slots",
        description:
          "No time slots available for today. Please select another date.",
        variant: "destructive",
      });
    }

    return availableSlots;
  };

  const onSubmit = async (values: z.infer<typeof interviewFormSchema>) => {
    setLoading(true);
    const dateTime = new Date(values.date);
    const [hours, minutes] = values.time.split(":").map(Number);
    dateTime.setHours(hours, minutes, 0, 0);

    const formattedDate = format(dateTime, "MMMM d, yyyy");
    const formattedTime = format(dateTime, "h:mm a");

    const hasOverlap = checkOverlap(
      values.date,
      values.time,
      values.interviewerName,
      interview?.id
    );

    if (hasOverlap) {
      toast({
        title: "Time Slot Unavailable",
        description:
          "The interviewer already has an interview scheduled at this time.",
        variant: "destructive",
      });
      return;
    }

    try {
      const emailParams = {
        to_email: values.candidateEmail,
        to_name: values.candidateName,
        interviewer_name: values.interviewerName,
        interview_type: values.type,
        interview_date: formattedDate,
        interview_time: formattedTime,
        action: interview ? ("Updated" as const) : ("Scheduled" as const),
      };

      if (interview) {
        updateInterview(interview.id, {
          ...interview,
          ...values,
          dateTime: dateTime.toISOString(),
        });

        await sendInterviewEmail(emailParams);

        toast({
          title: "Interview Updated",
          description: `The interview has been successfully updated on ${formattedDate} at ${formattedTime}, and an email notification has been sent to ${values.candidateName}.`,
        });
      } else {
        addInterview({
          id: crypto.randomUUID(),
          ...values,
          dateTime: dateTime.toISOString(),
        });

        await sendInterviewEmail(emailParams);

        toast({
          title: "Interview Scheduled",
          description: `The interview has been successfully scheduled on ${formattedDate} at ${formattedTime}, and an email notification has been sent to ${values.candidateName}.`,
        });
      }
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 grid mt-5"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-28">
          <FormField
            control={form.control}
            name="candidateName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className=" flex flex-row items-center gap-2">
                  <User /> Candidate Name
                </FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="candidateEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel className=" flex flex-row items-center gap-2">
                  <Mail />
                  Candidate Email
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="john.doe@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-28">
          <FormField
            control={form.control}
            name="interviewerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className=" flex flex-row items-center gap-2">
                  <UserCog />
                  Interviewer
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select interviewer" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {interviewers.map((interviewer) => (
                      <SelectItem key={interviewer.id} value={interviewer.name}>
                        {interviewer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className=" flex flex-row items-center gap-2">
                  <BriefcaseBusiness />
                  Interview Type
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select interview type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {interviewTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-28">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className=" flex flex-row items-center gap-2">
                  <CalendarDays />
                  Date
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => isBefore(date, startOfToday())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel className=" flex flex-row items-center gap-2">
                  <Clock />
                  Time Slot
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time slot" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {form.watch("date") && form.watch("interviewerName")
                      ? getAvailableTimeSlots(
                          form.watch("date"),
                          form.watch("interviewerName")
                        ).map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {format(parseISO(`2000-01-01T${slot}`), "h:mm a")}
                          </SelectItem>
                        ))
                      : []}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className=" flex flex-row items-center gap-2">
                <NotebookPen />
                Notes
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Additional notes..."
                  {...field}
                  rows={4}
                  className="resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading}>
          {interview ? (
            loading ? (
              <>
                <Loader2 className=" w-5 h-5 mr-2 animate-spin" /> Updating
              </>
            ) : (
              "Update Interview"
            )
          ) : loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Scheduling
            </>
          ) : (
            "Schedule Interview"
          )}
        </Button>
      </form>
    </Form>
  );
}
