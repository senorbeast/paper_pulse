
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTyped, postTyped } from "../lib/api/client";
import { 
  AuthorResponseSchema, 
  AuthorResponse, 
  AuthorCreateSchema,
  AuthorCreate
} from "../lib/api/schemas";
import { z } from "zod";

// Keys
export const authorKeys = {
  all: ["authors"] as const,
  detail: (id: number) => ["authors", id] as const,
};

// Response Schema for List (Array of Authors)
const AuthorListSchema = z.array(AuthorResponseSchema);

// Hooks
export const useAuthors = () => {
  return useQuery({
    queryKey: authorKeys.all,
    queryFn: () => fetchTyped("/authors/", AuthorListSchema),
  });
};

export const useAuthor = (id: number) => {
  return useQuery({
    queryKey: authorKeys.detail(id),
    queryFn: () => fetchTyped(`/authors/${id}`, AuthorResponseSchema),
    enabled: !!id,
  });
};

export const useCreateAuthor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (newAuthor: AuthorCreate) => 
      postTyped("/authors/", newAuthor, AuthorResponseSchema),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authorKeys.all });
    },
  });
};
