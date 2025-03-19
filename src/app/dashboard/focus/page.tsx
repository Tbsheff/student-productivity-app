import DashboardShell from "@/components/dashboard/dashboard-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock, Volume2 } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "../../../../supabase/server";
import dynamic from "next/dynamic";

// Dynamically import client components
const PomodoroTimer = dynamic(() => import("./components/pomodoro-timer"), {
  ssr: false,
});

const SessionHistory = dynamic(() => import("./components/session-history"), {
  ssr: false,
});

const AmbientSoundPlayer = dynamic(
  () => import("./components/ambient-sound-player"),
  { ssr: false },
);

export default async function FocusPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Sound data with actual sound URLs
  const soundData = [
    {
      title: "Coffee Shop",
      description: "Gentle coffee shop ambiance",
      image:
        "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500&q=80",
      soundUrl:
        "https://assets.mixkit.co/sfx/preview/mixkit-coffee-shop-ambience-616.mp3",
    },
    {
      title: "Rainfall",
      description: "Calming rain sounds",
      image:
        "https://images.unsplash.com/photo-1501691223387-dd0500403074?w=500&q=80",
      soundUrl:
        "https://assets.mixkit.co/sfx/preview/mixkit-light-rain-loop-2393.mp3",
    },
    {
      title: "Forest",
      description: "Peaceful forest ambiance",
      image:
        "https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&q=80",
      soundUrl:
        "https://assets.mixkit.co/sfx/preview/mixkit-forest-birds-ambience-1210.mp3",
    },
    {
      title: "Ocean Waves",
      description: "Relaxing ocean sounds",
      image:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&q=80",
      soundUrl:
        "https://assets.mixkit.co/sfx/preview/mixkit-ocean-waves-1189.mp3",
    },
    {
      title: "White Noise",
      description: "Consistent background noise",
      image:
        "https://images.unsplash.com/photo-1557683316-973673baf926?w=500&q=80",
      soundUrl:
        "https://assets.mixkit.co/sfx/preview/mixkit-static-electric-noise-2576.mp3",
    },
    {
      title: "Lo-Fi Beats",
      description: "Relaxing study music",
      image:
        "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500&q=80",
      soundUrl: "https://assets.mixkit.co/sfx/preview/mixkit-lo-fi-01-621.mp3",
    },
  ];

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
                <PomodoroTimer />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Session History</CardTitle>
                <CardDescription>Your recent focus sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <SessionHistory />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ambient">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {soundData.map((sound, index) => (
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
                  <AmbientSoundPlayer
                    title={sound.title}
                    description={sound.description}
                    imageUrl={sound.image}
                    soundUrl={sound.soundUrl}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
