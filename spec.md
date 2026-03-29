# Restaurant Management and Customer Ordering System

## Overview
A restaurant management system that allows restaurant owners to manage their establishments and customers to place orders through table-specific links or through authenticated customer accounts. The system enforces strict role separation between restaurant managers, customers, and platform administrators, with robust authentication and reliable table link resolution using unique table identifiers. Each restaurant is assigned a unique restaurant identity ID in the format "RID-#" (e.g., "RID-1", "RID-2", "RID-10") for easy identification and reference. The application is fully responsive and optimized for mobile devices with touch-friendly controls and adaptive layouts. **The system enforces strict per-account data isolation, ensuring each Internet Identity account can only access their own data and activities across all roles (manager, employee, customer).** **The admin dashboard is integrated within the manager dashboard and is only accessible to the first Internet Identity account that ever connected to the app, serving as the default and only admin.**

## Mobile Responsiveness Requirements
The application must be fully responsive and optimized for mobile devices:
- All pages, components, and navigation must adapt seamlessly to smartphone screens
- Touch-friendly controls with appropriate button sizes and spacing for mobile interaction
- Adaptive layouts that reorganize content effectively on small screens
- Readable text with appropriate font sizes and contrast for mobile viewing
- Enhanced UI/UX for mobile with improved spacing and accessibility
- All dashboards (manager, employee, admin, customer) must be easy to use on smartphones
- Customer ordering flows must be optimized for mobile touch interaction
- Modal dialogs, forms, and tables must be fully usable on small screens
- Critical actions (ordering, login, code entry, employee management) must be seamless on mobile devices
- Navigation menus must be mobile-friendly with appropriate touch targets

## Authentication Requirements
- Restaurant managers must connect/authenticate before accessing the management dashboard
- **Manager authentication must handle cases where no Internet Identity is connected by prompting for authentication as needed**
- **Manager dashboard must properly handle authentication for all Internet Identity accounts (both admin and non-admin) without infinite loading or errors**
- **Manager dashboard must gracefully handle scenarios where managers have not yet created any restaurants by displaying appropriate onboarding prompts or empty state messages**
- Customers accessing table-specific links are directed straight to the ordering interface without authentication prompts
- Customers can also authenticate through the customer login option to access their dashboard and order history
- **Customer authentication must handle cases where no Internet Identity is connected by prompting for authentication as needed**
- Employees must connect/authenticate with their Internet Identity and enter their restaurant ID in the format "RID-#" to access their role-specific views
- **Once an Internet Identity is linked to an employee profile for a given restaurant (by restaurant ID in the "RID-#" format), subsequent logins as employee with that Internet Identity and restaurant ID skip the access code prompt entirely and go directly to the employee dashboard**
- **The system must robustly check for an existing Internet Identity-to-employee link for the selected restaurant before showing any code prompt**
- Authentication is required for management, employee, and customer dashboard functionality
- The same account can be used for multiple roles, but access is strictly controlled based on the interface being accessed
- All authentication flows must be mobile-optimized with touch-friendly input fields and buttons
- **Each Internet Identity account can only access data and activities associated with their own account across all roles**
- **The first Internet Identity account that ever connected to the app is designated as the default admin and gains access to admin functionality within their manager dashboard**
- **Authentication flows must gracefully handle scenarios where users attempt to access protected areas without being connected to Internet Identity**
- **All manager and customer login buttons must work reliably for all users regardless of their current authentication state or whether they have created restaurants/placed orders**

## Logout Functionality
The application must provide secure logout functionality:
- A logout button is prominently displayed at the top right of all main views and dashboards
- The logout button is visible and accessible on manager, employee, customer, and admin interfaces
- Clicking the logout button securely terminates the Internet Identity session
- After logout, users are redirected to the main app landing page
- The logout button is mobile-optimized with appropriate sizing and touch-friendly design
- Logout functionality works consistently across all roles and interfaces
- The system ensures complete session termination and prevents unauthorized access after logout

## Strict Data Isolation and Account Privacy
The system enforces complete per-account data isolation to ensure:
- **Manager accounts can only view and manage restaurants they personally own/created**
- **Employee accounts can only access employee views for restaurants where they are specifically assigned through their own Internet Identity**
- **Customer accounts can only view their own order history and personal data from their own restaurant visits**
- **No Internet Identity account can access data, dashboards, or activities belonging to any other Internet Identity account**
- **All backend operations validate account ownership before returning any data**
- **Frontend components only display data that belongs to the authenticated Internet Identity account**
- **Cross-account data access is completely prevented at both backend and frontend levels**
- **The default admin (first Internet Identity) can access admin functionality within their manager dashboard while maintaining data isolation for their own restaurant data**
- **Each Internet Identity has completely separate and private manager, employee, and customer views**
- **No shared data or cross-contamination between different Internet Identity accounts in any role**

## Main App Landing Page
The main app landing page displays three distinct authentication options with mobile-responsive design:
- "Login and open dashboard as a manager" button for restaurant managers
- "Login and open dashboard as an employee" button for employees
- "Login as a customer" button for customers to access their dashboard and order history
- All buttons are prominently displayed with clear visual distinction and appropriate sizing for mobile touch
- **All login buttons must work reliably for all users regardless of authentication state or data status**
- Selecting the manager button routes to manager authentication and directly to the management dashboard
- Selecting the employee button routes to employee authentication followed by restaurant ID entry using the "RID-#" format
- Selecting the customer button routes to customer authentication and directly to the customer dashboard
- Landing page layout adapts to mobile screens with proper spacing and button sizing
- **No separate admin button is displayed - admin access is integrated within the manager dashboard for the default admin**

## Manager Dashboard Empty State Handling
The manager dashboard must gracefully handle scenarios where managers have not yet created restaurants:
- **When a manager has no restaurants, display a clear onboarding interface with instructions to create their first restaurant**
- Show a prominent "Create Your First Restaurant" button or card with clear call-to-action
- Provide helpful guidance text explaining the restaurant setup process
- Display the manager's authentication status and confirm they are logged in correctly
- **Never show infinite loading states or errors when a manager has no restaurants**
- Ensure the empty state interface is mobile-optimized with touch-friendly controls
- Allow managers to immediately begin the restaurant creation process from the empty state
- **For the default admin with no restaurants: Show both the restaurant creation onboarding and admin functionality sections**
- Maintain consistent navigation and logout functionality even in empty states

## Employee Access Code System and Internet Identity Linking
The employee access code system provides secure one-time linking of employee accounts to Internet Identity using the simple restaurant identity ID format:

### Code Assignment and Storage
- Managers can set a one-time 6-digit code for each employee through the employee management interface
- Codes can be manually defined by managers or auto-generated
- Each code is unique within the restaurant and immediately stored in the backend with proper restaurant ID association
- Codes are valid until first use and associated with the specific employee and restaurant using the "RID-#" format
- The backend maintains secure mapping of codes to employee records and restaurant IDs in the "RID-#" format with immediate availability for verification
- **When a manager creates or sets a new access code for an employee, the backend immediately updates the list of available (active, unclaimed) access codes for the corresponding restaurant identity ID**

### Employee Login and Internet Identity Linking
- **For first-time login, employees authenticate with Internet Identity, enter restaurant ID in "RID-#" format, and the system immediately checks for an existing Internet Identity-to-employee link for that restaurant**
- **If an existing link is found, the employee is routed directly to their dashboard without any code prompt**
- **Only if no existing link is found does the system prompt for the 6-digit access code**
- **The system validates that the restaurant ID exists as an actual manager-created restaurant record (not just pattern matching)**
- **The system validates that the code is active, unclaimed, and assigned to a valid employee for that specific restaurant**
- **Upon successful validation, the employee's Internet Identity is permanently linked to their employee account for that specific restaurant**
- **Each Internet Identity can only be linked to one employee profile per restaurant (by restaurant ID), preventing multiple links for the same account within a single restaurant**
- **The code is immediately deactivated and removed from the manager's dashboard**
- **For all subsequent logins, employees only need Internet Identity and restaurant ID in "RID-#" format - the system checks for the existing link and routes directly to the employee dashboard, completely bypassing the code entry step**
- **The employee login flow always checks for an existing Internet Identity-to-employee link before showing any code prompt**

### Code Management and Error Handling
- Managers can only see unclaimed codes in their dashboard - claimed codes are automatically removed
- **Managers never see codes for employees who are already linked to Internet Identity accounts**
- **When employee login fails due to invalid code, the error message displays a generic error without revealing any access codes**
- Clear error messages for invalid restaurant ID in "RID-#" format, already used codes, or non-existent codes
- All codes are unique within each restaurant with validation and immediate feedback
- **The frontend always fetches and displays the up-to-date list of valid access codes for each restaurant after any code creation, update, or deletion, ensuring managers and employees see the correct codes in real time**

### Code Cleanup on Employee Deletion
- When an employee is deleted from the system, all unclaimed (unused) access codes assigned to that employee are automatically deleted from the backend
- **Any existing Internet Identity links for that employee are also removed from the system**
- The employee management interface immediately reflects the removal of these codes, keeping the list of valid codes accurate and up to date
- The system ensures that deleted employees cannot have orphaned codes or links remaining in the system
- Migration logic handles cleanup of any existing unclaimed codes and duplicate links for already-deleted employees

### Internet Identity Link Migration and Enforcement
- **All existing employee data is migrated to enforce the one-link-per-restaurant rule, ensuring each Internet Identity can only be linked to one employee profile per restaurant**
- **The migration process identifies and preserves all existing Internet Identity-to-employee links, ensuring previously linked employees are recognized**
- **Any duplicate links are resolved by keeping the most recent or first valid link and removing others**
- **The migration maintains data integrity while enforcing the new linking constraints**
- **All previously linked Internet Identity accounts are guaranteed to skip the code prompt on future logins**

