"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft, Plus, Trash2, FileText, Edit2, Upload, UserPlus, Loader2, Check,
  User, Car, Shield, Gauge, AlertCircle, Phone, Mail, X, 
  Briefcase, MessageSquare, ClipboardList, Save, XCircle
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useJobCard, useSaveJobCard, JobCardIn, SparePartItem, ServiceItem, JobCard } from "@/hooks/useApi"
import { toast } from "sonner"
import { format } from "date-fns"

// --- Helper for Lined Textareas ---
const LinedTextarea = ({ 
  value, 
  onChange, 
  onBlur, 
  placeholder 
}: { 
  value: string, 
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, 
  onBlur: () => void,
  placeholder: string 
}) => {
  return (
    <div className="relative w-full h-full bg-[#fdfbf7]">
      {/* Lines Background */}
      <div className="absolute inset-0 pointer-events-none" 
           style={{
             backgroundImage: 'linear-gradient(transparent 31px, #e2e8f0 31px)',
             backgroundSize: '100% 32px',
             marginTop: '6px' // Adjust alignment
           }} 
      />
      <textarea 
        className="w-full h-full min-h-[140px] bg-transparent border-0 resize-none focus:ring-0 p-0 text-sm leading-8 pl-12 pr-4 pt-1 font-medium text-slate-700 placeholder:text-slate-300 outline-none"
        style={{ lineHeight: '32px' }}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
      />
      {/* Margin Line */}
      <div className="absolute left-10 top-0 bottom-0 w-[2px] bg-red-100/50 pointer-events-none border-r border-red-200" />
    </div>
  )
}

// --- Helper for Details Fields ---
const DetailRow = ({ 
  label, 
  value, 
  isEditing, 
  onChange, 
  icon: Icon,
  type = "text"
}: { 
  label: string, 
  value: string | number | undefined, 
  isEditing: boolean, 
  onChange: (val: string) => void, 
  icon?: any,
  type?: string
}) => {
  return (
    <div className="flex flex-col gap-1 min-h-[3.5rem] justify-center group">
      <span className="text-xs text-muted-foreground flex items-center gap-1">
        {Icon && <Icon className="w-3 h-3 text-slate-400" />} 
        {label}
      </span>
      
      {isEditing ? (
        <Input 
          value={value || ""} 
          onChange={(e) => onChange(e.target.value)} 
          type={type}
          className="h-8 text-sm bg-white"
        />
      ) : (
        <p className="text-sm font-semibold text-slate-800 break-words pl-0.5">
          {value || <span className="text-slate-300 italic text-xs">Empty</span>}
        </p>
      )}
    </div>
  )
}

