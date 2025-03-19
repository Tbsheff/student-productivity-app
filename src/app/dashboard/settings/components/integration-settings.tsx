"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase-client";
import { User } from "@supabase/supabase-js";
import { ArrowUpRight, Check, RefreshCw } from "lucide-react";

interface IntegrationSettingsProps {
  user: User;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  connected: boolean;
  lastSynced: string | null;
  icon: React.ReactNode;
}

export default function IntegrationSettings({
  user,
}: IntegrationSettingsProps) {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        setIsLoading(true);
        const supabase = createClient();

        // Get user's calendar connections
        const { data: connections } = await supabase
          .from("calendar_connections")
          .select("*")
          .eq("user_id", user.id);

        // Define available integrations
        const availableIntegrations: Integration[] = [
          {
            id: "canvas",
            name: "Canvas LMS",
            description: "Import assignments and deadlines from Canvas",
            connected: false,
            lastSynced: null,
            icon: <ArrowUpRight className="h-5 w-5 text-orange-500" />,
          },
          {
            id: "google",
            name: "Google Calendar",
            description: "Sync events with Google Calendar",
            connected: false,
            lastSynced: null,
            icon: <ArrowUpRight className="h-5 w-5 text-blue-500" />,
          },
          {
            id: "microsoft",
            name: "Microsoft Teams",
            description: "Connect with Microsoft Teams for collaboration",
            connected: false,
            lastSynced: null,
            icon: <ArrowUpRight className="h-5 w-5 text-purple-500" />,
          },
        ];

        // Update connection status based on database data
        if (connections) {
          connections.forEach((connection) => {
            const index = availableIntegrations.findIndex(
              (i) => i.id === connection.provider,
            );
            if (index !== -1) {
              availableIntegrations[index].connected = true;
              availableIntegrations[index].lastSynced = connection.last_synced;
            }
          });
        }

        setIntegrations(availableIntegrations);
      } catch (error) {
        console.error("Error fetching integrations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIntegrations();
  }, [user.id]);

  const handleConnect = (integrationId: string) => {
    // Redirect to the appropriate connection page
    if (integrationId === "canvas") {
      window.location.href = "/dashboard/calendar?tab=canvas";
    } else if (integrationId === "google") {
      window.location.href = "/dashboard/calendar?tab=google";
    } else {
      alert("This integration is not yet available.");
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    try {
      const supabase = createClient();

      // Delete the connection from the database
      const { error } = await supabase
        .from("calendar_connections")
        .delete()
        .eq("user_id", user.id)
        .eq("provider", integrationId);

      if (error) throw error;

      // Update the UI
      setIntegrations((prev) =>
        prev.map((integration) =>
          integration.id === integrationId
            ? { ...integration, connected: false, lastSynced: null }
            : integration,
        ),
      );
    } catch (error) {
      console.error("Error disconnecting integration:", error);
    }
  };

  if (isLoading) {
    return <div>Loading integrations...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Connected Services</h3>
          <p className="text-sm text-muted-foreground">
            Manage your connected external services
          </p>
        </div>

        <div className="grid gap-4">
          {integrations.map((integration) => (
            <Card key={integration.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {integration.icon}
                    <CardTitle>{integration.name}</CardTitle>
                  </div>
                  <Switch
                    checked={integration.connected}
                    onCheckedChange={(checked) =>
                      checked
                        ? handleConnect(integration.id)
                        : handleDisconnect(integration.id)
                    }
                  />
                </div>
                <CardDescription>{integration.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {integration.connected ? (
                  <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                    <Check className="h-4 w-4 mr-1" />
                    Connected
                    {integration.lastSynced && (
                      <span className="ml-2 text-muted-foreground">
                        Last synced:{" "}
                        {new Date(integration.lastSynced).toLocaleString()}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Not connected
                  </div>
                )}
              </CardContent>
              <CardFooter>
                {integration.connected ? (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleConnect(integration.id)}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" /> Sync Now
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                      onClick={() => handleDisconnect(integration.id)}
                    >
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleConnect(integration.id)}
                  >
                    Connect
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Notifications</h3>
          <p className="text-sm text-muted-foreground">
            Configure how you receive notifications
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications" className="flex flex-col">
              <span>Email Notifications</span>
              <span className="text-sm text-muted-foreground">
                Receive notifications via email
              </span>
            </Label>
            <Switch id="email-notifications" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="browser-notifications" className="flex flex-col">
              <span>Browser Notifications</span>
              <span className="text-sm text-muted-foreground">
                Receive notifications in your browser
              </span>
            </Label>
            <Switch id="browser-notifications" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="due-date-reminders" className="flex flex-col">
              <span>Due Date Reminders</span>
              <span className="text-sm text-muted-foreground">
                Get reminders for upcoming deadlines
              </span>
            </Label>
            <Switch id="due-date-reminders" defaultChecked />
          </div>
        </div>
      </div>

      <Button className="bg-indigo-600 hover:bg-indigo-700">
        Save Preferences
      </Button>
    </div>
  );
}
