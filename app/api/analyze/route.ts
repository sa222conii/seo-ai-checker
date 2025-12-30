import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { kv } from "@vercel/kv";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Fallback in-memory store for local development
const localRateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting function using Vercel KV (with local fallback)
async function checkRateLimit(ip: string): Promise<{ allowed: boolean; remaining: number }> {
    const now = Date.now();
    const dailyLimit = 5;
    const resetTime = new Date().setHours(24, 0, 0, 0); // Reset at midnight
    const key = `rate_limit:${ip}`;

    try {
        // Try to use Vercel KV (production)
        const data = await kv.get<{ count: number; resetTime: number }>(key);

        if (!data || now > data.resetTime) {
            await kv.set(key, { count: 1, resetTime }, { exat: Math.floor(resetTime / 1000) });
            return { allowed: true, remaining: dailyLimit - 1 };
        }

        if (data.count >= dailyLimit) {
            return { allowed: false, remaining: 0 };
        }

        const newCount = data.count + 1;
        await kv.set(key, { count: newCount, resetTime: data.resetTime }, { exat: Math.floor(data.resetTime / 1000) });
        return { allowed: true, remaining: dailyLimit - newCount };
    } catch (error) {
        // Fallback to in-memory for local development
        console.log("Using in-memory rate limiting (local development mode)");
        const userData = localRateLimitStore.get(ip);

        if (!userData || now > userData.resetTime) {
            localRateLimitStore.set(ip, { count: 1, resetTime });
            return { allowed: true, remaining: dailyLimit - 1 };
        }

        if (userData.count >= dailyLimit) {
            return { allowed: false, remaining: 0 };
        }

        userData.count++;
        localRateLimitStore.set(ip, userData);
        return { allowed: true, remaining: dailyLimit - userData.count };
    }
}

export async function POST(request: NextRequest) {
    try {
        // Get IP address for rate limiting
        const ip = request.headers.get("x-forwarded-for") || "unknown";

        // Check rate limit
        const { allowed, remaining } = await checkRateLimit(ip);

        if (!allowed) {
            return NextResponse.json(
                { error: "1日の利用回数制限に達しました。明日またお試しください。" },
                { status: 429 }
            );
        }

        const { title, headings, content } = await request.json();

        // Validate inputs
        if (!title || !headings || !content) {
            return NextResponse.json(
                { error: "すべてのフィールドを入力してください。" },
                { status: 400 }
            );
        }

        // Create SEO analysis prompt
        const prompt = `あなたはSEOの専門家です。以下の記事情報を分析し、SEOの観点から評価してください。

【記事タイトル】
${title}

【見出し】
${headings}

【本文（冒頭）】
${content.substring(0, 500)}

以下の形式でJSON形式で返してください：
{
  "score": 数値（0-100の整数）,
  "analysis": "詳細な分析内容（改行区切りで複数行）",
  "improvements": ["改善提案1", "改善提案2", "改善提案3"]
}

評価基準：
1. タイトルの文字数（30-35文字が理想）
2. タイトルにキーワードが前半に含まれているか
3. 見出しの階層構造は適切か
4. 見出しにキーワードが含まれているか
5. 本文の読みやすさ
6. キーワードの自然な使用

JSONのみを返してください。`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "あなたは企業のSEO担当者向けの分析ツールです。" },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0].message.content || "{}");

        return NextResponse.json({
            ...result,
            remaining,
        });

    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: "分析中にエラーが発生しました。もう一度お試しください。" },
            { status: 500 }
        );
    }
}
