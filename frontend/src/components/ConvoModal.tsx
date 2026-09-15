import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator, Platform, Alert, Animated, Easing } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAudioRecorder, RecordingPresets, requestRecordingPermissionsAsync } from 'expo-audio';
import * as Speech from 'expo-speech';
import * as FileSystem from 'expo-file-system/legacy';
import { BACKEND_URL } from '../config';

type ConvoState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING';

interface ConvoModalProps {
  visible: boolean;
  onClose: () => void;
  language?: string;
}

const PulseAnimation = ({ isListening }: { isListening: boolean }) => {
  const scale1 = useRef(new Animated.Value(1)).current;
  const scale2 = useRef(new Animated.Value(1)).current;
  const scale3 = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const createAnimation = (animValue: Animated.Value, duration: number, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: isListening ? 1.3 : 1.6,
            duration: duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
            delay: delay,
          }),
          Animated.timing(animValue, {
            toValue: 1,
            duration: duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          })
        ])
      );
    };

    const a1 = createAnimation(scale1, 1000, 0);
    const a2 = createAnimation(scale2, 1200, 150);
    const a3 = createAnimation(scale3, 1500, 300);

    a1.start();
    a2.start();
    a3.start();

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
      scale1.setValue(1);
      scale2.setValue(1);
      scale3.setValue(1);
    };
  }, [isListening]);

  return (
    <View className="items-center justify-center relative w-48 h-48 mb-6">
      {/* Outer Glows */}
      <Animated.View style={{ transform: [{ scale: scale3 }], position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: isListening ? 'rgba(26, 116, 76, 0.1)' : 'rgba(37, 99, 235, 0.1)' }} />
      <Animated.View style={{ transform: [{ scale: scale2 }], position: 'absolute', width: 110, height: 110, borderRadius: 55, backgroundColor: isListening ? 'rgba(26, 116, 76, 0.2)' : 'rgba(37, 99, 235, 0.2)' }} />
      <Animated.View style={{ transform: [{ scale: scale1 }], position: 'absolute', width: 90, height: 90, borderRadius: 45, backgroundColor: isListening ? 'rgba(26, 116, 76, 0.3)' : 'rgba(37, 99, 235, 0.3)' }} />

      {/* Core */}
      <View className={`w-20 h-20 rounded-full items-center justify-center ${isListening ? 'bg-[#1A744C]' : 'bg-blue-600'} z-10 shadow-lg`} style={{ elevation: 5, shadowColor: isListening ? '#1A744C' : '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }}>
        <Feather name={isListening ? "mic" : "volume-2"} size={32} color="white" />
      </View>
    </View>
  );
};

export default function ConvoModal({ visible, onClose, language = 'en' }: ConvoModalProps) {
  const [convoState, setConvoState] = useState<ConvoState>('IDLE');
  const [transcription, setTranscription] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [voiceId, setVoiceId] = useState<string | undefined>(undefined);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const mounted = useRef(true);

  // Map 2-letter language codes to full BCP-47 codes
  const getFullLanguageCode = (langCode: string) => {
    switch (langCode) {
      case 'ta': return 'ta-IN';
      case 'te': return 'te-IN';
      case 'hi': return 'hi-IN';
      default: return 'en-IN';
    }
  };
  const ttsLanguage = getFullLanguageCode(language);

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const voices = await Speech.getAvailableVoicesAsync();
        
        // 1. Try exact match for the requested language (e.g., 'en-in' or 'en_in')
        let targetVoice = voices.find(v => v.language.toLowerCase().replace('_', '-') === ttsLanguage.toLowerCase());
        
        // 2. If it's English, aggressively hunt for any Indian English voice
        if (!targetVoice && ttsLanguage === 'en-IN') {
          targetVoice = voices.find(v => v.language.toLowerCase().includes('en-in') || v.language.toLowerCase().includes('en_in') || v.language.toLowerCase().includes('in'));
        }
        
        // 3. Final fallback: just match the base language (e.g., 'ta' for 'ta-IN')
        if (!targetVoice) {
          targetVoice = voices.find(v => v.language.toLowerCase().includes(ttsLanguage.split('-')[0]));
        }

        if (targetVoice) {
          setVoiceId(targetVoice.identifier);
        } else {
          setVoiceId(undefined);
        }
      } catch (err) {
        console.warn('Could not fetch voices', err);
      }
    };
    fetchVoices();
  }, [ttsLanguage]);

  useEffect(() => {
    mounted.current = true;
    if (visible && convoState === 'IDLE') {
      startListening();
    }
    return () => {
      mounted.current = false;
      Speech.stop();
      try {
        if (audioRecorder.isRecording) {
          audioRecorder.stop();
        }
      } catch (e) {}
    };
  }, [visible]);

  const startListening = async () => {
    try {
      Speech.stop();
      setTranscription('');
      setAiResponse('');

      const perm = await requestRecordingPermissionsAsync();
      if (perm.status !== 'granted') {
        Alert.alert('Permission Denied', 'Microphone access is required.');
        onClose();
        return;
      }

      try {
        await audioRecorder.prepareToRecordAsync();
      } catch (e) {}
      audioRecorder.record();
      setConvoState('LISTENING');
    } catch (err) {
      console.error('Failed to start recording', err);
      setConvoState('IDLE');
    }
  };

  const stopListeningAndProcess = async () => {
    if (convoState !== 'LISTENING') return;
    setConvoState('PROCESSING');

    try {
      try {
        await audioRecorder.stop();
      } catch (e) {}
      
      const uri = audioRecorder.uri;

      if (!uri) {
        setConvoState('IDLE');
        return;
      }

      const response = await FileSystem.uploadAsync(`${BACKEND_URL}/convo/live-chat?lang=${language}`, uri, {
        fieldName: 'audio',
        httpMethod: 'POST',
        uploadType: 1, // FileSystemUploadType.MULTIPART
      });

      const data = JSON.parse(response.body);

      if (data.success && mounted.current) {
        setTranscription(data.transcription);
        setAiResponse(data.response);
        playResponse(data.response);
      } else {
        setConvoState('IDLE');
      }
    } catch (err) {
      console.error('Failed to process voice', err);
      if (mounted.current) setConvoState('IDLE');
    }
  };

  const playResponse = (text: string) => {
    setConvoState('SPEAKING');
    Speech.speak(text, {
      language: ttsLanguage,
      ...(voiceId ? { voice: voiceId } : {}),
      onDone: () => {
        if (mounted.current) {
          // Automatically start listening again after AI finishes speaking
          startListening();
        }
      },
      onError: () => {
        if (mounted.current) setConvoState('IDLE');
      }
    });
  };

  const handleClose = () => {
    Speech.stop();
    try {
      if (audioRecorder.isRecording) {
        audioRecorder.stop();
      }
    } catch (e) {}
    setConvoState('IDLE');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-white items-center justify-between py-12 px-6">

        {/* Header */}
        <View className="w-full flex-row justify-between items-center">
          <Text className="text-xl font-semibold text-gray-800">Live Voice Chat</Text>
          <TouchableOpacity onPress={handleClose} className="p-2 bg-gray-100 rounded-full">
            <Feather name="x" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Content Area */}
        <View className="flex-1 w-full justify-center items-center my-8">
          {convoState === 'LISTENING' && (
            <View className="items-center">
              <PulseAnimation isListening={true} />
              <Text className="text-2xl font-bold text-gray-800 mb-2">Listening...</Text>
              <Text className="text-gray-500 text-center">Tap the button when you're done speaking</Text>
            </View>
          )}

          {convoState === 'PROCESSING' && (
            <View className="items-center">
              <ActivityIndicator size="large" color="#1A744C" className="mb-6" />
              <Text className="text-2xl font-bold text-gray-800 mb-2">Thinking...</Text>
            </View>
          )}

          {convoState === 'SPEAKING' && (
            <View className="items-center w-full">
              <PulseAnimation isListening={false} />
              <Text className="text-2xl font-bold text-gray-800 mb-6">Speaking...</Text>

              <View className="w-full bg-gray-50 p-4 rounded-xl border border-gray-100 mb-4">
                <Text className="text-sm font-semibold text-gray-500 mb-1">You said:</Text>
                <Text className="text-base text-gray-800">{transcription}</Text>
              </View>

              <View className="w-full bg-blue-50 p-4 rounded-xl border border-blue-100">
                <Text className="text-sm font-semibold text-blue-600 mb-1">AgriNexus:</Text>
                <Text className="text-base text-gray-800">{aiResponse}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Footer Actions */}
        <View className="w-full">
          {convoState === 'LISTENING' && (
            <TouchableOpacity
              onPress={stopListeningAndProcess}
              className="w-full bg-[#1A744C] rounded-2xl py-4 items-center shadow-sm"
            >
              <Text className="text-white text-lg font-semibold">Done Speaking</Text>
            </TouchableOpacity>
          )}

          {convoState === 'SPEAKING' && (
            <TouchableOpacity
              onPress={startListening}
              className="w-full bg-gray-800 rounded-2xl py-4 items-center shadow-sm"
            >
              <Text className="text-white text-lg font-semibold">Interrupt & Speak</Text>
            </TouchableOpacity>
          )}
        </View>

      </View>
    </Modal>
  );
}
