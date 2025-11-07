import React from 'react';
import { TrendingUp, TrendingDown, AlertCircle, DollarSign, PieChart } from 'lucide-react';
import { useStats } from '../stats/useStats';
import { useCurrency } from '../../../hooks/useCurrency';

export function SpendingInsights() {
  const stats = useStats();
  const { formatCurrency } = useCurrency();

  const insights = [
    {
      title: 'Average Transaction',
      icon: DollarSign,
      value: formatCurrency(stats.averageTransaction.value),
      trend: stats.averageTransaction.trend.value,
      isPositive: stats.averageTransaction.trend.isPositive,
      description: `${Math.abs(stats.averageTransaction.trend.value)}% vs last month`,
    },
    {
      title: 'Highest Spending Category',
      icon: PieChart,
      value: stats.categories.breakdown[0]?.category || 'N/A',
      amount: stats.categories.breakdown[0]?.amount || 0,
      percentage: stats.categories.breakdown[0]?.percentage || 0,
    },
    {
      title: 'Spending Alert',
      icon: AlertCircle,
      value: stats.alerts.message,
      severity: stats.alerts.severity,
      description: stats.alerts.severity === 'normal' 
        ? 'Your spending is within normal range'
        : 'Consider reviewing your spending habits',
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'alert':
        return 'text-red-500';
      case 'warning':
        return 'text-amber-500';
      default:
        return 'text-green-500';
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {insights.map((insight, index) => (
        <div 
          key={index}
          className="rounded-2xl bg-white p-6 shadow-lg"
        >
          <div className="flex items-center gap-2 mb-4">
            <insight.icon className={`h-5 w-5 ${
              insight.severity ? getSeverityColor(insight.severity) : 'text-purple-600'
            }`} />
            <h3 className="text-lg font-medium text-gray-900">{insight.title}</h3>
          </div>

          <div className="mt-2 text-2xl font-semibold text-gray-900">
            {insight.value}
          </div>

          {insight.amount && (
            <div className="mt-1 text-sm text-gray-500">
              {formatCurrency(insight.amount)} ({insight.percentage.toFixed(1)}% of total)
            </div>
          )}

          {insight.trend !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              {insight.isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-sm ${insight.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {insight.description}
              </span>
            </div>
          )}

          {insight.description && !insight.trend && (
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
              {insight.severity && insight.severity !== 'normal' && (
                <AlertCircle className={`h-4 w-4 ${getSeverityColor(insight.severity)}`} />
              )}
              {insight.description}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}