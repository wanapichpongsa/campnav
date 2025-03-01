import { AnimatePresence, motion } from "framer-motion";
import { AgentState, VoiceAssistantControlBar, DisconnectButton } from "@livekit/components-react";
import { useKrispNoiseFilter } from "@livekit/components-react/krisp";
import { useEffect, useState } from "react";
import { CloseIcon } from "./CloseIcon";

import toast, { Toaster } from 'react-hot-toast';

interface ControlBarProps {
  onConnectButtonClicked: () => void;
  agentState: AgentState;
}

export function ControlBar(props: ControlBarProps) {
  const krisp = useKrispNoiseFilter();
  const [hasAudioPermission, setHasAudioPermission] = useState(false);
  
  useEffect(() => {
    krisp.setNoiseFilterEnabled(true);
  }, []);

  const requestAudioPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true
      });
      // Stop the stream right away - we just needed the permission
      stream.getTracks().forEach(track => track.stop());
      setHasAudioPermission(true);
      // Now that we have permission, proceed with connection
      props.onConnectButtonClicked();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      toast.error(`Error getting audio permission: ${errorMessage}`);
      alert('Please allow microphone access to use the voice assistant');
    }
  };

  return (
    <div className="relative w-full h-[80px] sm:h-[100px]">
      <AnimatePresence>
        {props.agentState === "disconnected" && (
          <motion.button
            initial={{ opacity: 0, top: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, top: "-10px" }}
            transition={{ duration: 1, ease: [0.09, 1.04, 0.245, 1.055] }}
            className="uppercase absolute left-1/2 -translate-x-1/2 px-4 py-2 bg-white text-black rounded-md text-sm sm:text-base"
            onClick={requestAudioPermission}
          >
            Start a conversation
          </motion.button>
        )}
      </AnimatePresence>
      <Toaster />
      <AnimatePresence>
        {props.agentState !== "disconnected" &&
          props.agentState !== "connecting" && (
            <motion.div
              initial={{ opacity: 0, top: "10px" }}
              animate={{ opacity: 1, top: 0 }}
              exit={{ opacity: 0, top: "-10px" }}
              transition={{ duration: 0.4, ease: [0.09, 1.04, 0.245, 1.055] }}
              className="flex h-8 absolute left-1/2 -translate-x-1/2 justify-center gap-2"
            >
              <VoiceAssistantControlBar controls={{ leave: false }} />
              <DisconnectButton>
                <CloseIcon />
              </DisconnectButton>
            </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
} 