## Role Separation and Access Control
The system enforces complete separation between manager, customer, employee, and administrator interfaces with mobile-responsive design:
- The main app landing page shows three distinct login buttons for managers, employees, and customers with mobile-appropriate sizing
- Restaurant managers selecting the manager button are authenticated and routed directly to the management dashboard **showing only their own restaurants or appropriate empty state if no restaurants exist**
- **The default admin (first Internet Identity) sees admin functionality integrated within their manager dashboard**
- Employees selecting the employee button are authenticated and then prompted for their restaurant ID in "RID-#" format, with the system immediately checking for existing links before showing any code prompt **with access only to restaurants where they are assigned**
- Customers selecting the customer button are authenticated and routed directly to the customer dashboard **showing only their own order history or appropriate empty state if no orders exist**
- Customers accessing table links are routed directly to the mobile-optimized ordering interface for their specific table without authentication
- **Admin functionality is only visible within the manager dashboard for the first Internet Identity account that ever connected to the app**
- No cross-contamination between interfaces, regardless of account permissions
- Clear routing logic that prevents users from accidentally accessing unauthorized features
- Strict conditional rendering ensures role-appropriate interface visibility
- All interfaces are fully responsive and touch-optimized
- **All data access is filtered by the authenticated Internet Identity to prevent cross-account data exposure**
- A logout button is available at the top right of all interfaces for secure session termination
- **Robust error handling ensures no infinite loading states when users have no associated data**

## Restaurant Manager Interface
After authentication through the manager login button, restaurant owners can access a mobile-responsive management dashboard to:
- **View only restaurants owned/created by their specific Internet Identity account**
- **Display appropriate onboarding interface when no restaurants exist, with clear instructions to create the first restaurant**
- View their restaurant's unique identity ID in "RID-#" format prominently displayed at the top of the dashboard for easy reference and identification
- Set up restaurant details (name, address, description) using mobile-friendly forms
- **Configure the default currency for menu item prices with options for "USD" (American dollar) and "EUR" (Euro) through a currency selection setting in the restaurant configuration**
- Define and manage menu items with categories, descriptions, prices in the selected default currency, and employee category assignments through touch-optimized interfaces
- **Manage only employees assigned to their own restaurants** by adding them with specified roles (kitchen, bar, or waiter) using mobile-responsive forms
- Configure restaurant components (kitchen, bar, etc.) for order routing
- Set up tables with unique table identifiers (TableId) through mobile-friendly table management
- Activate or deactivate tables using an "active" flag with touch-friendly toggle controls
- Delete tables from their restaurant configuration with mobile-optimized confirmation prompts
- Customize the restaurant's color scheme and branding through responsive design tools
- Generate and manage table links using the format `/?table=TABLE_ID` as URL query parameters
- View all generated links for active tables in the dashboard for easy sharing with mobile-friendly display
- Copy and share table links with clear functionality for managers optimized for mobile sharing
- Set one-time 6-digit codes for employees through the mobile-responsive employee management interface
- **View only unclaimed codes for employees who are not yet linked to Internet Identity accounts - codes for already linked employees are never displayed**
- **View orders only from their own restaurants** with filtered status display showing only orders with "to be paid" or "paid" status in the manager's order dashboard
- Access order management functionality that displays the order lifecycle clearly with only relevant payment-related statuses visible
- Access restaurant data reset functionality through a "Reset Restaurant Data" button in the settings or advanced section with secure confirmation dialog
- **For the default admin (first Internet Identity): Access integrated admin functionality within the manager dashboard including platform management, canister monitoring, and system administration tools**
- Access logout functionality through a logout button at the top right of the dashboard

## Integrated Admin Dashboard (Default Admin Only)
**The first Internet Identity account that ever connected to the app gains access to admin functionality integrated within their manager dashboard:**
- Admin functionality appears as additional sections or tabs within the manager dashboard interface
- **Admin functionality is visible even when the default admin has no restaurants, alongside the restaurant creation onboarding interface**
- View and manage all restaurants across the platform using mobile-optimized layouts
- List all restaurants with their assigned canisters, unique restaurant identity IDs in "RID-#" format, and current status in responsive tables
- Monitor canister health and performance metrics through mobile-friendly displays
- Assign restaurants to specific canisters using touch-optimized controls
- Migrate restaurants between canisters with data export/import functionality through mobile-responsive interfaces
- Add new canisters to the platform as needed using mobile-friendly forms
- Update routing configurations when restaurants are migrated
- Categorize canisters by performance and health metrics using responsive filtering
- Access comprehensive platform analytics and system status through mobile-optimized dashboards
- Trigger the restaurant identity ID migration routine manually if needed through admin controls
- Access restaurant data reset functionality for any restaurant through admin controls with secure confirmation
- **Trigger the complete app data reset migration routine that removes all data associated with every Internet Identity account through admin controls with secure confirmation**
- **Admin functionality is seamlessly integrated within the manager interface and only visible to the default admin**
- **All other users, including other managers, employees, and customers, do not see any admin functionality**
- Access logout functionality through a logout button at the top right of the dashboard

## Restaurant Data Reset Feature
Restaurant managers can reset all data for their restaurant through a secure reset functionality:
- A "Reset Restaurant Data" button is available in the settings or advanced section of the manager dashboard
- The button is prominently displayed with appropriate warning styling to indicate the destructive nature of the operation
- Clicking the button opens a confirmation dialog that clearly explains the consequences of the reset operation
- The confirmation dialog lists all data that will be permanently deleted: employees, tables, menu items, orders, and access codes
- The dialog requires explicit confirmation through a typed confirmation phrase or multiple confirmation steps
- **The reset operation only affects the specific restaurant owned by the authenticated manager** and does not impact other restaurants or global app data
- After successful reset, the manager is redirected to a clean restaurant setup interface to begin configuring their restaurant again
- The reset functionality is mobile-optimized with touch-friendly confirmation controls

## Complete App Data Reset Feature (Admin Only)
**The default admin can reset all application data through a secure complete reset functionality:**
- A "Complete App Data Reset" button is available in the admin section of the manager dashboard for the default admin only
- The button is prominently displayed with critical warning styling to indicate the destructive nature of the operation
- Clicking the button opens a confirmation dialog that clearly explains the consequences of the complete reset operation
- The confirmation dialog lists all data that will be permanently deleted: all restaurants, all employees, all customers, all orders, all access codes, all user profiles, and all Internet Identity associations
- The dialog requires explicit confirmation through multiple confirmation steps and typed confirmation phrases
- **The reset operation affects all data in the entire application, removing everything associated with every Internet Identity account**
- After successful reset, the system is in a clean state as if nobody has ever connected to the app
- The complete reset functionality is mobile-optimized with touch-friendly confirmation controls
- **Only the default admin can access and execute this complete app data reset functionality**

## Currency Management and Price Display
The system provides comprehensive currency support for menu pricing and customer ordering:

### Restaurant Currency Configuration
- Restaurant managers can select a default currency for their restaurant through a currency setting in the restaurant configuration
- Available currency options are "USD" (American dollar) and "EUR" (Euro)
- The default currency setting applies globally to all menu items within that specific restaurant
- **The currency setting is stored as part of the restaurant profile and is only accessible to the restaurant owner**
- New restaurants default to "USD" if no currency is explicitly selected during setup
- Existing restaurants are migrated to use "USD" as the default currency if not previously configured

### Menu Item Price Management
- Menu item creation and editing forms display price input fields with the restaurant's selected default currency
- All menu item prices are stored in the restaurant's default currency in the backend
- Price displays in the manager dashboard show the currency symbol and code (e.g., "$25.99 USD" or "€22.50 EUR")
- Menu item price validation ensures proper currency formatting and reasonable price ranges
- **Menu item prices are always managed and stored in the restaurant's configured default currency**

### Customer Currency Selection and Conversion
- When customers access a table link, they can choose to view menu prices in either USD or EUR
- A currency selector is prominently displayed in the customer ordering interface with touch-friendly controls
- Currency selection is independent of the restaurant's default currency setting
- Real-time price conversion is performed based on a configurable exchange rate when customers select a different currency than the restaurant's default
- **The system maintains a fixed or updatable USD/EUR exchange rate for price conversion calculations**
- Price displays in the customer interface show the selected currency with appropriate formatting and symbols
- **All price calculations, cart totals, and order summaries reflect the customer's selected currency**
- Currency selection persists throughout the customer's ordering session for that table

### Exchange Rate Management
- The system maintains exchange rate data for USD/EUR conversion
- Exchange rates can be updated through the admin interface (accessible to the default admin)
- **The exchange rate is applied consistently across all customer currency conversions**
- Price conversions are calculated in real-time when customers switch between currencies
- **Exchange rate updates are reflected immediately in customer price displays**

## Menu Management
Menu management interface allows restaurant managers to use mobile-optimized controls to:
- **Create and edit menu items only for restaurants they own** with name, description, price in the restaurant's default currency, and category using responsive forms
- Assign each menu item to an employee category (kitchen, bar, or waiter) as part of the menu item definition for order routing
- View menu items organized by categories with their assigned employee categories and prices in the restaurant's default currency clearly displayed in mobile-friendly layouts
- Update menu item details including changing the assigned employee category and price through touch-optimized interfaces
- Delete menu items from the menu using a delete button with mobile-friendly confirmation dialogs for each item
- **All menu item prices are displayed and managed in the restaurant's configured default currency**
- No separate assignment interface or assign buttons - employee category is integrated into the menu item creation and editing forms

