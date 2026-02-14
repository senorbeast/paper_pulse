
"use client";

import { usePapers, useCreatePaper } from "@/hooks/usePapers";
import { useAuthors } from "@/hooks/useAuthors"; // Needed for dropdown
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PaperCreate, PaperCreateSchema } from "@/lib/api/schemas";

export default function PapersPage() {
  const { data: papers, isLoading: papersLoading } = usePapers();
  const { data: authors } = useAuthors(); // For author selection
  const createMutation = useCreatePaper();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaperCreate>({
    resolver: zodResolver(PaperCreateSchema),
  });

  const onSubmit = (data: PaperCreate) => {
    // Ensure author_id is a number (HTML select returns string)
    const formattedData = { ...data, author_id: Number(data.author_id) };
    createMutation.mutate(formattedData, {
      onSuccess: () => reset(),
    });
  };

  if (papersLoading) return <div className="p-10 text-center">Loading papers...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Research Papers</h1>

      {/* Create Form */}
      <div className="bg-white/5 p-6 rounded-lg border border-white/10">
        <h2 className="text-xl font-semibold mb-4">Submit New Paper</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              {...register("title")}
              className="w-full bg-black/20 border border-white/10 rounded px-3 py-2"
              placeholder="Quantum Entanglement in..."
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">DOI</label>
              <input
                {...register("doi")}
                className="w-full bg-black/20 border border-white/10 rounded px-3 py-2"
                placeholder="10.1000/xyz123"
              />
              {errors.doi && (
                <p className="text-red-500 text-sm mt-1">{errors.doi.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Author</label>
              <select
                {...register("author_id", { valueAsNumber: true })}
                className="w-full bg-black/20 border border-white/10 rounded px-3 py-2"
              >
                <option value="">Select Author...</option>
                {authors?.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.name}
                  </option>
                ))}
              </select>
              {errors.author_id && (
                <p className="text-red-500 text-sm mt-1">{errors.author_id.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Abstract</label>
            <textarea
              {...register("abstract")}
              className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 h-32"
              placeholder="Paper abstract..."
            />
          </div>

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium disabled:opacity-50"
          >
            {createMutation.isPending ? "Submitting..." : "Submit Paper"}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="space-y-4">
        {papers?.map((paper) => (
          <div
            key={paper.id}
            className="p-6 rounded-lg bg-white/5 border border-white/10 hover:border-green-500/50 transition-colors"
          >
            <h3 className="font-bold text-xl mb-2">{paper.title}</h3>
            <div className="flex gap-4 text-sm text-gray-400 mb-4">
              <span className="bg-white/10 px-2 py-0.5 rounded">DOI: {paper.doi}</span>
              <span>Author ID: {paper.author_id}</span>
            </div>
            <p className="text-gray-300 leading-relaxed">{paper.abstract}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
