import React from 'react';
import { Card, CardContent, CardHeader } from './Card';

// FIX: Refactor from `React.FC` to a standard function component.
export const DashboardSkeleton = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                </CardHeader>
                <CardContent>
                    <div className="h-8 bg-muted rounded w-1/2 animate-pulse mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/3 animate-pulse"></div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                </CardHeader>
                <CardContent>
                    <div className="h-8 bg-muted rounded w-1/2 animate-pulse mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/3 animate-pulse"></div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                </CardHeader>
                <CardContent>
                    <div className="h-8 bg-muted rounded w-1/2 animate-pulse mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/3 animate-pulse"></div>
                </CardContent>
            </Card>
            <Card className="sm:col-span-2 lg:col-span-1">
                <CardHeader className="pb-2">
                    <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                </CardHeader>
                <CardContent className="p-0 flex items-center justify-center h-[100px]">
                     <div className="h-16 w-16 bg-muted rounded-full animate-pulse"></div>
                </CardContent>
            </Card>
        </div>
    );
};
