"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AppProviders" // Assuming you have this context
import { useApi } from "@/hooks/useApi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Plus, Trash2, CheckCircle2, Clock, AlertCircle, PauseCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "sonner"
import DashboardLayout from "@/components/dashboard-layout"

// Define the Todo type matching your backend
type Todo = {
  _id: string
  title: string
  description?: string
  priority: "high" | "medium" | "low"
  status: "draft" | "doing" | "hold" | "done"
  dueDate?: string
  created_at: string
}

export default function TodoPage() {
  const { user } = useAuth()
  const api = useApi()
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // Form State
  const [newTodo, setNewTodo] = useState<Partial<Todo>>({
    title: "",
    description: "",
    priority: "medium",
    status: "draft",
    dueDate: undefined
  })

  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    try {
      const data = await api.get("/workshop/todos")
      setTodos(data)
    } catch (error) {
      console.error("Failed to fetch todos", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTodo = async () => {
    try {
      if (!newTodo.title) return toast.error("Title is required")
      
      await api.post("/workshop/todos", newTodo)
      toast.success("Task created successfully")
      setIsDialogOpen(false)
      setNewTodo({ title: "", description: "", priority: "medium", status: "draft", dueDate: undefined })
      fetchTodos()
    } catch (error) {
      toast.error("Failed to create task")
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      // Optimistic update
      setTodos(todos.map(t => t._id === id ? { ...t, status: newStatus as any } : t))
      await api.put(`/workshop/todos/${id}`, { status: newStatus })
    } catch (error) {
      fetchTodos() // Revert on error
      toast.error("Failed to update status")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/workshop/todos/${id}`)
      setTodos(todos.filter(t => t._id !== id))
      toast.success("Task deleted")
    } catch (error) {
      toast.error("Failed to delete task")
    }
  }

  // Helper to render priority badge
  const PriorityBadge = ({ priority }: { priority: string }) => {
    const colors = {
      high: "bg-red-100 text-red-800 hover:bg-red-100",
      medium: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      low: "bg-green-100 text-green-800 hover:bg-green-100",
    }
    return <Badge className={cn("capitalize", colors[priority as keyof typeof colors])}>{priority}</Badge>
  }

  // Group todos by status for Kanban view
  const columns = [
    { id: "draft", label: "Draft", icon: AlertCircle, color: "text-slate-500" },
    { id: "doing", label: "Doing", icon: Clock, color: "text-blue-500" },
    { id: "hold", label: "On Hold", icon: PauseCircle, color: "text-orange-500" },
    { id: "done", label: "Done", icon: CheckCircle2, color: "text-green-500" },
  ]

  return (
    <DashboardLayout>
    <div className="space-y-6 h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">To Do Board</h1>
          <p className="text-muted-foreground">Manage your workshop tasks and priorities.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> New Task</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input 
                  value={newTodo.title} 
                  onChange={(e) => setNewTodo({...newTodo, title: e.target.value})}
                  placeholder="e.g. Order new brake pads" 
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  value={newTodo.description} 
                  onChange={(e) => setNewTodo({...newTodo, description: e.target.value})}
                  placeholder="Details about the task..." 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select 
                    value={newTodo.priority} 
                    onValueChange={(v: any) => setNewTodo({...newTodo, priority: v})}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select 
                    value={newTodo.status} 
                    onValueChange={(v: any) => setNewTodo({...newTodo, status: v})}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="doing">Doing</SelectItem>
                      <SelectItem value="hold">Hold</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newTodo.dueDate ? format(new Date(newTodo.dueDate), "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newTodo.dueDate ? new Date(newTodo.dueDate) : undefined}
                      onSelect={(date) => setNewTodo({...newTodo, dueDate: date?.toISOString()})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <Button onClick={handleCreateTodo} className="w-full">Create Task</Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-6 h-full min-w-[1000px]">
          {columns.map((col) => (
            <div key={col.id} className="flex-1 flex flex-col bg-muted/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <col.icon className={cn("w-5 h-5", col.color)} />
                <h3 className="font-semibold">{col.label}</h3>
                <span className="ml-auto bg-background px-2 py-0.5 rounded-full text-xs border">
                  {todos.filter(t => t.status === col.id).length}
                </span>
              </div>
              
              <div className="space-y-3 overflow-y-auto flex-1 pr-2">
                {todos.filter(t => t.status === col.id).map((todo) => (
                  <Card key={todo._id} className="cursor-pointer hover:shadow-md transition-shadow group">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-sm font-medium leading-none">{todo.title}</CardTitle>
                        <PriorityBadge priority={todo.priority} />
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      {todo.description && (
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{todo.description}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        {todo.dueDate && (
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            {format(new Date(todo.dueDate), "MMM d")}
                          </div>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
                          onClick={() => handleDelete(todo._id)}
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </Button>
                      </div>
                      
                      {/* Quick Status Move Buttons */}
                      <div className="mt-3 flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        {col.id !== 'done' && (
                          <Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={() => handleUpdateStatus(todo._id, 'done')}>
                            Mark Done
                          </Button>
                        )}
                         {col.id !== 'doing' && (
                          <Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={() => handleUpdateStatus(todo._id, 'doing')}>
                            Start
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </DashboardLayout>
  )
}