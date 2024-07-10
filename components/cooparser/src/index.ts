import express from 'express'
import 'express-async-errors'
import type { Filter } from 'mongodb'
import { db, init } from './Database'
import type { IAction, IDelta } from './Types'
import { Parser } from './Parser'

const app = express()

app.use(express.json()) // Для обработки JSON-запросов
app.use(express.urlencoded({ extended: true })) // Для обработки URL-encoded запросов

const port = process.env.PORT || 4000

export const parser = new Parser()

init().then(() => {
  app.listen(port, () => {
    console.log(`API обозревателя запущено на http://localhost:${port}`)
    if (process.env.ACTIVATE_PARSER === '1')
      parser.start()
  })
})

app.get('/get-tables', async (req: any, res: any) => {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10
  const filter: Filter<IDelta> = req.query.filter ? JSON.parse(req.query.filter) : {}
  const result = await db.getTables(filter, page, limit)
  res.json(result)
})

app.get('/get-actions', async (req: any, res: any) => {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10
  const filter: Filter<IAction> = req.query.filter ? JSON.parse(req.query.filter) : {}
  const result = await db.getActions(filter, page, limit)
  res.json(result)
})

app.get('/get-current-block', async (req: any, res: any) => {
  const result = await db.getCurrentBlock()
  res.json(result)
})

// Глобальный обработчик ошибок
app.use((err: any, req: any, res: any, _next: any) => {
  console.error(err)
  res.status(500).send(err.message)
})
