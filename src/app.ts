import express, { Request, Response } from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import routers from './routes'

const app = express()

app.set('trust proxy', 1)
app.use(cors())
app.use(helmet())
app.use(
	rateLimit({
		windowMs: 1000,
		max: 10
	})
)
app.use(bodyParser.json())

app.use(routers)

export default app
