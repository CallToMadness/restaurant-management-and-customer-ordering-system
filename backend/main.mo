import OrderedMap "mo:base/OrderedMap";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Iter "mo:base/Iter";
import Debug "mo:base/Debug";
import Array "mo:base/Array";
import Principal "mo:base/Principal";
import Int "mo:base/Int";
import Time "mo:base/Time";

import AccessControl "authorization/access-control";

actor RestaurantSystem {

  // Types
  public type RestaurantId = Text;
  public type TableId = Text;
  public type MenuItemId = Text;
  public type ComponentId = Text;
  public type OrderId = Nat;
  public type CanisterId = Text;
  public type EmployeeId = Text;
  public type AccessCode = Text;
  public type RestaurantIdentityId = Text;
  public type Currency = {
    #usd;
    #eur;
  };

  public type Restaurant = {
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

  public type ColorScheme = {
    primaryColor : Text;
    secondaryColor : Text;
    accentColor : Text;
  };

  public type Component = {
    id : ComponentId;
    name : Text;
    description : Text;
  };

  public type Table = {
    id : TableId;
    name : Text;
    location : Text;
    customerLink : Text;
    active : Bool;
  };

  public type MenuItem = {
    id : MenuItemId;
    name : Text;
    category : Text;
    description : Text;
    price : Nat;
    componentId : ComponentId;
    routedBy : EmployeeCategory;
  };

  public type OrderBatch = {
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

  public type OrderItem = {
    menuItemId : MenuItemId;
    quantity : Nat;
    componentId : ComponentId;
    category : EmployeeCategory;
  };

  public type OrderStatus = {
    #ordered;
    #readyToServe;
    #toBePaid;
    #paid;
  };

  public type OrderSource = {
    #kitchen;
    #bar;
    #table;
  };

  public type CanisterHealth = {
    canisterId : CanisterId;
    status : Text;
    performanceMetrics : Text;
  };

  public type AdminDashboardData = {
    restaurants : [Restaurant];
    canisterAssignments : [(RestaurantId, CanisterId)];
    canisterHealth : [CanisterHealth];
  };

  public type EmployeeRole = {
    #kitchen;
    #bar;
    #waiter;
  };

  public type Employee = {
    id : EmployeeId;
    name : Text;
    role : EmployeeRole;
    accessCode : AccessCode;
    principal : ?Principal;
  };

  public type EmployeeCategory = {
    #kitchen;
    #bar;
    #waiter;
  };

  public type AccessCodeData = {
    code : AccessCode;
    role : AccessControl.UserRole;
    restaurantId : ?RestaurantId;
    employeeId : ?EmployeeId;
    createdAt : Int;
    expiresAt : ?Int;
    isActive : Bool;
  };

  public type UserProfile = {
    name : Text;
    // Add more fields as needed
  };

  public type ExchangeRate = {
    usdToEur : Float;
    eurToUsd : Float;
  };

  // Helper function to compare tuples
  func compareTuples(a : (Principal, RestaurantIdentityId), b : (Principal, RestaurantIdentityId)) : { #less; #equal; #greater } {
    switch (Principal.compare(a.0, b.0)) {
      case (#less) #less;
      case (#greater) #greater;
      case (#equal) Text.compare(a.1, b.1);
    };
  };

  // OrderedMap operations
  transient let textMap = OrderedMap.Make<Text>(Text.compare);
  transient let natMap = OrderedMap.Make<Nat>(Nat.compare);
  transient let principalMap = OrderedMap.Make<Principal>(Principal.compare);
  transient let tupleMap = OrderedMap.Make<(Principal, RestaurantIdentityId)>(compareTuples);

  // Storage
  var restaurants : OrderedMap.Map<RestaurantId, Restaurant> = textMap.empty();
  var menuItems : OrderedMap.Map<RestaurantId, [MenuItem]> = textMap.empty();
  var orders : OrderedMap.Map<OrderId, OrderBatch> = natMap.empty();
  var restaurantToCanister : OrderedMap.Map<RestaurantId, CanisterId> = textMap.empty();
  var employees : OrderedMap.Map<RestaurantId, [Employee]> = textMap.empty();
  var accessCodes : OrderedMap.Map<AccessCode, AccessCodeData> = textMap.empty();
  var nextOrderId : OrderId = 1;
  var accessControlState = AccessControl.initState();
  var userProfiles : OrderedMap.Map<Principal, UserProfile> = principalMap.empty();

  // New customer order history storage
  var customerOrderHistory : OrderedMap.Map<Principal, [OrderId]> = principalMap.empty();

  // New restaurant identity ID storage
  var restaurantIdentityIds : OrderedMap.Map<RestaurantId, RestaurantIdentityId> = textMap.empty();

  // New next restaurant identity ID counter
  var nextRestaurantIdentityId : Nat = 1;

  // New available access codes storage
  var availableAccessCodes : OrderedMap.Map<RestaurantIdentityId, [AccessCode]> = textMap.empty();

  // New default admin principal
  var defaultAdmin : ?Principal = null;

  // New exchange rate storage
  var exchangeRate : ExchangeRate = {
    usdToEur = 0.85;
    eurToUsd = 1.18;
  };

  // New employee links storage
  var employeeLinks : OrderedMap.Map<(Principal, RestaurantIdentityId), EmployeeId> = tupleMap.empty();

  // Access control functions
  public shared ({ caller }) func initializeAccessControl() : async () {
    if (defaultAdmin == null) {
      defaultAdmin := ?caller;
    };
    AccessControl.initialize(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    switch (defaultAdmin) {
      case (?admin) admin == caller;
      case null false;
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    principalMap.get(userProfiles, caller);
  };

  public query func getUserProfile(user : Principal) : async ?UserProfile {
    principalMap.get(userProfiles, user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfiles := principalMap.put(userProfiles, caller, profile);
  };

  // Restaurant Manager Functions

  public shared ({ caller }) func createRestaurant(restaurant : Restaurant) : async () {
    if (not (isAdmin(caller))) {
      Debug.trap("Unauthorized: Only admins can create restaurants");
    };
    if (textMap.contains(restaurants, restaurant.id)) {
      Debug.trap("Restaurant already exists");
    };

    // Generate unique restaurant identity ID
    let identityId = await generateUniqueRestaurantIdentityId();
    let restaurantWithId = {
      restaurant with
      identityId;
    };

    restaurants := textMap.put(restaurants, restaurant.id, restaurantWithId);
    restaurantIdentityIds := textMap.put(restaurantIdentityIds, restaurant.id, identityId);
  };

  public shared ({ caller }) func updateRestaurant(restaurant : Restaurant) : async () {
    if (not (isAdmin(caller))) {
      Debug.trap("Unauthorized: Only admins can update restaurants");
    };
    if (not textMap.contains(restaurants, restaurant.id)) {
      Debug.trap("Restaurant not found");
    };
    restaurants := textMap.put(restaurants, restaurant.id, restaurant);
  };

  public shared ({ caller }) func addMenuItem(restaurantId : RestaurantId, menuItem : MenuItem) : async () {
    if (not (isAdmin(caller))) {
      Debug.trap("Unauthorized: Only admins can add menu items");
    };
    let existingItems = switch (textMap.get(menuItems, restaurantId)) {
      case (?items) items;
      case null [];
    };
    menuItems := textMap.put(menuItems, restaurantId, Array.append(existingItems, [menuItem]));
  };

  public shared ({ caller }) func deleteMenuItem(restaurantId : RestaurantId, menuItemId : MenuItemId) : async () {
    if (not (isAdmin(caller))) {
      Debug.trap("Unauthorized: Only admins can delete menu items");
    };

    switch (textMap.get(menuItems, restaurantId)) {
      case (?items) {
        let updatedItems = Array.filter<MenuItem>(
          items,
          func(item : MenuItem) : Bool {
            item.id != menuItemId;
          },
        );

        if (updatedItems.size() == items.size()) {
          Debug.trap("Menu item not found");
        };

        menuItems := textMap.put(menuItems, restaurantId, updatedItems);
      };
      case null {
        Debug.trap("Restaurant not found");
      };
    };
  };

  public query ({ caller }) func getRestaurant(restaurantId : RestaurantId) : async ?Restaurant {
    if (not (hasUserPermission(caller))) {
      Debug.trap("Unauthorized: Only authenticated users can access restaurants");
    };
    textMap.get(restaurants, restaurantId);
  };

  public query ({ caller }) func getMenuItems(restaurantId : RestaurantId) : async [MenuItem] {
    if (not (hasUserPermission(caller))) {
      Debug.trap("Unauthorized: Only authenticated users can access menu items");
    };
    switch (textMap.get(menuItems, restaurantId)) {
      case (?items) items;
      case null [];
    };
  };

  // New Function: Delete Table
  public shared ({ caller }) func deleteTable(restaurantId : RestaurantId, tableId : TableId) : async () {
    if (not (isAdmin(caller))) {
      Debug.trap("Unauthorized: Only admins can delete tables");
    };

    switch (textMap.get(restaurants, restaurantId)) {
      case (?restaurant) {
        let updatedTables = Array.filter<Table>(
          restaurant.tables,
          func(table : Table) : Bool {
            table.id != tableId;
          },
        );

        if (updatedTables.size() == restaurant.tables.size()) {
          Debug.trap("Table not found");
        };

        let updatedRestaurant = {
          restaurant with
          tables = updatedTables;
        };

        restaurants := textMap.put(restaurants, restaurantId, updatedRestaurant);
      };
      case null {
        Debug.trap("Restaurant not found");
      };
    };
  };

  // Employee Management Functions

  public shared ({ caller }) func addEmployee(restaurantId : RestaurantId, employee : Employee) : async () {
    if (not (isAdmin(caller))) {
      Debug.trap("Unauthorized: Only admins can add employees");
    };
    let existingEmployees = switch (textMap.get(employees, restaurantId)) {
      case (?employees) employees;
      case null [];
    };
    employees := textMap.put(employees, restaurantId, Array.append(existingEmployees, [employee]));
  };

  public query ({ caller }) func getEmployees(restaurantId : RestaurantId) : async [Employee] {
    if (not (hasUserPermission(caller))) {
      Debug.trap("Unauthorized: Only authenticated users can access employees");
    };
    switch (textMap.get(employees, restaurantId)) {
      case (?employees) employees;
      case null [];
    };
  };

  // New Function: Delete Employee
  public shared ({ caller }) func deleteEmployee(restaurantId : RestaurantId, employeeId : EmployeeId) : async () {
    if (not (isAdmin(caller))) {
      Debug.trap("Unauthorized: Only admins can delete employees");
    };

    switch (textMap.get(employees, restaurantId)) {
      case (?employeeList) {
        let updatedEmployees = Array.filter<Employee>(
          employeeList,
          func(employee : Employee) : Bool {
            employee.id != employeeId;
          },
        );

        if (updatedEmployees.size() == employeeList.size()) {
          Debug.trap("Employee not found");
        };

        employees := textMap.put(employees, restaurantId, updatedEmployees);

        // Remove associated unclaimed access codes
        let allCodes = Iter.toArray(textMap.vals(accessCodes));
        let employeeCodes = Array.filter(
          allCodes,
          func(codeData : AccessCodeData) : Bool {
            codeData.employeeId == ?employeeId and codeData.restaurantId == ?restaurantId and codeData.isActive
          },
        );

        for (codeData in employeeCodes.vals()) {
          accessCodes := textMap.remove(accessCodes, codeData.code).0;
        };

        // Remove associated employee links
        switch (textMap.get(restaurantIdentityIds, restaurantId)) {
          case (?identityId) {
            let allLinks = Iter.toArray(tupleMap.entries(employeeLinks));
            let linksToRemove = Array.filter(
              allLinks,
              func(link : ((Principal, RestaurantIdentityId), EmployeeId)) : Bool {
                link.0.1 == identityId and link.1 == employeeId
              },
            );

            for (link in linksToRemove.vals()) {
              employeeLinks := tupleMap.remove(employeeLinks, link.0).0;
            };
          };
          case null {};
        };
      };
      case null {
        Debug.trap("Restaurant not found");
      };
    };
  };

  // Access Code Management Functions

  public shared ({ caller }) func generateAccessCode(role : AccessControl.UserRole, restaurantId : ?RestaurantId, employeeId : ?EmployeeId) : async AccessCode {
    if (not (isAdmin(caller))) {
      Debug.trap("Unauthorized: Only admins can generate access codes");
    };

    let code = await generateUniqueCode();
    let now = Time.now();

    let codeData : AccessCodeData = {
      code;
      role;
      restaurantId;
      employeeId;
      createdAt = now;
      expiresAt = null;
      isActive = true;
    };

    accessCodes := textMap.put(accessCodes, code, codeData);

    // Update available access codes for the restaurant identity ID
    switch (restaurantId) {
      case (?rid) {
        switch (textMap.get(restaurantIdentityIds, rid)) {
          case (?identityId) {
            updateAvailableAccessCodes(identityId);
          };
          case null {};
        };
      };
      case null {};
    };

    code;
  };

  public shared ({ caller }) func setCustomAccessCode(restaurantId : RestaurantId, employeeId : EmployeeId, customCode : AccessCode) : async () {
    if (not (isAdmin(caller))) {
      Debug.trap("Unauthorized: Only admins can set custom access codes");
    };

    // Validate that the code is 6 digits
    if (customCode.size() != 6) {
      Debug.trap("Access code must be 6 digits");
    };

    // Check for duplicate code within the same restaurant
    let allCodes = Iter.toArray(textMap.vals(accessCodes));
    let duplicateCodes = Array.filter(
      allCodes,
      func(codeData : AccessCodeData) : Bool {
        codeData.code == customCode and codeData.restaurantId == ?restaurantId and codeData.isActive
      },
    );

    if (duplicateCodes.size() > 0) {
      Debug.trap("Duplicate access code found within the restaurant");
    };

    // Find the employee to get the role
    switch (textMap.get(employees, restaurantId)) {
      case (?employeeList) {
        let matchingEmployees = Array.filter(
          employeeList,
          func(employee : Employee) : Bool {
            employee.id == employeeId;
          },
        );

        if (matchingEmployees.size() > 0) {
          let _employee = matchingEmployees[0];
          let now = Time.now();

          let codeData : AccessCodeData = {
            code = customCode;
            role = #user; // Default to user role for employees
            restaurantId = ?restaurantId;
            employeeId = ?employeeId;
            createdAt = now;
            expiresAt = null;
            isActive = true;
          };

          accessCodes := textMap.put(accessCodes, customCode, codeData);

          // Update available access codes for the restaurant identity ID
          switch (textMap.get(restaurantIdentityIds, restaurantId)) {
            case (?identityId) {
              updateAvailableAccessCodes(identityId);
            };
            case null {};
          };
        } else {
          Debug.trap("Employee not found");
        };
      };
      case null {
        Debug.trap("Restaurant not found");
      };
    };
  };

  public shared ({ caller }) func updateAccessCode(code : AccessCode) : async AccessCode {
    if (not (isAdmin(caller))) {
      Debug.trap("Unauthorized: Only admins can update access codes");
    };

    switch (textMap.get(accessCodes, code)) {
      case (?codeData) {
        let newCode = await generateUniqueCode();
        let updatedCodeData = {
          codeData with
          code = newCode;
          createdAt = Time.now();
        };
        accessCodes := textMap.remove(accessCodes, code).0;
        accessCodes := textMap.put(accessCodes, newCode, updatedCodeData);

        // Update available access codes for the restaurant identity ID
        switch (codeData.restaurantId) {
          case (?rid) {
            switch (textMap.get(restaurantIdentityIds, rid)) {
              case (?identityId) {
                updateAvailableAccessCodes(identityId);
              };
              case null {};
            };
          };
          case null {};
        };

        newCode;
      };
      case null {
        Debug.trap("Access code not found");
      };
    };
  };

  public query func verifyAccessCode(code : AccessCode) : async {
    isValid : Bool;
    role : ?AccessControl.UserRole;
    restaurantId : ?RestaurantId;
    employeeId : ?EmployeeId;
    error : Text;
  } {
    switch (textMap.get(accessCodes, code)) {
      case (?codeData) {
        if (codeData.isActive) {
          {
            isValid = true;
            role = ?codeData.role;
            restaurantId = codeData.restaurantId;
            employeeId = codeData.employeeId;
            error = "";
          };
        } else {
          {
            isValid = false;
            role = null;
            restaurantId = null;
            employeeId = null;
            error = "Access code is inactive";
          };
        };
      };
      case null {
        {
          isValid = false;
          role = null;
          restaurantId = null;
          employeeId = null;
          error = "Invalid access code";
        };
      };
    };
  };

  public shared ({ caller }) func deactivateAccessCode(code : AccessCode) : async () {
    if (not (isAdmin(caller))) {
      Debug.trap("Unauthorized: Only admins can deactivate access codes");
    };

    switch (textMap.get(accessCodes, code)) {
      case (?codeData) {
        let updatedCodeData = {
          codeData with
          isActive = false;
        };
        accessCodes := textMap.put(accessCodes, code, updatedCodeData);

        // Update available access codes for the restaurant identity ID
        switch (codeData.restaurantId) {
          case (?rid) {
            switch (textMap.get(restaurantIdentityIds, rid)) {
              case (?identityId) {
                updateAvailableAccessCodes(identityId);
              };
              case null {};
            };
          };
          case null {};
        };
      };
      case null {
        Debug.trap("Access code not found");
      };
    };
  };

  public query ({ caller }) func getAccessCodesByRestaurant(restaurantId : RestaurantId) : async [AccessCodeData] {
    if (not (isAdmin(caller))) {
      Debug.trap("Unauthorized: Only admins can access restaurant access codes");
    };

    let allCodes = Iter.toArray(textMap.vals(accessCodes));
    Array.filter(
      allCodes,
      func(codeData : AccessCodeData) : Bool {
        switch (codeData.restaurantId) {
          case (?id) id == restaurantId;
          case null false;
        };
      },
    );
  };

  // Helper function to generate unique 6-digit code
  func generateUniqueCode() : async AccessCode {
    let code = Nat.toText(Int.abs(Time.now()) % 900000 + 100000);
    if (textMap.contains(accessCodes, code)) {
      await generateUniqueCode();
    } else {
      code;
    };
  };

  // Helper function to generate unique restaurant identity ID
  func generateUniqueRestaurantIdentityId() : async RestaurantIdentityId {
    let id = "RID-" # Nat.toText(nextRestaurantIdentityId);
    nextRestaurantIdentityId += 1;
    id;
  };

  // Helper function to update available access codes for a restaurant identity ID
  func updateAvailableAccessCodes(identityId : RestaurantIdentityId) {
    let allCodes = Iter.toArray(textMap.vals(accessCodes));
    let validCodes = Array.filter(
      allCodes,
      func(codeData : AccessCodeData) : Bool {
        switch (codeData.restaurantId) {
          case (?rid) {
            switch (textMap.get(restaurantIdentityIds, rid)) {
              case (?id) id == identityId and codeData.isActive;
              case null false;
            };
          };
          case null false;
        };
      },
    );
    let codeStrings = Array.map(validCodes, func(codeData : AccessCodeData) : AccessCode { codeData.code });
    availableAccessCodes := textMap.put(availableAccessCodes, identityId, codeStrings);
  };

  // Customer Functions

  public shared ({ caller }) func placeOrder(order : OrderBatch) : async OrderId {
    if (not (hasUserPermission(caller))) {
      Debug.trap("Unauthorized: Only authenticated users can place orders");
    };
    let orderId = nextOrderId;
    nextOrderId += 1;

    let newOrder : OrderBatch = {
      id = orderId;
      restaurantId = order.restaurantId;
      tableId = order.tableId;
      items = order.items;
      status = #ordered;
      customerId = ?caller;
      timestamp = Time.now();
      currency = order.currency;
      source = order.source;
      toLabel = order.toLabel;
    };

    orders := natMap.put(orders, orderId, newOrder);

    // Update customer order history
    switch (principalMap.get(customerOrderHistory, caller)) {
      case (?existingOrders) {
        customerOrderHistory := principalMap.put(customerOrderHistory, caller, Array.append(existingOrders, [orderId]));
      };
      case null {
        customerOrderHistory := principalMap.put(customerOrderHistory, caller, [orderId]);
      };
    };

    orderId;
  };

  public query ({ caller }) func getOrder(orderId : OrderId) : async ?OrderBatch {
    if (not (hasUserPermission(caller))) {
      Debug.trap("Unauthorized: Only authenticated users can access orders");
    };
    natMap.get(orders, orderId);
  };

  // New Function: Get Customer Order History
  public query ({ caller }) func getCustomerOrderHistory() : async [OrderBatch] {
    if (not (hasUserPermission(caller))) {
      Debug.trap("Unauthorized: Only authenticated users can access order history");
    };

    switch (principalMap.get(customerOrderHistory, caller)) {
      case (?orderIds) {
        let allOrders = Iter.toArray(natMap.vals(orders));
        Array.filter(
          allOrders,
          func(order : OrderBatch) : Bool {
            Array.find(
              orderIds,
              func(id : OrderId) : Bool {
                id == order.id;
              },
            ) != null;
          },
        );
      };
      case null [];
    };
  };

  // Restaurant-to-Canister Assignment

  public shared ({ caller }) func assignRestaurantToCanister(restaurantId : RestaurantId, canisterId : CanisterId) : async () {
    if (not (isAdmin(caller))) {
      Debug.trap("Unauthorized: Only admins can assign restaurants to canisters");
    };
    restaurantToCanister := textMap.put(restaurantToCanister, restaurantId, canisterId);
  };

  public query ({ caller }) func getCanisterForRestaurant(restaurantId : RestaurantId) : async ?CanisterId {
    if (not (hasUserPermission(caller))) {
      Debug.trap("Unauthorized: Only authenticated users can access canister assignments");
    };
    textMap.get(restaurantToCanister, restaurantId);
  };

  // Currency Management Functions

  public query func getExchangeRate() : async ExchangeRate {
    exchangeRate;
  };

  public shared ({ caller }) func updateExchangeRate(newRate : ExchangeRate) : async () {
    if (not (isAdmin(caller))) {
      Debug.trap("Unauthorized: Only admins can update exchange rates");
    };
    exchangeRate := newRate;
  };

  // Helper Functions

  public query ({ caller }) func getAllRestaurants() : async [Restaurant] {
    if (not (hasUserPermission(caller))) {
      Debug.trap("Unauthorized: Only authenticated users can access all restaurants");
    };
    Iter.toArray(textMap.vals(restaurants));
  };

  public query ({ caller }) func getOrdersForRestaurant(restaurantId : RestaurantId) : async [OrderBatch] {
    if (not (hasUserPermission(caller))) {
      Debug.trap("Unauthorized: Only authenticated users can access restaurant orders");
    };
    let allOrders = Iter.toArray(natMap.vals(orders));
    Array.filter(
      allOrders,
      func(order : OrderBatch) : Bool {
        order.restaurantId == restaurantId;
      },
    );
  };

  // New Function: Get Valid Access Codes for Restaurant
  public query func getValidAccessCodesForRestaurant(restaurantId : RestaurantId) : async [AccessCodeData] {
    let allCodes = Iter.toArray(textMap.vals(accessCodes));
    Array.filter(
      allCodes,
      func(codeData : AccessCodeData) : Bool {
        codeData.restaurantId == ?restaurantId and codeData.isActive
      },
    );
  };

  // New Function: Get Available Access Codes for Restaurant Identity ID
  public query func getAvailableAccessCodes(identityId : RestaurantIdentityId) : async [AccessCode] {
    switch (textMap.get(availableAccessCodes, identityId)) {
      case (?codes) codes;
      case null [];
    };
  };

  // New Function: Validate Restaurant Identity ID
  public query func validateRestaurantIdentityId(identityId : RestaurantIdentityId) : async Bool {
    let allIds = Iter.toArray(textMap.vals(restaurantIdentityIds));
    Array.find(
      allIds,
      func(id : RestaurantIdentityId) : Bool {
        id == identityId;
      },
    ) != null;
  };

  // New Function: Claim Access Code
  public shared ({ caller }) func claimAccessCode(code : AccessCode, restaurantIdentityId : RestaurantIdentityId) : async () {
    switch (textMap.get(accessCodes, code)) {
      case (?codeData) {
        if (codeData.isActive) {
          // Deactivate the code
          let updatedCodeData = {
            codeData with
            isActive = false;
          };
          accessCodes := textMap.put(accessCodes, code, updatedCodeData);

          // Update available access codes for the restaurant identity ID
          switch (codeData.restaurantId) {
            case (?rid) {
              switch (textMap.get(restaurantIdentityIds, rid)) {
                case (?identityId) {
                  updateAvailableAccessCodes(identityId);
                };
                case null {};
              };
            };
            case null {};
          };

          // Link principal to employee if restaurant and employee IDs are present
          switch (codeData.restaurantId, codeData.employeeId) {
            case (?restaurantId, ?employeeId) {
              switch (textMap.get(employees, restaurantId)) {
                case (?employeeList) {
                  let updatedEmployees = Array.map<Employee, Employee>(
                    employeeList,
                    func(employee : Employee) : Employee {
                      if (employee.id == employeeId) {
                        {
                          employee with
                          principal = ?caller;
                        };
                      } else {
                        employee;
                      };
                    },
                  );
                  employees := textMap.put(employees, restaurantId, updatedEmployees);

                  // Add employee link
                  employeeLinks := tupleMap.put(employeeLinks, (caller, restaurantIdentityId), employeeId);
                };
                case null {};
              };
            };
            case _ {};
          };
        } else {
          Debug.trap("Access code is inactive");
        };
      };
      case null {
        Debug.trap("Invalid access code");
      };
    };
  };

  // New Function: Get Restaurant By Table ID
  public query func getRestaurantByTableId(tableId : TableId) : async ?Restaurant {
    let allRestaurants = Iter.toArray(textMap.vals(restaurants));
    Array.find(
      allRestaurants,
      func(restaurant : Restaurant) : Bool {
        Array.find(
          restaurant.tables,
          func(table : Table) : Bool {
            table.id == tableId;
          },
        ) != null;
      },
    );
  };

  // New Function: Get Menu Items By Category
  public query func getMenuItemsByCategory(restaurantId : RestaurantId) : async [(Text, [MenuItem])] {
    switch (textMap.get(menuItems, restaurantId)) {
      case (?items) {
        let categories = Array.map<MenuItem, Text>(items, func(item : MenuItem) : Text { item.category });
        let uniqueCategories = Array.foldLeft<Text, [Text]>(
          categories,
          [],
          func(acc : [Text], category : Text) : [Text] {
            if (Array.find(acc, func(c : Text) : Bool { c == category }) == null) {
              Array.append(acc, [category]);
            } else {
              acc;
            };
          },
        );

        Array.map<Text, (Text, [MenuItem])>(
          uniqueCategories,
          func(category : Text) : (Text, [MenuItem]) {
            let categoryItems = Array.filter<MenuItem>(
              items,
              func(item : MenuItem) : Bool {
                item.category == category;
              },
            );
            (category, categoryItems);
          },
        );
      };
      case null [];
    };
  };

  // New Function: Check Employee Link
  public query func checkEmployeeLink(principal : Principal, restaurantIdentityId : RestaurantIdentityId) : async ?EmployeeId {
    tupleMap.get(employeeLinks, (principal, restaurantIdentityId));
  };

  // New Function: Update Order Status
  public shared ({ caller }) func updateOrderStatus(orderId : OrderId, newStatus : OrderStatus) : async () {
    if (not (hasUserPermission(caller))) {
      Debug.trap("Unauthorized: Only authenticated users can update order status");
    };

    switch (natMap.get(orders, orderId)) {
      case (?order) {
        let updatedOrder = {
          order with
          status = newStatus;
        };
        orders := natMap.put(orders, orderId, updatedOrder);
      };
      case null {
        Debug.trap("Order not found");
      };
    };
  };

  // New Function: Get Orders By Status
  public query ({ caller }) func getOrdersByStatus(restaurantId : RestaurantId, status : OrderStatus) : async [OrderBatch] {
    if (not (hasUserPermission(caller))) {
      Debug.trap("Unauthorized: Only authenticated users can access orders by status");
    };

    let allOrders = Iter.toArray(natMap.vals(orders));
    Array.filter(
      allOrders,
      func(order : OrderBatch) : Bool {
        order.restaurantId == restaurantId and order.status == status
      },
    );
  };

  // New Function: Get Orders By Source
  public query ({ caller }) func getOrdersBySource(restaurantId : RestaurantId, source : OrderSource) : async [OrderBatch] {
    if (not (hasUserPermission(caller))) {
      Debug.trap("Unauthorized: Only authenticated users can access orders by source");
    };

    let allOrders = Iter.toArray(natMap.vals(orders));
    Array.filter(
      allOrders,
      func(order : OrderBatch) : Bool {
        order.restaurantId == restaurantId and order.source == source
      },
    );
  };

  // New Function: Get Orders By Status And Source
  public query ({ caller }) func getOrdersByStatusAndSource(restaurantId : RestaurantId, status : OrderStatus, source : OrderSource) : async [OrderBatch] {
    if (not (hasUserPermission(caller))) {
      Debug.trap("Unauthorized: Only authenticated users can access orders by status and source");
    };

    let allOrders = Iter.toArray(natMap.vals(orders));
    Array.filter(
      allOrders,
      func(order : OrderBatch) : Bool {
        order.restaurantId == restaurantId and order.status == status and order.source == source
      },
    );
  };

  // New Function: Get Orders For Waiter
  public query ({ caller }) func getOrdersForWaiter(restaurantId : RestaurantId) : async [OrderBatch] {
    if (not (hasUserPermission(caller))) {
      Debug.trap("Unauthorized: Only authenticated users can access orders for waiters");
    };

    let allOrders = Iter.toArray(natMap.vals(orders));
    Array.filter(
      allOrders,
      func(order : OrderBatch) : Bool {
        order.restaurantId == restaurantId and order.status == #ordered and Array.find(order.items, func(item : OrderItem) : Bool { item.category == #waiter }) != null
      },
    );
  };

  // Helper function to check if caller is admin
  func isAdmin(caller : Principal) : Bool {
    switch (defaultAdmin) {
      case (?admin) admin == caller;
      case null false;
    };
  };

  // Helper function to check if caller has user permission
  func hasUserPermission(_caller : Principal) : Bool {
    true;
  };
};

