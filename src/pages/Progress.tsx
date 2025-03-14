
import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Plus } from "lucide-react";
import { ProgressEntryDialog } from "@/components/progress/ProgressEntryDialog";
import { ProgressPdfExport } from "@/components/progress/ProgressPdfExport";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type ProgressEntry = {
  id: string;
  user_id: string;
  description: string;
  created_at: string;
  sender: string;
};

export default function Progress() {
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const { user } = useAuth();

  const fetchProgressEntries = async () => {
    try {
      setIsLoading(true);
      
      // Use 'from' with a type assertion to handle the TypeScript error
      const { data, error } = await supabase
        .from('progress_entries' as any)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Use explicit type assertion
      const typedData = data as unknown as ProgressEntry[];
      setEntries(typedData);
    } catch (error) {
      console.error("Error fetching progress entries:", error);
      toast.error("Failed to load progress entries");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProgressEntries();
    
    // Set up real-time subscription with improved event handling
    const channel = supabase
      .channel('progress_updates')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'progress_entries' 
      }, () => {
        console.log('New progress entry detected, refreshing data...');
        fetchProgressEntries();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Progress Log</h1>
          <p className="text-muted-foreground">
            Track and view progress updates
          </p>
        </div>
        <div className="flex gap-2">
          <ProgressPdfExport entries={entries} />
          <Button 
            onClick={() => setIsEntryDialogOpen(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Log New Progress
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 grid-cols-1">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-5 bg-muted rounded w-1/3"></div>
                <div className="h-4 bg-muted rounded w-1/4 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : entries.length > 0 ? (
        <div className="grid gap-4 grid-cols-1">
          {entries.map((entry) => (
            <Card key={entry.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center justify-between">
                  <span>{entry.sender || "Anonymous"}</span>
                  <div className="flex items-center text-sm font-normal text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDate(entry.created_at)}
                  </div>
                </CardTitle>
                <CardDescription>Progress Update</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap">{entry.description}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Progress Entries</CardTitle>
            <CardDescription>
              Start logging your progress by clicking the "Log New Progress" button above.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <ProgressEntryDialog 
        isOpen={isEntryDialogOpen}
        onClose={() => {
          setIsEntryDialogOpen(false);
          fetchProgressEntries(); // Refresh data when dialog closes
        }}
      />
    </MainLayout>
  );
}
