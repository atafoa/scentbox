"use client";

import { useState } from "react";
import { Heart, Check, Eye, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type CollectionStatus = "WANT" | "TRIED" | "OWN" | null;

interface CollectionButtonProps {
  fragranceId: string;
  initialStatus?: CollectionStatus;
  variant?: "default" | "compact";
}

const statusConfig = {
  WANT: {
    label: "Want",
    icon: Heart,
    color: "text-pink-500",
    bgColor: "bg-pink-50 hover:bg-pink-100",
  },
  TRIED: {
    label: "Tried",
    icon: Eye,
    color: "text-blue-500",
    bgColor: "bg-blue-50 hover:bg-blue-100",
  },
  OWN: {
    label: "Own",
    icon: Check,
    color: "text-green-500",
    bgColor: "bg-green-50 hover:bg-green-100",
  },
};

export function CollectionButton({
  fragranceId,
  initialStatus,
  variant = "default",
}: CollectionButtonProps) {
  const [status, setStatus] = useState<CollectionStatus>(initialStatus || null);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleStatusChange = async (newStatus: CollectionStatus) => {
    if (!session) {
      router.push("/login");
      return;
    }

    setIsLoading(true);
    try {
      if (newStatus === status) {
        // Remove from collection
        await fetch(`/api/collection/${fragranceId}`, {
          method: "DELETE",
        });
        setStatus(null);
      } else {
        // Add or update
        await fetch(`/api/collection/${fragranceId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
        setStatus(newStatus);
      }
    } catch (error) {
      console.error("Failed to update collection:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === "compact") {
    return (
      <div className="flex gap-1">
        {(["WANT", "TRIED", "OWN"] as const).map((s) => {
          const config = statusConfig[s];
          const Icon = config.icon;
          const isActive = status === s;

          return (
            <Button
              key={s}
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8",
                isActive && config.bgColor
              )}
              onClick={() => handleStatusChange(s)}
              disabled={isLoading}
            >
              <Icon
                className={cn(
                  "h-4 w-4",
                  isActive ? config.color : "text-muted-foreground"
                )}
                fill={isActive ? "currentColor" : "none"}
              />
            </Button>
          );
        })}
      </div>
    );
  }

  const currentConfig = status ? statusConfig[status] : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={status ? "secondary" : "outline"}
          className={cn(
            "min-w-[120px]",
            status && currentConfig?.bgColor
          )}
          disabled={isLoading}
        >
          {status ? (
            <>
              {currentConfig && (
                <currentConfig.icon
                  className={cn("mr-2 h-4 w-4", currentConfig.color)}
                  fill="currentColor"
                />
              )}
              {currentConfig?.label}
            </>
          ) : (
            <>
              <MoreHorizontal className="mr-2 h-4 w-4" />
              Add to...
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(["WANT", "TRIED", "OWN"] as const).map((s) => {
          const config = statusConfig[s];
          const Icon = config.icon;
          const isActive = status === s;

          return (
            <DropdownMenuItem
              key={s}
              onClick={() => handleStatusChange(s)}
              className={cn(isActive && "bg-muted")}
            >
              <Icon
                className={cn(
                  "mr-2 h-4 w-4",
                  isActive ? config.color : "text-muted-foreground"
                )}
                fill={isActive ? "currentColor" : "none"}
              />
              {config.label}
              {isActive && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
