import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, ChefHat, Wine, UserCircle, RefreshCw, Copy, Check, KeyRound, Trash2, Link as LinkIcon } from 'lucide-react';
import { useEmployees, useAddEmployee, useGenerateAccessCode, useUpdateAccessCode, useDeleteEmployee, useAccessCodesByRestaurant } from '@/hooks/useQueries';
import { toast } from 'sonner';
import { EmployeeRole, UserRole } from '@/backend';
import type { Restaurant, Employee, AccessCodeData } from '@/backend';
import SetEmployeeCodeModal from './SetEmployeeCodeModal';

interface EmployeeManagementProps {
  restaurant: Restaurant;
}

export default function EmployeeManagement({ restaurant }: EmployeeManagementProps) {
  const { data: employees, isLoading: employeesLoading } = useEmployees(restaurant.identityId);
  const { data: accessCodes, isLoading: accessCodesLoading } = useAccessCodesByRestaurant(restaurant.identityId);
  const addEmployeeMutation = useAddEmployee();
  const generateCodeMutation = useGenerateAccessCode();
  const updateCodeMutation = useUpdateAccessCode();
  const deleteEmployeeMutation = useDeleteEmployee();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: EmployeeRole.waiter,
  });
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showSetCodeModal, setShowSetCodeModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  const isLoading = employeesLoading || accessCodesLoading;

  // Helper function to get the current active code for an employee from accessCodes
  const getEmployeeActiveCode = (employeeId: string): string | null => {
    if (!accessCodes) return null;
    const employeeCode = accessCodes.find(
      (codeData: AccessCodeData) => 
        codeData.employeeId === employeeId && 
        codeData.isActive
    );
    return employeeCode ? employeeCode.code : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const employeeId = `employee-${Date.now()}`;

    try {
      // Generate access code first
      const result = await generateCodeMutation.mutateAsync({
        role: UserRole.user,
        identityId: restaurant.identityId,
        employeeId: employeeId,
      });

      const employee: Employee = {
        id: employeeId,
        name: formData.name,
        role: formData.role,
        accessCode: result.code,
      };

      await addEmployeeMutation.mutateAsync({
        identityId: restaurant.identityId,
        employee,
      });

      toast.success(`Employee added successfully! One-time code: ${result.code}`);
      setShowForm(false);
      setFormData({
        name: '',
        role: EmployeeRole.waiter,
      });
    } catch (error: any) {
      console.error('Failed to add employee:', error);
      toast.error(error.message || 'Failed to add employee. Please try again.');
    }
  };

  const handleUpdateCode = async (employee: Employee) => {
    try {
      // Get the current active code for this employee
      const currentCode = getEmployeeActiveCode(employee.id);
      if (!currentCode) {
        toast.error('No active code found for this employee');
        return;
      }

      const result = await updateCodeMutation.mutateAsync({
        code: currentCode,
        identityId: restaurant.identityId,
      });

      toast.success(`One-time code updated for ${employee.name}. New code: ${result.newCode}`);
    } catch (error: any) {
      console.error('Failed to update code:', error);
      toast.error(error.message || 'Failed to update one-time code. Please try again.');
    }
  };

  const handleSetCode = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowSetCodeModal(true);
  };

  const handleSetCodeSuccess = async () => {
    // Refetch is handled automatically by the mutation's onSuccess
  };

  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) return;

    try {
      await deleteEmployeeMutation.mutateAsync({
        identityId: restaurant.identityId,
        employeeId: employeeToDelete.id,
      });

      toast.success(`${employeeToDelete.name} has been removed from your team.`);
      setEmployeeToDelete(null);
    } catch (error: any) {
      console.error('Failed to delete employee:', error);
      toast.error(error.message || 'Failed to delete employee. Please try again.');
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('One-time code copied to clipboard!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getRoleIcon = (role: EmployeeRole) => {
    switch (role) {
      case EmployeeRole.kitchen:
        return <ChefHat className="w-4 h-4" />;
      case EmployeeRole.bar:
        return <Wine className="w-4 h-4" />;
      case EmployeeRole.waiter:
        return <UserCircle className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getRoleBadgeVariant = (role: EmployeeRole): "default" | "secondary" | "outline" => {
    switch (role) {
      case EmployeeRole.kitchen:
        return 'default';
      case EmployeeRole.bar:
        return 'secondary';
      case EmployeeRole.waiter:
        return 'outline';
      default:
        return 'default';
    }
  };

  const getRoleLabel = (role: EmployeeRole) => {
    switch (role) {
      case EmployeeRole.kitchen:
        return 'Kitchen';
      case EmployeeRole.bar:
        return 'Bar';
      case EmployeeRole.waiter:
        return 'Waiter';
      default:
        return role;
    }
  };

  // Filter employees: unclaimed (no principal) and claimed (has principal)
  const unclaimedEmployees = (employees || []).filter(emp => !emp.principal);
  const claimedEmployees = (employees || []).filter(emp => emp.principal);

  const groupedUnclaimedEmployees = unclaimedEmployees.reduce(
    (acc, employee) => {
      if (!acc[employee.role]) {
        acc[employee.role] = [];
      }
      acc[employee.role].push(employee);
      return acc;
    },
    {} as Record<EmployeeRole, Employee[]>
  );

  const groupedClaimedEmployees = claimedEmployees.reduce(
    (acc, employee) => {
      if (!acc[employee.role]) {
        acc[employee.role] = [];
      }
      acc[employee.role].push(employee);
      return acc;
    },
    {} as Record<EmployeeRole, Employee[]>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Employee Management</h2>
          <p className="text-muted-foreground">Manage your restaurant staff and one-time access codes</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Add Employee Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Employee</DialogTitle>
            <DialogDescription>Add a new employee with a unique one-time access code</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="employeeName">Employee Name</Label>
                <Input
                  id="employeeName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., John Smith"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employeeRole">Category</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value as EmployeeRole })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EmployeeRole.waiter}>
                      <div className="flex items-center gap-2">
                        <UserCircle className="w-4 h-4" />
                        <span>Waiter</span>
                      </div>
                    </SelectItem>
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
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  A unique 6-digit one-time code will be generated automatically
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addEmployeeMutation.isPending || generateCodeMutation.isPending}>
                {addEmployeeMutation.isPending || generateCodeMutation.isPending ? 'Adding...' : 'Add Employee'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Set Custom Code Modal */}
      <SetEmployeeCodeModal
        open={showSetCodeModal}
        onOpenChange={setShowSetCodeModal}
        employee={selectedEmployee}
        identityId={restaurant.identityId}
        onSuccess={handleSetCodeSuccess}
      />

      {/* Delete Employee Confirmation Dialog */}
      <AlertDialog open={!!employeeToDelete} onOpenChange={(open) => !open && setEmployeeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{employeeToDelete?.name}</strong>? This action cannot be undone. 
              {employeeToDelete?.principal 
                ? ' They will no longer be able to access the system with their linked Internet Identity.'
                : ' Their one-time code will be deactivated.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEmployee}
              disabled={deleteEmployeeMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteEmployeeMutation.isPending ? 'Deleting...' : 'Delete Employee'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading employees...</p>
          </div>
        </div>
      ) : !employees || employees.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No employees yet</h3>
            <p className="text-muted-foreground mb-4">Add your first employee to get started</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Unclaimed Codes Section */}
          {unclaimedEmployees.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/20">
                  <img
                    src="/assets/generated/code-claim-icon-transparent.dim_64x64.png"
                    alt="Unclaimed Codes"
                    className="w-5 h-5 object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Unclaimed One-Time Codes</h3>
                  <p className="text-sm text-muted-foreground">Share these codes with employees to link their accounts</p>
                </div>
              </div>
              
              {Object.entries(groupedUnclaimedEmployees).map(([role, employeeList]) => (
                <Card key={role}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      {getRoleIcon(role as EmployeeRole)}
                      <CardTitle>{getRoleLabel(role as EmployeeRole)}</CardTitle>
                    </div>
                    <CardDescription>
                      {(employeeList as Employee[]).length} unclaimed code(s)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(employeeList as Employee[]).map((employee) => {
                        const activeCode = getEmployeeActiveCode(employee.id);
                        return (
                          <div
                            key={employee.id}
                            className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              {getRoleIcon(employee.role)}
                              <div className="flex-1">
                                <h4 className="font-semibold">{employee.name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-sm text-muted-foreground">
                                    One-Time Code:
                                  </p>
                                  {activeCode ? (
                                    <>
                                      <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                                        {activeCode}
                                      </code>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => handleCopyCode(activeCode)}
                                      >
                                        {copiedCode === activeCode ? (
                                          <Check className="w-3 h-3 text-green-600" />
                                        ) : (
                                          <Copy className="w-3 h-3" />
                                        )}
                                      </Button>
                                    </>
                                  ) : (
                                    <span className="text-sm text-muted-foreground italic">Loading...</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={getRoleBadgeVariant(employee.role)}>
                                {getRoleLabel(employee.role)}
                              </Badge>
                              {activeCode && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSetCode(employee)}
                                  >
                                    <KeyRound className="w-3 h-3 mr-1" />
                                    Set Code
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUpdateCode(employee)}
                                    disabled={updateCodeMutation.isPending}
                                  >
                                    <RefreshCw className="w-3 h-3 mr-1" />
                                    Regenerate
                                  </Button>
                                </>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEmployeeToDelete(employee)}
                                disabled={deleteEmployeeMutation.isPending}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Linked Employees Section */}
          {claimedEmployees.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                  <img
                    src="/assets/generated/internet-identity-link-icon-transparent.dim_64x64.png"
                    alt="Linked Employees"
                    className="w-5 h-5 object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Linked Employees</h3>
                  <p className="text-sm text-muted-foreground">Employees who have linked their Internet Identity</p>
                </div>
              </div>
              
              {Object.entries(groupedClaimedEmployees).map(([role, employeeList]) => (
                <Card key={role}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      {getRoleIcon(role as EmployeeRole)}
                      <CardTitle>{getRoleLabel(role as EmployeeRole)}</CardTitle>
                    </div>
                    <CardDescription>
                      {(employeeList as Employee[]).length} linked employee(s)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(employeeList as Employee[]).map((employee) => (
                        <div
                          key={employee.id}
                          className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            {getRoleIcon(employee.role)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{employee.name}</h4>
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                                  <LinkIcon className="w-3 h-3 mr-1" />
                                  Linked
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                Internet Identity linked successfully
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getRoleBadgeVariant(employee.role)}>
                              {getRoleLabel(employee.role)}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEmployeeToDelete(employee)}
                              disabled={deleteEmployeeMutation.isPending}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
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
        </div>
      )}
    </div>
  );
}
