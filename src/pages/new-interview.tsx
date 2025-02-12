import { InterviewForm } from '@/components/interview-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function NewInterview() {
  return (
    <div className="container  py-8">
      <Card>
        <CardHeader>
          <CardTitle className=' text-2xl'>Schedule New Interview</CardTitle>
        </CardHeader>
        <CardContent>
          <InterviewForm />
        </CardContent>
      </Card>
    </div>
  );
}