export type InterviewType = 'Technical' | 'HR' | 'Behavioural';

export interface Interviewer {
  id: string;
  name: string;
  role: string;
  availability: {
    [date: string]: string[]; 
  };
}

export interface Interview {
  id: string;
  candidateName: string;
  candidateEmail: string; 
  interviewerName: string;
  dateTime: string;
  type: InterviewType;
  notes?: string;
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

export interface CalendarEvent extends Omit<Interview, 'dateTime'> {
  title: string;
  start: Date;
  end: Date;
}