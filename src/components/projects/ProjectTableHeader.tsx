
import React from 'react';

const ProjectTableHeader: React.FC = () => {
  return (
    <thead>
      <tr className="border-b bg-gray-50">
        <th className="w-12 px-4 py-3 text-left">
          <div className="flex items-center">
            <input type="checkbox" className="rounded border-gray-300" />
          </div>
        </th>
        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">名称</th>
        <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">状态</th>
        <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">创建日期</th>
        <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">构建</th>
        <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">回复数</th>
        <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">报告</th>
        <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">操作</th>
      </tr>
    </thead>
  );
};

export default ProjectTableHeader;
