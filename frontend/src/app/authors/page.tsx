"use client";
import Link from "next/link";
import { useAuthors, useCreateAuthor } from "@/hooks/useAuthors";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthorCreate, AuthorCreateSchema } from "@/lib/api/schemas";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function AuthorsPage() {
  const { data: authors, isLoading, error } = useAuthors();
  const createMutation = useCreateAuthor();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AuthorCreate>({
    resolver: zodResolver(AuthorCreateSchema) as any,
    defaultValues: {
      name: "",
      email: "",
      bio: null,
    },
  });

  const onSubmit = (data: any) => {
    createMutation.mutate(data as AuthorCreate, {
      onSuccess: () => reset(),
    });
  };

  if (isLoading) return <div className="p-10 text-center">Loading authors...</div>;
  if (error) return <div className="p-10 text-red-500">Error loading authors</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Authors Management</h1>

      {/* Create Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Author</CardTitle>
          <CardDescription>Register a new researcher in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Dr. Jane Doe"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  {...register("email")}
                  placeholder="jane@university.edu"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                {...register("bio")}
                placeholder="Research interests..."
                className="h-20"
              />
            </div>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full sm:w-auto"
            >
              {createMutation.isPending ? "Creating..." : "Create Author"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* List */}
      <div className="grid grid-cols-1 gap-4">
        {authors?.map((author) => (
          <Link
            href={`/authors/${author.id}`}
            key={author.id}
            className="block group"
          >
            <Card className="hover:border-blue-500/50 hover:bg-white/10 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg font-bold shrink-0 text-white">
                      {author.name.charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{author.name}</CardTitle>
                      <CardDescription>{author.email}</CardDescription>
                    </div>
                  </div>
                  <div className="text-xs font-mono text-muted-foreground">ID: {author.id}</div>
                </div>
              </CardHeader>
              <CardContent>
                {author.bio && <p className="text-sm text-foreground/80 line-clamp-2">{author.bio}</p>}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