## Employee Management with Code System and Deletion
Restaurant managers can manage employees with one-time code functionality and deletion capabilities through mobile-responsive interfaces:
- **Create and edit employee profiles only for their own restaurants** with specified roles (kitchen, bar, or waiter) using mobile-friendly forms
- Set one-time 6-digit codes for employees using a mobile-optimized "Set Code" button next to each employee
- Open a responsive modal interface to enter and confirm a custom 6-digit code for the selected employee
- **View only unclaimed codes for employees who are not yet linked to Internet Identity accounts - codes for already linked employees are never displayed in the dashboard**
- Update employee codes using both manual setting and auto-generation options through touch-optimized controls
- **Delete only employees from their own restaurants** using a mobile-friendly "Delete" button with confirmation prompt for each employee
- When an employee is deleted, all unclaimed access codes assigned to that employee are automatically removed from the system and the interface immediately updates to reflect this change
- **When an employee is deleted, any existing Internet Identity links for that employee are also removed from the system**
- Receive immediate feedback on successful code updates or error messages for duplicate codes within the restaurant
- Ensure all codes are unique within each restaurant with robust validation and error handling
- Manage employee permissions and restaurant associations through the one-time code system
- **Display current unclaimed codes only for unlinked employees in mobile-optimized layouts**

## Customer Interface - Table Link Routing and Ordering
**When customers visit the main app with the format `/?table=TABLE_ID` on mobile devices, the system must provide robust table link resolution and error handling:**

### Table Link Resolution and Validation
- **The system extracts the TABLE_ID from the URL query parameter using reliable URL parsing**
- **The backend performs comprehensive table lookup by TableId with proper validation**
- **The system verifies the table exists, is active, and belongs to a valid restaurant**
- **The system loads the correct restaurant context, menu data, and table information for ordering**
- **All table link routing bypasses the main app landing page and goes directly to the ordering interface**

### Valid Table Link Behavior
For valid TABLE_ID where table exists and is active:
- **Customers are routed directly to the mobile-optimized customer ordering interface for that specific table without authentication prompts**
- **The system displays the correct restaurant name, branding, and color scheme**
- **The restaurant's description is prominently displayed at the top of the ordering page to provide context about the establishment**
- **A personalized welcome message that includes the table name (e.g., "Welcome to Table X!") is displayed prominently at the top of the ordering page**
- They can verify their location matches the restaurant location through mobile-friendly display
- **Select their preferred currency (USD or EUR) for viewing menu prices through a prominent currency selector**
- **View the restaurant menu with items grouped and clearly labeled by their category name, making it easy for customers to browse the menu by section**
- **All menu item prices are converted and displayed in the customer's selected currency using real-time exchange rate calculations**
- Browse menu items organized by categories with touch-friendly navigation
- Select menu items and manage their cart using mobile-optimized controls with appropriate button sizes
- **View cart totals and order summaries in their selected currency**
- Place orders by pressing "Order" to submit their cart contents using large, touch-friendly order buttons

### Invalid Table Link Error Handling
**When table links are invalid, the system must provide clear and user-friendly error handling:**
- **Display clear, informative error messages when the table is not found, inactive, or belongs to a non-existent restaurant**
- **Show mobile-friendly error pages with helpful guidance for customers**
- **Provide suggestions for customers to contact the restaurant or verify the correct table link**
- **Error messages are displayed in a user-friendly format without technical jargon**
- **Error pages maintain responsive design and mobile optimization**
- **Never redirect customers to unrelated pages or show confusing error states**

### Table Session Management
- Each table maintains its own customer session including currency preference
- Customers never see manager dashboard functionality or the main app landing page when accessing table links
- All customer interactions are optimized for mobile touch with appropriate spacing and button sizing
- **Table sessions persist throughout the ordering process without interruption**

## Customer Dashboard
Authenticated customers can access a mobile-responsive customer dashboard to:
- **View only their own complete order history** from all past visits across all restaurants
- **Display appropriate empty state interface when no order history exists, with clear messaging about placing first orders**
- See detailed information for each order including:
  - Date and time of the order
  - Restaurant name and location where the order was placed
  - Complete list of menu items ordered with quantities and prices in the currency used during ordering
  - Total amount spent on each order in the original currency
- Browse order history organized chronologically with the most recent orders first
- Filter or search through their order history using mobile-friendly controls
- View order details in an expanded format when selecting individual orders
- **Order history displays preserve the original currency used during each order**
- Access their dashboard through the customer login button on the main landing page
- Navigate seamlessly between their dashboard and placing new orders
- All order history displays are optimized for mobile viewing with touch-friendly navigation
- **No access to other customers' order history or data**
- Access logout functionality through a logout button at the top right of the dashboard

## Customer Order Payment Interface
When orders reach "to be paid" status, customers can access a mobile-responsive payment interface to:
- **View orders that are ready for payment with clear order details and total amounts**
- **See a "Pay" button next to each order that is ready for payment**
- **Click the "Pay" button to change the order status to "paid"**
- **View confirmation when payment is successfully processed**
- **All payment interactions are optimized for mobile touch with appropriate button sizing**
- **Payment interface maintains responsive design and clear visual feedback**

## Employee Interface
Employees can access category-specific order views after authentication and account linking through mobile-responsive interfaces to:
- Select the employee login button from the main landing page using mobile-friendly touch controls
- Authenticate through the mobile-optimized employee login flow with their Internet Identity
- Enter their restaurant ID in "RID-#" format using mobile-friendly input controls with immediate validation
- The system validates that the restaurant ID in "RID-#" format exists as an actual manager-created restaurant record before proceeding
- If the restaurant ID does not exist, display a clear error message that includes a complete list of all valid restaurant IDs in "RID-#" format currently in the system to help users identify correct restaurant IDs
- **The system immediately checks for an existing Internet Identity-to-employee link for the given restaurant ID**
- **If a link exists, the employee is routed directly to their dashboard without any code prompt**
- **Only if no existing link is found does the system prompt for the 6-digit access code**
- **For first-time login or unlinked accounts: Enter their assigned 6-digit one-time code using large, touch-friendly number inputs to permanently link their Internet Identity to their employee account**
- **For all subsequent logins with existing links: Skip the code entry entirely as their Internet Identity is already linked to their employee account for that restaurant**
- Upon successful authentication and account recognition, the system displays their name and category (kitchen, bar, or waiter) on their mobile-responsive dashboard
- **View only order items from restaurants where they are assigned** and only items assigned to their employee category in mobile-optimized layouts
- **See order items with prices displayed in the restaurant's default currency**
- See real-time updates for new orders containing items for their category with mobile-friendly notifications
- Mark order items as completed within their category view using touch-optimized controls
- Access order details relevant to their specific role and responsibilities through mobile-friendly interfaces
- Each employee category has a dedicated interface showing only relevant order items in responsive layouts
- **No access to orders or data from restaurants where they are not assigned**
- Access logout functionality through a logout button at the top right of the dashboard

## Kitchen Employee Interface - Enhanced Order Management
Kitchen employees can access specialized order management functionality through mobile-responsive interfaces to:
- **View orders containing kitchen-assigned menu items in a dedicated kitchen view**
- **See order details with customer table information and item specifications**
- **Mark individual order items as completed using touch-optimized controls**
- **Use a "Ready" button for each order to change the order status from "ordered" to "ready to serve"**
- **When the "Ready" button is clicked, the order automatically appears in the waiter view for service**
- **All kitchen interface elements are optimized for mobile touch with appropriate button sizing**
- **Kitchen view maintains real-time synchronization with order status changes**

## Waiter Employee Interface - Enhanced Order Management and Service Flow
Waiter employees can access specialized order management functionality through mobile-responsive interfaces to:
- **View orders that are "ready to serve" from kitchen and bar employees in a dedicated waiter view**
- **View orders containing menu items specifically assigned to the "waiter" employee category, regardless of order status**
- **See orders with clear "From" labels indicating the source: "Kitchen" for orders from kitchen employees, "Bar" for orders from bar employees, or "Table" for direct customer requests**
- **View "To" labels for each order indicating the destination table or customer**
- **Use a "Served" button next to each order to change the order status from "ready to serve" to "to be paid"**
- **When the "Served" button is clicked, the order automatically appears in the customer view with a "Pay" button and becomes visible in the manager's Orders view**
- **All waiter interface elements are optimized for mobile touch with appropriate button sizing**
- **Waiter view maintains real-time synchronization with order status changes from kitchen and bar**
- **Clear visual indicators show the flow of orders from preparation to service to payment**
- **Ensure that all orders containing waiter-assigned menu items are properly displayed in the waiter view, with correct filtering by both employee category assignment and order status**

## Backend Data Storage
The backend must store:
- **User authentication data and session management with role assignments (manager, customer, employee) linked to specific Internet Identity accounts**
- **Default admin designation for the first Internet Identity account that ever connected to the app**
- **Customer profiles with authentication information and order history associations tied to their Internet Identity**
- **Complete customer order history with detailed order information including restaurant details, menu items, quantities, prices with currency information, and timestamps associated with the customer's Internet Identity**
- **Restaurant profiles with details, settings, color schemes, default currency configuration (USD or EUR), and unique restaurant identity IDs in "RID-#" format linked to authenticated manager Internet Identity accounts**
- **Table configurations with unique TableId identifiers, table names, and active/inactive status flags associated with specific restaurants owned by manager accounts**
- **Menu items with categories, descriptions, prices in the restaurant's default currency, and employee category assignments (kitchen, bar, or waiter) associated with specific restaurants owned by manager accounts**
- **Employee information with their names, roles (kitchen, bar, or waiter), and their associations with restaurants using "RID-#" format linked to manager Internet Identity accounts**
- **Internet Identity to employee account linking data for permanent account association with restaurant-specific assignments, ensuring each Internet Identity can only be linked to one employee profile per restaurant**
- One-time 6-digit code system with secure storage and mapping to specific employees and restaurants using "RID-#" format
- Code claiming status to track which codes have been used for account linking
- Code validation data with uniqueness tracking within restaurants and restaurant ID association using "RID-#" format
- Restaurant components (kitchen, bar, etc.) for order routing
- **Order batches with items, employee category routing information, comprehensive order status tracking (ordered, ready to serve, to be paid, paid), currency information for each order, source tracking (kitchen, bar, table), and customer currency preferences linked to customers' Internet Identity accounts and specific restaurants**
- **Exchange rate data for USD/EUR conversion calculations**
- Restaurant-to-canister assignment mapping for scaling and migration
- Canister health and performance metrics for administrator monitoring
- Platform configuration data for canister management
- Global restaurant identity counter to ensure unique ID generation across all restaurants
- Migration status tracking to ensure the restaurant identity ID migration runs only once
- **Session management data for secure logout functionality across all user roles**

