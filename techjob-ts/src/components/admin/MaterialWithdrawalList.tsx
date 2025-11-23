// src/components/admin/MaterialWithdrawalList.tsx
import { useState, useMemo } from "react";
import { useJobs } from "@/contexts/JobContext";
import { getJobWithdrawalSummaries, getTimeAgo } from "@/utils/materialHelpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Package, Clock, User, FileText, ChevronDown } from "lucide-react";

export function MaterialWithdrawalList() {
  const { jobs } = useJobs();
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const jobSummaries = useMemo(() => {
    return getJobWithdrawalSummaries(jobs);
  }, [jobs]);

  const toggleItem = (jobId: string) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  if (jobSummaries.length === 0) {
    return (
      <Card className="rounded-2xl bg-card text-card-foreground shadow-sm transition-colors">
        <CardContent className="p-6 text-center text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-2 opacity-30" />
          <p className="text-sm">ยังไม่มีการเบิกวัสดุ</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl bg-card text-card-foreground shadow-sm transition-colors">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Package className="h-4 w-4" />
          รายการเบิกวัสดุตามใบงาน
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {jobSummaries.length} ใบงาน
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[450px] pr-3">
          <div className="space-y-2">
            {jobSummaries.map((summary) => {
              const isOpen = openItems.has(summary.jobId);

              return (
                <Collapsible
                  key={summary.jobId}
                  open={isOpen}
                  onOpenChange={() => toggleItem(summary.jobId)}
                >
                  <div className="border rounded-lg">
                    <CollapsibleTrigger className="w-full px-3 py-3 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-2 text-left">
                        <ChevronDown
                          className={`h-4 w-4 shrink-0 transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                        <Badge variant="outline" className="text-xs shrink-0">
                          {summary.jobId}
                        </Badge>
                        <span className="text-sm font-medium flex-1 line-clamp-1">
                          {summary.jobTitle}
                        </span>
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {summary.totalItems} รายการ
                        </Badge>
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="px-3 pb-3 pt-2 space-y-2 border-t">
                        {summary.withdrawals.map((item, index) => (
                          <div
                            key={`${item.materialId}-${index}`}
                            className="p-3 bg-muted/30 rounded-md space-y-1.5"
                          >
                            {/* Material Name & Quantity */}
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-medium text-sm flex-1">
                                {item.materialName}
                              </p>
                              <Badge
                                variant="secondary"
                                className="text-xs shrink-0"
                              >
                                {item.quantity} {item.unit}
                              </Badge>
                            </div>

                            {/* Details */}
                            <div className="space-y-1 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1.5">
                                <FileText className="h-3 w-3 shrink-0" />
                                <span className="line-clamp-1">
                                  งาน: {item.taskTitle}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <User className="h-3 w-3 shrink-0" />
                                <span>โดย: {item.withdrawnBy}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-3 w-3 shrink-0" />
                                <span>{getTimeAgo(item.withdrawnAt)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
