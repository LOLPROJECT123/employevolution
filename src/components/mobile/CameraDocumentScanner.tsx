
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Camera, Upload, RotateCcw, Check, X } from 'lucide-react';

interface CameraDocumentScannerProps {
  onDocumentScanned: (file: File, text?: string) => void;
  onClose: () => void;
}

export const CameraDocumentScanner: React.FC<CameraDocumentScannerProps> = ({
  onDocumentScanned,
  onClose
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageDataUrl);
    stopCamera();
    processImage(imageDataUrl);
  };

  const processImage = async (imageDataUrl: string) => {
    setIsProcessing(true);
    
    try {
      // Convert data URL to blob
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'scanned-document.jpg', { type: 'image/jpeg' });

      // Mock OCR processing - in real app would use OCR service
      await mockOCRProcessing(imageDataUrl);
      
      // Call parent callback
      onDocumentScanned(file, extractedText);
      
      toast({
        title: "Document Scanned",
        description: "Text extracted successfully from the document"
      });
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Processing Error",
        description: "Failed to extract text from the document",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const mockOCRProcessing = async (imageDataUrl: string): Promise<void> => {
    // Simulate OCR processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock extracted text
    const mockText = `John Doe
Software Engineer
Experience: 5 years in web development
Skills: JavaScript, React, Node.js, Python
Education: Computer Science, University of Technology
Email: john.doe@email.com
Phone: (555) 123-4567`;
    
    setExtractedText(mockText);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setExtractedText('');
    startCamera();
  };

  const confirmScan = () => {
    if (capturedImage) {
      processImage(capturedImage);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 bg-black text-white">
        <h2 className="text-lg font-semibold">Document Scanner</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 relative">
        {isScanning && (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            
            {/* Overlay guide */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="border-2 border-white border-dashed w-80 h-60 rounded-lg">
                <div className="absolute -top-8 left-0 right-0 text-center">
                  <p className="text-white text-sm">Position document within the frame</p>
                </div>
              </div>
            </div>

            {/* Capture button */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
              <Button
                size="lg"
                onClick={captureImage}
                className="rounded-full w-16 h-16 bg-white text-black hover:bg-gray-200"
              >
                <Camera className="h-6 w-6" />
              </Button>
            </div>
          </>
        )}

        {capturedImage && !isProcessing && (
          <>
            <img
              src={capturedImage}
              alt="Captured document"
              className="w-full h-full object-contain"
            />
            
            <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-4">
              <Button
                variant="outline"
                onClick={retakePhoto}
                className="bg-white text-black"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake
              </Button>
              <Button
                onClick={confirmScan}
                className="bg-green-600 text-white"
              >
                <Check className="h-4 w-4 mr-2" />
                Use Photo
              </Button>
            </div>
          </>
        )}

        {isProcessing && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Processing document...</p>
                <p className="text-sm text-muted-foreground">Extracting text using OCR</p>
              </CardContent>
            </Card>
          </div>
        )}

        {!isScanning && !capturedImage && (
          <div className="flex-1 flex items-center justify-center">
            <Card>
              <CardContent className="p-8 text-center">
                <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Scan Document</h3>
                <p className="text-muted-foreground mb-6">
                  Capture resumes, certificates, or other documents
                </p>
                <Button onClick={startCamera} size="lg">
                  Start Camera
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraDocumentScanner;
