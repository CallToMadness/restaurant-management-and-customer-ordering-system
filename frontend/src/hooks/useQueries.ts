import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { OrderStatus, EmployeeRole, UserRole, Currency, OrderSource } from '@/backend';
import type { Restaurant, MenuItem, OrderBatch, OrderItem, UserProfile, Table, Employee, AccessCode, AccessCodeData, RestaurantIdentityId, ExchangeRate } from '@/backend';

export function useRestaurants() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Restaurant[]>({
    queryKey: ['restaurants', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      try {
        const allRestaurants = await actor.getAllRestaurants();
        // Filter to only show restaurants owned by the current user
        const userPrincipal = identity.getPrincipal().toString();
        return allRestaurants.filter(r => r.manager.toString() === userPrincipal);
      } catch (error) {
        // If error is due to permissions, return empty array (user has no restaurants yet)
        console.error('Error fetching restaurants:', error);
        if (error instanceof Error && error.message.includes('Unauthorized')) {
          return [];
        }
        throw error;
      }
    },
    enabled: !!actor && !isFetching && !!identity,
    retry: false,
  });
}

export function useRestaurant(identityId: RestaurantIdentityId) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Restaurant | null>({
    queryKey: ['restaurant', identityId, identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return null;
      try {
        // Find restaurant by identityId
        const allRestaurants = await actor.getAllRestaurants();
        const restaurant = allRestaurants.find(r => r.identityId === identityId);
        // Verify ownership
        if (restaurant && restaurant.manager.toString() !== identity.getPrincipal().toString()) {
          return null;
        }
        return restaurant || null;
      } catch (error) {
        console.error('Error fetching restaurant:', error);
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!identityId && !!identity,
    retry: false,
  });
}

export function useRestaurantByTableId(tableId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Restaurant | null>({
    queryKey: ['restaurantByTableId', tableId],
    queryFn: async () => {
      if (!actor || !tableId) return null;
      try {
        return await actor.getRestaurantByTableId(tableId);
      } catch (error) {
        console.error('Error fetching restaurant by table ID:', error);
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!tableId,
    retry: false,
  });
}

export function useMenuItems(identityId: RestaurantIdentityId, enabled: boolean = true) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<MenuItem[]>({
    queryKey: ['menuItems', identityId, identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      try {
        // Find restaurant by identityId
        const allRestaurants = await actor.getAllRestaurants();
        const restaurant = allRestaurants.find(r => r.identityId === identityId);
        if (!restaurant || restaurant.manager.toString() !== identity.getPrincipal().toString()) {
          return [];
        }
        return actor.getMenuItems(restaurant.id);
      } catch (error) {
        console.error('Error fetching menu items:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!identityId && enabled && !!identity,
    retry: false,
  });
}

export function useMenuItemsPublic(identityId: RestaurantIdentityId, enabled: boolean = true) {
  const { actor, isFetching } = useActor();

  return useQuery<MenuItem[]>({
    queryKey: ['menuItemsPublic', identityId],
    queryFn: async () => {
      if (!actor) return [];
      try {
        // Find restaurant by identityId
        const allRestaurants = await actor.getAllRestaurants();
        const restaurant = allRestaurants.find(r => r.identityId === identityId);
        if (!restaurant) return [];
        return actor.getMenuItems(restaurant.id);
      } catch (error) {
        console.error('Error fetching menu items:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!identityId && enabled,
    retry: false,
  });
}

export function useOrdersForRestaurant(identityId: RestaurantIdentityId) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<OrderBatch[]>({
    queryKey: ['orders', identityId, identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      try {
        // Find restaurant by identityId
        const allRestaurants = await actor.getAllRestaurants();
        const restaurant = allRestaurants.find(r => r.identityId === identityId);
        if (!restaurant || restaurant.manager.toString() !== identity.getPrincipal().toString()) {
          return [];
        }
        const allOrders = await actor.getOrdersForRestaurant(restaurant.id);
        // Filter to only show "to be paid" and "paid" orders for managers
        return allOrders.filter(order => 
          order.status === OrderStatus.toBePaid || order.status === OrderStatus.paid
        );
      } catch (error) {
        console.error('Error fetching orders:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!identityId && !!identity,
    refetchInterval: 5000,
    retry: false,
  });
}

export function useOrdersByCategory(identityId: RestaurantIdentityId, category: EmployeeRole) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<OrderBatch[]>({
    queryKey: ['ordersByCategory', identityId, category, identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      try {
        // Find restaurant by identityId
        const allRestaurants = await actor.getAllRestaurants();
        const restaurant = allRestaurants.find(r => r.identityId === identityId);
        if (!restaurant) return [];
        // Get all orders for the restaurant
        const allOrders = await actor.getOrdersForRestaurant(restaurant.id);
        // Filter orders to only include items for this category
        return allOrders
          .map(order => ({
            ...order,
            items: order.items.filter(item => item.category === category)
          }))
          .filter(order => order.items.length > 0);
      } catch (error) {
        console.error('Error fetching orders by category:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!identityId && !!identity,
    refetchInterval: 5000,
    retry: false,
  });
}

export function useOrdersForCustomerAtTable(identityId: RestaurantIdentityId, tableId: string, enabled: boolean = true) {
  const { actor, isFetching } = useActor();

  return useQuery<OrderBatch[]>({
    queryKey: ['ordersForCustomerAtTable', identityId, tableId],
    queryFn: async () => {
      if (!actor) return [];
      try {
        // Find restaurant by identityId
        const allRestaurants = await actor.getAllRestaurants();
        const restaurant = allRestaurants.find(r => r.identityId === identityId);
        if (!restaurant) return [];
        // Get all orders for the restaurant
        const allOrders = await actor.getOrdersForRestaurant(restaurant.id);
        // Filter to orders for this specific table
        return allOrders.filter(order => order.tableId === tableId);
      } catch (error) {
        console.error('Error fetching orders for customer at table:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!identityId && !!tableId && enabled,
    refetchInterval: 5000,
    retry: false,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return actor.isCallerAdmin();
      } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useCustomerOrderHistory() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<OrderBatch[]>({
    queryKey: ['customerOrderHistory', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      try {
        // Backend already filters by caller's Principal
        return actor.getCustomerOrderHistory();
      } catch (error) {
        console.error('Error fetching customer order history:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!identity,
    retry: false,
  });
}

export function useExchangeRate() {
  const { actor, isFetching } = useActor();

  return useQuery<ExchangeRate>({
    queryKey: ['exchangeRate'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getExchangeRate();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60000, // Cache for 1 minute
    retry: false,
  });
}

export function useCreateRestaurant() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (restaurant: Restaurant) => {
      if (!actor || !identity) throw new Error('Actor not initialized');
      // Set the manager to the current user's Principal
      const restaurantToCreate = {
        ...restaurant,
        manager: identity.getPrincipal(),
      };
      await actor.createRestaurant(restaurantToCreate);
      // Fetch all restaurants to get the newly created one with its identityId
      const allRestaurants = await actor.getAllRestaurants();
      const createdRestaurant = allRestaurants.find(r => r.id === restaurant.id);
      return createdRestaurant?.identityId || restaurant.identityId;
    },
    onSuccess: async (identityId) => {
      await queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      await queryClient.invalidateQueries({ queryKey: ['restaurant', identityId] });
      await queryClient.refetchQueries({ queryKey: ['restaurants'] });
    },
  });
}

export function useUpdateRestaurant() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (restaurant: Restaurant) => {
      if (!actor || !identity) throw new Error('Actor not initialized');
      // Verify ownership before updating
      if (restaurant.manager.toString() !== identity.getPrincipal().toString()) {
        throw new Error('Unauthorized: You do not own this restaurant');
      }
      return actor.updateRestaurant(restaurant);
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      await queryClient.invalidateQueries({ queryKey: ['restaurant', variables.identityId] });
      await queryClient.refetchQueries({ queryKey: ['restaurants'] });
    },
  });
}

export function useDeleteTable() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ identityId, tableId }: { identityId: RestaurantIdentityId; tableId: string }) => {
      if (!actor || !identity) throw new Error('Actor not initialized');
      // Find restaurant by identityId
      const allRestaurants = await actor.getAllRestaurants();
      const restaurant = allRestaurants.find(r => r.identityId === identityId);
      if (!restaurant || restaurant.manager.toString() !== identity.getPrincipal().toString()) {
        throw new Error('Unauthorized: You do not own this restaurant');
      }
      return actor.deleteTable(restaurant.id, tableId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['restaurant', variables.identityId] });
    },
  });
}

export function useAddMenuItem() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ identityId, menuItem }: { identityId: RestaurantIdentityId; menuItem: MenuItem }) => {
      if (!actor || !identity) throw new Error('Actor not initialized');
      // Find restaurant by identityId
      const allRestaurants = await actor.getAllRestaurants();
      const restaurant = allRestaurants.find(r => r.identityId === identityId);
      if (!restaurant || restaurant.manager.toString() !== identity.getPrincipal().toString()) {
        throw new Error('Unauthorized: You do not own this restaurant');
      }
      return actor.addMenuItem(restaurant.id, menuItem);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['menuItems', variables.identityId] });
      queryClient.invalidateQueries({ queryKey: ['menuItemsPublic', variables.identityId] });
    },
  });
}

export function useDeleteMenuItem() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ identityId, menuItemId }: { identityId: RestaurantIdentityId; menuItemId: string }) => {
      if (!actor || !identity) throw new Error('Actor not initialized');
      // Find restaurant by identityId
      const allRestaurants = await actor.getAllRestaurants();
      const restaurant = allRestaurants.find(r => r.identityId === identityId);
      if (!restaurant || restaurant.manager.toString() !== identity.getPrincipal().toString()) {
        throw new Error('Unauthorized: You do not own this restaurant');
      }
      return actor.deleteMenuItem(restaurant.id, menuItemId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['menuItems', variables.identityId] });
      queryClient.invalidateQueries({ queryKey: ['menuItemsPublic', variables.identityId] });
    },
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      identityId,
      tableId,
      items,
      currency,
    }: {
      identityId: RestaurantIdentityId;
      tableId: string;
      items: OrderItem[];
      currency?: Currency;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      // Find restaurant by identityId
      const allRestaurants = await actor.getAllRestaurants();
      const restaurant = allRestaurants.find(r => r.identityId === identityId);
      if (!restaurant) throw new Error('Restaurant not found');
      const order: OrderBatch = {
        id: BigInt(0),
        restaurantId: restaurant.id,
        tableId,
        items,
        status: OrderStatus.ordered,
        timestamp: BigInt(Date.now() * 1000000),
        currency: currency || restaurant.defaultCurrency,
        source: OrderSource.table,
        toLabel: tableId,
      };
      return actor.placeOrder(order);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders', variables.identityId] });
      queryClient.invalidateQueries({ queryKey: ['ordersByCategory'] });
      queryClient.invalidateQueries({ queryKey: ['customerOrderHistory'] });
      queryClient.invalidateQueries({ queryKey: ['ordersForCustomerAtTable'] });
    },
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, newStatus }: { orderId: bigint; newStatus: OrderStatus }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.updateOrderStatus(orderId, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['ordersByCategory'] });
      queryClient.invalidateQueries({ queryKey: ['customerOrderHistory'] });
      queryClient.invalidateQueries({ queryKey: ['ordersForCustomerAtTable'] });
    },
  });
}

