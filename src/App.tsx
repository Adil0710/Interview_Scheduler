import { Toaster } from '@/components/ui/toaster';
import { Dashboard } from '@/pages/dashboard';
import { EditInterview } from '@/pages/edit-interview';
import { NewInterview } from '@/pages/new-interview';
import { Interviewers } from '@/pages/interviewers';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Sidebar } from '@/components/sidebar';

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col lg:flex-row">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/new" element={<NewInterview />} />
            <Route path="/edit/:id" element={<EditInterview />} />
            <Route path="/interviewers" element={<Interviewers />} />
          </Routes>
        </main>
      </div>
      <Toaster />
    </BrowserRouter>
  );
}

export default App