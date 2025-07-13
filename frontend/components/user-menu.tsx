"use client";
import { Button } from "@/components/ui/button";
import { createSupabaseClient } from "@/app/utils/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function UserMenu() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createSupabaseClient();

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error signing out:", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        onClick={handleSignOut}
        disabled={loading}
      >
        {loading ? "Signing out..." : "Sign out"}
      </Button>
    </div>
  );
} 