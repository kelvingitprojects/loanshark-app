import React, { useMemo } from 'react';
import { Loan } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface DashboardProps {
  loans: Loan[];
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
};

const COLORS = {
    active: '#3b82f6', // blue-500
    paidOff: '#22c55e' // green-500
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null;

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12px">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};


// FIX: Refactor from `React.FC` to a standard function component.
const Dashboard = ({ loans }: DashboardProps) => {
    const stats = useMemo(() => {
        const totalLoaned = loans.reduce((acc, loan) => acc + loan.loanAmount, 0);
        const totalOwed = loans.reduce((acc, loan) => acc + loan.totalOwed, 0);
        const totalRepaid = loans.reduce((acc, loan) => acc + loan.totalRepaid, 0);
        const outstandingDebt = totalOwed - totalRepaid;
        const totalMarkup = totalOwed - totalLoaned;
        const paidOffCount = loans.filter(l => (l.totalOwed - l.totalRepaid) <= 0).length;
        const activeCount = loans.length - paidOffCount;
        
        return {
            totalLoaned,
            outstandingDebt,
            totalMarkup,
            paidOffCount,
            activeCount,
            totalLoans: loans.length,
        };
    }, [loans]);

    const chartData = [
        { name: 'Active', value: stats.activeCount },
        { name: 'Paid Off', value: stats.paidOffCount },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Loaned (Principal)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats.totalLoaned)}</div>
                    <p className="text-xs text-muted-foreground">across {stats.totalLoans} loan(s)</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Outstanding Debt</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats.outstandingDebt)}</div>
                    <p className="text-xs text-muted-foreground">{stats.activeCount} active loan(s)</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Markup</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats.totalMarkup)}</div>
                     <p className="text-xs text-muted-foreground">potential profit</p>
                </CardContent>
            </Card>
             <Card className="sm:col-span-2 lg:col-span-1">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Loan Status Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loans.length > 0 ? (
                        <ResponsiveContainer width="100%" height={100}>
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                    outerRadius={40}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    <Cell key={`cell-active`} fill={COLORS.active} />
                                    <Cell key={`cell-paidOff`} fill={COLORS.paidOff} />
                                </Pie>
                                <Tooltip formatter={(value) => `${value} loan(s)`}/>
                                <Legend iconSize={10} wrapperStyle={{ fontSize: '12px', padding: '0 10px' }}/>
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[100px]">
                            <p className="text-sm text-muted-foreground">No data for chart</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Dashboard;