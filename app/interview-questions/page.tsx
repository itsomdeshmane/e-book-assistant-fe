'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { useGenerateInterviewQuestions, useDocuments, useMe } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Copy, CheckCircle, AlertCircle, Loader2, Users, Clock, ArrowLeft, RefreshCw } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

function InterviewQuestionsContent() {
  const router = useRouter();
  const [docId, setDocId] = useState<string>('');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [copiedQuestions, setCopiedQuestions] = useState<string[]>([]);
  
  const { data: currentUser } = useMe();
  const { data: documents } = useDocuments(currentUser?.id);
  const generateMutation = useGenerateInterviewQuestions();

  // Helper function to check if selected document is ready
  const isDocumentReady = useCallback(() => {
    if (!docId || !documents) return false;
    const docIdNum = parseInt(docId.trim());
    if (isNaN(docIdNum)) return false;
    
    const selectedDoc = documents.find(doc => doc.id === docIdNum);
    return selectedDoc?.status === 'processed' && selectedDoc?.chunk_count > 0;
  }, [docId, documents]);

  // Helper function to get generate button text
  const getGenerateButtonText = useCallback(() => {
    if (!docId.trim()) return 'Select a Document';
    
    const docIdNum = parseInt(docId.trim());
    if (isNaN(docIdNum)) return 'Invalid Document ID';
    
    const selectedDoc = documents?.find(doc => doc.id === docIdNum);
    if (!selectedDoc) return 'Document Not Found';
    
    if (selectedDoc.status === 'processing') return 'Document Processing...';
    if (selectedDoc.status === 'failed') return 'Document Processing Failed';
    if (selectedDoc.chunk_count === 0) return 'No Content Available';
    
    return 'Generate Questions';
  }, [docId, documents]);

  const handleGenerateQuestions = useCallback(async () => {
    if (!docId || !docId.trim()) {
      toast.error('Please select a document');
      return;
    }

    const docIdNum = parseInt(docId.trim());
    if (isNaN(docIdNum)) {
      toast.error('Please enter a valid numeric document ID');
      return;
    }

    // Check if selected document is ready
    const selectedDoc = documents?.find(doc => doc.id === docIdNum);
    if (!selectedDoc) {
      toast.error('Document not found');
      return;
    }

    if (selectedDoc.status !== 'processed' || selectedDoc.chunk_count === 0) {
      toast.error('Document is not ready for interview questions generation. Please wait for processing to complete.');
      return;
    }

    try {
      await generateMutation.mutateAsync({
        doc_id: docIdNum,
        level,
      });
      toast.success('Interview questions generated successfully!');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to generate questions';
      toast.error(errorMessage);
    }
  }, [docId, level, generateMutation, documents]);

  const copyToClipboard = useCallback(async (questions: string[]) => {
    const questionsText = questions.map((q, i) => `${i + 1}. ${q}`).join('\n');
    try {
      await navigator.clipboard.writeText(questionsText);
      setCopiedQuestions(questions);
      toast.success('Questions copied to clipboard!');
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopiedQuestions([]), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  }, []);

  const copySingleQuestion = useCallback(async (question: string) => {
    try {
      await navigator.clipboard.writeText(question);
      toast.success('Question copied!');
    } catch (error) {
      toast.error('Failed to copy question');
    }
  }, []);

  const questions = generateMutation.data?.questions || [];
  const hasError = generateMutation.data?.error;
  const isLoading = generateMutation.isPending;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex-1" />
          </div>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 text-center">Interview Questions Generator</h1>
          <p className="text-gray-600 mt-2 text-center">
            Generate tailored interview questions based on your document content
          </p>
          {/* Processing Indicator */}
          {documents && documents.some((doc: any) => doc.status === 'processing') && (
            <div className="flex items-center justify-center mt-3 text-sm text-blue-600">
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              <span>Some documents are still processing... Updates automatically</span>
            </div>
          )}
          <div className="mt-4">
            <Button
              onClick={() => router.push('/interview-history')}
              variant="outline"
              size="sm"
            >
              <Clock className="h-4 w-4 mr-2" />
              View Question History
            </Button>
          </div>
        </div>

        {/* Main Form Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Generate Interview Questions</CardTitle>
            <CardDescription>
              Select a document and difficulty level to generate relevant interview questions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Document Selection */}
            <div className="space-y-2">
              <Label htmlFor="docId">Document</Label>
              {documents && documents.length > 0 ? (
                <Select
                  value={docId}
                  onValueChange={setDocId}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a document" />
                  </SelectTrigger>
                  <SelectContent>
                    {documents.map((doc) => {
                      const isReady = doc.status === 'processed' && doc.chunk_count > 0;
                      const isProcessing = doc.status === 'processing';
                      const isFailed = doc.status === 'failed';
                      
                      return (
                        <SelectItem 
                          key={doc.id} 
                          value={String(doc.id)}
                          disabled={!isReady}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4" />
                              <span className="truncate">
                                {doc.title || doc.filename}
                              </span>
                              <span className="text-xs text-gray-500 ml-2">
                                ({doc.id})
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 ml-2">
                              {/* Status Badge */}
                              {isProcessing && (
                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                  Processing
                                </Badge>
                              )}
                              {isReady && (
                                <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Ready
                                </Badge>
                              )}
                              {isFailed && (
                                <Badge variant="destructive" className="text-xs">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Failed
                                </Badge>
                              )}
                              <span className="text-xs text-gray-500">
                                {doc.chunk_count} chunks
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="docId"
                  type="number"
                  placeholder="Enter document ID..."
                  value={docId}
                  onChange={(e) => setDocId(e.target.value)}
                  disabled={isLoading}
                />
              )}
            </div>

            {/* Document Status Info */}
            {docId && documents && (
              <div className="p-3 bg-gray-50 rounded-lg">
                {(() => {
                  const docIdNum = parseInt(docId.trim());
                  const selectedDoc = documents.find(doc => doc.id === docIdNum);
                  
                  if (!selectedDoc) {
                    return (
                      <div className="flex items-center text-red-600">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        <span className="text-sm">Document not found</span>
                      </div>
                    );
                  }
                  
                  if (selectedDoc.status === 'processing') {
                    return (
                      <div className="flex items-center text-yellow-600">
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        <span className="text-sm">Document is being processed. Please wait...</span>
                      </div>
                    );
                  }
                  
                  if (selectedDoc.status === 'failed') {
                    return (
                      <div className="flex items-center text-red-600">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        <span className="text-sm">Document processing failed. Please try uploading again.</span>
                      </div>
                    );
                  }
                  
                  if (selectedDoc.chunk_count === 0) {
                    return (
                      <div className="flex items-center text-orange-600">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        <span className="text-sm">No content available in this document.</span>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span className="text-sm">Document is ready for interview questions generation!</span>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Difficulty Level Selection */}
            <div className="space-y-2">
              <Label htmlFor="level">Difficulty Level</Label>
              <Select value={level} onValueChange={(v) => setLevel(v as 'beginner' | 'intermediate' | 'advanced')} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span>Beginner</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="intermediate">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <span>Intermediate</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="advanced">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span>Advanced</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerateQuestions}
              disabled={isLoading || !docId.trim() || !isDocumentReady()}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Questions...
                </>
              ) : (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  {getGenerateButtonText()}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card>
                <CardContent className="py-8">
                  <div className="flex items-center justify-center space-x-3">
                    <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                    <span className="text-gray-600">Generating interview questions...</span>
                  </div>
                  <div className="mt-4 space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-4 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : hasError ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-red-200 bg-red-50">
                <CardContent className="py-6">
                  <div className="flex items-center space-x-3 text-red-700">
                    <AlertCircle className="h-5 w-5" />
                    <div>
                      <h3 className="font-semibold">Error generating questions</h3>
                      <p className="text-sm text-red-600 mt-1">
                        {hasError}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : questions.length > 0 ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>Interview Questions</span>
                        <span className="text-sm font-normal text-gray-500">
                          ({questions.length} questions)
                        </span>
                      </CardTitle>
                      <CardDescription>
                        Difficulty: <span className="capitalize">{level}</span>
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(questions)}
                      disabled={copiedQuestions.length > 0}
                    >
                      {copiedQuestions.length > 0 ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy All
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {questions.map((question, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-900 leading-relaxed">{question}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copySingleQuestion(question)}
                          className="flex-shrink-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function InterviewQuestionsPage() {
  return (
    <ProtectedRoute>
      <InterviewQuestionsContent />
    </ProtectedRoute>
  );
}
