import OrderedMap "mo:base/OrderedMap";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Int "mo:base/Int";
import Time "mo:base/Time";

module {
  type RestaurantId = Text;
  type TableId = Text;
  type MenuItemId = Text;
  type ComponentId = Text;
  type OrderId = Nat;
  type CanisterId = Text;
  type EmployeeId = Text;
  type AccessCode = Text;
  type RestaurantIdentityId = Text;
  type Currency = {
    #usd;
    #eur;
  };

  type Restaurant = {
    id : RestaurantId;
    identityId : RestaurantIdentityId;
    name : Text;
    address : Text;
    description : Text;
    colorScheme : ColorScheme;
    components : [Component];
    tables : [Table];
    manager : Principal;
    defaultCurrency : Currency;
  };

  type ColorScheme = {
    primaryColor : Text;
    secondaryColor : Text;
    accentColor : Text;
  };

  type Component = {
    id : ComponentId;
    name : Text;
    description : Text;
  };

  type Table = {
    id : TableId;
    name : Text;
    location : Text;
    customerLink : Text;
    active : Bool;
  };

  type MenuItem = {
    id : MenuItemId;
    name : Text;
    category : Text;
    description : Text;
    price : Nat;
    componentId : ComponentId;
    routedBy : EmployeeCategory;
  };

  type OrderBatch = {
    id : OrderId;
    restaurantId : RestaurantId;
    tableId : TableId;
    items : [OrderItem];
    status : OrderStatus;
    customerId : ?Principal;
    timestamp : Int;
    currency : Currency;
    source : OrderSource;
    toLabel : Text;
  };

  type OrderItem = {
    menuItemId : MenuItemId;
    quantity : Nat;
    componentId : ComponentId;
    category : EmployeeCategory;
  };

  type OrderStatus = {
    #ordered;
    #readyToServe;
    #toBePaid;
    #paid;
  };

  type OrderSource = {
    #kitchen;
    #bar;
    #table;
  };

  type CanisterHealth = {
    canisterId : CanisterId;
    status : Text;
    performanceMetrics : Text;
  };

  type AdminDashboardData = {
    restaurants : [Restaurant];
    canisterAssignments : [(RestaurantId, CanisterId)];
    canisterHealth : [CanisterHealth];
  };

  type EmployeeRole = {
    #kitchen;
    #bar;
    #waiter;
  };

  type Employee = {
    id : EmployeeId;
    name : Text;
    role : EmployeeRole;
    accessCode : AccessCode;
    principal : ?Principal;
  };

  type EmployeeCategory = {
    #kitchen;
    #bar;
    #waiter;
  };

  type AccessCodeData = {
    code : AccessCode;
    role : {
      #admin;
      #user;
      #guest;
    };
    restaurantId : ?RestaurantId;
    employeeId : ?EmployeeId;
    createdAt : Int;
    expiresAt : ?Int;
    isActive : Bool;
  };

  type UserProfile = {
    name : Text;
    // Add more fields as needed
  };

  type ExchangeRate = {
    usdToEur : Float;
    eurToUsd : Float;
  };

  type OldActor = {
    restaurants : OrderedMap.Map<RestaurantId, Restaurant>;
    menuItems : OrderedMap.Map<RestaurantId, [MenuItem]>;
    orders : OrderedMap.Map<OrderId, OrderBatch>;
    restaurantToCanister : OrderedMap.Map<RestaurantId, CanisterId>;
    employees : OrderedMap.Map<RestaurantId, [Employee]>;
    accessCodes : OrderedMap.Map<AccessCode, AccessCodeData>;
    nextOrderId : OrderId;
    userProfiles : OrderedMap.Map<Principal, UserProfile>;
    customerOrderHistory : OrderedMap.Map<Principal, [OrderId]>;
    restaurantIdentityIds : OrderedMap.Map<RestaurantId, RestaurantIdentityId>;
    nextRestaurantIdentityId : Nat;
    availableAccessCodes : OrderedMap.Map<RestaurantIdentityId, [AccessCode]>;
    defaultAdmin : ?Principal;
    exchangeRate : ExchangeRate;
    employeeLinks : OrderedMap.Map<(Principal, RestaurantIdentityId), EmployeeId>;
  };

  type NewActor = {
    restaurants : OrderedMap.Map<RestaurantId, Restaurant>;
    menuItems : OrderedMap.Map<RestaurantId, [MenuItem]>;
    orders : OrderedMap.Map<OrderId, OrderBatch>;
    restaurantToCanister : OrderedMap.Map<RestaurantId, CanisterId>;
    employees : OrderedMap.Map<RestaurantId, [Employee]>;
    accessCodes : OrderedMap.Map<AccessCode, AccessCodeData>;
    nextOrderId : OrderId;
    userProfiles : OrderedMap.Map<Principal, UserProfile>;
    customerOrderHistory : OrderedMap.Map<Principal, [OrderId]>;
    restaurantIdentityIds : OrderedMap.Map<RestaurantId, RestaurantIdentityId>;
    nextRestaurantIdentityId : Nat;
    availableAccessCodes : OrderedMap.Map<RestaurantIdentityId, [AccessCode]>;
    defaultAdmin : ?Principal;
    exchangeRate : ExchangeRate;
    employeeLinks : OrderedMap.Map<(Principal, RestaurantIdentityId), EmployeeId>;
  };

  public func run(old : OldActor) : NewActor {
    let textMap = OrderedMap.Make<Text>(Text.compare);
    let natMap = OrderedMap.Make<Nat>(Nat.compare);

    // Update menu items to ensure correct routing for waiters
    let updatedMenuItems = textMap.map<[MenuItem], [MenuItem]>(
      old.menuItems,
      func(_restaurantId, items) {
        Array.map<MenuItem, MenuItem>(
          items,
          func(item) {
            if (item.routedBy == #waiter) {
              { item with routedBy = #waiter };
            } else {
              item;
            };
          },
        );
      },
    );

    // Update orders to ensure correct routing for waiters
    let updatedOrders = natMap.map<OrderBatch, OrderBatch>(
      old.orders,
      func(_orderId, order) {
        let updatedItems = Array.map<OrderItem, OrderItem>(
          order.items,
          func(item) {
            if (item.category == #waiter) {
              { item with category = #waiter };
            } else {
              item;
            };
          },
        );
        { order with items = updatedItems };
      },
    );

    {
      old with
      menuItems = updatedMenuItems;
      orders = updatedOrders;
    };
  };
};
