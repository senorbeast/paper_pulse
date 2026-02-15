
"use client";

import Link from "next/link";
import { usePapers, useCreatePaper } from "@/hooks/usePapers";
import { useAuthors } from "@/hooks/useAuthors";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PaperCreate, PaperCreateSchema } from "@/lib/api/schemas";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PapersPage() {
  const { data: papers, isLoading: papersLoading } = usePapers();
  const { data: authors } = useAuthors(); // For author selection
  const createMutation = useCreatePaper();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaperCreate>({
    resolver: zodResolver(PaperCreateSchema),
  });

  const onSubmit = (data: PaperCreate) => {
    // author_id is already a number thanks to the Controller logic
    createMutation.mutate(data, {
      onSuccess: () => reset(),
    });
  };

  if (papersLoading) return <div className="p-10 text-center">Loading papers...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Research Papers</h1>

      {/* Create Form */}
      <Card>
        <CardHeader>
          <CardTitle>Submit New Paper</CardTitle>
          <CardDescription>Enter the details of the research paper.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Quantum Entanglement in..."
              />
              {errors.title && (
                <p className="text-red-500 text-sm">{errors.title.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="doi">DOI</Label>
                <Input
                  id="doi"
                  {...register("doi")}
                  placeholder="10.1000/xyz123"
                />
                {errors.doi && (
                  <p className="text-red-500 text-sm">{errors.doi.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="author_id">Author</Label>
                <Controller
                  control={control}
                  name="author_id"
                  render={({ field }) => (
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString()}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Author..." />
                      </SelectTrigger>
                      <SelectContent>
                        {authors?.map((author) => (
                          <SelectItem key={author.id} value={String(author.id)}>
                            {author.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.author_id && (
                  <p className="text-red-500 text-sm">{errors.author_id.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="abstract">Abstract</Label>
              <Textarea
                id="abstract"
                {...register("abstract")}
                placeholder="Paper abstract..."
                className="h-32"
              />
            </div>

            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full sm:w-auto"
            >
              {createMutation.isPending ? "Submitting..." : "Submit Paper"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* List */}
      <div className="space-y-4">
        {papers?.map((paper) => (
          <Link
            href={`/papers/${paper.id}`}
            key={paper.id}
            className="block group"
          >
            <Card className="hover:border-green-500/50 hover:bg-white/10 transition-colors">
              <CardHeader>
                <CardTitle className="text-xl">{paper.title}</CardTitle>
                <div className="flex gap-4 text-sm text-gray-400">
                  <span className="bg-white/10 px-2 py-0.5 rounded">DOI: {paper.doi}</span>
                  <span>Author ID: {paper.author_id}</span>
                </div>
              </CardHeader>
              <CardContent>
                 <p className="text-gray-300 leading-relaxed line-clamp-2">{paper.abstract}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
