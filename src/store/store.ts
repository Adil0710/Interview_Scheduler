import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Interview, Interviewer } from "../types/types";

const defaultInterviewers: Interviewer[] = [
  {
    id: "1",
    name: "John Smith",
    role: "Senior Technical Interviewer",
    availability: {},
  },
  {
    id: "2",
    name: "Sarah Johnson",
    role: "HR Manager",
    availability: {},
  },
  {
    id: "3",
    name: "Michael Chen",
    role: "Technical Lead",
    availability: {},
  },
  {
    id: "4",
    name: "Emily Brown",
    role: "Behavioral Assessment Specialist",
    availability: {},
  },
  {
    id: "5",
    name: "David Wilson",
    role: "Senior Developer",
    availability: {},
  },
];

interface InterviewStore {
  interviews: Interview[];
  interviewers: Interviewer[];
  addInterview: (interview: Interview) => void;
  updateInterview: (id: string, interview: Interview) => void;
  deleteInterview: (id: string) => void;
  getInterviewById: (id: string) => Interview | undefined;
  addInterviewer: (interviewer: Interviewer) => void;
  updateInterviewer: (id: string, interviewer: Interviewer) => void;
  deleteInterviewer: (id: string) => void;
  getInterviewerByName: (name: string) => Interviewer | undefined;
}

export const useInterviewStore = create<InterviewStore>()(
  persist(
    (set, get) => ({
      interviews: [],
      interviewers: defaultInterviewers,
      addInterview: (interview) =>
        set((state) => ({
          interviews: [...state.interviews, interview],
        })),
      updateInterview: (id, updatedInterview) =>
        set((state) => ({
          interviews: state.interviews.map((interview) =>
            interview.id === id ? updatedInterview : interview
          ),
        })),
      deleteInterview: (id) =>
        set((state) => ({
          interviews: state.interviews.filter(
            (interview) => interview.id !== id
          ),
        })),
      getInterviewById: (id) => {
        return get().interviews.find((interview) => interview.id === id);
      },
      addInterviewer: (interviewer) =>
        set((state) => ({
          interviewers: [...state.interviewers, interviewer],
        })),
      updateInterviewer: (id, updatedInterviewer) =>
        set((state) => ({
          interviewers: state.interviewers.map((interviewer) =>
            interviewer.id === id ? updatedInterviewer : interviewer
          ),
        })),
      deleteInterviewer: (id) =>
        set((state) => ({
          interviewers: state.interviewers.filter(
            (interviewer) => interviewer.id !== id
          ),
        })),
      getInterviewerByName: (name) => {
        return get().interviewers.find(
          (interviewer) => interviewer.name === name
        );
      },
    }),
    {
      name: "interview-store",
    }
  )
);
