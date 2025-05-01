import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, LogIn, UserPlus, Bolt } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [tags, setTags] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const languages = [
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "jsx", label: "JSX/TSX" },
    { value: "css", label: "CSS" },
    { value: "html", label: "HTML" },
    { value: "python", label: "Python" },
    { value: "go", label: "Go" },
    { value: "ruby", label: "Ruby" },
    { value: "php", label: "PHP" },
  ];

  const createSnippet = useMutation({
    mutationFn: (data: {
      title: string;
      code: string;
      description: string;
      language: string;
      tags?: string[] | null;
      visibility: string;
    }) => {
      return fetch("/api/snippets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((res) => res.json());
    },
    onSuccess: (data) => {
      navigate({ to: `/snippets/${data.id}` });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    const parsedTags = tags
      ? tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag)
      : null;

    createSnippet.mutate({
      title: title || "untitled",
      code,
      description,
      language,
      tags: parsedTags,
      visibility: "public",
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery) {
      navigate({ to: `/search`, search: { q: searchQuery } });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-dashed">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center border-x border-dashed">
          <div className="flex items-center text-white gap-2">
            <Bolt className="size-5" />
            <div className="text-lg tracking-tight font-light mt-0.5">
              fragment
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium hover:text-primary"
            >
              <LogIn className="h-4 w-4 inline mr-1" />
              Login
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
            >
              <UserPlus className="h-4 w-4 inline mr-1" />
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 py-8 border-x border-dashed">
        {/* Hero section */}
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <h1 className="text-5xl tracking-tight mb-6 text-primary/80 ">
            Share <span className="text-primary">[code snippets]</span>{" "}
            instantly
          </h1>
          <div className="text-xl text-muted-foreground/90 mb-10 font-light">
            Create, share, and discover code snippets.
          </div>
          {/* Search bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8 px-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search snippets..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-border/50 bg-background/50 shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50 hover:shadow-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        </div>

        {/* Create snippet form */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-card rounded-lg border border-dashed shadow-sm p-6">
            <h2 className="text-2xl mb-4">Create a snippet</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Snippet title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the snippet"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  placeholder="react, hooks, etc."
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="code">Code</Label>
                <Textarea
                  id="code"
                  placeholder="Paste your code here"
                  className="font-mono text-sm"
                  rows={10}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={createSnippet.isPending}
              >
                {createSnippet.isPending ? "Creating..." : "Create Snippet"}
              </Button>
            </form>
          </div>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>
              Create an account to manage your snippets, create folders, and
              more.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-dashed py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground"></div>
      </footer>
    </div>
  );
}
