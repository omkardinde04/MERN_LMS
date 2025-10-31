import React from 'react';
import { Outlet } from 'react-router-dom';
import FacultySidebar from '@/components/FacultySidebar';

export default function FacultyLayout() {
    return (
        <div className="flex h-screen overflow-hidden">
            <FacultySidebar />
            <main className="flex-1 overflow-y-auto bg-background">
                <div className="container mx-auto p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
