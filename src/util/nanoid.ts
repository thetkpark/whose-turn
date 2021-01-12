import { customAlphabet } from 'nanoid'

const alphabet = '0123456789'
export const generateId = customAlphabet(alphabet, 6)
