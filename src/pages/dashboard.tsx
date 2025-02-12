import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarView } from "@/components/calendar-view";
import { InterviewList } from "@/components/interview-list";
import { InterviewTable } from "@/components/interview-table";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useInterviewStore } from "@/store/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Dashboard() {
  const { interviews } = useInterviewStore();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold sm:text-3xl">Interview Dashboard</h1>
        <Link to="/new">
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Schedule Interview
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        <div>
          <Card>
            <CardHeader>
              <CardTitle className=" text-2xl">Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <CalendarView />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className=" text-2xl">All Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="table" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="table">Table View</TabsTrigger>
                <TabsTrigger value="list">List View</TabsTrigger>
              </TabsList>
              <TabsContent value="table" className="mt-6">
                <InterviewTable data={interviews} />
              </TabsContent>
              <TabsContent value="list" className="mt-6">
                <InterviewList />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
