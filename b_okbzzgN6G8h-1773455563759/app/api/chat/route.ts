import {
  consumeStream,
  convertToModelMessages,
  streamText,
  UIMessage,
} from 'ai'

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: 'openai/gpt-5-mini',
    system: `انت مساعد تصميم ذكي اسمك "مساعد سعود". تساعد المستخدمين في:
- اقتراح افكار تصميم ابداعية
- نصائح حول الالوان والخطوط
- شرح كيفية استخدام ادوات التصميم
- اقتراح تحسينات للتصميمات
- الاجابة على اسئلة التصميم الجرافيكي

كن ودوداً ومفيداً. اجب باللغة العربية دائماً. استخدم لغة بسيطة وواضحة.`,
    messages: await convertToModelMessages(messages),
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    consumeSseStream: consumeStream,
  })
}