export default function JobCardPage() {
  const router = useRouter()
  const params = useParams()
  const jobCardId = params.id as string
  const [mounted, setMounted] = useState(false)
  
  // State holds the full JobCard object
  const [jobCard, setJobCard] = useState<JobCard | null>(null)
  
  // Editing State for Details Section
  const [isEditingDetails, setIsEditingDetails] = useState(false)
  // We keep a temp state for edits so we can cancel if needed, 
  // but for simplicity here we edit `jobCard` directly and save on "Save".
  // To support "Cancel", we would need a separate state object. 
  // Here we will just toggle the view and assume edits are intentional.

  // Modals state
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false)
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false)
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false)
  const [isPartModalOpen, setIsPartModalOpen] = useState(false)
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false)
  
  // Edit States for Issues/Workers
  const [editingIssueIndex, setEditingIssueIndex] = useState<number | null>(null)
  const [currentIssue, setCurrentIssue] = useState("")
  
  const [editingWorkerIndex, setEditingWorkerIndex] = useState<number | null>(null)
  const [currentWorker, setCurrentWorker] = useState("")
  
  // Photo Upload State
  const [isUploading, setIsUploading] = useState(false)
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null)

  // Initial states with 0
  const [currentService, setCurrentService] = useState<ServiceItem>({ id: "", description: "", cost: 0, taxPercent: 0 })
  const [currentPart, setCurrentPart] = useState<SparePartItem>({ id: "", name: "", quantity: 1, price: 0, taxPercent: 0 })

  const { data: apiJobCard, isLoading, isError } = useJobCard(jobCardId)
  const saveJobCardMutation = useSaveJobCard()

  useEffect(() => {
    setMounted(true)
    if (apiJobCard) {
      setJobCard(apiJobCard)
    }
  }, [apiJobCard])

  const updateAndSave = async (updates: Partial<JobCard>) => {
    if (!jobCard) return;
    const newState = { ...jobCard, ...updates };
    setJobCard(newState);
    
    const { id, _id, workshop_id, created_at, updated_at, ...payload } = newState;
    
    try {
      await saveJobCardMutation.mutateAsync({ data: payload, id: jobCardId });
    } catch (err) {
      console.error(err);
      toast.error("Failed to save changes.");
    }
  };

  // Handler for saving the Details Section specifically
  const handleSaveDetails = async () => {
    if (!jobCard) return;
    // We trigger the API save with current state
    await updateAndSave({});
    setIsEditingDetails(false);
    toast.success("Details saved successfully");
  };

  const handleStatusChange = (val: string) => updateAndSave({ status: val });

  // --- Issues Handlers ---
  const handleOpenIssueModal = (index?: number) => {
    if (index !== undefined && jobCard) {
      setEditingIssueIndex(index);
      setCurrentIssue(jobCard.issues[index]);
    } else {
      setEditingIssueIndex(null);
      setCurrentIssue("");
    }
    setIsIssueModalOpen(true);
  }

  const handleSaveIssue = () => {
    if (currentIssue.trim() && jobCard) {
      let newIssues = [...jobCard.issues];
      if (editingIssueIndex !== null) {
        newIssues[editingIssueIndex] = currentIssue.trim();
      } else {
        newIssues.push(currentIssue.trim());
      }
      updateAndSave({ issues: newIssues });
      setIsIssueModalOpen(false);
    }
  }

  const handleDeleteIssue = (index: number) => {
    if (jobCard) {
      const newIssues = [...jobCard.issues];
      newIssues.splice(index, 1);
      updateAndSave({ issues: newIssues });
    }
  }

  // --- Workers Handlers ---
  const handleOpenWorkerModal = (index?: number) => {
    if (index !== undefined && jobCard) {
      setEditingWorkerIndex(index);
      setCurrentWorker(jobCard.workers[index]);
    } else {
      setEditingWorkerIndex(null);
      setCurrentWorker("");
    }
    setIsWorkerModalOpen(true);
  }

  const handleSaveWorker = () => {
     if (currentWorker.trim() && jobCard) {
      let newWorkers = [...jobCard.workers];
      if (editingWorkerIndex !== null) {
        newWorkers[editingWorkerIndex] = currentWorker.trim();
      } else {
        newWorkers.push(currentWorker.trim());
      }
      updateAndSave({ workers: newWorkers });
      setIsWorkerModalOpen(false);
    }
  }
  
  const handleDeleteWorker = (index: number) => {
    if (jobCard) {
      const newWorkers = [...jobCard.workers];
      newWorkers.splice(index, 1);
      updateAndSave({ workers: newWorkers });
    }
  }

  // --- Service/Part Handlers ---
  const handleSaveService = () => {
    if(!jobCard) return;
    let newServices = [...jobCard.services];
    const idx = newServices.findIndex(s => s.id === currentService.id);
    if(idx > -1) newServices[idx] = currentService; else newServices.push(currentService);
    updateAndSave({ services: newServices });
    setIsServiceModalOpen(false);
  }

  const handleDeleteService = (id: string) => {
    if(jobCard) updateAndSave({ services: jobCard.services.filter(s => s.id !== id) });
  }

  const handleSavePart = () => {
    if(!jobCard) return;
    let newParts = [...jobCard.spareParts];
    const idx = newParts.findIndex(p => p.id === currentPart.id);
    if(idx > -1) newParts[idx] = currentPart; else newParts.push(currentPart);
    updateAndSave({ spareParts: newParts });
    setIsPartModalOpen(false);
  }

  const handleDeletePart = (id: string) => {
    if(jobCard) updateAndSave({ spareParts: jobCard.spareParts.filter(p => p.id !== id) });
  }

  // --- Photo Helper ---
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = document.createElement("img");
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const scaleSize = MAX_WIDTH / img.width;
          
          if (img.width > MAX_WIDTH) {
              canvas.width = MAX_WIDTH;
              canvas.height = img.height * scaleSize;
          } else {
              canvas.width = img.width;
              canvas.height = img.height;
          }

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.6));
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && jobCard) {
      setIsUploading(true);
      const files = Array.from(e.target.files);
      const newPhotos: string[] = [];

      try {
        for (const file of files) {
          const compressed = await compressImage(file);
          newPhotos.push(compressed);
        }
        await updateAndSave({ photos: [...(jobCard.photos || []), ...newPhotos] });
        toast.success(`Added ${newPhotos.length} photo(s)`);
      } catch (error) {
        console.error(error);
        toast.error("Failed to process photos");
      } finally {
        setIsUploading(false);
        e.target.value = ""; 
      }
    }
  };

  const removePhoto = (index: number) => {
    if (!jobCard) return;
    const newPhotos = [...(jobCard.photos || [])];
    newPhotos.splice(index, 1);
    updateAndSave({ photos: newPhotos });
    toast.success("Photo removed");
  };

  const handleGenerateInvoice = async () => {
    await updateAndSave({});
    router.push(`/dashboard/invoices?jobCardId=${jobCardId}`);
  }

  if (!mounted) return null;
  
  if (isLoading || !jobCard) {
    return (
        <DashboardLayout>
            <div className="flex justify-center p-20"><Loader2 className="animate-spin w-10 h-10 text-primary" /></div>
        </DashboardLayout>
    )
  }

  if (isError) {
      return (
        <DashboardLayout>
            <div className="flex flex-col items-center justify-center p-10 gap-4">
                <p className="text-destructive">Error loading job card.</p>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        </DashboardLayout>
      )
  }

  // Calculations
  const partsTotal = jobCard.spareParts.reduce((sum, p) => sum + (p.price * p.quantity) + (p.price * p.quantity * p.taxPercent / 100), 0);
  const laborTotal = jobCard.services.reduce((sum, s) => sum + s.cost + (s.cost * s.taxPercent / 100), 0);
  const grandTotal = partsTotal + laborTotal;

  const getStatusColor = (s: string) => {
    switch (s?.toLowerCase()) {
      case "confirmed": return "text-blue-700 bg-blue-100 border-blue-200";
      case "pending": return "text-yellow-700 bg-yellow-100 border-yellow-200";
      case "in-progress": return "text-purple-700 bg-purple-100 border-purple-200";
      case "completed": return "text-green-700 bg-green-100 border-green-200";
      case "waiting-parts": return "text-orange-700 bg-orange-100 border-orange-200";
      default: return "text-gray-700 bg-gray-100 border-gray-200";
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between gap-4 bg-white p-4 rounded-xl border shadow-sm">
           <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="w-5 h-5" /></Button>
             <div>
               <h1 className="text-2xl font-bold">Job Card #{jobCardId.slice(-6).toUpperCase()}</h1>
               <p className="text-sm text-muted-foreground">{jobCard.vehicle} • {jobCard.customer}</p>
             </div>
           </div>
           <div className="flex items-center gap-2">
             <Label>Status:</Label>
             <Select value={jobCard.status} onValueChange={handleStatusChange}>
                <SelectTrigger className={`w-[140px] font-bold ${getStatusColor(jobCard.status || "pending")}`}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="waiting-parts">Waiting Parts</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
             </Select>
           </div>
        </div>

        {/* --- 1. Vehicle & Customer Details (With Underlined Headers) --- */}
        <Card className="overflow-hidden border-none shadow-md bg-white p-0 rounded-xl">
          <CardHeader className="bg-slate-50 border-b p-4 flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Car className="w-5 h-5 text-blue-600" /> 
                    Vehicle & Customer Details
                </CardTitle>
                <CardDescription>View and manage critical information</CardDescription>
            </div>
            <div>
              {isEditingDetails ? (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditingDetails(false)} className="text-red-600 hover:bg-red-50 border-red-100">
                    <XCircle className="w-4 h-4 mr-1" /> Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveDetails} className="bg-green-600 hover:bg-green-700 text-white">
                    <Save className="w-4 h-4 mr-1" /> Save Changes
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setIsEditingDetails(true)} className="border-blue-200 text-blue-700 hover:bg-blue-50">
                  <Edit2 className="w-3 h-3 mr-2" /> Edit Details
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                
                {/* Column 1: Customer */}
                <div className="p-6 space-y-4">
                    {/* Added border-b and pb-2 for underline */}
                    <div className="flex items-center gap-2 mb-2 font-bold text-slate-800 uppercase text-xs tracking-wider border-b border-slate-200 pb-2">
                        <User className="w-4 h-4"/> Customer Info
                    </div>
                    <div className="space-y-1">
                       <DetailRow label="Name" value={jobCard?.customer} isEditing={isEditingDetails} onChange={(v) => setJobCard(jobCard ? {...jobCard, customer: v} : null)} />
                       <DetailRow label="Type" value={jobCard?.customerType} isEditing={isEditingDetails} onChange={(v) => setJobCard(jobCard ? {...jobCard, customerType: v} : null)} />
                       <DetailRow label="Phone" value={jobCard?.phone} isEditing={isEditingDetails} onChange={(v) => setJobCard(jobCard ? {...jobCard, phone: v} : null)} icon={Phone} />
                       <DetailRow label="Email" value={jobCard?.email} isEditing={isEditingDetails} onChange={(v) => setJobCard(jobCard ? {...jobCard, email: v} : null)} icon={Mail} />
                       <DetailRow label="Address" value={jobCard?.address} isEditing={isEditingDetails} onChange={(v) => setJobCard(jobCard ? {...jobCard, address: v} : null)} />
                    </div>
                </div>

                {/* Column 2: Vehicle Specs */}
                <div className="p-6 space-y-4 bg-slate-50/30">
                    {/* Added border-b and pb-2 for underline */}
                    <div className="flex items-center gap-2 mb-2 font-bold text-slate-800 uppercase text-xs tracking-wider border-b border-slate-200 pb-2">
                        <Car className="w-4 h-4"/> Vehicle Specs
                    </div>
                    <div className="space-y-1">
                       <DetailRow label="Reg Number" value={jobCard?.carNumber} isEditing={isEditingDetails} onChange={(v) => setJobCard(jobCard ? {...jobCard, carNumber: v} : null)} />
                       <DetailRow label="Make/Model" value={jobCard?.makeAndModel} isEditing={isEditingDetails} onChange={(v) => setJobCard(jobCard ? {...jobCard, makeAndModel: v} : null)} />
                       <DetailRow label="Year" value={jobCard?.makeYear} isEditing={isEditingDetails} onChange={(v) => setJobCard(jobCard ? {...jobCard, makeYear: v} : null)} />
                       <DetailRow label="VIN" value={jobCard?.vinNumber} isEditing={isEditingDetails} onChange={(v) => setJobCard(jobCard ? {...jobCard, vinNumber: v} : null)} />
                       <DetailRow label="Engine No" value={jobCard?.engineNumber} isEditing={isEditingDetails} onChange={(v) => setJobCard(jobCard ? {...jobCard, engineNumber: v} : null)} />
                       <DetailRow label="Color" value={jobCard?.color} isEditing={isEditingDetails} onChange={(v) => setJobCard(jobCard ? {...jobCard, color: v} : null)} />
                    </div>
                </div>

                {/* Column 3: Technical */}
                <div className="p-6 space-y-4">
                    {/* Added border-b and pb-2 for underline */}
                    <div className="flex items-center gap-2 mb-2 font-bold text-slate-800 uppercase text-xs tracking-wider border-b border-slate-200 pb-2">
                        <Gauge className="w-4 h-4"/> Technical Data
                    </div>
                    <div className="space-y-2">
                       <DetailRow label="Odometer (KM)" value={jobCard?.odometer} isEditing={isEditingDetails} onChange={(v) => setJobCard(jobCard ? {...jobCard, odometer: v} : null)} />
                       
                       {/* Fuel Level UI */}
                       <div className="flex flex-col gap-1 min-h-[3.5rem] justify-center">
                          <span className="text-xs text-muted-foreground">Fuel Level (%)</span>
                          {isEditingDetails ? (
                             <Input 
                               type="number" 
                               value={jobCard?.fuelIndicator || 0} 
                               onChange={(e) => setJobCard(jobCard ? {...jobCard, fuelIndicator: parseInt(e.target.value) || 0} : null)}
                               className="h-8 text-sm bg-white"
                             />
                          ) : (
                             <div className="w-full">
                                <span className="font-semibold text-sm">{jobCard?.fuelIndicator || 0}%</span>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-1">
                                    <div className={`h-full rounded-full transition-all ${(jobCard?.fuelIndicator || 0) < 20 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${jobCard?.fuelIndicator || 0}%` }} />
                                </div>
                             </div>
                          )}
                       </div>
                       
                       <DetailRow label="Fuel Type" value={jobCard?.fuelType} isEditing={isEditingDetails} onChange={(v) => setJobCard(jobCard ? {...jobCard, fuelType: v} : null)} />
                       <DetailRow label="Transmission" value={jobCard?.transmissionType} isEditing={isEditingDetails} onChange={(v) => setJobCard(jobCard ? {...jobCard, transmissionType: v} : null)} />
                    </div>
                </div>

                {/* Column 4: Admin */}
                <div className="p-6 space-y-4 bg-slate-50/30">
                    {/* Added border-b and pb-2 for underline */}
                    <div className="flex items-center gap-2 mb-2 font-bold text-slate-800 uppercase text-xs tracking-wider border-b border-slate-200 pb-2">
                        <Shield className="w-4 h-4"/> Admin Info
                    </div>
                    <div className="space-y-1">
                       <DetailRow label="Advisor" value={jobCard?.serviceAdvisor} isEditing={isEditingDetails} onChange={(v) => setJobCard(jobCard ? {...jobCard, serviceAdvisor: v} : null)} />
                       <DetailRow label="Department" value={jobCard?.department} isEditing={isEditingDetails} onChange={(v) => setJobCard(jobCard ? {...jobCard, department: v} : null)} />
                       <DetailRow label="Tax ID" value={jobCard?.taxNumber} isEditing={isEditingDetails} onChange={(v) => setJobCard(jobCard ? {...jobCard, taxNumber: v} : null)} />
                       
                       <div className="pt-2 mt-2 border-t border-dashed border-slate-200">
                          <span className="text-xs text-muted-foreground block mb-1">Insurance Details</span>
                          {isEditingDetails ? (
                             <Textarea 
                               className="min-h-[60px] text-xs bg-white" 
                               value={jobCard?.insuranceDetails || ""} 
                               onChange={(e) => setJobCard(jobCard ? {...jobCard, insuranceDetails: e.target.value} : null)}
                             />
                          ) : (
                             <p className="text-xs leading-relaxed text-slate-600 bg-white/50 p-2 rounded border border-slate-100">
                                {jobCard?.insuranceDetails || "No details"}
                             </p>
                          )}
                       </div>
                    </div>
                </div>
            </div>
          </CardContent>
        </Card>

        {/* --- 2. Customer Voice, Assets, Instructions (Scrollable Fixed Height) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           
           {/* Card 1: Customer Requests */}
           <Card className="flex flex-col shadow-sm border hover:shadow-md transition-shadow h-full">
              <CardHeader className="py-3 px-4 bg-slate-50 border-b flex flex-row items-center gap-2 shrink-0">
                 <div className="p-1.5 bg-blue-100 rounded-md text-blue-600">
                    <MessageSquare className="w-4 h-4" />
                 </div>
                 <CardTitle className="text-sm font-bold text-slate-700">Customer Requests</CardTitle>
              </CardHeader>
              <CardContent className="p-4 bg-white flex-1">
                 <Textarea 
                    className="h-[150px] w-full resize-none border-slate-200 focus:border-blue-300 focus:ring-blue-100 bg-transparent text-sm leading-relaxed overflow-y-auto"
                    placeholder="What specific requests did the customer make?"
                    value={jobCard?.customerRemark || ""}
                    onChange={(e) => setJobCard(prev => prev ? {...prev, customerRemark: e.target.value} : null)}
                    onBlur={() => updateAndSave({ customerRemark: jobCard?.customerRemark })}
                 />
              </CardContent>
           </Card>

           {/* Card 2: Customer Assets */}
           <Card className="flex flex-col shadow-sm border hover:shadow-md transition-shadow h-full">
              <CardHeader className="py-3 px-4 bg-slate-50 border-b flex flex-row items-center gap-2 shrink-0">
                 <div className="p-1.5 bg-orange-100 rounded-md text-orange-600">
                    <Briefcase className="w-4 h-4" />
                 </div>
                 <CardTitle className="text-sm font-bold text-slate-700">Customer Assets</CardTitle>
              </CardHeader>
              <CardContent className="p-4 bg-white flex-1">
                 <Textarea 
                    className="h-[150px] w-full resize-none border-slate-200 focus:border-orange-300 focus:ring-orange-100 bg-transparent text-sm leading-relaxed overflow-y-auto"
                    placeholder="List belongings left in the vehicle (e.g., Jack, Spare Tire)..."
                    value={jobCard?.customerAssets || ""}
                    onChange={(e) => setJobCard(prev => prev ? {...prev, customerAssets: e.target.value} : null)}
                    onBlur={() => updateAndSave({ customerAssets: jobCard?.customerAssets })}
                 />
              </CardContent>
           </Card>

           {/* Card 3: Workshop Instructions */}
           <Card className="flex flex-col shadow-sm border hover:shadow-md transition-shadow h-full">
              <CardHeader className="py-3 px-4 bg-slate-50 border-b flex flex-row items-center gap-2 shrink-0">
                 <div className="p-1.5 bg-purple-100 rounded-md text-purple-600">
                    <ClipboardList className="w-4 h-4" />
                 </div>
                 <CardTitle className="text-sm font-bold text-slate-700">Workshop Instructions</CardTitle>
              </CardHeader>
              <CardContent className="p-4 bg-white flex-1">
                 <Textarea 
                    className="h-[150px] w-full resize-none border-slate-200 focus:border-purple-300 focus:ring-purple-100 bg-transparent text-sm leading-relaxed overflow-y-auto"
                    placeholder="Internal notes and technical instructions..."
                    value={jobCard?.workshopInstructions || ""}
                    onChange={(e) => setJobCard(prev => prev ? {...prev, workshopInstructions: e.target.value} : null)}
                    onBlur={() => updateAndSave({ workshopInstructions: jobCard?.workshopInstructions })}
                 />
              </CardContent>
           </Card>

        </div>
        
       {/* --- 3. Issues & Technicians --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Reported Issues Card */}
           <Card>
              {/* Added 'border-b' to create the underline under the header */}
              <CardHeader className="flex flex-row justify-between py-3 border-b">
                <CardTitle className="text-base font-semibold">Reported Issues</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => handleOpenIssueModal()}><Plus className="w-4 h-4" /></Button>
              </CardHeader>
              <CardContent className="pt-3">
                <ul className="space-y-2 text-sm grid grid-cols-3">
                  {jobCard?.issues.length === 0 && <span className="text-muted-foreground italic">None</span>}
                  {jobCard?.issues.map((iss, i) => (
                    <li key={i} className="flex justify-between items-center p-2 rounded hover:bg-slate-50 group border border-transparent hover:border-slate-100 transition-colors">
                        <span className="flex gap-2 text-red-600 font-medium"><AlertCircle className="w-4 h-4 mt-0.5" /> {iss}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-500 hover:text-blue-600" onClick={() => handleOpenIssueModal(i)}><Edit2 className="w-3 h-3" /></Button>
                            <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-500 hover:text-red-600" onClick={() => handleDeleteIssue(i)}><Trash2 className="w-3 h-3" /></Button>
                        </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
           </Card>
           
           {/* Technicians Card */}
           <Card>
              {/* Added 'border-b' here too for consistent UI */}
              <CardHeader className="flex flex-row justify-between py-3 border-b">
                <CardTitle className="text-base font-semibold">Technicians</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => handleOpenWorkerModal()}><UserPlus className="w-4 h-4" /></Button>
              </CardHeader>
              <CardContent className="pt-3">
                 <div className="flex flex-col gap-2 grid grid-cols-3">
                   {jobCard?.workers.length === 0 && <span className="text-muted-foreground italic text-sm">Unassigned</span>}
                   {jobCard?.workers.map((w, i) => (
                       <div key={i} className="flex justify-between items-center p-2 rounded hover:bg-slate-50 group border border-transparent hover:border-slate-100 transition-colors">
                           <Badge variant="secondary" className="px-3 py-1 font-medium">{w}</Badge>
                           <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-500 hover:text-blue-600" onClick={() => handleOpenWorkerModal(i)}><Edit2 className="w-3 h-3" /></Button>
                                <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-500 hover:text-red-600" onClick={() => handleDeleteWorker(i)}><Trash2 className="w-3 h-3" /></Button>
                           </div>
                       </div>
                   ))}
                 </div>
              </CardContent>
           </Card>
        </div>

       {/* --- 4. Services & Parts --- */}
        <div className="grid grid-cols-1 gap-6">
            {/* Parts Table */}
            <Card>
            <CardHeader className="flex flex-row justify-between py-3 border-b">
                <CardTitle className="text-base font-semibold">Spare Parts</CardTitle>
                <Button size="sm" onClick={() => { setCurrentPart({ id: `P${Date.now()}`, name: "", quantity: 1, price: 0, taxPercent: 0 }); setIsPartModalOpen(true); }}><Plus className="w-4 h-4 mr-2"/> Add Part</Button>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                    <tr>
                        <th className="p-3 text-left font-medium text-muted-foreground">Item</th>
                        <th className="p-3 text-center font-medium text-muted-foreground">Qty</th>
                        <th className="p-3 text-right font-medium text-muted-foreground">Price</th>
                        <th className="p-3 text-right font-medium text-muted-foreground">Tax</th>
                        <th className="p-3 text-right font-medium text-muted-foreground">Total</th>
                        <th className="p-3"></th>
                    </tr>
                    </thead>
                    <tbody>
                    {jobCard?.spareParts.map((part) => {
                        const total = (part.price * part.quantity) * (1 + part.taxPercent/100);
                        return (
                        <tr key={part.id} className="border-b last:border-0 hover:bg-slate-50/50 transition-colors">
                            <td className="p-3 font-medium">{part.name}</td>
                            <td className="p-3 text-center">{part.quantity}</td>
                            <td className="p-3 text-right">₹{part.price}</td>
                            <td className="p-3 text-right">{part.taxPercent}%</td>
                            <td className="p-3 text-right font-semibold">₹{total.toFixed(2)}</td>
                            <td className="p-3 text-right">
                            <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600" onClick={() => { setCurrentPart(part); setIsPartModalOpen(true); }}><Edit2 className="w-3.5 h-3.5" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600" onClick={() => handleDeletePart(part.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                            </div>
                            </td>
                        </tr>
                        )
                    })}
                    {jobCard?.spareParts.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground italic">No parts added yet</td></tr>}
                    </tbody>
                </table>
                </div>
            </CardContent>
            </Card>
            
            {/* Services Table */}
            <Card>
            <CardHeader className="flex flex-row justify-between py-3 border-b">
                <CardTitle className="text-base font-semibold">Labor & Services</CardTitle>
                <Button size="sm" onClick={() => { setCurrentService({ id: `S${Date.now()}`, description: "", cost: 0, taxPercent: 0 }); setIsServiceModalOpen(true); }}><Plus className="w-4 h-4 mr-2"/> Add Service</Button>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                    <tr>
                        <th className="p-3 text-left font-medium text-muted-foreground">Description</th>
                        <th className="p-3 text-right font-medium text-muted-foreground">Cost</th>
                        <th className="p-3 text-right font-medium text-muted-foreground">Tax</th>
                        <th className="p-3 text-right font-medium text-muted-foreground">Total</th>
                        <th className="p-3"></th>
                    </tr>
                    </thead>
                    <tbody>
                    {jobCard?.services.map((svc) => {
                        const total = svc.cost * (1 + svc.taxPercent/100);
                        return (
                        <tr key={svc.id} className="border-b last:border-0 hover:bg-slate-50/50 transition-colors">
                            <td className="p-3 font-medium">{svc.description}</td>
                            <td className="p-3 text-right">₹{svc.cost}</td>
                            <td className="p-3 text-right">{svc.taxPercent}%</td>
                            <td className="p-3 text-right font-semibold">₹{total.toFixed(2)}</td>
                            <td className="p-3 text-right">
                            <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600" onClick={() => { setCurrentService(svc); setIsServiceModalOpen(true); }}><Edit2 className="w-3.5 h-3.5" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600" onClick={() => handleDeleteService(svc.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                            </div>
                            </td>
                        </tr>
                        )
                    })}
                    {jobCard?.services.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground italic">No services added yet</td></tr>}
                    </tbody>
                </table>
                </div>
            </CardContent>
            </Card>
        </div>

        {/* --- 5. Photos & Signature --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Car Photos</CardTitle>
              <Badge variant="secondary">{(jobCard.photos || []).length} Photos</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(jobCard.photos || []).length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    {jobCard.photos.map((photo, index) => (
                      <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border bg-slate-100 shadow-sm">
                        <img src={photo} alt={`Car photo ${index + 1}`} className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300" onClick={() => setPreviewPhoto(photo)} />
                        <button onClick={(e) => { e.stopPropagation(); removePhoto(index); }} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600" title="Remove photo"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="relative">
                  <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" disabled={isUploading} />
                  <div className={`flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors ${isUploading ? 'opacity-50' : ''}`}>
                    {isUploading ? (<><Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" /><p className="text-sm font-medium text-blue-600">Compressing & Uploading...</p></>) : (<><Upload className="w-8 h-8 text-muted-foreground mb-2" /><p className="text-sm font-medium text-foreground">Click to add photos</p><p className="text-xs text-muted-foreground">Supports JPG, PNG (Max 800px)</p></>)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">Customer Signature</CardTitle></CardHeader>
            <CardContent>
              <div className="w-full h-40 bg-muted border-dashed border-2 rounded-lg flex items-center justify-center text-muted-foreground"><Button variant="outline" onClick={() => setIsSignatureModalOpen(true)}>Capture Signature</Button></div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <Card className="bg-slate-900 text-white">
           <CardContent className="p-6 flex justify-between items-center">
              <div><p className="text-slate-400 text-sm">Total Estimate (Inc. Tax)</p><p className="text-3xl font-bold">₹{grandTotal.toFixed(2)}</p></div>
              <Button onClick={handleGenerateInvoice} className="bg-green-600 hover:bg-green-700 text-white"><FileText className="mr-2 h-4 w-4" /> Generate Invoice</Button>
           </CardContent>
        </Card>

        {/* Modals */}
        <Dialog open={isIssueModalOpen} onOpenChange={setIsIssueModalOpen}>
            <DialogContent>
                <DialogHeader><DialogTitle>{editingIssueIndex !== null ? "Edit Issue" : "Add Issue"}</DialogTitle></DialogHeader>
                <Input value={currentIssue} onChange={e => setCurrentIssue(e.target.value)} placeholder="Description" />
                <DialogFooter><Button onClick={handleSaveIssue}>Save</Button></DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog open={isWorkerModalOpen} onOpenChange={setIsWorkerModalOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingWorkerIndex !== null ? "Edit Technician" : "Assign Technician"}</DialogTitle></DialogHeader>
            <Input placeholder="Technician Name" value={currentWorker} onChange={e => setCurrentWorker(e.target.value)} />
            <DialogFooter><Button onClick={handleSaveWorker}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Parts & Services Modals */}
        <Dialog open={isPartModalOpen} onOpenChange={setIsPartModalOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Spare Part</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2"><Label>Part Name</Label><Input placeholder="Part Name" value={currentPart.name} onChange={e => setCurrentPart({ ...currentPart, name: e.target.value })} /></div>
              <div className="grid grid-cols-3 gap-3">
                 <div className="space-y-2"><Label>Quantity</Label><Input type="number" placeholder="0" value={currentPart.quantity === 0 ? "" : currentPart.quantity} onChange={e => setCurrentPart({ ...currentPart, quantity: parseFloat(e.target.value) || 0 })} /></div>
                 <div className="space-y-2"><Label>Unit Price</Label><Input type="number" placeholder="0" value={currentPart.price === 0 ? "" : currentPart.price} onChange={e => setCurrentPart({ ...currentPart, price: parseFloat(e.target.value) || 0 })} /></div>
                 <div className="space-y-2"><Label>Tax %</Label><Input type="number" placeholder="0" value={currentPart.taxPercent === 0 ? "" : currentPart.taxPercent} onChange={e => setCurrentPart({ ...currentPart, taxPercent: parseFloat(e.target.value) || 0 })} /></div>
              </div>
            </div>
            <DialogFooter><Button onClick={handleSavePart}>Save Part</Button></DialogFooter>
          </DialogContent>
        </Dialog>

         <Dialog open={isServiceModalOpen} onOpenChange={setIsServiceModalOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Service</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2"><Label>Service Description</Label><Input placeholder="Service Description" value={currentService.description} onChange={e => setCurrentService({ ...currentService, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-2"><Label>Cost</Label><Input type="number" placeholder="0" value={currentService.cost === 0 ? "" : currentService.cost} onChange={e => setCurrentService({ ...currentService, cost: parseFloat(e.target.value) || 0 })} /></div>
                 <div className="space-y-2"><Label>Tax %</Label><Input type="number" placeholder="0" value={currentService.taxPercent === 0 ? "" : currentService.taxPercent} onChange={e => setCurrentService({ ...currentService, taxPercent: parseFloat(e.target.value) || 0 })} /></div>
              </div>
            </div>
            <DialogFooter><Button onClick={handleSaveService}>Save Service</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isSignatureModalOpen} onOpenChange={setIsSignatureModalOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Customer Signature</DialogTitle></DialogHeader>
            <div className="py-4"><div className="w-full h-48 bg-muted border-dashed border-2 rounded-lg flex items-center justify-center text-muted-foreground">Signature Pad Placeholder</div></div>
            <DialogFooter><Button variant="outline" onClick={() => setIsSignatureModalOpen(false)}>Cancel</Button><Button onClick={() => setIsSignatureModalOpen(false)}>Save Signature</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!previewPhoto} onOpenChange={(open) => !open && setPreviewPhoto(null)}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/90 border-none">
             <div className="relative w-full h-[80vh] flex items-center justify-center">
                <button onClick={() => setPreviewPhoto(null)} className="absolute top-4 right-4 z-50 bg-black/50 text-white p-2 rounded-full hover:bg-white/20"><X className="w-6 h-6" /></button>
                {previewPhoto && (<img src={previewPhoto} alt="Preview" className="max-w-full max-h-full object-contain" />)}
             </div>
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  )
}