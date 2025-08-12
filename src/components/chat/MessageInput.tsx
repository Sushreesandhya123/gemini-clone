'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { messageSchema, MessageFormData } from '@/lib/validations';
import { useChatStore } from '@/lib/store';
import { fileToBase64, isImageFile } from '@/lib/utils';
import Button from '@/components/ui/button';
import { Send, Image, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface MessageInputProps {
  chatroomId: string;
}

export default function MessageInput({ chatroomId }: MessageInputProps) {
    //@ts-ignore
  const { addStreamingMessage, isTyping } = useChatStore(); // Use addStreamingMessage instead
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
  });

  const messageContent = watch('content', '');

  const onSubmit = async (data: MessageFormData) => {
    if (!data.content.trim() && !selectedImage) return;

    const messageData = {
      content: data.content.trim() || 'Shared an image',
      isUser: true,
      image: selectedImage || undefined,
    };

    try {
      // Use addStreamingMessage for smooth streaming responses
      await addStreamingMessage(chatroomId, messageData);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    }

    reset();
    setSelectedImage(null);
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isImageFile(file)) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const base64 = await fileToBase64(file);
      setSelectedImage(base64);
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const canSend = (messageContent.trim() || selectedImage) && !isSubmitting && !isUploading && !isTyping;

  return (
    <div className="p-4">
      {/* Image preview */}
      {selectedImage && (
        <div className="mb-3 relative inline-block">
          <img
            src={selectedImage}
            alt="Upload preview"
            className="max-w-32 max-h-32 object-cover rounded-lg border border-border shadow-sm"
          />
          <button
            onClick={removeImage}
            className="absolute -top-2 -right-2 bg-background border border-border rounded-full p-1 hover:bg-accent transition-colors shadow-sm"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex items-end space-x-2">
        {/* File input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        {/* Image upload button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isTyping}
          className="flex-shrink-0"
        >
          {isUploading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Image className="h-4 w-4" />
          )}
        </Button>

        {/* Message input */}
        <div className="flex-1 relative">
          <textarea
            {...register('content')}
            ref={(e) => {
              register('content').ref(e);
              textareaRef.current = e;
            }}
            placeholder={isTyping ? "Gemini is responding..." : "Type your message... (Shift + Enter for new line)"}
            onKeyDown={handleKeyDown}
            onInput={(e) => adjustTextareaHeight(e.target as HTMLTextAreaElement)}
            disabled={isTyping}
            className={`w-full min-h-10 max-h-30 py-2 px-3 border border-input rounded-md bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent scrollbar-hide transition-opacity ${
              isTyping ? 'opacity-60 cursor-not-allowed' : ''
            }`}
            rows={1}
          />
          {errors.content && (
            <div className="absolute -bottom-5 left-0 text-xs text-destructive">
              {errors.content.message}
            </div>
          )}
        </div>

        {/* Send button */}
        <Button
          type="submit"
          disabled={!canSend}
          loading={isSubmitting || isTyping}
          className="flex-shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>

      {/* Hints */}
      <div className="mt-2 text-xs text-muted-foreground">
        <div>Press Enter to send, Shift + Enter for new line</div>
        <div className="flex items-center gap-2">
          <div className="text-green-600">🤖 Powered by Gemini AI</div>
          {isTyping && (
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
              <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              <span className="text-green-600">AI is thinking...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}