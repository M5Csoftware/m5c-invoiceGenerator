import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { FileSpreadsheet, Users } from "lucide-react";

export default function RunNumberSelection() {
  const [inputRunNumber, setInputRunNumber] = useState("");
  const { setSessionRunNumber, user } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputRunNumber.trim()) {
      setSessionRunNumber(inputRunNumber.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-lg border-primary/10">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <FileSpreadsheet className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">Select Run Number</CardTitle>
          <CardDescription>
            Enter a unique Run Number to identify your invoice session. 
            Colleagues entering the same number will see the same data.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="runNumber">Run Number / Session ID</Label>
              <Input
                id="runNumber"
                placeholder="e.g. INV-2024-001 or SESSION-A"
                value={inputRunNumber}
                onChange={(e) => setInputRunNumber(e.target.value)}
                className="text-center font-mono text-lg tracking-wider uppercase"
                required
                autoFocus
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center bg-blue-50 dark:bg-blue-950/30 p-3 rounded-md border border-blue-100 dark:border-blue-900">
              <Users className="h-4 w-4 text-blue-500" />
              <span>Collaborative Mode Active</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" size="lg">
              Start / Join Session
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
