import { InterviewForm } from "@/components/interview-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInterviewStore } from "@/store/store";
import { useParams } from "react-router-dom";

export function EditInterview() {
  const { id } = useParams();
  const { getInterviewById } = useInterviewStore();
  const interview = id ? getInterviewById(id) : undefined;

  if (!interview) {
    return <div>Interview not found</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className=" text-2xl">Edit Interview</CardTitle>
        </CardHeader>
        <CardContent>
          <InterviewForm interview={interview} />
        </CardContent>
      </Card>
    </div>
  );
}
