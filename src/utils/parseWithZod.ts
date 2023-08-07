import { ZodSchema } from "zod";
import useAppStore from "../stores/useAppStore";


/*
    Parse with zod acts as a wrapper around zod parse
    Takes in the data to parse and the schema to validate against
    If there is an error, set the error state in zustand
*/
const parseWithZod = (dataToParse: any, zodSchema: ZodSchema) => {
    try {
        zodSchema.parse(dataToParse)
    } catch (error) {
        useAppStore.setState({ error: 'Something went wrong!' })
    }
}

export default parseWithZod;