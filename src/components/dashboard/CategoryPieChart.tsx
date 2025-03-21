
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useNavigate } from "react-router-dom";

interface CategoryData {
  name: string;
  value: number;
}

interface CategoryPieChartProps {
  data: CategoryData[];
  onSliceClick: (data: any, index: number) => void;
  className?: string;
}

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ 
  data, 
  onSliceClick,
  className 
}) => {
  const navigate = useNavigate();
  const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', 
    '#8884d8', '#82ca9d', '#ffc658', '#ff7300'
  ];

  const handlePieClick = (data: any, index: number) => {
    console.log("Pie slice clicked:", data.name);
    onSliceClick(data, index);
    
    // Navigate to inventory with the category filter
    navigate(`/inventory?category=${encodeURIComponent(data.name)}`);
  };

  const handleLegendClick = (data: any) => {
    console.log("Legend item clicked:", data.value);
    onSliceClick({ name: data.value }, -1);
    
    // Navigate to inventory with the category filter
    navigate(`/inventory?category=${encodeURIComponent(data.value)}`);
  };

  return (
    <Card className={`${className || ''}`}>
      <CardHeader>
        <CardTitle>Inventory by Category</CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-5rem)]">
        <div className="h-full min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={({ name, value }) => `${name}: $${value.toLocaleString()}`}
                onClick={handlePieClick}
                className="cursor-pointer"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
              />
              <Legend 
                onClick={handleLegendClick}
                className="cursor-pointer"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
