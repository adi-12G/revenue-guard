"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";

export default function FindingsPage() {
  const { isSignedIn, user } = useUser();

  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchFindings();
    }
  }, [user]);

  async function fetchFindings() {
    const { data } = await supabase
      .from("findings")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", {
        ascending: false,
      });

    setData(data || []);
  }

  if (!isSignedIn) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">
          Findings History
        </h1>

        <p>Please sign in to view findings.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Findings History
      </h1>

      <table className="w-full border">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Leak Type</th>
            <th>Revenue Loss</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row) => (
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
