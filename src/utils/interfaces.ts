import { z } from 'zod';

export const LocationSchema = z.object({
    address: z.string(),
    addressLink: z.string(),
    confidence: z.number().min(0).max(1),
    description: z.string(),
    name: z.string(),
    phone: z.string(),
    latitude: z.number(),
    longitude: z.number(),
});
export type ILocation = z.infer<typeof LocationSchema>

export const APIResponseSchema = z.object({
    locations: z.array(LocationSchema),
    userQuery: z.string()
});
export type IAPIResponse = z.infer<typeof APIResponseSchema>;

// A conversation object represents the entire back and forth communication between the user and the chatbot (questions the user asks and the corresponding response)
export const ConversationSchema = z.object({
    title: z.string(),
    id: z.string(),
    responses: z.array(APIResponseSchema),
    userId: z.string()
});
export type IConversation = z.infer<typeof ConversationSchema>;

export const UserSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string()
});
export type IUser = z.infer<typeof UserSchema>;