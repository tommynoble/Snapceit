import { useState, useMemo } from 'react';
import { useReceipts } from '../../components/dashboard/receipts/ReceiptContext';
import { calculateDeductions } from '../../services/tax/deductionCalculator';
import { generateScheduleCPDF } from '../../services/tax/scheduleCGenerator';
import { Download, FileText, DollarSign, TrendingDown, PieChart as PieChartIcon, CircleDollarSign } from 'lucide-react';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { useAuth } from '../../auth/SupabaseAuthContext';
import { useSettings } from '../../hooks/useSettings';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { homedir } from 'os';


export function TaxReports() {
    const { receipts, loading } = useReceipts();
    const { currentUser } = useAuth();
    const { settings } = useSettings();
    const [selectedYear, setSelectedYear] = useState(settings?.defaultTaxYear || new Date().getFullYear());
    const [grossIncome, setGrossIncome] = useState<string>(''); // String to handle empty input

    const summary = useMemo(() => {
        // Filter receipts by year
        const yearReceipts = receipts.filter(r => {
            const date = r.date ? new Date(r.date) : new Date(r.created_at || new Date().toISOString());
            return date.getFullYear() === selectedYear;
        });

        // Calculate deductions
        const incomeValue = parseFloat(grossIncome) || 0;
        return calculateDeductions(yearReceipts, incomeValue);
    }, [receipts, selectedYear, grossIncome]);


    const handleDownloadPDF = async () => {
        const blob = await generateScheduleCPDF(summary, selectedYear, {
            name: currentUser?.user_metadata?.full_name || 'Snapceit User',
            businessName: settings?.businessName || currentUser?.user_metadata?.business_name,
            taxId: settings?.taxId
        });

        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Schedule_C_${selectedYear}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // Prepare chart data
    const chartData = useMemo(() => {
        return summary.breakdown.map(item => ({
            name: item.taxLabel,
            value: item.totalAmount
        })).filter(item => item.value > 0);
    }, [summary]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BBF', '#FF6B6B', '#4ECDC4'];

    if (loading) return <div className="p-8 text-center text-white">Loading tax data...</div>;

    return (
        <div className="space-y-6">
            <DashboardHeader
                title="Tax Reports"
                description="Generate Schedule C and view tax deductions"
                addDesktopTopPadding={true}
                actionButton={
                    <div className="flex items-center gap-3">
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="bg-white/10 border border-white/20 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            {[...Array(5)].map((_, i) => {
                                const year = new Date().getFullYear() - i;
                                return <option key={year} value={year} className="text-gray-900">{year}</option>;
                            })}
                        </select>

                        <button
                            onClick={handleDownloadPDF}
                            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg hover:shadow-purple-500/25"
                        >
                            <Download size={18} />
                            Download Schedule C
                        </button>
                    </div>
                }
            />

            {/* Input Section */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
                <div className="flex flex-col md:flex-row gap-6 items-end">
                    <div className="w-full md:w-1/3">
                        <label className="block text-sm font-medium text-white/80 mb-2">Estimated Gross Income (Part I)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-400">$</span>
                            </div>
                            <input
                                type="number"
                                value={grossIncome}
                                onChange={(e) => setGrossIncome(e.target.value)}
                                placeholder="0.00"
                                className="pl-7 w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>

                    <div className="flex-1 grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-white/60 text-sm">Est. Net Profit</p>
                            <p className={`text-xl font-bold ${summary.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                ${summary.netProfit.toFixed(2)}
                            </p>
                        </div>
                        <div>
                            <p className="text-white/60 text-sm">Est. Tax Savings (approx 25%)</p>
                            <p className="text-xl font-bold text-blue-400">
                                ${(summary.totalDeductions * 0.25).toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                            <DollarSign className="text-emerald-400" size={24} />
                        </div>
                        <h3 className="text-lg font-medium text-white">Total Expenses</h3>
                    </div>
                    <p className="text-3xl font-bold text-white">${summary.totalExpenses.toFixed(2)}</p>
                    <p className="text-sm text-white/50 mt-1">Gross receipt total</p>
                </div>

                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <TrendingDown className="text-blue-400" size={24} />
                        </div>
                        <h3 className="text-lg font-medium text-white">Tax Deductible</h3>
                    </div>
                    <p className="text-3xl font-bold text-white">${summary.totalDeductions.toFixed(2)}</p>
                    <p className="text-sm text-white/50 mt-1">Eligible deductions</p>
                </div>

                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <FileText className="text-purple-400" size={24} />
                        </div>
                        <h3 className="text-lg font-medium text-white">Itemized Categories</h3>
                    </div>
                    <p className="text-3xl font-bold text-white">{summary.breakdown.length}</p>
                    <p className="text-sm text-white/50 mt-1">Tax lines used</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Breakdown Table */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-purple-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900">Schedule C Breakdown</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Tax Line</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Description</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Total</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-center">Rate</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Deductible</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {summary.breakdown.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            No deductible expenses found for {selectedYear}.
                                        </td>
                                    </tr>
                                ) : (
                                    summary.breakdown.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium text-purple-600">{item.taxCode}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{item.taxLabel}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900 text-right">${item.totalAmount.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 text-center">{(item.deductionRate * 100).toFixed(0)}%</td>
                                            <td className="px-6 py-4 text-sm font-bold text-emerald-600 text-right">${item.deductibleAmount.toFixed(2)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            <tfoot className="bg-gray-50 border-t border-gray-200">
                                <tr>
                                    <td colSpan={2} className="px-6 py-4 text-sm font-bold text-gray-900 text-right">Totals</td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">${summary.totalExpenses.toFixed(2)}</td>
                                    <td className="px-6 py-4"></td>
                                    <td className="px-6 py-4 text-sm font-bold text-emerald-600 text-right">${summary.totalDeductions.toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Chart Section */}
                <div className="bg-white rounded-xl shadow-lg border border-purple-100 p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <PieChartIcon className="text-purple-600" size={20} />
                        <h3 className="text-lg font-bold text-gray-900">Expense Distribution</h3>
                    </div>
                    <div className="h-[300px] w-full">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {chartData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number) => `$${value.toFixed(2)}`}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                No data to display
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
