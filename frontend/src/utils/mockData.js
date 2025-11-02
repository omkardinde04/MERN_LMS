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
        students: 5,
        totalStudents: 60,
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
        students: 4,
        totalStudents: 50,
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
        students: 5,
        totalStudents: 55,
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
        students: 4,
        totalStudents: 50,
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
    {
        id: 5,
        courseId: 'CS201',
        courseName: 'Data Structures',
        title: 'Binary Tree Traversal',
        description: 'Implement inorder, preorder, and postorder tree traversal algorithms',
        dueDate: '2025-11-12',
        maxScore: 100,
        status: 'pending',
        submittedAt: null,
        score: null,
    },
    {
        id: 6,
        courseId: 'MATH101',
        courseName: 'Calculus I',
        title: 'Integration Problems Set',
        description: 'Solve the integration exercises from Chapter 5',
        dueDate: '2025-11-10',
        maxScore: 75,
        status: 'pending',
        submittedAt: null,
        score: null,
    },
    {
        id: 7,
        courseId: 'CS301',
        courseName: 'Database Management',
        title: 'Database Normalization Project',
        description: 'Design and normalize a database schema for an e-commerce system',
        dueDate: '2025-11-15',
        maxScore: 150,
        status: 'pending',
        submittedAt: null,
        score: null,
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

// Course-specific student enrollments for faculty dashboard
export const mockCourseStudents = {
    'CS101': [
        { id: 1, email: 'john.doe@somaiya.edu', name: 'John Doe', addedDate: '2025-09-01' },
        { id: 2, email: 'jane.smith@somaiya.edu', name: 'Jane Smith', addedDate: '2025-09-01' },
        { id: 3, email: 'alice.brown@somaiya.edu', name: 'Alice Brown', addedDate: '2025-09-02' },
        { id: 4, email: 'bob.wilson@somaiya.edu', name: 'Bob Wilson', addedDate: '2025-09-02' },
        { id: 5, email: 'carol.davis@somaiya.edu', name: 'Carol Davis', addedDate: '2025-09-03' },
    ],
    'CS201': [
        { id: 6, email: 'mike.j@somaiya.edu', name: 'Mike Johnson', addedDate: '2025-09-01' },
        { id: 7, email: 'sarah.w@somaiya.edu', name: 'Sarah Williams', addedDate: '2025-09-01' },
        { id: 8, email: 'david.miller@somaiya.edu', name: 'David Miller', addedDate: '2025-09-02' },
        { id: 9, email: 'emily.taylor@somaiya.edu', name: 'Emily Taylor', addedDate: '2025-09-03' },
    ],
    'CS301': [
        { id: 10, email: 'frank.moore@somaiya.edu', name: 'Frank Moore', addedDate: '2025-09-01' },
        { id: 11, email: 'grace.anderson@somaiya.edu', name: 'Grace Anderson', addedDate: '2025-09-01' },
        { id: 12, email: 'henry.thomas@somaiya.edu', name: 'Henry Thomas', addedDate: '2025-09-02' },
        { id: 13, email: 'iris.jackson@somaiya.edu', name: 'Iris Jackson', addedDate: '2025-09-03' },
        { id: 14, email: 'jack.white@somaiya.edu', name: 'Jack White', addedDate: '2025-09-04' },
    ],
    'MATH101': [
        { id: 15, email: 'kate.harris@somaiya.edu', name: 'Kate Harris', addedDate: '2025-09-01' },
        { id: 16, email: 'leo.martin@somaiya.edu', name: 'Leo Martin', addedDate: '2025-09-01' },
        { id: 17, email: 'mia.garcia@somaiya.edu', name: 'Mia Garcia', addedDate: '2025-09-02' },
        { id: 18, email: 'noah.rodriguez@somaiya.edu', name: 'Noah Rodriguez', addedDate: '2025-09-03' },
    ],
};

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

export const mockCodeSubmissions = [
    {
        id: 1,
        studentName: 'John Doe',
        studentEmail: 'john.doe@somaiya.edu',
        courseName: 'Introduction to Programming',
        courseId: 'CS101',
        fileName: 'binary_search.py',
        language: 'python',
        submittedAt: '2025-11-01T10:30:00',
        codeContent: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1

# Test the function
test_array = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
target = 7

result = binary_search(test_array, target)
if result != -1:
    print(f"Element found at index {result}")
else:
    print("Element not found in array")`,
        status: 'submitted'
    },
    {
        id: 2,
        studentName: 'Jane Smith',
        studentEmail: 'jane.smith@somaiya.edu',
        courseName: 'Data Structures',
        courseId: 'CS201',
        fileName: 'linked_list.cpp',
        language: 'cpp',
        submittedAt: '2025-11-02T14:15:00',
        codeContent: `#include <iostream>
using namespace std;

class Node {
public:
    int data;
    Node* next;
    
    Node(int val) {
        data = val;
        next = nullptr;
    }
};

class LinkedList {
private:
    Node* head;
    
public:
    LinkedList() {
        head = nullptr;
    }
    
    void insert(int val) {
        Node* newNode = new Node(val);
        if (head == nullptr) {
            head = newNode;
            return;
        }
        
        Node* temp = head;
        while (temp->next != nullptr) {
            temp = temp->next;
        }
        temp->next = newNode;
    }
    
    void display() {
        Node* temp = head;
        while (temp != nullptr) {
            cout << temp->data << " -> ";
            temp = temp->next;
        }
        cout << "NULL" << endl;
    }
};

int main() {
    LinkedList list;
    list.insert(10);
    list.insert(20);
    list.insert(30);
    list.display();
    return 0;
}`,
        status: 'submitted'
    },
    {
        id: 3,
        studentName: 'Mike Johnson',
        studentEmail: 'mike.j@somaiya.edu',
        courseName: 'Introduction to Programming',
        courseId: 'CS101',
        fileName: 'bubble_sort.java',
        language: 'java',
        submittedAt: '2025-10-30T16:45:00',
        codeContent: `public class BubbleSort {
    
    public static void bubbleSort(int[] arr) {
        int n = arr.length;
        boolean swapped;
        
        for (int i = 0; i < n - 1; i++) {
            swapped = false;
            
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    // Swap elements
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                    swapped = true;
                }
            }
            
            // If no swapping happened, array is sorted
            if (!swapped) break;
        }
    }
    
    public static void printArray(int[] arr) {
        for (int num : arr) {
            System.out.print(num + " ");
        }
        System.out.println();
    }
    
    public static void main(String[] args) {
        int[] arr = {64, 34, 25, 12, 22, 11, 90};
        
        System.out.println("Original array:");
        printArray(arr);
        
        bubbleSort(arr);
        
        System.out.println("Sorted array:");
        printArray(arr);
    }
}`,
        status: 'submitted'
    },
    {
        id: 4,
        studentName: 'Alice Brown',
        studentEmail: 'alice.brown@somaiya.edu',
        courseName: 'Data Structures',
        courseId: 'CS201',
        fileName: 'binary_tree.py',
        language: 'python',
        submittedAt: '2025-11-03T09:20:00',
        codeContent: `class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

class BinaryTree:
    def __init__(self):
        self.root = None
    
    def insert(self, value):
        if self.root is None:
            self.root = TreeNode(value)
        else:
            self._insert_recursive(self.root, value)
    
    def _insert_recursive(self, node, value):
        if value < node.value:
            if node.left is None:
                node.left = TreeNode(value)
            else:
                self._insert_recursive(node.left, value)
        else:
            if node.right is None:
                node.right = TreeNode(value)
            else:
                self._insert_recursive(node.right, value)
    
    def inorder_traversal(self, node):
        if node:
            self.inorder_traversal(node.left)
            print(node.value, end=' ')
            self.inorder_traversal(node.right)

# Create and test binary tree
tree = BinaryTree()
values = [50, 30, 70, 20, 40, 60, 80]

for val in values:
    tree.insert(val)

print("Inorder traversal:")
tree.inorder_traversal(tree.root)
print()`,
        status: 'submitted'
    },
    {
        id: 5,
        studentName: 'Sarah Williams',
        studentEmail: 'sarah.w@somaiya.edu',
        courseName: 'Introduction to Programming',
        courseId: 'CS101',
        fileName: 'fibonacci.c',
        language: 'c',
        submittedAt: '2025-10-28T11:00:00',
        codeContent: `#include <stdio.h>

int fibonacci(int n) {
    if (n <= 1)
        return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

void printFibonacci(int count) {
    printf("Fibonacci Series:\\n");
    for (int i = 0; i < count; i++) {
        printf("%d ", fibonacci(i));
    }
    printf("\\n");
}

int main() {
    int n = 10;
    
    printf("First %d Fibonacci numbers:\\n", n);
    printFibonacci(n);
    
    return 0;
}`,
        status: 'submitted'
    }
];

// Faculty Assignments and Submissions
export const mockFacultyAssignments = [
    {
        id: 1,
        title: 'Network Protocol Analysis',
        course: 'Computer Networks',
        courseId: 'CS101',
        dueDate: '2025-11-05',
        maxMarks: 100,
        description: 'Analyze TCP/IP and HTTP protocols',
        createdAt: '2025-10-20'
    },
    {
        id: 2,
        title: 'Database Design Project',
        course: 'DBMS',
        courseId: 'CS301',
        dueDate: '2025-11-10',
        maxMarks: 100,
        description: 'Design a normalized database schema',
        createdAt: '2025-10-25'
    },
    {
        id: 3,
        title: 'Process Scheduling Algorithm',
        course: 'Operating Systems',
        courseId: 'CS201',
        dueDate: '2025-11-15',
        maxMarks: 100,
        description: 'Implement CPU scheduling algorithms',
        createdAt: '2025-11-01'
    }
];

export const mockAssignmentSubmissions = {
    '1': [ // Network Protocol Analysis
        {
            id: 1,
            studentName: 'John Doe',
            studentEmail: 'john.doe@somaiya.edu',
            fileName: 'network_analysis.pdf',
            submittedAt: '2025-11-03T14:30:00',
            content: `Network Protocol Analysis Report

Student: John Doe
Course: Computer Networks

1. Introduction
This report analyzes the fundamental network protocols including TCP/IP, HTTP, and their implementations in modern networking.

2. TCP/IP Protocol
The Transmission Control Protocol provides reliable, ordered delivery of data between applications...

3. HTTP Protocol
Hypertext Transfer Protocol is an application-layer protocol for distributed systems...`,
            marks: 85,
            feedback: 'Good analysis, but could improve on security aspects.',
            status: 'graded'
        },
        {
            id: 2,
            studentName: 'Jane Smith',
            studentEmail: 'jane.smith@somaiya.edu',
            fileName: 'protocol_report.pdf',
            submittedAt: '2025-11-04T10:15:00',
            content: 'Network protocols assignment content...',
            status: 'submitted'
        }
    ],
    '2': [ // Database Design Project  
        {
            id: 3,
            studentName: 'Alice Brown',
            studentEmail: 'alice.brown@somaiya.edu',
            fileName: 'db_schema.pdf',
            submittedAt: '2025-11-08T16:45:00',
            content: 'Database design project submission...',
            marks: 92,
            feedback: 'Excellent normalization and ER diagram!',
            status: 'graded'
        }
    ],
    '3': [ // Process Scheduling
        {
            id: 4,
            studentName: 'Mike Johnson',
            studentEmail: 'mike.j@somaiya.edu',
            fileName: 'scheduling_algo.pdf',
            submittedAt: '2025-11-12T09:20:00',
            content: 'Process scheduling algorithms implementation...',
            status: 'submitted'
        }
    ]
};

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
    if (!localStorage.getItem('courseStudents')) {
        localStorage.setItem('courseStudents', JSON.stringify(mockCourseStudents));
    }
    if (!localStorage.getItem('submissions')) {
        localStorage.setItem('submissions', JSON.stringify(mockCodeSubmissions));
    }
    if (!localStorage.getItem('facultyAssignments')) {
        localStorage.setItem('facultyAssignments', JSON.stringify(mockFacultyAssignments));
    }
    if (!localStorage.getItem('assignmentSubmissions')) {
        localStorage.setItem('assignmentSubmissions', JSON.stringify(mockAssignmentSubmissions));
    }
};