// Employee management hooks with enhanced synchronization and ownership validation

export function useEmployees(identityId: RestaurantIdentityId) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Employee[]>({
    queryKey: ['employees', identityId, identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      try {
        // Find restaurant by identityId
        const allRestaurants = await actor.getAllRestaurants();
        const restaurant = allRestaurants.find(r => r.identityId === identityId);
        if (!restaurant || restaurant.manager.toString() !== identity.getPrincipal().toString()) {
          return [];
        }
        return actor.getEmployees(restaurant.id);
      } catch (error) {
        console.error('Error fetching employees:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!identityId && !!identity,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    retry: false,
  });
}

export function useAddEmployee() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ identityId, employee }: { identityId: RestaurantIdentityId; employee: Employee }) => {
      if (!actor || !identity) throw new Error('Actor not initialized');
      // Find restaurant by identityId
      const allRestaurants = await actor.getAllRestaurants();
      const restaurant = allRestaurants.find(r => r.identityId === identityId);
      if (!restaurant || restaurant.manager.toString() !== identity.getPrincipal().toString()) {
        throw new Error('Unauthorized: You do not own this restaurant');
      }
      await actor.addEmployee(restaurant.id, employee);
      return identityId;
    },
    onSuccess: async (identityId, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['employees', identityId] });
      await queryClient.invalidateQueries({ queryKey: ['accessCodes', identityId] });
      await queryClient.invalidateQueries({ queryKey: ['availableAccessCodes', identityId] });
      
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['employees', identityId] }),
        queryClient.refetchQueries({ queryKey: ['accessCodes', identityId] }),
        queryClient.refetchQueries({ queryKey: ['availableAccessCodes', identityId] }),
      ]);
    },
  });
}

