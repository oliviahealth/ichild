import { z } from 'zod';

export const LocationSchema = z.object({
    address: z.string(),
    addressLink: z.string(),
    description: z.string(),
    name: z.string(),
    phone: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    isSaved: z.boolean()
});
export type ILocation = z.infer<typeof LocationSchema>

export const SavedLocationSchema = LocationSchema.extend({
    id: z.string().uuid(),
    dateCreated: z.number()
})
export type ISavedLocation = z.infer<typeof SavedLocationSchema>

export const APIResponseSchema = z.object({
    locations: z.array(LocationSchema),
    userQuery: z.string(),
    dateCreated: z.number()
});
export type IAPIResponse = z.infer<typeof APIResponseSchema>;

// A conversation object represents the entire back and forth communication between the user and the chatbot (questions the user asks and the corresponding response)
export const ConversationSchema = z.object({
    title: z.string(),
    id: z.string().uuid(),
    responses: z.array(APIResponseSchema),
    userId: z.string().optional(),
    dateCreated: z.number(),
    dateUpdated: z.number()
});
export type IConversation = z.infer<typeof ConversationSchema>;

export const ConversationDetailSchema = z.object({
    id: z.string().uuid(),
    title: z.string()
});
export type IConversationDetail = z.infer<typeof ConversationDetailSchema>

export const UserSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string(),
    dateCreated: z.number()
});
export type IUser = z.infer<typeof UserSchema>;