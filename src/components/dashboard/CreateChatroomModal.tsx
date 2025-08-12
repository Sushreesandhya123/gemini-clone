'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { chatroomSchema, ChatroomFormData } from '@/lib/validations';
import { useChatStore } from '@/lib/store';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { X } from 'lucide-react';

interface CreateChatroomModalProps {
  onClose: () => void;
}

export default function CreateChatroomModal({ onClose }: CreateChatroomModalProps) {
  const { createChatroom } = useChatStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ChatroomFormData>({
    resolver: zodResolver(chatroomSchema),
  });

  const onSubmit = async (data: ChatroomFormData) => {
    createChatroom(data.title);
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Create New Conversation</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          <Input
            {...register('title')}
            label="Conversation Title"
            placeholder="e.g., Help with cooking, Travel planning..."
            error={errors.title?.message}
            autoFocus
          />

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Create
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}