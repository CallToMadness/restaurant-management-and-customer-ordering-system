export const idlFactory = ({ IDL }) => {
  const RestaurantId = IDL.Text;
  const EmployeeId = IDL.Text;
  const EmployeeRole = IDL.Variant({
    'bar' : IDL.Null,
    'kitchen' : IDL.Null,
    'waiter' : IDL.Null,
  });
  const AccessCode = IDL.Text;
  const Employee = IDL.Record({
    'id' : EmployeeId,
    'principal' : IDL.Opt(IDL.Principal),
    'name' : IDL.Text,
    'role' : EmployeeRole,
    'accessCode' : AccessCode,
  });
  const MenuItemId = IDL.Text;
  const EmployeeCategory = IDL.Variant({
    'bar' : IDL.Null,
    'kitchen' : IDL.Null,
    'waiter' : IDL.Null,
  });
  const ComponentId = IDL.Text;
  const MenuItem = IDL.Record({
    'id' : MenuItemId,
    'name' : IDL.Text,
    'routedBy' : EmployeeCategory,
    'description' : IDL.Text,
    'componentId' : ComponentId,
    'category' : IDL.Text,
    'price' : IDL.Nat,
  });
  const UserRole = IDL.Variant({
    'admin' : IDL.Null,
    'user' : IDL.Null,
    'guest' : IDL.Null,
  });
  const CanisterId = IDL.Text;
  const Component = IDL.Record({
    'id' : ComponentId,
    'name' : IDL.Text,
    'description' : IDL.Text,
  });
  const TableId = IDL.Text;
  const Table = IDL.Record({
    'id' : TableId,
    'customerLink' : IDL.Text,
    'active' : IDL.Bool,
    'name' : IDL.Text,
    'location' : IDL.Text,
  });
  const RestaurantIdentityId = IDL.Text;
  const ColorScheme = IDL.Record({
    'primaryColor' : IDL.Text,
    'accentColor' : IDL.Text,
    'secondaryColor' : IDL.Text,
  });
  const Restaurant = IDL.Record({
    'id' : RestaurantId,
    'manager' : IDL.Principal,
    'name' : IDL.Text,
    'components' : IDL.Vec(Component),
    'description' : IDL.Text,
    'tables' : IDL.Vec(Table),
    'address' : IDL.Text,
    'identityId' : RestaurantIdentityId,
    'colorScheme' : ColorScheme,
  });
  const AccessCodeData = IDL.Record({
    'expiresAt' : IDL.Opt(IDL.Int),
    'code' : AccessCode,
    'createdAt' : IDL.Int,
    'role' : UserRole,
    'isActive' : IDL.Bool,
    'restaurantId' : IDL.Opt(RestaurantId),
    'employeeId' : IDL.Opt(EmployeeId),
  });
  const UserProfile = IDL.Record({ 'name' : IDL.Text });
  const OrderId = IDL.Nat;
  const OrderStatus = IDL.Variant({
    'paid' : IDL.Null,
    'served' : IDL.Null,
    'ordered' : IDL.Null,
    'readyToServe' : IDL.Null,
    'toBePaid' : IDL.Null,
    'processed' : IDL.Null,
  });
  const OrderItem = IDL.Record({
    'componentId' : ComponentId,
    'quantity' : IDL.Nat,
    'category' : EmployeeCategory,
    'menuItemId' : MenuItemId,
  });
  const OrderBatch = IDL.Record({
    'id' : OrderId,
    'status' : OrderStatus,
    'tableId' : TableId,
    'restaurantId' : RestaurantId,
    'timestamp' : IDL.Int,
    'customerId' : IDL.Opt(IDL.Principal),
    'items' : IDL.Vec(OrderItem),
  });
  return IDL.Service({
    'addEmployee' : IDL.Func([RestaurantId, Employee], [], []),
    'addMenuItem' : IDL.Func([RestaurantId, MenuItem], [], []),
    'assignCallerUserRole' : IDL.Func([IDL.Principal, UserRole], [], []),
    'assignRestaurantToCanister' : IDL.Func([RestaurantId, CanisterId], [], []),
    'claimAccessCode' : IDL.Func([AccessCode], [], []),
    'createRestaurant' : IDL.Func([Restaurant], [], []),
    'deactivateAccessCode' : IDL.Func([AccessCode], [], []),
    'deleteEmployee' : IDL.Func([RestaurantId, EmployeeId], [], []),
    'deleteMenuItem' : IDL.Func([RestaurantId, MenuItemId], [], []),
    'deleteTable' : IDL.Func([RestaurantId, TableId], [], []),
    'generateAccessCode' : IDL.Func(
        [UserRole, IDL.Opt(RestaurantId), IDL.Opt(EmployeeId)],
        [AccessCode],
        [],
      ),
    'getAccessCodesByRestaurant' : IDL.Func(
        [RestaurantId],
        [IDL.Vec(AccessCodeData)],
        ['query'],
      ),
    'getAllRestaurants' : IDL.Func([], [IDL.Vec(Restaurant)], ['query']),
    'getAvailableAccessCodes' : IDL.Func(
        [RestaurantIdentityId],
        [IDL.Vec(AccessCode)],
        ['query'],
      ),
    'getCallerUserProfile' : IDL.Func([], [IDL.Opt(UserProfile)], ['query']),
    'getCallerUserRole' : IDL.Func([], [UserRole], ['query']),
    'getCanisterForRestaurant' : IDL.Func(
        [RestaurantId],
        [IDL.Opt(CanisterId)],
        ['query'],
      ),
    'getCustomerOrderHistory' : IDL.Func([], [IDL.Vec(OrderBatch)], ['query']),
    'getEmployees' : IDL.Func([RestaurantId], [IDL.Vec(Employee)], ['query']),
    'getMenuItems' : IDL.Func([RestaurantId], [IDL.Vec(MenuItem)], ['query']),
    'getOrder' : IDL.Func([OrderId], [IDL.Opt(OrderBatch)], ['query']),
    'getOrdersForRestaurant' : IDL.Func(
        [RestaurantId],
        [IDL.Vec(OrderBatch)],
        ['query'],
      ),
    'getRestaurant' : IDL.Func(
        [RestaurantId],
        [IDL.Opt(Restaurant)],
        ['query'],
      ),
    'getUserProfile' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(UserProfile)],
        ['query'],
      ),
    'getValidAccessCodesForRestaurant' : IDL.Func(
        [RestaurantId],
        [IDL.Vec(AccessCodeData)],
        ['query'],
      ),
    'initializeAccessControl' : IDL.Func([], [], []),
    'isCallerAdmin' : IDL.Func([], [IDL.Bool], ['query']),
    'placeOrder' : IDL.Func([OrderBatch], [OrderId], []),
    'saveCallerUserProfile' : IDL.Func([UserProfile], [], []),
    'setCustomAccessCode' : IDL.Func(
        [RestaurantId, EmployeeId, AccessCode],
        [],
        [],
      ),
    'updateAccessCode' : IDL.Func([AccessCode], [AccessCode], []),
    'updateRestaurant' : IDL.Func([Restaurant], [], []),
    'validateRestaurantIdentityId' : IDL.Func(
        [RestaurantIdentityId],
        [IDL.Bool],
        ['query'],
      ),
    'verifyAccessCode' : IDL.Func(
        [AccessCode],
        [
          IDL.Record({
            'role' : IDL.Opt(UserRole),
            'error' : IDL.Text,
            'restaurantId' : IDL.Opt(RestaurantId),
            'employeeId' : IDL.Opt(EmployeeId),
            'isValid' : IDL.Bool,
          }),
        ],
        ['query'],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
