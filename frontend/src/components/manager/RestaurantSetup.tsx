import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Store, Palette, DollarSign } from 'lucide-react';
import { useCreateRestaurant, useUpdateRestaurant } from '@/hooks/useQueries';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { toast } from 'sonner';
import { Currency } from '@/backend';
import type { Restaurant, Component } from '@/backend';

interface RestaurantSetupProps {
  restaurants: Restaurant[];
  onSelectRestaurant: (identityId: string) => void;
  editingRestaurant?: Restaurant;
}

export default function RestaurantSetup({ restaurants, onSelectRestaurant, editingRestaurant }: RestaurantSetupProps) {
  const { identity } = useInternetIdentity();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    primaryColor: '#f97316',
    secondaryColor: '#fb923c',
    accentColor: '#fdba74',
    defaultCurrency: Currency.usd,
  });
  const [components, setComponents] = useState<Component[]>([
    { id: 'kitchen', name: 'Kitchen', description: 'Main kitchen' },
    { id: 'bar', name: 'Bar', description: 'Bar station' },
  ]);

  const createMutation = useCreateRestaurant();
  const updateMutation = useUpdateRestaurant();

  useEffect(() => {
    if (editingRestaurant) {
      setFormData({
        name: editingRestaurant.name,
        address: editingRestaurant.address,
        description: editingRestaurant.description,
        primaryColor: editingRestaurant.colorScheme.primaryColor,
        secondaryColor: editingRestaurant.colorScheme.secondaryColor,
        accentColor: editingRestaurant.colorScheme.accentColor,
        defaultCurrency: editingRestaurant.defaultCurrency,
      });
      setComponents(editingRestaurant.components);
      setShowForm(true);
    }
  }, [editingRestaurant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identity) {
      toast.error('You must be logged in to create a restaurant');
      return;
    }

    const restaurant: Restaurant = {
      id: editingRestaurant?.id || `restaurant-${Date.now()}`,
      identityId: editingRestaurant?.identityId || '',
      name: formData.name,
      address: formData.address,
      description: formData.description,
      colorScheme: {
        primaryColor: formData.primaryColor,
        secondaryColor: formData.secondaryColor,
        accentColor: formData.accentColor,
      },
      components,
      tables: editingRestaurant?.tables || [],
      manager: editingRestaurant?.manager || identity.getPrincipal(),
      defaultCurrency: formData.defaultCurrency,
    };

    try {
      if (editingRestaurant) {
        await updateMutation.mutateAsync(restaurant);
        toast.success('Restaurant updated successfully!');
      } else {
        const identityId = await createMutation.mutateAsync(restaurant);
        toast.success('Restaurant created successfully!');
        setTimeout(() => {
          onSelectRestaurant(identityId);
        }, 500);
      }
      setShowForm(false);
      setFormData({
        name: '',
        address: '',
        description: '',
        primaryColor: '#f97316',
        secondaryColor: '#fb923c',
        accentColor: '#fdba74',
        defaultCurrency: Currency.usd,
      });
    } catch (error) {
      toast.error('Failed to save restaurant. Please try again.');
    }
  };

  const getCurrencyLabel = (currency: Currency) => {
    switch (currency) {
      case Currency.usd:
        return 'USD ($) - US Dollar';
      case Currency.eur:
        return 'EUR (€) - Euro';
    }
  };

  const getCurrencySymbol = (currency: Currency) => {
    switch (currency) {
      case Currency.usd:
        return '$';
      case Currency.eur:
        return '€';
    }
  };

  if (showForm) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{editingRestaurant ? 'Edit Restaurant' : 'Create New Restaurant'}</CardTitle>
          <CardDescription>
            {editingRestaurant ? 'Update your restaurant details' : 'Set up your restaurant profile and branding'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Restaurant Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., The Golden Fork"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g., 123 Main St, City, State"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your restaurant..."
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-muted-foreground" />
                <Label htmlFor="defaultCurrency">Default Currency</Label>
              </div>
              <Select
                value={formData.defaultCurrency}
                onValueChange={(value) => setFormData({ ...formData, defaultCurrency: value as Currency })}
              >
                <SelectTrigger id="defaultCurrency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Currency.usd}>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{getCurrencySymbol(Currency.usd)}</span>
                      <span>{getCurrencyLabel(Currency.usd)}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value={Currency.eur}>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{getCurrencySymbol(Currency.eur)}</span>
                      <span>{getCurrencyLabel(Currency.eur)}</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                This currency will be used for all menu item prices in your restaurant
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-muted-foreground" />
                <Label>Color Scheme</Label>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor" className="text-sm">
                    Primary
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="w-16 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor" className="text-sm">
                    Secondary
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                      className="w-16 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accentColor" className="text-sm">
                    Accent
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="accentColor"
                      type="color"
                      value={formData.accentColor}
                      onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                      className="w-16 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={formData.accentColor}
                      onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1">
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving...'
                  : editingRestaurant
                    ? 'Update Restaurant'
                    : 'Create Restaurant'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Your Restaurants</h2>
          <p className="text-muted-foreground">Select a restaurant to manage or create a new one</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Restaurant
        </Button>
      </div>

      {restaurants.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Store className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No restaurants yet</h3>
            <p className="text-muted-foreground mb-4">Create your first restaurant to get started</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Restaurant
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {restaurants.map((restaurant) => (
            <Card
              key={restaurant.identityId}
              className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary/50"
              onClick={() => onSelectRestaurant(restaurant.identityId)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: restaurant.colorScheme.primaryColor }}
                  />
                  {restaurant.name}
                </CardTitle>
                <CardDescription>{restaurant.address}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{restaurant.description}</p>
                <div className="space-y-2">
                  {restaurant.identityId && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1.5">
                      <span className="font-medium">ID:</span>
                      <code className="font-mono font-semibold">{restaurant.identityId}</code>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1.5">
                    <DollarSign className="w-3 h-3" />
                    <span className="font-medium">Currency:</span>
                    <span className="font-semibold">{restaurant.defaultCurrency.toUpperCase()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