## Strict Account-Based Data Access Control
The backend must implement complete data isolation to ensure:
- **Manager accounts can only access restaurants they personally created/own through their specific Internet Identity**
- **Employee accounts can only access restaurants where they are specifically assigned as employees through their own Internet Identity**
- **Customer accounts can only access their own order history and personal data from their own restaurant visits**
- **All database queries filter results by the authenticated Internet Identity account**
- **Cross-account data access is completely prevented at the database level**
- **API endpoints validate account ownership before returning any data**
- **No shared data access between different Internet Identity accounts in any role**
- **The default admin (first Internet Identity) can access admin functionality while maintaining data isolation for their own restaurant data**
- **Each Internet Identity account has completely separate and private data spaces for all roles**
- **Backend gracefully handles queries for managers with no restaurants by returning empty results instead of errors**
- **Backend gracefully handles queries for customers with no order history by returning empty results instead of errors**

## Default Admin System
The backend must provide functionality to:
- **Track and identify the first Internet Identity account that ever connected to the app**
- **Designate this first account as the default and only admin with persistent admin privileges**
- **Store the default admin designation securely and permanently in the backend**
- **Validate admin access by checking if the authenticated Internet Identity matches the stored default admin**
- **Provide admin functionality only to the default admin account**
- **Ensure all other accounts, regardless of when they joined, do not have admin access**
- **Integrate admin functionality within the manager dashboard interface for the default admin**
- **Maintain backward compatibility if an existing admin system needs to be migrated to this new approach**

## Session Management and Logout Operations
The backend must provide functionality to:
- **Manage Internet Identity sessions securely across all user roles (manager, employee, customer, admin)**
- **Provide secure logout endpoints that properly terminate Internet Identity sessions**
- **Validate session status and authentication state for all protected operations**
- **Handle session expiration and renewal as needed**
- **Ensure complete session cleanup upon logout to prevent unauthorized access**
- **Support logout functionality across all interfaces and user roles**
- **Maintain session security and prevent session hijacking or unauthorized access**
- **Provide session validation for all backend operations requiring authentication**

## Currency Management Operations
The backend must provide functionality to:
- **Store and manage default currency settings (USD or EUR) for each restaurant as part of the restaurant profile**
- **Validate currency selection during restaurant configuration and menu item management**
- **Store and retrieve exchange rate data for USD/EUR conversion calculations**
- **Provide currency conversion calculations for customer price displays**
- **Update exchange rates through admin interface functionality (accessible to default admin only)**
- **Ensure all menu item prices are stored in the restaurant's configured default currency**
- **Handle currency conversion logic for customer ordering interfaces when customers select different currencies**
- **Store order history with currency information to preserve original pricing context**
- **Migrate existing restaurant data to include default currency field, defaulting to USD for existing restaurants**
- **Validate currency data integrity and provide appropriate error handling for currency operations**

## Restaurant Identity ID Generation and Display
The system must provide functionality to:
- Maintain a global restaurant identity counter that is incremented atomically for each new restaurant creation
- Generate a unique restaurant identity ID in "RID-#" format when a new restaurant is created using the global counter to ensure uniqueness across all restaurants regardless of manager account or creation timing
- **Associate the restaurant identity ID with the specific manager's Internet Identity account**
- Store the restaurant identity ID in "RID-#" format as part of the restaurant profile data with proper uniqueness constraints
- **Display the restaurant identity ID in "RID-#" format prominently at the top of the restaurant manager's dashboard only for restaurants they own**
- Ensure the restaurant identity ID is easily readable and copyable for manager use
- Include the restaurant identity ID in "RID-#" format in administrator views when listing all restaurants (for default admin only)
- Maintain the restaurant identity ID as a permanent identifier that does not change throughout the restaurant's lifecycle
- Implement backend logic that guarantees uniqueness across all restaurants by using atomic increment operations on the global counter

## Restaurant Identity ID Migration and Format Standardization
The system must provide an automatic migration routine to:
- Execute automatically on backend initialization to ensure all existing restaurants receive unique identity IDs in "RID-#" format
- Iterate through all existing restaurants in the system and identify those without unique restaurant identity IDs in "RID-#" format
- Assign new, unique restaurant identity IDs in "RID-#" format to restaurants that do not already have them using the global counter system
- Migrate any existing restaurant IDs to the standardized "RID-#" format during the migration process
- Ensure no two restaurants share the same identity ID, regardless of when they were created or who the manager is
- Update the data structure for all existing restaurants to include unique identity IDs in "RID-#" format
- Track migration completion status to prevent duplicate execution of the migration routine
- Maintain data integrity during the migration process with proper error handling and rollback capabilities
- Ensure the migration is idempotent and can be safely run multiple times without creating duplicate IDs
- **Update the restaurant manager dashboard to display the newly assigned unique identity IDs in "RID-#" format only for restaurants owned by the authenticated manager**
- Log the migration process for audit and verification purposes
- Provide admin-triggered migration functionality as a backup option through the administrator interface (for default admin only)
- Execute the migration routine once automatically after deployment to ensure all restaurants—old and new—have unique identity IDs in "RID-#" format
- Ensure all restaurant ID validation logic recognizes and accepts the "RID-#" format throughout the application
- Clean up any unclaimed access codes linked to already-deleted employees during the migration process
- **Migrate existing admin access logic to the new default admin system during the migration process**
- **Migrate existing restaurant data to include default currency field, setting USD as default for restaurants without currency configuration**
- **Migrate all existing employee data to enforce the one-link-per-restaurant rule, preserving all existing Internet Identity-to-employee links while removing any duplicate associations**
- **Migrate all existing orders and menu items to ensure proper employee category assignments and order routing, specifically ensuring that menu items assigned to the "waiter" category and orders containing such items are properly categorized and visible in waiter views**

## Complete App Data Reset Migration
The backend must provide a complete app data reset migration routine to:
- **Execute only when triggered by the default admin through the admin interface with proper authorization validation**
- **Remove all data associated with every Internet Identity account across the entire application**
- Delete all restaurants, employees, customers, orders, access codes, and user profiles from the system
- Clear all Internet Identity associations and authentication data
- Reset the global restaurant identity counter to its initial state
- Clear all session management data and authentication tokens
- Remove all canister assignments and platform configuration data
- Reset the default admin designation so the next Internet Identity to connect becomes the new default admin
- **Clear all currency configuration data and exchange rate information**
- **Ensure the system is in a completely clean state as if nobody has ever connected to the app**
- Provide comprehensive logging and audit trails for the complete reset operation
- Implement proper error handling and rollback mechanisms in case of reset failures
- Ensure data integrity during the complete reset process with atomic operations
- Return confirmation of successful complete reset completion to the frontend
- **Only allow the default admin to trigger this complete app data reset operation**
- Require multiple confirmation steps and secure authorization before executing the complete reset
- Maintain system functionality and structure while removing all user data and associations
- Reset all migration status tracking to allow fresh migrations after the complete reset

## Customer Order History Operations
The backend must provide functionality to:
- **Associate all customer orders with their specific Internet Identity accounts for persistent order history tracking**
- Store comprehensive order details including restaurant information, menu items, quantities, prices with currency information, and order timestamps
- **Retrieve complete customer order history only for the authenticated Internet Identity account** across all restaurants and visits for display in the customer dashboard
- **Return empty results gracefully when customers have no order history instead of throwing errors**
- Organize order history chronologically with proper sorting and filtering capabilities
- Provide detailed order information for individual order viewing and expansion
- **Preserve original currency information for each order to maintain historical pricing context**
- Maintain order history persistence across customer sessions and logins
- Support order history queries and searches for customers through their dashboard
- Link table-based orders to customer profiles when customers are authenticated
- **Ensure order history data integrity and proper association with the correct customer Internet Identity accounts**
- **Prevent access to other customers' order history data**

## Enhanced Order Status Management and Workflow Operations
The backend must provide comprehensive functionality to:

### Order Status Lifecycle Management
- **Manage order status transitions through the complete lifecycle: ordered → ready to serve → to be paid → paid**
- **Support kitchen employees changing order status from "ordered" to "ready to serve" using the "Ready" button**
- **Support waiter employees changing order status from "ready to serve" to "to be paid" using the "Served" button**
- **Support customers changing order status from "to be paid" to "paid" using the "Pay" button**
- **Ensure all status transitions are atomic and properly synchronized across all user interfaces**

### Order Source and Routing Tracking
- **Track order source information to identify whether orders originated from kitchen, bar, or direct table requests**
- **Store "From" label data indicating the source of each order (Kitchen, Bar, or Table)**
- **Store "To" label data indicating the destination table or customer for each order**
- **Provide order routing information for waiter interface display**

### Employee Category-Specific Order Views
- **Filter orders by employee category (kitchen, bar, waiter) for role-specific dashboards**
- **Provide kitchen employees with orders containing kitchen-assigned menu items**
- **Provide waiter employees with orders that are "ready to serve" from kitchen and bar employees**
- **Provide waiter employees with orders containing menu items specifically assigned to the "waiter" employee category, ensuring proper filtering and display regardless of order status**
- **Display order source information in waiter views with clear "From" and "To" labels**
- **Ensure comprehensive order routing logic that correctly identifies and displays all orders relevant to waiter employees, including both status-based orders from kitchen/bar and category-based orders assigned directly to waiters**

