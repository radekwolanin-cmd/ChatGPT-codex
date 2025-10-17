import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listCustomers, createCustomer } from "@/server/services/project-service";
import { revalidatePath } from "next/cache";

async function createCustomerAction(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  await createCustomer(user.id, user.role, {
    name: String(formData.get("name")),
    email: formData.get("email")?.toString() ?? undefined,
    phone: formData.get("phone")?.toString() ?? undefined,
    company: formData.get("company")?.toString() ?? undefined,
    notes: formData.get("notes")?.toString() ?? undefined,
  });
  revalidatePath("/customers");
}

export default async function CustomersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const customers = await listCustomers(user.id);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold text-white">Customers</h1>
        <p className="text-sm text-slate-400">Manage customer contacts for quick linking to projects.</p>
      </header>
      <section className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-card">
          <table className="min-w-full divide-y divide-white/10 text-sm text-slate-200">
            <thead className="text-xs uppercase text-slate-400">
              <tr>
                <th className="py-3 text-left">Name</th>
                <th className="py-3 text-left">Email</th>
                <th className="py-3 text-left">Phone</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b border-white/5">
                  <td className="py-3">{customer.name}</td>
                  <td className="py-3 text-slate-300">{customer.email}</td>
                  <td className="py-3 text-slate-300">{customer.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form action={createCustomerAction} className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-card space-y-4 text-sm text-slate-200">
          <h2 className="text-lg font-semibold text-white">Add customer</h2>
          <input name="name" placeholder="Name" required className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2" />
          <input name="email" placeholder="Email" type="email" className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2" />
          <input name="phone" placeholder="Phone" className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2" />
          <input name="company" placeholder="Company" className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2" />
          <textarea name="notes" placeholder="Notes" className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2" />
          <button type="submit" className="rounded-full bg-brand-500 px-4 py-2 text-white">Save</button>
        </form>
      </section>
    </div>
  );
}
