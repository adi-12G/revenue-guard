"use client";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
export default async function FindingsPage() {
  const { isSignedIn, user } = useUser();
  const { data } = await supabase
    .from("findings")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", {
      ascending: false,
    });
   if(!isSignedIn) {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Findings History
      </h1>
          <div className="p-8">
      Please sign in to view findings.
    </div>
      <table className="w-full border">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Leak Type</th>
            <th>Revenue Loss</th>
          </tr>
        </thead>

        <tbody>
          {data?.map((row) => (
            <tr key={row.id}>
              <td>{row.customer}</td>
              <td>{row.leak_type}</td>
              <td>₹{row.revenue_loss}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
}
