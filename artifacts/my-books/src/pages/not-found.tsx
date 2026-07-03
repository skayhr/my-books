import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground p-4">
      <Card className="w-full max-w-md mx-4 bg-card">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h1 className="text-2xl font-bold text-foreground">Oops! Page Not Found</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              The screen you are looking for doesn't exist.
            </p>
            <Link href="/" className="mt-6 inline-block rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              Go to home screen!
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
