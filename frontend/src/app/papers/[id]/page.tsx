"use client";

import { usePaper } from "@/hooks/usePapers";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PaperDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const { data: paper, isLoading, error } = usePaper(id);

  if (isLoading) return <div className="p-10 text-center">Loading paper...</div>;
  if (error) return <div className="p-10 text-red-500">Error loading paper</div>;
  if (!paper) return <div className="p-10 text-center">Paper not found</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Link href="/papers" className="text-sm text-muted-foreground hover:text-foreground mb-4 block transition-colors">
        &larr; Back to Papers
      </Link>
      
      <Card>
        <CardHeader>
          <CardDescription className="mb-2">Research Paper</CardDescription>
          <CardTitle className="text-3xl md:text-4xl">{paper.title}</CardTitle>
          <div className="flex flex-wrap gap-3 pt-4">
            <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-medium border border-blue-500/20">
              DOI: {paper.doi}
            </span>
            <Link 
              href={`/authors/${paper.author_id}`}
              className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs font-medium border border-green-500/20 hover:bg-green-500/20 transition-colors"
            >
              Author ID: {paper.author_id}
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-invert max-w-none">
            <h3 className="text-lg font-semibold mb-2">Abstract</h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {paper.abstract || "No abstract available."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
