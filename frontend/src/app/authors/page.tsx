
"use client";

import { useAuthors, useCreateAuthor } from "@/hooks/useAuthors";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthorCreate, AuthorCreateSchema } from "@/lib/api/schemas";

export default function AuthorsPage() {
  const { data: authors, isLoading, error } = useAuthors();
  const createMutation = useCreateAuthor();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AuthorCreate>({
    resolver: zodResolver(AuthorCreateSchema),
  });

  const onSubmit = (data: AuthorCreate) => {
    createMutation.mutate(data, {
      onSuccess: () => reset(),
    });
  };

  if (isLoading) return <div className="p-10 text-center">Loading authors...</div>;
  if (error) return <div className="p-10 text-red-500">Error loading authors</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Authors Management</h1>

      {/* Create Form */}
      <div className="bg-white/5 p-6 rounded-lg border border-white/10">
        <h2 className="text-xl font-semibold mb-4">Add New Author</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                {...register("name")}
                className="w-full bg-black/20 border border-white/10 rounded px-3 py-2"
                placeholder="Dr. Jane Doe"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                {...register("email")}
                className="w-full bg-black/20 border border-white/10 rounded px-3 py-2"
                placeholder="jane@university.edu"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea
              {...register("bio")}
              className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 h-20"
              placeholder="Research interests..."
            />
          </div>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium disabled:opacity-50"
          >
            {createMutation.isPending ? "Creating..." : "Create Author"}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 gap-4">
        {authors?.map((author) => (
          <div
            key={author.id}
            className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-blue-500/50 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{author.name}</h3>
                <p className="text-sm text-gray-400">{author.email}</p>
                {author.bio && <p className="mt-2 text-sm text-gray-300">{author.bio}</p>}
              </div>
              <div className="text-xs font-mono text-gray-500">ID: {author.id}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
