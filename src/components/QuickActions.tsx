import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Search, Wrench, ArrowRight, Clock, TrendingUp, Bookmark } from "lucide-react";

interface QuickAction {
  title: string;
  description: string;
  action: string;
  route: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  priority: number;
}

const quickActions: QuickAction[] = [
  // All quick actions removed per user request
];

export function QuickActions() {
  // Return null since all quick actions have been removed
  return null;
}