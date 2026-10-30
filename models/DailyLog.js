import mongoose from 'mongoose'

const DailyLogSchema = new mongoose.Schema({
  userId: String,
  date: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  },
  morningPriorities: [String],
  eveningReport: {
    type: String,
    default: () => ''
  },
  aiAnalysis: {
    type: String,
    default: () => ''
  },
  status: {
    type: String,
    enum: ['PENDING_MORNING', 'AWAITING_EVENING', 'EVALUATED'],
    default: 'PENDING_MORNING'
  }
})

DailyLogSchema.index({userId: 1, date: 1}, {unique: true})

export const DailyLog = mongoose.model('DailyLog', DailyLogSchema)