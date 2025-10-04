'use client';

import { useState, useRef, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { ChatBox } from '@/components/ChatBox';
import { useDocument, useAskQuestion, useSummarize, useCachedSummary, useIsSummaryCached, useConversations, useConversationMessages } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, FileText, Sparkles, ChevronDown, ArrowLeft, ExternalLink, Eye, EyeOff, Clock, Zap, RefreshCw, History, MessageSquare, Bot, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import type { Message } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface ChatPageContentProps {
  params: { doc_id: string };
}

function ChatPageContent({ params }: ChatPageContentProps) {
  const router = useRouter();
  const { data: document, isLoading: docLoading, refetch: refetchDocument } = useDocument(params.doc_id);
  const { data: conversations } = useConversations(params.doc_id);
  const askMutation = useAskQuestion();
  const summarizeMutation = useSummarize();
  const { data: cachedSummaryData } = useCachedSummary(params.doc_id);
  const isSummaryCached = useIsSummaryCached(params.doc_id);

  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState('');
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);

  const { data: conversationMessages, refetch: refetchMessages } = useConversationMessages(
    currentConversationId || 0
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Constants for summary truncation
  const SUMMARY_PREVIEW_LENGTH = 300;

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  };

  // Enhanced scroll effect with better timing
  useEffect(() => {
    if (messages.length > 0) {
      // Use requestAnimationFrame for better timing
      requestAnimationFrame(() => {
        scrollToBottom();
      });
    }
  }, [messages]);

  // Load conversation history when component mounts and conversations are available
  useEffect(() => {
    if (conversations && conversations.length > 0 && !currentConversationId) {
      // Set the most recent conversation as current
      const mostRecent = conversations[0];
      setCurrentConversationId(mostRecent.id);
      refetchMessages();
    }
  }, [conversations, currentConversationId, refetchMessages]);

  // Load messages when conversation messages change
  useEffect(() => {
    if (conversationMessages && conversationMessages.length > 0) {
      const formattedMessages: Message[] = conversationMessages.map((msg, index) => ({
        id: msg.id.toString(),
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: new Date(msg.created_at)
      }));
      setMessages(formattedMessages);
    }
  }, [conversationMessages]);

  // Load cached summary on component mount
  useEffect(() => {
    if (cachedSummaryData?.summary && !summary) {
      setSummary(cachedSummaryData.summary);
      setIsSummaryOpen(true);
    }
  }, [cachedSummaryData, summary]);

  // Monitor document changes and log for debugging
  useEffect(() => {
    if (document) {
      console.log('Document data updated:', {
        doc_id: document.doc_id || document.id,
        chunk_count: document.chunk_count,
        title: document.title || document.filename
      });
    }
  }, [document]);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query.trim(),
      timestamp: new Date(),
    };

    // Store the query before clearing it
    const currentQuery = query.trim();
    
    setMessages((prev) => [...prev, userMessage]);
    setQuery('');

    // Scroll to bottom immediately after adding user message
    setTimeout(() => {
      scrollToBottom();
    }, 100);

    try {
      const response = await askMutation.mutateAsync({
        doc_id: params.doc_id,
        query: currentQuery,
        top_k: 5,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.answer,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      // Scroll to bottom after assistant response
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to get answer');
      
      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your question. Please try again.',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleSummarize = async () => {
    try {
      const response = await summarizeMutation.mutateAsync({
        doc_id: params.doc_id,
        scope: 'full',
      });

      setSummary(response.summary);
      setIsSummaryOpen(true);
      
      // Always show generated message while caching is disabled
      toast.success('Summary generated');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to generate summary');
    }
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const navigateToFullSummary = () => {
    router.push(`/chat/${params.doc_id}/summary`);
  };

  const getTruncatedSummary = (text: string) => {
    if (text.length <= SUMMARY_PREVIEW_LENGTH) return text;
    return text.substring(0, SUMMARY_PREVIEW_LENGTH) + '...';
  };

  const isSummaryLengthy = summary && summary.length > SUMMARY_PREVIEW_LENGTH;

  const handleRefreshDocument = async () => {
    try {
      await refetchDocument();
      toast.success('Document status refreshed');
    } catch (error) {
      toast.error('Failed to refresh document status');
    }
  };

  const handleSwitchConversation = async (conversationId: number) => {
    setCurrentConversationId(conversationId);
    setShowHistory(false);
    setTimeout(() => {
      refetchMessages();
    }, 100); // Small delay to ensure hook picks up the new conversationId
  };

  const handleNewConversation = async () => {
    setMessages([]);
    setCurrentConversationId(null);
    setShowHistory(false);
  };

  if (docLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Skeleton className="h-96 lg:col-span-1" />
            <Skeleton className="h-96 lg:col-span-3" />
          </div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-gray-500">Document not found</p>
              <Button onClick={() => router.push('/dashboard')} className="mt-4">
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <Button
            variant="outline"
            onClick={toggleSidebar}
          >
            {isSidebarVisible ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {isSidebarVisible ? 'Hide Sidebar' : 'Show Sidebar'}
          </Button>
        </div>

        <div className={`flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] ${isSidebarVisible ? 'lg:grid lg:grid-cols-4' : ''}`}>
          {isSidebarVisible && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className={`w-full lg:w-auto ${isSidebarVisible ? 'lg:col-span-1' : 'hidden'} space-y-4`}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">
                        {document.title || document.filename}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        {/* Status Badge */}
                        {document.status === 'processing' && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                            Processing
                          </Badge>
                        )}
                        {document.status === 'processed' && (
                          <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Ready
                          </Badge>
                        )}
                        {document.status === 'failed' && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Failed
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRefreshDocument}
                      className="flex-shrink-0"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription>
                    Uploaded {format(new Date(document.created_at), 'MMM d, yyyy')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{document.chunk_count}</span> text chunks
                  </div>
                  <Button
                    onClick={handleSummarize}
                    disabled={summarizeMutation.isPending || document?.status !== 'processed' || document?.chunk_count === 0}
                    variant="outline"
                    className="w-full"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {summarizeMutation.isPending ? 'Loading...' : 
                     document?.status === 'processing' ? 'Processing...' :
                     document?.status === 'failed' ? 'Processing Failed' :
                     document?.chunk_count === 0 ? 'No Content Available' : 'Generate Summary'}
                  </Button>
                  {/* Cache indicator removed while caching is disabled */}
                </CardContent>
              </Card>

              {summary && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Collapsible open={isSummaryOpen} onOpenChange={setIsSummaryOpen}>
                    <Card>
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Document Summary</CardTitle>
                            <ChevronDown
                              className={`h-4 w-4 transition-transform ${
                                isSummaryOpen ? 'rotate-180' : ''
                              }`}
                            />
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent>
                          <div className="space-y-3">
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                              {isSummaryLengthy ? getTruncatedSummary(summary) : summary}
                            </p>
                            {isSummaryLengthy && (
                              <div className="flex space-x-2 pt-2 border-t">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={navigateToFullSummary}
                                  className="flex-1"
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  Show More
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                </motion.div>
              )}

              {/* Conversation History */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <History className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-lg">Chat History</CardTitle>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          onClick={handleNewConversation}
                          size="sm"
                          variant="outline"
                        >
                          New Chat
                        </Button>
                        <Button
                          onClick={() => setShowHistory(!showHistory)}
                          size="sm"
                          variant="outline"
                        >
                          {showHistory ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {showHistory && conversations && conversations.length > 0 && (
                    <CardContent>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {conversations.map((conversation) => (
                          <Button
                            key={conversation.id}
                            onClick={() => handleSwitchConversation(conversation.id)}
                            variant={currentConversationId === conversation.id ? "default" : "outline"}
                            className="w-full justify-start text-left h-auto py-3 px-3"
                          >
                            <div className="flex items-center space-x-2 w-full">
                              <MessageSquare className="h-4 w-4 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">
                                  {conversation.title}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {conversation.message_count} messages • {format(new Date(conversation.updated_at), 'MMM d, HH:mm')}
                                </div>
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  )}

                  {showHistory && (!conversations || conversations.length === 0) && (
                    <CardContent>
                      <div className="text-center py-4 text-gray-500">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No chat history yet</p>
                        <p className="text-xs">Start a conversation to see your questions here</p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </motion.div>
            </motion.div>
          )}

          <Card className={`${isSidebarVisible ? 'lg:col-span-3' : 'flex-1'} flex flex-col`}>
            <CardContent className="flex-1 flex flex-col p-6 overflow-hidden">
              <div className="flex-1 overflow-y-auto mb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                <ChatBox messages={messages} />
                {askMutation.isPending && (
                  <div className="flex justify-start mb-4">
                    <div className="flex space-x-3 max-w-3xl">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-gray-200 text-gray-600">
                        <Bot className="h-5 w-5" />
                      </div>
                      <div className="rounded-2xl px-4 py-3 bg-gray-100 text-gray-900 border border-gray-200 shadow-sm">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-sm text-gray-500">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleAsk} className="flex space-x-2 bg-white border-t border-gray-200 pt-4">
                <div className="flex-1 relative">
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={
                      document?.status === 'processing' ? 'Document is being processed...' :
                      document?.status === 'failed' ? 'Document processing failed...' :
                      document?.chunk_count === 0 ? 'No content available...' :
                      'Ask a question about this document...'
                    }
                    disabled={askMutation.isPending || document?.status !== 'processed' || document?.chunk_count === 0}
                    className="flex-1 pr-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAsk(e);
                      }
                    }}
                  />
                  {query.trim() && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={askMutation.isPending || !query.trim() || document?.status !== 'processed' || document?.chunk_count === 0}
                  className="px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
                >
                  {askMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage({ params }: { params: { doc_id: string } }) {
  return (
    <ProtectedRoute>
      <ChatPageContent params={params} />
    </ProtectedRoute>
  );
}