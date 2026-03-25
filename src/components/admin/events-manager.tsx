"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Calendar, MapPin, Users, Globe } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface EventData {
  id: string;
  title: string;
  description: string | null;
  type: string;
  date: string;
  startTime: string;
  endTime: string | null;
  location: string | null;
  isOnline: boolean;
  capacity: number | null;
  companyId: string | null;
  companyName: string;
  registrations: number;
  createdAt: string;
}

const eventTypeLabels: Record<string, string> = {
  WORKSHOP: "Workshop",
  WEBINAR: "Webinar",
  CAREER_FAIR: "Career Fair",
  MEETUP: "Meetup",
  CONFERENCE: "Conference",
  HACKATHON: "Hackathon",
};

const eventTypeColors: Record<string, string> = {
  WORKSHOP: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  WEBINAR: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
  CAREER_FAIR: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  MEETUP: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  CONFERENCE: "bg-rose-500/20 text-rose-400 border border-rose-500/30",
  HACKATHON: "bg-teal-500/20 text-teal-400 border border-teal-500/30",
};

const defaultForm = {
  title: "",
  description: "",
  type: "WORKSHOP",
  date: "",
  startTime: "",
  endTime: "",
  location: "",
  isOnline: false,
  capacity: "",
};

export function EventsManager() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const [formData, setFormData] = useState(defaultForm);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/events");
      const data = await res.json();
      setEvents(data.events || []);
    } catch {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleAdd = async () => {
    if (!formData.title || !formData.date || !formData.startTime) {
      toast.error("Title, date, and start time are required");
      return;
    }
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to create event");
        return;
      }
      toast.success("Platform event created");
      setAddDialogOpen(false);
      setFormData(defaultForm);
      fetchEvents();
    } catch {
      toast.error("Failed to create event");
    }
  };

  const handleEdit = async () => {
    if (!editingEvent) return;
    try {
      const res = await fetch(`/api/admin/events/${editingEvent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        toast.error("Failed to update event");
        return;
      }
      toast.success("Event updated");
      setEditDialogOpen(false);
      setEditingEvent(null);
      fetchEvents();
    } catch {
      toast.error("Failed to update event");
    }
  };

  const handleDelete = async (event: EventData) => {
    if (!confirm(`Delete "${event.title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/events/${event.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        toast.error("Failed to delete event");
        return;
      }
      toast.success("Event deleted");
      fetchEvents();
    } catch {
      toast.error("Failed to delete event");
    }
  };

  const openEdit = (event: EventData) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || "",
      type: event.type,
      date: event.date.split("T")[0],
      startTime: event.startTime,
      endTime: event.endTime || "",
      location: event.location || "",
      isOnline: event.isOnline,
      capacity: event.capacity?.toString() || "",
    });
    setEditDialogOpen(true);
  };

  const EventForm = ({ onSubmit, submitLabel }: { onSubmit: () => void; submitLabel: string }) => (
    <div className="space-y-4 py-2">
      <div className="space-y-1.5">
        <Label className="text-white/[0.35] text-xs">Title</Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Event title"
          className="rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-white/[0.35] text-xs">Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Event description..."
          className="rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-white/[0.35] text-xs">Type</Label>
          <Select
            value={formData.type}
            onValueChange={(v) => v !== null && setFormData({ ...formData, type: v })}
          >
            <SelectTrigger className="rounded-[14px] border-white/[0.07] bg-white/[0.03]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(eventTypeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-white/[0.35] text-xs">Date</Label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-white/[0.35] text-xs">Start Time</Label>
          <Input
            type="time"
            value={formData.startTime}
            onChange={(e) =>
              setFormData({ ...formData, startTime: e.target.value })
            }
            className="rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-white/[0.35] text-xs">End Time</Label>
          <Input
            type="time"
            value={formData.endTime}
            onChange={(e) =>
              setFormData({ ...formData, endTime: e.target.value })
            }
            className="rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-white/[0.35] text-xs">Location</Label>
        <Input
          value={formData.location}
          onChange={(e) =>
            setFormData({ ...formData, location: e.target.value })
          }
          placeholder="Venue or address"
          className="rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2">
          <Switch
            checked={formData.isOnline}
            onCheckedChange={(checked: boolean) =>
              setFormData({ ...formData, isOnline: checked })
            }
            size="sm"
          />
          <Label className="text-white/[0.35] text-xs">Online Event</Label>
        </div>
        <div className="space-y-1.5">
          <Label className="text-white/[0.35] text-xs">Capacity</Label>
          <Input
            type="number"
            value={formData.capacity}
            onChange={(e) =>
              setFormData({ ...formData, capacity: e.target.value })
            }
            placeholder="Optional"
            className="rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
          />
        </div>
      </div>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" className="rounded-lg" />}>
          Cancel
        </DialogClose>
        <Button onClick={onSubmit} className="bg-primary text-primary-foreground rounded-lg">{submitLabel}</Button>
      </DialogFooter>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Events
          </h2>
          <p className="text-sm text-white/[0.35] mt-1">
            Manage all events (company and platform)
          </p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger
            render={<Button size="sm" className="bg-primary text-primary-foreground rounded-lg" />}
          >
            <Plus className="size-4 mr-1" />
            Add Platform Event
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Platform Event</DialogTitle>
            </DialogHeader>
            <EventForm onSubmit={handleAdd} submitLabel="Create Event" />
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-white/[0.04] hover:bg-transparent">
                <TableHead className="text-[11px] uppercase tracking-wider text-white/30 bg-white/[0.02]">Title</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-white/30 bg-white/[0.02]">Type</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-white/30 bg-white/[0.02]">Date</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-white/30 bg-white/[0.02]">Host</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-white/30 bg-white/[0.02]">Location</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-white/30 bg-white/[0.02] text-right">Registrations</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-white/30 bg-white/[0.02] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.length === 0 ? (
                <TableRow className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <TableCell
                    colSpan={7}
                    className="text-center text-white/30 py-8"
                  >
                    No events found
                  </TableCell>
                </TableRow>
              ) : (
                events.map((event) => (
                  <TableRow key={event.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <TableCell className="font-medium text-[13px]">{event.title}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                          eventTypeColors[event.type] || "bg-white/[0.05] text-white/30"
                        }`}
                      >
                        {eventTypeLabels[event.type] || event.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-[13px] text-white/[0.35]">
                      <div className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-[13px]">
                      {event.companyId ? (
                        event.companyName
                      ) : (
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-primary/20 text-primary border border-primary/30">
                          Platform
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-[13px] text-white/[0.35]">
                      <div className="flex items-center gap-1">
                        {event.isOnline ? (
                          <>
                            <Globe className="size-3" />
                            Online
                          </>
                        ) : (
                          <>
                            <MapPin className="size-3" />
                            {event.location || "TBD"}
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-[13px]">
                      <div className="flex items-center justify-end gap-1">
                        <Users className="size-3 text-white/30" />
                        {event.registrations}
                        {event.capacity && (
                          <span className="text-white/30">
                            /{event.capacity}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-white/30 hover:text-white/60"
                          onClick={() => openEdit(event)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-red-400/60 hover:text-red-400"
                          onClick={() => handleDelete(event)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          <EventForm onSubmit={handleEdit} submitLabel="Save Changes" />
        </DialogContent>
      </Dialog>
    </div>
  );
}
