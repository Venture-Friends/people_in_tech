"use client";

import { useState, useEffect, useCallback } from "react";
import { Send, Eye, Mail, Clock, Users, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
        <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Newsletters
        </h2>
        <p className="text-sm text-white/[0.35] mt-1">
          Compose and send newsletters to candidates
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Composer */}
        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-5">
          <div className="mb-4">
            <h3 className="font-display text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
              <FileText className="size-4 text-white/30" />
              Compose Newsletter
            </h3>
            <p className="text-xs text-white/30 mt-0.5">
              Write content and preview before sending
            </p>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nl-subject" className="text-white/[0.35] text-xs">Subject</Label>
              <Input
                id="nl-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Newsletter subject line"
                className="rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nl-content" className="text-white/[0.35] text-xs">Content (HTML or plain text)</Label>
              <Textarea
                id="nl-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your newsletter content here..."
                className="min-h-[200px] rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg border-white/[0.07] text-white/40 hover:text-white/60"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="size-4 mr-1" />
                {showPreview ? "Hide Preview" : "Preview"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg border-white/[0.07] text-white/40 hover:text-white/60"
                onClick={handleSave}
              >
                Save Draft
              </Button>
              <Button
                size="sm"
                className="bg-primary text-primary-foreground rounded-lg"
                onClick={handleSaveAndSend}
                disabled={sending || !subject || !content}
              >
                <Send className="size-4 mr-1" />
                Send to All
              </Button>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-5">
          <div className="mb-4">
            <h3 className="font-display text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Eye className="size-4 text-white/30" />
              Preview
            </h3>
          </div>
          {showPreview && (subject || content) ? (
            <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-white/30">
                <Mail className="size-4" />
                Newsletter Preview
              </div>
              <div className="h-px bg-white/[0.04]" />
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
            <div className="flex flex-col items-center justify-center py-12 text-center text-white/30">
              <Eye className="size-8 mb-2 opacity-40" />
              <p className="text-sm">
                Click &quot;Preview&quot; to see your newsletter here
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Past newsletters */}
      <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-5">
        <div className="mb-4">
          <h3 className="font-display text-base font-semibold tracking-tight text-foreground">
            Past Newsletters
          </h3>
          <p className="text-xs text-white/30 mt-0.5">
            History of all newsletters created on the platform
          </p>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : newsletters.length === 0 ? (
          <p className="text-sm text-white/30 py-4 text-center">
            No newsletters yet
          </p>
        ) : (
          <div className="rounded-xl border border-white/[0.05] overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-white/[0.04] hover:bg-transparent">
                  <TableHead className="text-[11px] uppercase tracking-wider text-white/30 bg-white/[0.02]">Subject</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider text-white/30 bg-white/[0.02]">Status</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider text-white/30 bg-white/[0.02]">Recipients</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider text-white/30 bg-white/[0.02]">Created</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider text-white/30 bg-white/[0.02] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {newsletters.map((nl) => (
                  <TableRow key={nl.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <TableCell className="font-medium text-[13px]">{nl.subject}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                          nl.status === "SENT"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {nl.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {nl.recipientCount !== null ? (
                        <span className="flex items-center gap-1 text-[13px] text-white/[0.35]">
                          <Users className="size-3" />
                          {nl.recipientCount}
                        </span>
                      ) : (
                        <span className="text-white/30 text-[13px]">--</span>
                      )}
                    </TableCell>
                    <TableCell className="text-[13px] text-white/[0.35]">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {new Date(nl.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {nl.status === "DRAFT" && (
                        <Button
                          size="sm"
                          className="bg-primary text-primary-foreground rounded-lg"
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
          </div>
        )}
      </div>
    </div>
  );
}
