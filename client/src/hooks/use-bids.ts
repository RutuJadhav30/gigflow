import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { InsertBid } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useBids(gigId: number) {
  return useQuery({
    queryKey: [api.bids.listByGig.path, gigId],
    queryFn: async () => {
      const url = buildUrl(api.bids.listByGig.path, { gigId });
      const res = await apiRequest(api.bids.listByGig.method, url);
      return api.bids.listByGig.responses[200].parse(await res.json());
    },
    enabled: !!gigId,
  });
}

export function useCreateBid() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Omit<InsertBid, "freelancerId">) => {
      const validated = api.bids.create.input.parse({
        ...data,
        price: Number(data.price),
        gigId: Number(data.gigId),
      });

      const res = await apiRequest(api.bids.create.method, api.bids.create.path, validated);
      return api.bids.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.bids.listByGig.path, variables.gigId] });
      toast({
        title: "Bid Placed!",
        description: "The gig owner will be notified of your proposal.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to place bid",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useHireBid() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ bidId, gigId }: { bidId: number, gigId: number }) => {
      const url = buildUrl(api.bids.hire.path, { bidId });
      const res = await apiRequest(api.bids.hire.method, url);
      return api.bids.hire.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.bids.listByGig.path, variables.gigId] });
      queryClient.invalidateQueries({ queryKey: [api.gigs.get.path, variables.gigId] });
      toast({
        title: "Freelancer Hired!",
        description: "The project has been assigned successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Action failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
