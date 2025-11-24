import { useState, KeyboardEvent } from 'react';
import { Input, Button } from 'antd';
import { SendOutlined, AudioOutlined } from '@ant-design/icons';

const { TextArea } = Input;

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const MessageInput = ({ onSend, disabled }: MessageInputProps) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t border-border bg-background">
      <div className="flex items-end gap-2">
        <TextArea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask about trips, transporters, routes..."
          autoSize={{ minRows: 1, maxRows: 4 }}
          disabled={disabled}
          className="flex-1 resize-none text-sm"
        />
        <Button
          type="text"
          icon={<AudioOutlined />}
          className="text-muted-foreground hover:text-primary transition-colors"
          disabled={disabled}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className="transform transition-transform hover:scale-110 active:scale-95"
        />
      </div>
    </div>
  );
};

export default MessageInput;