### Manager Order Dashboard Filtering
- **Filter manager order views to show only orders with "to be paid" or "paid" status from their own restaurants**
- **Ensure managers can only view orders from restaurants they own**
- **Provide clear order status indicators in manager dashboard**

### Customer Payment Interface Operations
- **Provide customers with orders that have "to be paid" status**
- **Support customer payment processing that changes order status to "paid"**
- **Ensure payment interface is accessible and mobile-optimized**

### Real-Time Order Synchronization
- **Implement real-time updates across all employee interfaces when order statuses change**
- **Ensure kitchen "Ready" button actions immediately update waiter views**
- **Ensure waiter "Served" button actions immediately update customer and manager views**
- **Maintain data consistency across all order status transitions**
- **Ensure waiter views are updated in real-time when new orders containing waiter-assigned menu items are placed**

## Employee Access Code Management Operations - Enhanced Internet Identity Link Checking
The backend must provide comprehensive and reliable functionality to:

### Code Creation and Storage with Real-Time Updates
- **Accept and immediately store manager-defined custom 6-digit codes for employees with secure association to both the employee record and the correct restaurant identity ID in "RID-#" format**
- **Validate that the manager setting the code owns the restaurant before allowing code creation**
- **Ensure codes are immediately available for verification after creation with proper data synchronization**
- **Store codes with proper encryption and security measures while maintaining immediate accessibility for validation**
- **Implement atomic operations for code creation to prevent race conditions and ensure data consistency**
- **Immediately update the list of available (active, unclaimed) access codes for the corresponding restaurant identity ID whenever a manager creates or sets a new access code**

### Restaurant ID Validation
- **Validate that a restaurant ID in "RID-#" format exists as an actual manager-created restaurant record (not just pattern matching) before processing any employee authentication or code verification**
- **Provide restaurant ID validation endpoint for both frontend and backend validation with case-insensitive matching for "RID-#" format**
- **Return clear error messages when restaurant ID in "RID-#" format does not exist during employee login flow, including a complete list of all valid restaurant IDs in "RID-#" format currently in the system**
- **Implement comprehensive restaurant existence checking that verifies the restaurant was actually created by a manager and is not just a valid pattern**

### Internet Identity Link Checking and Management - Priority Check
- **Always check for existing Internet Identity-to-employee links for a given restaurant ID as the first step in the employee authentication flow**
- **If an existing link is found, immediately route the employee to their dashboard without showing any code prompt**
- **Only if no existing link is found should the system proceed to prompt for access code entry**
- **Ensure each Internet Identity can only be linked to one employee profile per restaurant (by restaurant ID), preventing multiple links for the same account within a single restaurant**
- **Store and manage Internet Identity-to-employee links with restaurant-specific associations**
- **Validate link uniqueness during the linking process to prevent duplicate associations**
- **Provide robust link checking that works reliably across all authentication scenarios**

### Code Verification and Account Linking
- **Implement comprehensive code verification logic that validates the submitted code is active, unclaimed, and assigned to a valid employee within the specified restaurant ID in "RID-#" format**
- **Perform strict validation to ensure the restaurant ID in "RID-#" format exists as an actual restaurant record before processing any code verification using case-insensitive comparison**
- **Correctly match the code to the specific employee record within the specified restaurant with proper data integrity checks**
- **Permanently link employee Internet Identity to the correct employee account and restaurant association upon successful code and restaurant ID validation**
- **Ensure each Internet Identity can only be linked to one employee profile per restaurant during the linking process**
- **Immediately deactivate and mark codes as claimed after successful account linking, removing them from all manager dashboard views with real-time synchronization**
- **Implement atomic code claiming operations to prevent duplicate claims and ensure data consistency**

### Employee Authentication and Access
- **Retrieve employee information (name and category) based on linked Internet Identity and restaurant ID in "RID-#" format only for restaurants where the employee is assigned**
- **Support subsequent employee logins using only Internet Identity and restaurant ID in "RID-#" format without requiring codes again**
- **Always check for existing links before showing any code prompt during the authentication flow**
- **Validate that the restaurant ID in "RID-#" format exists and is valid before processing authentication using case-insensitive matching**
- **Route users to appropriate dashboards based on linked Internet Identity and restaurant ID in "RID-#" format**

### Error Handling and Feedback
- **Return specific error messages for invalid restaurant IDs in "RID-#" format, codes that don't belong to the specified restaurant, already used codes, or non-existent codes**
- **When an employee login attempt fails due to an invalid or mismatched 6-digit code for a given restaurant ID in "RID-#" format, return a generic error message without revealing any access codes**
- **Do not include any list of active codes in employee-facing error messages to maintain security**

### Code Management and Cleanup
- **Update existing codes to manager-defined values through the "Set Code" functionality for employees with immediate availability**
- **Ensure code uniqueness within each restaurant with validation and comprehensive feedback for employee codes**
- **Track code usage and maintain security logs for employee access with proper audit trails**
- **Handle both manual code setting and auto-generation options for employees**
- **Automatically delete all unclaimed access codes assigned to an employee when that employee is deleted from the system**
- **Automatically remove any existing Internet Identity links for an employee when that employee is deleted from the system**
- **Ensure the employee management interface immediately reflects the removal of codes when an employee is deleted**

### Manager Dashboard Code Display Logic
- **Only display unclaimed codes for employees who are not yet linked to Internet Identity accounts**
- **Never display codes for employees who already have established Internet Identity links**
- **Automatically remove codes from manager dashboard display once they are claimed and linked**
- **Provide clear indication in the manager dashboard of which employees are linked vs unlinked**

### Data Integrity and Real-Time Synchronization
- **Map codes to specific employee records and restaurant IDs in "RID-#" format for secure account linking with proper data relationships**
- **Ensure codes are immediately removed from all manager views once successfully claimed to prevent reuse**
- **Implement code deactivation logic that prevents reuse of claimed codes with proper status tracking**
- **Maintain data integrity during the employee onboarding process with comprehensive validation**
- **Provide detailed audit trails for all code verification and linking operations**
- **Ensure that when a manager sets or updates a 6-digit code for an employee, the code is immediately and correctly associated with the specified restaurant in "RID-#" format and employee in the backend data structures**
- **Guarantee that the list of valid codes for a restaurant is always up to date and reflects all unclaimed codes set by the manager for unlinked employees only**
- **Implement reliable code-to-restaurant-to-employee mapping that ensures codes are properly linked and can be verified during employee login attempts**
- **Provide real-time synchronization between manager code setting operations and employee login verification to ensure codes are immediately available for use**
- **Ensure the system never has empty code lists when codes actually exist for unlinked employees**
- **Implement thorough testing and validation of all code assignment, validation, and linking logic to ensure complete reliability for both new and existing restaurants**
- **Maintain tight integration between frontend and backend to ensure instant code availability and real-time updates across all system components**
- **Guarantee that the frontend always fetches and displays the up-to-date list of valid access codes for each restaurant after any code creation, update, or deletion, but only for unlinked employees**

### Migration and Compatibility
- **Ensure all existing employee data and codes are properly migrated to work with the rebuilt system**
- **Validate and rebuild all existing code-to-employee-to-restaurant associations during migration to ensure compatibility with the new system**
- **Migrate all existing employee data to enforce the one-link-per-restaurant rule, preserving all existing Internet Identity-to-employee links while removing any duplicate associations**
- **Clean up any orphaned or invalid codes during migration to ensure data integrity**
- **Ensure backward compatibility while implementing the improved code management system**
- **Guarantee that all previously linked Internet Identity accounts are recognized and skip code prompts on future logins**

## Employee Management Operations
The backend must provide functionality to:
- **Create and manage employee profiles only for restaurants owned by the authenticated manager's Internet Identity** with names and specified roles (kitchen, bar, or waiter) within each restaurant
- Accept manager-defined custom 6-digit codes for employees through the "Set Code" interface with restaurant ID association in "RID-#" format and immediate persistence
- **Validate that the manager owns the restaurant before allowing employee management operations**
- Store manager-set codes as valid, active access codes for the specific employee and restaurant
- **Retrieve only unclaimed codes for restaurants owned by the authenticated manager, and only for employees who are not yet linked to Internet Identity accounts** with real-time updates
- Update employee codes to custom values set by managers with duplicate validation within restaurants
- **Delete employees only from restaurants owned by the authenticated manager** with proper validation to ensure only authorized managers can perform this action
- When deleting an employee, automatically remove all unclaimed access codes assigned to that employee from the backend
- **When deleting an employee, automatically remove any existing Internet Identity links for that employee from the system**
- Update the employee management interface immediately to reflect the removal of codes when an employee is deleted
- Validate employee categories when creating or updating menu items
- **Provide employee category-specific order views only for restaurants where the employee is assigned** after Internet Identity linking
- Route order notifications to employees based on their assigned category
- Ensure code uniqueness within restaurants when setting custom codes
- Authenticate employees and validate their linked Internet Identity before granting access to role-specific dashboards
- **Always check for existing Internet Identity-to-employee links before prompting for access codes during employee authentication**
- Provide feedback on successful code updates or validation errors for duplicate codes
- Handle employee deletion with proper cleanup of associated data, codes, and Internet Identity links
- **Return employee name and category information only for the authenticated employee's account** when validating linked Internet Identity for personalized dashboard display
- Support Internet Identity to employee account linking with restaurant ID validation in "RID-#" format and subsequent recognition for streamlined login
- **Ensure each Internet Identity can only be linked to one employee profile per restaurant during the linking process**
- Ensure proper restaurant ID validation during employee authentication and code verification processes using case-insensitive matching for "RID-#" format
- Implement real-time synchronization to remove claimed codes from manager dashboard views immediately after successful linking
- Maintain consistent and reliable code-to-employee-to-restaurant associations that persist across all backend operations
- Ensure that code cleanup on employee deletion maintains data integrity and prevents orphaned codes and links
- **Provide clear indication of employee link status to managers, showing which employees are linked vs unlinked**

