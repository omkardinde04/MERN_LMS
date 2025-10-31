// Mock data for the Learnify LMS application

export const mockCourses = [
    {
        id: 'CS101',
        code: 'CS101',
        name: 'Introduction to Programming',
        instructor: 'Dr. Smith',
        class: 'A',
        semester: 'Fall 2025',
        credits: 4,
        enrolledStudents: 45,
        progress: 65,
    },
    {
        id: 'CS201',
        code: 'CS201',
        name: 'Data Structures',
        instructor: 'Dr. Johnson',
        class: 'B',
        semester: 'Fall 2025',
        credits: 4,
        enrolledStudents: 38,
        progress: 45,
    },
    {
        id: 'CS301',
        code: 'CS301',
        name: 'Database Management',
        instructor: 'Prof. Williams',
        class: 'A',
        semester: 'Fall 2025',
        credits: 3,
        enrolledStudents: 42,
        progress: 75,
    },
    {
        id: 'MATH101',
        code: 'MATH101',
        name: 'Calculus I',
        instructor: 'Dr. Brown',
        class: 'C',
        semester: 'Fall 2025',
        credits: 4,
        enrolledStudents: 50,
        progress: 55,
    },
];

export const mockAnnouncements = [
    {
        id: 1,
        courseId: 'CS101',
        title: 'Assignment 2 Deadline Extended',
        content: 'The deadline for Assignment 2 has been extended to next Friday.',
        date: '2025-10-28',
        author: 'Dr. Smith',
    },
    {
        id: 2,
        courseId: 'CS101',
        title: 'Guest Lecture on AI',
        content: 'We will have a guest lecture on Artificial Intelligence next week.',
        date: '2025-10-25',
        author: 'Dr. Smith',
    },
    {
        id: 3,
        courseId: 'CS201',
        title: 'Midterm Results Posted',
        content: 'Midterm exam results are now available on the portal.',
        date: '2025-10-27',
        author: 'Dr. Johnson',
    },
];

export const mockAssignments = [
    {
        id: 1,
        courseId: 'CS101',
        courseName: 'Introduction to Programming',
        title: 'Binary Search Implementation',
        description: 'Implement binary search algorithm in Python',
        dueDate: '2025-11-05',
        maxScore: 100,
        status: 'pending',
        submittedAt: null,
        score: null,
    },
    {
        id: 2,
        courseId: 'CS201',
        courseName: 'Data Structures',
        title: 'Linked List Operations',
        description: 'Create a doubly linked list with insert, delete, and search operations',
        dueDate: '2025-11-08',
        maxScore: 100,
        status: 'pending',
        submittedAt: null,
        score: null,
    },
    {
        id: 3,
        courseId: 'CS101',
        courseName: 'Introduction to Programming',
        title: 'Sorting Algorithms',
        description: 'Compare performance of different sorting algorithms',
        dueDate: '2025-10-25',
        maxScore: 100,
        status: 'submitted',
        submittedAt: '2025-10-23',
        score: 85,
    },
    {
        id: 4,
        courseId: 'CS301',
        courseName: 'Database Management',
        title: 'SQL Queries Practice',
        description: 'Complete the SQL queries worksheet',
        dueDate: '2025-10-22',
        maxScore: 50,
        status: 'submitted',
        submittedAt: '2025-10-20',
        score: 45,
    },
];

export const mockEvents = [
    {
        id: 1,
        title: 'Assignment 1 Due',
        date: '2025-11-05',
        type: 'assignment',
        courseId: 'CS101',
        courseName: 'Introduction to Programming',
        description: 'Binary Search Implementation due',
    },
    {
        id: 2,
        title: 'Midterm Exam',
        date: '2025-11-10',
        type: 'exam',
        courseId: 'CS201',
        courseName: 'Data Structures',
        description: 'Midterm covering topics 1-5',
    },
    {
        id: 3,
        title: 'Project Presentation',
        date: '2025-11-15',
        type: 'presentation',
        courseId: 'CS301',
        courseName: 'Database Management',
        description: 'Present your database design project',
    },
    {
        id: 4,
        title: 'Holiday - Thanksgiving',
        date: '2025-11-28',
        type: 'holiday',
        description: 'University closed for Thanksgiving',
    },
    {
        id: 5,
        title: 'Quiz 3',
        date: '2025-11-08',
        type: 'quiz',
        courseId: 'MATH101',
        courseName: 'Calculus I',
        description: 'Quiz on integration techniques',
    },
];

