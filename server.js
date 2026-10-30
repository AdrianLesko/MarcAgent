import 'dotenv/config'
import mongoose from 'mongoose'
import { Telegraf } from 'telegraf'

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

connectDB()

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

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

bot.launch()
  .catch(err => {
    console.error('ERROR occured: ', err.message)
  })

console.log('🤖 bot running and listening for requests...')