export function useDeleteEmployee() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ identityId, employeeId }: { identityId: RestaurantIdentityId; employeeId: string }) => {
      if (!actor || !identity) throw new Error('Actor not initialized');
      // Find restaurant by identityId
      const allRestaurants = await actor.getAllRestaurants();
      const restaurant = allRestaurants.find(r => r.identityId === identityId);
      if (!restaurant || restaurant.manager.toString() !== identity.getPrincipal().toString()) {
        throw new Error('Unauthorized: You do not own this restaurant');
      }
      await actor.deleteEmployee(restaurant.id, employeeId);
      return identityId;
    },
    onSuccess: async (identityId, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['employees', identityId] });
      await queryClient.invalidateQueries({ queryKey: ['accessCodes', identityId] });
      await queryClient.invalidateQueries({ queryKey: ['availableAccessCodes', identityId] });
      
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['employees', identityId] }),
        queryClient.refetchQueries({ queryKey: ['accessCodes', identityId] }),
        queryClient.refetchQueries({ queryKey: ['availableAccessCodes', identityId] }),
      ]);
    },
  });
}

// Access code management hooks with enhanced synchronization and ownership validation

export function useGenerateAccessCode() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ role, identityId, employeeId }: { role: UserRole; identityId?: RestaurantIdentityId; employeeId?: string }) => {
      if (!actor || !identity) throw new Error('Actor not initialized');
      let restaurantId: string | null = null;
      // Find restaurant by identityId if provided
      if (identityId) {
        const allRestaurants = await actor.getAllRestaurants();
        const restaurant = allRestaurants.find(r => r.identityId === identityId);
        if (!restaurant || restaurant.manager.toString() !== identity.getPrincipal().toString()) {
          throw new Error('Unauthorized: You do not own this restaurant');
        }
        restaurantId = restaurant.id;
      }
      const code = await actor.generateAccessCode(role, restaurantId, employeeId || null);
      return { code, identityId };
    },
    onSuccess: async (result, variables) => {
      if (variables.identityId) {
        await queryClient.invalidateQueries({ queryKey: ['accessCodes', variables.identityId] });
        await queryClient.invalidateQueries({ queryKey: ['employees', variables.identityId] });
        await queryClient.invalidateQueries({ queryKey: ['availableAccessCodes', variables.identityId] });
        
        await Promise.all([
          queryClient.refetchQueries({ queryKey: ['accessCodes', variables.identityId] }),
          queryClient.refetchQueries({ queryKey: ['availableAccessCodes', variables.identityId] }),
        ]);
      }
    },
  });
}

