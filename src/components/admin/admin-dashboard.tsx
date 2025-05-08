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
  users: MockUser[];
}

export function AdminDashboard({ users }: AdminDashboardProps) {
  return (
    <Card className="my-6 border-accent shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Users className="h-6 w-6 text-accent" />
          Admin Dashboard - Registered Users
        </CardTitle>
        <CardDescription>List of all users registered in the system.</CardDescription>
      </CardHeader>
      <CardContent>
        {users && users.length > 0 ? (
          <Table>
            <TableCaption>A list of registered users. ({users.length} total)</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">#</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Encrypted Files</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, index) => (
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
          <p className="text-center text-muted-foreground">No users registered yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
