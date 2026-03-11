"use client";

import { useState, useEffect, useCallback } from "react";
import { Send, Eye, Mail, Clock, Users, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface Newsletter {
  id: string;
  subject: string;
  content: string;
  status: string;
  sentAt: string | null;
  recipientCount: number | null;
  createdBy: string;
  createdAt: string;
}

export function NewsletterComposer() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");

  const fetchNewsletters = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/newsletters");
      const data = await res.json();
      setNewsletters(data.newsletters || []);
    } catch {
      toast.error("Failed to load newsletters");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNewsletters();
  }, [fetchNewsletters]);

  const handleSave = async () => {
    if (!subject || !content) {
      toast.error("Subject and content are required");
      return;
    }
    try {
      const res = await fetch("/api/admin/newsletters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, content }),
      });
      if (!res.ok) {
        toast.error("Failed to save newsletter");
        return;
      }
      const data = await res.json();
      toast.success("Newsletter saved as draft");
      setSubject("");
      setContent("");
      setShowPreview(false);
      fetchNewsletters();
      return data.newsletter;
    } catch {
      toast.error("Failed to save newsletter");
      return null;
    }
  };

  const handleSendNewsletter = async (id: string) => {
    if (
      !confirm("Send this newsletter to all candidates? This action is mocked.")
    )
      return;

    setSending(true);
    try {
      const res = await fetch(`/api/admin/newsletters/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send" }),
      });
      if (!res.ok) {
        toast.error("Failed to send newsletter");
        return;
      }
      const data = await res.json();
      toast.success(data.message || "Newsletter sent!");
      fetchNewsletters();
    } catch {
      toast.error("Failed to send newsletter");
    } finally {
      setSending(false);
    }
  };

  const handleSaveAndSend = async () => {
    const newsletter = await handleSave();
    if (newsletter?.id) {
      await handleSendNewsletter(newsletter.id);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Newsletters
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Compose and send newsletters to candidates
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Composer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-4" />
              Compose Newsletter
            </CardTitle>
            <CardDescription>
              Write content and preview before sending
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="nl-subject">Subject</Label>
                <Input
                  id="nl-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Newsletter subject line"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="nl-content">Content (HTML or plain text)</Label>
                <Textarea
                  id="nl-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your newsletter content here..."
                  className="min-h-[200px]"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="size-4 mr-1" />
                  {showPreview ? "Hide Preview" : "Preview"}
                </Button>
                <Button variant="outline" size="sm" onClick={handleSave}>
                  Save Draft
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveAndSend}
                  disabled={sending || !subject || !content}
                >
                  <Send className="size-4 mr-1" />
                  Send to All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="size-4" />
              Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showPreview && (subject || content) ? (
              <div className="rounded-lg border border-border bg-background p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="size-4" />
                  Newsletter Preview
                </div>
                <Separator />
                <h3 className="text-lg font-semibold text-foreground">
                  {subject || "(No subject)"}
                </h3>
                <div
                  className="prose prose-sm dark:prose-invert max-w-none text-foreground"
                  dangerouslySetInnerHTML={{
                    __html: content || "<p>No content yet...</p>",
                  }}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Eye className="size-8 mb-2 opacity-40" />
                <p className="text-sm">
                  Click &quot;Preview&quot; to see your newsletter here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Past newsletters */}
      <Card>
        <CardHeader>
          <CardTitle>Past Newsletters</CardTitle>
          <CardDescription>
            History of all newsletters created on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : newsletters.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No newsletters yet
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {newsletters.map((nl) => (
                  <TableRow key={nl.id}>
                    <TableCell className="font-medium">{nl.subject}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          nl.status === "SENT"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-amber-500/20 text-amber-400"
                        }
                      >
                        {nl.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {nl.recipientCount !== null ? (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Users className="size-3" />
                          {nl.recipientCount}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">--</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {new Date(nl.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {nl.status === "DRAFT" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSendNewsletter(nl.id)}
                          disabled={sending}
                        >
                          <Send className="size-3 mr-1" />
                          Send
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
