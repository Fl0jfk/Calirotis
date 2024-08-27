import { Configuration, OpenAIApi } from "openai-edge";
import { OpenAIStream, StreamingTextResponse } from "ai";

export const runtime = 'edge';

const config = new Configuration({
    apiKey: process.env.OPEN_API_KEY
})
const openai = new OpenAIApi(config);

export async function POST(request: Request) {
    const { messages } = await request.json();
    console.log(messages);
    const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        stream: true,
        messages: [
            { 
                role: "system", 
                content: "Tu es assistant sur un site web. Le site web est un site vitrine pour un traiteur, sa spécialité est le cochon de lait. Il propose différents types de plats."
            },
            ...messages
        ]
    })
    const stream = await OpenAIStream(response);
    return new StreamingTextResponse(stream);
}