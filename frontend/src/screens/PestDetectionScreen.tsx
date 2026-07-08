import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Platform, KeyboardAvoidingView, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { StatusBar as RNStatusBar } from 'react-native';

type PestDetectionScreenProps = {
  onOpenSidebar: () => void;
};

export default function PestDetectionScreen({ onOpenSidebar }: PestDetectionScreenProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<{ title: string; remedies: string[] } | null>(null);

  const handlePickPhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access camera is required!");
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setSelectedFileName("camera_photo.jpg");
      setDiagnosis(null);
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        const file = result.assets[0];
        // If it's an image, show it
        if (file.mimeType?.startsWith('image/')) {
          setSelectedImage(file.uri);
        } else {
          setSelectedImage(null);
        }
        setSelectedFileName(file.name);
        setDiagnosis(null);
      }
    } catch (err) {
      console.log('Error picking document', err);
    }
  };

  const handleAnalyze = () => {
    if (!selectedImage && !selectedFileName) return;

    setIsAnalyzing(true);
    setDiagnosis(null);

    // Simulate AI analysis delay
    setTimeout(() => {
      setIsAnalyzing(false);
      setDiagnosis({
        title: "Early Blight (Alternaria solani)",
        remedies: [
          "Remove and destroy infected lower leaves.",
          "Apply copper-based fungicides or Bacillus subtilis.",
          "Ensure adequate spacing between plants to improve air circulation.",
          "Avoid overhead watering; use drip irrigation instead.",
          "Rotate crops next season."
        ]
      });
    }, 2500);
  };

  const handleClear = () => {
    setSelectedImage(null);
    setSelectedFileName(null);
    setDiagnosis(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5FAF6]" style={{ height: (Platform.OS === 'web' ? '100vh' : '100%') as any }}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Header */}
        <View
          className="flex-row justify-between items-center px-6 pb-2 bg-[#F5FAF6] z-10"
          style={{ paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 0) + 12 : 20 }}
        >
          <TouchableOpacity onPress={onOpenSidebar}>
            <Feather name="menu" size={24} color="#18553F" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-[#18553F]">Pest Detection</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView className="flex-1 px-4 pt-6">

          <Text className="text-[28px] font-extrabold text-gray-900 text-center leading-tight mb-2">
            Identify Crop Issues
          </Text>
          <Text className="text-sm text-gray-500 text-center mb-8 px-4">
            Upload a clear photo or file of the affected plant part (leaf, stem, or fruit) for AI analysis.
          </Text>

          {/* Upload Area */}
          <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 items-center">

            {selectedImage ? (
              <View className="w-full relative mb-4">
                <Image
                  source={{ uri: selectedImage }}
                  className="w-full h-48 rounded-xl"
                  resizeMode="cover"
                />
                <TouchableOpacity
                  className="absolute top-2 right-2 bg-white/80 p-2 rounded-full"
                  onPress={handleClear}
                >
                  <Feather name="x" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ) : selectedFileName ? (
              <View className="w-full bg-gray-50 rounded-xl p-8 items-center justify-center mb-4 border border-dashed border-gray-300">
                <Feather name="file-text" size={48} color="#9CA3AF" />
                <Text className="mt-4 text-gray-700 font-medium text-center">{selectedFileName}</Text>
                <TouchableOpacity className="mt-2" onPress={handleClear}>
                  <Text className="text-red-500 font-semibold text-sm">Remove File</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="w-full bg-gray-50 rounded-xl p-8 items-center justify-center mb-6 border border-dashed border-gray-300">
                <Feather name="upload-cloud" size={48} color="#9CA3AF" />
                <Text className="mt-4 text-gray-500 text-center text-sm">
                  Supported formats: JPG, PNG, PDF, DOCX
                </Text>
              </View>
            )}

            {!selectedImage && !selectedFileName && (
              <View className="flex-row w-full space-x-3 justify-center gap-3">
                <TouchableOpacity
                  className="flex-1 bg-white border border-gray-200 py-3 rounded-xl items-center flex-row justify-center shadow-sm"
                  onPress={handlePickPhoto}
                >
                  <Feather name="camera" size={18} color="#18553F" />
                  <Text className="ml-2 font-semibold text-gray-700">Camera</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 bg-white border border-gray-200 py-3 rounded-xl items-center flex-row justify-center shadow-sm"
                  onPress={handlePickDocument}
                >
                  <Feather name="file" size={18} color="#18553F" />
                  <Text className="ml-2 font-semibold text-gray-700">File</Text>
                </TouchableOpacity>
              </View>
            )}

            {(selectedImage || selectedFileName) && !diagnosis && (
              <TouchableOpacity
                className={`w-full py-4 rounded-xl items-center shadow-sm flex-row justify-center ${isAnalyzing ? 'bg-gray-400' : 'bg-[#1A744C]'}`}
                onPress={handleAnalyze}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <ActivityIndicator color="white" className="mr-2" />
                ) : (
                  <Feather name="upload" size={20} color="white" className="mr-2" />
                )}
                <Text className="text-white font-bold text-base">
                  {isAnalyzing ? 'Uploading...' : 'Upload'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Remedies Box */}
          {diagnosis && (
            <View className="bg-white rounded-2xl p-6 shadow-sm border border-[#1A744C]/20 mb-8">
              <View className="flex-row items-center mb-4 pb-4 border-b border-gray-100">
                <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center mr-3">
                  <Feather name="alert-triangle" size={20} color="#EF4444" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-gray-500 font-medium uppercase tracking-wider">Diagnosis</Text>
                  <Text className="text-lg font-bold text-gray-900 leading-tight">{diagnosis.title}</Text>
                </View>
              </View>

              <Text className="text-sm font-semibold text-[#18553F] mb-3">Recommended Remedies:</Text>

              {diagnosis.remedies.map((remedy, index) => (
                <View key={index} className="flex-row items-start mb-2">
                  <View className="w-5 h-5 rounded-full bg-[#E6F4FE] items-center justify-center mr-3 mt-0.5">
                    <Text className="text-[#1A744C] text-[10px] font-bold">{index + 1}</Text>
                  </View>
                  <Text className="flex-1 text-gray-700 text-[15px] leading-relaxed">
                    {remedy}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View className="h-6" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
