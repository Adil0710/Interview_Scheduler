import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useInterviewStore } from "@/store/store";
import { Calendar, Clock, Edit, Loader2, Trash2, UserCog } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { sendInterviewEmail } from "@/helpers/email";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

export function InterviewList() {
  const { interviews, deleteInterview } = useInterviewStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {interviews.map((interview) => (
        <Card key={interview.id} className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="truncate">{interview.candidateName}</span>
              <div className="flex shrink-0 space-x-2">
                <Link to={`/edit/${interview.id}`}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Interview</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete this interview with{" "}
                        {interview.candidateName} ? This action cannot be
                        undone.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="destructive"
                        onClick={async () => {
                          setLoading(true);
                          try {
                            const interviewToDelete = interviews.find(
                              (i) => i.id === interview.id
                            );
                            if (!interviewToDelete) return;

                            await sendInterviewEmail({
                              to_email: interviewToDelete.candidateEmail,
                              to_name: interviewToDelete.candidateName,
                              interviewer_name:
                                interviewToDelete.interviewerName,
                              interview_type: interviewToDelete.type,
                              interview_date: format(
                                new Date(interviewToDelete.dateTime),
                                "MMMM d, yyyy"
                              ),
                              interview_time: format(
                                new Date(interviewToDelete.dateTime),
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
                            <Loader2 className=" w-5 h-5 mr-2 animate-spin" />{" "}
                            Deleting
                          </>
                        ) : (
                          "Delete Interview"
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardTitle>
            <CardDescription><Badge  className={cn(interview.type === "Behavioural" && " bg-green-500/10 text-green-500 border-green-500",interview.type === "HR" && " bg-blue-500/10 text-blue-500 border-blue-500", interview.type === "Technical" && " bg-purple-500/10 text-purple-500 border-purple-500")}>{interview.type} Interview</Badge></CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <UserCog className="h-4 w-4 shrink-0" />
                <span className="truncate">{interview.interviewerName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 shrink-0" />
                <span>
                  {format(new Date(interview.dateTime), "MMMM d, yyyy")}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 shrink-0" />
                <span>{format(new Date(interview.dateTime), "h:mm a")}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
