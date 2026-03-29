import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, UtensilsCrossed, ChefHat, Wine, UserCircle, Trash2 } from 'lucide-react';
import { useMenuItems, useAddMenuItem, useDeleteMenuItem } from '@/hooks/useQueries';
import { toast } from 'sonner';
import { EmployeeRole, Currency } from '@/backend';
import type { Restaurant, MenuItem } from '@/backend';
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

interface MenuManagementProps {
  restaurant: Restaurant;
}

export default function MenuManagement({ restaurant }: MenuManagementProps) {
  const { data: menuItems, isLoading } = useMenuItems(restaurant.identityId);
  const addMenuItemMutation = useAddMenuItem();
  const deleteMenuItemMutation = useDeleteMenuItem();

  const [showForm, setShowForm] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    componentId: restaurant.components[0]?.id || '',
    routedBy: EmployeeRole.kitchen,
  });

  const getCurrencySymbol = (currency: Currency) => {
    switch (currency) {
      case Currency.usd:
        return '$';
      case Currency.eur:
        return '€';
    }
  };

  const getCurrencyCode = (currency: Currency) => {
    return currency.toUpperCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const menuItem: MenuItem = {
      id: `item-${Date.now()}`,
      name: formData.name,
      category: formData.category,
      description: formData.description,
      price: BigInt(Math.round(parseFloat(formData.price) * 100)),
      componentId: formData.componentId,
      routedBy: formData.routedBy,
    };

    try {
      await addMenuItemMutation.mutateAsync({
        identityId: restaurant.identityId,
        menuItem,
      });
      toast.success('Menu item added successfully!');
      setShowForm(false);
      setFormData({
        name: '',
        category: '',
        description: '',
        price: '',
        componentId: restaurant.components[0]?.id || '',
        routedBy: EmployeeRole.kitchen,
      });
    } catch (error) {
      toast.error('Failed to add menu item. Please try again.');
    }
  };

  const handleDeleteClick = (item: MenuItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      await deleteMenuItemMutation.mutateAsync({
        identityId: restaurant.identityId,
        menuItemId: itemToDelete.id,
      });
      toast.success('Menu item deleted successfully!');
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (error) {
      toast.error('Failed to delete menu item. Please try again.');
    }
  };

  const getCategoryIcon = (category: EmployeeRole) => {
    switch (category) {
      case EmployeeRole.kitchen:
        return <ChefHat className="w-3 h-3" />;
      case EmployeeRole.bar:
        return <Wine className="w-3 h-3" />;
      case EmployeeRole.waiter:
        return <UserCircle className="w-3 h-3" />;
    }
  };

  const getCategoryLabel = (category: EmployeeRole) => {
    switch (category) {
      case EmployeeRole.kitchen:
        return 'Kitchen';
      case EmployeeRole.bar:
        return 'Bar';
      case EmployeeRole.waiter:
        return 'Waiter';
    }
  };

  const categorizedMenu = (menuItems || []).reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, MenuItem[]>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Menu Management</h2>
          <p className="text-muted-foreground">
            Add and organize your menu items with employee category assignments (prices in {getCurrencyCode(restaurant.defaultCurrency)})
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add Menu Item</CardTitle>
            <CardDescription>
              Create a new item for your menu and assign it to an employee category (prices in {getCurrencyCode(restaurant.defaultCurrency)})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Margherita Pizza"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Menu Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Appetizers, Main Course"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the dish..."
                  rows={2}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ({getCurrencySymbol(restaurant.defaultCurrency)})</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Price in {getCurrencyCode(restaurant.defaultCurrency)}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="routedBy">Routed By</Label>
                  <Select
                    value={formData.routedBy}
                    onValueChange={(value) => setFormData({ ...formData, routedBy: value as EmployeeRole })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={EmployeeRole.kitchen}>
                        <div className="flex items-center gap-2">
                          <ChefHat className="w-4 h-4" />
                          <span>Kitchen</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={EmployeeRole.bar}>
                        <div className="flex items-center gap-2">
                          <Wine className="w-4 h-4" />
                          <span>Bar</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={EmployeeRole.waiter}>
                        <div className="flex items-center gap-2">
                          <UserCircle className="w-4 h-4" />
                          <span>Waiter</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Orders for this item will be routed to all employees in this category
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={addMenuItemMutation.isPending} className="flex-1">
                  {addMenuItemMutation.isPending ? 'Adding...' : 'Add Item'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading menu...</p>
          </div>
        </div>
      ) : Object.keys(categorizedMenu).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <UtensilsCrossed className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No menu items yet</h3>
            <p className="text-muted-foreground mb-4">Add your first menu item to get started</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Menu Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(categorizedMenu).map(([category, items]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle>{category}</CardTitle>
                <CardDescription>{(items as MenuItem[]).length} items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(items as MenuItem[]).map((item) => (
                    <div key={item.id} className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {getCategoryIcon(item.routedBy)}
                          <p className="text-xs text-muted-foreground">
                            Routed to: {getCategoryLabel(item.routedBy)} staff
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-lg whitespace-nowrap">
                          {getCurrencySymbol(restaurant.defaultCurrency)}{(Number(item.price) / 100).toFixed(2)} {getCurrencyCode(restaurant.defaultCurrency)}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(item)}
                          disabled={deleteMenuItemMutation.isPending}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{itemToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteMenuItemMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMenuItemMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
