import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type AccessCode = string;
export interface AccessCodeData {
  'expiresAt' : [] | [bigint],
  'code' : AccessCode,
  'createdAt' : bigint,
  'role' : UserRole,
  'isActive' : boolean,
  'restaurantId' : [] | [RestaurantId],
  'employeeId' : [] | [EmployeeId],
}
export type CanisterId = string;
export interface ColorScheme {
  'primaryColor' : string,
  'accentColor' : string,
  'secondaryColor' : string,
}
export interface Component {
  'id' : ComponentId,
  'name' : string,
  'description' : string,
}
export type ComponentId = string;
export interface Employee {
  'id' : EmployeeId,
  'principal' : [] | [Principal],
  'name' : string,
  'role' : EmployeeRole,
  'accessCode' : AccessCode,
}
export type EmployeeCategory = { 'bar' : null } |
  { 'kitchen' : null } |
  { 'waiter' : null };
export type EmployeeId = string;
export type EmployeeRole = { 'bar' : null } |
  { 'kitchen' : null } |
  { 'waiter' : null };
export interface MenuItem {
  'id' : MenuItemId,
  'name' : string,
  'routedBy' : EmployeeCategory,
  'description' : string,
  'componentId' : ComponentId,
  'category' : string,
  'price' : bigint,
}
export type MenuItemId = string;
export interface OrderBatch {
  'id' : OrderId,
  'status' : OrderStatus,
  'tableId' : TableId,
  'restaurantId' : RestaurantId,
  'timestamp' : bigint,
  'customerId' : [] | [Principal],
  'items' : Array<OrderItem>,
}
export type OrderId = bigint;
export interface OrderItem {
  'componentId' : ComponentId,
  'quantity' : bigint,
  'category' : EmployeeCategory,
  'menuItemId' : MenuItemId,
}
export type OrderStatus = { 'paid' : null } |
  { 'served' : null } |
  { 'ordered' : null } |
  { 'readyToServe' : null } |
  { 'toBePaid' : null } |
  { 'processed' : null };
export interface Restaurant {
  'id' : RestaurantId,
  'manager' : Principal,
  'name' : string,
  'components' : Array<Component>,
  'description' : string,
  'tables' : Array<Table>,
  'address' : string,
  'identityId' : RestaurantIdentityId,
  'colorScheme' : ColorScheme,
}
export type RestaurantId = string;
export type RestaurantIdentityId = string;
export interface Table {
  'id' : TableId,
  'customerLink' : string,
  'active' : boolean,
  'name' : string,
  'location' : string,
}
export type TableId = string;
export interface UserProfile { 'name' : string }
export type UserRole = { 'admin' : null } |
  { 'user' : null } |
  { 'guest' : null };
export interface _SERVICE {
  'addEmployee' : ActorMethod<[RestaurantId, Employee], undefined>,
  'addMenuItem' : ActorMethod<[RestaurantId, MenuItem], undefined>,
  'assignCallerUserRole' : ActorMethod<[Principal, UserRole], undefined>,
  'assignRestaurantToCanister' : ActorMethod<
    [RestaurantId, CanisterId],
    undefined
  >,
  'claimAccessCode' : ActorMethod<[AccessCode], undefined>,
  'createRestaurant' : ActorMethod<[Restaurant], undefined>,
  'deactivateAccessCode' : ActorMethod<[AccessCode], undefined>,
  'deleteEmployee' : ActorMethod<[RestaurantId, EmployeeId], undefined>,
  'deleteMenuItem' : ActorMethod<[RestaurantId, MenuItemId], undefined>,
  'deleteTable' : ActorMethod<[RestaurantId, TableId], undefined>,
  'generateAccessCode' : ActorMethod<
    [UserRole, [] | [RestaurantId], [] | [EmployeeId]],
    AccessCode
  >,
  'getAccessCodesByRestaurant' : ActorMethod<
    [RestaurantId],
    Array<AccessCodeData>
  >,
  'getAllRestaurants' : ActorMethod<[], Array<Restaurant>>,
  'getAvailableAccessCodes' : ActorMethod<
    [RestaurantIdentityId],
    Array<AccessCode>
  >,
  'getCallerUserProfile' : ActorMethod<[], [] | [UserProfile]>,
  'getCallerUserRole' : ActorMethod<[], UserRole>,
  'getCanisterForRestaurant' : ActorMethod<[RestaurantId], [] | [CanisterId]>,
  'getCustomerOrderHistory' : ActorMethod<[], Array<OrderBatch>>,
  'getEmployees' : ActorMethod<[RestaurantId], Array<Employee>>,
  'getMenuItems' : ActorMethod<[RestaurantId], Array<MenuItem>>,
  'getOrder' : ActorMethod<[OrderId], [] | [OrderBatch]>,
  'getOrdersForRestaurant' : ActorMethod<[RestaurantId], Array<OrderBatch>>,
  'getRestaurant' : ActorMethod<[RestaurantId], [] | [Restaurant]>,
  'getUserProfile' : ActorMethod<[Principal], [] | [UserProfile]>,
  'getValidAccessCodesForRestaurant' : ActorMethod<
    [RestaurantId],
    Array<AccessCodeData>
  >,
  'initializeAccessControl' : ActorMethod<[], undefined>,
  'isCallerAdmin' : ActorMethod<[], boolean>,
  'placeOrder' : ActorMethod<[OrderBatch], OrderId>,
  'saveCallerUserProfile' : ActorMethod<[UserProfile], undefined>,
  'setCustomAccessCode' : ActorMethod<
    [RestaurantId, EmployeeId, AccessCode],
    undefined
  >,
  'updateAccessCode' : ActorMethod<[AccessCode], AccessCode>,
  'updateRestaurant' : ActorMethod<[Restaurant], undefined>,
  'validateRestaurantIdentityId' : ActorMethod<[RestaurantIdentityId], boolean>,
  'verifyAccessCode' : ActorMethod<
    [AccessCode],
    {
      'role' : [] | [UserRole],
      'error' : string,
      'restaurantId' : [] | [RestaurantId],
      'employeeId' : [] | [EmployeeId],
      'isValid' : boolean,
    }
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
