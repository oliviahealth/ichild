export interface IQuery {
    question: string
    answer: {
        address: string[]
        confidences: number[]
        descriptions: string[]
        names: string[]
        notFoundMessage: string
        phone: string[]
        userQuery: string
    }
}