export function useSetCustomAccessCode() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ identityId, employeeId, customCode }: { identityId: RestaurantIdentityId; employeeId: string; customCode: AccessCode }) => {
      if (!actor || !identity) throw new Error('Actor not initialized');
      // Find restaurant by identityId
      const allRestaurants = await actor.getAllRestaurants();
      const restaurant = allRestaurants.find(r => r.identityId === identityId);
      if (!restaurant || restaurant.manager.toString() !== identity.getPrincipal().toString()) {
        throw new Error('Unauthorized: You do not own this restaurant');
      }
      await actor.setCustomAccessCode(restaurant.id, employeeId, customCode);
      return identityId;
    },
    onSuccess: async (identityId, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['accessCodes', identityId] });
      await queryClient.invalidateQueries({ queryKey: ['employees', identityId] });
      await queryClient.invalidateQueries({ queryKey: ['availableAccessCodes', identityId] });
      
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['accessCodes', identityId] }),
        queryClient.refetchQueries({ queryKey: ['employees', identityId] }),
        queryClient.refetchQueries({ queryKey: ['availableAccessCodes', identityId] }),
      ]);
    },
  });
}

export function useUpdateAccessCode() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ code, identityId }: { code: AccessCode; identityId: RestaurantIdentityId }) => {
      if (!actor || !identity) throw new Error('Actor not initialized');
      // Find restaurant by identityId
      const allRestaurants = await actor.getAllRestaurants();
      const restaurant = allRestaurants.find(r => r.identityId === identityId);
      if (!restaurant || restaurant.manager.toString() !== identity.getPrincipal().toString()) {
        throw new Error('Unauthorized: You do not own this restaurant');
      }
      const newCode = await actor.updateAccessCode(code);
      return { newCode, identityId };
    },
    onSuccess: async (result, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['accessCodes', result.identityId] });
      await queryClient.invalidateQueries({ queryKey: ['employees', result.identityId] });
      await queryClient.invalidateQueries({ queryKey: ['availableAccessCodes', result.identityId] });
      
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['accessCodes', result.identityId] }),
        queryClient.refetchQueries({ queryKey: ['employees', result.identityId] }),
        queryClient.refetchQueries({ queryKey: ['availableAccessCodes', result.identityId] }),
      ]);
    },
  });
}

export function useVerifyAccessCode() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (code: AccessCode) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.verifyAccessCode(code);
    },
  });
}

