import { useCurrency } from '../../hooks/useCurrency';

interface ExpenseCardProps {
  amount: number;
}

export function ExpenseCard({ amount }: ExpenseCardProps) {
  const { formatCurrency } = useCurrency();
  const formattedAmount = formatCurrency(amount);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg">
      <h2 className="text-xl font-semibold text-gray-800">Today's Expenditure</h2>
      <p className="mt-2 text-4xl font-bold text-blue-500">{formattedAmount}</p>
    </div>
  );
}