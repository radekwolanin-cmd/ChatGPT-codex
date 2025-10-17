"use client";

import { useState, useTransition } from "react";
import { EstimateStatus } from "@prisma/client";
import type {
  ProjectStatus,
  ProjectPriority,
  Estimate,
  EstimateType,
  Order,
  Activity,
  Attachment,
  Comment,
} from "@prisma/client";
import { StatusBadge } from "@/components/ui/status-pill";
import { PriorityBadge } from "@/components/ui/priority-pill";
import { TagInput } from "@/components/ui/tag-input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

interface SerializableProject {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  deadline: string | null;
  budgetVendor: string | null;
  budgetInternal: string | null;
  budgetCustomer: string | null;
  customer: { name: string | null; email: string | null; phone: string | null } | null;
  tags: { tag: string }[];
  attachments: Attachment[];
  comments: (Comment & { author: { name: string | null; email: string | null } })[];
  estimates: Estimate[];
  orders: Order[];
  activity: (Activity & { actor: { name: string | null } })[];
}

const tabs = ["overview", "attachments", "comments", "estimates", "orders", "financials", "activity"] as const;

type TabKey = (typeof tabs)[number];

export function ProjectDetailClient({ project }: { project: SerializableProject }) {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [, startTransition] = useTransition();
  const [localProject, setLocalProject] = useState(project);
  const [newComment, setNewComment] = useState("");

  function updateProject(data: Partial<SerializableProject>) {
    setLocalProject((prev) => ({ ...prev, ...data }));
    startTransition(async () => {
      await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...("status" in data ? { status: data.status } : {}),
          ...("priority" in data ? { priority: data.priority } : {}),
          ...("deadline" in data ? { deadline: data.deadline } : {}),
          ...("description" in data ? { description: data.description } : {}),
          ...("tags" in data ? { tags: data.tags?.map((tag) => tag.tag) } : {}),
        }),
      });
    });
  }

  async function handleCommentSubmit() {
    if (!newComment.trim()) return;
    const body = newComment;
    setNewComment("");
    const response = await fetch(`/api/projects/${project.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    const json = await response.json();
    setLocalProject((prev) => ({ ...prev, comments: [...prev.comments, json.data] }));
  }

  async function handleAttachmentUpload(files: FileList | null) {
    if (!files?.length) return;
    const file = files[0];
    const prepareRes = await fetch(`/api/projects/${project.id}/attachments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      }),
    });
    const prepareJson = await prepareRes.json();
    await fetch(prepareJson.data.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    const finalizeRes = await fetch(`/api/projects/${project.id}/attachments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        url: prepareJson.data.pathname,
      }),
    });
    const finalizeJson = await finalizeRes.json();
    setLocalProject((prev) => ({ ...prev, attachments: [finalizeJson.data, ...prev.attachments] }));
  }

  async function handleEstimateCreate(type: EstimateType) {
    const res = await fetch(`/api/projects/${project.id}/estimates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        title: `${type === "VENDOR" ? "Vendor" : "Customer"} Estimate`,
        amount: 1000,
        currency: "USD",
        status: EstimateStatus.DRAFT,
      }),
    });
    const json = await res.json();
    setLocalProject((prev) => ({ ...prev, estimates: [json.data, ...prev.estimates] }));
  }

  async function handleOrderCreate() {
    const res = await fetch(`/api/projects/${project.id}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vendor: "Vendor",
        reference: `PO-${Date.now()}`,
        subtotal: 500,
        tax: 50,
        total: 550,
        status: "DRAFT",
      }),
    });
    const json = await res.json();
    setLocalProject((prev) => ({ ...prev, orders: [json.data, ...prev.orders] }));
  }

  const vendorEstimates = localProject.estimates.filter((e) => e.type === "VENDOR");
  const customerEstimates = localProject.estimates.filter((e) => e.type === "CUSTOMER");
  const vendorTotal = vendorEstimates.reduce((acc, estimate) => acc + Number(estimate.amount), 0);
  const customerTotal = customerEstimates.reduce((acc, estimate) => acc + Number(estimate.amount), 0);
  const orderTotal = localProject.orders.reduce((acc, order) => acc + Number(order.total), 0);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-card dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">{localProject.name}</h1>
            <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">{localProject.description || "No description yet."}</p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-300">
              <StatusBadge status={localProject.status} />
              <PriorityBadge priority={localProject.priority} />
              {localProject.deadline && (
                <Badge variant="outline">Due {format(new Date(localProject.deadline), "PPP")}</Badge>
              )}
              {localProject.customer && (
                <Badge variant="outline">Customer: {localProject.customer.name}</Badge>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <select
              value={localProject.status}
              onChange={(event) => updateProject({ status: event.target.value as ProjectStatus })}
              className="rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-700 dark:border-white/20 dark:bg-white/10 dark:text-white"
            >
              {(["TO_DO", "IN_PROGRESS", "DONE"] as ProjectStatus[]).map((status) => (
                <option key={status} value={status}>
                  {status.replace("_", " ")}
                </option>
              ))}
            </select>
            <select
              value={localProject.priority}
              onChange={(event) => updateProject({ priority: event.target.value as ProjectPriority })}
              className="rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-700 dark:border-white/20 dark:bg-white/10 dark:text-white"
            >
              {(["LOW", "MEDIUM", "HIGH", "URGENT"] as ProjectPriority[]).map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
            <TagInput
              value={localProject.tags.map((tag) => tag.tag)}
              onChange={(tags) => {
                const nextTags: SerializableProject["tags"] = tags.map((tag) => ({ tag }));
                setLocalProject((prev) => ({ ...prev, tags: nextTags }));
                updateProject({ tags: nextTags });
              }}
            />
          </div>
        </div>
      </div>

      <nav className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={twMerge(
              "rounded-full px-4 py-2 text-sm capitalize transition",
              activeTab === tab
                ? "bg-brand-500 text-white shadow-card"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
            )}
          >
            {tab}
          </button>
        ))}
      </nav>

      <section className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-card dark:border-white/10 dark:bg-white/5">
        {activeTab === "overview" && (
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Summary</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Deadline: {localProject.deadline ? format(new Date(localProject.deadline), "PPP") : "No deadline"}
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Customer contact: {localProject.customer?.email ?? "Not provided"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Budgets</h3>
              <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                <li>Vendor budget: ${localProject.budgetVendor ?? "0"}</li>
                <li>Internal budget: ${localProject.budgetInternal ?? "0"}</li>
                <li>Customer budget: ${localProject.budgetCustomer ?? "0"}</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === "attachments" && (
          <div className="space-y-4">
            <label className="flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-100 p-6 text-sm text-slate-600 hover:border-slate-400 hover:bg-slate-200 dark:border-white/20 dark:bg-white/5 dark:text-slate-300 dark:hover:border-white/40">
              <input type="file" className="hidden" onChange={(event) => handleAttachmentUpload(event.target.files)} />
              Upload new attachment
            </label>
            <div className="grid gap-4 md:grid-cols-3">
              {localProject.attachments.map((attachment) => (
                <a
                  key={attachment.id}
                  href={attachment.url}
                  target="_blank"
                  className="rounded-2xl border border-slate-200/70 bg-white p-4 text-sm text-slate-800 hover:border-brand-400 dark:border-white/10 dark:bg-slate-950/70 dark:text-white"
                >
                  <div className="font-semibold">{attachment.fileName}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{(attachment.fileSize / 1024).toFixed(1)} KB</div>
                </a>
              ))}
            </div>
          </div>
        )}

        {activeTab === "comments" && (
          <div className="space-y-4">
            <div className="space-y-3">
              {localProject.comments.map((comment) => (
                <div key={comment.id} className="rounded-2xl border border-slate-200/70 bg-white p-4 text-sm text-slate-800 dark:border-white/10 dark:bg-slate-950/70 dark:text-white">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{comment.author.name ?? comment.author.email}</span>
                    <time>{format(new Date(comment.createdAt), "PPP p")}</time>
                  </div>
                  <p className="mt-2 text-slate-700 dark:text-slate-100">{comment.body}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-white p-4 dark:border-white/10 dark:bg-slate-950/70">
              <textarea
                value={newComment}
                onChange={(event) => setNewComment(event.target.value)}
                placeholder="Add a comment"
                className="w-full rounded-xl border border-slate-200/70 bg-slate-100 p-3 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
              <button
                onClick={handleCommentSubmit}
                className="mt-3 rounded-full bg-brand-500 px-4 py-2 text-sm text-white hover:bg-brand-400"
              >
                Post comment
              </button>
            </div>
          </div>
        )}

        {activeTab === "estimates" && (
          <div className="space-y-6 text-sm text-slate-700 dark:text-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Vendor estimates</h3>
              <button
                onClick={() => handleEstimateCreate("VENDOR")}
                className="rounded-full bg-brand-500 px-4 py-2 text-xs text-white hover:bg-brand-400"
              >
                Add vendor estimate
              </button>
            </div>
            <table className="min-w-full divide-y divide-slate-200 dark:divide-white/10">
              <thead className="text-xs uppercase text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3 text-left">Title</th>
                  <th className="py-3 text-left">Amount</th>
                  <th className="py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {vendorEstimates.map((estimate) => (
                  <tr key={estimate.id} className="border-b border-slate-200 dark:border-white/5">
                    <td className="py-2">{estimate.title}</td>
                    <td className="py-2">${Number(estimate.amount).toFixed(2)}</td>
                    <td className="py-2 text-xs text-slate-500 dark:text-slate-400">{estimate.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Customer estimates</h3>
              <button
                onClick={() => handleEstimateCreate("CUSTOMER")}
                className="rounded-full bg-brand-500 px-4 py-2 text-xs text-white hover:bg-brand-400"
              >
                Add customer estimate
              </button>
            </div>
            <table className="min-w-full divide-y divide-slate-200 dark:divide-white/10">
              <thead className="text-xs uppercase text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3 text-left">Title</th>
                  <th className="py-3 text-left">Amount</th>
                  <th className="py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {customerEstimates.map((estimate) => (
                  <tr key={estimate.id} className="border-b border-slate-200 dark:border-white/5">
                    <td className="py-2">{estimate.title}</td>
                    <td className="py-2">${Number(estimate.amount).toFixed(2)}</td>
                    <td className="py-2 text-xs text-slate-500 dark:text-slate-400">{estimate.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-4 text-sm text-slate-700 dark:text-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Orders</h3>
              <button
                onClick={handleOrderCreate}
                className="rounded-full bg-brand-500 px-4 py-2 text-xs text-white hover:bg-brand-400"
              >
                Create order
              </button>
            </div>
            <table className="min-w-full divide-y divide-slate-200 dark:divide-white/10">
              <thead className="text-xs uppercase text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3 text-left">Reference</th>
                  <th className="py-3 text-left">Vendor</th>
                  <th className="py-3 text-left">Total</th>
                  <th className="py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {localProject.orders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-200 dark:border-white/5">
                    <td className="py-2">{order.reference}</td>
                    <td className="py-2">{order.vendor}</td>
                    <td className="py-2">${Number(order.total).toFixed(2)}</td>
                    <td className="py-2 text-xs text-slate-500 dark:text-slate-400">{order.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "financials" && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200/70 bg-white p-4 dark:border-white/10 dark:bg-slate-950/70">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Totals</h3>
              <ul className="mt-3 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                <li>Vendor estimates: ${vendorTotal.toFixed(2)}</li>
                <li>Customer estimates: ${customerTotal.toFixed(2)}</li>
                <li>Orders total: ${orderTotal.toFixed(2)}</li>
                <li>
                  Margin estimate: ${(customerTotal - vendorTotal).toFixed(2)}
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-white p-4 dark:border-white/10 dark:bg-slate-950/70">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Notes</h3>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                Adjust margins by negotiating vendor costs or updating customer estimates. Use orders to track actual spend.
              </p>
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-200">
            {localProject.activity.map((event) => (
              <li key={event.id} className="rounded-2xl border border-slate-200/70 bg-white p-4 dark:border-white/10 dark:bg-slate-950/70">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>{event.actor?.name ?? "System"}</span>
                  <time>{format(new Date(event.createdAt), "PPP p")}</time>
                </div>
                <pre className="mt-2 text-xs text-slate-600 dark:text-slate-300">{JSON.stringify(event.payload, null, 2)}</pre>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
