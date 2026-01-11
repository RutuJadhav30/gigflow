import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { InsertGig, GigResponse } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

export function useGigs(search?: string) {
  return useQuery({
    queryKey: [api.gigs.list.path, search],
    queryFn: async () => {
      const url = search 
        ? `${api.gigs.list.path}?search=${encodeURIComponent(search)}` 
        : api.gigs.list.path;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch gigs");
      return api.gigs.list.responses[200].parse(await res.json());
    },
  });
}

export function useGig(id: number) {
  return useQuery({
    queryKey: [api.gigs.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.gigs.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch gig details");
      return api.gigs.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateGig() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Omit<InsertGig, "ownerId">) => {
      // Validate input - coerce number
      const validated = api.gigs.create.input.parse({
        ...data,
        budget: Number(data.budget),
      });

      const res = await apiRequest(api.gigs.create.method, api.gigs.create.path, validated);
      return api.gigs.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.gigs.list.path] });
      toast({
        title: "Gig Posted!",
        description: "Your gig is now live for freelancers to see.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to post gig",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
