import { useEffect, useRef } from 'react';
import { Mic, MicOff, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { cn } from '@/lib/utils';

interface VoiceInputProps {
  onTranscriptComplete: (transcript: string) => void;
  disabled?: boolean;
}

export function VoiceInput({ onTranscriptComplete, disabled = false }: VoiceInputProps) {
  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    error,
    startListening,
    stopListening,
    clearTranscript,
  } = useVoiceRecognition();

  const hasProcessedTranscript = useRef(false);

  // Clean speech transcript
  const cleanSpeech = (text: string) => {
    return text
      .replace(/\bpipe\b/gi, "five")
      .replace(/\btire\b/gi, "tyre")
      .replace(/\bfor\b/gi, "four")
      .replace(/\btoo\b/gi, "two")
      .replace(/\btree\b/gi, "three")
      .replace(/\btear\b/gi, "three")
      .replace(/[.,]/g, " and ")
      .trim();
  };

  // FIXED: Only process when completely done listening
  useEffect(() => {
    if (!isListening && transcript && !hasProcessedTranscript.current) {
      const cleanedTranscript = cleanSpeech(transcript);

      if (cleanedTranscript.length >= 3) {
        hasProcessedTranscript.current = true;
        onTranscriptComplete(cleanedTranscript);

        // Clear after a delay to allow processing
        setTimeout(() => {
          clearTranscript();
          hasProcessedTranscript.current = false;
        }, 1000);
      }
    }
  }, [isListening, transcript, onTranscriptComplete, clearTranscript]);

  const handleToggle = () => {
    if (disabled) return;

    if (isListening) {
      stopListening();
    } else {
      hasProcessedTranscript.current = false;
      startListening();
    }
  };

  const handleClear = () => {
    clearTranscript();
    hasProcessedTranscript.current = false;
  };

  if (!isSupported) {
    return (
      <div className="p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
        <p className="text-sm font-medium">Voice recognition is not supported in your browser.</p>
        <p className="text-xs mt-1">Please use Chrome, Edge, or Safari for voice input.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button
          onClick={handleToggle}
          size="lg"
          disabled={disabled}
          className={cn(
            "relative h-16 w-16 rounded-full transition-all duration-300",
            isListening
              ? "bg-destructive hover:bg-destructive/90"
              : "bg-primary hover:bg-primary/90",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {isListening ? (
            <MicOff className="h-7 w-7" />
          ) : (
            <Mic className="h-7 w-7" />
          )}
        </Button>

        <div className="flex-1">
          <p className="text-sm font-medium">
            {isListening ? "Listening... Click to stop" : "Click to start voice input"}
            {disabled && " (Processing...)"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Speak clearly: "5 cotton T-shirts, 3 pairs of socks"
          </p>
        </div>

        {(transcript || interimTranscript) && (
          <Button
            onClick={handleClear}
            variant="outline"
            size="icon"
            className="h-10 w-10"
            disabled={disabled}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          Error: {error}
        </div>
      )}

      {(transcript || interimTranscript) && (
        <div className="p-4 rounded-lg bg-muted border">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            {isListening ? "Listening..." : "Transcript"}
          </p>
          <p className="text-sm text-foreground leading-relaxed font-mono">
            {transcript}
            {interimTranscript && (
              <span className="text-primary/70 italic"> {interimTranscript}</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
