import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/hooks/use-user";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MessageSquare, Video, LogOut } from "lucide-react";

interface University {
  id: number;
  name: string;
  country: string;
}

interface Application {
  id: number;
  universityId: number;
  status: string;
  interviewDate: string;
}

export default function Dashboard() {
  const { user, logout } = useUser();
  const [, setLocation] = useLocation();

  const { data: universities } = useQuery<University[]>({
    queryKey: ["/api/universities"],
  });

  const { data: applications } = useQuery<Application[]>({
    queryKey: [`/api/applications/${user?.id}`],
  });

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Welcome, {user?.username}</h1>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                className="w-full"
                onClick={() => setLocation("/chat")}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat with Counselor
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>University</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications?.map((app) => {
                    const university = universities?.find(
                      (u) => u.id === app.universityId
                    );
                    return (
                      <TableRow key={app.id}>
                        <TableCell>{university?.name}</TableCell>
                        <TableCell>{app.status}</TableCell>
                        <TableCell>
                          {app.status === "interview_scheduled" && (
                            <Button
                              variant="secondary"
                              onClick={() => setLocation(`/interview/${app.id}`)}
                            >
                              <Video className="h-4 w-4 mr-2" />
                              Join Interview
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
