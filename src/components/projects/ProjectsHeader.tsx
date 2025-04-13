
import React from 'react';
import { AlignJustify, BarChart3, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface ProjectsHeaderProps {
  onLogout: () => void;
}

const ProjectsHeader: React.FC<ProjectsHeaderProps> = ({ onLogout }) => {
  // Get initials for avatar
  const getUserInitials = () => {
    const email = localStorage.getItem('userEmail') || '';
    if (email) {
      // Get first letter of email or first two letters before @
      const parts = email.split('@');
      if (parts[0].length >= 2) {
        return parts[0].substring(0, 2).toUpperCase();
      } else {
        return email.substring(0, 1).toUpperCase();
      }
    }
    return 'JP'; // Default fallback
  };

  return (
    <header className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between">
      <div className="flex items-center">
        <div className="text-lg font-medium mr-1">DeepSurvey</div>
        <div className="text-sm text-gray-300"></div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <Button 
            size="icon" 
            variant="ghost" 
            className="text-white hover:bg-gray-800"
          >
            <AlignJustify className="h-5 w-5" />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            className="text-white hover:bg-gray-800"
          >
            <BarChart3 className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarFallback className="bg-blue-500 text-white">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="cursor-pointer" onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>退出登录</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default ProjectsHeader;
