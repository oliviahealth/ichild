import axios from "axios"

import {  IAPIResponse } from "./interfaces"

export const getConversations = async (userId: string) => {
   return (await axios.get(`${import.meta.env.VITE_API_URL}/conversations`, { params: { 'userId': userId }, withCredentials: true })).data
}

export const postConversation = async (id: string, title: string, userId: string) => {
    await axios.post(`${import.meta.env.VITE_API_URL}/conversations`, { id, title, userId })
}

export const postResponse = async (response: IAPIResponse, conversationId: string) => {
    await axios.post(`${import.meta.env.VITE_API_URL}/response`, {...response, conversationId: conversationId})
}