## Menu Management Operations
The backend must provide functionality to:
- **Create and manage menu items only for restaurants owned by the authenticated manager's Internet Identity** with name, description, price in the restaurant's default currency, category, and employee category assignment
- Update menu item details including changing the assigned employee category for order routing and price in the restaurant's default currency
- **Delete menu items only from restaurants owned by the authenticated manager** with proper validation to ensure only authorized managers can perform this action
- **Retrieve menu items organized by categories only for restaurants owned by the authenticated manager** with their assigned employee categories and prices in the restaurant's default currency
- **Retrieve menu items organized by categories for customer ordering interfaces, ensuring proper category grouping and labeling for display**
- Validate employee categories when creating or updating menu items
- **Ensure menu item prices are stored and managed in the restaurant's configured default currency**
- Ensure menu item data integrity and proper association with restaurant profiles
- Handle menu item deletion with proper cleanup of associated data
- **Ensure proper employee category assignment validation and storage for all menu items, specifically validating that "waiter" category assignments are correctly stored and retrievable**

## Table Management Operations - Enhanced Table Link Resolution
The backend must provide comprehensive functionality to:
- Generate unique table identifiers (TableId) for each table
- **Store table names alongside table identifiers for personalized welcome messages**
- Create table links using the format `/?table=TABLE_ID` as URL query parameters
- **Activate or deactivate tables only for restaurants owned by the authenticated manager** using the "active" flag
- **Delete tables by their TableId only for restaurants owned by the authenticated manager**, ensuring only authorized restaurant managers can perform this action
- **Accept and process TABLE_ID parameters from URL query parameters with robust parsing and validation**
- **Implement comprehensive table lookup by TableId with proper error handling and validation**
- **Verify that tables exist, are active, and belong to valid restaurants before allowing customer access**
- **Return complete restaurant context including restaurant details, restaurant description, menu data, color scheme, default currency information, and table name for customers accessing valid active tables**
- **Provide clear and specific error responses when table is not found, inactive, or belongs to a non-existent restaurant**
- **Ensure only active tables from restaurants owned by the authenticated manager** generate customer links visible in the manager dashboard
- **Support direct routing to customer ordering interface for valid table links without authentication requirements**
- **Implement reliable table-to-restaurant resolution that works consistently across all table access scenarios**
- **Validate table ownership and restaurant association before returning any table or restaurant data**
- **Handle edge cases such as deleted restaurants, inactive tables, or malformed table IDs with appropriate error responses**
- **Ensure table link resolution works correctly for all valid table configurations and provides helpful error messages for invalid scenarios**

## Restaurant Data Reset Operations
The backend must provide functionality to:
- **Implement secure restaurant data reset functionality that completely removes all data only for restaurants owned by the authenticated manager's Internet Identity**
- Validate that only the restaurant's authenticated manager or the default admin can perform the reset operation
- Delete all restaurant-specific data including:
  - All employees associated with the restaurant
  - All tables and their configurations
  - All menu items and categories
  - All orders placed at the restaurant
  - All unclaimed and claimed access codes for the restaurant
  - **All Internet Identity-to-employee links for the restaurant**
  - Restaurant settings and customizations
- Preserve the restaurant's unique identity ID in "RID-#" format and basic restaurant profile structure for re-setup
- **Reset the restaurant's currency configuration to default (USD) during the reset process**
- **Ensure the reset operation only affects restaurants owned by the authenticated manager** and does not affect other restaurants or global application data
- Provide comprehensive logging and audit trails for all reset operations
- Implement proper error handling and rollback mechanisms in case of reset failures
- Ensure data integrity during the reset process with atomic operations
- Return confirmation of successful reset completion to the frontend
- Support both manager-initiated and admin-initiated reset operations with proper authorization validation
- Clean up all associated data relationships and references during the reset process
- Maintain the restaurant's canister assignment and routing configuration after reset

## Complete App Data Reset Operations
The backend must provide functionality to:
- **Implement secure complete app data reset functionality that removes all data associated with every Internet Identity account**
- **Validate that only the default admin can perform the complete app data reset operation**
- Delete all application data including:
  - All restaurants across all managers
  - All employees across all restaurants
  - All customers and their profiles
  - All orders across all restaurants and customers
  - All access codes across all restaurants
  - **All Internet Identity-to-employee links across all restaurants**
  - All user authentication data and Internet Identity associations
  - All session management data
  - All canister assignments and platform configuration
  - All currency configuration data and exchange rate information
- Reset the global restaurant identity counter to its initial state
- Clear the default admin designation so the next Internet Identity to connect becomes the new default admin
- Reset all migration status tracking to allow fresh migrations
- **Ensure the system is in a completely clean state as if nobody has ever connected to the app**
- Provide comprehensive logging and audit trails for all complete reset operations
- Implement proper error handling and rollback mechanisms in case of complete reset failures
- Ensure data integrity during the complete reset process with atomic operations
- Return confirmation of successful complete reset completion to the frontend
- **Only allow the default admin to trigger this complete app data reset operation**
- Require multiple confirmation steps and secure authorization before executing the complete reset
- Maintain system functionality and structure while removing all user data and associations

## Default Admin Operations
The backend must provide functionality to:
- **Identify and store the first Internet Identity account that ever connected to the app as the default admin**
- **Validate admin access by checking if the authenticated Internet Identity matches the stored default admin**
- **Provide all traditional admin functionality only to the default admin account:**
  - List all restaurants with their canister assignments, restaurant identity IDs in "RID-#" format, and status information
  - Retrieve canister health and performance metrics for monitoring
  - Assign restaurants to specific canisters with validation
  - Export restaurant data for migration between canisters
  - Import restaurant data to target canisters during migration
  - Update routing configurations when restaurants are migrated
  - Add new canisters to the platform with proper initialization
  - Categorize and filter canisters by performance metrics
  - Provide comprehensive platform analytics and system health data
  - Manually trigger the restaurant identity ID migration routine if needed through admin controls
  - Access restaurant data reset functionality for any restaurant with secure confirmation and authorization validation
  - **Trigger the complete app data reset migration routine with secure confirmation and authorization validation**
  - **Update and manage exchange rate data for USD/EUR currency conversion**
- **Ensure only the default admin can access these operations**
- **Integrate admin functionality within the manager dashboard interface for the default admin**
- **Prevent all other accounts from accessing any admin functionality**
- **Maintain backward compatibility when migrating from any existing admin system**

## Restaurant ID Validation and Standardization
The backend must provide enhanced functionality to:
- Implement case-insensitive restaurant ID validation throughout all authentication and access code management features for "RID-#" format
- Ensure all restaurant identity IDs use the format "RID-#" (e.g., "RID-1", "RID-2", "RID-10") for consistency across the platform
- Ensure all restaurant ID lookups and comparisons are case-insensitive to handle variations in user input for "RID-#" format
- Provide consistent error messages when restaurant IDs are not found, clearly indicating the expected "RID-#" format
- Validate restaurant ID format during employee login to ensure it matches the standardized "RID-#" pattern
- Implement robust restaurant ID matching logic that handles both exact matches and case variations for "RID-#" format
- Ensure all frontend restaurant ID input fields accept and validate the standardized "RID-#" format
- Provide immediate feedback to users when entering restaurant IDs that don't match the expected "RID-#" format
- Maintain backward compatibility during migration while ensuring all new restaurants use the standardized "RID-#" format
- Update all existing restaurant ID references to use the standardized "RID-#" format consistently
- Implement comprehensive testing for restaurant ID validation across all system components
- Ensure restaurant ID validation works correctly in all contexts including employee authentication, code verification, and administrative functions

## Valid Restaurant ID List Operations
The backend must provide functionality to:
- Retrieve a complete list of all valid restaurant IDs in "RID-#" format currently in the system
- Return all restaurant IDs that have been created by any manager across the platform in "RID-#" format
- Provide this list when employee login fails due to invalid restaurant ID to help users identify correct restaurant IDs in "RID-#" format
- Ensure the list includes all active restaurants in the standardized "RID-#" format
- Display the valid restaurant ID list clearly in error messages during employee authentication
- Maintain real-time accuracy of the valid restaurant ID list
- Format the list in a user-friendly manner for display in error messages
- Ensure the list retrieval is efficient and does not impact system performance

