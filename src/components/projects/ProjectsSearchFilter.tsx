
import React from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ProjectsSearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const ProjectsSearchFilter: React.FC<ProjectsSearchFilterProps> = ({ 
  searchTerm, 
  onSearchChange 
}) => {
  return (
    <div className="flex items-center p-4 border-b">
      <div className="flex-1">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            className="pl-10 w-full"
            placeholder="搜索项目..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      <div className="ml-4">
        <Button variant="outline" className="flex items-center">
          <Filter className="mr-2 h-4 w-4" />
          筛选
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ProjectsSearchFilter;
