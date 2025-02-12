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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInterviewStore } from "@/store/store";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function Interviewers() {
  const { interviewers, addInterviewer, updateInterviewer, deleteInterviewer } =
    useInterviewStore();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateInterviewer(editingId, {
        id: editingId,
        name,
        role,
        availability: {},
      });
      toast({
        title: "Interviewer Updated",
        description: "The interviewer has been successfully updated.",
      });
    } else {
      addInterviewer({
        id: crypto.randomUUID(),
        name,
        role,
        availability: {},
      });
      toast({
        title: "Interviewer Added",
        description: "The interviewer has been successfully added.",
      });
    }
    setIsOpen(false);
    setEditingId(null);
    setName("");
    setRole("");
  };

  const handleEdit = (id: string) => {
    const interviewer = interviewers.find((i) => i.id === id);
    if (interviewer) {
      setEditingId(id);
      setName(interviewer.name);
      setRole(interviewer.role);
      setIsOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    deleteInterviewer(id);
    toast({
      title: "Interviewer Deleted",
      description: "The interviewer has been successfully deleted.",
    });
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Interviewers</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingId(null);
                setName("");
                setRole("");
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Interviewer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Interviewer" : "Add New Interviewer"}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Update the interviewer details below."
                  : "Add a new interviewer to the system."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {editingId ? "Update" : "Add"} Interviewer
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {interviewers.map((interviewer) => (
          <Card key={interviewer.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{interviewer.name}</span>
                <div className="space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(interviewer.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(interviewer.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>{interviewer.role}</CardDescription>
            </CardHeader>
            <CardContent></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