## Authentication Flow Operations
The backend must provide functionality to:
- Handle manager authentication flow
- **Handle manager authentication flow gracefully when no Internet Identity is connected by prompting for authentication**
- **Ensure manager dashboard loads properly for all Internet Identity accounts (both admin and non-admin) without infinite loading or errors**
- **Return appropriate empty state data when managers have no restaurants instead of throwing errors**
- Handle employee authentication flow with Internet Identity and restaurant ID validation in "RID-#" format
- **Always check for existing Internet Identity-to-employee links as the first step before prompting for access code entry during employee authentication**
- **Route employees directly to their dashboard if an existing link is found, completely bypassing code entry**
- Handle customer authentication flow
- **Handle customer authentication flow gracefully when no Internet Identity is connected by prompting for authentication**
- **Return appropriate empty state data when customers have no order history instead of throwing errors**
- **Route managers directly to management dashboard after successful authentication showing only their own restaurants or appropriate empty state**
- **For the default admin: Display integrated admin functionality within the manager dashboard even when they have no restaurants**
- Route employees to restaurant ID entry after successful authentication
- **Route customers directly to customer dashboard after successful authentication showing only their own order history or appropriate empty state**
- Validate restaurant ID existence in "RID-#" format before proceeding to link checking step in employee authentication using case-insensitive matching
- **Only proceed to code entry step if no existing Internet Identity-to-employee link is found for the given restaurant ID**
- Provide restaurant ID validation endpoint for immediate feedback during employee login with case-insensitive validation for "RID-#" format
- Return clear error messages when restaurant ID in "RID-#" format does not exist, including a complete list of all valid restaurant IDs in "RID-#" format currently in the system to help users identify correct restaurant IDs
- Implement robust employee onboarding logic that correctly validates employee codes against the specified restaurant ID in "RID-#" format and permanently links Internet Identity to employee account with code deactivation
- **Ensure each Internet Identity can only be linked to one employee profile per restaurant during the authentication and linking process**
- Maintain separate authentication paths for managers, employees, and customers
- Support the triple-button landing page authentication system
- **Return employee identification information (name and category) only for the authenticated employee's account** upon successful Internet Identity recognition
- **Support direct customer access to table-specific ordering interfaces without authentication with robust table link resolution and error handling**
- Recognize previously linked employee Internet Identity and grant access without requiring code again
- Provide comprehensive error handling for invalid restaurant IDs in "RID-#" format, mismatched codes, already used codes, and non-existent codes during employee onboarding
- **When an employee login attempt fails due to an invalid or mismatched 6-digit code for a given restaurant ID in "RID-#" format, the system must return a generic error message without revealing any access codes**
- **Do not include any list of active codes in employee-facing error messages to maintain security**
- Ensure reliable code verification that validates both the code and restaurant ID in "RID-#" format match before linking accounts using case-insensitive restaurant ID comparison
- Implement proper code claiming logic that immediately deactivates codes after successful linking
- Maintain data consistency during employee authentication and linking processes
- Verify that codes set by managers are immediately available and correctly associated for employee login verification
- **Enforce strict account-based access control throughout all authentication flows**
- **Identify and designate the first Internet Identity account as the default admin during the authentication process**
- **Provide secure logout functionality that properly terminates Internet Identity sessions for all user roles**
- **Handle authentication scenarios where users attempt to access protected areas without being connected to Internet Identity by prompting for authentication**
- **Ensure authentication flows work correctly regardless of initial Internet Identity connection status**
- **Ensure all login buttons work reliably for all users regardless of authentication state or data status**

## Order Processing and Enhanced Status Management
Orders are structured with employee category routing information, comprehensive order status tracking, customer profile association, source tracking, and currency information to enable:
- Automatic routing to appropriate employee categories (kitchen, bar, waiter) based on menu item assignments
- **Live distribution of order items only to employees assigned to the specific restaurant** within the matching category after Internet Identity linking
- **Category-specific order views showing only relevant items for employees assigned to the restaurant with prices in the restaurant's default currency**
- **Kitchen employee interface with "Ready" button functionality to change order status from "ordered" to "ready to serve"**
- **Waiter employee interface with orders from kitchen and bar employees, displaying "From" labels (Kitchen, Bar, or Table) and "To" labels**
- **Waiter employee interface with orders containing menu items specifically assigned to the "waiter" employee category, ensuring comprehensive order visibility regardless of order status**
- **Waiter employee interface with "Served" button functionality to change order status from "ready to serve" to "to be paid"**
- **Customer payment interface with "Pay" button functionality to change order status from "to be paid" to "paid"**
- Batch processing of multiple items per order grouped by employee category
- **Enhanced order status lifecycle management with statuses: ordered, ready to serve, to be paid, paid**
- **Manager order view filtering to display only orders from their own restaurants** with "to be paid" or "paid" status
- Backend filtering functionality to retrieve orders by specific status criteria for manager dashboard display
- Each table maintains its own customer session for order management including currency preference
- **Real-time order notifications and synchronization across all employee interfaces when order statuses change**
- Personalized order displays showing employee name and category information
- **Association of all orders with customer Internet Identity accounts and currency information** for order history tracking when customers are authenticated
- **Persistent storage of order details with currency information for customer dashboard display and history retrieval tied to specific customer accounts**
- **Status-based order visibility controls ensuring managers only see payment-related order statuses from their own restaurants**
- **Currency conversion handling for customer orders when customers select different currencies than the restaurant's default**
- **Storage of both original restaurant currency prices and customer-selected currency prices for comprehensive order tracking**
- **Order source tracking to identify whether orders originated from kitchen, bar, or direct table requests**
- **Real-time synchronization ensuring kitchen "Ready" actions immediately update waiter views and waiter "Served" actions immediately update customer and manager views**
- **Comprehensive order routing logic that ensures waiter employees see all relevant orders, including both status-based orders from kitchen/bar and category-based orders assigned directly to the waiter category**
- **Enhanced order filtering and display logic that prevents orders from being missed due to category or status mismatches in waiter views**

## Restaurant Creation Operations
The backend must provide functionality to:
- Maintain a global restaurant identity counter that persists across all restaurant creation operations
- Atomically increment the global counter when creating a new restaurant to ensure unique ID assignment
- Generate unique restaurant identity IDs using the standardized "RID-#" format with the incremented counter value regardless of which manager account creates the restaurant
- **Associate the newly created restaurant with the authenticated manager's Internet Identity account**
- **Set the default currency to USD for new restaurants unless explicitly specified during creation**
- Validate that the generated restaurant identity ID is unique before finalizing restaurant creation
- Store the restaurant identity ID in "RID-#" format as an immutable part of the restaurant profile
- Handle concurrent restaurant creation requests by ensuring atomic counter operations
- Provide error handling and retry logic if ID generation fails
- **Ensure the restaurant identity ID in "RID-#" format is immediately available for display in the manager dashboard after creation for the owning manager**

## Migration Operations
The backend must provide enhanced functionality to:
- Execute an automatic migration routine on backend initialization that assigns unique restaurant identity IDs in "RID-#" format to existing restaurants
- Iterate through all restaurants in the system and identify those without unique identity IDs in "RID-#" format
- Use the global restaurant identity counter to assign new unique IDs in "RID-#" format to restaurants that need them
- Migrate any existing restaurant IDs to the standardized "RID-#" format during the migration process
- **Migrate existing restaurant data to include default currency field, setting USD as default for restaurants without currency configuration**
- **Migrate all existing employee data to enforce the one-link-per-restaurant rule, preserving all existing Internet Identity-to-employee links while removing any duplicate associations**
- **Ensure each Internet Identity can only be linked to one employee profile per restaurant after migration**
- **Guarantee that all previously linked Internet Identity accounts are recognized and skip code prompts on future logins**
- Track migration completion status to prevent duplicate execution of the migration process
- Ensure the migration process maintains data integrity and prevents duplicate ID assignment
- Implement idempotent migration logic that can be safely executed multiple times without side effects
- Provide comprehensive logging and audit trails for the migration process
- Handle migration errors gracefully with proper rollback mechanisms
- Update restaurant data structures to include the newly assigned unique identity IDs in the standardized "RID-#" format
- **Update the restaurant manager dashboard to display the newly assigned unique identity IDs in "RID-#" format only for restaurants owned by the authenticated manager**
- Log the migration process for audit and verification purposes
- Provide admin-triggered migration functionality as a backup option through the administrator interface (for default admin only)
- Execute the migration routine once automatically after deployment to ensure all restaurants—old and new—have unique identity IDs in "RID-#" format
- Ensure all restaurant ID validation logic recognizes and accepts the "RID-#" format throughout the application
- Clean up any unclaimed access codes linked to already-deleted employees during the migration process
- **Migrate existing admin access logic to the new default admin system during the migration process**
- **Migrate existing restaurant data to include default currency field, setting USD as default for restaurants without currency configuration**
- **Migrate all existing employee data to enforce the one-link-per-restaurant rule, preserving all existing Internet Identity-to-employee links while removing any duplicate associations**
- **Migrate all existing orders and menu items to ensure proper employee category assignments and order routing, specifically ensuring that menu items assigned to the "waiter" category and orders containing such items are properly categorized and visible in waiter views**
- **Validate and fix any existing menu item employee category assignments during migration to ensure proper waiter category assignment and order routing**
- **Ensure all existing orders are properly associated with their menu item employee categories for correct display in employee dashboards**

