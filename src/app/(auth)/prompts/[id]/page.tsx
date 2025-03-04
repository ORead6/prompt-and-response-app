"use client"

import React, { useEffect, useState } from 'react';
import { useParams } from "next/navigation";
import { ArrowLeft, Copy, Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { formatDistanceToNow } from 'date-fns';
import ResponseBox from '@/components/responseBox';
import Editor from '@/components/Editor';
import ResponseCreator from '@/components/responseCreator';

const PromptViewer = () => {
    // Get Prompt ID from URL
    const params = useParams();
    const router = useRouter();

    // States
    const [promptData, setPromptData] = useState({
        title: "",
        prompt: "",
        created_at: "",
        author: ""
    });
    const [isLoading, setIsLoading] = useState(true);

    const promptID = params.id;

    // Fetch Prompt Data
    const fetchPrompt = async () => {
        setIsLoading(true);

        // API Call
        try {
            const response = await fetch("/api/getSpecificPrompt", {
                method: "POST",
                body: JSON.stringify({ id: promptID })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Failed with status: ${response.status}`, errorText);
                throw new Error(`Failed to fetch prompt: ${response.status}`);
            }

            // Get the response data
            const responseData = await response.json();
            console.log("Fetched data:", responseData);

            // Set State
            setPromptData(responseData.promptData);

        } catch (error) {
            console.error("Error fetching prompt:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch the prompt data on load
    useEffect(() => {
        fetchPrompt();
    }, []);

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center mb-6">
                {/* Back Button */}
                <Button
                    onClick={() => router.push("/prompts")}
                    variant="outline"
                    className="flex items-center gap-2"
                >
                    <ArrowLeft size={16} />
                    Back to Prompts
                </Button>
            </div>

            <Card className="border-none shadow-sm">
                <CardHeader>
                    {/* Skeleton for loading prompt */}
                    {isLoading ? (
                        <Skeleton className="h-8 w-3/4 mx-auto mb-2" />
                    ) : (
                        <div>
                            {/* Prompt Title */}
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl font-semibold">{promptData.title}</CardTitle>
                            </div>

                            {/* Prompt Creation Time */}
                            <div className="text-xs text-muted-foreground">
                                {promptData.author} {formatDistanceToNow(new Date(promptData.created_at), { addSuffix: true })}
                            </div>
                        </div>
                    )}
                </CardHeader>

                <CardContent>
                    {/* Skeleton */}
                    {isLoading ? (
                        <>
                            <Skeleton className="h-6 w-full mb-2" />
                            <Skeleton className="h-6 w-full mb-2" />
                            <Skeleton className="h-6 w-3/4 mb-2" />
                            <Skeleton className="h-6 w-5/6 mb-2" />
                            <Skeleton className="h-6 w-full" />
                        </>
                    ) : (
                        // Prompt Content
                        <div className="rounded-lg whitespace-pre-wrap text-sm md:text-base leading-relaxed font-light">
                            {promptData.prompt}
                        </div>
                    )}
                </CardContent>
            </Card>
            <ResponseCreator promptID={promptID as string}/>
        </div>
    );
}

export default PromptViewer;