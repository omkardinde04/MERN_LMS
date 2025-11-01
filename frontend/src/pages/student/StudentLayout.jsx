import React from 'react';
import { Outlet } from 'react-router-dom';
import StudentSidebar from '@/components/StudentSidebar';

export default function StudentLayout() {
    return (
        <div className="flex h-screen overflow-hidden bg-white">
            <StudentSidebar />
            <main className="flex-1 overflow-y-auto bg-white">
                <div className="container mx-auto p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
