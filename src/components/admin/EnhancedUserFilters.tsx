import { Search, Filter, SortAsc, SortDesc, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface FilterState {
  search: string;
  status: string;
  role: string;
  sortBy: 'name' | 'email' | 'created_at' | 'status';
  sortOrder: 'asc' | 'desc';
}

interface StatusCounts {
  all: number;
  pending_approval: number;
  approved: number;
  active: number;
  needs_role: number;
  suspended: number;
  rejected: number;
}

interface EnhancedUserFiltersProps {
  filters: FilterState;
  statusCounts: StatusCounts;
  onFiltersChange: (filters: FilterState) => void;
  onRefresh: () => void;
}

export function EnhancedUserFilters({ 
  filters, 
  statusCounts, 
  onFiltersChange, 
  onRefresh 
}: EnhancedUserFiltersProps) {
  
  const updateFilter = (key: keyof FilterState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      status: 'all',
      role: 'all',
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
  };

  const activeFiltersCount = [
    filters.search && 'search',
    filters.status !== 'all' && 'status',
    filters.role !== 'all' && 'role'
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Search and Primary Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or any field..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status ({statusCounts.all})</SelectItem>
              <SelectItem value="pending_approval">
                Pending ({statusCounts.pending_approval})
              </SelectItem>
              <SelectItem value="approved">Approved ({statusCounts.approved})</SelectItem>
              <SelectItem value="active">Active ({statusCounts.active})</SelectItem>
              <SelectItem value="needs_role">Needs Role ({statusCounts.needs_role})</SelectItem>
              <SelectItem value="suspended">Suspended ({statusCounts.suspended})</SelectItem>
              <SelectItem value="rejected">Rejected ({statusCounts.rejected})</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.role} onValueChange={(value) => updateFilter('role', value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="master_admin">Master Admin</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="user">Standard User</SelectItem>
              <SelectItem value="no_roles">No Roles</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Sort and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Select 
            value={`${filters.sortBy}-${filters.sortOrder}`} 
            onValueChange={(value) => {
              const [sortBy, sortOrder] = value.split('-') as [FilterState['sortBy'], FilterState['sortOrder']];
              onFiltersChange({ ...filters, sortBy, sortOrder });
            }}
          >
            <SelectTrigger className="w-48">
              {filters.sortOrder === 'asc' ? (
                <SortAsc className="h-4 w-4 mr-2" />
              ) : (
                <SortDesc className="h-4 w-4 mr-2" />
              )}
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="email-asc">Email (A-Z)</SelectItem>
              <SelectItem value="email-desc">Email (Z-A)</SelectItem>
              <SelectItem value="created_at-desc">Newest First</SelectItem>
              <SelectItem value="created_at-asc">Oldest First</SelectItem>
              <SelectItem value="status-asc">Status (A-Z)</SelectItem>
              <SelectItem value="status-desc">Status (Z-A)</SelectItem>
            </SelectContent>
          </Select>
          
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-7 px-2 text-xs"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
        
        <Button variant="outline" onClick={onRefresh} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { key: 'pending_approval', label: 'Pending', color: 'text-amber-600', bgColor: 'bg-amber-50 hover:bg-amber-100' },
          { key: 'approved', label: 'Approved', color: 'text-blue-600', bgColor: 'bg-blue-50 hover:bg-blue-100' },
          { key: 'active', label: 'Active', color: 'text-green-600', bgColor: 'bg-green-50 hover:bg-green-100' },
          { key: 'needs_role', label: 'Needs Role', color: 'text-orange-600', bgColor: 'bg-orange-50 hover:bg-orange-100' },
          { key: 'suspended', label: 'Suspended', color: 'text-gray-600', bgColor: 'bg-gray-50 hover:bg-gray-100' },
          { key: 'rejected', label: 'Rejected', color: 'text-red-600', bgColor: 'bg-red-50 hover:bg-red-100' },
        ].map(({ key, label, color, bgColor }) => (
          <button
            key={key}
            onClick={() => updateFilter('status', key === 'all' ? 'all' : key)}
            className={`text-center p-3 rounded-lg border transition-colors ${bgColor} ${
              filters.status === key ? 'ring-2 ring-primary' : 'hover:shadow-sm'
            }`}
          >
            <div className={`font-semibold text-lg ${color}`}>
              {statusCounts[key as keyof StatusCounts]}
            </div>
            <div className="text-xs text-muted-foreground font-medium">{label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}