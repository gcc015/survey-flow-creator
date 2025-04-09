import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  BarChart3, Download, FileSpreadsheet, 
  PieChart, ArrowLeft, Filter, Search 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Bar, 
  BarChart, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  Pie,
  PieChart as RechartsPlot
} from 'recharts';

interface ResponseData {
  id: string;
  responses: Record<string, any>[];
}

const SurveyResults: React.FC = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const [activeTab, setActiveTab] = useState('data');
  const [responseData, setResponseData] = useState<ResponseData | null>(null);
  
  useEffect(() => {
    // In a real app, we would fetch data from an API
    const mockData: ResponseData = {
      id: surveyId || '',
      responses: [
        { respid: 1, Q1: 1, Q2: 1, Q3: 0, Q4: 1, Q5: 2, Q6: 5, Q7: 'Nothing to tell' },
        { respid: 2, Q1: 1, Q2: 0, Q3: 1, Q4: 2, Q5: 4, Q6: 4, Q7: 'Nothing to tell' },
        { respid: 3, Q1: 2, Q2: 1, Q3: 2, Q4: 1, Q5: 2, Q6: 3, Q7: 'Nothing to tell' },
        { respid: 4, Q1: 1, Q2: 0, Q3: 0, Q4: 1, Q5: 1, Q6: 1, Q7: 'Nothing to tell' },
        { respid: 5, Q1: 1, Q2: 0, Q3: 1, Q4: 2, Q5: 5, Q6: 5, Q7: 'Nothing to tell' },
      ]
    };
    
    setResponseData(mockData);
  }, [surveyId]);

  const getQuestionStats = (questionKey: string) => {
    if (!responseData) return [];
    
    // Count frequencies
    const counts: Record<string, number> = {};
    responseData.responses.forEach(response => {
      const value = response[questionKey];
      counts[value] = (counts[value] || 0) + 1;
    });
    
    // Convert to array for charts
    return Object.entries(counts).map(([value, count]) => ({
      value,
      count,
      percentage: Math.round((count / responseData.responses.length) * 100)
    }));
  };

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white mr-2" 
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="text-sm text-gray-300">项目：</div>
            <div className="font-medium">{surveyId}</div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-white border-gray-600 hover:bg-gray-800"
          >
            <Download className="h-4 w-4 mr-2" />
            导出数据
          </Button>
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="text-sm font-semibold">JP</span>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto">
          <Tabs 
            defaultValue="data" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-none h-auto">
              <TabsTrigger 
                value="data" 
                className="py-3 data-[state=active]:bg-white rounded-none border-b-2 border-transparent data-[state=active]:border-brand-500"
              >
                原始数据
              </TabsTrigger>
              <TabsTrigger 
                value="charts" 
                className="py-3 data-[state=active]:bg-white rounded-none border-b-2 border-transparent data-[state=active]:border-brand-500"
              >
                图表分析
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-8 px-4">
        <TabsContent value="data" className="mt-0">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>调查回复数据</CardTitle>
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input 
                      className="pl-9 w-60" 
                      placeholder="搜索数据..." 
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded border overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="bg-gray-50">respid</TableHead>
                        <TableHead className="bg-gray-50">Q1</TableHead>
                        <TableHead className="bg-gray-50">Q2</TableHead>
                        <TableHead className="bg-gray-50">Q3</TableHead>
                        <TableHead className="bg-gray-50">Q4</TableHead>
                        <TableHead className="bg-gray-50">Q5</TableHead>
                        <TableHead className="bg-gray-50">Q6</TableHead>
                        <TableHead className="bg-gray-50">Q7</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {responseData?.responses.map((row) => (
                        <TableRow key={row.respid}>
                          <TableCell>{row.respid}</TableCell>
                          <TableCell>{row.Q1}</TableCell>
                          <TableCell>{row.Q2}</TableCell>
                          <TableCell>{row.Q3}</TableCell>
                          <TableCell>{row.Q4}</TableCell>
                          <TableCell>{row.Q5}</TableCell>
                          <TableCell>{row.Q6}</TableCell>
                          <TableCell>{row.Q7}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="charts" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Question 1 Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">问题 1 回应</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getQuestionStats('Q1')}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="value" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0076BD">
                        {getQuestionStats('Q1').map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Question 2 Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">问题 2 回应</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPlot>
                      <Pie
                        data={getQuestionStats('Q2')}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {getQuestionStats('Q2').map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPlot>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Other question charts would follow the same pattern */}
          </div>
        </TabsContent>
      </div>
    </div>
  );
};

export default SurveyResults;
