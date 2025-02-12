import { useInterviewStore } from "@/store/store";
import { CalendarEvent } from "@/types/types";
import {
  Calendar,
  dateFnsLocalizer,
  Views,
  EventProps,
} from "react-big-calendar";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import {
  format,
  getDay,
  parse,
  setMinutes,
  parseISO,
  setHours,
  startOfWeek,
  isToday,
} from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { sendInterviewEmail } from "@/helpers/email";
import { Loader2 } from "lucide-react";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const DnDCalendar = withDragAndDrop(Calendar);

export function CalendarView() {
  const { interviews, updateInterview } = useInterviewStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  const [droppedDate, setDroppedDate] = useState<Date | null>(null);
  const [showTimeDialog, setShowTimeDialog] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const [loading, setLoading] = useState(false);

  const events: CalendarEvent[] = interviews.map((interview) => {
    const start = parseISO(interview.dateTime);
    const end = setHours(start, start.getHours() + 1);
    return {
      ...interview,
      title: `${interview.type}: ${interview.candidateName} with ${interview.interviewerName}`,
      start,
      end,
    };
  });

  const eventPropGetter = () => {
    return {
      style: {
        fontSize: "14px",
        cursor: "grab",
        padding: "2px",
        borderRadius: "4px",
        backgroundColor: "#3182ce",
        borderColor: "#2c5282",
        color: "#fff",
      },
    };
  };

  const EventComponent = ({ event }: EventProps<CalendarEvent>) => {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>{event.title}</div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{event.title}</p>
            <p>
              {format(event.start, "h:mm a")} - {format(event.end, "h:mm a")}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    navigate(`/edit/${event.id}`);
  };

  const checkOverlap = (event: CalendarEvent, newStart: Date) => {
    return interviews.some((interview) => {
      if (interview.id === event.id) return false;
      if (interview.interviewerName !== event.interviewerName) return false;

      const existingStart = parseISO(interview.dateTime);
      const existingEnd = setHours(existingStart, existingStart.getHours() + 1);
      const newEnd = setHours(newStart, newStart.getHours() + 1);

      return (
        (newStart >= existingStart && newStart < existingEnd) ||
        (newEnd > existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd)
      );
    });
  };

  const getAvailableTimeSlots = (date: Date, interviewerName: string) => {
    const now = new Date();
    const isSelectedDateToday = isToday(date);
    const currentHour = now.getHours();

    const slots = Array.from({ length: 13 }, (_, i) => {
      const hour = i + 9;
      return format(setHours(setMinutes(new Date(date), 0), hour), "HH:mm");
    });

    return slots.filter((slot) => {
      const [hours] = slot.split(":").map(Number);

      if (isSelectedDateToday && hours <= currentHour) {
        return false;
      }

      const slotDate = new Date(date);
      slotDate.setHours(hours, 0, 0, 0);

      return !interviews.some((interview) => {
        if (interview.id === draggedEvent?.id) return false;
        if (interview.interviewerName !== interviewerName) return false;

        const interviewDate = parseISO(interview.dateTime);
        const interviewEnd = setHours(
          interviewDate,
          interviewDate.getHours() + 1
        );

        return (
          (slotDate >= interviewDate && slotDate < interviewEnd) ||
          (setHours(slotDate, hours + 1) > interviewDate &&
            setHours(slotDate, hours + 1) <= interviewEnd)
        );
      });
    });
  };

  const handleEventDrop = ({
    event,
    start,
  }: {
    event: CalendarEvent;
    start: Date;
  }) => {
    if (!event) return;

    const now = new Date();
    if (start < now) {
      toast({
        title: "Invalid Time",
        description: "Cannot schedule interviews in the past.",
        variant: "destructive",
      });
      return;
    }

    setDraggedEvent(event);
    setDroppedDate(start);

    const availableSlots = getAvailableTimeSlots(start, event.interviewerName);

    if (availableSlots.length === 0) {
      toast({
        title: "No Available Time Slots",
        description: isToday(start)
          ? "No time slots available for today. Please select another date."
          : "No time slots available for the selected date.",
        variant: "destructive",
      });
      return;
    }

    setSelectedTime(availableSlots[0]);
    setShowTimeDialog(true);
  };

  const handleTimeSelect = async () => {
    setLoading(true);
    if (!draggedEvent || !selectedTime || !droppedDate) return;

    const [hours, minutes] = selectedTime.split(":").map(Number);

    const newStart = new Date(droppedDate);
    newStart.setHours(hours, minutes, 0, 0);

    const hasOverlap = checkOverlap(draggedEvent, newStart);
    if (hasOverlap) {
      toast({
        title: "Time Slot Unavailable",
        description:
          "The interviewer already has an interview scheduled at this time.",
        variant: "destructive",
      });
      setShowTimeDialog(false);
      setDraggedEvent(null);
      setDroppedDate(null);
      return;
    }

    updateInterview(draggedEvent.id, {
      ...draggedEvent,
      dateTime: newStart.toISOString(),
    });

    const formattedDate = format(newStart, "MMMM d, yyyy");
    const formattedTime = format(newStart, "h:mm a");

    try {
      const emailParams = {
        to_email: draggedEvent.candidateEmail,
        to_name: draggedEvent.candidateName,
        interviewer_name: draggedEvent.interviewerName,
        interview_type: draggedEvent.type,
        interview_date: format(newStart, "MMMM d, yyyy"),
        interview_time: format(newStart, "h:mm a"),
        action: "Updated" as const,
      };

      await sendInterviewEmail(emailParams);

      toast({
        title: "Interview Updated",
        description: `The interview has been successfully updated on ${formattedDate} at ${formattedTime}, and an email notification has been sent to ${draggedEvent.candidateName}.`,
      });
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

    setShowTimeDialog(false);
    setDraggedEvent(null);
    setDroppedDate(null);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-[700px]">
        <DnDCalendar
          localizer={localizer}
          events={events}
          startAccessor={(event) => (event as CalendarEvent).start}
          endAccessor={(event) => (event as CalendarEvent).end}
          defaultView={Views.WEEK}
          views={["month", "week", "day"]}
          step={60}
          timeslots={1}
          min={new Date(0, 0, 0, 9, 0, 0)}
          max={new Date(0, 0, 0, 21, 0, 0)}
          onSelectEvent={(event: object) => handleSelectEvent(event as CalendarEvent)}
          onEventDrop={(args) =>
            handleEventDrop({
              event: args.event as CalendarEvent,
              start: new Date(args.start),
            })
          }
          draggableAccessor={() => true}
          eventPropGetter={() => eventPropGetter()}
          components={{
            event: EventComponent as React.ComponentType<EventProps<object>>,
          }}
          className="rounded-md border bg-background"
        />
      </div>

      <Dialog open={showTimeDialog} onOpenChange={setShowTimeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select New Time</DialogTitle>
            <DialogDescription>
              Choose an available time slot for the rescheduled interview.
              {droppedDate && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Date: {format(droppedDate, "MMMM d, yyyy")}
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {draggedEvent &&
                  droppedDate &&
                  getAvailableTimeSlots(
                    droppedDate,
                    draggedEvent.interviewerName
                  ).map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {format(parseISO(`2000-01-01T${slot}`), "h:mm a")}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowTimeDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleTimeSelect} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Confirming
                  </>
                ) : (
                  "Confirm Interview"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DndProvider>
  );
}