export const mockGrades = [
    {
        courseId: 'CS101',
        courseName: 'Introduction to Programming',
        assignments: 85,
        quizzes: 90,
        midterm: 82,
        final: 0,
        overall: 86,
    },
    {
        courseId: 'CS201',
        courseName: 'Data Structures',
        assignments: 78,
        quizzes: 85,
        midterm: 88,
        final: 0,
        overall: 83,
    },
    {
        courseId: 'CS301',
        courseName: 'Database Management',
        assignments: 92,
        quizzes: 88,
        midterm: 90,
        final: 0,
        overall: 90,
    },
    {
        courseId: 'MATH101',
        courseName: 'Calculus I',
        assignments: 75,
        quizzes: 80,
        midterm: 78,
        final: 0,
        overall: 77,
    },
];

export const mockStudents = [
    {
        id: '1001',
        name: 'John Doe',
        email: 'john.doe@somaiya.edu',
        courseId: 'CS101',
        courseName: 'Introduction to Programming',
        class: 'A',
    },
    {
        id: '1002',
        name: 'Jane Smith',
        email: 'jane.smith@somaiya.edu',
        courseId: 'CS101',
        courseName: 'Introduction to Programming',
        class: 'A',
    },
    {
        id: '1003',
        name: 'Mike Johnson',
        email: 'mike.j@somaiya.edu',
        courseId: 'CS201',
        courseName: 'Data Structures',
        class: 'B',
    },
    {
        id: '1004',
        name: 'Sarah Williams',
        email: 'sarah.w@somaiya.edu',
        courseId: 'CS201',
        courseName: 'Data Structures',
        class: 'B',
    },
];

export const mockTimetable = [
    {
        id: 1,
        day: 'Monday',
        time: '09:00 - 10:30',
        course: 'CS101',
        courseName: 'Introduction to Programming',
        type: 'Lecture',
        room: 'Room 301',
        class: 'A',
    },
    {
        id: 2,
        day: 'Monday',
        time: '11:00 - 12:30',
        course: 'CS201',
        courseName: 'Data Structures',
        type: 'Lecture',
        room: 'Room 205',
        class: 'B',
    },
    {
        id: 3,
        day: 'Tuesday',
        time: '14:00 - 16:00',
        course: 'CS101',
        courseName: 'Introduction to Programming',
        type: 'Lab',
        room: 'Lab 1',
        class: 'A',
    },
    {
        id: 4,
        day: 'Wednesday',
        time: '09:00 - 10:30',
        course: 'CS301',
        courseName: 'Database Management',
        type: 'Lecture',
        room: 'Room 402',
        class: 'A',
    },
    {
        id: 5,
        day: 'Thursday',
        time: '11:00 - 12:30',
        course: 'CS201',
        courseName: 'Data Structures',
        type: 'Practical',
        room: 'Lab 2',
        class: 'B',
    },
    {
        id: 6,
        day: 'Friday',
        time: '09:00 - 10:30',
        course: 'MATH101',
        courseName: 'Calculus I',
        type: 'Lecture',
        room: 'Room 101',
        class: 'C',
    },
];

export const codeStarters = {
    c: `#include <stdio.h>

int main() {
    printf("Hello, World!\n");
    return 0;
}`,
    cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
    java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
    python: `# Python code\nprint("Hello, World!")`,
};

export const initialFeedback = [
    {
        id: 1,
        courseId: 'CS101',
        courseName: 'Introduction to Programming',
        rating: 5,
        comment: 'Excellent course! Great instructor and well-structured content.',
        date: '2025-10-15',
    },
    {
        id: 2,
        courseId: 'CS201',
        courseName: 'Data Structures',
        rating: 4,
        comment: 'Good course but assignments are challenging.',
        date: '2025-10-20',
    },
];

// Initialize mock data in localStorage if not present
export const initializeMockData = () => {
    if (!localStorage.getItem('courses')) {
        localStorage.setItem('courses', JSON.stringify(mockCourses));
    }
    if (!localStorage.getItem('announcements')) {
        localStorage.setItem('announcements', JSON.stringify(mockAnnouncements));
    }
    if (!localStorage.getItem('assignments')) {
        localStorage.setItem('assignments', JSON.stringify(mockAssignments));
    }
    if (!localStorage.getItem('events')) {
        localStorage.setItem('events', JSON.stringify(mockEvents));
    }
    if (!localStorage.getItem('grades')) {
        localStorage.setItem('grades', JSON.stringify(mockGrades));
    }
    if (!localStorage.getItem('students')) {
        localStorage.setItem('students', JSON.stringify(mockStudents));
    }
    if (!localStorage.getItem('timetable')) {
        localStorage.setItem('timetable', JSON.stringify(mockTimetable));
    }
    if (!localStorage.getItem('feedback')) {
        localStorage.setItem('feedback', JSON.stringify(initialFeedback));
    }
};
