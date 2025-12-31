"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

export default function HistoryPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [history, setHistory] = useState<any[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) return;

            try {
                const q = query(
                    collection(db, "users", user.uid, "history"),
                    orderBy("createdAt", "desc")
                );
                const querySnapshot = await getDocs(q);
                const data = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    // Convert timestamp to date
                    createdAt: doc.data().createdAt?.toDate()
                }));
                setHistory(data);
            } catch (error) {
                console.error("Error fetching history:", error);
            } finally {
                setIsLoadingHistory(false);
            }
        };

        if (user) {
            fetchHistory();
        }
    }, [user]);

    if (loading || (user && isLoadingHistory)) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
                読み込み中...
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
            <header className="border-b border-white/10 backdrop-blur-sm bg-black/20">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex justify-between items-center">
                        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            AI-Powered SEO Checker
                        </Link>
                        <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">
                            ← 戻る
                        </Link>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-12">
                <h1 className="text-3xl font-bold text-white mb-8">分析履歴</h1>

                {history.length === 0 ? (
                    <div className="text-center text-slate-400 py-12 bg-white/5 rounded-xl border border-white/10">
                        履歴はまだありません
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {history.map((item) => (
                            <div key={item.id} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="text-xl font-semibold text-white">{item.title}</h2>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${item.score >= 80 ? 'bg-green-500/20 text-green-400' :
                                                item.score >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-red-500/20 text-red-400'
                                            }`}>
                                            {item.score} / 100
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            {item.createdAt?.toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-slate-400 text-sm line-clamp-3 mb-4">
                                    {item.result?.analysis}
                                </div>
                                <button
                                    onClick={() => {
                                        const text = `【SEOスコア】${item.score}/100\n\n【詳細分析】\n${item.result?.analysis}\n\n【改善提案】\n${item.result?.improvements?.join('\n') || ''}`;
                                        navigator.clipboard.writeText(text);
                                        alert("コピーしました");
                                    }}
                                    className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                                >
                                    結果をコピー
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
