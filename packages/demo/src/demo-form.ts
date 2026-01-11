import { array, boolean, number, object, Schema, string } from "yup"

type Tag = "infrastructure" | "frontend" | "backend" | "full-stack"

export type ProjectFormState = {
  name?: string
  description?: string
  budget?: number
  isPublic?: boolean
  client?: {
    name?: string
    address?: {
      street?: string
      city?: string
    }
  }
  teamMembers?: {
    name?: string
    hourlyRate?: number
  }[]
  tags?: Tag[]
}

export type ValidProjectFormState = {
  name: string
  description: string
  budget: number
  isPublic: boolean
  client: {
    name: string
    address: {
      street: string
      city: string
    }
  }
  teamMembers: {
    name: string
    hourlyRate: number
  }[]
  tags?: Tag[]
}

export const projectFormSchema: Schema<ValidProjectFormState> = object({
  name: string().required(),
  description: string().required(),
  budget: number().required(),
  isPublic: boolean().required(),
  client: object({
    name: string().required(),
    address: object({
      street: string().required(),
      city: string().required()
    }).required()
  }).required(),
  teamMembers: array(
    object({
      name: string().required(),
      hourlyRate: number().required()
    })
  ).required(),
  tags: array(
    string()
      .oneOf(["infrastructure", "frontend", "backend", "full-stack"])
      .required()
  )
})
