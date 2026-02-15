"use client";

import { useAuthor } from "@/hooks/useAuthors";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthorDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const { data: author, isLoading, error } = useAuthor(id);

  if (isLoading) return <div className="p-10 text-center">Loading author...</div>;
  if (error) return <div className="p-10 text-red-500">Error loading author</div>;
  if (!author) return <div className="p-10 text-center">Author not found</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Link href="/authors" className="text-sm text-muted-foreground hover:text-foreground mb-4 block transition-colors">
        &larr; Back to Authors
      </Link>
      
      <Card>
        <CardHeader className="pb-6 border-b border-border/40">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shrink-0">
              {author.name.charAt(0)}
            </div>
            <div>
              <CardDescription className="mb-1 text-base">Researcher Profile</CardDescription>
              <CardTitle className="text-3xl md:text-4xl mb-2">{author.name}</CardTitle>
              <a href={`mailto:${author.email}`} className="text-muted-foreground hover:text-primary transition-colors">
                {author.email}
              </a>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="prose prose-invert max-w-none">
            <h3 className="text-lg font-semibold mb-2">Biography</h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {author.bio || "No biography available."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
