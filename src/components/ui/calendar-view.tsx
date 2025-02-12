import { useInterviewStore } from "@/store/store";
import { Calendar } from "@/components/ui/calendar";
import { format, isValid, parseISO } from "date-fns";
import { useState } from "react";

interface DayContentProps {
  date: Date;
  interviews: number;
}

function DayContent({ date, interviews }: DayContentProps) {
  return (
    <div className="relative">
      <time dateTime={format(date, "yyyy-MM-dd")}>{format(date, "d")}</time>
      {interviews > 0 && (
        <div className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
          {interviews}
        </div>
      )}
    </div>
  );
}

export function CalendarView() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { interviews } = useInterviewStore();

  const getInterviewsForDate = (date: Date) => {
    return interviews.filter((interview) => {
      const interviewDate = parseISO(interview.dateTime);
      return (
        isValid(interviewDate) &&
        format(interviewDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
      );
    }).length;
  };

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      className="rounded-md border"
      components={{
        DayContent: ({ date }) => (
          <DayContent date={date} interviews={getInterviewsForDate(date)} />
        ),
      }}
    />
  );
}
