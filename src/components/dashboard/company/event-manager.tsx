"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Users } from "lucide-react";

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
  registrationUrl: string | null;
  capacity: number | null;
  registrationCount: number;
}

const EVENT_TYPES = [
  "WORKSHOP",
  "WEBINAR",
  "MEETUP",
  "HACKATHON",
  "CAREER_FAIR",
  "TECH_TALK",
  "NETWORKING",
  "OTHER",
];

export function EventManager() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Add form state
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newType, setNewType] = useState("WORKSHOP");
  const [newDate, setNewDate] = useState("");
  const [newStartTime, setNewStartTime] = useState("");
  const [newEndTime, setNewEndTime] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newIsOnline, setNewIsOnline] = useState(false);
  const [newCapacity, setNewCapacity] = useState("");

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editType, setEditType] = useState("WORKSHOP");
  const [editDate, setEditDate] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editIsOnline, setEditIsOnline] = useState(false);
  const [editCapacity, setEditCapacity] = useState("");

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/company/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  async function handleAdd() {
    if (!newTitle || !newDate || !newStartTime) {
      toast.error("Title, date, and start time are required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/dashboard/company/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription || null,
          type: newType,
          date: newDate,
          startTime: newStartTime,
          endTime: newEndTime || null,
          location: newLocation || null,
          isOnline: newIsOnline,
          capacity: newCapacity || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to create event");
      toast.success("Event created");
      setNewTitle("");
      setNewDescription("");
      setNewType("WORKSHOP");
      setNewDate("");
      setNewStartTime("");
      setNewEndTime("");
      setNewLocation("");
      setNewIsOnline(false);
      setNewCapacity("");
      setAddOpen(false);
      fetchEvents();
    } catch {
      toast.error("Failed to create event");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit() {
    if (!editingEvent) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/dashboard/company/events/${editingEvent.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: editTitle,
            description: editDescription || null,
            type: editType,
            date: editDate,
            startTime: editStartTime,
            endTime: editEndTime || null,
            location: editLocation || null,
            isOnline: editIsOnline,
            capacity: editCapacity || null,
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to update event");
      toast.success("Event updated");
      setEditOpen(false);
      setEditingEvent(null);
      fetchEvents();
    } catch {
      toast.error("Failed to update event");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/dashboard/company/events/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete event");
      toast.success("Event deleted");
      fetchEvents();
    } catch {
      toast.error("Failed to delete event");
    }
  }

  function openEdit(event: EventData) {
    setEditingEvent(event);
    setEditTitle(event.title);
    setEditDescription(event.description || "");
    setEditType(event.type);
    setEditDate(event.date.split("T")[0]);
    setEditStartTime(event.startTime);
    setEditEndTime(event.endTime || "");
    setEditLocation(event.location || "");
    setEditIsOnline(event.isOnline);
    setEditCapacity(event.capacity?.toString() || "");
    setEditOpen(true);
  }

  const typeLabel = (type: string) => type.replace(/_/g, " ");

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Events ({events.length})
        </h3>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger
            render={
              <Button size="sm">
                <Plus className="size-4" />
                Add Event
              </Button>
            }
          />
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Event</DialogTitle>
            </DialogHeader>
            <div className="max-h-[60vh] space-y-4 overflow-y-auto py-2 pr-1">
              <div className="space-y-2">
                <Label htmlFor="add-event-title">Title</Label>
                <Input
                  id="add-event-title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Tech Talk: AI in Production"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-event-desc">Description</Label>
                <Textarea
                  id="add-event-desc"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Event description..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={newType} onValueChange={(v) => v !== null && setNewType(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {typeLabel(t)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="add-event-date">Date</Label>
                  <Input
                    id="add-event-date"
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-event-start">Start Time</Label>
                  <Input
                    id="add-event-start"
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="add-event-end">End Time</Label>
                  <Input
                    id="add-event-end"
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-event-capacity">Capacity</Label>
                  <Input
                    id="add-event-capacity"
                    type="number"
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(e.target.value)}
                    placeholder="e.g. 100"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-event-location">Location</Label>
                <Input
                  id="add-event-location"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g. Dublin Convention Centre"
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={newIsOnline}
                  onCheckedChange={setNewIsOnline}
                />
                <Label>Online Event</Label>
              </div>
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Cancel
              </DialogClose>
              <Button onClick={handleAdd} disabled={submitting}>
                {submitting && <Loader2 className="size-4 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {events.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-muted-foreground">
            No events yet. Create your first event to engage with candidates.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Registrations</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{typeLabel(event.type)}</Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(event.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {event.isOnline
                      ? "Online"
                      : event.location || "Not specified"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Users className="size-3.5 text-muted-foreground" />
                      <span className="font-display text-sm">
                        {event.registrationCount}
                      </span>
                      {event.capacity && (
                        <span className="text-muted-foreground">
                          / {event.capacity}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
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
                        onClick={() => handleDelete(event.id)}
                      >
                        <Trash2 className="size-3.5 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] space-y-4 overflow-y-auto py-2 pr-1">
            <div className="space-y-2">
              <Label htmlFor="edit-event-title">Title</Label>
              <Input
                id="edit-event-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-event-desc">Description</Label>
              <Textarea
                id="edit-event-desc"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={editType} onValueChange={(v) => v !== null && setEditType(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {typeLabel(t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="edit-event-date">Date</Label>
                <Input
                  id="edit-event-date"
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-event-start">Start Time</Label>
                <Input
                  id="edit-event-start"
                  type="time"
                  value={editStartTime}
                  onChange={(e) => setEditStartTime(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="edit-event-end">End Time</Label>
                <Input
                  id="edit-event-end"
                  type="time"
                  value={editEndTime}
                  onChange={(e) => setEditEndTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-event-capacity">Capacity</Label>
                <Input
                  id="edit-event-capacity"
                  type="number"
                  value={editCapacity}
                  onChange={(e) => setEditCapacity(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-event-location">Location</Label>
              <Input
                id="edit-event-location"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={editIsOnline}
                onCheckedChange={setEditIsOnline}
              />
              <Label>Online Event</Label>
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button onClick={handleEdit} disabled={submitting}>
              {submitting && <Loader2 className="size-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
