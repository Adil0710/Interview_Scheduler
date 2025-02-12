import emailjs from '@emailjs/browser';

// Replace these with your EmailJS service details
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

interface EmailParams {
  to_email: string;
  to_name: string;
  interviewer_name: string;
  interview_type: string;
  interview_date: string;
  interview_time: string;
  action: 'Scheduled' | 'Updated' | 'Cancelled';
}

export const sendInterviewEmail = async (params: EmailParams) => {
  console.log(SERVICE_ID) 
  console.log(TEMPLATE_ID)
  console.log(PUBLIC_KEY)
  
  try {
    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      { ...params } as Record<string, unknown>,
      PUBLIC_KEY
    );
    return response;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};