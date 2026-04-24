import { create } from 'zustand';

interface Calendar {
  _id: string;
  name: string;
  description?: string;
  owner: any;
  members: any[];
}

interface Event {
  _id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  allDay: boolean;
  calendarId: string;
}

interface CalendarState {
  calendars: Calendar[];
  currentCalendar: Calendar | null;
  events: Event[];
  setCalendars: (calendars: Calendar[]) => void;
  setCurrentCalendar: (calendar: Calendar | null) => void;
  setEvents: (events: Event[]) => void;
  addEvent: (event: Event) => void;
  updateEvent: (event: Event) => void;
  removeEvent: (eventId: string) => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  calendars: [],
  currentCalendar: null,
  events: [],
  setCalendars: (calendars) => set({ calendars }),
  setCurrentCalendar: (calendar) => set({ currentCalendar: calendar }),
  setEvents: (events) => set({ events }),
  addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
  updateEvent: (updatedEvent) => set((state) => ({
    events: state.events.map((e) => (e._id === updatedEvent._id ? updatedEvent : e))
  })),
  removeEvent: (eventId) => set((state) => ({
    events: state.events.filter((e) => e._id !== eventId)
  })),
}));
