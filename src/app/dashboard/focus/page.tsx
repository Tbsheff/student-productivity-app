import DashboardShell from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Play, Volume2 } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "../../../../supabase/server";

export default async function FocusPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <DashboardShell title="Focus Tools">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Focus Tools</h2>
        <p className="text-muted-foreground">
          Tools to help you stay focused and productive
        </p>
      </div>

      <Tabs defaultValue="pomodoro" className="mt-6">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
          <TabsTrigger value="pomodoro">
            <Clock className="mr-2 h-4 w-4" /> Pomodoro Timer
          </TabsTrigger>
          <TabsTrigger value="ambient">
            <Volume2 className="mr-2 h-4 w-4" /> Ambient Sounds
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pomodoro">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>Pomodoro Timer</CardTitle>
                <CardDescription>
                  Work in focused intervals with regular breaks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center space-y-6">
                  <div className="text-center">
                    <div className="text-6xl font-bold">25:00</div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Focus Session
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 h-12 w-12 rounded-full p-0">
                      <Play className="h-6 w-6" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-4 w-full max-w-md">
                    <Button variant="outline" className="text-sm">
                      Short Break
                    </Button>
                    <Button variant="outline" className="text-sm">
                      Long Break
                    </Button>
                    <Button variant="outline" className="text-sm">
                      Custom
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Session History</CardTitle>
                <CardDescription>Your recent focus sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between space-x-4 rounded-md border p-3">
                    <div className="space-y-1">
                      <p className="font-medium leading-none">Focus Session</p>
                      <p className="text-sm text-muted-foreground">
                        25 minutes
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Today, 2:30 PM
                    </div>
                  </div>
                  <div className="flex items-center justify-between space-x-4 rounded-md border p-3">
                    <div className="space-y-1">
                      <p className="font-medium leading-none">Focus Session</p>
                      <p className="text-sm text-muted-foreground">
                        25 minutes
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Today, 1:45 PM
                    </div>
                  </div>
                  <div className="flex items-center justify-between space-x-4 rounded-md border p-3">
                    <div className="space-y-1">
                      <p className="font-medium leading-none">Focus Session</p>
                      <p className="text-sm text-muted-foreground">
                        25 minutes
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Today, 11:20 AM
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ambient">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Coffee Shop",
                description: "Gentle coffee shop ambiance",
                image:
                  "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500&q=80",
              },
              {
                title: "Rainfall",
                description: "Calming rain sounds",
                image:
                  "https://images.unsplash.com/photo-1501691223387-dd0500403074?w=500&q=80",
              },
              {
                title: "Forest",
                description: "Peaceful forest ambiance",
                image:
                  "https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&q=80",
              },
              {
                title: "Ocean Waves",
                description: "Relaxing ocean sounds",
                image:
                  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&q=80",
              },
              {
                title: "White Noise",
                description: "Consistent background noise",
                image:
                  "https://images.unsplash.com/photo-1557683316-973673baf926?w=500&q=80",
              },
              {
                title: "Lo-Fi Beats",
                description: "Relaxing study music",
                image:
                  "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500&q=80",
              },
            ].map((sound, index) => (
              <Card key={index} className="overflow-hidden">
                <div
                  className="h-40 w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${sound.image})` }}
                />
                <CardHeader>
                  <CardTitle>{sound.title}</CardTitle>
                  <CardDescription>{sound.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                    <Play className="mr-2 h-4 w-4" /> Play
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
