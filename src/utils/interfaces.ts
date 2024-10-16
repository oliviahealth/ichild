import { z } from 'zod';

export const LocationSchema = z.object({
    id: z.string(),
    address: z.string(),
    addressLink: z.string().optional(),
    description: z.string(),
    name: z.string(),
    phone: z.string(),
    website: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    rating: z.number().optional().nullable(),
    hoursOfOperation: z.array(z.record(z.string(), z.string())),
    isSaved: z.boolean(),
});
export type ILocation = z.infer<typeof LocationSchema>

export const SavedLocationSchema = LocationSchema.extend({
    dateCreated: z.number()
})
export type ISavedLocation = z.infer<typeof SavedLocationSchema>

export const APIResponseSchema = z.object({
    userQuery: z.string(),
    response: z.string(),
    responseType: z.enum(["location", "direct"]),
    locations: z.array(LocationSchema),
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

export const ConversationPreviewSchema = z.object({
    id: z.string().uuid(),
    title: z.string()
});
export type IConversationPreview = z.infer<typeof ConversationPreviewSchema>

export const UserSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string(),
    isAdmin: z.boolean(),
    dateCreated: z.number()
});
export type IUser = z.infer<typeof UserSchema>;