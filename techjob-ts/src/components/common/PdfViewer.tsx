"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, ExternalLink, X } from 'lucide-react';

interface PdfViewerProps {
  pdfFiles?: string[];
  
}

export function PdfViewer({ pdfFiles = [] }: PdfViewerProps) {
  const [selectedPdfUrl, setSelectedPdfUrl] = React.useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);

  const handleOpenPdf = (url: string) => {
    // เปิดในหน้าต่างใหม
    if (url.startsWith('data:application/pdf') || url.startsWith('data:application/octet-stream')) {
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>PDF Viewer</title>
              <style>
                body {
                  margin: 0;
                  padding: 0;
                  overflow: hidden;
                }
                iframe {
                  width: 100%;
                  height: 100vh;
                  border: none;
                }
              </style>
            </head>
            <body>
              <iframe src="${url}"></iframe>
            </body>
          </html>
        `);
      }
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDownloadPdf = (url: string, index: number) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `document-${index + 1}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreviewPdf = (url: string) => {
    setSelectedPdfUrl(url);
    setIsPreviewOpen(true);
  };

  if (!pdfFiles || pdfFiles.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600" />
            เอกสาร PDF ({pdfFiles.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {pdfFiles.map((pdfUrl, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-2 p-3 rounded-md border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="p-1.5 bg-red-100 rounded shrink-0">
                  <FileText className="h-4 w-4 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-xs truncate">
                    เอกสาร {index + 1}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {pdfUrl.startsWith('data:') ? 'document.pdf' : (pdfUrl.split('/').pop() || 'document.pdf')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
              
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={() => handleOpenPdf(pdfUrl)}
                  title="เปิดในแท็บใหม่"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={() => handleDownloadPdf(pdfUrl, index)}
                  title="ดาวน์โหลด"
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* PDF Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-4 py-3 border-b shrink-0">
            <DialogTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-red-600" />
              ตัวอย่าง PDF
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto bg-gray-50">
            {selectedPdfUrl && (
              <iframe
                src={selectedPdfUrl.startsWith('data:') ? selectedPdfUrl : `${selectedPdfUrl}#toolbar=0`}
                className="w-full h-full"
                title="PDF Preview"
              />
            )}
          </div>
          <DialogFooter className="px-4 py-3 border-t bg-gray-50 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenPdf(selectedPdfUrl || '')}
              className="gap-2"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              เปิดแบบเต็มหน้า
            </Button>
            <DialogClose asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <X className="h-3.5 w-3.5" />
                ปิด
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}


