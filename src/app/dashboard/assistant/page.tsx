import DashboardShell from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Brain, Send } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "../../../../supabase/server";

export default async function AssistantPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <DashboardShell title="AI Assistant">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">AI Assistant</h2>
        <p className="text-muted-foreground">
          Ask questions about your schedule, assignments, or get study
          recommendations
        </p>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle>Chat with StudySmart AI</CardTitle>
              <CardDescription>
                Your personal AI study assistant
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 space-y-4 overflow-auto p-4 border rounded-md mb-4">
                <div className="flex gap-3 text-sm">
                  <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-primary text-primary-foreground shadow">
                    <Brain className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="leading-relaxed">
                      Hello! I'm your StudySmart AI assistant. I can help you
                      manage your tasks, provide study recommendations, or
                      answer questions about your schedule. How can I assist you
                      today?
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Input placeholder="Ask a question..." className="flex-1" />
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Suggested Questions</CardTitle>
              <CardDescription>
                Try asking these questions to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start text-left"
                  size="sm"
                >
                  What tasks are due this week?
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left"
                  size="sm"
                >
                  How much time have I spent studying Math?
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left"
                  size="sm"
                >
                  What's my most productive time of day?
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left"
                  size="sm"
                >
                  Can you suggest a study schedule for tomorrow?
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left"
                  size="sm"
                >
                  How can I improve my focus during study sessions?
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Capabilities</CardTitle>
              <CardDescription>What your AI assistant can do</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-indigo-100 p-1">
                    <Brain className="h-3 w-3 text-indigo-600" />
                  </div>
                  <span>Answer questions about your schedule and tasks</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-indigo-100 p-1">
                    <Brain className="h-3 w-3 text-indigo-600" />
                  </div>
                  <span>Provide personalized study recommendations</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-indigo-100 p-1">
                    <Brain className="h-3 w-3 text-indigo-600" />
                  </div>
                  <span>Help prioritize tasks and manage your time</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-indigo-100 p-1">
                    <Brain className="h-3 w-3 text-indigo-600" />
                  </div>
                  <span>Offer tips to improve your study habits</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-indigo-100 p-1">
                    <Brain className="h-3 w-3 text-indigo-600" />
                  </div>
                  <span>
                    Analyze your study patterns and suggest improvements
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
