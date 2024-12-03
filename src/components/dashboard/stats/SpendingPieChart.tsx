import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector, Legend, Tooltip } from 'recharts';
import { useStats } from './useStats';

const COLORS = [
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
];

const renderActiveShape = (props: any) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    value,
    percent
  } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 8}
        outerRadius={outerRadius + 12}
        fill={fill}
      />
      <text x={cx} y={cy - 12} textAnchor="middle" fill="#1F2937" className="text-xl font-semibold">
        {payload.category}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#6B7280" className="text-lg">
        ${value.toFixed(2)} ({(percent * 100).toFixed(1)}%)
      </text>
    </g>
  );
};

export function SpendingPieChart() {
  const { categories } = useStats();
  const [activeIndex, setActiveIndex] = useState(0);

  const data = categories.breakdown.map((item) => ({
    category: item.category,
    value: item.amount,
    percentage: item.percentage,
  }));

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg bg-white p-4 shadow-lg ring-1 ring-black ring-opacity-5">
          <p className="text-lg font-medium text-gray-900">{data.category}</p>
          <p className="text-base text-gray-600">
            ${data.value.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500">
            {data.percentage.toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="mt-8 grid grid-cols-2 gap-6">
        {payload.map((entry: any, index: number) => (
          <div
            key={entry.value}
            className="flex items-center gap-3 cursor-pointer transition-colors duration-200 hover:bg-gray-50 p-2 rounded-lg"
            onMouseEnter={() => setActiveIndex(index)}
          >
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900 text-base">{entry.value}</div>
              <div className="text-gray-500 text-sm">
                ${data[index].value.toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-[500px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={80}
            outerRadius={110}
            dataKey="value"
            onMouseEnter={onPieEnter}
          >
            {data.map((_, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
                className="transition-all duration-200 hover:opacity-80"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}