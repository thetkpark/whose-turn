import express, { Request, Response } from 'express'
import bodyParser from 'body-parser'

const app = express()

app.use(bodyParser.json())

type reqBodyFrom = {
	name: string
	members: string[]
}

app.post('/api/room', (req: Request<{}, {}, reqBodyFrom>, res: Response) => {
	console.log(req.body)
})

export default app
