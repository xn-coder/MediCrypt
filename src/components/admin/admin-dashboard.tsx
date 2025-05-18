
// src/components/admin/admin-dashboard.tsx
'use client';

import type { MockUser } from '@/types/user';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from 'lucide-react';

interface AdminDashboardProps {
  users: MockUser[]; // This list should already be filtered to exclude admins by the parent
}

export function AdminDashboard({ users }: AdminDashboardProps) {
  // The users prop is now expected to be pre-filtered by the parent component (page.tsx)
  // to exclude the admin user. If further filtering is needed (e.g. to ensure only 'user' role), it can be done here.
  // For now, we assume 'users' contains only non-admin users.
  const displayUsers = users.filter(user => user.role !== 'admin');

  return (
    <Card className="my-6 border shadow-lg"> {/* Changed border-accent to border and shadow-md to shadow-lg */}
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-accent"> {/* Ensured text-accent is applied */}
          <Users className="h-6 w-6 text-accent" />
          Admin Dashboard - Registered Users
        </CardTitle>
        <CardDescription>List of all non-admin users registered in the system.</CardDescription>
      </CardHeader>
      <CardContent>
        {displayUsers && displayUsers.length > 0 ? (
          <Table>
            <TableCaption>A list of registered non-admin users. ({displayUsers.length} total)</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">#</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Encrypted Files</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayUsers.map((user, index) => (
                <TableRow key={user.email}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell className="text-right">
                    {Object.keys(user.encryptedFiles || {}).length}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-muted-foreground">No non-admin users registered yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
