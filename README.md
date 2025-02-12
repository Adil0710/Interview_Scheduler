# Interview Scheduling Application

A web-based interview scheduling system that allows users to set up, update, and cancel interviews with email notifications.


## 🖥️ Demo


https://github.com/user-attachments/assets/b61c5d95-0de7-4e39-a564-7c765bb8fc8a

## 🚀 Features
- Schedule interviews with date and time selection.
- Drag-and-drop rescheduling.
- Email notifications using EmailJS.
- Overlap Solutions for same interviewer in time slot

## 🛠️ Setup Instructions

### Prerequisites
- Node.js installed
- A valid EmailJS account

### Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/Adil0710/Interview_Scheduler
   cd Interview_Scheduler
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file and add the following environment variables:
   ```env
   VITE_EMIALJS_SERVICE_ID=your_service_id
   VITE_EMIALJS_TEMPLATE_ID=your_template_id
   VITE_EMIALJS_PUBLIC_KEY=your_public_key
   ```
4. Start the development server:
   ```sh
   npm run dev
   ```

## 🎨 Design Decisions
- **Shadcn UI**: UI components to maintain a clean, accessible, and consistent design.
- **EmailJS for Notifications**: Chosen for ease of integration and reliable email delivery.
- **Drag-and-Drop Scheduling**: Implemented using `react-big-calendar`, `react-dnd` and `react-dnd-html5-backend` for intuitive rescheduling.


## 🤔 Assumptions
- Users will receive and read email notifications for interview updates.
- Interviews can be rescheduled within available slots only.

## 🏆 Challenges Faced
- **Time Zone Handling**: Ensuring the correct time zone was applied to scheduled interviews.
- **Drag-and-Drop Constraints**: Keeping the rescheduled interview within valid slots while updating the date and time correctly.

## 📌 Future Improvements
- Adding Skeleton, Badges, Tooltip and Framer Motion for better user experience.
- Adding authentication for secure access.
- Implementing recurring interview scheduling.
- Enhancing UI/UX for better user experience.
  

---

Made with ❤️ by Adil
