import 'dotenv/config'
import { Telegraf } from 'telegraf'

const token = process.env.TELEGRAM_BOT_TOKEN
if (!token) {
  console.error("ERROR: 'TELEGRAM_BOT_TOKEN' not found in .env")
  process.exit(1)
}
const bot = new Telegraf(token)

bot.start(ctx => {
  const userName = ctx.from.first_name
  const userId = ctx.from.id

  ctx.reply(`Ahoj! ${userName}.`)
})

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

bot.launch()
  .then(() => {
    console.log('🤖 Bot running and listening for requests...')
  })
  .catch(err => {
    console.error('ERROR occured: ', err.message)
  })