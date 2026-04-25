import mongoose, { Schema, Document } from 'mongoose';

export type CalendarRole = 'Owner' | 'Editor' | 'Commentor' | 'Viewer';

export interface ICalendarMember {
  user: mongoose.Types.ObjectId;
  role: CalendarRole;
}

export interface IPendingMember {
  email: string;
  role: CalendarRole;
}

export interface ICalendar extends Document {
  name: string;
  description?: string;
  owner: mongoose.Types.ObjectId;
  members: ICalendarMember[];
  pendingMembers: IPendingMember[];
  createdAt: Date;
}

const CalendarSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [
    {
      user: { type: Schema.Types.ObjectId, ref: 'User' },
      role: { 
        type: String, 
        enum: ['Owner', 'Editor', 'Commentor', 'Viewer'],
        default: 'Viewer'
      }
    }
  ],
  pendingMembers: [
    {
      email: { type: String, required: true },
      role: { 
        type: String, 
        enum: ['Owner', 'Editor', 'Commentor', 'Viewer'],
        default: 'Viewer'
      }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ICalendar>('Calendar', CalendarSchema);