## Architecture Considerations
The system is designed with:
- **Complete per-account data isolation ensuring each Internet Identity can only access their own data across all roles**
- **Account-based access control at both backend and frontend levels with no shared data between accounts**
- **Database-level filtering by Internet Identity to prevent cross-account data exposure**
- **Each Internet Identity account has completely separate and private manager, employee, and customer views**
- **Integrated admin dashboard within the manager interface, accessible only to the first Internet Identity account (default admin)**
- **No separate admin authentication or interface - admin functionality is seamlessly integrated within the manager dashboard**
- **Secure logout functionality available across all interfaces with proper session termination**
- **Robust authentication handling that works correctly whether or not Internet Identity is initially connected**
- **Graceful authentication prompting for manager and customer login flows when no Internet Identity is connected**
- **Proper authentication handling for all accounts accessing the manager dashboard without infinite loading or errors**
- **Graceful empty state handling for managers with no restaurants and customers with no order history**
- **Complete app data reset capability that allows the default admin to remove all data associated with every Internet Identity account, resetting the system to a clean state**
- **Comprehensive currency management system with restaurant-level default currency configuration and customer-level currency selection with real-time conversion**
- **Exchange rate management system for USD/EUR conversion with admin-controlled rate updates**
- **Currency-aware order processing and history tracking that preserves original pricing context**
- **Enhanced order status management system with comprehensive workflow support for kitchen, waiter, and customer interactions**
- **Real-time order synchronization across all employee interfaces with immediate status updates**
- **Kitchen employee interface with "Ready" button functionality for order status transitions**
- **Waiter employee interface with "From" and "To" labels and "Served" button functionality**
- **Enhanced waiter order routing logic that ensures all relevant orders are displayed, including both status-based orders from kitchen/bar and category-based orders assigned directly to waiters**
- **Customer payment interface with "Pay" button functionality for order completion**
- **Order source tracking system that identifies whether orders originated from kitchen, bar, or table requests**
- **Comprehensive order filtering and display system that prevents orders from being missed due to category or status mismatches**
- Full mobile responsiveness and touch optimization across all interfaces
- Authentication layer for managers, employees, and customers with strict role enforcement
- **Direct customer access to table-specific ordering interfaces without authentication barriers with robust table link resolution and comprehensive error handling**
- **Enhanced customer ordering interface with restaurant description display, personalized table welcome messages, and menu items grouped by category**
- Triple-button landing page system for manager, employee, and customer authentication paths with mobile-friendly design
- **Customer dashboard with comprehensive order history tracking and display functionality limited to the authenticated customer's data**
- **Enhanced one-time code system with priority Internet Identity link checking that completely bypasses code prompts for previously linked employees**
- **Robust employee authentication flow that always checks for existing Internet Identity-to-employee links before showing any code prompt**
- **Internet Identity linking system that ensures each Internet Identity can only be linked to one employee profile per restaurant, with automatic link checking during authentication**
- **Streamlined employee login flow that routes directly to dashboard for linked accounts without any code interaction**
- **Restaurant ID validation system that checks restaurant existence as actual manager-created records (not just pattern matching) in "RID-#" format before proceeding to link checking step using case-insensitive matching**
- Frontend and backend restaurant ID validation for immediate feedback and security consistency with standardized "RID-#" format support
- Valid restaurant ID list functionality that provides all existing restaurant IDs in "RID-#" format in error messages to help users identify correct restaurant IDs
- **Secure code generation, storage, and validation mechanisms for employees with restaurant-level uniqueness, immediate availability, and immediate removal after successful linking**
- Employee identification system that maps Internet Identity to specific employee records for personalized dashboard display
- Internet Identity-based employee authentication with reliable one-time account linking and subsequent streamlined access
- **Comprehensive error handling for employee onboarding with clear messages for invalid restaurant IDs in "RID-#" format, mismatched codes, already used codes, and non-existent codes**
- **Generic error messages for employee login failures that do not reveal any access codes to maintain security**
- Enhanced error messages that include a complete list of all valid restaurant IDs in "RID-#" format currently in the system when restaurant ID validation fails
- **Direct customer routing for table links that bypasses the main app landing page with robust table link resolution and comprehensive error handling**
- **Enhanced table link resolution that provides restaurant description, table name, and menu category grouping for improved customer experience**
- Unique table identifier system using TableId with URL query parameter format `/?table=TABLE_ID`
- Table activation/deactivation system with active flag management
- **Robust table lookup and validation with comprehensive error handling and user-friendly error messages**
- Individual customer sessions per table for reliable order management including currency preferences
- Clear restaurant-to-canister assignment logic with migration capabilities
- Data models that support migration between canisters
- Scalable architecture to handle multiple restaurants per canister initially
- **Default admin tools for platform management and canister orchestration integrated within the manager dashboard**
- **Complete app data reset functionality for default admin to remove all data and reset the system to a clean state**
- Future capability to partition restaurants across multiple canisters
- **Complete separation of manager, customer, and employee interfaces with account-based data filtering to prevent role confusion and cross-account access**
- **Admin functionality integrated within manager interface for default admin only**
- Strict conditional rendering in frontend components to enforce role-based visibility
- **Employee category-based order routing system with dedicated category views limited to restaurants where employees are assigned**
- **Enhanced waiter order routing system that ensures comprehensive order visibility including both status-based and category-based order filtering**
- Integrated menu item management with employee category assignment as part of menu item definition
- **Enhanced one-time code management system with priority link checking and validation for secure and unique code distribution within restaurants with guaranteed immediate availability and real-time synchronization**
- **Employee deletion functionality with confirmation prompts and proper data cleanup including automatic removal of unclaimed access codes and Internet Identity links limited to restaurants owned by the manager**
- **Manager dashboard code display logic that only shows unclaimed codes for unlinked employees with immediate removal after successful linking or employee deletion**
- Personalized employee dashboards that display employee name and category information upon successful login
- **Comprehensive customer order history system with persistent storage and retrieval limited to the authenticated customer's account** across all restaurant visits
- **Menu item deletion functionality with confirmation prompts and proper data cleanup limited to restaurants owned by the manager**
- **Enhanced order status management system with lifecycle tracking and status-based filtering for manager views limited to their own restaurants**
- **Manager order dashboard filtering to show only "to be paid" and "paid" status orders from their own restaurants** with clear UI indication of order lifecycle
- Responsive design principles ensuring optimal user experience across all device sizes
- Touch-friendly controls with appropriate sizing and spacing for mobile interaction
- Adaptive layouts that reorganize content effectively for small screens
- Mobile-optimized modal dialogs, forms, and tables for seamless user interaction
- **Robust restaurant identity ID generation system using a global atomic counter with standardized "RID-#" format to prevent duplicates across all restaurants with proper account association**
- Automatic migration system that runs on backend initialization to ensure all existing restaurants receive unique identity IDs in the standardized "RID-#" format with proper data integrity and error handling
- **Frontend synchronization to ensure the correct unique restaurant identity ID in "RID-#" format is always displayed in the manager dashboard only for restaurants owned by the authenticated manager**
- **Internet Identity to employee account linking system that eliminates the need for repeated code entry after initial setup with reliable restaurant ID and code validation using case-insensitive matching for "RID-#" format**
- **One-link-per-restaurant constraint that ensures each Internet Identity can only be linked to one employee profile per restaurant**
- Migration completion tracking to prevent duplicate execution and ensure reliable one-time migration of existing data
- **Code deactivation and claiming logic that ensures codes cannot be reused and are immediately removed from manager views after successful linking**
- Enhanced migration routine that ensures compatibility with the employee onboarding system for all existing data
- **Immediate code registration system that ensures manager-set codes are instantly available as valid access codes for employee authentication with guaranteed data integrity**
- **Reliable code-to-restaurant-to-employee mapping system that maintains data consistency and ensures codes are properly associated and immediately available for verification during employee login attempts**
- **Comprehensive testing and validation framework for the code system to ensure complete reliability for both new and existing restaurants**
- **Enhanced data structures and atomic operations throughout the code system to prevent race conditions and ensure data integrity**
- **Real-time synchronization mechanisms that guarantee code availability and accuracy across all system components**
- **Tight integration between frontend and backend components to ensure instant code availability and real-time updates across all interfaces**
- **Secure error handling that provides generic error messages to employees without revealing access codes while maintaining detailed code lists for managers**
- Standardized restaurant ID format validation and case-insensitive matching throughout all system components for "RID-#" format
- Robust restaurant ID validation logic that ensures consistent recognition of the "RID-#" format across all authentication and access code management features
- Comprehensive migration system that updates all existing restaurant data to use the standardized "RID-#" format while maintaining data integrity and system functionality
- **Automatic code cleanup system that removes unclaimed access codes when employees are deleted, ensuring data integrity and preventing orphaned codes**
- **Automatic Internet Identity link cleanup system that removes existing links when employees are deleted, ensuring data integrity and preventing orphaned links**
- **Real-time interface updates that immediately reflect code removal when employees are deleted, maintaining accurate code lists for managers**
- **Secure restaurant data reset functionality with proper authorization, confirmation, and comprehensive data cleanup limited to restaurants owned by the authenticated manager** while preserving restaurant identity and structure for re-setup
- Mobile-optimized reset interface with clear warnings, confirmation dialogs, and touch-friendly controls for destructive operations
- **Real-time access code synchronization system that ensures the frontend always fetches and displays the up-to-date list of valid access codes for each restaurant after any code creation, update, or deletion, but only for unlinked employees**
- **Immediate backend updates to the list of available access codes whenever managers create or set new codes, ensuring real-time availability for employee authentication**
- **Default admin system that identifies the first Internet Identity account as the permanent admin with integrated admin functionality within the manager dashboard**
- **Migration system that preserves existing admin privileges when transitioning to the new default admin approach**
- **Session management system with secure logout functionality across all user roles and interfaces**
- **Complete app data reset migration system that allows the default admin to remove all data associated with every Internet Identity account and reset the system to a clean state as if nobody has ever connected**
- **Strict per-account privacy model migration that ensures each Internet Identity account only sees and manages their own restaurants, employee links, and customer history with no cross-account data access**
- **Robust error handling and empty state management that prevents infinite loading states and provides clear user guidance when no data exists**
- **Universal login button functionality that works for all users regardless of authentication state or data status**
- **Currency management architecture with restaurant-level default currency settings and customer-level currency selection capabilities**
- **Real-time currency conversion system with configurable exchange rates and immediate price updates**
- **Currency-aware data storage and retrieval that maintains pricing context across all user interactions**
- **Migration system that ensures all existing data is properly updated to support the new currency features**
- **Enhanced table link resolution system with robust URL parameter parsing, comprehensive table validation, and user-friendly error handling**
- **Direct customer routing for table links that bypasses authentication and landing pages while providing clear error messages for invalid table scenarios**
- **Reliable table-to-restaurant resolution that ensures customers always access the correct restaurant menu and ordering interface for valid table links**
- **Enhanced customer ordering experience with restaurant description display, personalized table welcome messages, and menu category organization for improved usability**
- **Priority Internet Identity link checking system that always verifies existing employee links before showing any code prompts, ensuring seamless authentication for previously linked accounts**
- **Comprehensive migration system that preserves all existing Internet Identity-to-employee links while enforcing the one-link-per-restaurant constraint**
- **Enhanced order routing and filtering system that ensures waiter employees see all relevant orders through comprehensive category-based and status-based filtering logic**
- **Migration system that validates and fixes existing menu item employee category assignments to ensure proper waiter order visibility**
- **Robust order processing architecture that prevents orders from being missed due to category or status mismatches in employee views**

## Language
The application content is displayed in English.
