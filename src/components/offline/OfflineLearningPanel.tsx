import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Download, 
  Wifi, 
  WifiOff, 
  Trash2, 
  HardDrive,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useOfflineLearning } from "@/hooks/useOfflineLearning";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

export function OfflineLearningPanel() {
  const {
    offlineContent,
    isOnline,
    downloadQueue,
    isDownloading,
    removeOfflineProduct,
    clearOfflineContent,
    getOfflineStats,
    downloadRecommendedContent
  } = useOfflineLearning();
  
  const [showDetails, setShowDetails] = useState(false);
  const navigate = useNavigate();
  const stats = getOfflineStats();

  const handleDownloadRecommended = async () => {
    try {
      await downloadRecommendedContent();
      toast({
        title: "Download Complete",
        description: "Recommended content is now available offline!",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download content. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClearAll = () => {
    clearOfflineContent();
    toast({
      title: "Offline Content Cleared",
      description: "All offline content has been removed.",
    });
  };

  const formatSize = (sizeInKB: number): string => {
    if (sizeInKB < 1024) {
      return `${sizeInKB} KB`;
    }
    return `${(sizeInKB / 1024).toFixed(1)} MB`;
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      
      {/* Connection Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            {isOnline ? 'Online' : 'Offline Mode'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {isOnline 
                  ? 'Connected to internet. You can download content for offline use.'
                  : 'No internet connection. Access your downloaded content below.'
                }
              </p>
            </div>
            {isOnline && (
              <Button 
                onClick={handleDownloadRecommended}
                disabled={isDownloading}
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                {isDownloading ? 'Downloading...' : 'Download Recommended'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Download Progress */}
      {isDownloading && downloadQueue.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="animate-spin">
                <Download className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Downloading content...</p>
                <p className="text-xs text-muted-foreground">
                  {downloadQueue.length} items remaining
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Offline Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Offline Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{stats.totalDownloaded}</div>
              <p className="text-xs text-muted-foreground">Products</p>
            </div>
            <div>
              <div className="text-2xl font-bold">{formatSize(stats.totalSize)}</div>
              <p className="text-xs text-muted-foreground">Storage Used</p>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {stats.lastSync ? formatDate(stats.lastSync) : 'Never'}
              </div>
              <p className="text-xs text-muted-foreground">Last Sync</p>
            </div>
          </div>
          
          {stats.totalDownloaded > 0 && (
            <div className="mt-4 flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowDetails(!showDetails)}
                className="flex-1"
              >
                {showDetails ? 'Hide' : 'Show'} Details
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearAll}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Content List */}
      {showDetails && offlineContent.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Downloaded Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {offlineContent.map((content) => (
                <div 
                  key={content.productId}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                  onClick={() => navigate(`/product/${content.productId}`)}
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{content.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {content.categoryName}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatSize(content.size)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {formatDate(content.downloadedAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeOfflineProduct(content.productId);
                      }}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {offlineContent.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <Download className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No Offline Content</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Download products to access them when you're offline
            </p>
            {isOnline && (
              <Button onClick={handleDownloadRecommended} disabled={isDownloading}>
                <Download className="h-4 w-4 mr-2" />
                Get Started
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Offline Tips */}
      {!isOnline && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-900">You're Offline</h4>
                <p className="text-sm text-orange-700 mt-1">
                  You can still access downloaded products and continue learning. 
                  Your progress will sync when you're back online.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}