
import React from 'react';
import { Check, BarChart3, MoreHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface Project {
  id: string;
  name: string;
  status: 'live' | 'draft';
  created: string;
  responses: number;
}

interface ProjectTableRowProps {
  project: Project;
  onProjectClick: (projectId: string) => void;
  onDeleteProject: (e: React.MouseEvent, projectId: string) => void;
}

const ProjectTableRow: React.FC<ProjectTableRowProps> = ({ 
  project, 
  onProjectClick, 
  onDeleteProject 
}) => {
  return (
    <tr 
      key={project.id} 
      className="border-b hover:bg-gray-50 cursor-pointer"
      onClick={() => onProjectClick(project.id)}
    >
      <td className="px-4 py-4">
        <div className="flex items-center">
          <input type="checkbox" className="rounded border-gray-300" onClick={(e) => e.stopPropagation()} />
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center">
          <div className="text-sm font-medium text-gray-900">{project.name}</div>
        </div>
      </td>
      <td className="px-4 py-4 text-center">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
          ${project.status === 'live' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {project.status === 'live' ? 'LIVE' : 'DRAFT'}
        </span>
      </td>
      <td className="px-4 py-4 text-center text-sm text-gray-500">
        {project.created}
      </td>
      <td className="px-4 py-4 text-center">
        <Button size="icon" variant="ghost">
          <Check className="h-4 w-4" />
        </Button>
      </td>
      <td className="px-4 py-4 text-center text-sm font-medium text-blue-600">
        {project.responses}
      </td>
      <td className="px-4 py-4 text-center">
        <Button size="icon" variant="ghost">
          <BarChart3 className="h-4 w-4" />
        </Button>
      </td>
      <td className="px-4 py-4 text-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button size="icon" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              className="text-red-600" 
              onClick={(e) => onDeleteProject(e, project.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>删除项目</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
};

export default ProjectTableRow;
