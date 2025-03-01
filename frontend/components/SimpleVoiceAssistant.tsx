import { useVoiceAssistant, BarVisualizer, AgentState } from "@livekit/components-react";
import { useEffect } from "react";

interface SimpleVoiceAssistantProps {
  onStateChange: (state: AgentState) => void;
}

export function SimpleVoiceAssistant(props: SimpleVoiceAssistantProps) {
  const { state, audioTrack } = useVoiceAssistant();
  
  useEffect(() => {
    props.onStateChange(state);
  }, [props, state]);
  
  return (
    <div className="w-full max-w-[300px] h-[75px] px-4 flex justify-center items-center">
      <BarVisualizer
        state={state}
        barCount={5}
        trackRef={audioTrack}
        className="agent-visualizer"
        options={{ minHeight: 48 }}
      />
    </div>
  );
} 