export function useAccessCodesByRestaurant(identityId: RestaurantIdentityId) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<AccessCodeData[]>({
    queryKey: ['accessCodes', identityId, identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      try {
        // Find restaurant by identityId
        const allRestaurants = await actor.getAllRestaurants();
        const restaurant = allRestaurants.find(r => r.identityId === identityId);
        if (!restaurant || restaurant.manager.toString() !== identity.getPrincipal().toString()) {
          return [];
        }
        return actor.getAccessCodesByRestaurant(restaurant.id);
      } catch (error) {
        console.error('Error fetching access codes:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!identityId && !!identity,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    retry: false,
  });
}

// New hooks for employee login flow with Internet Identity linking

export function useValidateRestaurantIdentityId() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (identityId: RestaurantIdentityId) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.validateRestaurantIdentityId(identityId);
    },
  });
}

export function useGetAvailableAccessCodes(identityId: RestaurantIdentityId | null) {
  const { actor, isFetching } = useActor();

  return useQuery<AccessCode[]>({
    queryKey: ['availableAccessCodes', identityId],
    queryFn: async () => {
      if (!actor || !identityId) return [];
      try {
        return actor.getAvailableAccessCodes(identityId);
      } catch (error) {
        console.error('Error fetching available access codes:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!identityId,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    retry: false,
  });
}

export function useGetValidAccessCodesForRestaurant() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (identityId: RestaurantIdentityId) => {
      if (!actor) throw new Error('Actor not initialized');
      // Find restaurant by identityId
      const allRestaurants = await actor.getAllRestaurants();
      const restaurant = allRestaurants.find(r => r.identityId === identityId);
      if (!restaurant) throw new Error('Restaurant not found');
      const accessCodesData = await actor.getValidAccessCodesForRestaurant(restaurant.id);
      // Return only the code strings for display
      return accessCodesData.map(codeData => codeData.code);
    },
  });
}

export function useCheckEmployeeLink() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (identityId: RestaurantIdentityId) => {
      if (!actor || !identity) throw new Error('Actor not initialized');
      const employeeId = await actor.checkEmployeeLink(identity.getPrincipal(), identityId);
      return employeeId;
    },
  });
}

export function useGetEmployeeDetails() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ identityId, employeeId }: { identityId: RestaurantIdentityId; employeeId: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      
      // Find restaurant by identityId
      const allRestaurants = await actor.getAllRestaurants();
      const restaurant = allRestaurants.find(r => r.identityId === identityId);
      if (!restaurant) {
        throw new Error('Restaurant not found');
      }
      
      // Get employees for the restaurant
      const employees = await actor.getEmployees(restaurant.id);
      const employee = employees.find(emp => emp.id === employeeId);
      
      if (!employee) {
        throw new Error('Employee not found');
      }
      
      return {
        name: employee.name,
        role: employee.role,
      };
    },
  });
}

export function useVerifyAndClaimAccessCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ code, identityId }: { code: AccessCode; identityId: RestaurantIdentityId }) => {
      if (!actor) throw new Error('Actor not initialized');
      
      // First verify the code
      const verifyResult = await actor.verifyAccessCode(code);
      
      if (!verifyResult.isValid) {
        return {
          success: false,
          error: verifyResult.error,
          employeeData: null,
        };
      }
      
      // Find restaurant by identityId
      const allRestaurants = await actor.getAllRestaurants();
      const restaurant = allRestaurants.find(r => r.identityId === identityId);
      if (!restaurant) {
        return {
          success: false,
          error: 'Restaurant not found',
          employeeData: null,
        };
      }
      
      // Check if the code belongs to the correct restaurant
      if (verifyResult.restaurantId !== restaurant.id) {
        return {
          success: false,
          error: 'This code does not belong to the specified restaurant',
          employeeData: null,
        };
      }
      
      // Claim the code (links principal to employee and deactivates code)
      await actor.claimAccessCode(code, identityId);
      
      // Get the employee details
      const employees = await actor.getEmployees(restaurant.id);
      const employee = employees.find(emp => emp.id === verifyResult.employeeId);
      
      if (!employee) {
        return {
          success: false,
          error: 'Employee not found',
          employeeData: null,
        };
      }
      
      return {
        success: true,
        error: '',
        employeeData: {
          name: employee.name,
          category: employee.role,
        },
      };
    },
    onSuccess: async (result, variables) => {
      if (result.success) {
        // Invalidate relevant queries
        await queryClient.invalidateQueries({ queryKey: ['employees', variables.identityId] });
        await queryClient.invalidateQueries({ queryKey: ['accessCodes', variables.identityId] });
        await queryClient.invalidateQueries({ queryKey: ['availableAccessCodes', variables.identityId] });
      }
    },
  });
}
