import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Copy, Check, Trash2, ExternalLink } from 'lucide-react';
import { useUpdateRestaurant, useDeleteTable } from '@/hooks/useQueries';
import { toast } from 'sonner';
import type { Restaurant, Table } from '@/backend';

interface TableManagementProps {
  restaurant: Restaurant;
}

export default function TableManagement({ restaurant }: TableManagementProps) {
  const [showForm, setShowForm] = useState(false);
  const [tableName, setTableName] = useState('');
  const [tableLocation, setTableLocation] = useState('');
  const [copiedTableId, setCopiedTableId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState<string | null>(null);

  const updateMutation = useUpdateRestaurant();
  const deleteMutation = useDeleteTable();

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();

    const newTable: Table = {
      id: `table-${Date.now()}`,
      name: tableName,
      location: tableLocation,
      customerLink: `/?table=table-${Date.now()}`,
      active: true,
    };

    const updatedRestaurant = {
      ...restaurant,
      tables: [...restaurant.tables, newTable],
    };

    try {
      await updateMutation.mutateAsync(updatedRestaurant);
      toast.success('Table added successfully!');
      setShowForm(false);
      setTableName('');
      setTableLocation('');
    } catch (error) {
      toast.error('Failed to add table. Please try again.');
    }
  };

  const handleToggleActive = async (tableId: string, currentActive: boolean) => {
    const updatedTables = restaurant.tables.map((table) =>
      table.id === tableId ? { ...table, active: !currentActive } : table
    );

    const updatedRestaurant = {
      ...restaurant,
      tables: updatedTables,
    };

    try {
      await updateMutation.mutateAsync(updatedRestaurant);
      toast.success(`Table ${!currentActive ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      toast.error('Failed to update table status. Please try again.');
    }
  };

  const handleDeleteTable = async () => {
    if (!tableToDelete) return;

    try {
      await deleteMutation.mutateAsync({
        identityId: restaurant.identityId,
        tableId: tableToDelete,
      });
      toast.success('Table deleted successfully!');
      setDeleteDialogOpen(false);
      setTableToDelete(null);
    } catch (error) {
      toast.error('Failed to delete table. Please try again.');
    }
  };

  const handleCopyLink = async (tableId: string) => {
    const fullUrl = `${window.location.origin}/?table=${tableId}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedTableId(tableId);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopiedTableId(null), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const activeTables = restaurant.tables.filter((t) => t.active);
  const inactiveTables = restaurant.tables.filter((t) => !t.active);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Table Management</h2>
          <p className="text-muted-foreground">Manage your restaurant tables and customer links</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Table
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Table</CardTitle>
            <CardDescription>Create a new table with a unique customer ordering link</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddTable} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tableName">Table Name</Label>
                <Input
                  id="tableName"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  placeholder="e.g., Table 1, Patio A"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tableLocation">Location</Label>
                <Input
                  id="tableLocation"
                  value={tableLocation}
                  onChange={(e) => setTableLocation(e.target.value)}
                  placeholder="e.g., Main dining area, Outdoor patio"
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Adding...' : 'Add Table'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTables.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Active Tables</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {activeTables.map((table) => (
              <Card key={table.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {table.name}
                        <Badge variant="default" className="bg-green-600">Active</Badge>
                      </CardTitle>
                      <CardDescription>{table.location}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={table.active}
                        onCheckedChange={() => handleToggleActive(table.id, table.active)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setTableToDelete(table.id);
                          setDeleteDialogOpen(true);
                        }}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-muted px-3 py-2 rounded truncate">
                      {window.location.origin}/?table={table.id}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyLink(table.id)}
                    >
                      {copiedTableId === table.id ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/?table=${table.id}`, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {inactiveTables.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Inactive Tables</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {inactiveTables.map((table) => (
              <Card key={table.id} className="opacity-60">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {table.name}
                        <Badge variant="outline">Inactive</Badge>
                      </CardTitle>
                      <CardDescription>{table.location}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={table.active}
                        onCheckedChange={() => handleToggleActive(table.id, table.active)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setTableToDelete(table.id);
                          setDeleteDialogOpen(true);
                        }}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {restaurant.tables.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No tables yet. Add your first table to get started.</p>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Table?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this table and its customer link. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTable}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
