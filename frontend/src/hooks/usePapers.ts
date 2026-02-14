
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTyped, postTyped } from "../lib/api/client";
import { 
  PaperResponseSchema, 
  PaperCreateSchema, 
  PaperCreate
} from "../lib/api/schemas";
import { z } from "zod";

// Keys
export const paperKeys = {
  all: ["papers"] as const,
  detail: (id: number) => ["papers", id] as const,
};

// Response Schema for List (Array of Papers)
const PaperListSchema = z.array(PaperResponseSchema);

// Hooks
export const usePapers = () => {
  return useQuery({
    queryKey: paperKeys.all,
    queryFn: () => fetchTyped("/papers/", PaperListSchema),
  });
};

export const usePaper = (id: number) => {
  return useQuery({
    queryKey: paperKeys.detail(id),
    queryFn: () => fetchTyped(`/papers/${id}`, PaperResponseSchema),
    enabled: !!id,
  });
};

export const useCreatePaper = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (newPaper: PaperCreate) => 
      postTyped("/papers/", newPaper, PaperResponseSchema),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paperKeys.all });
    },
  });
};
