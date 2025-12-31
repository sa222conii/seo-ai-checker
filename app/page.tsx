"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Home() {
    const [formData, setFormData] = useState({
        title: "",
        headings: "",
        content: "",
    });
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const { user, logout } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAnalyzing(true);
        setError(null);
        setResult(null);

        try {
            if (!user) {
                const today = new Date().toISOString().split('T')[0];
                const lastDate = localStorage.getItem('seo_last_date');
                let count = parseInt(localStorage.getItem('seo_count') || '0');

                if (lastDate !== today) {
                    count = 0;
                    localStorage.setItem('seo_last_date', today);
                }

                if (count >= 3) {
                    throw new Error("未ログインユーザーは1日3回までです。ログインして続けてください。");
                }

                localStorage.setItem('seo_count', (count + 1).toString());
            }

            const response = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "分析中にエラーが発生しました");
            }

            setResult(data);

            if (user) {
                try {
                    await addDoc(collection(db, "users", user.uid, "history"), {
                        title: formData.title,
                        score: data.score,
                        result: data,
                        createdAt: serverTimestamp()
                    });
                } catch (e) {
                    console.error("History save error", e);
                }
            }
        } catch (error: any) {
            console.error("エラーが発生しました:", error);
            setError(error.message || "予期せぬエラーが発生しました。もう一度お試しください。");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
            {/* Header */}
            <header className="border-b border-white/10 backdrop-blur-sm bg-black/20">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                AI-Powered SEO Checker
                            </h1>
                            <p className="text-slate-400 mt-2">AIがあなたの記事のSEOを分析・スコアリング</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {user ? (
                                <div className="flex items-center gap-4">
                                    <Link href="/history" className="text-sm text-slate-300 hover:text-white transition-colors">
                                        履歴
                                    </Link>
                                    <span className="text-sm text-slate-400 hidden md:inline">{user.email}</span>
                                    <button onClick={() => logout()} className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors border border-white/10 hover:bg-white/5 rounded-lg">
                                        ログアウト
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <Link href="/login" className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors">
                                        ログイン
                                    </Link>
                                    <Link href="/signup" className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-lg shadow-blue-500/20">
                                        新規登録
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Input Form */}
                    <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl h-fit">
                        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                            <span className="text-2xl">📝</span>
                            記事情報を入力
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Title Input */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    記事タイトル
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    placeholder="例：AIを使ったSEO対策の完全ガイド"
                                    required
                                />
                            </div>

                            {/* Headings Input */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    見出し（H2, H3など）
                                </label>
                                <textarea
                                    value={formData.headings}
                                    onChange={(e) => setFormData({ ...formData, headings: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all h-32 resize-none"
                                    placeholder="見出しを1行ずつ入力してください"
                                    required
                                />
                            </div>

                            {/* Content Input */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    本文（最初の500文字程度）
                                </label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all h-48 resize-none"
                                    placeholder="記事の本文を貼り付けてください"
                                    required
                                />
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-sm flex items-center gap-2">
                                    <span>⚠️</span>
                                    {error}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isAnalyzing}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-blue-500/50"
                            >
                                {isAnalyzing ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="animate-spin">⏳</span>
                                        分析中...
                                    </span>
                                ) : (
                                    "AIで分析する"
                                )}
                            </button>
                        </form>

                        {/* Rate Limit Info */}
                        {!user && (
                            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                <p className="text-sm text-yellow-200 flex items-center gap-2">
                                    <span>⚡</span>
                                    1日3回まで無料で利用可能（ログインで制限解除）
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Results Display */}
                    <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl h-fit">
                        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                            <span className="text-2xl">📊</span>
                            分析結果
                        </h2>

                        {!result ? (
                            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                                <div className="text-6xl mb-4">🤖</div>
                                <p>記事情報を入力して分析を開始してください</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* SEO Score with Progress Circle */}
                                <div className="text-center">
                                    <div className="relative inline-flex items-center justify-center">
                                        {/* Background Circle */}
                                        <svg className="transform -rotate-90" width="180" height="180">
                                            <circle
                                                cx="90"
                                                cy="90"
                                                r="70"
                                                stroke="currentColor"
                                                strokeWidth="12"
                                                fill="none"
                                                className="text-white/10"
                                            />
                                            {/* Progress Circle */}
                                            <circle
                                                cx="90"
                                                cy="90"
                                                r="70"
                                                stroke="url(#gradient)"
                                                strokeWidth="12"
                                                fill="none"
                                                strokeDasharray={`${2 * Math.PI * 70}`}
                                                strokeDashoffset={`${2 * Math.PI * 70 * (1 - result.score / 100)}`}
                                                className="transition-all duration-1000 ease-out"
                                                strokeLinecap="round"
                                            />
                                            <defs>
                                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor="#60a5fa" />
                                                    <stop offset="100%" stopColor="#22d3ee" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                        {/* Score Text */}
                                        <div className="absolute">
                                            <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                                {result.score}
                                            </div>
                                            <div className="text-slate-400 text-sm mt-1">/100</div>
                                        </div>
                                    </div>
                                    <p className="text-slate-300 mt-4">総合SEOスコア</p>

                                    {/* Score Rating */}
                                    <div className="mt-3">
                                        <span className={`px-4 py-1 rounded-full text-sm font-semibold ${result.score >= 80 ? 'bg-green-500/20 text-green-400' :
                                            result.score >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-red-500/20 text-red-400'
                                            }`}>
                                            {result.score >= 80 ? '優秀' : result.score >= 60 ? '良好' : '要改善'}
                                        </span>
                                    </div>
                                </div>

                                {/* Detailed Analysis */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                        <h3 className="font-semibold text-white">
                                            詳細分析
                                        </h3>
                                        <button
                                            onClick={() => {
                                                const text = `【SEOスコア】${result.score}/100\n\n【詳細分析】\n${result.analysis}\n\n【改善提案】\n${result.improvements?.join('\n') || ''}`;
                                                navigator.clipboard.writeText(text);
                                            }}
                                            className="px-3 py-1 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-300 transition-colors flex items-center gap-1"
                                        >
                                            <span>📋</span>
                                            コピー
                                        </button>
                                    </div>
                                    <div className="space-y-3 text-slate-300 text-sm">
                                        {result.analysis?.split('\n').map((line: string, index: number) => (
                                            <p key={index} className="leading-relaxed">{line}</p>
                                        ))}
                                    </div>
                                </div>

                                {/* Improvements */}
                                {result.improvements && (
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-white border-b border-white/10 pb-2">
                                            改善提案
                                        </h3>
                                        <ul className="space-y-3 text-slate-300 text-sm">
                                            {result.improvements.map((item: string, index: number) => (
                                                <li key={index} className="flex gap-3 items-start p-3 bg-white/5 rounded-lg border border-white/5 hover:border-cyan-500/30 transition-colors">
                                                    <span className="text-cyan-400 text-lg flex-shrink-0">✓</span>
                                                    <span className="leading-relaxed">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
