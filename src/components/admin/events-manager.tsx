"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Calendar, MapPin, Users, Globe } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
        <Label>Title</Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Event title"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Event description..."
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Type</Label>
          <Select
            value={formData.type}
            onValueChange={(v) => setFormData({ ...formData, type: v })}
          >
            <SelectTrigger>
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
          <Label>Date</Label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Start Time</Label>
          <Input
            type="time"
            value={formData.startTime}
            onChange={(e) =>
              setFormData({ ...formData, startTime: e.target.value })
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label>End Time</Label>
          <Input
            type="time"
            value={formData.endTime}
            onChange={(e) =>
              setFormData({ ...formData, endTime: e.target.value })
            }
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Location</Label>
        <Input
          value={formData.location}
          onChange={(e) =>
            setFormData({ ...formData, location: e.target.value })
          }
          placeholder="Venue or address"
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
          <Label>Online Event</Label>
        </div>
        <div className="space-y-1.5">
          <Label>Capacity</Label>
          <Input
            type="number"
            value={formData.capacity}
            onChange={(e) =>
              setFormData({ ...formData, capacity: e.target.value })
            }
            placeholder="Optional"
          />
        </div>
      </div>
      <DialogFooter>
        <DialogClose>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button onClick={onSubmit}>{submitLabel}</Button>
      </DialogFooter>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Events
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage all events (company and platform)
          </p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger>
            <Button size="sm">
              <Plus className="size-4 mr-1" />
              Add Platform Event
            </Button>
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Host</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Registrations</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground py-8"
                >
                  No events found
                </TableCell>
              </TableRow>
            ) : (
              events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {eventTypeLabels[event.type] || event.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    {event.companyId ? (
                      event.companyName
                    ) : (
                      <Badge className="bg-[#9fef00]/20 text-[#9fef00]">
                        Platform
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
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
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Users className="size-3 text-muted-foreground" />
                      {event.registrations}
                      {event.capacity && (
                        <span className="text-muted-foreground">
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
                        onClick={() => openEdit(event)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-red-400 hover:text-red-300"
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
