import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './calendar.css';
import TaskList from './TaskList'; // Adjust the import path as needed

const CalendarApp = () => {
  const [date, setDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [taskDates, setTaskDates] = useState(new Set());

  // Get user ID from localStorage
  const userId = localStorage.getItem('hidden-id-user');

  useEffect(() => {
    const initializeTasks = async () => {
      await fetchAllTasks();
      await fetchTasks(new Date());
    };

    initializeTasks();
  }, []);

  useEffect(() => {
    if (selectedDay) {
      fetchTasks(selectedDay);
    }
  }, [selectedDay]);

  const startOfDayUTC = (date) => {
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    return utcDate;
  };

  const fetchTasks = async (day) => {
    try {
      const formattedDate = startOfDayUTC(day).toISOString().split('T')[0];
      console.log('Fetching tasks for:', formattedDate);

      const response = await axios.get('http://localhost:8000/backend/calendar/tasks.php', {
        params: {
          day: formattedDate,
          userId: userId, // Include userId here
        },
      });

      let tasksForDate = response.data;

      if (Array.isArray(tasksForDate)) {
        setTasks(tasksForDate);
      } else {
        console.warn('Fetched data is not an array:', tasksForDate);
        setTasks([]);
      }

      console.log('Tasks for day:', tasksForDate);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    }
  };

  const fetchAllTasks = async () => {
    try {
      const response = await axios.get('http://localhost:8000/backend/calendar/tasks.php', {
        params: { userId: userId }, // Include userId here
      });
      const allTasks = response.data;
      console.log('All tasks:', allTasks);

      const datesWithIncompleteTasks = new Set(
        allTasks
          .filter((task) => task.completed === 0) // Filter tasks that are not completed
          .map((task) => new Date(task.task_date).toISOString().split('T')[0]), // Extract and format the date
      );

      // Output the set of dates with incomplete tasks
      console.log('gato lucas', datesWithIncompleteTasks);

      const datesWithTasks = new Set(allTasks.map((task) => new Date(task.task_date).toISOString().split('T')[0]));
      setTaskDates(datesWithIncompleteTasks);
    } catch (error) {
      console.error('Error fetching all tasks:', error);
    }
  };

  const onDateClick = (value) => {
    setSelectedDay(value);
    setDate(value); // Update calendar view date
  };

  const refreshTasks = (day) => {
    fetchTasks(day);
    fetchAllTasks();
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateString = startOfDayUTC(date).toISOString().split('T')[0];
      if (taskDates.has(dateString)) {
        return 'has-tasks';
      }
    }
    return null;
  };

  return (
    <div className="pb-28 flex flex-col items-center justify-center gap-4 px-6 py-8 rounded-lg shadow-md">
      <h1 className="text-center text-2xl font-bold">Calendario de tareas</h1>
      <Calendar value={date} onClickDay={onDateClick} className="w-full bg-purple-400 rounded-xl" tileClassName={tileClassName} />
      {selectedDay && <TaskList day={selectedDay} tasks={tasks} refreshTasks={refreshTasks} />}
    </div>
  );
};

export default CalendarApp;
