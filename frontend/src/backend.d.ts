import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type OrderId = bigint;
export interface ExchangeRate {
    usdToEur: number;
    eurToUsd: number;
}
export type RestaurantIdentityId = string;
export interface OrderItem {
    componentId: ComponentId;
    quantity: bigint;
    category: EmployeeCategory;
    menuItemId: MenuItemId;
}
export interface AccessCodeData {
    expiresAt?: bigint;
    code: AccessCode;
    createdAt: bigint;
    role: UserRole;
    isActive: boolean;
    restaurantId?: RestaurantId;
    employeeId?: EmployeeId;
}
export type RestaurantId = string;
export interface Restaurant {
    id: RestaurantId;
    manager: Principal;
    name: string;
    components: Array<Component>;
    description: string;
    tables: Array<Table>;
    address: string;
    defaultCurrency: Currency;
    identityId: RestaurantIdentityId;
    colorScheme: ColorScheme;
}
export interface Component {
    id: ComponentId;
    name: string;
    description: string;
}
export interface MenuItem {
    id: MenuItemId;
    name: string;
    routedBy: EmployeeCategory;
    description: string;
    componentId: ComponentId;
    category: string;
    price: bigint;
}
export type MenuItemId = string;
export type CanisterId = string;
export type EmployeeId = string;
export interface Table {
    id: TableId;
    customerLink: string;
    active: boolean;
    name: string;
    location: string;
}
export interface ColorScheme {
    primaryColor: string;
    accentColor: string;
    secondaryColor: string;
}
export type AccessCode = string;
export interface Employee {
    id: EmployeeId;
    principal?: Principal;
    name: string;
    role: EmployeeRole;
    accessCode: AccessCode;
}
export type TableId = string;
export type ComponentId = string;
export interface UserProfile {
    name: string;
}
export interface OrderBatch {
    id: OrderId;
    status: OrderStatus;
    source: OrderSource;
    toLabel: string;
    tableId: TableId;
    restaurantId: RestaurantId;
    currency: Currency;
    timestamp: bigint;
    customerId?: Principal;
    items: Array<OrderItem>;
}
export enum Currency {
    eur = "eur",
    usd = "usd"
}
export enum EmployeeRole {
    bar = "bar",
    kitchen = "kitchen",
    waiter = "waiter"
}
export enum OrderSource {
    bar = "bar",
    table = "table",
    kitchen = "kitchen"
}
export enum OrderStatus {
    paid = "paid",
    ordered = "ordered",
    readyToServe = "readyToServe",
    toBePaid = "toBePaid"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addEmployee(restaurantId: RestaurantId, employee: Employee): Promise<void>;
    addMenuItem(restaurantId: RestaurantId, menuItem: MenuItem): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignRestaurantToCanister(restaurantId: RestaurantId, canisterId: CanisterId): Promise<void>;
    checkEmployeeLink(principal: Principal, restaurantIdentityId: RestaurantIdentityId): Promise<EmployeeId | null>;
    claimAccessCode(code: AccessCode, restaurantIdentityId: RestaurantIdentityId): Promise<void>;
    createRestaurant(restaurant: Restaurant): Promise<void>;
    deactivateAccessCode(code: AccessCode): Promise<void>;
    deleteEmployee(restaurantId: RestaurantId, employeeId: EmployeeId): Promise<void>;
    deleteMenuItem(restaurantId: RestaurantId, menuItemId: MenuItemId): Promise<void>;
    deleteTable(restaurantId: RestaurantId, tableId: TableId): Promise<void>;
    generateAccessCode(role: UserRole, restaurantId: RestaurantId | null, employeeId: EmployeeId | null): Promise<AccessCode>;
    getAccessCodesByRestaurant(restaurantId: RestaurantId): Promise<Array<AccessCodeData>>;
    getAllRestaurants(): Promise<Array<Restaurant>>;
    getAvailableAccessCodes(identityId: RestaurantIdentityId): Promise<Array<AccessCode>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCanisterForRestaurant(restaurantId: RestaurantId): Promise<CanisterId | null>;
    getCustomerOrderHistory(): Promise<Array<OrderBatch>>;
    getEmployees(restaurantId: RestaurantId): Promise<Array<Employee>>;
    getExchangeRate(): Promise<ExchangeRate>;
    getMenuItems(restaurantId: RestaurantId): Promise<Array<MenuItem>>;
    getMenuItemsByCategory(restaurantId: RestaurantId): Promise<Array<[string, Array<MenuItem>]>>;
    getOrder(orderId: OrderId): Promise<OrderBatch | null>;
    getOrdersBySource(restaurantId: RestaurantId, source: OrderSource): Promise<Array<OrderBatch>>;
    getOrdersByStatus(restaurantId: RestaurantId, status: OrderStatus): Promise<Array<OrderBatch>>;
    getOrdersByStatusAndSource(restaurantId: RestaurantId, status: OrderStatus, source: OrderSource): Promise<Array<OrderBatch>>;
    getOrdersForRestaurant(restaurantId: RestaurantId): Promise<Array<OrderBatch>>;
    getOrdersForWaiter(restaurantId: RestaurantId): Promise<Array<OrderBatch>>;
    getRestaurant(restaurantId: RestaurantId): Promise<Restaurant | null>;
    getRestaurantByTableId(tableId: TableId): Promise<Restaurant | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getValidAccessCodesForRestaurant(restaurantId: RestaurantId): Promise<Array<AccessCodeData>>;
    initializeAccessControl(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(order: OrderBatch): Promise<OrderId>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setCustomAccessCode(restaurantId: RestaurantId, employeeId: EmployeeId, customCode: AccessCode): Promise<void>;
    updateAccessCode(code: AccessCode): Promise<AccessCode>;
    updateExchangeRate(newRate: ExchangeRate): Promise<void>;
    updateOrderStatus(orderId: OrderId, newStatus: OrderStatus): Promise<void>;
    updateRestaurant(restaurant: Restaurant): Promise<void>;
    validateRestaurantIdentityId(identityId: RestaurantIdentityId): Promise<boolean>;
    verifyAccessCode(code: AccessCode): Promise<{
        role?: UserRole;
        error: string;
        restaurantId?: RestaurantId;
        employeeId?: EmployeeId;
        isValid: boolean;
    }>;
}