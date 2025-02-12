import { Interview } from "@/types/types";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Trash2,
  CalendarIcon,
  Mail,
  Loader2,
  User,
  UserCog,
  BriefcaseBusiness,
  CalendarClock,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useInterviewStore } from "@/store/store";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { sendInterviewEmail } from "@/helpers/email";
import { Badge } from "./ui/badge";

export function InterviewTable({ data }: { data: Interview[] }) {
  const navigate = useNavigate();
  const { deleteInterview } = useInterviewStore();
  const { toast } = useToast();
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const columns: ColumnDef<Interview>[] = [
    {
      accessorKey: "candidateName",
      header: () => (
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>Candidate</span>
        </div>
      ),
      filterFn: "includesString",
    },
    {
      accessorKey: "candidateEmail",
      header: () => (
        <div className="flex items-center space-x-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span>Email</span>
        </div>
      ),
      cell: ({ row }) => <span>{row.original.candidateEmail}</span>,
      filterFn: "includesString",
    },
    {
      accessorKey: "interviewerName",
      header: () => (
        <div className="flex items-center space-x-2">
          <UserCog className="h-4 w-4 text-muted-foreground" />
          <span>Interviewer</span>
        </div>
      ),
      filterFn: "includesString",
    },
    {
      accessorKey: "type",
      header: () => (
        <div className="flex items-center space-x-2">
          <BriefcaseBusiness className="h-4 w-4 text-muted-foreground" />
          <span>Type</span>
        </div>
      ),
      filterFn: "equals",
      cell: ({ row }) => (
        <Badge
          className={cn(
            row.original.type === "Behavioural" &&
              " bg-green-500/10 text-green-500 border-green-500",
            row.original.type === "HR" &&
              " bg-blue-500/10 text-blue-500 border-blue-500",
            row.original.type === "Technical" &&
              " bg-purple-500/10 text-purple-500 border-purple-500"
          )}
        >
          {row.original.type}
        </Badge>
      ),
    },
    {
      accessorKey: "dateTime",
      header: () => (
        <div className="flex items-center space-x-2">
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
          <span>Date & Time</span>
        </div>
      ),
      cell: ({ row }) => {
        const date = parseISO(row.original.dateTime);
        return format(date, "PPp");
      },
      filterFn: (row, _columnId, filterValue: Date | undefined) => {
        if (!filterValue) return true;
        const interviewDate = parseISO(row.original.dateTime);
        return (
          format(interviewDate, "yyyy-MM-dd") ===
          format(filterValue, "yyyy-MM-dd")
        );
      },
    },
    {
      id: "actions",
      header: () => (
        <div className="flex items-center justify-end space-x-2">
          <Settings className="h-4 w-4 text-muted-foreground" />
          <span>Actions</span>
        </div>
      ),
      cell: ({ row }) => {
        const interview = row.original;
        return (
          <div className="flex items-center justify-end space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/edit/${interview.id}`)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4 text-destructive z-50" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Interview</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this interview with{" "}
                    {interview.candidateName}? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-500 hover:bg-red-400"
                    onClick={async () => {
                      setLoading(true);
                      try {
                        await sendInterviewEmail({
                          to_email: interview.candidateEmail,
                          to_name: interview.candidateName,
                          interviewer_name: interview.interviewerName,
                          interview_type: interview.type,
                          interview_date: format(
                            new Date(interview.dateTime),
                            "MMMM d, yyyy"
                          ),
                          interview_time: format(
                            new Date(interview.dateTime),
                            "h:mm a"
                          ),
                          action: "Cancelled",
                        });

                        deleteInterview(interview.id);

                        toast({
                          title: "Interview Deleted",
                          description: `The interview has been cancelled and a notification email has been sent to ${interview.candidateName}.`,
                        });
                      } catch (error) {
                        toast({
                          title: "Error",
                          description:
                            "Failed to send cancellation email, but the interview was deleted.",
                          variant: "destructive",
                        });
                      } finally {
                        setLoading(false);
                      }
                    }}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />{" "}
                        Deleting
                      </>
                    ) : (
                      "Delete Interview"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];

  const uniqueInterviewers = Array.from(
    new Set(data.map((interview) => interview.interviewerName))
  );
  const interviewTypes = Array.from(
    new Set(data.map((interview) => interview.type))
  );

  const clearFilter = (column: string) => {
    const table = document.querySelector("[data-table]");
    if (table) {
      const event = new CustomEvent("setColumnFilter", {
        detail: { column, value: null },
      });
      table.dispatchEvent(event);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Candidate</label>
          <Input
            placeholder="Filter by candidate..."
            onChange={(e) => {
              const table = document.querySelector("[data-table]");
              if (table) {
                const event = new CustomEvent("setColumnFilter", {
                  detail: {
                    column: "candidateName",
                    value: e.target.value || null,
                  },
                });
                table.dispatchEvent(event);
              }
            }}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Interviewer</label>
          <Select
            onValueChange={(value) => {
              const table = document.querySelector("[data-table]");
              if (table) {
                const event = new CustomEvent("setColumnFilter", {
                  detail: {
                    column: "interviewerName",
                    value: value === "all" ? null : value,
                  },
                });
                table.dispatchEvent(event);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select interviewer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Interviewers</SelectItem>
              {uniqueInterviewers.map((interviewer) => (
                <SelectItem key={interviewer} value={interviewer}>
                  {interviewer}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            Interview Type
          </label>
          <Select
            onValueChange={(value) => {
              const table = document.querySelector("[data-table]");
              if (table) {
                const event = new CustomEvent("setColumnFilter", {
                  detail: {
                    column: "type",
                    value: value === "all" ? null : value,
                  },
                });
                table.dispatchEvent(event);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {interviewTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Date</label>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-between text-left font-normal",
                    !dateFilter && "text-muted-foreground"
                  )}
                >
                  {dateFilter ? (
                    format(dateFilter, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                  <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFilter}
                  onSelect={(date) => {
                    setDateFilter(date);
                    const table = document.querySelector("[data-table]");
                    if (table) {
                      const event = new CustomEvent("setColumnFilter", {
                        detail: { column: "dateTime", value: date },
                      });
                      table.dispatchEvent(event);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {dateFilter && (
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => {
                  setDateFilter(undefined);
                  clearFilter("dateTime");
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
}
