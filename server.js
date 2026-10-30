import 'dotenv/config'
import mongoose from 'mongoose'
import { Telegraf } from 'telegraf'
import {DailyLog} from './models/DailyLog.js'

async function connectDB () {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('server succesfully connected to DB...')
    console.log('trying to connect to MarcBot...')
  } catch (err) {
    console.error("ERROR: connecting to DB failed: ", err.message)
    process.exit(1)
  }
}

await connectDB()

const token = process.env.TELEGRAM_BOT_TOKEN
if (!token) {
  console.error("ERROR: 'TELEGRAM_BOT_TOKEN' not found in .env")
  process.exit(1)
}

const bot = new Telegraf(token)

bot.start(ctx => {
  const userName = ctx.from.first_name
  const userId = ctx.from.id

  ctx.reply(`Ahoj! ${userName} (id: ${userId}).`)
})

bot.command('reset', async (ctx) => {
  const userId = ctx.from.id
  const today = new Date().toISOString().split('T')[0]
  await DailyLog.deleteOne({userId, date: today})
  ctx.reply('🤖 Dnesny zaznam zmazany! Nastav nove priority')
})


bot.on('text', async (ctx) => {
  const messageContent = ctx.message.text
  const userId = String(ctx.from.id)

  const today = new Date().toISOString().split('T')[0 ]
  let log = await DailyLog.findOne({userId, date: today})
  const priorities = messageContent.split('\n').map(p => p.trim()).filter(p => p.length > 0)

  if (!log) {
    log = new DailyLog({
      userId,
      date: today, 
      morningPriorities: priorities, 
      status: "AWAITING_EVENING"
    })
    ctx.reply('🤖 Priorites set for today! good luck!')
    await log.save()
    return
  } else if (log.status === "PENDING_MORNING") {
    log.morningPriorities = priorities
    log.status = "AWAITING_EVENING"
    ctx.reply('🤖 Priorites set for today! good luck!')
    await log.save()
    return
  }

  if (log && log.status === "AWAITING_EVENING") {
    log.eveningReport = messageContent
    await log.save()
    ctx.reply(`🤖 Večerný report zaznamenaný! Pripravujem analýzu tvojho dňa...`)
    
    return
  }

  if (log && log.status === "EVALUATED") {
    ctx.reply('🤖 Dnesok mame uzavrety. oddychni si! zajtra sa vidime')
    return
  }
})




process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

bot.launch()
  .catch(err => {
    console.error('ERROR occured: ', err.message)
  })

console.log('🤖 bot running and listening for requests...')